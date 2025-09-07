"use client";

import { useState } from 'react';
import { useContest } from '@/context/ContestContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, Settings, Upload, FileText, Clock, AlertCircle, Link, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function SubmissionControl() {
  const { submissionControl, updateSubmissionControl } = useContest();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    isEnabled: submissionControl?.isEnabled ?? true,
    maxFileSize: submissionControl?.maxFileSize ?? 10485760, // 10MB
    allowedFormats: submissionControl?.allowedFormats ?? ["pdf", "jpg", "jpeg", "png"],
    submissionDeadline: submissionControl?.submissionDeadline ?? "",
    thankYouMessage: submissionControl?.thankYouMessage ?? "Thank you for submitting your work! We have received your submission and it is now under review.",
    resultAnnouncementMessage: submissionControl?.resultAnnouncementMessage ?? "Results will be announced soon. Stay tuned for updates!",
    collectionMode: submissionControl?.collectionMode ?? 'google_form',
    googleFormLink: submissionControl?.googleFormLink ?? ""
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('Saving submission control data:', formData);
      const result = await updateSubmissionControl(formData);
      console.log('Update result:', result);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Submission settings updated successfully.',
        });
      } else {
        console.error('Update failed:', result.message);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Exception in handleSave:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `An error occurred while updating submission settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Submission Control
          </CardTitle>
          <CardDescription>
            Control file upload settings and submission messages for participants.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Master Submission Switch</h3>
            <p className="text-sm text-muted-foreground">
              Global control for all submissions. When disabled, no participants can submit regardless of their individual settings.
            </p>
          </div>
            <Switch
              checked={formData.isEnabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEnabled: checked }))}
            />
          </div>

          {!formData.isEnabled && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Master submission switch is disabled. No participants will be able to upload files, regardless of their individual upload_enabled settings.
              </AlertDescription>
            </Alert>
          )}

          {formData.isEnabled && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Master submission switch is enabled. Individual participants can submit only if their upload_enabled field is set to true in the participants table.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Collection Mode</label>
              <Select
                value={formData.collectionMode}
                onValueChange={(value: 'google_form' | 'drive_links') => 
                  setFormData(prev => ({ ...prev, collectionMode: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select collection mode" />
                </SelectTrigger>
                <SelectContent>
                  
                  <SelectItem value="google_form">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Google Form
                    </div>
                  </SelectItem>
                  <SelectItem value="drive_links">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Drive Links
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Choose how participants will submit their work
              </p>
            </div>

            {formData.collectionMode === 'google_form' && (
              <div>
                <label className="text-sm font-medium">Google Form Link</label>
                <Input
                  value={formData.googleFormLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, googleFormLink: e.target.value }))}
                  placeholder="https://forms.google.com/..."
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the Google Form URL where participants will submit their work
                </p>
              </div>
            )}

            {formData.collectionMode === 'drive_links' && (
              <Alert className="border-blue-200 bg-blue-50">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Drive Links mode is selected. Participants will be directed to upload their work using drive links.
                </AlertDescription>
              </Alert>
            )}
          </div>


          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Submission Deadline (Optional)</label>
              <Input
                value={formData.submissionDeadline}
                onChange={(e) => setFormData(prev => ({ ...prev, submissionDeadline: e.target.value }))}
                type="datetime-local"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty for no deadline
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Thank You Message</label>
              <Textarea
                value={formData.thankYouMessage}
                onChange={(e) => setFormData(prev => ({ ...prev, thankYouMessage: e.target.value }))}
                placeholder="Thank you for submitting your work! We have received your submission and it is now under review."
                className="mt-1 min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Message shown to participants after successful submission
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Result Announcement Message</label>
              <Textarea
                value={formData.resultAnnouncementMessage}
                onChange={(e) => setFormData(prev => ({ ...prev, resultAnnouncementMessage: e.target.value }))}
                placeholder="Results will be announced soon. Stay tuned for updates!"
                className="mt-1 min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Message shown to participants about result announcements
              </p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={isLoading} className="w-full">
            {isLoading && <Save className="mr-2 h-4 w-4 animate-spin" />}
            Save Submission Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
