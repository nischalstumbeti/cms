
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useContest } from "@/context/ContestContext";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ParticipantDetailModal } from "./participant-detail-modal";
import { Button } from "@/components/ui/button";
import { Users, Upload, LogIn, LogOut, X, FileSpreadsheet } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";

export function ParticipantTable() {
  const { participants, updateParticipantLoginStatus, updateParticipantUploadStatus, bulkUpdateParticipantLoginStatus, bulkUpdateParticipantUploadStatus } = useContest();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleLoginToggle = async (participantId: string, enabled: boolean) => {
    const result = await updateParticipantLoginStatus(participantId, enabled);
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive"
    });
  };

  const handleUploadToggle = async (participantId: string, enabled: boolean) => {
    const result = await updateParticipantUploadStatus(participantId, enabled);
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive"
    });
  };

  const handleBulkLoginToggle = async (enabled: boolean) => {
    const result = await bulkUpdateParticipantLoginStatus(enabled);
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive"
    });
  };

  const handleBulkUploadToggle = async (enabled: boolean) => {
    const result = await bulkUpdateParticipantUploadStatus(enabled);
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive"
    });
  };

  const handleExportParticipants = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/export-users');
      
      if (!response.ok) {
        throw new Error('Failed to export participants');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `participants-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Participants data exported successfully!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error exporting participants:', error);
      toast({
        title: "Error",
        description: "Failed to export participants. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Participants ({participants.length})</CardTitle>
            <CardDescription>A comprehensive list of all registered participants in the contest.</CardDescription>
          </div>
          <div className="flex gap-2">
            {/* Export Button */}
            <Button 
              onClick={handleExportParticipants} 
              disabled={isExporting || participants.length === 0}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4" />
                  Export Participants
                </>
              )}
            </Button>

            {/* Bulk Login Actions */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Enable All Login
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Enable Login for All Participants</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will enable login access for all {participants.length} participants. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleBulkLoginToggle(true)}>
                    Enable All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Disable All Login
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disable Login for All Participants</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will disable login access for all {participants.length} participants. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleBulkLoginToggle(false)}>
                    Disable All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Upload Actions */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Enable All Upload
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Enable Upload for All Participants</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will enable file upload access for all {participants.length} participants. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleBulkUploadToggle(true)}>
                    Enable All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Disable All Upload
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disable Upload for All Participants</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will disable file upload access for all {participants.length} participants. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleBulkUploadToggle(false)}>
                    Disable All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {participants.length > 0 ? (
          <>
            {/* Status Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">
                  {participants.filter(p => p.login_enabled !== false).length}
                </div>
                <div className="text-sm text-blue-600">Login Enabled</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-red-600">
                  {participants.filter(p => p.login_enabled === false).length}
                </div>
                <div className="text-sm text-red-600">Login Disabled</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-green-600">
                  {participants.filter(p => p.upload_enabled === true).length}
                </div>
                <div className="text-sm text-green-600">Upload Enabled</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border">
                <div className="text-2xl font-bold text-orange-600">
                  {participants.filter(p => p.upload_enabled !== true).length}
                </div>
                <div className="text-sm text-orange-600">Upload Disabled</div>
              </div>
            </div>
            
            <ScrollArea className="h-[600px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Profession</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Login Status</TableHead>
                  <TableHead>Upload Status</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={participant.profilePhotoUrl} alt={participant.name} />
                        <AvatarFallback className="text-sm">
                          {participant.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {participant.name}
                    </TableCell>
                    <TableCell>
                      <a 
                        href={`mailto:${participant.email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {participant.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{participant.profession}</div>
                        {participant.otherProfession && (
                          <div className="text-sm text-muted-foreground">
                            Other: {participant.otherProfession}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {participant.gender.replace(/-/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={participant.login_enabled ?? true}
                          onCheckedChange={(enabled) => handleLoginToggle(participant.id, enabled)}
                        />
                        <span className="text-sm">
                          {participant.login_enabled ?? true ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={participant.upload_enabled ?? false}
                          onCheckedChange={(enabled) => handleUploadToggle(participant.id, enabled)}
                        />
                        <span className="text-sm">
                          {participant.upload_enabled ?? false ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {participant.created_at ? format(new Date(participant.created_at), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <ParticipantDetailModal participant={participant}>
                          <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                            View Details
                          </Badge>
                        </ParticipantDetailModal>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </ScrollArea>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <div className="space-y-2">
              <p className="text-lg font-medium">No participants yet</p>
              <p className="text-sm">Participants will appear here once they register for the contest.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
