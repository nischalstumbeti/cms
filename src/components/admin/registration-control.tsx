"use client";

import { useState } from 'react';
import { useContest } from '@/context/ContestContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Settings, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function RegistrationControl() {
  const { registrationControl, updateRegistrationControl } = useContest();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    isOpen: registrationControl?.isOpen ?? true,
    closedMessage: registrationControl?.closedMessage ?? "Registration is currently closed. Please check back later for updates.",
    closedTitle: registrationControl?.closedTitle ?? "Registration Closed",
    showContactInfo: registrationControl?.showContactInfo ?? true,
    contactEmail: registrationControl?.contactEmail ?? "",
    contactPhone: registrationControl?.contactPhone ?? ""
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('Saving registration control data:', formData);
      const result = await updateRegistrationControl(formData);
      console.log('Update result:', result);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Registration settings updated successfully.',
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
        description: `An error occurred while updating registration settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Registration Control
          </CardTitle>
          <CardDescription>
            Control whether registrations are open or closed and customize the closed message.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Registration Status</h3>
              <p className="text-sm text-muted-foreground">
                Toggle registration open/closed status
              </p>
            </div>
            <Switch
              checked={formData.isOpen}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isOpen: checked }))}
            />
          </div>

          {!formData.isOpen && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Registration is currently closed. Users will see the closed message below.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Closed Title</label>
              <Input
                value={formData.closedTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, closedTitle: e.target.value }))}
                placeholder="Registration Closed"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Closed Message</label>
              <Textarea
                value={formData.closedMessage}
                onChange={(e) => setFormData(prev => ({ ...prev, closedMessage: e.target.value }))}
                placeholder="Registration is currently closed. Please check back later for updates."
                className="mt-1 min-h-[100px]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Show Contact Information</h3>
                <p className="text-sm text-muted-foreground">
                  Display contact details when registration is closed
                </p>
              </div>
              <Switch
                checked={formData.showContactInfo}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showContactInfo: checked }))}
              />
            </div>

            {formData.showContactInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Contact Email</label>
                  <Input
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="wtd.nlr@nextlinker.in"
                    type="email"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Phone</label>
                  <Input
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="+1-234-567-8900"
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          <Button onClick={handleSave} disabled={isLoading} className="w-full">
            {isLoading && <Save className="mr-2 h-4 w-4 animate-spin" />}
            Save Registration Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
