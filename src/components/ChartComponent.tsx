import type { ChartData } from '../types/chart';
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area
} from 'recharts';

interface ChartComponentProps {
  data: ChartData;
}

// Chart styling configuration - now using DaisyUI/Tailwind CSS variables for Stripe-level consistency
const CHART_COLORS = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-accent)',
  'var(--color-info)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-error)',
  'var(--color-neutral)',
  'var(--color-base-300)'
];

// Adjusted styling for better dark mode visibility
const CHART_STYLES = {
  tooltip: {
    contentStyle: {
      backgroundColor: 'var(--color-base-200)',
      color: 'var(--color-base-content)',
      border: '1px solid var(--color-base-300)',
      borderRadius: 'var(--rounded-box)',
      boxShadow: '0 4px 6px -1px var(--color-neutral), 0 2px 4px -1px var(--color-neutral)' // subtle shadow
    },
    labelStyle: { color: 'var(--color-primary-content)', fontWeight: 'bold' as 'bold' },
    itemStyle: { color: 'var(--color-base-content)' },
  },
  legend: {
    wrapperStyle: { color: 'var(--color-base-content)', paddingTop: '10px' },
  },
  axis: {
    stroke: 'var(--color-base-300)',
    tick: { fill: 'var(--color-base-content)' },
  },
  grid: {
    strokeDasharray: '3 3',
    stroke: 'var(--color-base-200)',
  },
};

const DEFAULT_DATA_KEYS = {
  bar: 'value',
  line: 'value',
  pie: 'value',
  area: 'value',
};

const findFirstNumericKey = (items: ChartData['data'], excludeKeys: string[] = ['name']) => {
  const first = items?.[0];
  if (!first) return undefined;
  for (const [key, value] of Object.entries(first)) {
    if (excludeKeys.includes(key)) continue;
    if (typeof value === 'number') return key;
  }
  return undefined;
};

const resolveSimpleDataKey = (items: ChartData['data'], preferredKey: string | undefined) => {
  const first = items?.[0];
  if (!first) return preferredKey || DEFAULT_DATA_KEYS.bar;
  if (preferredKey && first[preferredKey] !== undefined) return preferredKey;
  if (first.value !== undefined) return 'value';
  return findFirstNumericKey(items) || preferredKey || 'value';
};

// Helper function to render Bar Chart
const renderBarChartInternal = (chartData: ChartData['data'], dataKeys: ChartData['data_keys']) => {
  const resolvedKey = resolveSimpleDataKey(chartData, dataKeys?.bar || DEFAULT_DATA_KEYS.bar);
  return (
  <BarChart data={chartData}>
    <CartesianGrid {...CHART_STYLES.grid} />
    <XAxis dataKey="name" {...CHART_STYLES.axis} />
    <YAxis {...CHART_STYLES.axis} />
    <Tooltip {...CHART_STYLES.tooltip} />
    <Legend {...CHART_STYLES.legend} />
    <Bar dataKey={resolvedKey} fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
  </BarChart>
  );
};

// Helper function to render Line Chart
const renderLineChartInternal = (chartData: ChartData['data'], dataKeys: ChartData['data_keys']) => {
  const resolvedKey = resolveSimpleDataKey(chartData, dataKeys?.line || DEFAULT_DATA_KEYS.line);
  return (
  <LineChart data={chartData}>
    <CartesianGrid {...CHART_STYLES.grid} />
    <XAxis dataKey="name" {...CHART_STYLES.axis} />
    <YAxis {...CHART_STYLES.axis} />
    <Tooltip {...CHART_STYLES.tooltip} />
    <Legend {...CHART_STYLES.legend} />
    <Line type="monotone" dataKey={resolvedKey} stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
  </LineChart>
  );
};

// Helper function to render Pie Chart
const renderPieChartInternal = (
  chartDataItems: ChartData['data'],
  pieConfig: ChartData['pie_config'] | undefined,
  fallbackDataKeyFromDataKeys: string | undefined
) => {
  const actualDataKey = pieConfig?.data_key || fallbackDataKeyFromDataKeys || DEFAULT_DATA_KEYS.pie;
  const actualNameKey = pieConfig?.label_key; // If undefined, Recharts Pie defaults to 'name'
  const resolvedDataKey = resolveSimpleDataKey(chartDataItems, actualDataKey);

  return (
  <PieChart>
    <Tooltip {...CHART_STYLES.tooltip} />
    <Legend {...CHART_STYLES.legend} />
    <Pie
      data={chartDataItems}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
      outerRadius="80%"
      fill={CHART_COLORS[2]} // Base fill, overridden by Cells
      dataKey={resolvedDataKey}
      nameKey={actualNameKey} // Use the resolved nameKey
    >
      {chartDataItems.map((_entry, index) => (
        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
      ))}
    </Pie>
  </PieChart>
  );
};

