
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BrandingPage() {

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Branding</h1>
       <p className="text-muted-foreground">
        Manage the look and feel of your contest portal. Update logos, header text, and footer links.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Homepage Branding</CardTitle>
          <CardDescription>Customize the content of the header and footer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="header-title">Header Title</Label>
                <Input id="header-title" defaultValue="Official Tourism Day Contest" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="header-subtitle">Header Subtitle</Label>
                <Input id="header-subtitle" defaultValue="Government of India" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="footer-text">Footer Text</Label>
                <Input id="footer-text" defaultValue={`© ${new Date().getFullYear()} Government of India. All rights reserved.`} />
            </div>
             <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
