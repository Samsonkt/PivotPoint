import { OnboardingFormData } from "../../pages/Onboarding";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, LucideHelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MentorshipFormProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
}

const mentorshipSchema = z.object({
  availableForMentoring: z.boolean(),
  seekingMentor: z.boolean(),
});

type MentorshipValues = z.infer<typeof mentorshipSchema>;

const MentorshipForm = ({ formData, updateFormData }: MentorshipFormProps) => {
  const form = useForm<MentorshipValues>({
    resolver: zodResolver(mentorshipSchema),
    defaultValues: {
      availableForMentoring: formData.availableForMentoring || false,
      seekingMentor: formData.seekingMentor || false,
    },
  });

  const onSubmit = (values: MentorshipValues) => {
    updateFormData(values);
  };

  // Auto-save as user changes values
  const handleChange = () => {
    const values = form.getValues();
    updateFormData(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} onChange={handleChange} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 text-primary mr-2" />
                Become a Mentor
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-1">
                        <LucideHelpCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Info</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        As a mentor, you'll help others on similar career journeys, 
                        sharing your expertise and experiences. It's also a great way 
                        to build your network and leadership skills.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>
                Offer guidance to others on their career journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                <p>Become a mentor to help others navigate their career transitions. Share your experience and insights while building valuable connections.</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Strengthen your leadership skills</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Build your professional network</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Help others succeed in their careers</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <FormField
                control={form.control}
                name="availableForMentoring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
                    <div className="space-y-0.5">
                      <FormLabel>Available as a mentor</FormLabel>
                      <FormDescription>
                        Make yourself available to mentor others
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardFooter>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 text-primary mr-2" />
                Find a Mentor
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-1">
                        <LucideHelpCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Info</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        A mentor can provide valuable guidance, help you navigate challenges, 
                        and share insights from their own career journey. They can help you 
                        avoid common pitfalls and accelerate your progress.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <CardDescription>
                Get guidance from someone who's been there
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                <p>Connect with experienced professionals who can guide you through your career transition and help you avoid common pitfalls.</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Gain valuable industry insights</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Receive personalized guidance</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Expand your professional network</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <FormField
                control={form.control}
                name="seekingMentor"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-full">
                    <div className="space-y-0.5">
                      <FormLabel>Looking for a mentor</FormLabel>
                      <FormDescription>
                        Get matched with a mentor for your journey
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardFooter>
          </Card>
        </div>
      </form>
    </Form>
  );
};

const Check = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default MentorshipForm;