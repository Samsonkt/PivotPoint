import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface StatCardProps {
  icon: string;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value: string | number;
  change?: { value: string | number; positive: boolean } | null;
  linkText: string;
  linkHref: string;
}

const StatCard = ({
  icon,
  iconBgColor,
  iconColor,
  title,
  value,
  change = null,
  linkText,
  linkHref,
}: StatCardProps) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3`}>
            <i className={`${icon} ${iconColor}`}></i>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-neutral-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-neutral-900">
                  {value}
                </div>
                {change && (
                  <p className={`ml-2 flex items-baseline text-sm font-semibold ${change.positive ? 'text-success' : 'text-error'}`}>
                    <i className={`fas fa-arrow-${change.positive ? 'up' : 'down'}`}></i>
                    <span className="sr-only">{change.positive ? 'Increased' : 'Decreased'} by</span>
                    {change.value}
                  </p>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-neutral-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <Link href={linkHref}>
            <a className="font-medium text-primary hover:text-primary-dark">
              {linkText} <span aria-hidden="true">&rarr;</span>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

const QuickStats = () => {
  const { data: userSkills, isLoading: isSkillsLoading } = useQuery({
    queryKey: ['/api/user-skills'],
    retry: false,
  });

  const { data: adjacentGigs, isLoading: isGigsLoading } = useQuery({
    queryKey: ['/api/adjacent-gigs'],
    retry: false,
  });

  const { data: userPaths, isLoading: isPathsLoading } = useQuery({
    queryKey: ['/api/user-paths'],
    retry: false,
  });

  // A placeholder for financial data functionality
  const financialData = {
    monthlyEarnings: "$3,842",
    change: { value: "12%", positive: true }
  };

  if (isSkillsLoading || isGigsLoading || isPathsLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="animate-pulse flex items-center">
                <div className="flex-shrink-0 bg-neutral-200 rounded-md h-12 w-12"></div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-5 bg-neutral-200 rounded w-20 mb-2"></div>
                  <div className="h-7 bg-neutral-200 rounded w-16"></div>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 px-4 py-4 sm:px-6">
              <div className="animate-pulse h-5 bg-neutral-200 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Get the main current learning path, if any
  const currentPath = userPaths?.length > 0 ? userPaths[0] : null;
  const learningProgress = currentPath ? `${currentPath.progress}%` : "0%";

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <StatCard
        icon="fas fa-tools"
        iconBgColor="bg-primary-light"
        iconColor="text-primary"
        title="Current Skills"
        value={userSkills?.length || 0}
        linkText="Manage skills"
        linkHref="/skills-assessment"
      />

      <StatCard
        icon="fas fa-briefcase"
        iconBgColor="bg-secondary-light"
        iconColor="text-secondary"
        title="Adjacent Gigs"
        value={adjacentGigs?.length || 0}
        change={adjacentGigs?.length ? { value: "3", positive: true } : null}
        linkText="View matches"
        linkHref="/adjacent-gigs"
      />

      <StatCard
        icon="fas fa-graduation-cap"
        iconBgColor="bg-accent-light"
        iconColor="text-accent"
        title="Learning Progress"
        value={learningProgress}
        linkText="Continue learning"
        linkHref="/learning-paths"
      />

      <StatCard
        icon="fas fa-dollar-sign"
        iconBgColor="bg-primary-light"
        iconColor="text-primary"
        title="Monthly Earnings"
        value={financialData.monthlyEarnings}
        change={financialData.change}
        linkText="View finances"
        linkHref="/financial-tools"
      />
    </div>
  );
};

export default QuickStats;
