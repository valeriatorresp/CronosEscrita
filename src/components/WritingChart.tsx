import React, { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { WritingSession } from '../types';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WritingChartProps {
  sessions: WritingSession[];
  goal: number;
  challengeDays: number;
  startDate: string;
  isDarkMode?: boolean;
}

export const WritingChart: React.FC<WritingChartProps> = ({
  sessions,
  goal,
  challengeDays = 30,
  startDate,
  isDarkMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy prior chart instance if any
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const start = new Date(startDate ? `${startDate}T00:00:00` : new Date());
    const daysCount = Math.max(15, Math.min(60, challengeDays || 30));

    const labels: string[] = [];
    const idealPaceData: number[] = [];
    const realCumulativeData: (number | null)[] = [];

    // Calculate daily cumulative sums
    const sessionsByDate: Record<string, number> = {};
    sessions.forEach((s) => {
      sessionsByDate[s.date] = (sessionsByDate[s.date] || 0) + s.words;
    });

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    let cumulative = 0;
    let hasReachedToday = false;

    for (let i = 1; i <= daysCount; i++) {
      labels.push(`Dia ${i}`);

      // Ideal pace line: straight line from 0 to goal
      const ideal = Math.round((goal / daysCount) * i);
      idealPaceData.push(ideal);

      // Date corresponding to this day
      const d = new Date(start);
      d.setDate(start.getDate() + (i - 1));
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;

      // Check if day is past or present
      if (!hasReachedToday) {
        const wordsOnDay = sessionsByDate[dStr] || 0;
        cumulative += wordsOnDay;
        realCumulativeData.push(cumulative);

        if (dStr === todayStr || d > now) {
          hasReachedToday = true;
        }
      } else {
        realCumulativeData.push(null);
      }
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Create rose gradient for area under the real progress line
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    if (isDarkMode) {
      gradient.addColorStop(0, 'rgba(244, 114, 182, 0.28)');
      gradient.addColorStop(0.6, 'rgba(244, 114, 182, 0.08)');
      gradient.addColorStop(1, 'rgba(244, 114, 182, 0.0)');
    } else {
      gradient.addColorStop(0, 'rgba(184, 50, 128, 0.22)');
      gradient.addColorStop(0.6, 'rgba(184, 50, 128, 0.06)');
      gradient.addColorStop(1, 'rgba(184, 50, 128, 0.0)');
    }

    const legendColor = isDarkMode ? '#f7f2fc' : '#220d3a';
    const gridColor = isDarkMode ? 'rgba(45, 27, 66, 0.7)' : 'rgba(235, 223, 242, 0.8)';
    const tickColor = isDarkMode ? '#c4b3d8' : '#5c4672';

    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `Ritmo Ideal (${new Intl.NumberFormat('pt-BR').format(goal)} pal.)`,
            data: idealPaceData,
            borderColor: isDarkMode ? '#2dd4bf' : '#147d74', // Literary Teal
            borderWidth: 2.5,
            borderDash: [6, 4],
            pointRadius: 0,
            pointHoverRadius: 5,
            pointBackgroundColor: isDarkMode ? '#2dd4bf' : '#147d74',
            tension: 0,
            fill: false,
          },
          {
            label: 'Palavras Escritas',
            data: realCumulativeData,
            borderColor: isDarkMode ? '#f472b6' : '#b83280', // Rose Velvet
            borderWidth: 3.5,
            backgroundColor: gradient,
            pointBackgroundColor: isDarkMode ? '#f472b6' : '#b83280',
            pointBorderColor: isDarkMode ? '#160b24' : '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: isDarkMode ? '#fbcfe8' : '#9d174d',
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 14,
              boxHeight: 14,
              usePointStyle: true,
              pointStyle: 'circle',
              color: legendColor,
              font: {
                family: 'Plus Jakarta Sans',
                weight: 'bold',
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: isDarkMode ? 'rgba(22, 11, 36, 0.96)' : 'rgba(34, 13, 58, 0.96)',
            titleColor: '#ffffff',
            bodyColor: '#f7f2fc',
            borderColor: isDarkMode ? '#2d1b42' : '#ebdff2',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: (context) => {
                const val = context.parsed.y;
                const formatted = new Intl.NumberFormat('pt-BR').format(val || 0);
                return ` ${context.dataset.label}: ${formatted} palavras`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: gridColor,
            },
            ticks: {
              color: tickColor,
              font: {
                family: 'Plus Jakarta Sans',
                size: 11,
                weight: 'bold',
              },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 10,
            },
          },
          y: {
            beginAtZero: true,
            max: Math.max(goal, cumulative + 2000),
            grid: {
              color: gridColor,
            },
            ticks: {
              color: tickColor,
              font: {
                family: 'Plus Jakarta Sans',
                size: 11,
              },
              callback: (value) => {
                const num = Number(value);
                return num >= 1000 ? `${num / 1000}k` : num;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [sessions, goal, challengeDays, startDate, isDarkMode]);

  return (
    <div className="w-full h-80 relative">
      <canvas ref={canvasRef} />
    </div>
  );
};
