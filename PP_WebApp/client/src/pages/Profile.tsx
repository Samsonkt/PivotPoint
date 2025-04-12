import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const PersonalInfo = () => {
  const { toast } = useToast();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      bio: "",
    },
  });
  
  // Update form values when user data is loaded
  React.useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
        bio: user.bio || "",
      });
    }
  }, [user, form.reset]);
  
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      return apiRequest('PATCH', '/api/auth/me', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="First Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Last Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="Email Address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Tell us a bit about yourself and your career goals..." 
                  className="min-h-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
};

const SecuritySettings = () => {
  const { toast } = useToast();
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const updatePasswordMutation = useMutation({
    mutationFn: async (values: PasswordFormValues) => {
      return apiRequest('PATCH', '/api/auth/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "There was an error updating your password. Please ensure your current password is correct.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: PasswordFormValues) => {
    updatePasswordMutation.mutate(values);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder="Enter your current password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder="Enter new password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder="Confirm new password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={updatePasswordMutation.isPending}
        >
          {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </Form>
  );
};

const NotificationSettings = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Email Notifications</h3>
        
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium">New Gig Matches</p>
            <p className="text-sm text-neutral-500">Get notified when new adjacent gigs match your skills</p>
          </div>
          <div className="form-control">
            <input type="checkbox" className="toggle toggle-primary" defaultChecked />
          </div>
        </div>
        
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium">Learning Reminders</p>
            <p className="text-sm text-neutral-500">Receive reminders for your learning pathways</p>
          </div>
          <div className="form-control">
            <input type="checkbox" className="toggle toggle-primary" defaultChecked />
          </div>
        </div>
        
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium">Community Updates</p>
            <p className="text-sm text-neutral-500">Get notified about new posts and replies</p>
          </div>
          <div className="form-control">
            <input type="checkbox" className="toggle toggle-primary" defaultChecked />
          </div>
        </div>
        
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium">Financial Reports</p>
            <p className="text-sm text-neutral-500">Receive monthly financial summaries</p>
          </div>
          <div className="form-control">
            <input type="checkbox" className="toggle toggle-primary" />
          </div>
        </div>
      </div>
      
      <Button>Save Notification Preferences</Button>
    </div>
  );
};

const Profile = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });
  
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl mb-2">
          Profile Settings
        </h1>
        <p className="text-neutral-500">
          Manage your account information and preferences
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              {isLoading ? (
                <Skeleton className="h-24 w-24 rounded-full" />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-white text-2xl">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName[0]}${user.lastName[0]}`
                    : user?.username.slice(0, 2).toUpperCase()}
                </div>
              )}
              
              <div className="mt-4 text-center">
                {isLoading ? (
                  <>
                    <Skeleton className="h-6 w-32 mx-auto" />
                    <Skeleton className="h-4 w-24 mx-auto mt-1" />
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.username}
                    </h2>
                    <p className="text-sm text-neutral-500">@{user?.username}</p>
                  </>
                )}
              </div>
              
              <div className="mt-6 w-full">
                <Button variant="outline" className="w-full">Upload Photo</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                
                <CardContent className="pt-6">
                  <TabsContent value="personal">
                    <PersonalInfo />
                  </TabsContent>
                  
                  <TabsContent value="security">
                    <SecuritySettings />
                  </TabsContent>
                  
                  <TabsContent value="notifications">
                    <NotificationSettings />
                  </TabsContent>
                </CardContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Profile;
