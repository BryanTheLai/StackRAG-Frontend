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
