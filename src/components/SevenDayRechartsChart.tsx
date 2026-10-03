import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { WritingSession } from '../types';

interface SevenDayRechartsChartProps {
  sessions: WritingSession[];
  isDarkMode?: boolean;
}

export const SevenDayRechartsChart: React.FC<SevenDayRechartsChartProps> = ({
  sessions,
  isDarkMode = false,
}) => {
  // Generate the last 7 days including today
  const data = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx)); // from 6 days ago until today
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;

    const label = d.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

    // Sessions for this specific date
    const daySessions = sessions.filter((s) => s.date === dStr);
    const dayWords = daySessions.reduce((sum, s) => sum + s.words, 0);

    return {
      dateStr: dStr,
      label: label.replace(/^\w/, (c) => c.toUpperCase()), // capitalize first letter
      'Palavras no Dia': dayWords,
      // We will fill the cumulative progress next
      'Progresso Acumulado': 0,
    };
  });

  // Calculate cumulative progress up to each of the 7 days
  // First, we need the historical sum of all words before the 7-day window
  const firstDayStr = data[0].dateStr;
  const initialAccumulatedWords = sessions
    .filter((s) => s.date < firstDayStr)
    .reduce((sum, s) => sum + s.words, 0);

  let runningTotal = initialAccumulatedWords;
  data.forEach((day) => {
    runningTotal += day['Palavras no Dia'];
    day['Progresso Acumulado'] = runningTotal;
  });

  // Custom styling based on standardized theme
  const gridColor = isDarkMode ? '#2d1b42' : '#ebdff2';
  const textStyles = {
    fill: isDarkMode ? '#c4b3d8' : '#5c4672',
    fontSize: 11,
    fontWeight: 600,
  };

  return (
    <div className="w-full h-[280px] sm:h-[320px] transition-all duration-300">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.7} />
          <XAxis
            dataKey="label"
            stroke={isDarkMode ? '#372052' : '#ebdff2'}
            tick={textStyles}
            tickLine={false}
          />
          <YAxis
            stroke={isDarkMode ? '#372052' : '#ebdff2'}
            tick={textStyles}
            tickLine={false}
            width={55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDarkMode ? '#160b24' : '#ffffff',
              borderColor: isDarkMode ? '#2d1b42' : '#ebdff2',
              borderRadius: '16px',
              color: isDarkMode ? '#f7f2fc' : '#220d3a',
              fontFamily: 'inherit',
              fontSize: '12px',
              fontWeight: '600',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '15px',
              fontSize: '12px',
              fontWeight: '600',
            }}
          />
          <Line
            name="Palavras no Dia"
            type="monotone"
            dataKey="Palavras no Dia"
            stroke={isDarkMode ? '#2dd4bf' : '#147d74'}
            strokeWidth={2.5}
            activeDot={{ r: 6 }}
            dot={{ r: 4 }}
          />
          <Line
            name="Progresso Acumulado"
            type="monotone"
            dataKey="Progresso Acumulado"
            stroke={isDarkMode ? '#f472b6' : '#b83280'}
            strokeWidth={3}
            activeDot={{ r: 7 }}
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
