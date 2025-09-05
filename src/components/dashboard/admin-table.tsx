
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
import { PlusCircle } from "lucide-react";
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

export function AdminTable() {
  const { admins } = useContest();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Administrators</CardTitle>
                <CardDescription>Manage administrator accounts with dashboard access.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Admin
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Administrator</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to create a new admin account with limited access.
                        </DialogDescription>
                    </DialogHeader>
                    <AddAdminForm onFinished={() => setIsDialogOpen(false)} />
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
             <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Role</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {admins.length > 0 ? (
                        admins.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.department}</TableCell>
                            <TableCell>
                            <Badge variant={user.role === 'superadmin' ? "default" : "secondary"}>{user.role}</Badge>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No administrators found.
                        </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
