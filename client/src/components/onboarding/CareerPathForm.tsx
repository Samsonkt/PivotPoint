import { useState } from "react";
import { OnboardingFormData } from "../../pages/Onboarding";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeftRight, Briefcase, GraduationCap, Home, Building, User } from "lucide-react";

interface CareerPathFormProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
}

const careerPathSchema = z.object({
  careerPath: z.enum(["freelance_to_fulltime", "fulltime_to_freelance"], {
    required_error: "Please select your career path",
  }),
  currentStatus: z.enum(["student", "employed", "freelancer", "unemployed"], {
    required_error: "Please select your current status",
  }),
  yearsOfExperience: z.number().min(0).max(50),
  preferredWorkType: z.enum(["remote", "onsite", "hybrid"], {
    required_error: "Please select your preferred work type",
  }),
});

type CareerPathValues = z.infer<typeof careerPathSchema>;

const CareerPathForm = ({ formData, updateFormData }: CareerPathFormProps) => {
  const form = useForm<CareerPathValues>({
    resolver: zodResolver(careerPathSchema),
    defaultValues: {
      careerPath: formData.careerPath as "freelance_to_fulltime" | "fulltime_to_freelance" || undefined,
      currentStatus: formData.currentStatus as "student" | "employed" | "freelancer" | "unemployed" || undefined,
      yearsOfExperience: formData.yearsOfExperience || 0,
      preferredWorkType: formData.preferredWorkType as "remote" | "onsite" | "hybrid" || undefined,
    },
  });

  const onSubmit = (values: CareerPathValues) => {
    updateFormData(values);
  };

  // Auto-save as user changes values
  const handleChange = () => {
    const values = form.getValues();
    updateFormData(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} onChange={handleChange} className="space-y-8">
        <FormField
          control={form.control}
          name="careerPath"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>What's your career transition goal?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="freelance_to_fulltime" id="freelance_to_fulltime" />
                    <Label htmlFor="freelance_to_fulltime" className="flex items-center cursor-pointer">
                      <ArrowLeftRight className="mr-2 h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Freelance to Full-Time</div>
                        <p className="text-sm text-muted-foreground">
                          I want to translate my gig work into a stable full-time position
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="fulltime_to_freelance" id="fulltime_to_freelance" />
                    <Label htmlFor="fulltime_to_freelance" className="flex items-center cursor-pointer">
                      <ArrowLeftRight className="mr-2 h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Full-Time to Freelance</div>
                        <p className="text-sm text-muted-foreground">
                          I want to transition from a traditional job to independent gig work
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currentStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Employment Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="student" className="flex items-center">
                    <div className="flex items-center">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      <span>Student</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="employed">
                    <div className="flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Employed full-time</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="freelancer">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Freelancer/Contractor</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="unemployed">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Currently unemployed</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="yearsOfExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years of Work Experience</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={20}
                    step={1}
                    value={[field.value]}
                    onValueChange={(vals) => field.onChange(vals[0])}
                    className="py-4"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{field.value} years</span>
                    <span>20+ years</span>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Select the number of years of relevant work experience you have
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredWorkType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Preferred Work Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-3"
                >
                  <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="remote" id="remote" />
                    <Label htmlFor="remote" className="flex items-center cursor-pointer">
                      <Home className="mr-2 h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Remote</div>
                        <p className="text-sm text-muted-foreground">
                          I prefer to work entirely from home or location of my choice
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="onsite" id="onsite" />
                    <Label htmlFor="onsite" className="flex items-center cursor-pointer">
                      <Building className="mr-2 h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">On-site</div>
                        <p className="text-sm text-muted-foreground">
                          I prefer to work from an office location
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 rounded-md border p-4 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="hybrid" id="hybrid" />
                    <Label htmlFor="hybrid" className="flex items-center cursor-pointer">
                      <ArrowLeftRight className="mr-2 h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Hybrid</div>
                        <p className="text-sm text-muted-foreground">
                          I prefer a mix of remote and on-site work
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default CareerPathForm;