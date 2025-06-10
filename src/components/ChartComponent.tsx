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

// Adjusted styling for better dark mode visibility
const CHART_STYLES = {
  tooltip: {
    contentStyle: {
      backgroundColor: 'rgba(55, 65, 81, 0.95)', // Dark semi-transparent background (e.g., Tailwind gray-700)
      color: '#F3F4F6', // Light text (e.g., Tailwind gray-100)
      border: '1px solid #4B5563', // Subtle border (e.g., Tailwind gray-600)
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' // Adding a subtle shadow
    },
    labelStyle: { color: '#E5E7EB', fontWeight: 'bold' as 'bold' }, // Light gray, bold for category names
    itemStyle: { color: '#D1D5DB' }, // Lighter gray for item text
  },
  legend: {
    wrapperStyle: { color: '#D1D5DB', paddingTop: '10px' }, // Light gray text (e.g., Tailwind gray-300)
  },
  axis: {
    stroke: "#9CA3AF", // Medium gray for axis lines (e.g., Tailwind gray-400)
    tick: { fill: '#D1D5DB' }, // Light gray for axis text/ticks (e.g., Tailwind gray-300)
  },
  grid: {
    strokeDasharray: "3 3",
    stroke: "#4B5563", // Darker, subtle grid lines (e.g., Tailwind gray-600)
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
const renderComposedChartInternal = (chartData: ChartData['data'], dataKeys: ChartData['data_keys'], composedConfig: ChartData['composed_config']) => {
  // Use keys from composed_config if available, otherwise fallback to data_keys or defaults
  const barKeys = composedConfig?.bar_keys || (dataKeys?.bar ? [dataKeys.bar] : [DEFAULT_DATA_KEYS.bar]);
  const lineKeys = composedConfig?.line_keys || (dataKeys?.line ? [dataKeys.line] : [DEFAULT_DATA_KEYS.line]);
  const areaKeys = composedConfig?.area_keys || (dataKeys?.area ? [dataKeys.area] : [DEFAULT_DATA_KEYS.area]);

  const hasDataForKey = (keyToCheck: string) =>
    chartData.length > 0 && chartData[0]?.[keyToCheck] !== undefined;

  return (
    <ComposedChart data={chartData}>
      <CartesianGrid {...CHART_STYLES.grid} />
      <XAxis dataKey="name" {...CHART_STYLES.axis} />
      <YAxis {...CHART_STYLES.axis} />
      <Tooltip {...CHART_STYLES.tooltip} />
      <Legend {...CHART_STYLES.legend} />
      {barKeys.map((key, index) => hasDataForKey(key) && (
        <Bar key={`bar-${key}`} dataKey={key} fill={CHART_COLORS[index % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
      ))}
      {lineKeys.map((key, index) => hasDataForKey(key) && (
        <Line key={`line-${key}`} type="monotone" dataKey={key} stroke={CHART_COLORS[(barKeys.length + index) % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      ))}
      {areaKeys.map((key, index) => hasDataForKey(key) && (
        <Area key={`area-${key}`} type="monotone" dataKey={key} fill={CHART_COLORS[(barKeys.length + lineKeys.length + index) % CHART_COLORS.length]} stroke={CHART_COLORS[(barKeys.length + lineKeys.length + index) % CHART_COLORS.length]} fillOpacity={0.6} />
      ))}
    </ComposedChart>
  );
};

export const ChartComponent: React.FC<ChartComponentProps> = React.memo(({ data }) => {
  const chartRenderers = {
    bar: renderBarChartInternal,
    line: renderLineChartInternal,
    pie: renderPieChartInternal,
    composed: (chartData: ChartData['data'], dataKeys: ChartData['data_keys']) => renderComposedChartInternal(chartData, dataKeys, data.composed_config),
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
        const exhaustiveCheck: never = data.type;
        return <div className="text-red-400">Unsupported chart type: {String(exhaustiveCheck)}</div>;
    }
  };

  return (
    <div className="my-4 bg-base-300 p-4 rounded-lg shadow-xl">
      {data.title && <h3 className="text-lg font-semibold mb-2 text-center">{data.title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
      {data.metadata && (
        <div className="mt-2 text-xs text-base-content/70 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {data.metadata.currency && <span>Currency: {data.metadata.currency}</span>}
          {data.metadata.period && <span>Period: {data.metadata.period}</span>}
          {data.metadata.unit && <span>Unit: {data.metadata.unit}</span>}
          {Object.entries(data.metadata)
            .filter(([key]) => !['currency', 'period', 'unit'].includes(key))
            .map(([key, value]) => (
              <span key={key}>{`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`}</span>
            ))}
        </div>
      )}
    </div>
  );
});

ChartComponent.displayName = 'ChartComponent';