// Helper function to render Composed Chart
const renderComposedChartInternal = (chartData: ChartData['data'], dataKeys: ChartData['data_keys'], composedConfig: ChartData['composed_config']) => {
  // Use keys from composed_config if available, otherwise fallback to data_keys or defaults
  const barKeys = composedConfig?.bar_keys || (dataKeys?.bar ? [dataKeys.bar] : [DEFAULT_DATA_KEYS.bar]);
  const lineKeys = composedConfig?.line_keys || (dataKeys?.line ? [dataKeys.line] : [DEFAULT_DATA_KEYS.line]);
  const areaKeys = composedConfig?.area_keys || (dataKeys?.area ? [dataKeys.area] : [DEFAULT_DATA_KEYS.area]);

  const hasDataForKey = (keyToCheck: string) =>
    chartData.length > 0 && chartData[0]?.[keyToCheck] !== undefined;

  const inferredNumericKeys = (() => {
    const first = chartData?.[0];
    if (!first) return [];
    return Object.entries(first)
      .filter(([key, value]) => key !== 'name' && typeof value === 'number')
      .map(([key]) => key);
  })();

  const hasAnyConfiguredKey = [...barKeys, ...lineKeys, ...areaKeys].some(hasDataForKey);
  const finalBarKeys = hasAnyConfiguredKey ? barKeys : inferredNumericKeys;
  const finalLineKeys = hasAnyConfiguredKey ? lineKeys : [];
  const finalAreaKeys = hasAnyConfiguredKey ? areaKeys : [];

  return (
    <ComposedChart data={chartData}>
      <CartesianGrid {...CHART_STYLES.grid} />
      <XAxis dataKey="name" {...CHART_STYLES.axis} />
      <YAxis {...CHART_STYLES.axis} />
      <Tooltip {...CHART_STYLES.tooltip} />
      <Legend {...CHART_STYLES.legend} />
      {finalBarKeys.map((key, index) => hasDataForKey(key) && (
        <Bar key={`bar-${key}`} dataKey={key} fill={CHART_COLORS[index % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
      ))}
      {finalLineKeys.map((key, index) => hasDataForKey(key) && (
        <Line key={`line-${key}`} type="monotone" dataKey={key} stroke={CHART_COLORS[(finalBarKeys.length + index) % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      ))}
      {finalAreaKeys.map((key, index) => hasDataForKey(key) && (
        <Area key={`area-${key}`} type="monotone" dataKey={key} fill={CHART_COLORS[(finalBarKeys.length + finalLineKeys.length + index) % CHART_COLORS.length]} stroke={CHART_COLORS[(finalBarKeys.length + finalLineKeys.length + index) % CHART_COLORS.length]} fillOpacity={0.6} />
      ))}
    </ComposedChart>
  );
};

export const ChartComponent: React.FC<ChartComponentProps> = React.memo(({ data }) => {
  const chartRenderers = {
    bar: renderBarChartInternal,
    line: renderLineChartInternal,
    pie: renderPieChartInternal, // Pass data items, pie_config, and fallback data_keys.pie
    composed: (chartData: ChartData['data'], dataKeys: ChartData['data_keys']) => renderComposedChartInternal(chartData, dataKeys, data.composed_config),
  };

  const renderChart = () => {
    switch (data.type) {
      case 'bar':
        return chartRenderers.bar(data.data, data.data_keys);
      case 'line':
        return chartRenderers.line(data.data, data.data_keys);
      case 'pie':
        return chartRenderers.pie(data.data, data.pie_config, data.data_keys?.pie);
      case 'composed':
        return chartRenderers.composed(data.data, data.data_keys);
      default:
        const exhaustiveCheck: never = data.type;
        return <div className="text-red-400">Unsupported chart type: {String(exhaustiveCheck)}</div>;
    }
  };

  return (
    <div className="my-6 bg-base-100 p-6 rounded-box shadow-md border border-base-200">
      {data.title && <h3 className="text-lg font-semibold mb-4 text-center text-base-content tracking-tight">{data.title}</h3>}
      <ResponsiveContainer width="100%" height={320}>
        {renderChart()}
      </ResponsiveContainer>
      {data.metadata && (
        <div className="mt-3 text-xs text-base-content flex flex-wrap justify-center gap-x-6 gap-y-1 border-t border-base-200 pt-2">
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
