"use client";

import { useState } from 'react';
import { useContest } from '@/context/ContestContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const contentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['guidelines', 'news', 'announcement', 'faq', 'terms', 'privacy']),
  status: z.enum(['draft', 'published', 'archived']),
  priority: z.number().min(0).max(100),
  placement: z.enum(['public', 'participant', 'both', 'admin']),
  showOnHomepage: z.boolean(),
  showOnRegistration: z.boolean(),
});

type ContentFormData = z.infer<typeof contentSchema>;

export function ContentManager() {
  const { cmsContent, addCmsContent, updateCmsContent, deleteCmsContent } = useContest();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 'guidelines',
      status: 'draft',
      priority: 0,
      placement: 'both',
      showOnHomepage: false,
      showOnRegistration: false,
    },
  });

  const handleSubmit = async (data: ContentFormData) => {
    setIsLoading(true);
    try {
      if (editingContent) {
        const result = await updateCmsContent(editingContent, data);
        if (result.success) {
          toast({
            title: 'Success',
            description: 'Content updated successfully.',
          });
          setEditingContent(null);
          setIsDialogOpen(false);
          form.reset();
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: result.message,
          });
        }
      } else {
        const result = await addCmsContent(data);
        if (result.success) {
          toast({
            title: 'Success',
            description: 'Content created successfully.',
          });
          setIsDialogOpen(false);
          form.reset();
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: result.message,
          });
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while saving content.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (content: any) => {
    setEditingContent(content.id);
    form.reset({
      title: content.title,
      content: content.content,
      type: content.type,
      status: content.status,
      priority: content.priority,
      placement: content.placement,
      showOnHomepage: content.showOnHomepage,
      showOnRegistration: content.showOnRegistration,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (contentId: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      const result = await deleteCmsContent(contentId);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Content deleted successfully.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    }
  };

  const handleNewContent = () => {
    setEditingContent(null);
    form.reset({
      title: '',
      content: '',
      type: 'guidelines',
      status: 'draft',
      priority: 0,
      placement: 'both',
      showOnHomepage: false,
      showOnRegistration: false,
    });
    setIsDialogOpen(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'guidelines': return 'bg-blue-100 text-blue-800';
      case 'news': return 'bg-green-100 text-green-800';
      case 'announcement': return 'bg-yellow-100 text-yellow-800';
      case 'faq': return 'bg-purple-100 text-purple-800';
      case 'terms': return 'bg-red-100 text-red-800';
      case 'privacy': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">Manage guidelines, news, and other content for your portal.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewContent}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingContent ? 'Edit Content' : 'Add New Content'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    {...form.register('title')}
                    placeholder="Enter content title"
                    className="mt-1"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={form.watch('type')}
                    onValueChange={(value) => form.setValue('type', value as any)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guidelines">Guidelines</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="terms">Terms & Conditions</SelectItem>
                      <SelectItem value="privacy">Privacy Policy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={form.watch('status')}
                      onValueChange={(value) => form.setValue('status', value as any)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority (0-100)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      {...form.register('priority', { valueAsNumber: true })}
                      className="mt-1"
                    />
                    {form.formState.errors.priority && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.priority.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Placement</label>
                    <Select
                      value={form.watch('placement')}
                      onValueChange={(value) => form.setValue('placement', value as any)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public Page Only</SelectItem>
                        <SelectItem value="participant">Participant Page Only</SelectItem>
                        <SelectItem value="both">Both Pages</SelectItem>
                        <SelectItem value="admin">Admin Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Visibility Options</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={form.watch('showOnHomepage')}
                          onChange={(e) => form.setValue('showOnHomepage', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Show on Homepage</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={form.watch('showOnRegistration')}
                          onChange={(e) => form.setValue('showOnRegistration', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm">Show on Registration Page</span>
                      </label>
                    </div>
                  </div>
                </div>

              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  {...form.register('content')}
                  placeholder="Enter content details..."
                  className="mt-1 min-h-[200px]"
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.content.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (editingContent ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {cmsContent.length > 0 ? (
          cmsContent.map((content) => (
            <Card key={content.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{content.title}</CardTitle>
                    <Badge className={getTypeColor(content.type)}>
                      {content.type}
                    </Badge>
                    <Badge className={getStatusColor(content.status)}>
                      {content.status}
                    </Badge>
                    <Badge variant="outline">
                      {content.placement}
                    </Badge>
                    <Badge variant="outline">
                      Priority: {content.priority}
                    </Badge>
                    {content.showOnHomepage && (
                      <Badge variant="secondary">Homepage</Badge>
                    )}
                    {content.showOnRegistration && (
                      <Badge variant="secondary">Registration</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(content)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(content.id!)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-muted-foreground line-clamp-3">
                    {content.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No content created yet.</p>
              <Button onClick={handleNewContent} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Content
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
