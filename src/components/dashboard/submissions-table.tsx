
"use client";

import Image from 'next/image';
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContest } from "@/context/ContestContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from '@/components/ui/progress';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Edit, Save, X, Download, CheckCircle, XCircle, Clock, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SubmissionsTable() {
  const { submissions, participants, updateSubmissionRemarks, updateSubmission } = useContest();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingRemarks, setEditingRemarks] = useState<string | null>(null);
  const [remarksText, setRemarksText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const getParticipant = (id: string) => participants.find(p => p.id === id);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const participant = getParticipant(submission.participantId);
      const matchesSearch = participant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           participant?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           submission.submissionType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === "all" ||
                           submission.submissionStatus === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [submissions, participants, searchTerm, filterStatus]);

  const handleEditRemarks = (submission: any) => {
    setEditingRemarks(submission.id);
    setRemarksText(submission.internalRemarks || "");
  };

  const handleSaveRemarks = async (submissionId: string) => {
    if (!submissionId) return;
    
    setIsSaving(true);
    try {
      const result = await updateSubmissionRemarks(submissionId, remarksText);
      if (result.success) {
        toast({
          title: "Success",
          description: "Internal remarks updated successfully.",
        });
        setEditingRemarks(null);
        setRemarksText("");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update remarks.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRemarks(null);
    setRemarksText("");
  };

  const handleStatusUpdate = async (submissionId: string, newStatus: 'pending' | 'approved' | 'rejected' | 'cancelled') => {
    setUpdatingStatus(submissionId);
    try {
      await updateSubmission(submissionId, { submissionStatus: newStatus });
      toast({
        title: "Success",
        description: "Submission status updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update submission status.",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const exportSubmissions = () => {
    const csvData = filteredSubmissions.map(submission => {
      const participant = getParticipant(submission.participantId);
      return {
        'Participant Name': participant?.name || 'Unknown',
        'Email': participant?.email || '',
        'Submission Type': submission.submissionType,
        'Status': submission.submissionStatus,
        'Link': submission.link || '',
        'Admin Notes': submission.adminNotes || '',
        'Internal Remarks': submission.internalRemarks || '',
        'Created At': submission.createdAt ? new Date(submission.createdAt).toLocaleString() : '',
        'Updated At': submission.updatedAt ? new Date(submission.updatedAt).toLocaleString() : ''
      };
    });

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `submissions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by participant name, email, or submission type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Submissions</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={exportSubmissions} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Submission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="min-w-[200px]">Internal Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((s) => {
                const participant = getParticipant(s.participantId);

                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{participant?.name || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{participant?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          {s.submissionType === 'photography' ? 'Photography' : 'Videography'} Submission
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Status: <span className={`px-2 py-1 rounded text-xs ${
                            s.submissionStatus === 'approved' ? 'bg-green-100 text-green-800' :
                            s.submissionStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                            s.submissionStatus === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {s.submissionStatus}
                          </span>
                        </div>
                        {s.link && (
                          <div className="space-y-1">
                            <a 
                              href={s.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline block text-xs break-all"
                            >
                              {s.link}
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          s.submissionStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          s.submissionStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          s.submissionStatus === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {s.submissionStatus}
                        </span>
                        <Select
                          value={s.submissionStatus}
                          onValueChange={(value: 'pending' | 'approved' | 'rejected' | 'cancelled') => 
                            handleStatusUpdate(s.id!, value)
                          }
                          disabled={updatingStatus === s.id}
                        >
                          <SelectTrigger className="w-24 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Pending
                              </div>
                            </SelectItem>
                            <SelectItem value="approved">
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Approved
                              </div>
                            </SelectItem>
                            <SelectItem value="rejected">
                              <div className="flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Rejected
                              </div>
                            </SelectItem>
                            <SelectItem value="cancelled">
                              <div className="flex items-center gap-1">
                                <Ban className="h-3 w-3" />
                                Cancelled
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingRemarks === s.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={remarksText}
                            onChange={(e) => setRemarksText(e.target.value)}
                            placeholder="Add internal remarks..."
                            className="min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveRemarks(s.id!)}
                              disabled={isSaving}
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground min-h-[40px]">
                            {s.internalRemarks || 'No remarks added'}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRemarks(s)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            {s.internalRemarks ? 'Edit' : 'Add'} Remarks
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {searchTerm || filterStatus !== "all" 
                    ? "No submissions match your search criteria." 
                    : "No submissions yet."
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
