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
import Chart from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

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

const FinancialDashboard = () => {
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
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
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
  
  const platformData = {
    labels: ['Upwork', 'Fiverr', 'Freelancer', 'Direct Clients'],
    datasets: [
      {
        data: [40, 25, 15, 20],
        backgroundColor: ['#3366FF', '#00B27A', '#FF6B35', '#8884d8'],
        borderColor: ['#3366FF', '#00B27A', '#FF6B35', '#8884d8'],
        borderWidth: 1,
      },
    ],
  };
  
  const platformChartOptions = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed + '%';
            }
            return label;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };
  
  // Calculate metrics
  const hourlyAverage = "$42";
  const targetPotential = "$60";
  const monthlyAverage = "$3,340";
  const projectedAnnual = "$40,080";

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-light rounded-md p-3">
                <i className="fas fa-dollar-sign text-primary"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-500">Average Hourly Rate</p>
                <p className="text-xl font-semibold text-neutral-900">{hourlyAverage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-secondary-light rounded-md p-3">
                <i className="fas fa-arrow-trend-up text-secondary"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-500">Target Hourly Rate</p>
                <p className="text-xl font-semibold text-neutral-900">{targetPotential}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-accent-light rounded-md p-3">
                <i className="fas fa-calendar-check text-accent"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-500">Monthly Average</p>
                <p className="text-xl font-semibold text-neutral-900">{monthlyAverage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-light rounded-md p-3">
                <i className="fas fa-chart-pie text-primary"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-neutral-500">Projected Annual</p>
                <p className="text-xl font-semibold text-neutral-900">{projectedAnnual}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Earnings</CardTitle>
            <CardDescription>Your income trend over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div style={{ height: "300px" }}>
                <Chart 
                  type="line" 
                  data={chartData} 
                  options={chartOptions}
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Income Sources</CardTitle>
            <CardDescription>Distribution by platform</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div style={{ height: "300px" }}>
                <Chart 
                  type="doughnut" 
                  data={platformData} 
                  options={platformChartOptions}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const IncomeTracker = () => {
  const [month, setMonth] = useState(new Date().getMonth().toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [amount, setAmount] = useState("");
  const [platform, setPlatform] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement recording income
    console.log({ month, year, amount, platform });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Record Income</CardTitle>
          <CardDescription>Track your earnings across different platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Month</label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((name, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Year</label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(5)].map((_, i) => {
                      const yearValue = (new Date().getFullYear() - i).toString();
                      return (
                        <SelectItem key={i} value={yearValue}>
                          {yearValue}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Amount ($)</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Platform</label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upwork">Upwork</SelectItem>
                    <SelectItem value="fiverr">Fiverr</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="direct">Direct Client</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button type="submit" className="w-full">Record Income</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Income Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Date</th>
                  <th className="text-left py-3 px-2 font-medium">Platform</th>
                  <th className="text-right py-3 px-2 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-2">{format(new Date(2023, 5, 15), 'MMM dd, yyyy')}</td>
                  <td className="py-3 px-2">Upwork</td>
                  <td className="py-3 px-2 text-right">$650.00</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2">{format(new Date(2023, 5, 10), 'MMM dd, yyyy')}</td>
                  <td className="py-3 px-2">Fiverr</td>
                  <td className="py-3 px-2 text-right">$320.00</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2">{format(new Date(2023, 5, 5), 'MMM dd, yyyy')}</td>
                  <td className="py-3 px-2">Direct Client</td>
                  <td className="py-3 px-2 text-right">$1,200.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const TaxPlanning = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tax Savings Calculator</CardTitle>
          <CardDescription>Estimate your tax deductions as a gig worker</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Estimated Annual Income</label>
              <Input type="number" placeholder="Enter your estimated annual income" step="100" min="0" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Home Office Deduction</label>
                <span className="text-xs text-neutral-500">$1,200</span>
              </div>
              <Input type="range" min="0" max="5000" step="100" defaultValue="1200" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Equipment & Supplies</label>
                <span className="text-xs text-neutral-500">$800</span>
              </div>
              <Input type="range" min="0" max="3000" step="100" defaultValue="800" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Software Subscriptions</label>
                <span className="text-xs text-neutral-500">$600</span>
              </div>
              <Input type="range" min="0" max="2000" step="100" defaultValue="600" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Professional Development</label>
                <span className="text-xs text-neutral-500">$400</span>
              </div>
              <Input type="range" min="0" max="2000" step="100" defaultValue="400" />
            </div>
            
            <Separator />
            
            <div className="flex justify-between text-sm">
              <span className="font-medium">Total Deductions:</span>
              <span className="font-semibold">$3,000</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="font-medium">Estimated Tax Savings:</span>
              <span className="font-semibold text-success">$750</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Download Tax Summary</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Tax Payment Reminder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900">Q2 2023 Payment</h4>
                  <p className="text-sm text-neutral-500">Due June 15, 2023</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-900">$950</p>
                  <p className="text-xs text-success">Completed</p>
                </div>
              </div>
            </div>
            
            <div className="bg-accent bg-opacity-5 border border-accent p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900">Q3 2023 Payment</h4>
                  <p className="text-sm text-neutral-500">Due September 15, 2023</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-900">$1,050</p>
                  <p className="text-xs text-accent">Upcoming</p>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-neutral-900">Q4 2023 Payment</h4>
                  <p className="text-sm text-neutral-500">Due January 15, 2024</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-900">$1,100</p>
                  <p className="text-xs text-neutral-500">Estimated</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const FinancialTools = () => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl mb-2">
          Financial Tools
        </h1>
        <p className="text-neutral-500">
          Track, optimize, and plan your gig economy finances.
        </p>
      </div>
      
      <Tabs defaultValue="dashboard" className="mb-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="income-tracker">Income Tracker</TabsTrigger>
          <TabsTrigger value="tax-planning">Tax Planning</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <FinancialDashboard />
        </TabsContent>
        
        <TabsContent value="income-tracker" className="mt-6">
          <IncomeTracker />
        </TabsContent>
        
        <TabsContent value="tax-planning" className="mt-6">
          <TaxPlanning />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default FinancialTools;
