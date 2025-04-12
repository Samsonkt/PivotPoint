import { useState } from "react";
import { OnboardingFormData } from "../../pages/Onboarding";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface PersonalInfoFormProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
}

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  bio: z.string().min(10, "Please provide a short bio (at least 10 characters)").max(500, "Bio cannot exceed 500 characters"),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

const PersonalInfoForm = ({ formData, updateFormData }: PersonalInfoFormProps) => {
  const form = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      bio: formData.bio,
    },
  });

  const onSubmit = (values: PersonalInfoValues) => {
    updateFormData(values);
  };

  // Auto-save as user types (debounced)
  const handleChange = () => {
    const values = form.getValues();
    updateFormData(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} onChange={handleChange} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
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
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about yourself, your background, and your goals..." 
                  {...field}
                  className="min-h-[120px]"
                />
              </FormControl>
              <FormDescription>
                This will help us personalize your experience and connect you with like-minded professionals.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default PersonalInfoForm;