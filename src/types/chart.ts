export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'composed';
  // Allows additional keys for composed/other charts.
  // For 'bar', 'line', 'pie': expects objects with 'name' and 'value' (or a custom key via data_keys).
  // For 'composed': expects objects with 'name' and other keys relevant to the combined charts (e.g., 'revenue', 'target', 'projection').
  data: { name: string; value?: number | string; [key: string]: any }[];
  // Optional: Specifies keys for different chart elements, especially useful for 'composed' charts
  // or when 'value' is not the desired key for simple charts.
  // e.g., { "bar": "revenue", "line": "target", "pie": "marketShare", "area": "projection" }
  data_keys?: Record<string, string>;
}
