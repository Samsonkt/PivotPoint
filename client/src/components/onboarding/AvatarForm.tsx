import { useState } from "react";
import { OnboardingFormData } from "../../pages/Onboarding";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Camera, User } from "lucide-react";

interface AvatarFormProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
}

const avatarSchema = z.object({
  avatarUrl: z.string().optional(),
});

type AvatarValues = z.infer<typeof avatarSchema>;

// These are just placeholders - in a real app, these would come from a service like DiceBear or similar
const avatarOptions = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Riley",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Pat",
];

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
};

const AvatarForm = ({ formData, updateFormData }: AvatarFormProps) => {
  const [activeTab, setActiveTab] = useState("generate");
  const [generateSeed, setGenerateSeed] = useState(formData.firstName || "");

  const form = useForm<AvatarValues>({
    resolver: zodResolver(avatarSchema),
    defaultValues: {
      avatarUrl: formData.avatarUrl || "",
    },
  });

  const onSubmit = (values: AvatarValues) => {
    updateFormData(values);
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    form.setValue("avatarUrl", avatarUrl);
    updateFormData({ avatarUrl });
  };

  const handleGenerateAvatar = () => {
    if (generateSeed.trim()) {
      const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(generateSeed)}`;
      form.setValue("avatarUrl", newAvatarUrl);
      updateFormData({ avatarUrl: newAvatarUrl });
    }
  };

  const handleRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 8);
    setGenerateSeed(randomSeed);
    const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
    form.setValue("avatarUrl", newAvatarUrl);
    updateFormData({ avatarUrl: newAvatarUrl });
  };

  const selectedAvatarUrl = form.watch("avatarUrl");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32 border-4 border-primary/20">
            {selectedAvatarUrl ? (
              <AvatarImage src={selectedAvatarUrl} alt="Selected avatar" />
            ) : (
              <AvatarFallback className="text-4xl">
                {getInitials(formData.firstName, formData.lastName)}
              </AvatarFallback>
            )}
          </Avatar>

          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormDescription className="text-center">
                  Choose an avatar for your profile
                </FormDescription>
                <Tabs defaultValue="generate" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="generate">Generate</TabsTrigger>
                    <TabsTrigger value="choose">Choose</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                  </TabsList>
                  <TabsContent value="generate" className="space-y-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Enter a seed word (your name, hobby, etc.)"
                        value={generateSeed}
                        onChange={(e) => setGenerateSeed(e.target.value)}
                      />
                      <Button type="button" onClick={handleGenerateAvatar}>
                        Generate
                      </Button>
                    </div>
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRandomAvatar}
                        className="flex items-center"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Random Avatar
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="choose" className="py-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-3 gap-4">
                          {avatarOptions.map((avatar, index) => (
                            <div
                              key={index}
                              className={`cursor-pointer p-2 rounded-md transition-all ${
                                selectedAvatarUrl === avatar
                                  ? "bg-primary/10 border-2 border-primary"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => handleAvatarSelect(avatar)}
                            >
                              <Avatar className="h-20 w-20 mx-auto">
                                <AvatarImage src={avatar} alt={`Avatar option ${index + 1}`} />
                                <AvatarFallback>
                                  <User className="h-8 w-8" />
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="upload" className="py-4">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer w-full">
                        <div className="flex flex-col items-center">
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium mb-1">Upload your avatar</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            PNG, JPG or GIF, up to 2MB
                          </p>
                          <Button variant="outline" size="sm">
                            Choose File
                          </Button>
                        </div>
                      </div>
                      <FormDescription>
                        Note: Image upload is not functional in this demo
                      </FormDescription>
                    </div>
                  </TabsContent>
                </Tabs>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};

export default AvatarForm;