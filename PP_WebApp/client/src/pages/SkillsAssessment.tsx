import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Skill {
  id: number;
  name: string;
  category: string;
  description?: string;
}

interface UserSkill {
  id: number;
  userId: number;
  skillId: number;
  proficiencyLevel: number;
  skill: Skill;
}

interface SelectedSkill {
  skillId: number;
  proficiencyLevel: number;
  existingId?: number;
}

const SkillCategory = ({
  category,
  skills,
  selectedSkills,
  onSkillToggle,
  onProficiencyChange,
}: {
  category: string;
  skills: Skill[];
  selectedSkills: SelectedSkill[];
  onSkillToggle: (skill: Skill, selected: boolean) => void;
  onProficiencyChange: (skillId: number, proficiency: number) => void;
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-neutral-900">{category}</h3>
      
      <div className="space-y-8">
        {skills.map((skill) => {
          const selectedSkill = selectedSkills.find(s => s.skillId === skill.id);
          const isSelected = !!selectedSkill;
          
          return (
            <div key={skill.id} className="space-y-2">
              <div className="flex items-center">
                <Checkbox
                  id={`skill-${skill.id}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => onSkillToggle(skill, !!checked)}
                  className="mr-2"
                />
                <label
                  htmlFor={`skill-${skill.id}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {skill.name}
                </label>
              </div>
              
              {isSelected && (
                <div className="pl-6 mt-2">
                  <div className="flex justify-between text-xs text-neutral-500 mb-2">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Expert</span>
                  </div>
                  <Slider
                    value={[selectedSkill.proficiencyLevel]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={(value) => onProficiencyChange(skill.id, value[0])}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SkillSearch = ({
  skills,
  onSkillToggle,
  selectedSkillIds,
}: {
  skills: Skill[];
  onSkillToggle: (skill: Skill, selected: boolean) => void;
  selectedSkillIds: number[];
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter skills based on search term
  const filteredSkills = skills.filter(skill => 
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <Input
        type="text"
        placeholder="Search skills..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {searchTerm && (
        <div className="space-y-4">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => {
              const isSelected = selectedSkillIds.includes(skill.id);
              
              return (
                <div key={skill.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="text-sm font-medium">{skill.name}</p>
                    <p className="text-xs text-neutral-500">{skill.category}</p>
                  </div>
                  <Button
                    variant={isSelected ? "outline" : "default"}
                    size="sm"
                    onClick={() => onSkillToggle(skill, !isSelected)}
                  >
                    {isSelected ? "Remove" : "Add"}
                  </Button>
                </div>
              );
            })
          ) : (
            <p className="text-center py-4 text-neutral-500">No skills found matching "{searchTerm}"</p>
          )}
        </div>
      )}
    </div>
  );
};

const SkillsAssessment = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
  const [step, setStep] = useState(1);
  const [activeTab, setActiveTab] = useState("categories");
  
  const { data: skills, isLoading: isSkillsLoading } = useQuery({
    queryKey: ['/api/skills'],
    retry: false,
  });
  
  const { data: userSkills, isLoading: isUserSkillsLoading } = useQuery({
    queryKey: ['/api/user-skills'],
    retry: false,
  });
  
  const isLoading = isSkillsLoading || isUserSkillsLoading;
  
  // Initialize selected skills with user's existing skills
  useEffect(() => {
    if (userSkills && userSkills.length > 0) {
      const initialSelectedSkills = userSkills.map(userSkill => ({
        skillId: userSkill.skillId,
        proficiencyLevel: userSkill.proficiencyLevel,
        existingId: userSkill.id,
      }));
      
      setSelectedSkills(initialSelectedSkills);
    }
  }, [userSkills]);
  
  // Group skills by category
  const skillsByCategory = skills 
    ? skills.reduce((acc: Record<string, Skill[]>, skill: Skill) => {
        if (!acc[skill.category]) {
          acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
      }, {})
    : {};
  
  const categories = Object.keys(skillsByCategory).sort();
  
  // Handle skill selection/deselection
  const handleSkillToggle = (skill: Skill, selected: boolean) => {
    if (selected) {
      // Add skill
      setSelectedSkills([
        ...selectedSkills,
        { skillId: skill.id, proficiencyLevel: 50 }
      ]);
    } else {
      // Remove skill
      setSelectedSkills(selectedSkills.filter(s => s.skillId !== skill.id));
    }
  };
  
  // Handle proficiency level change
  const handleProficiencyChange = (skillId: number, proficiency: number) => {
    setSelectedSkills(
      selectedSkills.map(skill => 
        skill.skillId === skillId 
          ? { ...skill, proficiencyLevel: proficiency }
          : skill
      )
    );
  };
  
  // Save skills mutation
  const saveSkillsMutation = useMutation({
    mutationFn: async () => {
      // Process deletions first (skills that user had but removed)
      const deletedSkills = userSkills?.filter(
        userSkill => !selectedSkills.some(s => s.skillId === userSkill.skillId)
      ) || [];
      
      for (const deletedSkill of deletedSkills) {
        await apiRequest('DELETE', `/api/user-skills/${deletedSkill.id}`, {});
      }
      
      // Process additions and updates
      for (const skill of selectedSkills) {
        if (skill.existingId) {
          // Update existing skill
          await apiRequest('PATCH', `/api/user-skills/${skill.existingId}`, {
            proficiencyLevel: skill.proficiencyLevel
          });
        } else {
          // Add new skill
          await apiRequest('POST', '/api/user-skills', {
            skillId: skill.skillId,
            proficiencyLevel: skill.proficiencyLevel
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-skills'] });
      toast({
        title: "Skills Saved",
        description: "Your skills assessment has been saved successfully.",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: "There was an error saving your skills. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleSave = () => {
    saveSkillsMutation.mutate();
  };
  
  const selectedSkillIds = selectedSkills.map(s => s.skillId);
  
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl mb-2">
          Skills Assessment
        </h1>
        <p className="text-neutral-500 max-w-2xl mx-auto">
          Select skills you already have and rate your proficiency level. This helps us find adjacent gig opportunities and personalize your learning pathways.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Skills Inventory</CardTitle>
          <CardDescription>
            Select all skills that apply to you and rate your proficiency level for each
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-8">
              <Skeleton className="h-8 w-32" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="categories">By Category</TabsTrigger>
                  <TabsTrigger value="search">Search</TabsTrigger>
                </TabsList>
                
                <TabsContent value="categories" className="space-y-8">
                  {categories.map(category => (
                    <SkillCategory
                      key={category}
                      category={category}
                      skills={skillsByCategory[category]}
                      selectedSkills={selectedSkills}
                      onSkillToggle={handleSkillToggle}
                      onProficiencyChange={handleProficiencyChange}
                    />
                  ))}
                </TabsContent>
                
                <TabsContent value="search">
                  <SkillSearch
                    skills={skills || []}
                    onSkillToggle={handleSkillToggle}
                    selectedSkillIds={selectedSkillIds}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="mt-8 p-4 bg-neutral-50 rounded-md border">
                <h3 className="text-sm font-medium mb-3">Selected Skills ({selectedSkills.length})</h3>
                {selectedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map(({ skillId, proficiencyLevel }) => {
                      const skill = skills.find(s => s.id === skillId);
                      if (!skill) return null;
                      
                      let bgColor, textColor;
                      if (proficiencyLevel >= 75) {
                        bgColor = "bg-primary-light";
                        textColor = "text-primary";
                      } else if (proficiencyLevel >= 40) {
                        bgColor = "bg-secondary-light";
                        textColor = "text-secondary";
                      } else {
                        bgColor = "bg-neutral-100";
                        textColor = "text-neutral-700";
                      }
                      
                      return (
                        <div 
                          key={skillId} 
                          className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
                        >
                          {skill.name}
                          <button 
                            onClick={() => handleSkillToggle(skill, false)}
                            className="ml-1.5 text-neutral-400 hover:text-neutral-600"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No skills selected yet</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saveSkillsMutation.isPending || selectedSkills.length === 0}
          >
            {saveSkillsMutation.isPending ? "Saving..." : "Save Skills"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};

export default SkillsAssessment;
