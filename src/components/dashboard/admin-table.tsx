
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
import { Badge } from "@/components/ui/badge";
import { useContest } from "@/context/ContestContext";
import { Button } from "../ui/button";
import { PlusCircle, Shield, Phone, MapPin, Building, Mail, Edit, Trash2, FileSpreadsheet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddAdminForm } from "../auth/add-admin-form";
import { useState } from "react";
import { EditAdminForm } from "../auth/edit-admin-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function AdminTable() {
  const { admins } = useContest();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleEdit = (admin: any) => {
    setEditingAdmin(admin);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (adminId: string) => {
    try {
      const response = await fetch(`/api/admins/${adminId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the page to update the admin list
        window.location.reload();
      } else {
        alert(data.error || 'Failed to delete admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Failed to delete admin');
    }
  };

  const handleEditFinished = () => {
    setIsEditDialogOpen(false);
    setEditingAdmin(null);
    // Refresh the page to update the admin list
    window.location.reload();
  };

  const handleExportAdmins = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/export-users');
      
      if (!response.ok) {
        throw new Error('Failed to export admins');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `admins-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting admins:', error);
      alert('Failed to export admins. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Administrators</CardTitle>
                <CardDescription>Manage administrator accounts with dashboard access.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button 
                    onClick={handleExportAdmins} 
                    disabled={isExporting || admins.length === 0}
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
                            Export Admins
                        </>
                    )}
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Admin
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Administrator</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to create a new admin account with appropriate permissions.
                        </DialogDescription>
                    </DialogHeader>
                    <AddAdminForm onFinished={() => setIsDialogOpen(false)} />
                </DialogContent>
            </Dialog>
            </div>
        </CardHeader>
        <CardContent>
             <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Admin Details</TableHead>
                        <TableHead>Contact Information</TableHead>
                        <TableHead>Department & Location</TableHead>
                        <TableHead>Role & Permissions</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {admins.length > 0 ? (
                        admins.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="font-semibold text-lg">{user.name}</div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Shield className="h-4 w-4" />
                                        ID: {user.id.slice(0, 8)}...
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">
                                            {user.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{user.phone}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{user.department}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{user.place}</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {user.government === 'state' ? 'State Govt.' : 
                                         user.government === 'central' ? 'Central Govt.' :
                                         user.government === 'outsource' ? 'Outsourced' : 'Other'}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-2">
                                    <Badge variant={user.role === 'superadmin' ? "default" : "secondary"}>
                                        {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                                    </Badge>
                                    {user.permissions && (
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div className="font-medium">Permissions:</div>
                                            <div className="grid grid-cols-2 gap-1">
                                                {user.permissions.can_manage_announcements && (
                                                    <div className="text-green-600">• Announcements</div>
                                                )}
                                                {user.permissions.can_manage_participants && (
                                                    <div className="text-green-600">• Participants</div>
                                                )}
                                                {user.permissions.can_manage_submissions && (
                                                    <div className="text-green-600">• Submissions</div>
                                                )}
                                                {user.permissions.can_manage_admins && (
                                                    <div className="text-red-600">• Admin Management</div>
                                                )}
                                                {user.permissions.can_manage_settings && (
                                                    <div className="text-red-600">• Settings</div>
                                                )}
                                                {user.permissions.can_export_data && (
                                                    <div className="text-blue-600">• Export Data</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(user)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the admin account for {user.name}.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(user.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No administrators found.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>

        {/* Edit Admin Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Administrator</DialogTitle>
                    <DialogDescription>
                        Update the administrator details and permissions below.
                    </DialogDescription>
                </DialogHeader>
                {editingAdmin && (
                    <EditAdminForm
                        admin={editingAdmin}
                        onFinished={handleEditFinished}
                        onCancel={() => {
                            setIsEditDialogOpen(false);
                            setEditingAdmin(null);
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    </Card>
  );
}
