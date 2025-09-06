
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useContest } from "@/context/ContestContext";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  profession: z.string({ required_error: "Please select your profession." }),
  otherProfession: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say'], {required_error: "Please select a gender."}),
  profilePhoto: z.any().refine(file => file?.[0], "Profile photo is required."),
}).refine(data => {
    if (data.profession === 'Others') {
        return !!data.otherProfession && data.otherProfession.length > 0;
    }
    return true;
}, {
    message: "Please specify your profession",
    path: ["otherProfession"],
});


export function RegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { addParticipant } = useContest();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const professionValue = form.watch("profession");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(values.profilePhoto[0]);
    reader.onload = async () => {
      const profilePhotoUrl = reader.result as string;
      const finalProfession = values.profession === 'Others' ? values.otherProfession : values.profession;
      
      const { profilePhoto, otherProfession, ...restOfValues } = values;

      const participantData = {
          ...restOfValues,
          profession: finalProfession!,
          profilePhotoUrl,
          otherProfession: values.profession === 'Others' ? values.otherProfession : null,
      };

      const { success, message } = await addParticipant(participantData);
      
      if (success) {
        toast({
          title: "Registration Successful",
          description: "You can now log in to the submission portal.",
        });
        router.push("/login");
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: message,
        });
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to process profile photo.",
        });
        setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profession</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select your profession" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Employed (Govt/Private)">Employed (Govt/Private)</SelectItem>
                        <SelectItem value="Self-Employed / Business">Self-Employed / Business</SelectItem>
                        <SelectItem value="Homemaker">Homemaker</SelectItem>
                        <SelectItem value="Retired">Retired</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {professionValue === 'Others' && (
            <FormField
            control={form.control}
            name="otherProfession"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Please Specify</FormLabel>
                <FormControl>
                    <Input placeholder="Your profession" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        )}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="profilePhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Photo</FormLabel>
              <FormControl>
                 <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
              </FormControl>
              <FormDescription>
                This will be your avatar on the platform.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>
    </Form>
  );
}
