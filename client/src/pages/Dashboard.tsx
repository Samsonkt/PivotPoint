import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import QuickStats from "@/components/dashboard/QuickStats";
import AdjacentGigsSection from "@/components/dashboard/AdjacentGigsSection";
import LearningPathways from "@/components/dashboard/LearningPathways";
import SkillsInventory from "@/components/dashboard/SkillsInventory";
import FinancialSnapshot from "@/components/dashboard/FinancialSnapshot";
import CommunityUpdates from "@/components/dashboard/CommunityUpdates";

const Dashboard = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="pb-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
              {isLoading ? (
                <div className="h-9 w-64 bg-neutral-200 animate-pulse rounded"></div>
              ) : (
                `Welcome back, ${user?.firstName || user?.username}!`
              )}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Your career pivot journey is making progress. Here's your dashboard.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link href="/skills-assessment">
              <Button>Take Skills Assessment</Button>
            </Link>
          </div>
        </div>
      </div>

      <QuickStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AdjacentGigsSection />
          <LearningPathways />
        </div>

        <div className="lg:col-span-1">
          <SkillsInventory />
          <FinancialSnapshot />
          <CommunityUpdates />
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
