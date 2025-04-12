import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface LearningPath {
  id: number;
  title: string;
  description: string;
  skillsTargeted: number[];
  courseCount: number;
  estimatedHours: number;
}

interface UserPath {
  id: number;
  userId: number;
  pathId: number;
  progress: number;
  startedAt: string;
  path: LearningPath;
}

interface Course {
  id: number;
  pathId: number;
  title: string;
  description: string;
  status: "not_started" | "in_progress" | "completed";
  order: number;
}

interface UserCourse {
  id: number;
  userId: number;
  courseId: number;
  progress: number;
  completed: boolean;
  course: Course;
}

interface Skill {
  id: number;
  name: string;
  category: string;
}

const CourseCard = ({ 
  course, 
  status, 
  userCourse,
  onStart
}: { 
  course: Course; 
  status: string;
  userCourse?: UserCourse;
  onStart?: (courseId: number) => void;
}) => {
  let statusIcon, statusColor, statusText, progress;
  
  if (status === "completed") {
    statusIcon = "fas fa-check";
    statusColor = "bg-success bg-opacity-10 text-success";
    statusText = "Completed";
    progress = 100;
  } else if (status === "in_progress") {
    statusIcon = "fas fa-clock";
    statusColor = "bg-accent bg-opacity-10 text-accent";
    statusText = "In progress";
    progress = userCourse?.progress || 40;
  } else {
    statusIcon = "fas fa-lock";
    statusColor = "bg-neutral-200 text-neutral-400";
    statusText = "Not started";
    progress = 0;
  }
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <div className={`h-10 w-10 rounded ${statusColor} flex items-center justify-center`}>
            <i className={statusIcon}></i>
          </div>
          <div className="ml-4">
            <h4 className="text-base font-medium text-neutral-900">{course.title}</h4>
            <p className="text-sm text-neutral-500">{statusText}</p>
          </div>
        </div>
        
        <p className="text-sm text-neutral-600 mb-4">{course.description}</p>
        
        <div className="mb-2 flex justify-between text-xs">
          <span>Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="mb-4" />
        
        {status === "not_started" && (
          <Button 
            onClick={() => onStart && onStart(course.id)}
            className="w-full"
          >
            Start Course
          </Button>
        )}
        
        {status === "in_progress" && (
          <Button className="w-full">Continue Learning</Button>
        )}
        
        {status === "completed" && (
          <Button variant="outline" className="w-full">Review Course</Button>
        )}
      </CardContent>
    </Card>
  );
};

