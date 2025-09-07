
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useContest } from "@/context/ContestContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Image as ImageIcon, Palette, Type, Settings, Users } from "lucide-react";
import Image from "next/image";
import { ContentManager } from "@/components/cms/content-manager";
import { FormManager } from "@/components/admin/form-manager";
import { RegistrationControl } from "@/components/admin/registration-control";
import { SubmissionControl } from "@/components/admin/submission-control";

const formSchema = z.object({
  headerTitle: z.string().min(5, "Header title must be at least 5 characters."),
  headerSubtitle: z.string().min(5, "Header subtitle must be at least 5 characters."),
  footerText: z.string().min(10, "Footer text must be at least 10 characters."),
});

const enhancedBrandingSchema = z.object({
  headerImage: z.object({
    url: z.string(),
    width: z.number(),
    height: z.number(),
    altText: z.string(),
  }),
  logo: z.object({
    url: z.string(),
    width: z.number(),
    height: z.number(),
    altText: z.string(),
  }),
  favicon: z.object({
    url: z.string(),
    altText: z.string(),
  }),
  colorScheme: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
  }),
  fonts: z.object({
    heading: z.string(),
    body: z.string(),
  }),
});

export default function BrandingPage() {
  const { 
    branding, 
    updateBranding, 
    enhancedBranding, 
    updateEnhancedBranding,
    brandingAssets,
    addBrandingAsset,
    updateBrandingAsset,
    deleteBrandingAsset,
    cmsContent,
    addCmsContent,
    updateCmsContent,
    deleteCmsContent
  } = useContest();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      headerTitle: "",
      headerSubtitle: "",
      footerText: "",
    },
  });

  const enhancedForm = useForm<z.infer<typeof enhancedBrandingSchema>>({
    resolver: zodResolver(enhancedBrandingSchema),
    defaultValues: {
      headerImage: {
        url: "",
        width: 1200,
        height: 300,
        altText: "Header Image"
      },
      logo: {
        url: "",
        width: 200,
        height: 80,
        altText: "Logo"
      },
      favicon: {
        url: "",
        altText: "Favicon"
      },
      colorScheme: {
        primary: "#3b82f6",
        secondary: "#64748b",
        accent: "#f59e0b"
      },
      fonts: {
        heading: "Inter",
        body: "Inter"
      }
    },
  });

  useEffect(() => {
    if (branding) {
      form.reset(branding);
    }
  }, [branding, form]);

  useEffect(() => {
    if (enhancedBranding) {
      enhancedForm.reset(enhancedBranding);
    }
  }, [enhancedBranding, enhancedForm]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await updateBranding(values);
      toast({
        title: "Success",
        description: "Basic branding has been updated successfully.",
        className: "bg-accent text-accent-foreground",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "An error occurred while updating the branding.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onEnhancedSubmit = async (values: z.infer<typeof enhancedBrandingSchema>) => {
    setIsLoading(true);
    try {
      await updateEnhancedBranding(values);
      toast({
        title: "Success",
        description: "Enhanced branding has been updated successfully.",
        className: "bg-accent text-accent-foreground",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "An error occurred while updating the enhanced branding.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'header_image' | 'logo' | 'favicon') => {
    try {
      // Convert file to base64 for now (in production, upload to a file service)
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const result = await addBrandingAsset({
          name: file.name,
          type,
          fileUrl: base64,
          fileSize: file.size,
          mimeType: file.type,
          width: type === 'favicon' ? 32 : (type === 'logo' ? 200 : 1200),
          height: type === 'favicon' ? 32 : (type === 'logo' ? 80 : 300),
          altText: `${type} image`,
          isActive: true
        });

        if (result.success) {
          toast({
            title: "Success",
            description: "Image uploaded successfully.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Upload Failed",
            description: result.message,
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "An error occurred while uploading the file.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Branding & CMS</h1>
      <p className="text-muted-foreground">
        Manage the look and feel of your contest portal and content management system.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Basic Branding
          </TabsTrigger>
          <TabsTrigger value="enhanced" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Enhanced Branding
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="cms" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Content Management
          </TabsTrigger>
          <TabsTrigger value="forms" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Form Management
          </TabsTrigger>
          <TabsTrigger value="registration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Registration Control
          </TabsTrigger>
          <TabsTrigger value="submission" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Submission Control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Branding</CardTitle>
              <CardDescription>Customize the basic text content of your portal.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="headerTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Header Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Official Contest Portal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="headerSubtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Header Subtitle</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Your Organization Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="footerText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Footer Text</FormLabel>
                        <FormControl>
                          <Input placeholder={`e.g., © ${new Date().getFullYear()} Your Org. All rights reserved.`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enhanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Branding</CardTitle>
              <CardDescription>Customize images, colors, and fonts for your portal.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...enhancedForm}>
                <form onSubmit={enhancedForm.handleSubmit(onEnhancedSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Header Image
                      </h3>
                      <FormField
                        control={enhancedForm.control}
                        name="headerImage.url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/header.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={enhancedForm.control}
                          name="headerImage.width"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Width (px)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={enhancedForm.control}
                          name="headerImage.height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Height (px)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={enhancedForm.control}
                        name="headerImage.altText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alt Text</FormLabel>
                            <FormControl>
                              <Input placeholder="Header image description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Logo
                      </h3>
                      <FormField
                        control={enhancedForm.control}
                        name="logo.url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/logo.png" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={enhancedForm.control}
                          name="logo.width"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Width (px)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={enhancedForm.control}
                          name="logo.height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Height (px)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={enhancedForm.control}
                        name="logo.altText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alt Text</FormLabel>
                            <FormControl>
                              <Input placeholder="Logo description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Color Scheme
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={enhancedForm.control}
                        name="colorScheme.primary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Color</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input type="color" {...field} className="w-16 h-10" />
                                <Input placeholder="#3b82f6" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={enhancedForm.control}
                        name="colorScheme.secondary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary Color</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input type="color" {...field} className="w-16 h-10" />
                                <Input placeholder="#64748b" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={enhancedForm.control}
                        name="colorScheme.accent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Accent Color</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input type="color" {...field} className="w-16 h-10" />
                                <Input placeholder="#f59e0b" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Enhanced Branding
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding Assets</CardTitle>
              <CardDescription>Manage your uploaded images and assets.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Upload Header Image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'header_image')}
                      className="hidden"
                      id="header-upload"
                    />
                    <Button asChild size="sm">
                      <label htmlFor="header-upload" className="cursor-pointer">
                        Choose File
                      </label>
                    </Button>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Upload Logo</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button asChild size="sm">
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        Choose File
                      </label>
                    </Button>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Upload Favicon</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'favicon')}
                      className="hidden"
                      id="favicon-upload"
                    />
                    <Button asChild size="sm">
                      <label htmlFor="favicon-upload" className="cursor-pointer">
                        Choose File
                      </label>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Current Assets</h4>
                  {brandingAssets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {brandingAssets.map((asset) => (
                        <div key={asset.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={asset.isActive ? "default" : "secondary"}>
                              {asset.type}
                            </Badge>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateBrandingAsset(asset.id!, { isActive: !asset.isActive })}
                              >
                                {asset.isActive ? "Deactivate" : "Activate"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteBrandingAsset(asset.id!)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                          {asset.fileUrl && (
                            <Image
                              src={asset.fileUrl}
                              alt={asset.altText || asset.name}
                              width={100}
                              height={100}
                              className="rounded object-cover w-full h-24"
                            />
                          )}
                          <p className="text-sm text-gray-600 mt-2">{asset.name}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No assets uploaded yet.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cms" className="space-y-6">
          <ContentManager />
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          <FormManager />
        </TabsContent>

        <TabsContent value="registration" className="space-y-6">
          <RegistrationControl />
        </TabsContent>

        <TabsContent value="submission" className="space-y-6">
          <SubmissionControl />
        </TabsContent>
      </Tabs>
    </div>
  );
}
