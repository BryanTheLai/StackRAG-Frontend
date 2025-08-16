<Date> August 16, 2025 10:44</Date>

```App.tsx
import Layout from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { Route, Switch } from "wouter";
import PrivateRoute from "@/components/PrivateRoute";
import Dashboard from "@/pages/private/Dashboard";
import Login from "@/pages/Login";
import ErrorPage from "@/pages/Error";
import Home from "@/pages/Home";
import Documents from "./pages/private/Documents";
import Chat from "./pages/private/Chat";
import ChatHistoryPage from "./pages/private/ChatHistory"; // Corrected import path
import ProfilePage from "@/pages/private/Profile";

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <main>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/private/dashboard">
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            </Route>{" "}
            <Route path="/private/documents">
              <PrivateRoute>
                <Documents />
              </PrivateRoute>
            </Route>
            <Route path="/private/chat/:id">
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            </Route>
            <Route path="/private/chathistory">
              <PrivateRoute>
                <ChatHistoryPage />
              </PrivateRoute>
            </Route>
            <Route path="/private/profile">
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            </Route>
            <Route path="*">
              <ErrorPage
                title="404: Page Not Found"
                message="Sorry, the page you are looking for does not exist"
              />
            </Route>
          </Switch>
        </main>
      </Layout>
    </AuthProvider>
  );
}
```

```index.css
@import "tailwindcss";
@plugin "daisyui" {
  themes: light --default;
}

@plugin "daisyui/theme" {
  name: "business";
  default: false;
  prefersdark: false;
  color-scheme: "dark";
  --color-base-100: oklch(24.353% 0 0);
  --color-base-200: oklch(22.648% 0 0);
  --color-base-300: oklch(20.944% 0 0);
  --color-base-content: oklch(84.87% 0 0);
  --color-primary: oklch(41.703% 0.099 251.473);
  --color-primary-content: oklch(88.34% 0.019 251.473);
  --color-secondary: oklch(64.092% 0.027 229.389);
  --color-secondary-content: oklch(12.818% 0.005 229.389);
  --color-accent: oklch(67.271% 0.167 35.791);
  --color-accent-content: oklch(13.454% 0.033 35.791);
  --color-neutral: oklch(27.441% 0.013 253.041);
  --color-neutral-content: oklch(85.488% 0.002 253.041);
  --color-info: oklch(62.616% 0.143 240.033);
  --color-info-content: oklch(12.523% 0.028 240.033);
  --color-success: oklch(70.226% 0.094 156.596);
  --color-success-content: oklch(14.045% 0.018 156.596);
  --color-warning: oklch(77.482% 0.115 81.519);
  --color-warning-content: oklch(15.496% 0.023 81.519);
  --color-error: oklch(51.61% 0.146 29.674);
  --color-error-content: oklch(90.322% 0.029 29.674);
  --radius-selector: 0rem;
  --radius-field: 0.25rem;
  --radius-box: 0.25rem;
  --rounded-btn: 0.25rem;
  --rounded-badge: 0.25rem;
  --rounded-box: 0.25rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 1px;
  --depth: 0;
  --noise: 0;
}

body {
  font-family: "Adelle Sans", sans-serif;
}
```