const PathCard = ({ 
  path, 
  skills, 
  isUserPath = false,
  userPathProgress = 0,
  onEnroll
}: { 
  path: LearningPath; 
  skills: Skill[];
  isUserPath?: boolean;
  userPathProgress?: number;
  onEnroll?: (pathId: number) => void;
}) => {
  const pathSkills = skills.filter(skill => 
    (path.skillsTargeted as number[]).includes(skill.id)
  );
  
  let iconClass, iconBgColor, iconTextColor, skillsBgColor, skillsTextColor;
  
  if (path.title.includes("Development") || path.title.includes("Front-End")) {
    iconClass = "fas fa-code";
    iconBgColor = "bg-primary-light";
    iconTextColor = "text-primary";
    skillsBgColor = "bg-primary-light";
    skillsTextColor = "text-primary";
  } else if (path.title.includes("Marketing") || path.title.includes("Analytics")) {
    iconClass = "fas fa-chart-line";
    iconBgColor = "bg-secondary-light";
    iconTextColor = "text-secondary";
    skillsBgColor = "bg-secondary-light";
    skillsTextColor = "text-secondary";
  } else {
    iconClass = "fas fa-graduation-cap";
    iconBgColor = "bg-accent-light";
    iconTextColor = "text-accent";
    skillsBgColor = "bg-accent-light";
    skillsTextColor = "text-accent";
  }
  
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <div className={`flex-shrink-0 h-12 w-12 rounded ${iconBgColor} flex items-center justify-center ${iconTextColor}`}>
            <i className={iconClass}></i>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-neutral-900">{path.title}</h3>
            <p className="text-sm text-neutral-500">{path.courseCount} courses • {path.estimatedHours} hours</p>
          </div>
        </div>
        
        <p className="text-sm text-neutral-600 mb-4">{path.description}</p>
        
        {isUserPath && (
          <>
            <div className="mb-2 flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{userPathProgress}%</span>
            </div>
            <Progress value={userPathProgress} className="mb-4" />
          </>
        )}
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-2">Skills you'll develop:</h4>
          <div className="flex flex-wrap gap-1.5">
            {pathSkills.map(skill => (
              <span key={skill.id} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${skillsBgColor} ${skillsTextColor}`}>
                {skill.name}
              </span>
            ))}
          </div>
        </div>
        
        {!isUserPath && (
          <Button 
            onClick={() => onEnroll && onEnroll(path.id)}
            className="w-full"
          >
            Enroll in Pathway
          </Button>
        )}
        
        {isUserPath && (
          <Button className="w-full">Continue Learning</Button>
        )}
      </CardContent>
    </Card>
  );
};

const LearningPaths = () => {
  const { toast } = useToast();
  
  const { data: userPaths, isLoading: isUserPathsLoading } = useQuery({
    queryKey: ['/api/user-paths'],
    retry: false,
  });

  const { data: paths, isLoading: isPathsLoading } = useQuery({
    queryKey: ['/api/learning-paths'],
    retry: false,
  });

  const { data: skills, isLoading: isSkillsLoading } = useQuery({
    queryKey: ['/api/skills'],
    retry: false,
  });
  
  const isLoading = isUserPathsLoading || isPathsLoading || isSkillsLoading;
  
  // Get path IDs that the user is already enrolled in
  const enrolledPathIds = userPaths ? userPaths.map(userPath => userPath.pathId) : [];
  
  // Filter out paths the user is already enrolled in
  const availablePaths = paths ? paths.filter(path => !enrolledPathIds.includes(path.id)) : [];
  
  // Enroll in a learning path
  const enrollMutation = useMutation({
    mutationFn: async (pathId: number) => {
      return apiRequest('POST', '/api/user-paths', {
        pathId,
        progress: 0
      });
    },
    onSuccess: () => {
      toast({
        title: "Enrolled Successfully",
        description: "You have been enrolled in the learning path.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user-paths'] });
    },
    onError: (error) => {
      toast({
        title: "Enrollment Failed",
        description: "There was an error enrolling you in the path. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleEnroll = (pathId: number) => {
    enrollMutation.mutate(pathId);
  };
  
  // Start a course
  const startCourseMutation = useMutation({
    mutationFn: async (courseId: number) => {
      return apiRequest('POST', '/api/user-courses', {
        courseId,
        progress: 0,
        completed: false
      });
    },
    onSuccess: () => {
      toast({
        title: "Course Started",
        description: "You have started the course. Good luck!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user-courses'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Start Course",
        description: "There was an error starting the course. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleStartCourse = (courseId: number) => {
    startCourseMutation.mutate(courseId);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl mb-2">
          Learning Pathways
        </h1>
        <p className="text-neutral-500">
          Develop skills for your career transitions with personalized learning paths.
        </p>
      </div>
      
      <Tabs defaultValue="my-paths" className="mb-6">
        <TabsList>
          <TabsTrigger value="my-paths">My Pathways</TabsTrigger>
          <TabsTrigger value="available">Available Pathways</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-paths" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          ) : userPaths && userPaths.length > 0 ? (
            <div className="space-y-8">
              {userPaths.map((userPath) => {
                // Fetch courses for this path
                const { data: pathCourses, isLoading: isCoursesLoading } = useQuery({
                  queryKey: [`/api/learning-paths/${userPath.pathId}/courses`],
                  retry: false,
                });
                
                // Fetch user courses
                const { data: userCourses, isLoading: isUserCoursesLoading } = useQuery({
                  queryKey: [`/api/user-courses?pathId=${userPath.pathId}`],
                  retry: false,
                });
                
                return (
                  <div key={userPath.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-neutral-200">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-4 md:mb-0">
                          <h2 className="text-xl font-semibold text-neutral-900">{userPath.path.title}</h2>
                          <p className="text-sm text-neutral-500">{userPath.path.description}</p>
                        </div>
                        <div className="flex items-center">
                          <div className="text-right mr-4">
                            <p className="text-sm text-neutral-500">Overall Progress</p>
                            <p className="text-lg font-semibold text-neutral-900">{userPath.progress}%</p>
                          </div>
                          <div className="w-16 h-16 relative">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#E2E8F0"
                                strokeWidth="3"
                              />
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#3366FF"
                                strokeWidth="3"
                                strokeDasharray={`${userPath.progress}, 100`}
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {isCoursesLoading || isUserCoursesLoading ? (
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-48 w-full rounded-lg" />
                          ))}
                        </div>
                      </div>
                    ) : pathCourses && pathCourses.length > 0 ? (
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-neutral-900 mb-4">Course Modules</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {pathCourses.map((course) => {
                            // Find if user has started this course
                            const userCourse = userCourses?.find(uc => uc.courseId === course.id);
                            let status = course.status;
                            
                            if (userCourse) {
                              status = userCourse.completed ? "completed" : "in_progress";
                            }
                            
                            return (
                              <CourseCard 
                                key={course.id} 
                                course={course}
                                status={status}
                                userCourse={userCourse}
                                onStart={handleStartCourse}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-neutral-500">No courses available for this path yet.</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white shadow rounded-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                <i className="fas fa-graduation-cap text-neutral-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No Learning Pathways Yet</h3>
              <p className="text-neutral-500 max-w-md mx-auto mb-6">
                You haven't enrolled in any learning pathways. Explore available pathways to start your learning journey.
              </p>
              <Button onClick={() => document.querySelector('[data-value="available"]')?.click()}>
                Explore Learning Pathways
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="available" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          ) : availablePaths && availablePaths.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePaths.map((path) => (
                <PathCard 
                  key={path.id} 
                  path={path} 
                  skills={skills || []}
                  onEnroll={handleEnroll}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white shadow rounded-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                <i className="fas fa-check-circle text-neutral-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">You're Enrolled in All Available Paths</h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                You've enrolled in all available learning pathways. Check back later for new pathways.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default LearningPaths;
