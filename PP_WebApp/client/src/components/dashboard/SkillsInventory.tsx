import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface UserSkill {
  id: number;
  userId: number;
  skillId: number;
  proficiencyLevel: number;
  skill: {
    id: number;
    name: string;
    category: string;
    description?: string;
  };
}

const SkillBar = ({ skill, proficiencyLevel }: { skill: string; proficiencyLevel: number }) => {
  let barColor = "bg-neutral-300";
  if (proficiencyLevel >= 75) {
    barColor = "bg-primary";
  } else if (proficiencyLevel >= 40) {
    barColor = "bg-secondary";
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{skill}</span>
      <div className="w-32 bg-neutral-200 rounded-full h-2">
        <div className={`${barColor} h-2 rounded-full`} style={{ width: `${proficiencyLevel}%` }}></div>
      </div>
    </div>
  );
};

const SkillsInventory = () => {
  const { data: userSkills, isLoading } = useQuery({
    queryKey: ['/api/user-skills'],
    retry: false,
  });

  // Sort skills by proficiency level (highest first)
  const sortedSkills = userSkills 
    ? [...userSkills].sort((a, b) => b.proficiencyLevel - a.proficiencyLevel)
    : [];

  return (
    <div className="bg-white shadow rounded-lg mb-8">
      <div className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-neutral-900">
          Your Skills Inventory
        </h3>
        <p className="mt-1 text-sm text-neutral-500">
          Skills that power your career transitions.
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-neutral-900">Proficiency Level</h4>
          <div className="flex items-center text-xs">
            <span className="h-3 w-3 bg-primary rounded-full"></span>
            <span className="ml-1 text-neutral-500">Expert</span>
            <span className="ml-2 h-3 w-3 bg-secondary rounded-full"></span>
            <span className="ml-1 text-neutral-500">Intermediate</span>
            <span className="ml-2 h-3 w-3 bg-neutral-300 rounded-full"></span>
            <span className="ml-1 text-neutral-500">Beginner</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="w-32 h-2 rounded-full" />
              </div>
            ))}
          </div>
        ) : sortedSkills.length > 0 ? (
          <div className="space-y-3">
            {sortedSkills.map((userSkill) => (
              <SkillBar 
                key={userSkill.id}
                skill={userSkill.skill.name}
                proficiencyLevel={userSkill.proficiencyLevel}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-neutral-500 text-sm mb-4">You haven't added any skills yet.</p>
          </div>
        )}
        
        <div className="mt-5">
          <Link href="/skills-assessment">
            <a className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark">
              {sortedSkills.length > 0 ? "Update Skills Assessment" : "Take Skills Assessment"}
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SkillsInventory;
