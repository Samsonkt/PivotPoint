import React from "react";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  type: "line" | "bar" | "pie" | "doughnut";
  data: ChartData<any, any, any>;
  options?: ChartOptions<any>;
  height?: number;
  width?: number;
  className?: string;
}

export function Chart({ type, data, options, height, width, className }: ChartProps) {
  const chartOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: true,
    ...options,
  };

  const renderChart = () => {
    switch (type) {
      case "line":
        return <Line data={data} options={chartOptions} height={height} width={width} />;
      case "bar":
        return <Bar data={data} options={chartOptions} height={height} width={width} />;
      case "pie":
        return <Pie data={data} options={chartOptions} height={height} width={width} />;
      case "doughnut":
        return <Doughnut data={data} options={chartOptions} height={height} width={width} />;
      default:
        return <Line data={data} options={chartOptions} height={height} width={width} />;
    }
  };

  return (
    <div className={className}>
      {renderChart()}
    </div>
  );
}

export default Chart;
