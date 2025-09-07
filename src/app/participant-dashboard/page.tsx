"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useContest } from '@/context/ContestContext';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ParticipantContentDisplay } from '@/components/cms/content-display';
import { FileUploadPortal } from '@/components/upload/file-upload-portal';
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  Bell, 
  BookOpen, 
  ExternalLink,
  Calendar,
  User,
  LogOut,
  Loader2,
  AlertCircle,
  CheckCircle,
  Edit,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

type Announcement = {
  id: string;
  title: string;
  content: string;
  hyperlink?: string | null;
  document_url?: string | null;
  document_name?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function ParticipantDashboard() {
  const router = useRouter();
  const { participants, activePrompt, announcement, submissions, findSubmissionByParticipantId, submissionControl } = useContest();
  const [participant, setParticipant] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'guidelines' | 'announcements' | 'submit' | 'profile'>('overview');
  const [submissionEnabled, setSubmissionEnabled] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authData = await getCurrentUser();
        
        if (authData?.participant) {
          setParticipant(authData.participant);
          // Primary check: participant upload_enabled from database
          // Secondary check: global submission control (if disabled, overrides participant setting)
          const isSubmissionEnabled = (authData.participant.upload_enabled || false) && (submissionControl?.isEnabled !== false);
          setSubmissionEnabled(isSubmissionEnabled);
        } else {
          const storedId = localStorage.getItem('participant_session');
          if (storedId && participants.find(p => p.id === storedId)) {
            const foundParticipant = participants.find(p => p.id === storedId);
            setParticipant(foundParticipant);
            // Primary check: participant upload_enabled from database
            // Secondary check: global submission control (if disabled, overrides participant setting)
            const isSubmissionEnabled = (foundParticipant?.upload_enabled || false) && (submissionControl?.isEnabled !== false);
            setSubmissionEnabled(isSubmissionEnabled);
          } else {
            router.replace('/login');
            return;
          }
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

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements?active_only=true');
        const data = await response.json();
        if (response.ok) {
          setAnnouncements(data.announcements);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchAnnouncements();
  }, []);

  // Update submission status when submissionControl changes
  useEffect(() => {
    if (participant) {
      // Primary check: participant upload_enabled from database
      // Secondary check: global submission control (if disabled, overrides participant setting)
      const isSubmissionEnabled = (participant.upload_enabled || false) && (submissionControl?.isEnabled !== false);
      setSubmissionEnabled(isSubmissionEnabled);
    }
  }, [participant, submissionControl]);

  const handleLogout = () => {
    localStorage.removeItem('participant_session');
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!participant) {
    return null;
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Welcome, {participant.name}!</h2>
          <p className="text-muted-foreground">Contest Dashboard</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Contest Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Contest Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Submission Status:</span>
              <Badge variant={submissionEnabled ? "default" : "secondary"}>
                {submissionEnabled ? "Open" : "Closed"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Contest Prompt:</span>
              <Badge variant={activePrompt ? "default" : "secondary"}>
                {activePrompt ? "Available" : "Not Available"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('guidelines')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Guidelines
            </CardTitle>
            <CardDescription>View contest rules and instructions</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('announcements')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Announcements
            </CardTitle>
            <CardDescription>Latest updates and news</CardDescription>
          </CardHeader>
        </Card>

        <Card className={`cursor-pointer hover:shadow-md transition-shadow ${!submissionEnabled ? 'opacity-50' : ''}`} 
              onClick={() => submissionEnabled && router.push('/submit-portal')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Submit Work
            </CardTitle>
            <CardDescription>
              {submissionEnabled ? "Upload your contest entry" : "Submissions are currently closed"}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('announcements')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notice Board
            </CardTitle>
            <CardDescription>Important contest information</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('profile')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Profile
            </CardTitle>
            <CardDescription>View your details and contest registration</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );

  const renderGuidelines = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Contest Guidelines</h2>
        <Button variant="outline" onClick={() => setActiveTab('overview')}>
          Back to Dashboard
        </Button>
      </div>

      {/* CMS Content Display */}
      <ParticipantContentDisplay />

      <Card>
        <CardHeader>
          <CardTitle>Submission Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. File Requirements</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Upload your work via Google Drive link</li>
              <li>Ensure the link is publicly accessible</li>
              <li>File formats: JPG, PNG, MP4, MOV (as applicable)</li>
              <li>Maximum file size: 50MB per file</li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-semibold">2. Content Guidelines</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Content must be original and created by you</li>
              <li>Must relate to the contest theme</li>
              <li>No inappropriate or offensive content</li>
              <li>Respect copyright and intellectual property</li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-semibold">3. Submission Process</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Upload your work to Google Drive</li>
              <li>Set sharing permissions to "Anyone with the link can view"</li>
              <li>Copy the shareable link</li>
              <li>Paste the link in the submission form</li>
              <li>Add a brief description of your work</li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-semibold">4. Important Dates</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Contest Start: {announcement?.title || "TBA"}</li>
              <li>Submission Deadline: To be announced</li>
              <li>Results Announcement: To be announced</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Announcements & Notice Board</h2>
        <Button variant="outline" onClick={() => setActiveTab('overview')}>
          Back to Dashboard
        </Button>
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No announcements yet</h3>
            <p className="text-muted-foreground text-center">
              Check back later for important updates and contest information.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(announcement.created_at)}
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{announcement.content}</p>
                <div className="flex flex-wrap gap-2">
                  {announcement.hyperlink && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={announcement.hyperlink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Link
                      </a>
                    </Button>
                  )}
                  {announcement.document_name && announcement.document_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={announcement.document_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        {announcement.document_name}
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderSubmit = () => {
    const handleSubmissionComplete = () => {
      // Refresh the page to update submission status
      window.location.reload();
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Submit Your Work</h2>
          <Button variant="outline" onClick={() => setActiveTab('overview')}>
            Back to Dashboard
          </Button>
        </div>

        {!submissionEnabled ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Submissions Closed</AlertTitle>
            <AlertDescription>
              Submissions are currently not open. Please check back later or contact the administrator for more information.
            </AlertDescription>
          </Alert>
        ) : !activePrompt ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Active Contest</AlertTitle>
            <AlertDescription>
              There is no active contest prompt available at the moment. Please check back later.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* Active Prompt Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contest Prompt
                </CardTitle>
                <CardDescription>Current contest theme and requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
                  <h3 className="font-semibold"></h3>
                  <p className="text-lg font-medium text-primary">"{activePrompt.prompt}"</p>
                </div>
              </CardContent>
            </Card>

            {/* File Upload Portal */}
            <FileUploadPortal 
              participantId={participant.id} 
              onSubmissionComplete={handleSubmissionComplete}
            />
          </div>
        )}
      </div>
    );
  };

  const renderProfile = () => {
    const userSubmission = findSubmissionByParticipantId(participant.id);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Profile</h2>
          <Button variant="outline" onClick={() => setActiveTab('overview')}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {participant.profilePhotoUrl ? (
                    <img 
                      src={participant.profilePhotoUrl} 
                      alt={participant.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{participant.name}</h3>
                  <p className="text-muted-foreground">Contest Participant</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{participant.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Profession</p>
                    <p className="text-sm text-muted-foreground">
                      {participant.profession}
                      {participant.otherProfession && (
                        <span className="block text-xs">({participant.otherProfession})</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Gender</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {participant.gender.replace(/-/g, ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Registration Date</p>
                    <p className="text-sm text-muted-foreground">
                      {participant.created_at ? formatDate(participant.created_at) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contest Registration & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Contest Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Registration Status</span>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Registered
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Login Access</span>
                  <Badge variant={participant.login_enabled ? "default" : "secondary"}>
                    {participant.login_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Upload Access</span>
                  <Badge variant={participant.upload_enabled ? "default" : "secondary"}>
                    {participant.upload_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Contest Type</span>
                  <Badge variant="outline">
                    {participant.contestType || 'Photography'}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Contest Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Contest Title</span>
                    <span className="text-sm text-muted-foreground">
                      {announcement?.title || 'World Tourism Day 2025'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Theme</span>
                    <span className="text-sm text-muted-foreground">
                      {announcement?.theme || 'Tourism & Green Investments'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Remarks</span>
                    <Badge variant={activePrompt ? "default" : "secondary"}>
                      {activePrompt ? "Available" : "Not Available"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submission Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Submission Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userSubmission ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Submission Status</span>
                  <Badge 
                    variant={
                      userSubmission.submissionStatus === 'approved' ? 'default' :
                      userSubmission.submissionStatus === 'rejected' ? 'destructive' :
                      userSubmission.submissionStatus === 'cancelled' ? 'secondary' :
                      'outline'
                    }
                    className={
                      userSubmission.submissionStatus === 'approved' ? 'bg-green-500' :
                      userSubmission.submissionStatus === 'rejected' ? 'bg-red-500' :
                      userSubmission.submissionStatus === 'cancelled' ? 'bg-gray-500' :
                      'bg-yellow-500'
                    }
                  >
                    {userSubmission.submissionStatus === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {userSubmission.submissionStatus === 'rejected' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {userSubmission.submissionStatus === 'cancelled' && <AlertCircle className="h-3 w-3 mr-1" />}
                    {userSubmission.submissionStatus === 'pending' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                    {userSubmission.submissionStatus?.charAt(0).toUpperCase() + userSubmission.submissionStatus?.slice(1)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Submission Type</span>
                    <span className="text-sm text-muted-foreground capitalize">{userSubmission.submissionType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Submission Date</span>
                    <span className="text-sm text-muted-foreground">
                      {userSubmission.createdAt ? new Date(userSubmission.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {userSubmission.link && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Submission Link</span>
                      <a 
                        href={userSubmission.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        View Submission
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {userSubmission.adminNotes && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Admin Notes</span>
                      <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                        {userSubmission.adminNotes}
                      </div>
                    </div>
                  )}
                  {userSubmission.internalRemarks && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Internal Remarks</span>
                      <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                        {userSubmission.internalRemarks}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No submission yet</p>
                <p className="text-sm text-muted-foreground">
                  {submissionEnabled 
                    ? "You can submit your work from the Submit Work tab"
                    : "Submissions are currently closed"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Logo />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Welcome, <span className="font-medium">{participant.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            <nav className="space-y-1">
              <Button
                variant={activeTab === 'overview' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('overview')}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Overview
              </Button>
              <Button
                variant={activeTab === 'guidelines' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('guidelines')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Guidelines
              </Button>
              <Button
                variant={activeTab === 'announcements' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('announcements')}
              >
                <Bell className="mr-2 h-4 w-4" />
                Announcements
              </Button>
              <Button
                variant={activeTab === 'submit' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => submissionEnabled && router.push('/submit-portal')}
                disabled={!submissionEnabled}
              >
                <Upload className="mr-2 h-4 w-4" />
                Submit Work
              </Button>
              <Button
                variant={activeTab === 'profile' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('profile')}
              >
                <User className="mr-2 h-4 w-4" />
                My Profile
              </Button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'guidelines' && renderGuidelines()}
            {activeTab === 'announcements' && renderAnnouncements()}
            {activeTab === 'submit' && renderSubmit()}
            {activeTab === 'profile' && renderProfile()}
          </div>
        </div>
      </div>
    </div>
  );
}