```main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

```vite-env.d.ts
/// <reference types="vite/client" />
```

```components/ChartComponent.tsx
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
const renderPieChartInternal = (
  chartDataItems: ChartData['data'],
  pieConfig: ChartData['pie_config'] | undefined,
  fallbackDataKeyFromDataKeys: string | undefined
) => {
  const actualDataKey = pieConfig?.data_key || fallbackDataKeyFromDataKeys || DEFAULT_DATA_KEYS.pie;
  const actualNameKey = pieConfig?.label_key; // If undefined, Recharts Pie defaults to 'name'

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
      dataKey={actualDataKey}
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
```

```components/Layout.tsx
import { type ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return <div className="flex flex-col h-screen">{children}</div>;
}
```

```components/Notification.tsx
import React from 'react';
import { CheckCircle, X as CloseIcon } from 'lucide-react';

interface NotificationProps {
  message: React.ReactNode;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  return (
    <div
      className="fixed top-6 right-6 z-50 shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 bg-white border border-success text-success"
      style={{ minWidth: 320, maxWidth: 400 }}
      role="alert"
    >
      <CheckCircle size={24} className="flex-shrink-0 text-success" />
      <div className="flex-1 text-sm uppercase font-medium text-black">{message}</div>
      <button
        className="btn btn-sm btn-circle btn-ghost hover:bg-base-200"
        onClick={onClose}
        aria-label="Close notification"
      >
        <CloseIcon size={20} className="text-black" />
      </button>
    </div>
  );
};

export default Notification;
```

```components/PDFNavComponent.tsx
```

```components/PDFViewerEmbedded.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';
import { verifyDocumentAccess } from '@/supabase/pdfNavigation';

interface PDFViewerEmbeddedProps {
  documentId: string;
  filename: string;
  initialPage?: number;
}

export const PDFViewerEmbedded: React.FC<PDFViewerEmbeddedProps> = ({
  documentId,
  filename,
  initialPage = 1
}) => {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (documentId) {
      loadPDF();
    }
    return () => {
      // Cleanup blob URL when component unmounts
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [documentId]);

  const loadPDF = async () => {
    setLoading(true);
    setError("");
    
    try {
      // First verify document access
      const hasAccess = await verifyDocumentAccess(documentId);
      if (!hasAccess) {
        throw new Error('Document not found or access denied');
      }

      // Get the document to find its storage path
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', documentId)
        .single();

      if (docError || !docData) {
        throw new Error('Document not found');
      }

      // Download the PDF from storage
      const { data: fileData, error: storageError } = await supabase.storage
        .from('financial-pdfs')
        .download(docData.storage_path);

      if (storageError || !fileData) {
        throw new Error('Failed to load PDF file');
      }

      // Convert to base64 data URI like in Documents.tsx
      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      const url = `data:application/pdf;base64,${base64}`;
      
      // Add page parameter to URL for navigation
      const urlWithPage = initialPage > 1 ? `${url}#page=${initialPage}` : url;
      setPdfUrl(urlWithPage);
    } catch (err: any) {
      console.error('Error loading PDF:', err);
      setError(err.message || 'Failed to load PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4">
      {loading && (
        <div className="flex items-center justify-center h-full">
          <div className="loading loading-spinner loading-lg"></div>
          <span className="ml-3 text-base-content">Loading PDF...</span>
        </div>
      )}
      
      {error && (
        <div className="flex items-center justify-center h-full">
          <div className="alert alert-error max-w-md">
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {pdfUrl && !loading && !error && (
        <embed
          src={pdfUrl}
          type="application/pdf"
          className="w-full h-full rounded border border-base-300"
          title={`PDF: ${filename}`}
        />
      )}
    </div>
  );
};
```

```components/PDFViewerModal.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/supabase/client';
import { verifyDocumentAccess } from '@/supabase/pdfNavigation';

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  filename: string;
  initialPage?: number;
  context?: string;
  highlight?: {
    text: string;
  };
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  isOpen,
  onClose,
  documentId,
  filename,
  initialPage = 1,
  context,
  highlight
}) => {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen && documentId) {
      loadPDF();
    }
    return () => {
      // Cleanup blob URL when component unmounts or closes
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, documentId]);

  const loadPDF = async () => {
    setLoading(true);
    setError("");
    
    try {
      // First verify document access
      const hasAccess = await verifyDocumentAccess(documentId);
      if (!hasAccess) {
        throw new Error('Document not found or access denied');
      }

      // Get the document to find its storage path
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', documentId)
        .single();

      if (docError || !docData) {
        throw new Error('Document not found');
      }

      // Download the PDF from storage
      const { data: fileData, error: storageError } = await supabase.storage
        .from('financial-pdfs')
        .download(docData.storage_path);

      if (storageError || !fileData) {
        throw new Error('Failed to load PDF file');
      }

      // Convert to base64 data URI like in Documents.tsx
      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      const url = `data:application/pdf;base64,${base64}`;
      
      // Add page parameter to URL for navigation
      const urlWithPage = initialPage > 1 ? `${url}#page=${initialPage}` : url;
      setPdfUrl(urlWithPage);
    } catch (err: any) {
      console.error('Error loading PDF:', err);
      setError(err.message || 'Failed to load PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-6xl h-full max-h-[90vh] mx-4 bg-base-100 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-base-content truncate">
              {filename}
            </h3>
            {context && (
              <p className="text-sm text-base-content/70 mt-1">{context}</p>
            )}
            {initialPage > 1 && (
              <p className="text-sm text-primary mt-1">Navigated to page {initialPage}</p>
            )}
            {highlight?.text && (
              <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded text-sm">
                <span className="text-warning font-medium">Highlighted text: </span>
                <span className="text-base-content/80">"{highlight.text}"</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle ml-4"
            aria-label="Close PDF viewer"
          >
            <X size={20} />
          </button>
        </div>

        {/* PDF Content */}
        <div className="flex-1 p-4" style={{ height: 'calc(90vh - 120px)' }}>
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="loading loading-spinner loading-lg"></div>
              <span className="ml-3 text-base-content">Loading PDF...</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="alert alert-error max-w-md">
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {pdfUrl && !loading && !error && (
            <embed
              src={pdfUrl}
              type="application/pdf"
              className="w-full h-full rounded border border-base-300"
              title={`PDF: ${filename}`}
            />
          )}
        </div>
      </div>
    </div>
  );
};
```

```components/PrivateRoute.tsx
import { type ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect, useLocation } from "wouter";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { session, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate("/", { replace: true });
    }
  }, [isLoading, session, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh] text-[32px]">
        <span role="status" aria-label="Loading">
          ⏳
        </span>
      </div>
    );
  }

  if (!session) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
```

```components/Sidebar.tsx
import { useState, type ChangeEvent, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import {
  Menu,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { processDocument, verifyFileNames } from "@/supabase/documents";
import { fetchChatSessions, type ChatSession } from "@/supabase/chatService";

interface SidebarProps {
  onFilesImported?: (files: File[]) => void;
}
type FileStatus = "processing" | "success" | "error";
interface FileResult {
  file: File;
  status: FileStatus;
  error?: string;
}

const links = [
  { link: "/private/dashboard", label: "Dashboard" },
  { link: "/private/documents", label: "Documents" },
  { link: "/private/profile", label: "Profile" },
  { link: "/private/chathistory", label: "Chat History" },
];

// Helper for active route and common classes
const getNavClass = (active: boolean) =>
  active
    ? "bg-primary text-primary-content"
    : "text-base-content hover:bg-base-200";

export default function Sidebar({ onFilesImported }: SidebarProps) {
  const { user, session, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [results, setResults] = useState<FileResult[]>([]);
  const [location] = useLocation();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [showChatHistoryDropdown, setShowChatHistoryDropdown] = useState(false);
  const [chatHistoryError, setChatHistoryError] = useState<string | null>(null);

  const isProcessing = results.some((r) => r.status === "processing");

  // Fetch chat sessions for the dropdown
  useEffect(() => {
    if (user?.id && !collapsed) {
      setChatHistoryError(null);
      fetchChatSessions(user.id)
        .then(setChatSessions)
        .catch((err) => {
          console.error("Error fetching chat sessions for sidebar:", err);
          setChatHistoryError(
            err instanceof Error ? err.message : "Failed to load chat history"
          );
        });
    } else {
      setChatSessions([]); // Clear sessions if no user or sidebar is collapsed
      if (collapsed) {
        setShowChatHistoryDropdown(false); // Hide dropdown if sidebar collapses
      }
    }
  }, [user, collapsed, location]); // Added location to dependencies to refetch on navigation for active link update

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const fileList = input.files;
    if (!fileList || !session) return;
    const files = Array.from(fileList);

    // verify filenames on server
    const filenames = files.map((f) => f.name);
    try {
      const existing = await verifyFileNames(user!.id, filenames);
      if (existing.length) {
        alert(
          `File "${existing[0]}" already exists. Please delete or rename before importing.`
        );
        input.value = "";
        return;
      }
    } catch (err) {
      console.error("Error checking documents:", err);
      alert("Server check failed. Try again later.");
      input.value = "";
      return;
    }

    // start processing
    setResults(files.map((f) => ({ file: f, status: "processing" })));

    const settled = await Promise.allSettled(
      files.map((f) => processDocument(f, session.access_token))
    );

    const newResults: FileResult[] = settled.map<FileResult>((r, i) =>
      r.status === "fulfilled"
        ? { file: files[i], status: "success" }
        : {
            file: files[i],
            status: "error",
            error: (r.reason as Error).message,
          }
    );

    setResults(newResults);
    input.value = "";

    onFilesImported?.(files);
  };

  // local component for Chat History dropdown trigger
  const ToggleIcon = collapsed ? Menu : X;

  return (
    <div
      className={`h-screen flex flex-col justify-between border-r border-base-300 transition-width duration-200 ${
        collapsed ? "w-16" : "w-60"
      } bg-base-100 text-base-content`}
    >
      {/* Top section: toggle and nav */}
      <div>
        <div className="p-2 flex justify-end">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="btn btn-square btn-ghost text-base-content"
            aria-label="Toggle sidebar"
          >
            <ToggleIcon className="h-6 w-6" />
          </button>
        </div>
        {!collapsed && (
          <nav className="flex flex-col p-4 space-y-1">
            {links.map(({ link, label }) =>
              label === "Chat History" ? (
                <div key={label} className="relative">
                  <button
                    onClick={() => setShowChatHistoryDropdown((v) => !v)}
                    className={`px-3 py-2 rounded-box font-medium transition w-full flex justify-between items-center text-left ${getNavClass(
                      location === link || showChatHistoryDropdown
                    )}`}
                  >
                    {label}
                    {showChatHistoryDropdown ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                  {showChatHistoryDropdown && (
                    <div className="pl-4 mt-1 space-y-1">
                      {chatHistoryError && (
                        <p className="px-3 py-1 text-sm text-error/80">
                          Error loading chats.
                        </p>
                      )}
                      {!chatHistoryError && chatSessions.length === 0 && (
                        <p className="px-3 py-1 text-sm text-base-content/60">
                          No recent chats.
                        </p>
                      )}
                      {!chatHistoryError &&
                        chatSessions.slice(0, 3).map((session) => (
                          <Link
                            key={session.id}
                            href={`/private/chat/${session.id}`}
                            className={`block px-3 py-1 rounded-box text-sm transition ${
                              location === `/private/chat/${session.id}`
                                ? "bg-primary/20 text-primary font-semibold"
                                : "text-base-content/80 hover:bg-base-200 hover:text-base-content"
                            }`}
                            title={session.title || "Untitled Chat"}
                            onClick={() => setShowChatHistoryDropdown(false)} // Close dropdown on link click
                          >
                            <span className="truncate block">
                              {session.title || "Untitled Chat"}
                            </span>
                          </Link>
                        ))}
                      {!chatHistoryError && (
                        <Link
                          href="/private/chathistory"
                          className="block px-3 py-1 rounded-box text-sm text-base-content/70 hover:bg-base-200 hover:text-base-content font-medium"
                          onClick={() => setShowChatHistoryDropdown(false)} // Close dropdown on link click
                        >
                          View all...
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={label}
                  href={link}
                  className={`px-3 py-2 rounded-box font-medium transition w-full text-left ${getNavClass(
                    location === link
                  )}`}
                >
                  {label}
                </Link>
              )
            )}
          </nav>
        )}
      </div>

      {/* Bottom section: import and user info */}
      {!collapsed && (
        <div className="p-4 space-y-4">
          <div>
            {/* File import button always visible; disable and show spinner when processing */}
            <input
              id="file-upload"
              type="file"
              multiple
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <label
              htmlFor="file-upload"
              className={`btn btn-outline btn-primary w-full ${
                isProcessing ? "cursor-not-allowed opacity-70" : ""
              } bg-base-100 text-base-content border-base-300`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2 inline-block" />
                  Processing...
                </>
              ) : (
                "Import PDF"
              )}
            </label>

            {results.length > 0 && (
              <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {results.map(({ file, status, error }, i) => (
                  <li
                    key={i}
                    className="flex items-center min-w-0 bg-base-100 text-base-content"
                  >
                    <span
                      title={file.name}
                      className="flex-1 text-sm truncate mr-2"
                    >
                      {file.name}
                    </span>
                    <div className="w-5 flex justify-center">
                      {status === "success" && (
                        <CheckCircle className="h-5 w-5 text-success" />
                      )}
                      {status === "error" && (
                        <div title={error} className="w-5 flex justify-center">
                          <AlertTriangle className="h-5 w-5 text-error" />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-4">
            <p className="signed-in-as text-base-content/70">Signed in as</p>
            <p className="font-medium mb-3 text-base-content">{user?.email}</p>
            <button
              onClick={() => void signOut()}
              className="btn btn-outline btn-error w-full border-base-300 bg-base-100 text-error"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

```components/TypingDots.tsx
import React from "react";

/**
 * A simple animated typing dots (ellipsis) indicator for chat loading state.
 */
export const TypingDots: React.FC = () => (
  <div className="flex items-center gap-1 h-6">
    <span
      className="inline-block w-2 h-2 bg-base-300 rounded-full animate-bounce"
      style={{ animationDelay: "0ms" }}
    />
    <span
      className="inline-block w-2 h-2 bg-base-300 rounded-full animate-bounce"
      style={{ animationDelay: "150ms" }}
    />
    <span
      className="inline-block w-2 h-2 bg-base-300 rounded-full animate-bounce"
      style={{ animationDelay: "300ms" }}
    />
  </div>
);
```

```config/api.ts
// Centralized API configuration
export const API_BASE_URL = import.meta.env.VITE_FASTAPI_BACKEND_URL;

export const ENDPOINTS = {
  DOCUMENTS: `${API_BASE_URL}/documents`,
  CHAT: `${API_BASE_URL}/chat`,
};
```

```contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  supabase,
  signIn as supabaseSignIn,
  signOut as supabaseSignOut,
} from "@/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { useLocation } from "wouter";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    setIsLoading(true);
    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        if (event === "SIGNED_IN") {
          // Optional: Redirect to a specific page after sign-in
          // navigate('/private/profile/me', { replace: true }); // Example
        } else if (event === "SIGNED_OUT") {
          navigate("/", { replace: true });
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, pass: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await supabaseSignIn(email, pass);
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "An unknown error occurred during sign in."
      );
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await supabaseSignOut();
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "An unknown error occurred during sign out."
      );
      setIsLoading(false);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        signIn,
        signOut,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

```lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```pages/Error.tsx
import { AlertCircle } from "lucide-react";

interface ErrorPageProps {
  title?: string;
  message?: string;
  showGoHomeLink?: boolean;
}

export default function ErrorPage({
  title = "Oops! Something went wrong.",
  message = "We're sorry, but an unexpected error occurred.",
  showGoHomeLink = true,
}: ErrorPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <AlertCircle className="h-16 w-16 text-error" />
          <h1 className="card-title text-3xl font-bold text-error mt-4">
            {title}
          </h1>
          <p className="py-4 text-base-content">{message}</p>{" "}
          {showGoHomeLink && (
            <div className="card-actions justify-center">
              <button
                onClick={() => window.history.back()}
                className="btn btn-primary"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

```pages/Home.tsx
import { Link } from "wouter";
import { Zap, CheckCircle } from "lucide-react";
import tableChatScreenshot from "@/assets/table-chat-screenshot.png";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-base-200 text-base-content overflow-x-hidden">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col items-center text-center">
          {/* Alpha Launch Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-secondary/20 text-secondary border border-secondary/30 mb-8">
            <Zap size={16} className="w-4 h-4 mr-2" />
            stackifier@gmail.com
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
            Stackifier
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-base-content/70 mb-10 max-w-3xl">
            Stop drowning in spreadsheets. Upload your financial documents and
            get instant summaries, interactive charts, and organized tables—all
            through seamless integration and intelligent automation.
          </p>

          {/* CTA Button */}
          <Link href="/login" className="btn btn-primary btn-lg px-10 mb-12">
            <Zap size={20} className="mr-2" /> Login
          </Link>

          {/* Custom Solution Text */}
          <div className="text-center mb-10">
            <p className="text-base-content/70 mb-2">
              Need a custom solution? We build{' '}
              <span className="font-semibold text-secondary">
                tailored automation tools
              </span>{' '}
              for your workflow.
            </p>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=stackifier@gmail.com"
              className="font-semibold text-base-content/90 hover:text-base-content transition-colors"
            >
              stackifier@gmail.com
            </a>
          </div>

          {/* Demo Video in Hero */}
          {/* <div className="w-full max-w-4xl mx-auto aspect-video relative">
            <div className="absolute inset-0 bg-primary/10 rounded-xl blur-2xl"></div>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-xl shadow-2xl border border-base-content/30"
              src="https://www.youtube.com/embed/mUrNCdx-MHs?rel=0&modestbranding=1&controls=1"
              title="Demo Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div> */}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-base-100 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            {/* Text Content */}
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary">
                Structured Data, Effortlessly
              </h2>
              <p className="text-lg md:text-xl mb-8 text-base-content/70">
                Say goodbye to manual data sifting. Our AI intelligently
                extracts and organizes financial data into clean,
                easy-to-understand tables directly within your chat.
              </p>
              <ul className="space-y-4 mb-8 text-left max-w-md mx-auto md:mx-0">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 shrink-0 mt-0.5" />
                  <span className="text-base-content/70">
                    Automated extraction from PDFs
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 shrink-0 mt-0.5" />
                  <span className="text-base-content/70">
                    Clear presentation of key financial metrics
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 shrink-0 mt-0.5" />
                  <span className="text-base-content/70">
                    Quickly identify trends and anomalies
                  </span>
                </li>
              </ul>
            </div>

            {/* Image */}
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-xl">
                <div className="absolute inset-0 bg-primary/10 rounded-xl blur-xl"></div>
                <img
                  src={tableChatScreenshot || "/placeholder.svg"}
                  alt="Chat with Structured Table View"
                  className="relative rounded-xl shadow-xl w-full border border-base-content/30"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section id="about" className="bg-base-100 text-base-content py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Designed for <span className="text-secondary">Reliability and Trust</span>
          </h2>
          <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto text-base-content/70">
            Accuracy is paramount. Every insight and piece of data presented is
            directly backed by your uploaded documents, ensuring verifiable
            sources and truly grounded answers. Combined with precise
            calculation tools and robust data privacy through multi-tenancy, you
            can confidently rely on the financial intelligence provided.
          </p>

          {/* Partners Section */}
          {/* <div id="contact" className="mt-16">
            <h3 className="text-2xl font-semibold mb-8 text-slate-500">
              Our Partners
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-center">
                  <div className="aspect-[3/2] bg-slate-100 rounded-lg flex items-center justify-center w-full max-w-[180px] sm:max-w-[220px] md:max-w-none">
                    <span className="text-slate-400 font-medium">
                      Company {i}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-slate-400 mt-8">
              Future partners' logos will appear here
            </p>
          </div> */}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-base-200 border-t border-base-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center space-x-6 mb-6">
            <a
              href="#"
              className="text-base-content/70 hover:text-primary transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-base-content/70 hover:text-primary transition-colors"
            >
              Privacy
            </a>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=stackifier@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base-content/70 hover:text-primary transition-colors"
            >
              Contact
            </a>
          </div>
          <p className="text-sm text-base-content/50">
            © {new Date().getFullYear()} Stackifier. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
```

```pages/Login.tsx
import { type FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { AlertCircle } from "lucide-react";

export default function Login() {
  const {
    signIn,
    isLoading: authLoading,
    authError,
    clearAuthError,
    session,
  } = useAuth();
  const [email, setEmail] = useState(import.meta.env.VITE_TEST_EMAIL || "");
  const [pw, setPw] = useState(import.meta.env.VITE_TEST_PASSWORD || "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (authError) {
      setFeedback(authError);
    }
  }, [authError]);

  useEffect(() => {
    if (session) {
      navigate("/private/dashboard", { replace: true });
    }
  }, [session, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setFeedback(null);
    await signIn(email, pw);
  };

  if (authLoading && !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
        <span className="loading loading-lg loading-spinner text-primary"></span>
        <div className="mt-4 text-lg text-base-content">
          Checking authentication…
        </div>
      </div>
    );
  }

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left lg:pl-10">
          <h1 className="text-5xl font-bold">Login now!</h1>
          <p className="py-6">
            Access your Stackifier dashboard to manage your finances
            effectively.
          </p>
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body" onSubmit={onSubmit}>
            {feedback && (
              <div role="alert" className="alert alert-error mb-4">
                <AlertCircle className="stroke-current shrink-0 h-6 w-6" />
                <span>{feedback}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setFeedback(null)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="email"
                className="input input-bordered"
                required
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                autoComplete="username"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="password"
                className="input input-bordered"
                required
                value={pw}
                onChange={(e) => setPw(e.currentTarget.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="form-control mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={authLoading}
              >
                {authLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : null}
                {authLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

```pages/private/Chat.tsx
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Send, MessageSquare, ArrowLeft, X } from "lucide-react";
import { ENDPOINTS } from "@/config/api";
import { useRoute, Link } from "wouter";
import type { ChatMessage } from "@/supabase/chatService";
import {
  fetchChatSessionById,
  updateChatSessionHistory,
} from "@/supabase/chatService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { ChartComponent } from "@/components/ChartComponent";
import type { ChartData } from "@/types/chart";
import { PDFViewerEmbedded } from "@/components/PDFViewerEmbedded";
import type { PDFNavData } from "@/types/pdfnav";
import { TypingDots } from "@/components/TypingDots";

// Constants for chart processing
const CHART_OPEN_TAG = '<ChartData>';
const CHART_CLOSE_TAG = '</ChartData>';

// Constants for PDF navigation processing
const PDF_NAV_OPEN_TAG = '<PDFNav>';
const PDF_NAV_CLOSE_TAG = '</PDFNav>';

// Define special tag structure
interface SpecialTagConfig {
  OPEN_TAG: string;
  CLOSE_TAG: string;
}

// Special tags whose content should be buffered until fully received
const SPECIAL_TAG_CONFIGS: SpecialTagConfig[] = [
  { OPEN_TAG: CHART_OPEN_TAG, CLOSE_TAG: CHART_CLOSE_TAG },
  { OPEN_TAG: PDF_NAV_OPEN_TAG, CLOSE_TAG: PDF_NAV_CLOSE_TAG },
];

// Utility to parse chart data from string
const parseChartDataFromString = (potentialChartString: string): ChartData | null => {
  const trimmedString = potentialChartString.trim();
  if (trimmedString.startsWith(CHART_OPEN_TAG) && trimmedString.endsWith(CHART_CLOSE_TAG)) {
    try {
      // Extract JSON string from between the tags
      const jsonString = trimmedString.slice(CHART_OPEN_TAG.length, -CHART_CLOSE_TAG.length);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to parse chart JSON:', error, '\nOriginal string part:', potentialChartString);
      return null;
    }
  }
  return null;
};

// Utility to parse PDF navigation data from string
const parsePDFNavDataFromString = (potentialPDFNavString: string): PDFNavData | null => {
  const trimmedString = potentialPDFNavString.trim();
  if (trimmedString.startsWith(PDF_NAV_OPEN_TAG) && trimmedString.endsWith(PDF_NAV_CLOSE_TAG)) {
    try {
      // Extract JSON string from between the tags
      const jsonString = trimmedString.slice(PDF_NAV_OPEN_TAG.length, -PDF_NAV_CLOSE_TAG.length);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to parse PDF navigation JSON:', error, '\nOriginal string part:', potentialPDFNavString);
      return null;
    }
  }
  return null;
};

// Helper to decode HTML entities (Added)
const decodeHtmlEntities = (html: string): string => {
  if (typeof window !== 'undefined') {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }
  return html; // Fallback for non-browser environments
};

export default function Chat() {
  // Authentication and routing
  const { user, session, isLoading: authLoading } = useAuth();
  const [, params] = useRoute("/private/chat/:id");
  const chatId = params?.id;

  // Chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const [chatTitle, setChatTitle] = useState<string | null>("Chat");
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>("");

  // PDF viewer state
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [selectedPDFData, setSelectedPDFData] = useState<PDFNavData | null>(null);

  // UI refs
  const chatDisplayRef = useRef<HTMLDivElement>(null);
  // Load chat session on mount or when chatId/user changes
  useEffect(() => {
    const loadChatSession = async () => {
      if (!user || !chatId) {
        setIsLoadingChat(false);
        setChatTitle("New Chat");
        setChatHistory([]);
        return;
      }

      setIsLoadingChat(true);
      setError(null);

      try {
        const sessionData = await fetchChatSessionById(chatId);
        if (sessionData) {
          setChatHistory(sessionData.history || []);
          setChatTitle(sessionData.title || "Chat");
        } else {
          setError("Chat session not found or access denied.");
          setChatHistory([]);
          setChatTitle("Error");
        }
      } catch (err) {
        console.error("Failed to load chat session:", err);
        setError(err instanceof Error ? err.message : "Failed to load chat.");
        setChatTitle("Error");
      } finally {
        setIsLoadingChat(false);
      }
    };

    loadChatSession();
  }, [chatId, user]);
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTo({
        top: chatDisplayRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  // Create user message object
  const createUserMessage = (content: string): ChatMessage => ({
    kind: "request",
    parts: [
      {
        content,
        timestamp: new Date().toISOString(),
        dynamic_ref: null,
        part_kind: "user-prompt",
      },
    ],
  });

  // Create placeholder response message
  const createPlaceholderMessage = (): ChatMessage => ({
    kind: "response",
    parts: [{ content: "", part_kind: "text" }],
  });

  // Process incoming text chunks, buffering special-tag blocks
  const processTextChunk = (
    chunk: string,
    accText: string,
    tagBuffer: string,
    inTag: boolean,
    tagCfg: SpecialTagConfig | null,
    updateUI: () => void
  ): {
    nextAccText: string;
    nextTagBuffer: string;
    nextInTag: boolean;
    nextTagCfg: SpecialTagConfig | null;
  } => {
    let text = accText;
    let buffer = tagBuffer;
    let inside = inTag;
    let cfg = tagCfg;
    let rest = chunk;

    while (rest) {
      if (inside && cfg) {
        buffer += rest;
        const closeIdx = buffer.indexOf(cfg.CLOSE_TAG);
        if (closeIdx !== -1) {
          const end = closeIdx + cfg.CLOSE_TAG.length;
          const block = buffer.slice(0, end);
          text += block;
          updateUI();
          rest = buffer.slice(end);
          buffer = "";
          inside = false;
          cfg = null;
        } else {
          rest = "";
        }
      } else {
        let nextOpen = -1;
        let found: SpecialTagConfig | null = null;
        for (const c of SPECIAL_TAG_CONFIGS) {
          const pos = rest.indexOf(c.OPEN_TAG);
          if (pos >= 0 && (nextOpen < 0 || pos < nextOpen)) {
            nextOpen = pos;
            found = c;
          }
        }
        if (found && nextOpen >= 0) {
          const before = rest.slice(0, nextOpen);
          if (before) {
            text += before;
            updateUI();
          }
          inside = true;
          cfg = found;
          buffer = rest.slice(nextOpen);
          rest = "";
          const closeIdx = buffer.indexOf(cfg.CLOSE_TAG);
          if (closeIdx !== -1) {
            const end = closeIdx + cfg.CLOSE_TAG.length;
            const block = buffer.slice(0, end);
            text += block;
            updateUI();
            rest = buffer.slice(end);
            buffer = "";
            inside = false;
            cfg = null;
          }
        } else {
          text += rest;
          updateUI();
          rest = "";
        }
      }
    }

    return { nextAccText: text, nextTagBuffer: buffer, nextInTag: inside, nextTagCfg: cfg };
  };

  // Handle streaming response, buffering special tags until closed
  const handleStreamingResponse = async (
    response: Response,
    initialHistory: ChatMessage[]
  ) => {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    let tagBuffer = "";
    let inTag = false;
    let tagCfg: SpecialTagConfig | null = null;
    const updateUI = () => {
      setChatHistory((prev) => {
        const h = [...prev];
        const last = h[h.length - 1];
        if (last?.kind === "response") last.parts[0].content = text;
        return h;
      });
    };
    
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf("\n\n")) >= 0) {
          const chunk = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          if (chunk.startsWith("event: stream_end")) {
            if (inTag) text += tagBuffer;
            break;
          }
          if (chunk.startsWith("data: ")) {
            try {
              const d = JSON.parse(chunk.slice(6));
              if (d.text_chunk) {
                const result = processTextChunk(
                  d.text_chunk,
                  text,
                  tagBuffer,
                  inTag,
                  tagCfg,
                  updateUI
                );
                text = result.nextAccText;
                tagBuffer = result.nextTagBuffer;
                inTag = result.nextInTag;
                tagCfg = result.nextTagCfg;
              }
            } catch {}
          }
        }
        if (buffer.includes("event: stream_end")) break;
      }
      if (inTag) text += tagBuffer;
      const final: ChatMessage = { kind: "response", parts: [{ content: text, part_kind: "text", timestamp: new Date().toISOString() }] };
      const newHistory = [...initialHistory, final];

      setChatHistory(newHistory);
      if (chatId) await updateChatSessionHistory(chatId, newHistory);
    } catch (e) {
      setChatHistory((prev) => prev.length > initialHistory.length && prev[prev.length - 1].parts[0].content === "" ? initialHistory : prev);
      throw e;
    }
  };

  // Handle errors in chat
  const handleChatError = (error: unknown) => {
    console.error("Streaming error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown error occurred during streaming.";

    setChatHistory((prev) => {
      const updated = [...prev];
      // Remove placeholder if it exists
      if (
        updated.length > 0 &&
        updated[updated.length - 1].parts[0].content === ""
      ) {
        updated.pop();
      }
      return [
        ...updated,
        {
          kind: "response",
          parts: [{ content: `Error: ${errorMessage}`, part_kind: "text" }],
        },
      ];
    });
    setError(errorMessage);
  };
  const sendMessage = async () => {
    if (!inputMessage.trim() || isStreaming || !session) return;

    const content = inputMessage.trim();
    setLastQuery(content);
    const userMessage = createUserMessage(content);
    const placeholder = createPlaceholderMessage();
    const currentHistory = [...chatHistory, userMessage];

    // Update UI immediately
    setChatHistory((prev) => [...prev, userMessage, placeholder]);
    setInputMessage("");
    setIsStreaming(true);
    setError(null);

    try {
      const response = await fetch(ENDPOINTS.CHAT + "/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ history: currentHistory }),
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText || "Failed to stream"}`
        );
      }

      await handleStreamingResponse(response, currentHistory);
    } catch (error) {
      handleChatError(error);
    } finally {
      setIsStreaming(false);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render loading state for authentication
  const renderAuthLoading = () => (
    <div className="flex h-screen bg-base-200">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    </div>
  );

  // Render chat loading state
  const renderChatLoading = () => (
    <div className="flex justify-center items-center h-full">
      <span className="loading loading-dots loading-lg"></span>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="text-center text-red-500 p-4">
      <p>Error loading chat: {error}</p>
      <Link href="/private/chathistory" className="link link-primary mt-2">
        Back to Chat History
      </Link>
    </div>
  );

  // Render empty state for new chat
  const renderNewChatEmpty = () => (
    <div className="text-center text-gray-500 pt-10">
      <MessageSquare size={48} className="mx-auto mb-4" />
      <p className="text-xl">Start a new conversation</p>
      <p className="text-sm">Type your message below to begin.</p>
    </div>
  );

  // Render empty state for existing chat
  const renderExistingChatEmpty = () => (
    <div className="text-center text-gray-500 pt-10">
      <MessageSquare size={48} className="mx-auto mb-4" />
      <p className="text-xl">This chat is empty.</p>
      <p className="text-sm">Send a message to start the conversation.</p>
    </div>
  );

  // Render a single chat message
  const renderMessage = (msg: ChatMessage, index: number) => {
    const isUser = msg.kind === "request";
    const isPlaceholder = !isUser && msg.parts[0].content === "" && isStreaming && index === chatHistory.length - 1;
    // Minimalistic bubble classes using DaisyUI variables for consistency
    const bubbleClass = isUser
      ? "bg-base-200 text-base-content border border-base-300"
      : msg.parts.some((part) => part.content.startsWith("Error:"))
      ? "bg-error/10 text-error border border-error"
      : "bg-base-100 text-base-content border border-base-200";

    const chatAlignment = isUser ? "justify-end" : "justify-start";

    if (isPlaceholder) {
      return (
        <div key={index} className={`flex ${chatAlignment}`}>
          <div className={`rounded-box px-4 py-2 w-full max-w-3xl shadow-none ${bubbleClass}`}>            
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-outline capitalize">{lastQuery}</span>
              <span className="text-sm text-base-content/60">Searching...</span>
            </div>
            <TypingDots />
          </div>
        </div>
      );
    }

    return (
      <div key={index} className={`flex ${chatAlignment}`}>
        <div
          className={`rounded-box px-4 py-2 w-full max-w-3xl shadow-none ${bubbleClass}`}
          style={{ fontSize: "1rem", lineHeight: "1.5" }}
        >
          {msg.parts.map((part, partIndex) => {
            const decodedContent = decodeHtmlEntities(part.content); // Decode content
            // Split content by both chart and PDF nav tags
            const contentParts = decodedContent.split(new RegExp(`(${CHART_OPEN_TAG}[\\s\\S]*?${CHART_CLOSE_TAG}|${PDF_NAV_OPEN_TAG}[\\s\\S]*?${PDF_NAV_CLOSE_TAG})`, 'g')).filter(Boolean);

            return contentParts.map((contentPart, contentPartIndex) => {
              const chartData = parseChartDataFromString(contentPart); // Try to parse as chart data
              const pdfNavData = parsePDFNavDataFromString(contentPart); // Try to parse as PDF nav data

              if (chartData) {
                // If chartData is not null, it's a valid chart block
                return (
                  <div key={`${partIndex}-${contentPartIndex}-chart`} className="w-full">
                    <ChartComponent data={chartData} />
                  </div>
                );
              } else if (pdfNavData) {
                // If pdfNavData is not null, it's a valid PDF navigation block
                return (
                  <div key={`${partIndex}-${contentPartIndex}-pdfnav`} className="my-3">
                    <button
                      onClick={() => {
                        setSelectedPDFData(pdfNavData);
                        setShowPDFViewer(true);
                      }}
                      className="btn btn-outline btn-sm gap-2 hover:btn-primary"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                      {pdfNavData.filename} - Page {pdfNavData.page}
                    </button>
                    {pdfNavData.context && (
                      <p className="text-sm text-base-content/70 mt-2 italic">
                        {pdfNavData.context}
                      </p>
                    )}
                  </div>
                );
              } else {
                // Otherwise, render as Markdown
                return (
                  <div className="prose prose-neutral" key={`${partIndex}-${contentPartIndex}-prose-wrapper`}>
                    <ReactMarkdown
                      key={`${partIndex}-${contentPartIndex}`}
                      remarkPlugins={[remarkGfm, remarkBreaks]}
                      components={{
                        a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-focus" />,
                        table: ({node, ...props}) => <table {...props} className="w-full border border-base-300 my-4 bg-base-100 text-sm" />,
                        thead: ({node, ...props}) => <thead {...props} className="" />,
                        th: ({node, ...props}) => <th {...props} className="border border-base-300 font-semibold p-2 text-left bg-base-100 text-base-content" />,
                        td: ({node, ...props}) => <td {...props} className="border border-base-200 p-2 text-base-content/80" />,
                        tr: ({node, ...props}) => <tr {...props} className="" />
                      }}
                    >
                      {contentPart}
                    </ReactMarkdown>
                  </div>
                );
              }
            });
          })}
        </div>
      </div>
    );
  };

  // Render chat display area content
  const renderChatContent = () => {
     if (isLoadingChat) return renderChatLoading();
     if (error) return renderError();
     if (chatHistory.length === 0 && !chatId) return renderNewChatEmpty();
     if (chatHistory.length === 0 && chatId) return renderExistingChatEmpty();
     return chatHistory.map(renderMessage);
  };

  // Render input area
  const renderInputArea = () => {
    if (isLoadingChat || error) return null;

    return (
      <div className="p-4 border-t border-base-200 bg-base-100">
        <div className="flex items-center gap-2">
          <textarea
            className="textarea textarea-bordered flex-1 resize-none bg-base-100 text-base-content border-base-300"
            rows={1}
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
          />
          <button
            className={`btn btn-primary ${isStreaming ? "loading" : ""}`}
            onClick={sendMessage}
            disabled={isStreaming || !inputMessage.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    );
  };
  if (authLoading) {
    return renderAuthLoading();
  }

  return (
    <div className="flex h-screen bg-base-100 text-base-content">
      <Sidebar />
      <main className={`flex-1 flex flex-col max-h-screen ${showPDFViewer ? 'w-1/2' : ''}`}>
        {/* Header */}
        <div className="bg-base-100 p-3 px-4 border-b border-base-200 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/private/chathistory"
              className="btn btn-ghost btn-sm mr-2"
            >
              <ArrowLeft size={20} />
            </Link>
            <h2
              className="text-xl font-semibold truncate"
              title={chatTitle || "Chat"}
            >
              {chatTitle || "Chat"}
            </h2>
          </div>
        </div>

        {/* Chat Display Area */}
        <div
          ref={chatDisplayRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100"
        >
          {renderChatContent()}
        </div>

        {/* Input Area */}
        {renderInputArea()}
      </main>

      {/* PDF Viewer Side Panel */}
      {showPDFViewer && selectedPDFData && (
        <div className="w-1/2 max-w-3xl bg-base-100 border-l border-base-300 shadow-lg flex flex-col">
          {/* PDF Header */}
          <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-200">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-base-content truncate">
                {selectedPDFData.filename}
              </h3>
              {selectedPDFData.context && (
                <p className="text-sm text-base-content/70 mt-1">{selectedPDFData.context}</p>
              )}
              {selectedPDFData.page > 1 && (
                <p className="text-sm text-primary mt-1">Page {selectedPDFData.page}</p>
              )}
              {selectedPDFData.highlight?.text && (
                <div className="mt-2 p-2 bg-warning/10 border border-warning/20 rounded text-sm">
                  <span className="text-warning font-medium">Highlighted: </span>
                  <span className="text-base-content/80">"{selectedPDFData.highlight.text}"</span>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setShowPDFViewer(false);
                setSelectedPDFData(null);
              }}
              className="btn btn-ghost btn-sm btn-circle ml-4"
              aria-label="Close PDF viewer"
            >
              <X size={20} />
            </button>
          </div>

          {/* PDF Content */}
          <PDFViewerEmbedded
            documentId={selectedPDFData.documentId}
            filename={selectedPDFData.filename}
            initialPage={selectedPDFData.page}
          />
        </div>
      )}
    </div>
  );
}
```

```pages/private/ChatHistory.tsx
// React hooks
import { useEffect, useState } from "react";

// Auth and routing
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";

// Components
import Sidebar from "@/components/Sidebar";

// Icons
import {
  PlusCircle,
  Trash2,
  Edit3,
  MoreVertical,
  Check,
  X,
} from "lucide-react";

// Types and services
import type { ChatSession } from "@/supabase/chatService";
import {
  createChatSession,
  fetchChatSessions,
  deleteChatSession,
  updateChatSessionTitle,
} from "@/supabase/chatService";

export default function ChatHistoryPage() {
  // Authentication and routing
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Chat sessions state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  // Load chat sessions when user is available
  useEffect(() => {
    const loadChatSessions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const sessions = await fetchChatSessions(user.id);
        setChatSessions(sessions);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load sessions";
        setError(errorMessage);
        console.error("Failed to load chat sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadChatSessions();
  }, [user]);
  // Helper function to refresh chat sessions list
  const refreshChatSessions = async () => {
    if (!user?.id) return;

    try {
      const sessions = await fetchChatSessions(user.id);
      setChatSessions(sessions);
    } catch (err) {
      console.error("Failed to refresh chat sessions:", err);
    }
  };

  // Helper function to handle errors consistently
  const handleError = (error: unknown, operation: string) => {
    const errorMessage =
      error instanceof Error ? error.message : `Failed to ${operation}`;
    setError(errorMessage);
    console.error(`${operation} error:`, error);
  };

  // Create new chat session and navigate to it
  const handleCreateNewChat = async () => {
    if (!user?.id) return;

    try {
      const newSessionId = await createChatSession(user.id, "New Chat");
      await refreshChatSessions();
      navigate(`/private/chat/${newSessionId}`);
    } catch (err) {
      handleError(err, "create new chat");
    }
  };

  // Delete a chat session with confirmation
  const handleDelete = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this chat session?")) return;

    try {
      await deleteChatSession(sessionId);
      setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      handleError(err, "delete session");
    }
  };

  // Start editing a session title
  const handleStartEdit = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setNewTitle(session.title || "");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setNewTitle("");
  };

  // Save the edited title
  const handleSaveTitle = async (sessionId: string) => {
    if (!newTitle.trim()) {
      alert("Title cannot be empty.");
      return;
    }

    try {
      await updateChatSessionTitle(sessionId, newTitle.trim());
      await refreshChatSessions();
      setEditingSessionId(null);
      setNewTitle("");
    } catch (err) {
      handleError(err, "update title");
    }
  };
  // Format date as relative time (e.g., "2 hours ago", "Yesterday")
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than a minute
    if (diffInSeconds < 60) {
      return `${diffInSeconds} s ago`;
    }

    // Less than an hour
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }

    // Less than a day
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hr ago`;
    }

    // Handle days and months
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 30) return `${diffInDays} days ago`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 1) return "1 month ago";
    return `${diffInMonths} months ago`;
  };

  // Render loading state
  const renderLoadingState = () => (
    <div className="flex h-screen bg-base-200 text-base-content">
      {" "}
      {/* Use the same flex container as the final layout */}
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        {" "}
        {/* Centering the spinner within the flex-1 area */}
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <div className="hero min-h-screen bg-base-200">
      <Sidebar />
      <div className="hero-content p-4">
        <div className="alert alert-error shadow-lg">Error: {error}</div>
      </div>
    </div>
  );

  // Render empty state when no chat sessions exist
  const renderEmptyState = () => (
    <div className="text-center py-10">
      <p className="text-xl text-gray-500">No chat sessions yet.</p>
      <p className="text-gray-400">Click "New Chat" to start a conversation.</p>
    </div>
  );

  // Render title input for editing
  const renderTitleInput = (sessionId: string) => (
    <input
      type="text"
      value={newTitle}
      onChange={(e) => setNewTitle(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleSaveTitle(sessionId);
        if (e.key === "Escape") handleCancelEdit();
      }}
      className="input input-sm input-bordered w-full max-w-xs"
      autoFocus
      onBlur={() => handleSaveTitle(sessionId)}
    />
  );

  // Render edit actions (save/cancel buttons)
  const renderEditActions = (sessionId: string) => (
    <>
      <button
        onClick={() => handleSaveTitle(sessionId)}
        className="btn btn-xs btn-ghost text-success mr-1"
        title="Save title"
      >
        <Check size={18} />
      </button>
      <button
        onClick={handleCancelEdit}
        className="btn btn-xs btn-ghost text-error"
        title="Cancel edit"
      >
        <X size={18} />
      </button>
    </>
  );

  // Render dropdown menu for session actions
  const renderSessionActions = (session: ChatSession) => (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-xs">
        <MoreVertical size={18} />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36 z-10"
      >
        <li>
          <button
            onClick={() => handleStartEdit(session)}
            className="flex items-center w-full text-left px-3 py-2 hover:bg-base-200 rounded"
          >
            <Edit3 size={16} className="mr-2" /> Rename
          </button>
        </li>
        <li>
          <button
            onClick={() => handleDelete(session.id)}
            className="flex items-center w-full text-left text-error px-3 py-2 hover:bg-base-200 rounded"
          >
            <Trash2 size={16} className="mr-2" /> Delete
          </button>
        </li>
      </ul>
    </div>
  );

  // Render a single session row
  const renderSessionRow = (session: ChatSession) => (
    <tr
      key={session.id}
      className="border-b border-base-300 hover:bg-base-200/50"
    >
      <td className="p-4">
        {editingSessionId === session.id ? (
          renderTitleInput(session.id)
        ) : (
          <Link
            href={`/private/chat/${session.id}`}
            className="link link-hover font-medium"
          >
            {session.title || "Untitled Chat"}
          </Link>
        )}
      </td>
      <td className="p-4 hidden md:table-cell">Chat prompt</td>
      <td className="p-4 text-sm text-base-content/70">
        {formatRelativeTime(session.updated_at)}
      </td>
      <td className="p-4 text-right">
        {editingSessionId === session.id
          ? renderEditActions(session.id)
          : renderSessionActions(session)}
      </td>
    </tr>
  );

  // Early returns for loading and error states
  if (authLoading || loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }
  return (
    <div className="flex h-screen bg-base-200 text-base-content">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">My files</h1>
          <button onClick={handleCreateNewChat} className="btn btn-primary">
            <PlusCircle size={20} className="mr-2" />
            New Chat
          </button>
        </div>

        {/* Content */}
        {chatSessions.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="card shadow-xl">
            <table className="table">
              <thead>
                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left hidden md:table-cell">Type</th>
                  <th className="p-4 text-left">Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>{chatSessions.map(renderSessionRow)}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

```pages/private/Dashboard.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { RefreshCw, CheckCircle, X, ArrowUpRight, ArrowDownRight, MinusCircle } from 'lucide-react';

interface IncomeStatementSummary {
  id: string;
  user_id: string;
  period_end_date: string;
  total_revenue: number;
  total_expenses: number;
  net_income: number;
  currency: string;
  // Add other relevant fields from your table
}

interface AggregatedAnnualSummary {
  year: string;
  total_revenue: number;
  total_expenses: number;
  net_income: number;
  currency?: string;
}

interface FetchSummariesResult {
  summaries: IncomeStatementSummary[];
  // Potentially add other metadata if needed from the fetch function
}

const ALL_TIME_OPTION = "All Time";
const ALL_MONTHS_OPTION = "All Months";
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const NO_COMPARISON_VALUE = "no_comparison";
const PREVIOUS_MONTH_SAME_YEAR_VALUE = "previous_month_same_year";
const SAME_MONTH_PREVIOUS_YEAR_VALUE = "same_month_previous_year";

// Helper to format numbers for display (e.g., YAxis, non-currency table values)
const formatDisplayNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString(undefined); // Default locale, adds commas
};

// Helper to format currency
const formatCurrency = (num: number | null | undefined, currencyCode: string = 'USD', signDisplay: 'auto' | 'always' | 'never' | 'exceptZero' = 'auto'): string => {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString(undefined, { style: 'currency', currency: currencyCode, signDisplay });
};

// Helper to calculate and format variance percentage
const calculateAndFormatPercentage = (current: number | null | undefined, previous: number | null | undefined): string => {
  if (current === null || current === undefined || previous === null || previous === undefined) return 'N/A';
  if (previous === 0) return 'N/A'; // Avoid division by zero
  const percentage = ((current - previous) / Math.abs(previous));
  return `${(percentage * 100).toFixed(2)}%`;
};

export default function Dashboard() {
  const { session, user } = useAuth(); 
  const authLoading = !session || !user; // Infer authLoading state
  
  const [summariesForChart, setSummariesForChart] = useState<IncomeStatementSummary[]>([]);
  const [currentYearAggregated, setCurrentYearAggregated] = useState<AggregatedAnnualSummary | null>(null);
  const [previousYearAggregated, setPreviousYearAggregated] = useState<AggregatedAnnualSummary | null>(null);
  const [allPreviousYearSummaries, setAllPreviousYearSummaries] = useState<IncomeStatementSummary[]>([]);

  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>('Initializing dashboard...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [periodOptions, setPeriodOptions] = useState<string[]>([ALL_TIME_OPTION]);
  
  const [selectedMonth, setSelectedMonth] = useState<string>(ALL_MONTHS_OPTION);
  const [comparisonSelection, setComparisonSelection] = useState<string>(NO_COMPARISON_VALUE);
  
  const [primaryMonthData, setPrimaryMonthData] = useState<IncomeStatementSummary | null>(null);
  const [comparisonPeriodData, setComparisonPeriodData] = useState<IncomeStatementSummary | null>(null);
  const [primaryMonthLabel, setPrimaryMonthLabel] = useState<string>("");
  const [comparisonPeriodLabel, setComparisonPeriodLabel] = useState<string>("");

  const prevAuthLoadingRef = useRef(authLoading);
  const initialPeriodsFetchedRef = useRef(false);
  const lastFetchedSummariesForPeriodRef = useRef<string | null>(null);

  const getVarianceColor = (variance: number, isExpense: boolean = false): string => {
    if (variance === 0) return 'text-base-content/70';
    let isGood = variance > 0;
    if (isExpense) isGood = variance < 0;
    return isGood ? 'text-success' : 'text-error';
  };

  const getVarianceIcon = (variance: number, isExpense: boolean = false) => {
    if (variance === 0) return <MinusCircle size={16} className="inline mr-1 text-base-content/70" />;
    let isPositiveEffect = variance > 0;
    if (isExpense) {
      isPositiveEffect = variance < 0; 
    }
    return isPositiveEffect ? (
      <ArrowUpRight size={16} className="inline mr-1 text-success" />
    ) : (
      <ArrowDownRight size={16} className="inline mr-1 text-error" />
    );
  };

  const fetchIncomeStatementSummariesData = useCallback(async (period: string, forPreviousYear: boolean = false): Promise<FetchSummariesResult> => {
    if (!user) return { summaries: [] }; // Ensure user context is available
    console.log(`Fetching summaries for period: ${period}, previous year: ${forPreviousYear}`);
    
    let query = supabase.from('income_statement_summaries').select('*').eq('user_id', user.id);

    if (period === ALL_TIME_OPTION) {
      query = query.order('period_end_date', { ascending: true });
    } else {
      const year = parseInt(period);
      const targetYear = forPreviousYear ? year - 1 : year;
      const startDate = `${targetYear}-01-01`;
      const endDate = `${targetYear}-12-31`;
      query = query.gte('period_end_date', startDate).lte('period_end_date', endDate).order('period_end_date', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching income statement summaries:', error);
      throw error;
    }
    return { summaries: data || [] };
  }, [user]); // Added user to dependencies

  const aggregateMonthlySummaries = useCallback((monthlySummaries: IncomeStatementSummary[], year: string, currency?: string): AggregatedAnnualSummary | null => {
    if (!monthlySummaries || monthlySummaries.length === 0) return null;

    const totals = monthlySummaries.reduce((acc, summary) => {
      acc.total_revenue += summary.total_revenue || 0;
      acc.total_expenses += summary.total_expenses || 0;
      acc.net_income += summary.net_income || 0;
      return acc;
    }, { total_revenue: 0, total_expenses: 0, net_income: 0 });

    return {
      year: year,
      total_revenue: totals.total_revenue,
      total_expenses: totals.total_expenses,
      net_income: totals.net_income,
      currency: currency || monthlySummaries[0]?.currency || 'USD',
    };
  }, []);

  const fetchAvailablePeriods = useCallback(async () => {
    if (!session || !user) return;
    console.log("Dashboard: fetchAvailablePeriods called");
    setBusy(true);
    setStatusMsg("Loading available periods...");
    try {
      const { data, error } = await supabase
        .from('income_statement_summaries')
        .select('period_end_date')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const uniqueYears = Array.from(new Set(data.map(item => new Date(item.period_end_date).getFullYear().toString())));
        setPeriodOptions([ALL_TIME_OPTION, ...uniqueYears.sort((a, b) => parseInt(b) - parseInt(a))]);
        if (!selectedPeriod && uniqueYears.length > 0) {
          const latestYear = uniqueYears.sort((a, b) => parseInt(b) - parseInt(a))[0];
          setSelectedPeriod(latestYear); 
        } else if (!selectedPeriod && uniqueYears.length === 0) {
          setSelectedPeriod(ALL_TIME_OPTION);
        }
      } else {
        setPeriodOptions([ALL_TIME_OPTION]);
        if (!selectedPeriod) {
            setSelectedPeriod(ALL_TIME_OPTION);
        }
      }
    } catch (error: any) {
      console.error("Error fetching available periods:", error);
      setErrorMsg(`Error loading periods: ${error.message}`);
      setPeriodOptions([ALL_TIME_OPTION]);
      if (!selectedPeriod) setSelectedPeriod(ALL_TIME_OPTION);
    } finally {
      setBusy(false);
      setStatusMsg(null);
    }
  }, [session, user, selectedPeriod]);

  const fetchSummaries = useCallback(async (periodToFetch: string) => {
    if (!session || !user || !periodToFetch) return;
    console.log(`Dashboard: fetchSummaries called for period: ${periodToFetch}`);
    setBusy(true);
    setStatusMsg(`Loading data for ${periodToFetch}...`);
    setErrorMsg(null);
    setSummariesForChart([]); // Clear previous chart data
    setCurrentYearAggregated(null);
    setPreviousYearAggregated(null);
    setAllPreviousYearSummaries([]);

    try {
      const currentYearDataResult = await fetchIncomeStatementSummariesData(periodToFetch);
      setSummariesForChart(currentYearDataResult.summaries);
      setStatusMsg(`Displaying ${currentYearDataResult.summaries.length} monthly records for ${periodToFetch === ALL_TIME_OPTION ? 'all time' : periodToFetch}.`);

      if (periodToFetch !== ALL_TIME_OPTION && currentYearDataResult.summaries.length > 0) {
        const currentYear = parseInt(periodToFetch);
        const aggregatedCurrent = aggregateMonthlySummaries(currentYearDataResult.summaries, periodToFetch, currentYearDataResult.summaries[0]?.currency);
        setCurrentYearAggregated(aggregatedCurrent);

        const previousYearDataResult = await fetchIncomeStatementSummariesData(periodToFetch, true);
        setAllPreviousYearSummaries(previousYearDataResult.summaries);
        if (previousYearDataResult.summaries.length > 0) {
          const aggregatedPrevious = aggregateMonthlySummaries(previousYearDataResult.summaries, (currentYear - 1).toString(), previousYearDataResult.summaries[0]?.currency);
          setPreviousYearAggregated(aggregatedPrevious);
        } else {
          setPreviousYearAggregated(null);
        }
      } else {
        setCurrentYearAggregated(null);
        setPreviousYearAggregated(null);
        setAllPreviousYearSummaries([]);
      }

    } catch (error: any) {
      console.error("Error fetching summaries:", error);
      setErrorMsg(`Error fetching summaries: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }, [session, user, fetchIncomeStatementSummariesData, aggregateMonthlySummaries]);

  useEffect(() => {
    const justLoggedIn = prevAuthLoadingRef.current && !authLoading; // True if auth state changed from loading to loaded

    if (session && user) { // User is authenticated
      // Fetch available periods if it's the first time or if the user just logged in
      if (!initialPeriodsFetchedRef.current || justLoggedIn) {
        fetchAvailablePeriods();
        initialPeriodsFetchedRef.current = true;
      }
    } else if (!session) { // User is not authenticated (e.g. logged out, session expired, or initial load)
      // Reset dashboard state
      setPeriodOptions([ALL_TIME_OPTION]);
      setSelectedPeriod(ALL_TIME_OPTION); // Default to ALL_TIME_OPTION
      setSummariesForChart([]);
      setCurrentYearAggregated(null);
      setPreviousYearAggregated(null);
      setAllPreviousYearSummaries([]);
      setSelectedMonth(ALL_MONTHS_OPTION);
      setComparisonSelection(NO_COMPARISON_VALUE);
      setPrimaryMonthData(null);
      setComparisonPeriodData(null);
      setStatusMsg('Initializing dashboard...'); // Reset status message
      setErrorMsg(null); // Clear any existing errors
      initialPeriodsFetchedRef.current = false;
      lastFetchedSummariesForPeriodRef.current = null;
    }
    prevAuthLoadingRef.current = authLoading;
  }, [authLoading, session, user, fetchAvailablePeriods]);

  useEffect(() => {
    if (session && user) { // User is authenticated
      if (selectedPeriod) {
        // Fetch summaries if the selected period has changed
        if (selectedPeriod !== lastFetchedSummariesForPeriodRef.current) {
          fetchSummaries(selectedPeriod);
          lastFetchedSummariesForPeriodRef.current = selectedPeriod;
        }
      } else {
        // If selectedPeriod becomes null (e.g., during initial load before periods are fetched)
        // and data was previously fetched, clear that data.
        if (lastFetchedSummariesForPeriodRef.current !== null) {
          setSummariesForChart([]);
          setCurrentYearAggregated(null);
          setPreviousYearAggregated(null);
          setAllPreviousYearSummaries([]);
          setStatusMsg(null); // Clear status as no data is relevant for a "null" period
          lastFetchedSummariesForPeriodRef.current = null;
        }
      }
    } else if (!session) { // User is not authenticated
      // If user logs out or session is lost, and data was previously fetched, clear it.
      // This is largely covered by the first useEffect but adds robustness.
      if (lastFetchedSummariesForPeriodRef.current !== null) {
        setSummariesForChart([]);
        setCurrentYearAggregated(null);
        setPreviousYearAggregated(null);
        setAllPreviousYearSummaries([]);
        // setStatusMsg('Initializing dashboard...'); // Or null, to be consistent with the first useEffect's reset
        lastFetchedSummariesForPeriodRef.current = null;
      }
    }
  }, [selectedPeriod, session, user, authLoading, fetchSummaries]); // authLoading is kept to react to its changes
  
  useEffect(() => {
    const findMonthData = (summaries: IncomeStatementSummary[], month: string, year: number): IncomeStatementSummary | null => {
      return summaries.find(s => {
        const summaryDate = new Date(s.period_end_date);
        return summaryDate.getFullYear() === year && monthNames[summaryDate.getMonth()] === month;
      }) || null;
    };

    if (selectedPeriod && selectedPeriod !== ALL_TIME_OPTION && selectedMonth !== ALL_MONTHS_OPTION) {
      const currentYear = parseInt(selectedPeriod);
      const foundPrimaryMonth = findMonthData(summariesForChart, selectedMonth, currentYear);
      
      if (foundPrimaryMonth) {
        setPrimaryMonthData(foundPrimaryMonth);
        setPrimaryMonthLabel(`${selectedMonth} ${currentYear}`);

        if (comparisonSelection === PREVIOUS_MONTH_SAME_YEAR_VALUE) {
          const primaryMonthIndex = monthNames.indexOf(selectedMonth);
          if (primaryMonthIndex > 0) {
            const prevMonthName = monthNames[primaryMonthIndex - 1];
            const foundComparisonMonth = findMonthData(summariesForChart, prevMonthName, currentYear);
            setComparisonPeriodData(foundComparisonMonth);
            setComparisonPeriodLabel(foundComparisonMonth ? `${prevMonthName} ${currentYear}` : "N/A");
          } else {
            setComparisonPeriodData(null);
            setComparisonPeriodLabel("N/A (No prior month in year)");
          }
        } else if (comparisonSelection === SAME_MONTH_PREVIOUS_YEAR_VALUE) {
          const foundComparisonMonth = findMonthData(allPreviousYearSummaries, selectedMonth, currentYear - 1);
          setComparisonPeriodData(foundComparisonMonth);
          setComparisonPeriodLabel(foundComparisonMonth ? `${selectedMonth} ${currentYear - 1}` : "N/A (No data for prev. year)");
        } else { // NO_COMPARISON_VALUE
          setComparisonPeriodData(null);
          setComparisonPeriodLabel("");
        }
      } else {
        setPrimaryMonthData(null);
        setPrimaryMonthLabel("");
        setComparisonPeriodData(null);
        setComparisonPeriodLabel("");
      }
    } else {
        // Clear monthly data if not applicable
        setPrimaryMonthData(null);
        setPrimaryMonthLabel("");
        setComparisonPeriodData(null);
        setComparisonPeriodLabel("");
    }
  }, [selectedPeriod, selectedMonth, comparisonSelection, summariesForChart, allPreviousYearSummaries]);

  const formatDateForXAxis = (dateString: string, currentPeriod: string | null): string => {
    const date = new Date(dateString);
    if (currentPeriod === ALL_TIME_OPTION) {
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }
    return monthNames[date.getMonth()];
  };

  if (authLoading && !session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-lg loading-spinner text-primary"></span>
      </div>
    );
  }

  const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = event.target.value;
    setSelectedPeriod(newPeriod);
    setSelectedMonth(ALL_MONTHS_OPTION); 
    setComparisonSelection(NO_COMPARISON_VALUE);
    setPrimaryMonthData(null);
    setComparisonPeriodData(null);
  };
  
  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(event.target.value);
    setComparisonSelection(NO_COMPARISON_VALUE); 
    setPrimaryMonthData(null);
    setComparisonPeriodData(null);
  };

  const handleComparisonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setComparisonSelection(event.target.value);
  };

  return (
    <div className="flex h-screen bg-base-200">
      <Sidebar />
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
        
        <div className="card bg-base-100 shadow-md">
          <div className="card-body p-4 flex-wrap flex-row items-center justify-between gap-2">
            <div className="flex flex-wrap items-end gap-4">
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-base-content/80">Select Period</span>
                </label>
                <select 
                  id="period-select"
                  value={selectedPeriod ?? ''}
                  onChange={handlePeriodChange}
                  className="select select-bordered select-sm w-full max-w-xs bg-base-100 text-base-content"
                  disabled={busy || periodOptions.length === 0 || authLoading}
                >
                  {periodOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              {selectedPeriod !== ALL_TIME_OPTION && selectedPeriod !== null && (
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-base-content/80">Select Month</span>
                  </label>
                  <select
                    id="month-select"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="select select-bordered select-sm w-full max-w-xs bg-base-100 text-base-content"
                    disabled={busy || authLoading}
                  >
                    <option value={ALL_MONTHS_OPTION}>{ALL_MONTHS_OPTION}</option>
                    {monthNames.map((month, index) => (
                      <option key={index} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
              )}
              {selectedPeriod !== ALL_TIME_OPTION && selectedPeriod !== null && selectedMonth !== ALL_MONTHS_OPTION && (
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-base-content/80">Compare With</span>
                  </label>
                  <select
                    id="comparison-select"
                    value={comparisonSelection}
                    onChange={handleComparisonChange}
                    className="select select-bordered select-sm w-full max-w-xs bg-base-100 text-base-content"
                    disabled={busy || authLoading || !primaryMonthData}
                  >
                    <option value={NO_COMPARISON_VALUE}>No Comparison</option>
                    <option value={PREVIOUS_MONTH_SAME_YEAR_VALUE}>Previous Month (Same Year)</option>
                    <option value={SAME_MONTH_PREVIOUS_YEAR_VALUE}>Same Month (Previous Year)</option>
                  </select>
                </div>
              )}
              <button
                onClick={() => selectedPeriod && fetchSummaries(selectedPeriod)}
                className="btn btn-sm btn-primary mt-auto" 
                disabled={busy || authLoading || !selectedPeriod}
              >
                {busy && selectedPeriod ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <RefreshCw size={16} />
                )}
                <span className="ml-1">Refresh</span>
              </button>
            </div>
            {statusMsg && <span className="text-sm text-base-content/70 w-full text-right pt-2 pr-2 md:w-auto md:text-left md:pt-0 md:ml-4 self-end">{statusMsg}</span>}
          </div>
        </div>

        {errorMsg && (
          <div role="alert" className="alert alert-error shadow-lg">
            <CheckCircle className="stroke-current shrink-0 h-6 w-6" />
            <span>{errorMsg}</span>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setErrorMsg(null)}
              aria-label="close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {summariesForChart.length > 0 ? (
          <div className="flex-grow card bg-base-100 shadow-xl p-4 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={summariesForChart.map(s => ({...s, period_end_date_formatted: formatDateForXAxis(s.period_end_date, selectedPeriod)}))}
                margin={{
                  top: 5,
                  right: 30,
                  left: 30, 
                  bottom: 30, 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis dataKey="period_end_date_formatted" tick={{ fontSize: 12, fill: '#FFFFFF' }} />
                <YAxis tick={{ fontSize: 12, fill: '#FFFFFF' }} tickFormatter={(value) => formatDisplayNumber(value)} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--b1))', 
                    color: 'hsl(var(--bc))', 
                    borderRadius: '0.375rem', 
                    borderColor: 'hsl(var(--n))', 
                    opacity: 0.95,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ fontSize: 12 }}
                  formatter={(value: any, name: any, entry: any) => {
                    const currency = entry?.payload?.currency || 'USD';
                    if (typeof value === 'number') {
                      return [formatCurrency(value, currency), name];
                    }
                    return [value, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px', color: 'hsl(var(--bc) / 0.8)' }} />
                <Line type="monotone" dataKey="total_revenue" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }} name="Total Revenue" dot={false} isAnimationActive={false}/>
                <Line type="monotone" dataKey="total_expenses" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 6 }} name="Total Expenses" dot={false} isAnimationActive={false}/>
                <Line type="monotone" dataKey="net_income" stroke="#22c55e" strokeWidth={2} activeDot={{ r: 6 }} name="Net Income" dot={false} isAnimationActive={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          !busy && selectedPeriod !== null && periodOptions.length > 0 && (
            <div className="flex-grow flex items-center justify-center card bg-base-100 shadow-xl p-4 min-h-[400px]">
              <p className="text-lg text-base-content/70">
                No data to display for {selectedPeriod === ALL_TIME_OPTION ? 'the selected period' : selectedPeriod}.
              </p>
            </div>
          )
        )}

         {selectedPeriod !== ALL_TIME_OPTION && selectedPeriod !== null && 
          selectedMonth === ALL_MONTHS_OPTION && 
          currentYearAggregated && previousYearAggregated && (
          <div className="mt-6 card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="text-xl font-semibold mb-4 text-base-content">
                Year-over-Year Variance Analysis ({selectedPeriod} vs {parseInt(selectedPeriod!) - 1})
              </h3>
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead className="text-base-content/90">
                    <tr className="border-b border-base-300">
                      <th className="bg-base-200/50 p-3">Metric</th>
                      <th className="bg-base-200/50 p-3 text-right">{selectedPeriod}</th>
                      <th className="bg-base-200/50 p-3 text-right">{parseInt(selectedPeriod!) - 1}</th>
                      <th className="bg-base-200/50 p-3 text-right">Variance</th>
                      <th className="bg-base-200/50 p-3 text-right">Variance (%)</th>
                    </tr>
                  </thead>
                  <tbody className="text-base-content">
                    <tr>
                      <td className="font-medium p-3">Total Revenue</td>
                      <td className="text-right p-3">{formatCurrency(currentYearAggregated.total_revenue, currentYearAggregated.currency)}</td>
                      <td className="text-right p-3">{formatCurrency(previousYearAggregated.total_revenue, previousYearAggregated.currency)}</td>
                      <td className={`font-medium text-right p-3 ${getVarianceColor(currentYearAggregated.total_revenue - previousYearAggregated.total_revenue)}`}>
                        {getVarianceIcon(currentYearAggregated.total_revenue - previousYearAggregated.total_revenue)}
                        {formatCurrency(currentYearAggregated.total_revenue - previousYearAggregated.total_revenue, currentYearAggregated.currency, 'always')}
                      </td>
                      <td className={`font-medium text-right p-3 ${getVarianceColor(currentYearAggregated.total_revenue - previousYearAggregated.total_revenue)}`}>
                        {calculateAndFormatPercentage(currentYearAggregated.total_revenue, previousYearAggregated.total_revenue)}
                      </td>
                    </tr>
                    <tr className="bg-base-200/30">
                      <td className="font-medium p-3">Total Expenses</td>
                      <td className="text-right p-3">{formatCurrency(currentYearAggregated.total_expenses, currentYearAggregated.currency)}</td>
                      <td className="text-right p-3">{formatCurrency(previousYearAggregated.total_expenses, previousYearAggregated.currency)}</td>
                      <td className={`font-medium text-right p-3 ${getVarianceColor(currentYearAggregated.total_expenses - previousYearAggregated.total_expenses, true)}`}> 
                        {getVarianceIcon(currentYearAggregated.total_expenses - previousYearAggregated.total_expenses, true)}
                        {formatCurrency(currentYearAggregated.total_expenses - previousYearAggregated.total_expenses, currentYearAggregated.currency, 'always')}
                      </td>
                      <td className={`font-medium text-right p-3 ${getVarianceColor(currentYearAggregated.total_expenses - previousYearAggregated.total_expenses, true)}`}>
                        {calculateAndFormatPercentage(currentYearAggregated.total_expenses, previousYearAggregated.total_expenses)}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-medium p-3">Net Income</td>
                      <td className="text-right p-3">{formatCurrency(currentYearAggregated.net_income, currentYearAggregated.currency)}</td>
                      <td className="text-right p-3">{formatCurrency(previousYearAggregated.net_income, previousYearAggregated.currency)}</td>
                      <td className={`font-medium text-right p-3 ${getVarianceColor(currentYearAggregated.net_income - previousYearAggregated.net_income)}`}>
                        {getVarianceIcon(currentYearAggregated.net_income - previousYearAggregated.net_income)}
                        {formatCurrency(currentYearAggregated.net_income - previousYearAggregated.net_income, currentYearAggregated.currency, 'always')}
                      </td>
                      <td className={`font-medium text-right p-3 ${getVarianceColor(currentYearAggregated.net_income - previousYearAggregated.net_income)}`}>
                        {calculateAndFormatPercentage(currentYearAggregated.net_income, previousYearAggregated.net_income)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedPeriod !== ALL_TIME_OPTION && selectedPeriod !== null &&
          selectedMonth !== ALL_MONTHS_OPTION &&
          comparisonSelection === NO_COMPARISON_VALUE &&
          primaryMonthData && (
          <div className="mt-6 card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg font-semibold text-base-content mb-4">
                Summary for {primaryMonthLabel}
              </h3>
              <div className="stats stats-vertical md:stats-horizontal shadow bg-base-100 text-base-content w-full">
                <div className="stat">
                  <div className="stat-title text-base-content/80">Total Revenue</div>
                  <div className="stat-value text-blue-500">
                    {formatCurrency(primaryMonthData.total_revenue, primaryMonthData.currency)}
                  </div>
                  <div className="stat-desc text-base-content/60">For {primaryMonthData.period_end_date}</div>
                </div>
                <div className="stat">
                  <div className="stat-title text-base-content/80">Total Expenses</div>
                  <div className="stat-value text-red-500">
                    {formatCurrency(primaryMonthData.total_expenses, primaryMonthData.currency)}
                  </div>
                   <div className="stat-desc text-base-content/60">For {primaryMonthData.period_end_date}</div>
                </div>
                <div className="stat">
                  <div className="stat-title text-base-content/80">Net Income</div>
                  <div className={`stat-value ${primaryMonthData.net_income >= 0 ? 'text-green-500' : 'text-error'}`}>
                    {formatCurrency(primaryMonthData.net_income, primaryMonthData.currency)}
                  </div>
                   <div className="stat-desc text-base-content/60">For {primaryMonthData.period_end_date}</div>
                </div>
              </div>
            </div>
          </div>
        )}

         {selectedPeriod !== ALL_TIME_OPTION && selectedPeriod !== null && 
          selectedMonth !== ALL_MONTHS_OPTION && 
          comparisonSelection !== NO_COMPARISON_VALUE && 
          primaryMonthData && comparisonPeriodData && (
          <div className="mt-6 card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="text-xl font-semibold mb-4 text-base-content">
                Monthly Variance Analysis ({primaryMonthLabel} vs {comparisonPeriodLabel})
              </h3>
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead className="text-base-content/90">
                    <tr className="border-b border-base-300">
                      <th className="bg-base-200/50 p-3">Metric</th>
                      <th className="bg-base-200/50 p-3 text-right">{primaryMonthLabel}</th>
                      <th className="bg-base-200/50 p-3 text-right">{comparisonPeriodLabel}</th>
                      <th className="bg-base-200/50 p-3 text-right">Variance</th>
                      <th className="bg-base-200/50 p-3 text-right">Variance (%)</th>
                    </tr>
                  </thead>
                  <tbody className="text-base-content">
                    <tr>
                      <td className="font-medium p-3">Total Revenue</td>
                      <td className="text-right p-3">{formatCurrency(primaryMonthData.total_revenue, primaryMonthData.currency)}</td>
                      <td className="text-right p-3">{formatCurrency(comparisonPeriodData.total_revenue, comparisonPeriodData.currency)}</td>
                      <td className={`font-medium text-right p-3 ${getVarianceColor(primaryMonthData.total_revenue - comparisonPeriodData.total_revenue)}`}>
                        {getVarianceIcon(primaryMonthData.total_revenue - comparisonPeriodData.total_revenue)}
                        {formatCurrency(primaryMonthData.total_revenue - comparisonPeriodData.total_revenue, primaryMonthData.currency, 'always')}
                      </td>
                      <td className={`font-medium text-right p-3 ${getVarianceColor(primaryMonthData.total_revenue - comparisonPeriodData.total_revenue)}`}>
                        {calculateAndFormatPercentage(primaryMonthData.total_revenue, comparisonPeriodData.total_revenue)}
                      </td>
                    </tr>
                    <tr className="bg-base-200/30">
                      <td className="font-medium p-3">Total Expenses</td>
                      <td className="text-right p-3">{formatCurrency(primaryMonthData.total_expenses, primaryMonthData.currency)}</td>
                      <td className="text-right p-3">{formatCurrency(comparisonPeriodData.total_expenses, comparisonPeriodData.currency)}</td>
                      <td className={`font-medium text-right p-3 ${getVarianceColor(primaryMonthData.total_expenses - comparisonPeriodData.total_expenses, true)}`}>
                        {getVarianceIcon(primaryMonthData.total_expenses - comparisonPeriodData.total_expenses, true)}
                        {formatCurrency(primaryMonthData.total_expenses - comparisonPeriodData.total_expenses, primaryMonthData.currency, 'always')}
                      </td>
                      <td className={`font-medium text-right p-3 ${getVarianceColor(primaryMonthData.total_expenses - comparisonPeriodData.total_expenses, true)}`}>
                        {calculateAndFormatPercentage(primaryMonthData.total_expenses, comparisonPeriodData.total_expenses)}
                      </td>
                    </tr>
                    <tr>
                      <td className="font-medium p-3">Net Income</td>
                      <td className="text-right p-3">{formatCurrency(primaryMonthData.net_income, primaryMonthData.currency)}</td>
                      <td className="text-right p-3">{formatCurrency(comparisonPeriodData.net_income, comparisonPeriodData.currency)}</td>
                      <td className={`font-medium text-right p-3 ${getVarianceColor(primaryMonthData.net_income - comparisonPeriodData.net_income)}`}>
                        {getVarianceIcon(primaryMonthData.net_income - comparisonPeriodData.net_income)}
                        {formatCurrency(primaryMonthData.net_income - comparisonPeriodData.net_income, primaryMonthData.currency, 'always')}
                      </td>
                      <td className={`font-medium text-right p-3 ${getVarianceColor(primaryMonthData.net_income - comparisonPeriodData.net_income)}`}>
                        {calculateAndFormatPercentage(primaryMonthData.net_income, comparisonPeriodData.net_income)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {periodOptions.length === 0 && !authLoading && !busy && (
          <div className="flex-grow flex items-center justify-center card bg-base-100 shadow-xl p-4 min-h-[400px]">
            <p className="text-lg text-base-content/70">No income statement data available. Please upload documents.</p>
          </div>
        )}
      </main>
    </div>
  );
}
```

```pages/private/Documents.tsx
import { useEffect, useState, useRef } from "react";
import { useSearch, Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/supabase/client";
// Removed react-pdf imports and worker config
import {
  type DocumentData,
  fetchDocuments,
  deleteDocument,
  getStatusBadgeClass,
} from "@/supabase/documents";
import Sidebar from "@/components/Sidebar";
import { Eye, Download, Trash2, X } from "lucide-react";

export default function Documents() {
  // State management
  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewContent] = useState<string>("");

  // Delete functionality state
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string>("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string>("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [docIdToDelete, setDocIdToDelete] = useState<string | null>(null);

  // URL parameter handling
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);
  const docIdFromUrl = urlParams.get("id");

  // Refs for modal control
  const deleteModalRef = useRef<HTMLDialogElement>(null);

  // New state for refresh flag
  const [refreshFlag, setRefreshFlag] = useState<number>(0);

  // PDF viewer state
  const [showPdfViewer, setShowPdfViewer] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string>("");
  const [pdfFilename, setPdfFilename] = useState<string>("");

  // Callback to refresh documents after import
  const handleFilesImported = (_files: File[]) => {
    setRefreshFlag((f) => f + 1);
  };

  // Fetch documents from Supabase
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const documents = await fetchDocuments(searchTerm, docIdFromUrl);
        setDocs(documents);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    loadDocuments();
  }, [searchTerm, docIdFromUrl, refreshFlag]);

  // Control delete confirmation modal visibility
  useEffect(() => {
    if (isDeleteModalOpen) {
      deleteModalRef.current?.showModal();
    } else {
      deleteModalRef.current?.close();
    }
  }, [isDeleteModalOpen]);

  // Utility functions
  const clearMessages = () => {
    setDeleteSuccessMessage("");
    setDeleteErrorMessage("");
  };

  // Event handlers
  const handleDeleteInitiate = (docId: string) => {
    setDocIdToDelete(docId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!docIdToDelete) return;

    clearMessages();

    try {
      await deleteDocument(docIdToDelete);
      setDocs(docs.filter((doc) => doc.id !== docIdToDelete));
      setDeleteSuccessMessage("Document deleted successfully!");
      setTimeout(() => setDeleteSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting document:", error);
      setDeleteErrorMessage(
        error instanceof Error ? error.message : "Failed to delete document"
      );
      setTimeout(() => setDeleteErrorMessage(""), 5000);
    }

    setIsDeleteModalOpen(false);
    setDocIdToDelete(null);
  };


  // Handler to view PDF
  const handleViewPdf = async (storagePath: string, filename: string) => {
    setPdfLoading(true);
    setPdfError("");
    setPdfFilename(filename);
    try {
      // Download PDF blob and create object URL with correct MIME
      const { data: fileData, error } = await supabase.storage
        .from('financial-pdfs')
        .download(storagePath);
      if (error || !fileData) throw error || new Error('No file returned');
      // Convert blob to base64 data URI
      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      const url = `data:application/pdf;base64,${base64}`;
      setPdfUrl(url);
      setShowPdfViewer(true);
    } catch (err: any) {
      console.error('Error loading PDF:', err);
      setPdfError(err.message || 'Failed to load PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  // Download PDF handler
  const handleDownloadPdf = async (storagePath: string, filename: string) => {
    try {
      const { data: fileData, error } = await supabase.storage
        .from('financial-pdfs')
        .download(storagePath);
      if (error || !fileData) throw error || new Error('No file returned');
      const blob = new Blob([await fileData.arrayBuffer()], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (err: any) {
      console.error('Error downloading PDF:', err);
      setPdfError('Failed to download PDF');
    }
  };

  // Close PDF viewer and revoke object URL
  const closePdfViewer = () => {
    setShowPdfViewer(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl("");
    }
    setPdfFilename("");
  };

  // Render helper components
  const renderAlerts = () => (
    <>
      {deleteSuccessMessage && (
        <div className="alert alert-success shadow-lg mb-4">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{deleteSuccessMessage}</span>
          </div>
        </div>
      )}
      {deleteErrorMessage && (
        <div className="alert alert-error shadow-lg mb-4">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{deleteErrorMessage}</span>
          </div>
        </div>
      )}
      {docIdFromUrl && (
        <div className="alert alert-info shadow-lg mb-4">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current flex-shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Showing document with ID: {docIdFromUrl}</span>
            <Link
              href="/private/documents"
              className="btn btn-sm btn-outline ml-4"
            >
              Show All Documents
            </Link>
          </div>
        </div>
      )}
    </>
  );

  const renderSearchInput = () => (
    <input
      type="text"
      placeholder="Search by filename"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="input input-bordered w-full max-w-xs mb-4"
      disabled={!!docIdFromUrl}
    />
  );

  const renderTableHeader = () => (
    <thead className="bg-base-300">
      <tr>
        <th className="text-base-content border-r border-base-300">No.</th>
        <th className="text-base-content border-r border-base-300">File Name</th>
        <th className="text-base-content border-r border-base-300">Upload Time</th>
        <th className="text-base-content border-r border-base-300">Type</th>
        <th className="text-base-content border-r border-base-300 max-w-xs truncate">Doc Summary</th>
        <th className="text-base-content border-r border-base-300">Status</th>
        <th className="text-base-content">Actions</th>
      </tr>
    </thead>
  );

  const renderEmptyState = () => {
    if (docs.length === 0 && docIdFromUrl) {
      return (
        <tr>
          <td colSpan={6} className="text-center py-8">
            <div className="text-warning">
              No document found with ID: {docIdFromUrl}
            </div>
            <Link
              href="/private/documents"
              className="btn btn-sm btn-primary mt-2"
            >
              View All Documents
            </Link>
          </td>
        </tr>
      );
    }

    if (docs.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="text-center py-8 text-base-content">
            No documents found
          </td>
        </tr>
      );
    }

    return null;
  };

  const renderDocumentRow = (doc: DocumentData, index: number) => (
    <tr key={doc.id} className="hover:bg-base-200 border-b border-base-300">
      <td className="font-medium border-r border-base-300">{index + 1}</td>
      <td className="border-r border-base-300">{doc.filename}</td>
      <td className="text-sm whitespace-nowrap border-r border-base-300">{new Date(doc.upload_timestamp).toLocaleString()}</td>
      <td className="text-sm border-r border-base-300">{doc.doc_specific_type}</td>
      <td className="text-sm max-w-xs truncate border-r border-base-300 relative group" title={doc.doc_summary}>
        {doc.doc_summary}
        {doc.doc_summary && (
          <span className="absolute left-1/2 z-50 hidden group-hover:flex -translate-x-1/2 mt-2 px-3 py-2 rounded shadow-lg bg-base-200 text-base-content text-xs whitespace-pre-line max-w-xs border border-base-300">
            {doc.doc_summary}
          </span>
        )}
      </td>
      <td className="border-r border-base-300">
        <span className={`badge ${getStatusBadgeClass(doc.status)} badge-sm`}>
          {doc.status}
        </span>
      </td>
      <td>
        <button
          onClick={() => handleViewPdf(doc.storage_path, doc.filename)}
          className="btn btn-primary btn-sm btn-outline mr-2"
          aria-label="View PDF"
          title="View PDF"
        >
          <Eye size={18} />
        </button>
        <button
          onClick={() => handleDownloadPdf(doc.storage_path, doc.filename)}
          className="btn btn-secondary btn-sm btn-outline mr-2"
          aria-label="Download"
          title="Download"
        >
          <Download size={18} />
        </button>
        <button
          onClick={() => handleDeleteInitiate(doc.id)}
          className="btn btn-error btn-sm btn-outline"
          aria-label="Delete"
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );

  const renderPreviewPanel = () => {
    if (!showPreview) return null;

    return (
      <div className="fixed top-0 right-0 h-full w-1/2 max-w-3xl bg-base-100 border-l shadow-lg z-50 flex flex-col">
        <div className="relative flex-shrink-0 p-2">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={() => setShowPreview(false)}
          >
            ✕
          </button>
          <h3 className="font-bold text-lg p-2">Document Preview</h3>
        </div>
        <div
          className="prose max-w-none overflow-y-auto p-4 flex-1"
          style={{ maxHeight: "calc(100vh - 5rem)" }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {previewContent}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  const renderDeleteModal = () => (
    <dialog
      ref={deleteModalRef}
      id="delete_confirm_modal"
      className="modal"
      onClose={() => setIsDeleteModalOpen(false)}
    >
      <div className="modal-box">
        <h3 className="font-bold text-lg">Confirm Deletion</h3>
        <p className="py-4">
          Are you sure you want to delete this document? This action cannot be
          undone.
        </p>
        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </button>
          <button className="btn btn-error" onClick={handleConfirmDelete}>
            Delete
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setIsDeleteModalOpen(false)}>close</button>
      </form>{" "}
    </dialog>
  );

  // Main component render
  return (
    <div className="flex relative h-screen bg-base-200">
      <Sidebar onFilesImported={handleFilesImported} />
      <div className="flex flex-col flex-1 p-4 overflow-auto">
        {renderAlerts()}
        {renderSearchInput()}

        <div className="overflow-x-auto shadow-md rounded-box">
          <table className="table table-zebra w-full border border-base-300">
            {renderTableHeader()}
            <tbody>
              {renderEmptyState() ||
                docs.map((doc, index) => renderDocumentRow(doc, index))}
            </tbody>
          </table>
        </div>
      </div>

      {renderPreviewPanel()}
      {showPdfViewer && (
        <div className="fixed top-0 right-0 h-full w-1/2 max-w-3xl bg-base-100 border-l shadow-lg z-50 flex flex-col">
          <div className="flex items-center justify-between p-2 border-b">
            <span className="font-mono text-base font-semibold truncate" title={pdfFilename}>{pdfFilename}</span>
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => handleDownloadPdf(docs.find(d => d.filename === pdfFilename)?.storage_path || '', pdfFilename)}
                disabled={pdfLoading || !pdfFilename}
                aria-label="Download"
                title="Download"
              >
                <Download size={18} />
              </button>
              <button
                className="btn btn-sm btn-circle"
                onClick={closePdfViewer}
                aria-label="Close"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-2">
            {pdfLoading && (
              <div className="flex justify-center items-center h-full">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}
            {pdfError && (
              <div className="alert alert-error shadow-lg">
                <div><span>{pdfError}</span></div>
              </div>
            )}
            {pdfUrl && !pdfLoading && !pdfError && (
              <embed
                src={pdfUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                className="flex-1"
              />
            )}
          </div>
        </div>
      )}
      {renderDeleteModal()}
    </div>
  );
}
```

```pages/private/Profile.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase/client";
import Sidebar from "@/components/Sidebar";
import Notification from "@/components/Notification";

interface Profile {
  full_name: string | null;
  company_name: string | null;
  role_in_company: string | null;
  app_settings: any;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tempProfile, setTempProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{id: number; message: React.ReactNode} | null>(null);

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "full_name, company_name, role_in_company, app_settings, created_at, updated_at"
        )
        .eq("id", user.id)
        .single<Profile>();
      if (error) {
        setError(error.message);
      } else if (data) {
        setProfile(data);
        setTempProfile(data);
      }
      setLoading(false);
    };
    loadProfile();
  }, [user]);

  const handleFieldSave = async (field: keyof Profile) => {
    if (!user || !profile) return;
    const newValue = tempProfile[field] ?? profile[field];
    if (newValue === profile[field]) return;
    try {
      await supabase.from('profiles').update({ [field]: newValue }).eq('id', user.id);
      setProfile(prev => prev ? { ...prev, [field]: newValue as any } : prev);
      setNotification({ id: Date.now(), message: `${field.replace('_', ' ')} saved` });
    } catch (e: any) {
      setNotification({ id: Date.now(), message: `Error saving ${field}: ${e.message}` });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center text-error p-4">
        Error loading profile: {error}
      </div>
    );
  }
  if (!profile) {
    return <div className="text-center p-4">No profile found.</div>;
  }

  return (
    <div className="flex h-screen bg-base-200 text-base-content">
      <Sidebar />
      <div className="flex-1 p-6 relative">
        {notification && (
          <Notification key={notification.id} message={notification.message} onClose={() => setNotification(null)} />
        )}
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            {/* Full Name Field */}
            <div className="flex items-center mb-4 gap-2">
              <label className="font-semibold w-40 text-lg">Full Name:</label>
              <input
                className="input input-bordered input-md flex-1 text-lg"
                value={tempProfile.full_name ?? profile.full_name ?? ''}
                onChange={e => setTempProfile(prev => ({ ...prev, full_name: e.target.value }))}
                onBlur={() => handleFieldSave('full_name')}
                onKeyDown={e => {
                  if (e.key === 'Enter') { handleFieldSave('full_name'); e.currentTarget.blur(); }
                }}
              />
            </div>
            {/* Company Name Field */}
            <div className="flex items-center mb-4 gap-2">
              <label className="font-semibold w-40 text-lg">Company Name:</label>
              <input
                className="input input-bordered input-md flex-1 text-lg"
                value={tempProfile.company_name ?? profile.company_name ?? ''}
                onChange={e => setTempProfile(prev => ({ ...prev, company_name: e.target.value }))}
                onBlur={() => handleFieldSave('company_name')}
                onKeyDown={e => {
                  if (e.key === 'Enter') { handleFieldSave('company_name'); e.currentTarget.blur(); }
                }}
              />
            </div>
            {/* Role Field */}
            <div className="flex items-center mb-4 gap-2">
              <label className="font-semibold w-40 text-lg">Role:</label>
              <input
                className="input input-bordered input-md flex-1 text-lg"
                value={tempProfile.role_in_company ?? profile.role_in_company ?? ''}
                onChange={e => setTempProfile(prev => ({ ...prev, role_in_company: e.target.value }))}
                onBlur={() => handleFieldSave('role_in_company')}
                onKeyDown={e => {
                  if (e.key === 'Enter') { handleFieldSave('role_in_company'); e.currentTarget.blur(); }
                }}
              />
            </div>
            {/* App Settings Display */}
            {/* {profile.app_settings && (
              <div>
                <span className="font-semibold">Settings:</span>{" "}
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(profile.app_settings, null, 2)}
                </pre>
              </div>
            )} */}
            {/* Timestamps */}
            <div className="text-sm text-base-content/70">
              <div>Created: {new Date(profile.created_at).toLocaleString()}</div>
              <div>Last Updated: {new Date(profile.updated_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

```supabase/chatService.ts
import { supabase } from "./client";

// Define ChatMessage Structure (consistent with Chat.tsx)
export interface ChatMessagePart {
  content: string;
  timestamp?: string;
  dynamic_ref?: any | null;
  part_kind: "system-prompt" | "user-prompt" | "text";
}

export interface ChatMessage {
  parts: Array<ChatMessagePart>;
  instructions?: any | null;
  kind: "request" | "response";
  usage?: {
    requests: number;
    request_tokens: number;
    response_tokens: number;
    total_tokens: number;
    details: Record<string, number>;
  };
  model_name?: string;
  timestamp?: string;
  vendor_details?: any | null;
  vendor_id?: string;
}

// Define ChatSession Structures
export interface ChatSessionBase {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

// For list view in ChatHistory, history field is not essential
export interface ChatSession extends ChatSessionBase {
  // No history field here by default for lighter list items
}

export interface ChatSessionWithHistory extends ChatSessionBase {
  history: ChatMessage[];
}

// --- Supabase Functions ---

export async function createChatSession(
  userId: string,
  title?: string
): Promise<string> {
  // Returns new session ID
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: userId, history: [], title: title || "New Chat" }) // created_at, updated_at have defaults or triggers
    .select("id")
    .single();
  if (error) {
    console.error("Error creating chat session:", error);
    throw error;
  }
  return data.id;
}

export async function fetchChatSessions(
  userId: string
): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, user_id, title, created_at, updated_at") // No history for list
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("Error fetching chat sessions:", error);
    throw error;
  }
  return data || [];
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId);
  if (error) {
    console.error("Error deleting chat session:", error);
    throw error;
  }
}

export async function updateChatSessionTitle(
  sessionId: string,
  newTitle: string
): Promise<void> {
  const { error } = await supabase
    .from("chat_sessions")
    .update({ title: newTitle }) // Relies on DB trigger for updated_at
    .eq("id", sessionId);
  if (error) {
    console.error("Error updating chat session title:", error);
    throw error;
  }
}

export async function fetchChatSessionById(
  sessionId: string
): Promise<ChatSessionWithHistory | null> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, user_id, title, created_at, updated_at, history")
    .eq("id", sessionId)
    .single();

  if (error) {
    console.error("Error fetching chat session by ID:", error.message);
    // PGRST116: "JSON object requested, multiple (or no) rows returned"
    // This code means no rows found or RLS prevented access.
    if (error.code === "PGRST116") return null;
    throw error;
  }
  // Ensure history is an array, default to empty if null/undefined from DB
  return data ? { ...data, history: data.history || [] } : null;
}

export async function updateChatSessionHistory(
  sessionId: string,
  newHistory: ChatMessage[]
): Promise<void> {
  const { error } = await supabase
    .from("chat_sessions")
    .update({ history: newHistory }) // Relies on DB trigger for updated_at
    .eq("id", sessionId);

  if (error) {
    console.error("Error updating chat session history:", error);
    throw error;
  }
}
```

```supabase/client.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// sign in with email & password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.session;
}

// sign out current user
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

```supabase/documents.ts
import { ENDPOINTS } from "@/config/api";
import { supabase } from "./client";

// Updated DocumentData interface to match the database schema
export interface DocumentData {
  id: string;
  filename: string;
  upload_timestamp: string;
  status: string;
  doc_type: string;
  doc_specific_type: string;
  doc_summary: string;
  full_markdown_content: string;
  storage_path: string; // Path in supabase storage for PDF file
}

// Legacy interface for backward compatibility
export interface Doc {
  id: string;
  filename: string;
  user_id: string;
}

// Fetch documents from Supabase with optional filters
export async function fetchDocuments(
  searchTerm?: string,
  docId?: string | null
): Promise<DocumentData[]> {
  const query = supabase
    .from("documents")
    .select(
      "id, filename, upload_timestamp, status, doc_type, doc_specific_type, doc_summary, full_markdown_content, storage_path"
    )
    .order("upload_timestamp", { ascending: false });

  // Filter by specific document ID or search term
  if (docId) {
    query.eq("id", docId);
  } else if (searchTerm) {
    query.ilike("filename", `%${searchTerm}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Error fetching documents: ${error.message}`);
  }

  return (data as DocumentData[]) || [];
}

// Delete a document by ID
export async function deleteDocument(docId: string): Promise<void> {
  // 1. Fetch the document details (specifically storage_path) first
  // We need this to know which file to delete from storage later.
  const { data: docToDelete, error: fetchError } = await supabase
    .from("documents")
    .select("storage_path") // Only select the storage_path
    .eq("id", docId)
    .single(); // Expect one document or null if not found
  if (fetchError) {
    // Handle "not found" case gracefully - document may already be deleted
    if (fetchError.code === 'PGRST116') {
      console.log(`Document with ID ${docId} not found in database. Assumed already deleted.`);
      return; // Exit early - nothing to delete
    }
    // For other errors, throw
    throw new Error(
      `Error fetching document details for deletion (ID: ${docId}): ${fetchError.message}`
    );
  }

  // 2. Delete the document record from the database
  const { error: dbDeleteError } = await supabase
    .from("documents")
    .delete()
    .match({ id: docId });

  if (dbDeleteError) {
    throw new Error(
      `Failed to delete document record from database (ID: ${docId}): ${dbDeleteError.message}`
    );
  }
  // 3. If database deletion was successful, and we have a storage path, delete from storage
  if (docToDelete?.storage_path) {
    // Document existed and its record was deleted from the database.
    // Now, attempt to delete the associated file from storage.
    const { error: storageError } = await supabase.storage
      .from("financial-pdfs") // As specified, the bucket name is 'financial-pdfs'
      .remove([docToDelete.storage_path]);

    if (storageError) {
      // Critical error: DB record is gone, but file deletion failed.
      throw new Error(
        `Document record (ID: ${docId}) deleted, but failed to remove file '${docToDelete.storage_path}' from storage: ${storageError.message}`
      );
    }
    // Successfully deleted from both database and storage
    console.log(
      `Successfully deleted document (ID: ${docId}) and associated file '${docToDelete.storage_path}' from storage.`
    );
  } else {
    // Document record was deleted, but it had no storage_path.
    console.warn(
      `Document record (ID: ${docId}) deleted, but no storage_path was found. No file removed from storage.`
    );
  }
}

// Utility function for status badge classes
export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "completed":
      return "badge-success";
    case "processing":
      return "badge-warning";
    default:
      return "badge-ghost";
  }
}

// Legacy API fetch function
export async function fetchDocumentsAPI(accessToken: string): Promise<Doc[]> {
  const res = await fetch(ENDPOINTS.DOCUMENTS, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  console.log(res);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Process a PDF file by sending it as pdf_file_buffer with access token
export async function processDocument(
  file: File,
  accessToken: string
): Promise<any> {
  const formData = new FormData();
  // Use 'file' as the field name to match FastAPI's UploadFile parameter
  formData.append("file", file);

  const res = await fetch(`${ENDPOINTS.DOCUMENTS}/process`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Verify which of the given filenames already exist on the server for this user.
 * Throws on query error; returns array of existing filenames.
 */
export async function verifyFileNames(
  userId: string,
  filenames: string[]
): Promise<string[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("filename")
    .eq("user_id", userId)
    .in("filename", filenames);
  if (error) throw error;
  return (data || []).map((row) => row.filename);
}
```

```supabase/pdfNavigation.ts
import { supabase } from './client';

export interface DocumentInfo {
  id: string;
  filename: string;
  storage_path: string;
  doc_type: string;
  company_name: string | null;
  report_date: Date | null;
}

/**
 * Get document information by ID for PDF navigation
 */
export async function getDocumentInfo(documentId: string): Promise<DocumentInfo | null> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('id, filename, storage_path, doc_type, company_name, report_date')
      .eq('id', documentId)
      .single();

    if (error) {
      console.error('Error fetching document info:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching document info:', error);
    return null;
  }
}

/**
 * Verify if a document exists and is accessible by the current user
 */
export async function verifyDocumentAccess(documentId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error verifying document access:', error);
    return false;
  }
}
```

```types/chart.ts
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
```

```types/pdfnav.ts
export interface PDFNavData {
  documentId: string;
  filename: string;
  page: number;
  context: string;
  highlight?: {
    text: string;
  };
}
```

