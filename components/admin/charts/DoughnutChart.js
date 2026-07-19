'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = ['#2a78d6', '#4F6F52', '#eda100', '#e87ba4', '#1baf7a', '#9085e9', '#e34948', '#1F3A5F'];

export default function DoughnutChart({ data, emptyLabel = 'Aucune donnée' }) {
  if (!data || data.length === 0 || data.every((d) => d.value === 0)) {
    return <p className="text-sm text-gray-500">{emptyLabel}</p>;
  }

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.value),
        backgroundColor: data.map((_, i) => PALETTE[i % PALETTE.length]),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          padding: 14,
          font: { size: 12 },
          color: '#2D2D2D'
        }
      },
      tooltip: {
        backgroundColor: '#2D2D2D',
        padding: 10,
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total ? Math.round((ctx.parsed / total) * 100) : 0;
            return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="h-72">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
