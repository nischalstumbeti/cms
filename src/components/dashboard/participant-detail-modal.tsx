"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Participant } from "@/context/ContestContext";
import { format } from "date-fns";
import { Eye, Mail, Calendar, User, Briefcase, Users, Edit, Save, X, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ParticipantDetailModalProps {
  participant: Participant;
  children: React.ReactNode;
}

interface EditFormData {
  name: string;
  age: number | null;
  profession: string;
  gender: string;
  upload_enabled: boolean;
}

export function ParticipantDetailModal({ participant, children }: ParticipantDetailModalProps) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [editForm, setEditForm] = useState<EditFormData>({
    name: participant.name,
    age: participant.age || null,
    profession: participant.profession,
    gender: participant.gender,
    upload_enabled: participant.upload_enabled || false,
  });

  const handleEditChange = (field: keyof EditFormData, value: string | number | null | boolean) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/participants/${participant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Participant details updated successfully",
        });
        setIsEditing(false);
        // Refresh the page or update the participant data
        window.location.reload();
      } else {
        throw new Error('Failed to update participant');
      }
    } catch (error) {
      console.error('Error updating participant:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update participant details",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: participant.name,
      age: participant.age || null,
      profession: participant.profession,
      gender: participant.gender,
      upload_enabled: participant.upload_enabled || false,
    });
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={participant.profilePhotoUrl} alt={participant.name} />
                <AvatarFallback className="text-2xl">
                  {participant.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {isEditing ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      className="text-2xl font-bold border-0 p-0 h-auto"
                    />
                  ) : (
                    participant.name
                  )}
                </DialogTitle>
                <DialogDescription className="text-lg text-gray-600 mt-1">
                  Contest Participant • ID: {participant.id.slice(0, 8)}...
                </DialogDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      className="text-lg"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">{participant.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Age
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editForm.age || ''}
                      onChange={(e) => handleEditChange('age', e.target.value ? parseInt(e.target.value) : null)}
                      className="text-lg"
                      min="1"
                      max="150"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-gray-900">
                      {participant.age ? `${participant.age} years` : 'Not specified'}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <a 
                    href={`mailto:${participant.email}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline text-lg font-medium"
                  >
                    {participant.email}
                  </a>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Gender
                  </Label>
                  {isEditing ? (
                    <Select value={editForm.gender} onValueChange={(value) => handleEditChange('gender', value)}>
                      <SelectTrigger className="text-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="secondary" className="capitalize text-sm px-3 py-1">
                      {participant.gender.replace(/-/g, ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-lg text-green-900">
                <Briefcase className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Profession
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.profession}
                    onChange={(e) => handleEditChange('profession', e.target.value)}
                    className="text-lg"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{participant.profession}</p>
                )}
              </div>
              
              {participant.otherProfession && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Other Profession Details
                  </Label>
                  <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {participant.otherProfession}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registration Information */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center gap-2 text-lg text-purple-900">
                <Calendar className="h-5 w-5" />
                Registration Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Registration Date
                  </Label>
                  <p className="text-lg font-medium text-gray-900">
                    {participant.created_at 
                      ? format(new Date(participant.created_at), 'MMMM dd, yyyy \'at\' h:mm a')
                      : 'N/A'
                    }
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Last Updated
                  </Label>
                  <p className="text-lg font-medium text-gray-900">
                    {participant.updated_at 
                      ? format(new Date(participant.updated_at), 'MMMM dd, yyyy \'at\' h:mm a')
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Participant ID
                </Label>
                <p className="text-sm font-mono bg-gray-100 px-4 py-2 rounded-lg border">
                  {participant.id}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Upload Permission
                </Label>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editForm.upload_enabled}
                      onCheckedChange={(checked) => handleEditChange('upload_enabled', checked)}
                    />
                    <span className="text-sm text-gray-600">
                      {editForm.upload_enabled ? 'Can submit files' : 'Cannot submit files'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Badge variant={participant.upload_enabled ? "default" : "secondary"} className="px-3 py-1">
                      {participant.upload_enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {participant.upload_enabled ? 'Can submit files' : 'Cannot submit files'}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Photo */}
          {participant.profilePhotoUrl && (
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center gap-2 text-lg text-orange-900">
                  <Users className="h-5 w-5" />
                  Profile Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-center">
                  <Avatar className="h-40 w-40 border-4 border-white shadow-lg">
                    <AvatarImage src={participant.profilePhotoUrl} alt={participant.name} />
                    <AvatarFallback className="text-5xl">
                      {participant.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-between items-center pt-6 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href={`mailto:${participant.email}`}>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
