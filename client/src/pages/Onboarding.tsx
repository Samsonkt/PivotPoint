import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import { useNavigate } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Helmet } from "react-helmet";
import { UseMutationResult } from "@tanstack/react-query";

import PersonalInfoForm from "../components/onboarding/PersonalInfoForm";
import CareerPathForm from "../components/onboarding/CareerPathForm";
import SkillsAssessmentForm from "../components/onboarding/SkillsAssessmentForm";
import MentorshipForm from "../components/onboarding/MentorshipForm";
import AvatarForm from "../components/onboarding/AvatarForm";

// Types for the onboarding form data
export interface OnboardingFormData {
  // Personal Info
  firstName: string;
  lastName: string;
  bio: string;
  
  // Career Path
  careerPath: "freelance_to_fulltime" | "fulltime_to_freelance" | "";
  currentStatus: "student" | "employed" | "freelancer" | "unemployed" | "";
  yearsOfExperience: number;
  preferredWorkType: "remote" | "onsite" | "hybrid" | "";
  
  // Skills
  skills: {
    id: number;
    name: string;
    proficiency: number;
  }[];
  
  // Mentorship
  availableForMentoring: boolean;
  seekingMentor: boolean;
  
  // Avatar
  avatarUrl: string;
}

// Initial empty form data
const initialFormData: OnboardingFormData = {
  firstName: "",
  lastName: "",
  bio: "",
  careerPath: "",
  currentStatus: "",
  yearsOfExperience: 0,
  preferredWorkType: "",
  skills: [],
  availableForMentoring: false,
  seekingMentor: false,
  avatarUrl: "",
};

const OnboardingPage = () => {
  const { user, updateProfileMutation } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const navigate = useNavigate();
  
  // If user is not logged in, redirect to auth page
  if (!user) {
    navigate("/auth");
    return null;
  }
  
  // If user has already completed onboarding, redirect to dashboard
  if (user.onboardingCompleted) {
    navigate("/");
    return null;
  }
  
  const totalSteps = 5;
  
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const updateFormData = (newData: Partial<OnboardingFormData>) => {
    setFormData({
      ...formData,
      ...newData,
    });
  };
  
  const handleSubmit = async () => {
    if (step !== totalSteps) {
      nextStep();
      return;
    }
    
    // Convert form data to API format
    const profileData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      bio: formData.bio,
      careerPath: formData.careerPath,
      currentStatus: formData.currentStatus,
      yearsOfExperience: formData.yearsOfExperience,
      preferredWorkType: formData.preferredWorkType,
      availableForMentoring: formData.availableForMentoring,
      seekingMentor: formData.seekingMentor,
      avatarUrl: formData.avatarUrl,
      onboardingCompleted: true,
    };
    
    try {
      await updateProfileMutation.mutateAsync(profileData);
      
      // Create user skills
      await Promise.all(
        formData.skills.map(async (skill) => {
          // We'll implement this when we create the API
        })
      );
      
      toast({
        title: "Profile updated",
        description: "Your profile has been set up successfully!",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <PersonalInfoForm 
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return (
          <CareerPathForm 
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return (
          <SkillsAssessmentForm 
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 4:
        return (
          <MentorshipForm 
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 5:
        return (
          <AvatarForm 
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      default:
        return null;
    }
  };
  
  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Personal Information";
      case 2:
        return "Career Path";
      case 3:
        return "Skills Assessment";
      case 4:
        return "Mentorship";
      case 5:
        return "Create Your Avatar";
      default:
        return "";
    }
  };
  
  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Tell us about yourself";
      case 2:
        return "Let us know your career goals";
      case 3:
        return "Rate your skills to help us find the right opportunities for you";
      case 4:
        return "Connect with mentors or become one";
      case 5:
        return "Create your visual identity";
      default:
        return "";
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Onboarding | Pivot Point</title>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">Let's set up your profile</h1>
            <p className="mt-2 text-muted-foreground">
              Step {step} of {totalSteps}: {getStepTitle()}
            </p>
            <div className="mt-4">
              <Progress value={(step / totalSteps) * 100} className="h-2" />
            </div>
          </div>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{getStepTitle()}</CardTitle>
              <CardDescription>{getStepDescription()}</CardDescription>
            </CardHeader>
            
            <CardContent>
              {getStepContent()}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
              >
                Previous
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Saving..." : 
                 step === totalSteps ? "Finish" : "Continue"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OnboardingPage;