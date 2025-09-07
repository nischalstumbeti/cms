"use client";

import { useState, useEffect } from 'react';
import { useContest } from '@/context/ContestContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Upload, FileText, Clock, Trophy } from 'lucide-react';

interface FileUploadPortalProps {
  participantId: string;
  onSubmissionComplete: () => void;
}

export function FileUploadPortal({ participantId, onSubmissionComplete }: FileUploadPortalProps) {
  const { submissions, addSubmission, submissionControl } = useContest();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [ipAddress, setIpAddress] = useState<string>('');

  // Check if participant has already submitted
  useEffect(() => {
    const existingSubmission = submissions.find(sub => sub.participantId === participantId);
    if (existingSubmission) {
      setHasSubmitted(true);
    }
  }, [submissions, participantId]);

  // Fetch IP address
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => {
        setIpAddress(data.ip);
      })
      .catch(() => {
        setIpAddress('Unable to fetch IP address');
      });
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (submissionControl?.maxFileSize && file.size > submissionControl.maxFileSize) {
      alert(`File size too large. Maximum allowed size is ${Math.round(submissionControl.maxFileSize / 1024 / 1024)}MB`);
      return;
    }

    // Validate file format
    if (submissionControl?.allowedFormats && submissionControl.allowedFormats.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !submissionControl.allowedFormats.includes(fileExtension)) {
        alert(`Invalid file format. Allowed formats: ${submissionControl.allowedFormats.join(', ')}`);
        return;
      }
    }

    setIsUploading(true);
    
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileDataUri = e.target?.result as string;
        
        // Add submission to database
        const result = await addSubmission({
          participantId,
          fileDataUri,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type
        });

        if (result.success) {
          setHasSubmitted(true);
          onSubmissionComplete();
        } else {
          alert('Failed to upload file. Please try again.');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (hasSubmitted) {
    return (
      <div className="space-y-6">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Submission Complete!</AlertTitle>
          <AlertDescription className="text-green-700">
            {submissionControl?.thankYouMessage || "Thank you for submitting your work! We have received your submission and it is now under review."}
          </AlertDescription>
        </Alert>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Trophy className="h-5 w-5" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-blue-700">
                Your submission has been successfully uploaded and is now being reviewed by our panel of judges.
              </p>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Clock className="h-4 w-4" />
                <span>{submissionControl?.resultAnnouncementMessage || "Results will be announced soon. Stay tuned for updates!"}</span>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Important Notes:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• You cannot re-upload or modify your submission</li>
                <li>• All submissions are final and will be judged as submitted</li>
                <li>• We will contact you directly if we need any clarification</li>
                <li>• Results will be published on our official website</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Emblem_of_India.svg/120px-Emblem_of_India.svg.png" 
            alt="Govt Emblem" 
            className="h-12"
          />
          <h1 className="text-2xl font-bold">Official Document Upload Portal</h1>
        </div>
      </div>

      {/* IP Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-center">
          <span className="text-blue-800">
            📍 Your IP Address <strong className="text-red-600">{ipAddress}</strong> is recorded for auditing and monitoring purposes.
          </span>
        </div>
      </div>

      

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Guidelines Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Submission Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Upload only valid and clearly scanned documents.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Accepted formats: PDF, JPEG, PNG (Max 10MB per file).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Do not upload password-protected or corrupted files.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Your name and application ID must be clearly visible.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>If multiple documents, merge into one PDF before uploading.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Ensure stable internet connection while submitting.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Upload Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-blue-800">Official Upload Form</CardTitle>
              <CardDescription className="text-center">
                Select your file and click upload to submit your work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">Choose your file to upload</p>
                  <p className="text-sm text-gray-500">
                    {submissionControl?.allowedFormats?.join(', ').toUpperCase() || 'PDF, JPEG, PNG'} up to {submissionControl?.maxFileSize ? Math.round(submissionControl.maxFileSize / 1024 / 1024) : 10}MB
                  </p>
                </div>
                <input
                  type="file"
                  accept={submissionControl?.allowedFormats?.map(f => `.${f}`).join(',') || '.pdf,.jpg,.jpeg,.png'}
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
                {isUploading && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Uploading...</span>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Important Reminder</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Once you upload and submit your file, you cannot make changes or re-upload. 
                      Please ensure your file is correct and complete before submitting.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-600 bg-gray-100 p-4 rounded-lg">
        © 2025 National e-Governance Services | Privacy Policy | Help Desk
      </div>
    </div>
  );
}
