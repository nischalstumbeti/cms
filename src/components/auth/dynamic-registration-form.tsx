"use client";

import { useState } from 'react';
import { useContest } from '@/context/ContestContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function DynamicRegistrationForm() {
  const { formFields, formSettings, addParticipant } = useContest();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeFields = formFields
    .filter(field => field.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const validateField = (field: any, value: any): string | null => {
    if (field.isRequired && (!value || value === '')) {
      return `${field.fieldLabel} is required`;
    }

    // Age validation
    if (field.fieldName === 'age' && formSettings?.ageValidation.enabled) {
      const age = parseInt(value);
      if (isNaN(age) || age < formSettings.ageValidation.minimumAge) {
        return formSettings.ageValidation.message;
      }
    }

    // Custom validation rules
    if (field.validationRules && value) {
      try {
        const rules = typeof field.validationRules === 'string' 
          ? JSON.parse(field.validationRules) 
          : field.validationRules;
        
        if (rules.min && parseInt(value) < rules.min) {
          return rules.message || `Value must be at least ${rules.min}`;
        }
        if (rules.max && parseInt(value) > rules.max) {
          return rules.message || `Value must be at most ${rules.max}`;
        }
      } catch (error) {
        console.error('Error parsing validation rules:', error);
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    activeFields.forEach(field => {
      const value = formData[field.fieldName];
      const error = validateField(field, value);
      if (error) {
        newErrors[field.fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Map form data to participant data
      const participantData = {
        name: formData.name || '',
        email: formData.email || '',
        profession: formData.profession || '',
        otherProfession: formData.other_profession || null,
        gender: formData.gender || 'prefer-not-to-say',
        age: formData.age ? parseInt(formData.age) : null,
        contestType: formData.contest_type || 'photography',
        profilePhotoUrl: formData.profile_photo_url || null,
      };

      const result = await addParticipant(participantData);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        // Reset form
        setFormData({});
        setErrors({});
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: result.message,
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.fieldName] || '';
    const error = errors[field.fieldName];

    const baseProps = {
      value: value,
      onChange: (e: any) => handleInputChange(field.fieldName, e.target.value),
      className: error ? 'border-red-500' : '',
    };

    switch (field.fieldType) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.fieldName}>
              {field.fieldLabel}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.fieldName}
              type={field.fieldType}
              placeholder={`Enter ${field.fieldLabel.toLowerCase()}`}
              {...baseProps}
            />
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.fieldName}>
              {field.fieldLabel}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.fieldName}
              placeholder={`Enter ${field.fieldLabel.toLowerCase()}`}
              {...baseProps}
            />
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>
        );

      case 'select':
        const options = field.fieldOptions?.options || [];
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.fieldName}>
              {field.fieldLabel}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(newValue) => handleInputChange(field.fieldName, newValue)}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={`Select ${field.fieldLabel.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.fieldName}
                checked={value === true}
                onCheckedChange={(checked) => handleInputChange(field.fieldName, checked)}
              />
              <Label htmlFor={field.fieldName}>
                {field.fieldLabel}
                {field.isRequired && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>
        );

      case 'radio':
        const radioOptions = field.fieldOptions?.options || [];
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.fieldLabel}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(newValue) => handleInputChange(field.fieldName, newValue)}
            >
              {radioOptions.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.fieldName}-${option}`} />
                  <Label htmlFor={`${field.fieldName}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.fieldName}>
              {field.fieldLabel}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.fieldName}
              type="date"
              {...baseProps}
            />
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (activeFields.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No registration form fields configured.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please contact an administrator to set up the registration form.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participant Registration</CardTitle>
        <CardDescription>
          Please fill out the form below to register for the contest.
          {formSettings?.ageValidation.enabled && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {formSettings.ageValidation.message}
              </AlertDescription>
            </Alert>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeFields.map(renderField)}
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register for Contest
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
