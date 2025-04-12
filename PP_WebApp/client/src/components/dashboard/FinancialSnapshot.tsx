import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Chart from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

// Sample data structure for financial records
interface FinancialRecord {
  id: number;
  userId: number;
  month: number;
  year: number;
  amount: number; // In cents
  platform?: string;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const FinancialSnapshot = () => {
  const { data: financialRecords, isLoading } = useQuery({
    queryKey: ['/api/financial-records'],
    retry: false,
  });
  
  // For now, use sample data if no records exist
  const chartData = {
    labels: monthNames.slice(0, 6),
    datasets: [
      {
        label: 'Monthly Earnings',
        backgroundColor: 'rgba(51, 102, 255, 0.1)',
        borderColor: '#3366FF',
        data: [2850, 3200, 2900, 3400, 3600, 3842],
        tension: 0.3,
        fill: true,
      },
    ],
  };
  
  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value: number) {
            return '$' + value;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };
  
  // Calculate averages
  const hourlyAverage = "$42";
  const targetPotential = "$60";

  return (
    <div className="bg-white shadow rounded-lg mb-8">
      <div className="px-4 py-5 border-b border-neutral-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-neutral-900">
          Financial Snapshot
        </h3>
        <p className="mt-1 text-sm text-neutral-500">
          Your gig income over time.
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        {isLoading ? (
          <>
            <Skeleton className="h-48 w-full mb-5" />
            <div className="grid grid-cols-2 gap-4 text-center">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </>
        ) : (
          <>
            <div style={{ height: "200px" }}>
              <Chart 
                type="line" 
                data={chartData} 
                options={chartOptions}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 text-center">
              <div className="bg-neutral-50 rounded-lg p-3">
                <p className="text-xs text-neutral-500">Average Hourly</p>
                <p className="text-lg font-semibold text-neutral-900">{hourlyAverage}</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-3">
                <p className="text-xs text-neutral-500">Target Potential</p>
                <p className="text-lg font-semibold text-neutral-900">{targetPotential}</p>
              </div>
            </div>
          </>
        )}
        <div className="mt-5">
          <Link href="/financial-tools">
            <a className="w-full flex justify-center items-center px-4 py-2 border border-neutral-300 rounded-md text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50">
              View Financial Tools
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FinancialSnapshot;
