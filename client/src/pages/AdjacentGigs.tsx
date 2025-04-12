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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface UserSkill {
  id: number;
  userId: number;
  skillId: number;
  proficiencyLevel: number;
  skill: Skill;
}

const GigCard = ({ gig, skills, userSkills }: { gig: Gig; skills: Skill[]; userSkills: UserSkill[] }) => {
  // Find skills required for this gig
  const gigSkills = skills.filter(skill => 
    (gig.skillsRequired as number[]).includes(skill.id)
  );
  
  // Find which of user's skills match this gig
  const matchingSkills = gigSkills.filter(skill => 
    userSkills.some(us => us.skillId === skill.id)
  );
  
  // Skills the user needs to learn
  const skillsToLearn = gigSkills.filter(skill => 
    !userSkills.some(us => us.skillId === skill.id)
  );
  
  // Calculate match percentage based on number of matching skills
  const matchPercentage = Math.round((matchingSkills.length / gigSkills.length) * 100);
  
  // Determine icon based on gig title
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 rounded bg-neutral-100 flex items-center justify-center text-neutral-500">
              <i className={iconClass}></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-neutral-900">{gig.title}</h3>
              <p className="text-sm text-neutral-500">${gig.hourlyRateMin}-{gig.hourlyRateMax}/hr • {gig.locationType}</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-success bg-opacity-10 text-success">
              {matchPercentage}% Match
            </span>
          </div>
        </div>
        
        <p className="mt-4 text-sm text-neutral-600">{gig.description}</p>
        
        <div className="mt-4 space-y-3">
          <div className="flex items-center text-sm text-neutral-600">
            <i className="fas fa-check-circle text-success flex-shrink-0 mr-2"></i>
            <span>Matches {matchingSkills.length} of your skills</span>
          </div>
          
          {skillsToLearn.length > 0 && (
            <div className="flex items-center text-sm text-neutral-600">
              <i className="fas fa-graduation-cap text-accent flex-shrink-0 mr-2"></i>
              <span>Learn {skillsToLearn.length} new skills to improve match</span>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-2">Required Skills:</h4>
          <div className="flex flex-wrap gap-1.5">
            {matchingSkills.map(skill => (
              <span key={skill.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary">
                {skill.name}
              </span>
            ))}
            {skillsToLearn.map(skill => (
              <span key={skill.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-neutral-50 px-6 py-4">
        <div className="flex space-x-3">
          <Button variant="outline">View Details</Button>
          <Button>Apply Now</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const AdjacentGigs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  const { data: gigs, isLoading: isGigsLoading } = useQuery({
    queryKey: ['/api/adjacent-gigs'],
    retry: false,
  });

  const { data: skills, isLoading: isSkillsLoading } = useQuery({
    queryKey: ['/api/skills'],
    retry: false,
  });
  
  const { data: userSkills, isLoading: isUserSkillsLoading } = useQuery({
    queryKey: ['/api/user-skills'],
    retry: false,
  });

  const isLoading = isGigsLoading || isSkillsLoading || isUserSkillsLoading;
  
  // Filter gigs based on search term and filter type
  const filteredGigs = gigs 
    ? gigs.filter(gig => {
        const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             gig.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterType === "all") return matchesSearch;
        if (filterType === "remote") return matchesSearch && gig.locationType === "Remote";
        if (filterType === "hybrid") return matchesSearch && gig.locationType === "Hybrid";
        if (filterType === "onsite") return matchesSearch && gig.locationType === "On-site";
        
        return matchesSearch;
      })
    : [];
  
  // Sort by match percentage (higher first)
  const sortedGigs = filteredGigs.sort((a, b) => {
    if (!userSkills || !skills) return 0;
    
    const aSkills = skills.filter(skill => (a.skillsRequired as number[]).includes(skill.id));
    const bSkills = skills.filter(skill => (b.skillsRequired as number[]).includes(skill.id));
    
    const aMatches = aSkills.filter(skill => userSkills.some(us => us.skillId === skill.id));
    const bMatches = bSkills.filter(skill => userSkills.some(us => us.skillId === skill.id));
    
    const aPercentage = aMatches.length / aSkills.length;
    const bPercentage = bMatches.length / bSkills.length;
    
    return bPercentage - aPercentage;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl mb-2">
          Adjacent Gig Opportunities
        </h1>
        <p className="text-neutral-500">
          Discover gigs that leverage your existing skills with minimal new learning.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-1">
              Search Opportunities
            </label>
            <Input
              type="text"
              id="search"
              placeholder="Search by title or keywords"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="filter" className="block text-sm font-medium text-neutral-700 mb-1">
              Location Type
            </label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="recommended" className="mb-6">
        <TabsList>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="new">Newest</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommended" className="space-y-6 mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex items-center">
                        <Skeleton className="h-12 w-12 rounded" />
                        <div className="ml-4 space-y-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex flex-wrap gap-1.5">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-14 rounded-full" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-neutral-50 px-6 py-4">
                    <div className="flex space-x-3">
                      <Skeleton className="h-9 w-24 rounded" />
                      <Skeleton className="h-9 w-24 rounded" />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : sortedGigs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {sortedGigs.map((gig) => (
                <GigCard 
                  key={gig.id} 
                  gig={gig} 
                  skills={skills || []} 
                  userSkills={userSkills || []} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                <i className="fas fa-search text-neutral-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No gigs found</h3>
              <p className="text-neutral-500 max-w-md mx-auto">
                We couldn't find any gigs matching your criteria. Try adjusting your search or filters.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="trending" className="space-y-6 mt-6">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
              <i className="fas fa-chart-line text-neutral-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Trending Opportunities</h3>
            <p className="text-neutral-500 max-w-md mx-auto">
              Trending gigs will be available soon. Check back later for updates.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="new" className="space-y-6 mt-6">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
              <i className="fas fa-sparkles text-neutral-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">New Opportunities</h3>
            <p className="text-neutral-500 max-w-md mx-auto">
              New gigs will be available soon. Check back later for updates.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default AdjacentGigs;
