"use client"

import { useState } from "react"
import {
  BrainCircuit,
  MessageSquare,
  LineChart,
  Calculator,
  Users,
  Sparkles,
  Search,
  ArrowRight,
  Lightbulb,
  Wand2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer } from "@/components/ui/chart"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"

interface AIToolsProps {
  data: any[]
  columns: string[]
}

export function AITools({ data, columns }: AIToolsProps) {
  const [activeTab, setActiveTab] = useState("insights")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [query, setQuery] = useState("")
  const [queryResult, setQueryResult] = useState<any>(null)
  const [insightsResult, setInsightsResult] = useState<any>(null)
  const [forecastResult, setForecastResult] = useState<any>(null)
  const [regressionResult, setRegressionResult] = useState<any>(null)
  const [cohortResult, setCohortResult] = useState<any>(null)
  const [fuzzyMatchResult, setFuzzyMatchResult] = useState<any>(null)

  // Settings for various tools
  const [timeColumn, setTimeColumn] = useState<string>("")
  const [valueColumn, setValueColumn] = useState<string>("")
  const [forecastPeriods, setForecastPeriods] = useState(12)
  const [seasonality, setSeasonality] = useState(true)
  const [confidenceInterval, setConfidenceInterval] = useState(true)
  const [targetColumn, setTargetColumn] = useState<string>("")
  const [featureColumns, setFeatureColumns] = useState<string[]>([])
  const [modelType, setModelType] = useState("linear")
  const [cohortColumn, setCohortColumn] = useState<string>("")
  const [dateColumn, setDateColumn] = useState<string>("")
  const [metricColumn, setMetricColumn] = useState<string>("")
  const [textColumn, setTextColumn] = useState<string>("")
  const [similarityThreshold, setSimilarityThreshold] = useState(80)

  // Filter columns by type
  const numericColumns = columns.filter((column) => {
    return data.some((row) => {
      const val = row[column]
      return val !== null && val !== undefined && !isNaN(Number(val))
    })
  })

  const dateColumns = columns.filter((column) => {
    return data.some((row) => {
      const val = row[column]
      return val !== null && val !== undefined && !isNaN(Date.parse(String(val)))
    })
  })

  const textColumns = columns.filter((column) => {
    return data.some((row) => {
      const val = row[column]
      return val !== null && val !== undefined && typeof val === "string"
    })
  })

  const handleGenerateInsights = () => {
    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate AI processing
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        if (newProgress >= 100) {
          clearInterval(interval)

          // Generate mock insights
          const insights = [
            {
              type: "trend",
              title: "Upward Trend Detected",
              description:
                "There's a significant upward trend in revenue over the last 6 months, with an average growth rate of 12.5% month-over-month.",
              importance: 0.92,
              relatedColumns: ["Revenue", "Date"],
            },
            {
              type: "outlier",
              title: "Outlier Detected",
              description:
                "An unusual spike in customer acquisition was detected in March 2023, 3.2x higher than the average.",
              importance: 0.85,
              relatedColumns: ["New Customers", "Date"],
            },
            {
              type: "correlation",
              title: "Strong Correlation Found",
              description:
                "Marketing spend shows a strong positive correlation (r=0.87) with sales in the following month.",
              importance: 0.78,
              relatedColumns: ["Marketing Spend", "Sales"],
            },
            {
              type: "segment",
              title: "Customer Segment Analysis",
              description:
                "Premium tier customers have 2.3x higher lifetime value but are growing at only half the rate of standard tier customers.",
              importance: 0.75,
              relatedColumns: ["Customer Tier", "Lifetime Value", "Growth Rate"],
            },
            {
              type: "seasonality",
              title: "Seasonal Pattern Identified",
              description:
                "Product usage shows a clear weekly pattern with 40% higher activity on weekdays compared to weekends.",
              importance: 0.72,
              relatedColumns: ["Usage", "Day of Week"],
            },
          ]

          setInsightsResult(insights)
          setIsGenerating(false)
          return 100
        }
        return newProgress
      })
    }, 200)
  }

  const handleNaturalLanguageQuery = () => {
    if (!query.trim()) return

    setIsGenerating(true)
    setGenerationProgress(0)
    setQueryResult(null)

    // Simulate AI processing
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        if (newProgress >= 100) {
          clearInterval(interval)

          // Generate mock query result based on the query
          let result

          if (query.toLowerCase().includes("top") && query.toLowerCase().includes("product")) {
            result = {
              type: "table",
              title: "Top 5 Products by Revenue",
              data: [
                { product: "Product A", revenue: 125000, units: 1250 },
                { product: "Product B", revenue: 98000, units: 980 },
                { product: "Product C", revenue: 87500, units: 1750 },
                { product: "Product D", revenue: 76000, units: 950 },
                { product: "Product E", revenue: 65000, units: 1300 },
              ],
              columns: ["product", "revenue", "units"],
            }
          } else if (query.toLowerCase().includes("trend") || query.toLowerCase().includes("over time")) {
            result = {
              type: "chart",
              title: "Revenue Trend Over Time",
              chartType: "line",
              data: Array.from({ length: 12 }, (_, i) => ({
                month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
                revenue: 50000 + Math.random() * 50000 + i * 5000,
              })),
              xAxis: "month",
              yAxis: "revenue",
            }
          } else if (query.toLowerCase().includes("compare") || query.toLowerCase().includes("comparison")) {
            result = {
              type: "chart",
              title: "Category Comparison",
              chartType: "bar",
              data: [
                { category: "Electronics", revenue: 450000, profit: 125000 },
                { category: "Clothing", revenue: 320000, profit: 96000 },
                { category: "Home Goods", revenue: 280000, profit: 84000 },
                { category: "Books", revenue: 150000, profit: 45000 },
              ],
              xAxis: "category",
              yAxis: ["revenue", "profit"],
            }
          } else {
            result = {
              type: "text",
              title: "Analysis Result",
              content:
                "Based on your data, I found that the average customer spends $127.35 per order, with a standard deviation of $42.18. The most active customers are in the 25-34 age bracket, accounting for 37% of total revenue.",
            }
          }

          setQueryResult(result)
          setIsGenerating(false)
          return 100
        }
        return newProgress
      })
    }, 200)
  }

  const handleGenerateTimeSeries = () => {
    if (!timeColumn || !valueColumn) return

    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate AI processing
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        if (newProgress >= 100) {
          clearInterval(interval)

          // Generate mock forecast data
          const historicalData = Array.from({ length: 24 }, (_, i) => {
            const date = new Date()
            date.setMonth(date.getMonth() - 24 + i)

            // Add some seasonality if enabled
            const seasonalComponent = seasonality ? Math.sin((i * Math.PI) / 6) * 1000 : 0

            return {
              date: date.toISOString().split("T")[0],
              value: 5000 + i * 100 + seasonalComponent + (Math.random() * 1000 - 500),
            }
          })

          const forecastData = Array.from({ length: forecastPeriods }, (_, i) => {
            const date = new Date()
            date.setMonth(date.getMonth() + i)

            // Add some seasonality if enabled
            const seasonalComponent = seasonality ? Math.sin(((i + 24) * Math.PI) / 6) * 1000 : 0

            const predictedValue = 5000 + (i + 24) * 100 + seasonalComponent

            return {
              date: date.toISOString().split("T")[0],
              prediction: predictedValue,
              upper: confidenceInterval ? predictedValue * 1.1 : undefined,
              lower: confidenceInterval ? predictedValue * 0.9 : undefined,
            }
          })

          setForecastResult({
            historicalData,
            forecastData,
            metrics: {
              mape: 8.2, // Mean Absolute Percentage Error
              rmse: 423.5, // Root Mean Square Error
              seasonalityDetected: seasonality,
              seasonalityPattern: seasonality ? "Monthly" : null,
            },
          })

          setIsGenerating(false)
          return 100
        }
        return newProgress
      })
    }, 200)
  }

  const handleGenerateRegression = () => {
    if (!targetColumn || featureColumns.length === 0) return

    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate AI processing
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        if (newProgress >= 100) {
          clearInterval(interval)

          // Generate mock regression results
          const coefficients = featureColumns.map((col) => ({
            feature: col,
            coefficient: (Math.random() * 2 - 1).toFixed(4),
            pValue: (Math.random() * 0.1).toFixed(4),
            significance: Math.random() > 0.7 ? "High" : Math.random() > 0.4 ? "Medium" : "Low",
          }))

          // Generate scatter plot data
          const scatterData = Array.from({ length: 50 }, (_, i) => {
            const x = Math.random() * 100
            // Add some noise to the linear relationship
            const y = x * 0.5 + 20 + (Math.random() * 20 - 10)
            return { x, y, id: i }
          })

          setRegressionResult({
            modelType: modelType,
            r2: 0.78, // R-squared
            adjustedR2: 0.76,
            coefficients,
            scatterData,
            predictions: [
              { actual: 42, predicted: 45.2, error: 3.2 },
              { actual: 38, predicted: 36.5, error: -1.5 },
              { actual: 56, predicted: 58.1, error: 2.1 },
              { actual: 29, predicted: 31.4, error: 2.4 },
              { actual: 71, predicted: 68.9, error: -2.1 },
            ],
          })

          setIsGenerating(false)
          return 100
        }
        return newProgress
      })
    }, 200)
  }

  const handleGenerateCohort = () => {
    if (!cohortColumn || !dateColumn || !metricColumn) return

    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate AI processing
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        if (newProgress >= 100) {
          clearInterval(interval)

          // Generate mock cohort analysis data
          const cohorts = ["Jan 2023", "Feb 2023", "Mar 2023", "Apr 2023", "May 2023", "Jun 2023"]
          const periods = ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"]

          const cohortData = cohorts.map((cohort, i) => {
            const row: any = { cohort }

            // Generate retention/metric values for each period
            periods.forEach((period, j) => {
              if (j <= 5 - i) {
                // Only generate data for periods that have passed
                // Retention generally decreases over time
                const baseValue = 100 - j * 15 + (Math.random() * 10 - 5)
                row[period] = Math.max(0, Math.round(baseValue))
              }
            })

            return row
          })

          setCohortResult({
            cohortData,
            cohorts,
            periods,
            metric: metricColumn,
            insights: [
              "The January 2023 cohort shows the highest retention in Month 3 compared to other cohorts",
              "Month 2 has the steepest drop in retention across all cohorts",
              "The most recent cohorts are showing improved initial retention",
            ],
          })

          setIsGenerating(false)
          return 100
        }
        return newProgress
      })
    }, 200)
  }

  const handleFuzzyMatching = () => {
    if (!textColumn) return

    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate AI processing
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        const newProgress = prev + Math.random() * 10
        if (newProgress >= 100) {
          clearInterval(interval)

          // Generate mock fuzzy matching results
          const matchGroups = [
            {
              canonical: "New York City",
              matches: ["New York", "NYC", "New York City", "NY City"],
              similarity: [92, 87, 100, 85],
            },
            {
              canonical: "San Francisco",
              matches: ["San Francisco", "SF", "San Fran", "Sanfrancisco"],
              similarity: [100, 82, 89, 94],
            },
            {
              canonical: "Los Angeles",
              matches: ["Los Angeles", "LA", "Los Angles", "LA City"],
              similarity: [100, 84, 95, 86],
            },
          ]

          setFuzzyMatchResult({
            column: textColumn,
            threshold: similarityThreshold,
            matchGroups,
            totalMatches: matchGroups.reduce((acc, group) => acc + group.matches.length, 0),
            uniqueValues: matchGroups.length,
            potentialDuplicates: matchGroups.reduce((acc, group) => acc + group.matches.length - 1, 0),
          })

          setIsGenerating(false)
          return 100
        }
        return newProgress
      })
    }, 200)
  }

  const toggleFeatureColumn = (column: string) => {
    setFeatureColumns((prev) => (prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5" />
          AI-Powered Analysis Tools
        </CardTitle>
        <CardDescription>Advanced AI tools to extract deeper insights from your data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden md:inline">Auto Insights</span>
            </TabsTrigger>
            <TabsTrigger value="nlq" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">Natural Language</span>
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span className="hidden md:inline">Forecasting</span>
            </TabsTrigger>
            <TabsTrigger value="regression" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden md:inline">Regression</span>
            </TabsTrigger>
            <TabsTrigger value="cohort" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Cohort Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="fuzzy" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden md:inline">Fuzzy Matching</span>
            </TabsTrigger>
          </TabsList>

          {/* AI-Powered Insights */}
          <TabsContent value="insights" className="space-y-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  Automatically discover meaningful patterns, trends, and anomalies in your data using machine learning.
                  Our AI will analyze your dataset and generate actionable insights.
                </p>
              </div>

              <Button
                onClick={handleGenerateInsights}
                disabled={isGenerating || data.length === 0}
                className="w-full sm:w-auto"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Insights
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing data...</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} />
                </div>
              )}

              {insightsResult && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-medium">Key Insights</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {insightsResult.map((insight: any, index: number) => (
                      <Card
                        key={index}
                        className={`border-l-4 ${
                          insight.type === "trend"
                            ? "border-l-blue-500"
                            : insight.type === "outlier"
                              ? "border-l-red-500"
                              : insight.type === "correlation"
                                ? "border-l-purple-500"
                                : insight.type === "segment"
                                  ? "border-l-green-500"
                                  : "border-l-amber-500"
                        }`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{insight.title}</CardTitle>
                            <div className="px-2 py-1 bg-muted rounded-full text-xs">
                              {Math.round(insight.importance * 100)}% confidence
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p>{insight.description}</p>
                          <div className="flex gap-2 mt-2">
                            {insight.relatedColumns.map((col: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-muted rounded-full text-xs">
                                {col}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Natural Language Queries */}
          <TabsContent value="nlq" className="space-y-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  Ask questions about your data in plain English. Our AI will interpret your question and provide
                  answers with visualizations where appropriate.
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="e.g., What were the top 5 products by revenue last month?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleNaturalLanguageQuery}
                  disabled={isGenerating || !query.trim() || data.length === 0}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Ask
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>Example queries:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>What were the top 5 products by revenue last month?</li>
                  <li>Show me the revenue trend over the past year</li>
                  <li>Compare sales by category</li>
                  <li>What's the average order value by customer segment?</li>
                </ul>
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing query...</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} />
                </div>
              )}

              {queryResult && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-medium">{queryResult.title}</h3>

                  {queryResult.type === "table" && (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {queryResult.columns.map((col: string) => (
                              <TableHead key={col} className="capitalize">
                                {col}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {queryResult.data.map((row: any, i: number) => (
                            <TableRow key={i}>
                              {queryResult.columns.map((col: string) => (
                                <TableCell key={col}>
                                  {typeof row[col] === "number" ? row[col].toLocaleString() : row[col]}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {queryResult.type === "chart" && queryResult.chartType === "line" && (
                    <ChartContainer className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={queryResult.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={queryResult.xAxis} />
                          <YAxis />
                          <Tooltip formatter={(value) => value.toLocaleString()} />
                          <Legend />
                          <Line type="monotone" dataKey={queryResult.yAxis} stroke="#8884d8" activeDot={{ r: 8 }} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}

                  {queryResult.type === "chart" && queryResult.chartType === "bar" && (
                    <ChartContainer className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={queryResult.data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey={queryResult.xAxis} />
                          <YAxis />
                          <Tooltip formatter={(value) => value.toLocaleString()} />
                          <Legend />
                          {Array.isArray(queryResult.yAxis) ? (
                            queryResult.yAxis.map((axis: string, index: number) => (
                              <Bar key={axis} dataKey={axis} fill={index === 0 ? "#8884d8" : "#82ca9d"} />
                            ))
                          ) : (
                            <Bar dataKey={queryResult.yAxis} fill="#8884d8" />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}

                  {queryResult.type === "text" && (
                    <div className="p-4 border rounded-md bg-muted/20">
                      <p>{queryResult.content}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Time Series Forecasting */}
          <TabsContent value="forecast" className="space-y-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  Generate time series forecasts with advanced modeling techniques. Our AI will automatically detect
                  seasonality patterns and provide accurate predictions with confidence intervals.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="time-column">Time Column</Label>
                  <Select value={timeColumn} onValueChange={setTimeColumn}>
                    <SelectTrigger id="time-column">
                      <SelectValue placeholder="Select time column" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateColumns.map((column) => (
                        <SelectItem key={column} value={column}>
                          {column}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value-column">Value to Forecast</Label>
                  <Select value={valueColumn} onValueChange={setValueColumn}>
                    <SelectTrigger id="value-column">
                      <SelectValue placeholder="Select value column" />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map((column) => (
                        <SelectItem key={column} value={column}>
                          {column}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="forecast-periods">Forecast Periods: {forecastPeriods}</Label>
                  <Slider
                    id="forecast-periods"
                    min={1}
                    max={24}
                    step={1}
                    value={[forecastPeriods]}
                    onValueChange={(value) => setForecastPeriods(value[0])}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seasonality-toggle" className="cursor-pointer">
                      Detect Seasonality
                    </Label>
                    <Switch id="seasonality-toggle" checked={seasonality} onCheckedChange={setSeasonality} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="confidence-toggle" className="cursor-pointer">
                      Show Confidence Intervals
                    </Label>
                    <Switch
                      id="confidence-toggle"
                      checked={confidenceInterval}
                      onCheckedChange={setConfidenceInterval}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerateTimeSeries}
                disabled={isGenerating || !timeColumn || !valueColumn || data.length === 0}
                className="w-full sm:w-auto"
              >
                <LineChart className="mr-2 h-4 w-4" />
                Generate Forecast
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating forecast...</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} />
                </div>
              )}

              {forecastResult && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-medium">Time Series Forecast</h3>

                  <ChartContainer className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          type="category"
                          allowDuplicatedCategory={false}
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        <Tooltip formatter={(value) => (value ? Number(value).toFixed(2) : "N/A")} />
                        <Legend />

                        <Line
                          data={forecastResult.historicalData}
                          type="monotone"
                          dataKey="value"
                          stroke="#8884d8"
                          name="Historical Data"
                          dot={{ r: 1 }}
                          activeDot={{ r: 5 }}
                        />

                        <Line
                          data={forecastResult.forecastData}
                          type="monotone"
                          dataKey="prediction"
                          stroke="#82ca9d"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Forecast"
                          dot={{ r: 3 }}
                        />

                        {confidenceInterval && (
                          <>
                            <Line
                              data={forecastResult.forecastData}
                              type="monotone"
                              dataKey="upper"
                              stroke="#82ca9d"
                              strokeWidth={1}
                              strokeDasharray="3 3"
                              name="Upper Bound"
                              dot={false}
                            />

                            <Line
                              data={forecastResult.forecastData}
                              type="monotone"
                              dataKey="lower"
                              stroke="#82ca9d"
                              strokeWidth={1}
                              strokeDasharray="3 3"
                              name="Lower Bound"
                              dot={false}
                            />
                          </>
                        )}
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Forecast Accuracy</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{forecastResult.metrics.mape.toFixed(1)}% MAPE</div>
                        <p className="text-xs text-muted-foreground mt-1">Mean Absolute Percentage Error</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Seasonality</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {forecastResult.metrics.seasonalityDetected ? "Detected" : "Not Detected"}
                        </div>
                        {forecastResult.metrics.seasonalityPattern && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Pattern: {forecastResult.metrics.seasonalityPattern}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Forecast Periods</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{forecastPeriods}</div>
                        <p className="text-xs text-muted-foreground mt-1">Future time periods predicted</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Regression Analysis */}
          <TabsContent value="regression" className="space-y-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  Build and evaluate regression models to understand relationships between variables and make
                  predictions. Our AI will automatically identify significant features and provide model diagnostics.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="target-column">Target Variable (Y)</Label>
                  <Select value={targetColumn} onValueChange={setTargetColumn}>
                    <SelectTrigger id="target-column">
                      <SelectValue placeholder="Select target variable" />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map((column) => (
                        <SelectItem key={column} value={column}>
                          {column}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model-type">Regression Model Type</Label>
                  <Select value={modelType} onValueChange={setModelType}>
                    <SelectTrigger id="model-type">
                      <SelectValue placeholder="Select model type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear Regression</SelectItem>
                      <SelectItem value="ridge">Ridge Regression</SelectItem>
                      <SelectItem value="lasso">Lasso Regression</SelectItem>
                      <SelectItem value="random-forest">Random Forest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Feature Variables (X)</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2">
                  {numericColumns
                    .filter((col) => col !== targetColumn)
                    .map((column) => (
                      <div key={column} className="flex items-center space-x-2">
                        <Checkbox
                          id={`feature-${column}`}
                          checked={featureColumns.includes(column)}
                          onCheckedChange={() => toggleFeatureColumn(column)}
                        />
                        <Label htmlFor={`feature-${column}`} className="text-sm cursor-pointer">
                          {column}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>

              <Button
                onClick={handleGenerateRegression}
                disabled={isGenerating || !targetColumn || featureColumns.length === 0 || data.length === 0}
                className="w-full sm:w-auto"
              >
                <Calculator className="mr-2 h-4 w-4" />
                Build Regression Model
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Building model...</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} />
                </div>
              )}

              {regressionResult && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-medium">Regression Analysis Results</h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Model Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span>R² (Coefficient of Determination)</span>
                              <span className="font-medium">{regressionResult.r2.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Adjusted R²</span>
                              <span className="font-medium">{regressionResult.adjustedR2.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Model Type</span>
                              <span className="font-medium capitalize">{regressionResult.modelType} Regression</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Feature Importance</h4>
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Feature</TableHead>
                                <TableHead>Coefficient</TableHead>
                                <TableHead>p-value</TableHead>
                                <TableHead>Significance</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {regressionResult.coefficients.map((coef: any) => (
                                <TableRow key={coef.feature}>
                                  <TableCell>{coef.feature}</TableCell>
                                  <TableCell>{coef.coefficient}</TableCell>
                                  <TableCell>{coef.pValue}</TableCell>
                                  <TableCell>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${
                                        coef.significance === "High"
                                          ? "bg-green-100 text-green-800"
                                          : coef.significance === "Medium"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {coef.significance}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Actual vs. Predicted</h4>
                      <ChartContainer className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid />
                            <XAxis
                              type="number"
                              dataKey="x"
                              name="Actual"
                              label={{ value: "Actual", position: "bottom" }}
                            />
                            <YAxis
                              type="number"
                              dataKey="y"
                              name="Predicted"
                              label={{ value: "Predicted", angle: -90, position: "left" }}
                            />
                            <ZAxis range={[60, 60]} />
                            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                            <Scatter name="Values" data={regressionResult.scatterData} fill="#8884d8" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </ChartContainer>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Sample Predictions</h4>
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Actual</TableHead>
                                <TableHead>Predicted</TableHead>
                                <TableHead>Error</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {regressionResult.predictions.map((pred: any, i: number) => (
                                <TableRow key={i}>
                                  <TableCell>{pred.actual}</TableCell>
                                  <TableCell>{pred.predicted}</TableCell>
                                  <TableCell className={pred.error > 0 ? "text-red-600" : "text-green-600"}>
                                    {pred.error > 0 ? "+" : ""}
                                    {pred.error.toFixed(1)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Cohort Analysis */}
          <TabsContent value="cohort" className="space-y-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  Track groups of users or customers over time to understand retention, engagement, and other metrics.
                  Cohort analysis helps identify patterns in how different groups behave over their lifecycle.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cohort-column">Cohort Column</Label>
                  <Select value={cohortColumn} onValueChange={setCohortColumn}>
                    <SelectTrigger id="cohort-column">
                      <SelectValue placeholder="Select cohort column" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((column) => (
                        <SelectItem key={column} value={column}>
                          {column}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Column that defines the cohort (e.g., signup month)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-column">Date Column</Label>
                  <Select value={dateColumn} onValueChange={setDateColumn}>
                    <SelectTrigger id="date-column">
                      <SelectValue placeholder="Select date column" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateColumns.map((column) => (
                        <SelectItem key={column} value={column}>
                          {column}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Column that indicates when the event occurred</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metric-column">Metric Column</Label>
                  <Select value={metricColumn} onValueChange={setMetricColumn}>
                    <SelectTrigger id="metric-column">
                      <SelectValue placeholder="Select metric column" />
                    </SelectTrigger>
                    <SelectContent>
                      {numericColumns.map((column) => (
                        <SelectItem key={column} value={column}>
                          {column}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Value to measure (e.g., revenue, visits)</p>
                </div>
              </div>

              <Button
                onClick={handleGenerateCohort}
                disabled={isGenerating || !cohortColumn || !dateColumn || !metricColumn || data.length === 0}
                className="w-full sm:w-auto"
              >
                <Users className="mr-2 h-4 w-4" />
                Generate Cohort Analysis
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing cohorts...</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} />
                </div>
              )}

              {cohortResult && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-medium">Cohort Analysis</h3>

                  <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Cohort</TableHead>
                              {cohortResult.periods.map((period: string) => (
                                <TableHead key={period}>{period}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cohortResult.cohortData.map((row: any) => (
                              <TableRow key={row.cohort}>
                                <TableCell className="font-medium">{row.cohort}</TableCell>
                                {cohortResult.periods.map((period: string) => (
                                  <TableCell key={period} className={row[period] ? "" : "text-muted-foreground"}>
                                    {row[period] !== undefined ? (
                                      <div className="relative">
                                        {row[period]}%
                                        <div
                                          className="absolute bottom-0 left-0 h-1 bg-blue-500 rounded-full"
                                          style={{ width: `${row[period]}%` }}
                                        />
                                      </div>
                                    ) : (
                                      "-"
                                    )}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Key Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {cohortResult.insights.map((insight: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <ArrowRight className="h-4 w-4 mt-1 text-blue-500 flex-shrink-0" />
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Fuzzy Matching */}
          <TabsContent value="fuzzy" className="space-y-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  Find and merge similar text entries using fuzzy matching algorithms. This helps clean messy data by
                  identifying variations of the same text (e.g., "New York", "NY City", "NYC").
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="text-column">Text Column</Label>
                  <Select value={textColumn} onValueChange={setTextColumn}>
                    <SelectTrigger id="text-column">
                      <SelectValue placeholder="Select text column" />
                    </SelectTrigger>
                    <SelectContent>
                      {textColumns.map((column) => (
                        <SelectItem key={column} value={column}>
                          {column}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="similarity-threshold">Similarity Threshold: {similarityThreshold}%</Label>
                  <Slider
                    id="similarity-threshold"
                    min={50}
                    max={100}
                    step={1}
                    value={[similarityThreshold]}
                    onValueChange={(value) => setSimilarityThreshold(value[0])}
                  />
                  <p className="text-xs text-muted-foreground">Higher values require closer matches</p>
                </div>
              </div>

              <Button
                onClick={handleFuzzyMatching}
                disabled={isGenerating || !textColumn || data.length === 0}
                className="w-full sm:w-auto"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Find Similar Entries
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Finding matches...</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} />
                </div>
              )}

              {fuzzyMatchResult && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Fuzzy Matching Results</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Found {fuzzyMatchResult.potentialDuplicates} potential duplicates
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {fuzzyMatchResult.matchGroups.map((group: any, i: number) => (
                      <Card key={i}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Group: {group.canonical}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {group.matches.map((match: string, j: number) => (
                              <div key={j} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Checkbox id={`match-${i}-${j}`} defaultChecked={j !== 0} />
                                  <Label htmlFor={`match-${i}-${j}`} className="cursor-pointer">
                                    {match}
                                  </Label>
                                </div>
                                <div className="text-sm">
                                  <span
                                    className={`px-2 py-1 rounded-full ${
                                      group.similarity[j] > 90
                                        ? "bg-green-100 text-green-800"
                                        : group.similarity[j] > 80
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-orange-100 text-orange-800"
                                    }`}
                                  >
                                    {group.similarity[j]}% match
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                          <Button variant="outline" size="sm">
                            Merge Selected
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button>Apply All Merges</Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
