import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import SkillsList from "@/components/skills/SkillsList";
import { Skeleton } from "@/components/ui/skeleton";

interface Gig {
  id: number;
  title: string;
  description: string;
  hourlyRateMin: number;
  hourlyRateMax: number;
  locationType: string;
  skillsRequired: number[];
}

interface Skill {
  id: number;
  name: string;
  category: string;
  description?: string;
}

const GigItem = ({ gig, skills }: { gig: Gig; skills: Skill[] }) => {
  const matchingSkills = skills.filter(skill => 
    (gig.skillsRequired as number[]).includes(skill.id)
  );
  
  // Split skills into user has and user needs
  const userHasSkills = matchingSkills.slice(0, 2); // First 2 are skills the user has
  const userNeedsSkills = matchingSkills.length > 2 ? [matchingSkills[2]] : []; // Next one is a skill to learn
  
  // Calculate match percentage based on number of matching skills
  const matchPercentage = Math.round((userHasSkills.length / matchingSkills.length) * 100);
  
  let iconClass;
  if (gig.title.toLowerCase().includes('content') || gig.title.toLowerCase().includes('writer')) {
    iconClass = "fas fa-pen-fancy";
  } else if (gig.title.toLowerCase().includes('developer') || gig.title.toLowerCase().includes('front-end')) {
    iconClass = "fas fa-laptop-code";
  } else if (gig.title.toLowerCase().includes('marketing')) {
    iconClass = "fas fa-bullhorn";
  } else {
    iconClass = "fas fa-briefcase";
  }
  
  return (
    <li>
      <div className="px-4 py-4 sm:px-6 hover:bg-neutral-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded bg-neutral-100 flex items-center justify-center text-neutral-500">
              <i className={iconClass}></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-900 truncate">{gig.title}</p>
              <p className="text-sm text-neutral-500">${gig.hourlyRateMin}-{gig.hourlyRateMax}/hr • {gig.locationType}</p>
            </div>
          </div>
          <div className="ml-2 flex-shrink-0 flex">
            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success bg-opacity-10 text-success">
              {matchPercentage}% Match
            </p>
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-neutral-500">
              <i className="fas fa-check-circle text-success flex-shrink-0 mr-1.5"></i>
              Matches {userHasSkills.length} of your skills
            </p>
          </div>
          <div className="mt-2 flex items-center text-sm text-neutral-500 sm:mt-0">
            <div className="flex flex-wrap gap-1">
              {userHasSkills.map(skill => (
                <span key={skill.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary">
                  {skill.name}
                </span>
              ))}
              {userNeedsSkills.map(skill => (
                <span key={skill.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

const AdjacentGigsSection = () => {
  const { data: gigs, isLoading: isGigsLoading } = useQuery({
    queryKey: ['/api/adjacent-gigs'],
    retry: false,
  });

  const { data: skills, isLoading: isSkillsLoading } = useQuery({
    queryKey: ['/api/skills'],
    retry: false,
  });

  const isLoading = isGigsLoading || isSkillsLoading;

  return (
    <div className="bg-white shadow rounded-lg mb-8">
      <div className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-neutral-900">
            Recommended Adjacent Gigs
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-light text-secondary">
            Based on your skills
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          These opportunities match your existing skills with minimal learning curve.
        </p>
      </div>
      
      {isLoading ? (
        <div className="divide-y divide-neutral-200">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-4 py-4 sm:px-6">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="ml-4 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="sm:flex sm:justify-between">
                  <Skeleton className="h-4 w-32" />
                  <div className="mt-2 sm:mt-0">
                    <div className="flex gap-1">
                      <Skeleton className="h-4 w-20 rounded-full" />
                      <Skeleton className="h-4 w-20 rounded-full" />
                      <Skeleton className="h-4 w-20 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <ul className="divide-y divide-neutral-200">
            {gigs && skills && gigs.slice(0, 3).map((gig) => (
              <GigItem key={gig.id} gig={gig} skills={skills} />
            ))}
          </ul>
          <div className="bg-neutral-50 px-4 py-4 sm:px-6 rounded-b-lg">
            <Link href="/adjacent-gigs">
              <a className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary bg-white hover:bg-neutral-100">
                View all adjacent gig opportunities
              </a>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default AdjacentGigsSection;
