import { useState, useEffect } from "react";
import { OnboardingFormData } from "../../pages/Onboarding";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skill } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash, Check, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SkillsAssessmentFormProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
}

const skillsSchema = z.object({
  skills: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        proficiency: z.number().min(1).max(100),
      })
    )
    .min(1, "Please add at least one skill"),
});

type SkillsValues = z.infer<typeof skillsSchema>;

const SkillsAssessmentForm = ({ formData, updateFormData }: SkillsAssessmentFormProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const { data: availableSkills, isLoading } = useQuery<Skill[]>({
    queryKey: ["/api/skills"],
  });
  
  const form = useForm<SkillsValues>({
    resolver: zodResolver(skillsSchema),
    defaultValues: {
      skills: formData.skills || [],
    },
  });
  
  const filteredSkills = availableSkills?.filter((skill) => 
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const addSkill = (skill: Skill) => {
    const currentSkills = form.getValues().skills || [];
    // Check if skill already exists
    if (currentSkills.some((s) => s.id === skill.id)) {
      toast({
        title: "Skill already added",
        description: `You've already added ${skill.name} to your profile.`,
        variant: "destructive",
      });
      return;
    }
    
    const newSkills = [
      ...currentSkills,
      { id: skill.id, name: skill.name, proficiency: 50 }, // Default proficiency is 50
    ];
    
    form.setValue("skills", newSkills);
    updateFormData({ skills: newSkills });
    setSearchTerm("");
  };
  
  const removeSkill = (id: number) => {
    const currentSkills = form.getValues().skills || [];
    const newSkills = currentSkills.filter((skill) => skill.id !== id);
    form.setValue("skills", newSkills);
    updateFormData({ skills: newSkills });
  };
  
  const updateSkillProficiency = (id: number, proficiency: number) => {
    const currentSkills = form.getValues().skills || [];
    const newSkills = currentSkills.map((skill) =>
      skill.id === id ? { ...skill, proficiency } : skill
    );
    form.setValue("skills", newSkills);
    updateFormData({ skills: newSkills });
  };
  
  const onSubmit = (values: SkillsValues) => {
    updateFormData(values);
  };
  
  const getProficiencyLabel = (value: number) => {
    if (value < 25) return "Beginner";
    if (value < 50) return "Intermediate";
    if (value < 75) return "Advanced";
    return "Expert";
  };
  
  // If we don't have any skills from the API yet, show placeholders for popular skills
  const placeholderSkills = [
    { id: 9999, name: "JavaScript", category: "Programming", description: "JavaScript programming language" },
    { id: 9998, name: "React", category: "Frontend", description: "React.js library" },
    { id: 9997, name: "SQL", category: "Database", description: "SQL query language" },
    { id: 9996, name: "Node.js", category: "Backend", description: "Node.js runtime" },
    { id: 9995, name: "TypeScript", category: "Programming", description: "TypeScript programming language" },
    { id: 9994, name: "HTML/CSS", category: "Frontend", description: "Web markup and styling" },
    { id: 9993, name: "Python", category: "Programming", description: "Python programming language" },
    { id: 9992, name: "UI/UX Design", category: "Design", description: "User interface and experience design" },
    { id: 9991, name: "Project Management", category: "Management", description: "Project planning and execution" },
  ];
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          {searchTerm && (
            <Card className="mt-2">
              <CardContent className="pt-4">
                <h3 className="text-sm font-medium mb-2">Search Results</h3>
                <div className="flex flex-wrap gap-2">
                  {isLoading ? (
                    <div>Loading skills...</div>
                  ) : filteredSkills.length > 0 ? (
                    filteredSkills.map((skill) => (
                      <Badge 
                        key={skill.id} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary/10 flex items-center gap-1"
                        onClick={() => addSkill(skill)}
                      >
                        {skill.name}
                        <Plus className="h-3 w-3" />
                      </Badge>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No skills found. Try a different search term.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Show recommended skills if no search term and API skills are not loaded yet */}
          {!searchTerm && (!availableSkills || availableSkills.length === 0) && (
            <Card className="mt-2">
              <CardContent className="pt-4">
                <h3 className="text-sm font-medium mb-2">Popular Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {placeholderSkills.map((skill) => (
                    <Badge 
                      key={skill.id} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary/10 flex items-center gap-1"
                      onClick={() => addSkill(skill)}
                    >
                      {skill.name}
                      <Plus className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Skills</FormLabel>
                <FormDescription>
                  Rate your proficiency in each skill from beginner to expert.
                </FormDescription>
                <FormControl>
                  <div className="space-y-4 mt-2">
                    {field.value.length === 0 ? (
                      <div className="text-center p-4 border border-dashed rounded-md">
                        <p className="text-muted-foreground">
                          Add skills from above to begin
                        </p>
                      </div>
                    ) : (
                      field.value.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex flex-col rounded-md border p-4"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{skill.name}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {getProficiencyLabel(skill.proficiency)}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSkill(skill.id)}
                                className="h-8 w-8 text-destructive"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="px-2">
                            <Slider
                              min={1}
                              max={100}
                              step={1}
                              value={[skill.proficiency]}
                              onValueChange={(vals) =>
                                updateSkillProficiency(skill.id, vals[0])
                              }
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>Beginner</span>
                              <span>Intermediate</span>
                              <span>Advanced</span>
                              <span>Expert</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};

export default SkillsAssessmentForm;