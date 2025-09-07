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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Settings, ArrowUp, ArrowDown } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const fieldSchema = z.object({
  fieldName: z.string().min(1, 'Field name is required'),
  fieldLabel: z.string().min(1, 'Field label is required'),
  fieldType: z.enum(['text', 'email', 'number', 'select', 'textarea', 'checkbox', 'radio', 'date']),
  fieldOptions: z.string().optional(),
  isRequired: z.boolean(),
  isActive: z.boolean(),
  displayOrder: z.number().min(0),
  validationRules: z.string().optional(),
});

const settingsSchema = z.object({
  ageValidation: z.object({
    enabled: z.boolean(),
    minimumAge: z.number().min(1),
    message: z.string().min(1),
  }),
  formConfig: z.object({
    collectAge: z.boolean(),
    ageRequired: z.boolean(),
    showAgeValidation: z.boolean(),
  }),
});

type FieldFormData = z.infer<typeof fieldSchema>;
type SettingsFormData = z.infer<typeof settingsSchema>;

export function FormManager() {
  const { 
    formFields, 
    addFormField, 
    updateFormField, 
    deleteFormField,
    formSettings,
    updateFormSettings
  } = useContest();
  const { toast } = useToast();
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fieldForm = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      fieldName: '',
      fieldLabel: '',
      fieldType: 'text',
      fieldOptions: '',
      isRequired: false,
      isActive: true,
      displayOrder: 0,
      validationRules: '',
    },
  });

  const settingsForm = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      ageValidation: {
        enabled: true,
        minimumAge: 15,
        message: "You must be at least 15 years old to participate"
      },
      formConfig: {
        collectAge: true,
        ageRequired: true,
        showAgeValidation: true
      }
    },
  });

  const handleFieldSubmit = async (data: FieldFormData) => {
    setIsLoading(true);
    try {
      const fieldData = {
        ...data,
        fieldOptions: data.fieldOptions ? JSON.parse(data.fieldOptions) : undefined,
        validationRules: data.validationRules ? JSON.parse(data.validationRules) : undefined,
      };

      if (editingField) {
        const result = await updateFormField(editingField, fieldData);
        if (result.success) {
          toast({
            title: 'Success',
            description: 'Form field updated successfully.',
          });
          setEditingField(null);
          setIsFieldDialogOpen(false);
          fieldForm.reset();
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: result.message,
          });
        }
      } else {
        const result = await addFormField(fieldData);
        if (result.success) {
          toast({
            title: 'Success',
            description: 'Form field added successfully.',
          });
          setIsFieldDialogOpen(false);
          fieldForm.reset();
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
        description: 'An error occurred while saving the field.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsSubmit = async (data: SettingsFormData) => {
    setIsLoading(true);
    try {
      const result = await updateFormSettings(data);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Form settings updated successfully.',
        });
        setIsSettingsDialogOpen(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while saving settings.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditField = (field: any) => {
    setEditingField(field.id);
    fieldForm.reset({
      fieldName: field.fieldName,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      fieldOptions: field.fieldOptions ? JSON.stringify(field.fieldOptions, null, 2) : '',
      isRequired: field.isRequired,
      isActive: field.isActive,
      displayOrder: field.displayOrder,
      validationRules: field.validationRules ? JSON.stringify(field.validationRules, null, 2) : '',
    });
    setIsFieldDialogOpen(true);
  };

  const handleDeleteField = async (fieldId: string) => {
    if (confirm('Are you sure you want to delete this field?')) {
      const result = await deleteFormField(fieldId);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Form field deleted successfully.',
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

  const handleNewField = () => {
    setEditingField(null);
    fieldForm.reset({
      fieldName: '',
      fieldLabel: '',
      fieldType: 'text',
      fieldOptions: '',
      isRequired: false,
      isActive: true,
      displayOrder: formFields.length,
      validationRules: '',
    });
    setIsFieldDialogOpen(true);
  };

  const handleMoveField = async (fieldId: string, direction: 'up' | 'down') => {
    const field = formFields.find(f => f.id === fieldId);
    if (!field) return;

    const currentOrder = field.displayOrder;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    
    // Find the field that would be affected
    const affectedField = formFields.find(f => f.displayOrder === newOrder);
    
    if (affectedField) {
      // Swap orders
      await updateFormField(fieldId, { displayOrder: newOrder });
      await updateFormField(affectedField.id!, { displayOrder: currentOrder });
    }
  };

  const getFieldTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-100 text-blue-800';
      case 'email': return 'bg-green-100 text-green-800';
      case 'number': return 'bg-purple-100 text-purple-800';
      case 'select': return 'bg-yellow-100 text-yellow-800';
      case 'textarea': return 'bg-red-100 text-red-800';
      case 'checkbox': return 'bg-indigo-100 text-indigo-800';
      case 'radio': return 'bg-pink-100 text-pink-800';
      case 'date': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Form Management</h2>
          <p className="text-muted-foreground">Manage participant registration form fields and settings.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsSettingsDialogOpen(true)} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Form Settings
          </Button>
          <Button onClick={handleNewField}>
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>
      </div>

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Form Fields</CardTitle>
          <CardDescription>Manage the fields that appear in the participant registration form.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formFields.length > 0 ? (
              formFields
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{field.fieldLabel}</span>
                            <Badge className={getFieldTypeColor(field.fieldType)}>
                              {field.fieldType}
                            </Badge>
                            {field.isRequired && (
                              <Badge variant="destructive">Required</Badge>
                            )}
                            {!field.isActive && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Field Name: {field.fieldName} | Order: {field.displayOrder}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveField(field.id!, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMoveField(field.id!, 'down')}
                            disabled={index === formFields.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditField(field)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteField(field.id!)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No form fields created yet.</p>
                <Button onClick={handleNewField} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Field
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Field Dialog */}
      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingField ? 'Edit Form Field' : 'Add New Form Field'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={fieldForm.handleSubmit(handleFieldSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Field Name</label>
                <Input
                  {...fieldForm.register('fieldName')}
                  placeholder="e.g., full_name"
                  className="mt-1"
                />
                {fieldForm.formState.errors.fieldName && (
                  <p className="text-sm text-red-600 mt-1">{fieldForm.formState.errors.fieldName.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Field Label</label>
                <Input
                  {...fieldForm.register('fieldLabel')}
                  placeholder="e.g., Full Name"
                  className="mt-1"
                />
                {fieldForm.formState.errors.fieldLabel && (
                  <p className="text-sm text-red-600 mt-1">{fieldForm.formState.errors.fieldLabel.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Field Type</label>
                <Select
                  value={fieldForm.watch('fieldType')}
                  onValueChange={(value) => fieldForm.setValue('fieldType', value as any)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="textarea">Textarea</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="radio">Radio</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Display Order</label>
                <Input
                  type="number"
                  {...fieldForm.register('displayOrder', { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Field Options (JSON)</label>
              <Textarea
                {...fieldForm.register('fieldOptions')}
                placeholder='{"options": ["Option 1", "Option 2"]}'
                className="mt-1 min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                For select, radio, and checkbox fields. Use JSON format.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Validation Rules (JSON)</label>
              <Textarea
                {...fieldForm.register('validationRules')}
                placeholder='{"min": 1, "max": 100, "message": "Invalid value"}'
                className="mt-1 min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Define validation rules in JSON format.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={fieldForm.watch('isRequired')}
                  onCheckedChange={(checked) => fieldForm.setValue('isRequired', checked)}
                />
                <label className="text-sm font-medium">Required Field</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={fieldForm.watch('isActive')}
                  onCheckedChange={(checked) => fieldForm.setValue('isActive', checked)}
                />
                <label className="text-sm font-medium">Active</label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFieldDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (editingField ? 'Update' : 'Create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Form Settings</DialogTitle>
          </DialogHeader>
          <form onSubmit={settingsForm.handleSubmit(handleSettingsSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Age Validation</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settingsForm.watch('ageValidation.enabled')}
                    onCheckedChange={(checked) => 
                      settingsForm.setValue('ageValidation.enabled', checked)
                    }
                  />
                  <label className="text-sm font-medium">Enable Age Validation</label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Minimum Age</label>
                    <Input
                      type="number"
                      {...settingsForm.register('ageValidation.minimumAge', { valueAsNumber: true })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Validation Message</label>
                    <Input
                      {...settingsForm.register('ageValidation.message')}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Form Configuration</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settingsForm.watch('formConfig.collectAge')}
                    onCheckedChange={(checked) => 
                      settingsForm.setValue('formConfig.collectAge', checked)
                    }
                  />
                  <label className="text-sm font-medium">Collect Age Information</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settingsForm.watch('formConfig.ageRequired')}
                    onCheckedChange={(checked) => 
                      settingsForm.setValue('formConfig.ageRequired', checked)
                    }
                  />
                  <label className="text-sm font-medium">Age is Required</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settingsForm.watch('formConfig.showAgeValidation')}
                    onCheckedChange={(checked) => 
                      settingsForm.setValue('formConfig.showAgeValidation', checked)
                    }
                  />
                  <label className="text-sm font-medium">Show Age Validation Message</label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSettingsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
