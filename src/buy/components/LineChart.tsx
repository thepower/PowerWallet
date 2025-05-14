// import {
//   Chart as ChartJS,
//   TimeScale,
//   LinearScale,
//   LineController,
//   PointElement,
//   LineElement,
//   Tooltip
// } from 'chart.js';
import { Chart as ChartJS, registerables } from 'chart.js';

import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

export type TimeSeriesData = [number, number];

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  title?: string;
}
// ChartJS.register(
//   TimeScale,
//   LinearScale,
//   LineController,
//   PointElement,
//   LineElement,
//   Tooltip
// );
ChartJS.register(...registerables);

export const LineChart: React.FC<TimeSeriesChartProps> = ({ data }) => {
  const timestamps = data.map((entry) => new Date(entry[0] * 1000));
  const prices = data.map((entry) => entry[1]);

  const chartData = {
    labels: timestamps,
    datasets: [
      {
        data: prices,
        borderColor: '#0009F6',
        backgroundColor: '#0009F6',
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 1,
        pointHoverRadius: 5
      }
    ]
  };

  return (
    <Chart
      type='line'
      data={chartData}
      options={{
        elements: {
          line: { stepped: true }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'minute', // Adjust based on your data granularity
              displayFormats: {
                minute: 'MMM d, HH:mm'
              }
            },
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Price'
            },
            beginAtZero: false // Prices typically don't start at zero
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }}
    />
  );
};
