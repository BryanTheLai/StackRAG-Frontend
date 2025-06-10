import type { ChartData } from '../types/chart';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area
} from 'recharts';

interface ChartComponentProps {
  data: ChartData;
}

// Chart styling configuration - consider theming these with DaisyUI/Tailwind variables if possible
const CHART_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#A4DE6C', '#D0ED57', '#FFC658'
];

// Basic styling, can be enhanced with Tailwind/DaisyUI theme variables
const CHART_STYLES = {
  tooltip: {
    contentStyle: {
      backgroundColor: 'var(--fallback-b1,oklch(var(--b1)/1))', // Use DaisyUI background
      color: 'var(--fallback-bc,oklch(var(--bc)/1))', // Use DaisyUI text color
      border: '1px solid var(--fallback-b3,oklch(var(--b3)/1))',
      borderRadius: '0.5rem'
    },
    labelStyle: { color: 'var(--fallback-bc,oklch(var(--bc)/1))' },
    itemStyle: { color: 'var(--fallback-bc,oklch(var(--bc)/1))' },
  },
  legend: {
    wrapperStyle: { color: 'var(--fallback-bc,oklch(var(--bc)/1))', paddingTop: '10px' },
  },
  axis: {
    stroke: "var(--fallback-bc,oklch(var(--bc)/0.6))", // Lighter text color for axis lines
    tick: { fill: 'var(--fallback-bc,oklch(var(--bc)/0.8))' }, // Text color for ticks
  },
  grid: {
    strokeDasharray: "3 3",
    stroke: "var(--fallback-b3,oklch(var(--b3)/0.5))", // Use border color for grid
  },
};

const DEFAULT_DATA_KEYS = {
  bar: 'value',
  line: 'value',
  pie: 'value',
  area: 'value',
};

// Helper function to render Bar Chart
const renderBarChartInternal = (chartData: ChartData['data'], dataKeys: ChartData['data_keys']) => (
  <BarChart data={chartData}>
    <CartesianGrid {...CHART_STYLES.grid} />
    <XAxis dataKey="name" {...CHART_STYLES.axis} />
    <YAxis {...CHART_STYLES.axis} />
    <Tooltip {...CHART_STYLES.tooltip} />
    <Legend {...CHART_STYLES.legend} />
    <Bar dataKey={dataKeys?.bar || DEFAULT_DATA_KEYS.bar} fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
  </BarChart>
);

// Helper function to render Line Chart
const renderLineChartInternal = (chartData: ChartData['data'], dataKeys: ChartData['data_keys']) => (
  <LineChart data={chartData}>
    <CartesianGrid {...CHART_STYLES.grid} />
    <XAxis dataKey="name" {...CHART_STYLES.axis} />
    <YAxis {...CHART_STYLES.axis} />
    <Tooltip {...CHART_STYLES.tooltip} />
    <Legend {...CHART_STYLES.legend} />
    <Line type="monotone" dataKey={dataKeys?.line || DEFAULT_DATA_KEYS.line} stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
  </LineChart>
);

// Helper function to render Pie Chart
const renderPieChartInternal = (chartData: ChartData['data'], dataKeys: ChartData['data_keys']) => (
  <PieChart>
    <Tooltip {...CHART_STYLES.tooltip} />
    <Legend {...CHART_STYLES.legend} />
    <Pie
      data={chartData}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
      outerRadius="80%"
      fill={CHART_COLORS[2]}
      dataKey={dataKeys?.pie || DEFAULT_DATA_KEYS.pie}
    >
      {chartData.map((_entry, index) => (
        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
      ))}
    </Pie>
  </PieChart>
);

// Helper function to render Composed Chart
const renderComposedChartInternal = (chartData: ChartData['data'], dataKeys: ChartData['data_keys']) => {
  const barKey = dataKeys?.bar || DEFAULT_DATA_KEYS.bar;
  const lineKey = dataKeys?.line || DEFAULT_DATA_KEYS.line;
  const areaKey = dataKeys?.area || DEFAULT_DATA_KEYS.area;

  const hasDataForKey = (keyToCheck: string) =>
    dataKeys?.[keyToCheck.toLowerCase()] || (chartData.length > 0 && chartData[0]?.[keyToCheck] !== undefined);

  return (
    <ComposedChart data={chartData}>
      <CartesianGrid {...CHART_STYLES.grid} />
      <XAxis dataKey="name" {...CHART_STYLES.axis} />
      <YAxis {...CHART_STYLES.axis} />
      <Tooltip {...CHART_STYLES.tooltip} />
      <Legend {...CHART_STYLES.legend} />
      {hasDataForKey(barKey) &&
        <Bar dataKey={barKey} fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
      }
      {hasDataForKey(lineKey) &&
        <Line type="monotone" dataKey={lineKey} stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      }
      {hasDataForKey(areaKey) &&
        <Area type="monotone" dataKey={areaKey} fill={CHART_COLORS[5]} stroke={CHART_COLORS[5]} fillOpacity={0.6} />
      }
    </ComposedChart>
  );
};

export const ChartComponent: React.FC<ChartComponentProps> = React.memo(({ data }) => {
  const chartRenderers = {
    bar: renderBarChartInternal,
    line: renderLineChartInternal,
    pie: renderPieChartInternal,
    composed: renderComposedChartInternal,
  };

  const renderChart = () => {
    switch (data.type) {
      case 'bar':
        return chartRenderers.bar(data.data, data.data_keys);
      case 'line':
        return chartRenderers.line(data.data, data.data_keys);
      case 'pie':
        return chartRenderers.pie(data.data, data.data_keys);
      case 'composed':
        return chartRenderers.composed(data.data, data.data_keys);
      default:
        // This will cause a compile-time error if any ChartData['type'] is not handled above.
        const exhaustiveCheck: never = data.type;
        // Runtime fallback message.
        return <div className="text-red-400">Unsupported chart type: {String(exhaustiveCheck)}</div>;
    }
  };

  return (
    <div className="my-4 bg-base-300 p-4 rounded-lg shadow-xl"> {/* Adjusted bg to base-300 for theme consistency */}
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
});

ChartComponent.displayName = 'ChartComponent';
