export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'composed';
  title: string; // Added: Title for the chart
  // Allows additional keys for composed/other charts.
  // For 'bar', 'line', 'pie': expects objects with 'name' and 'value' (or a custom key via data_keys).
  // For 'composed': expects objects with 'name' and other keys relevant to the combined charts (e.g., 'revenue', 'target', 'projection').
  data: { name: string; value?: number | string; [key: string]: any }[];
  // Optional: Specifies keys for different chart elements, especially useful for 'composed' charts
  // or when 'value' is not the desired key for simple charts.
  // e.g., { "bar": "revenue", "line": "target", "pie": "marketShare", "area": "projection" }
  data_keys?: Record<string, string>;
  metadata?: { // Added: Metadata for the chart
    currency?: string;
    period?: string;
    unit?: string;
    [key: string]: any; // Allow other metadata properties
  };
  composed_config?: { // Added: Specific configuration for composed charts
    bar_keys?: string[];
    line_keys?: string[];
    area_keys?: string[];
    [key: string]: any; // Allow other composed_config properties
  };
  pie_config?: { // Added: Specific configuration for pie charts
    data_key?: string;
    label_key?: string;
    [key: string]: any; // Allow other pie_config properties
  };
}
