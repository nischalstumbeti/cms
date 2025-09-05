
"use client"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ParticipantTable } from "@/components/dashboard/participant-table"
import { AdminTable } from "@/components/dashboard/admin-table"

export default function UsersPage() {
  return (
    <div className="space-y-6">
       <h1 className="font-headline text-3xl font-bold tracking-tight">User Management</h1>
      <Tabs defaultValue="participants">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="admins">Administrators</TabsTrigger>
        </TabsList>
        <TabsContent value="participants" className="mt-6">
          <ParticipantTable />
        </TabsContent>
        <TabsContent value="admins" className="mt-6">
          <AdminTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
