"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useContest } from '@/context/ContestContext';
import { getCurrentUser } from '@/lib/auth';
import { DriveLinkSubmissionForm } from '@/components/upload/drive-link-submission-form';

export default function SubmitPortalPage() {
  const router = useRouter();
  const { submissionControl, participants, findSubmissionByParticipantId } = useContest();
  const [participant, setParticipant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ipAddress, setIpAddress] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authData = await getCurrentUser();
        
        const storedId = localStorage.getItem('participant_session');
        
        if (authData?.participant) {
          setParticipant(authData.participant);
        } else {
          if (storedId && participants.find(p => p.id === storedId)) {
            const foundParticipant = participants.find(p => p.id === storedId);
            setParticipant(foundParticipant);
          } else {
            router.replace('/login');
            return;
          }
        }

        // Check if participant can submit
        const canSubmit = (authData?.participant?.upload_enabled || participants.find(p => p.id === storedId)?.upload_enabled) && 
                         (submissionControl?.isEnabled !== false);

        if (!canSubmit) {
          router.replace('/participant-dashboard');
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, participants, submissionControl]);

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

  // Disable F12 / Inspect
  const disableInspect = (e: React.KeyboardEvent) => {
    if (e.keyCode === 123 || // F12
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I/J
        (e.ctrlKey && e.keyCode === 85)) { // Ctrl+U
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading submission portal...</p>
        </div>
      </div>
    );
  }

  if (!participant) {
    return null;
  }

  // Check if collection mode is Google Form
  if (submissionControl?.collectionMode === 'google_form' && submissionControl?.googleFormLink) {
    // No need to convert URL for redirect

    return (
      <div 
        className="min-h-screen"
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.keyCode === 123 || // F12
              (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I/J
              (e.ctrlKey && e.keyCode === 85)) { // Ctrl+U
            e.preventDefault();
          }
        }}
        style={{
          fontFamily: 'Verdana, Tahoma, sans-serif',
          background: 'linear-gradient(to bottom, rgba(255, 153, 51, 0.08), rgba(255, 255, 255, 0.9), rgba(19, 136, 8, 0.08))',
          backgroundAttachment: 'fixed',
          color: '#222',
          lineHeight: 1.5
        }}
      >
        {/* Header */}
        <header 
          className="flex items-center justify-center gap-3 py-4 text-white text-xl font-bold shadow-lg relative overflow-hidden px-4"
          style={{
            background: 'linear-gradient(90deg, #0066cc, #009688)',
            animation: 'slideDown 1s ease-in-out'
          }}
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Emblem_of_India.svg/120px-Emblem_of_India.svg.png" 
            alt="Govt Emblem" 
            className="h-12"
          />
          Contest Work Submission Portal
          <div 
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{
              background: 'linear-gradient(120deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
              transform: 'skewX(-20deg)',
              animation: 'shine 6s infinite'
            }}
          />
        </header>

        {/* IP Notice */}
        <div 
          className="text-center py-2 text-sm font-medium border-b-2"
          style={{
            background: 'rgba(240, 248, 255, 0.95)',
            borderBottomColor: '#009688',
            animation: 'fadeIn 2s ease-in'
          }}
        >
          📍 Your IP Address <strong style={{ color: '#d32f2f' }}>{ipAddress}</strong> is recorded for auditing and monitoring purposes.
        </div>

        {/* Main Layout */}
        <div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-6xl mx-auto p-5"
          style={{ marginTop: '30px' }}
        >
          {/* Guidelines Sidebar */}
          <div 
            className="bg-white p-5 rounded-xl shadow-lg sticky top-5 h-fit"
            style={{
              borderLeft: '6px solid #ff9933',
              animation: 'fadeInLeft 1.2s ease-in-out'
            }}
          >
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#0a3d62' }}>
              Submission Guidelines
            </h2>
            <ul className="ml-5 space-y-2 text-sm">
              <li className="transition-transform hover:translate-x-1 hover:text-green-700">
                Upload only valid and clearly scanned documents.
              </li>
              <li className="transition-transform hover:translate-x-1 hover:text-green-700">
                Accepted formats: PDF, JPEG, PNG (Max 10MB per file).
              </li>
              <li className="transition-transform hover:translate-x-1 hover:text-green-700">
                Do not upload password-protected or corrupted files.
              </li>
              <li className="transition-transform hover:translate-x-1 hover:text-green-700">
                Your name and application ID must be clearly visible.
              </li>
              <li className="transition-transform hover:translate-x-1 hover:text-green-700">
                If multiple documents, merge into one PDF before uploading.
              </li>
              <li className="transition-transform hover:translate-x-1 hover:text-green-700">
                Ensure stable internet connection while submitting.
              </li>
            </ul>
          </div>

          {/* Form Section */}
          <div 
            className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg"
            style={{
              animation: 'fadeInUp 1.5s ease-in-out'
            }}
          >
            <h2 className="text-center text-xl font-semibold mb-4" style={{ color: '#0a3d62' }}>
              Official Upload Form
            </h2>
            
            {/* Google Form Redirect Section */}
            <div className="text-center space-y-6">
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Access Official Submission Form
                </h3>
                <p className="text-blue-700 mb-4">
                  Click the button below to open the official Google Form in a new tab. Complete your submission and return to this portal.
                </p>
                <a
                  href={submissionControl.googleFormLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open Submission Form
                </a>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  This will open the form in a new tab
                </p>
                <p className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Complete your submission and return here
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer 
          className="text-center mt-10 py-4 text-sm text-gray-600 border-t-4"
          style={{
            background: 'rgba(233, 236, 239, 0.9)',
            borderTopColor: '#138808',
            animation: 'fadeIn 3s ease-in'
          }}
        >
          © 2025 Devloped by Nextlinker | Managed by Tourism Department,Nellore All © rights reserved <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a> | <a href="#" className="text-blue-600 hover:underline font-medium">Help Desk</a>
        </footer>

        {/* CSS Animations */}
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInLeft {
            from { opacity: 0; transform: translateX(-40px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes shine {
            0% { left: -75%; }
            50% { left: 125%; }
            100% { left: 125%; }
          }
          
          /* Disable text selection and context menu */
          body {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
          
          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={disableInspect}
      style={{
        fontFamily: 'Verdana, Tahoma, sans-serif',
        background: 'linear-gradient(to bottom, rgba(255, 153, 51, 0.08), rgba(255, 255, 255, 0.9), rgba(19, 136, 8, 0.08))',
        backgroundAttachment: 'fixed',
        color: '#222',
        lineHeight: 1.5
      }}
    >
      {/* Header */}
      <header 
        className="flex items-center justify-between py-4 text-white text-xl font-bold shadow-lg relative overflow-hidden px-4"
        style={{
          background: 'linear-gradient(90deg, #0066cc, #009688)',
          animation: 'slideDown 1s ease-in-out'
        }}
      >
        <button
          onClick={() => router.push('/participant-dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
        >
          ← Back to Dashboard
        </button>
        
        <div className="flex items-center gap-3">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Emblem_of_Andhra_Pradesh.png/1200px-Emblem_of_Andhra_Pradesh.png" 
            alt="" 
            className="h-12"
          />
          Contest Work Submission Portal
        </div>
        
        <div className="w-32"></div> {/* Spacer for centering */}
        
        <div 
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{
            background: 'linear-gradient(120deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
            transform: 'skewX(-20deg)',
            animation: 'shine 6s infinite'
          }}
        />
      </header>

      {/* IP Notice */}
      <div 
        className="text-center py-2 text-sm font-medium border-b-2"
        style={{
          background: 'rgba(240, 248, 255, 0.95)',
          borderBottomColor: '#009688',
          animation: 'fadeIn 2s ease-in'
        }}
      >
        📍 IP Address <strong style={{ color: '#d32f2f' }}>{ipAddress}</strong> is recorded for auditing and monitoring purposes.
      </div>

    
        

      {/* Main Layout */}
      <div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-6xl mx-auto p-5"
        style={{ marginTop: '30px' }}
      >
        {/* Guidelines Sidebar */}
        <div 
          className="bg-white p-5 rounded-xl shadow-lg sticky top-5 h-fit"
          style={{
            borderLeft: '6px solid #ff9933',
            animation: 'fadeInLeft 1.2s ease-in-out'
          }}
        >
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#0a3d62' }}>
              Submission Guidelines
            </h2>
            <ul className="ml-5 space-y-2 text-sm">
              <li className="transition-transform hover:translate-x-1 hover:text-green-700">
                Provide one drive link for your submission.
              </li>
              <li className="transition-transform hover:translate-x-1 hover:text-green-700">
                Ensure the drive link is publicly accessible (Anyone with the link can view).
              </li>
              <li className="transition-transform hover:translate-x-1 hover:text-green-700">
                Broken Link will not be accepted and will be rejected.
              </li>
              <li className="transition-transform hover:translate-x-1 hover:text-green-700">
                The file name must be in the format of [Your Name as per registered - Phone Number] must be clearly visible in the documents.
              </li>
              <li className="transition-transform hover:translate-x-1 hover:text-green-700">
                Test the link before submitting to ensure it works properly.
              </li>
              <li className="transition-transform hover:translate-x-1 hover:text-green-700">
                Provide a brief description of your submission content.
              </li>
            </ul>
        </div>

        {/* Form Section */}
        <div 
          className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg"
          style={{
            animation: 'fadeInUp 1.5s ease-in-out'
          }}
        >
          <h2 className="text-center text-xl font-semibold mb-4" style={{ color: '#0a3d62' }}>
            Drive Link Submission Form
          </h2>
          
          {/* Drive Link Submission Form */}
          <DriveLinkSubmissionForm 
            participantId={participant.id} 
            onSubmissionComplete={() => {
              // Redirect back to dashboard after successful submission
              router.push('/participant-dashboard');
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <footer 
        className="text-center mt-10 py-4 text-sm text-gray-600 border-t-4"
        style={{
          background: 'rgba(233, 236, 239, 0.9)',
          borderTopColor: '#138808',
          animation: 'fadeIn 3s ease-in'
        }}
      >
        Devloped by Nextlinker | Managed by Tourism Department,Nellore All © rights reserved | <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a> | <a href="#" className="text-blue-600 hover:underline font-medium">Help Desk</a>
      </footer>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shine {
          0% { left: -75%; }
          50% { left: 125%; }
          100% { left: 125%; }
        }
        
        /* Disable text selection and context menu */
        body {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}
