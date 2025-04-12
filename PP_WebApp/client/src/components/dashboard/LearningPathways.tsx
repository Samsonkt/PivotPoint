import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";
import SkillsList from "@/components/skills/SkillsList";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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

const CourseItem = ({ course, status }: { course: Course; status: string }) => {
  let statusIcon, statusColor, statusText;
  
  if (status === "completed") {
    statusIcon = "fas fa-check";
    statusColor = "bg-success bg-opacity-10 text-success";
    statusText = "Completed";
  } else if (status === "in_progress") {
    statusIcon = "fas fa-clock";
    statusColor = "bg-accent bg-opacity-10 text-accent";
    statusText = "In progress";
  } else {
    statusIcon = "fas fa-lock";
    statusColor = "bg-neutral-200 text-neutral-400";
    statusText = "Locked";
  }
  
  const progress = status === "completed" ? 100 : status === "in_progress" ? 40 : 0;
  
  return (
    <div className="bg-neutral-50 rounded-lg p-4 hover:bg-neutral-100">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className={`h-8 w-8 rounded ${statusColor} flex items-center justify-center`}>
            <i className={statusIcon}></i>
          </div>
          <div className="ml-3">
            <h5 className="text-sm font-medium">{course.title}</h5>
            <p className="text-xs text-neutral-500">{statusText}</p>
          </div>
        </div>
        <span className="text-xs text-success font-medium">{progress}%</span>
      </div>
    </div>
  );
};

const RecommendedPathCard = ({ path, skills }: { path: LearningPath; skills: Skill[] }) => {
  const pathSkills = skills.filter(skill => 
    (path.skillsTargeted as number[]).includes(skill.id)
  );
  
  let iconClass;
  let iconBgColor, iconTextColor, skillsBgColor, skillsTextColor;
  
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
    <div className="border border-neutral-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-center mb-3">
          <div className={`flex-shrink-0 h-10 w-10 rounded ${iconBgColor} flex items-center justify-center ${iconTextColor}`}>
            <i className={iconClass}></i>
          </div>
          <div className="ml-3">
            <h5 className="text-sm font-medium">{path.title}</h5>
            <p className="text-xs text-neutral-500">{path.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {pathSkills.map(skill => (
            <span key={skill.id} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${skillsBgColor} ${skillsTextColor}`}>
              {skill.name}
            </span>
          ))}
        </div>
        <div className="text-sm">
          <p>{path.courseCount} courses • Approx. {path.estimatedHours} hours</p>
        </div>
      </div>
      <div className="border-t border-neutral-200 p-4 bg-neutral-50">
        <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-primary text-sm font-medium rounded-md text-primary hover:bg-primary-light">
          Start Pathway
        </button>
      </div>
    </div>
  );
};

const LearningPathways = () => {
  const { data: userPaths, isLoading: isUserPathsLoading } = useQuery({
    queryKey: ['/api/user-paths'],
    retry: false,
  });

  const { data: paths, isLoading: isPathsLoading } = useQuery({
    queryKey: ['/api/learning-paths'],
    retry: false,
  });

  const { data: courses, isLoading: isCoursesLoading } = useQuery({
    queryKey: userPaths && userPaths.length > 0 
      ? [`/api/learning-paths/${userPaths[0].pathId}/courses`] 
      : null,
    enabled: !!userPaths && userPaths.length > 0,
    retry: false,
  });

  const { data: skills, isLoading: isSkillsLoading } = useQuery({
    queryKey: ['/api/skills'],
    retry: false,
  });

  const isLoading = isUserPathsLoading || isPathsLoading || isCoursesLoading || isSkillsLoading;
  
  // Current active path
  const currentPath = userPaths?.length > 0 ? userPaths[0] : null;
  
  // Filter out the current path from recommended paths
  const recommendedPaths = paths?.filter(path => 
    !currentPath || path.id !== currentPath.path.id
  ).slice(0, 2);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-neutral-900">
            Your Learning Pathways
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-light text-accent">
            Personalized for you
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Focused skill development based on your career goals.
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {isLoading ? (
          <>
            {/* Loading state for current pathway */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
              <div className="mt-4">
                <Skeleton className="h-9 w-32 rounded-md" />
              </div>
            </div>
            
            {/* Loading state for recommended pathways */}
            <div>
              <Skeleton className="h-5 w-48 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Current Pathway */}
            {currentPath && courses && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-base font-medium text-neutral-900">{currentPath.path.title}</h4>
                  <span className="text-sm text-neutral-500">{currentPath.progress}% Complete</span>
                </div>
                <Progress value={currentPath.progress} className="mb-4" />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course) => (
                    <CourseItem 
                      key={course.id} 
                      course={course}
                      status={course.status}
                    />
                  ))}
                </div>
                <div className="mt-4 flex">
                  <Link href="/learning-paths">
                    <Button className="bg-accent hover:bg-accent-dark">
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            
            {/* Recommended Pathways */}
            {recommendedPaths && recommendedPaths.length > 0 && skills && (
              <div>
                <h4 className="text-base font-medium text-neutral-900 mb-4">Recommended Pathways</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedPaths.map(path => (
                    <RecommendedPathCard key={path.id} path={path} skills={skills} />
                  ))}
                </div>
              </div>
            )}
            
            {/* No pathways state */}
            {(!currentPath && (!recommendedPaths || recommendedPaths.length === 0)) && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                  <i className="fas fa-graduation-cap text-neutral-400 text-2xl"></i>
                </div>
                <h4 className="text-lg font-medium text-neutral-900 mb-2">No Learning Pathways Yet</h4>
                <p className="text-neutral-500 mb-4">Start your learning journey by exploring available pathways.</p>
                <Link href="/learning-paths">
                  <Button>Explore Learning Pathways</Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LearningPathways;
