"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Info, TrendingUp, Zap, AlertTriangle, BrainCircuit } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine,
  ReferenceArea,
  Area,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"

interface IntelligentAnalysisProps {
  data: any[]
  columns: string[]
}

export function IntelligentAnalysis({ data, columns }: IntelligentAnalysisProps) {
  const [activeTab, setActiveTab] = useState("trends")
  const [timeColumn, setTimeColumn] = useState<string>("")
  const [valueColumn, setValueColumn] = useState<string>("")
  const [correlationColumn1, setCorrelationColumn1] = useState<string>("")
  const [correlationColumn2, setCorrelationColumn2] = useState<string>("")
  const [anomalyColumn, setAnomalyColumn] = useState<string>("")
  const [anomalyThreshold, setAnomalyThreshold] = useState<number>(2.5)
  const [predictionPeriods, setPredictionPeriods] = useState<number>(5)
  const [showConfidenceInterval, setShowConfidenceInterval] = useState<boolean>(true)

  const [trendResults, setTrendResults] = useState<any>(null)
  const [correlationResults, setCorrelationResults] = useState<any>(null)
  const [anomalyResults, setAnomalyResults] = useState<any>(null)
  const [predictionResults, setPredictionResults] = useState<any>(null)

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

  // Trend Detection
  const detectTrends = () => {
    if (!timeColumn || !valueColumn || data.length < 5) return

    try {
      // Sort data by time
      const sortedData = [...data]
        .map((row) => ({
          time: new Date(row[timeColumn]),
          value: Number(row[valueColumn]),
        }))
        .filter((item) => !isNaN(item.time.getTime()) && !isNaN(item.value))
        .sort((a, b) => a.time.getTime() - b.time.getTime())

      if (sortedData.length < 5) {
        setTrendResults({ error: "Not enough valid data points for trend analysis" })
        return
      }

      // Calculate moving average
      const windowSize = Math.max(3, Math.floor(sortedData.length / 10))
      const movingAvg = []

      for (let i = 0; i < sortedData.length; i++) {
        if (i < windowSize - 1) {
          movingAvg.push(null)
        } else {
          let sum = 0
          for (let j = 0; j < windowSize; j++) {
            sum += sortedData[i - j].value
          }
          movingAvg.push(sum / windowSize)
        }
      }

      // Detect trends
      const trends = []
      let currentTrend = { direction: "none", start: 0, end: 0, strength: 0 }

      for (let i = windowSize; i < movingAvg.length - 1; i++) {
        if (movingAvg[i] === null || movingAvg[i + 1] === null) continue

        const diff = movingAvg[i + 1] - movingAvg[i]
        const direction = diff > 0 ? "up" : diff < 0 ? "down" : "flat"

        if (currentTrend.direction === "none") {
          currentTrend = {
            direction,
            start: i,
            end: i + 1,
            strength: Math.abs(diff),
          }
        } else if (direction === currentTrend.direction || direction === "flat") {
          currentTrend.end = i + 1
          currentTrend.strength += Math.abs(diff)
        } else {
          // New trend detected
          if (currentTrend.end - currentTrend.start >= 3) {
            trends.push({
              direction: currentTrend.direction,
              startIndex: currentTrend.start,
              endIndex: currentTrend.end,
              startDate: sortedData[currentTrend.start].time,
              endDate: sortedData[currentTrend.end].time,
              startValue: sortedData[currentTrend.start].value,
              endValue: sortedData[currentTrend.end].value,
              duration: currentTrend.end - currentTrend.start,
              strength: currentTrend.strength,
            })
          }

          currentTrend = {
            direction,
            start: i,
            end: i + 1,
            strength: Math.abs(diff),
          }
        }
      }

      // Add the last trend if significant
      if (currentTrend.direction !== "none" && currentTrend.end - currentTrend.start >= 3) {
        trends.push({
          direction: currentTrend.direction,
          startIndex: currentTrend.start,
          endIndex: currentTrend.end,
          startDate: sortedData[currentTrend.start].time,
          endDate: sortedData[currentTrend.end].time,
          startValue: sortedData[currentTrend.start].value,
          endValue: sortedData[currentTrend.end].value,
          duration: currentTrend.end - currentTrend.start,
          strength: currentTrend.strength,
        })
      }

      // Sort trends by strength
      trends.sort((a, b) => b.strength - a.strength)

      // Prepare chart data
      const chartData = sortedData.map((item, index) => ({
        name: item.time.toLocaleDateString(),
        value: item.value,
        movingAvg: movingAvg[index],
      }))

      setTrendResults({
        trends: trends.slice(0, 5), // Top 5 strongest trends
        chartData,
        significantTrends: trends.filter((t) => t.duration > windowSize),
      })
    } catch (error) {
      setTrendResults({ error: "Error analyzing trends: " + (error as Error).message })
    }
  }

  // Correlation Analysis
  const analyzeCorrelation = () => {
    if (!correlationColumn1 || !correlationColumn2 || data.length < 5) return

    try {
      // Extract paired values
      const pairs = data
        .map((row) => ({
          x: Number(row[correlationColumn1]),
          y: Number(row[correlationColumn2]),
        }))
        .filter((pair) => !isNaN(pair.x) && !isNaN(pair.y))

      if (pairs.length < 5) {
        setCorrelationResults({ error: "Not enough valid data pairs for correlation analysis" })
        return
      }

      // Calculate means
      const sumX = pairs.reduce((sum, pair) => sum + pair.x, 0)
      const sumY = pairs.reduce((sum, pair) => sum + pair.y, 0)
      const meanX = sumX / pairs.length
      const meanY = sumY / pairs.length

      // Calculate correlation coefficient
      let numerator = 0
      let denominatorX = 0
      let denominatorY = 0

      pairs.forEach((pair) => {
        const diffX = pair.x - meanX
        const diffY = pair.y - meanY
        numerator += diffX * diffY
        denominatorX += diffX * diffX
        denominatorY += diffY * diffY
      })

      const correlation = numerator / (Math.sqrt(denominatorX) * Math.sqrt(denominatorY))

      // Calculate linear regression
      const slope = numerator / denominatorX
      const intercept = meanY - slope * meanX

      // Generate regression line points
      const minX = Math.min(...pairs.map((p) => p.x))
      const maxX = Math.max(...pairs.map((p) => p.x))

      const regressionLine = [
        { x: minX, y: slope * minX + intercept },
        { x: maxX, y: slope * maxX + intercept },
      ]

      // Determine correlation strength
      let strength = "No correlation"
      let color = "#888888"

      const absCorr = Math.abs(correlation)
      if (absCorr > 0.8) {
        strength = correlation > 0 ? "Strong positive" : "Strong negative"
        color = correlation > 0 ? "#4CAF50" : "#F44336"
      } else if (absCorr > 0.5) {
        strength = correlation > 0 ? "Moderate positive" : "Moderate negative"
        color = correlation > 0 ? "#8BC34A" : "#FF5722"
      } else if (absCorr > 0.3) {
        strength = correlation > 0 ? "Weak positive" : "Weak negative"
        color = correlation > 0 ? "#CDDC39" : "#FF9800"
      }

      setCorrelationResults({
        correlation,
        strength,
        color,
        pairs,
        regressionLine,
        equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`,
        r2: correlation * correlation,
      })
    } catch (error) {
      setCorrelationResults({ error: "Error analyzing correlation: " + (error as Error).message })
    }
  }

  // Anomaly Detection
  const detectAnomalies = () => {
    if (!anomalyColumn || data.length < 10) return

    try {
      // Extract values
      const values = data.map((row) => Number(row[anomalyColumn])).filter((val) => !isNaN(val))

      if (values.length < 10) {
        setAnomalyResults({ error: "Not enough valid data points for anomaly detection" })
        return
      }

      // Calculate mean and standard deviation
      const sum = values.reduce((acc, val) => acc + val, 0)
      const mean = sum / values.length

      const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
      const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length
      const stdDev = Math.sqrt(variance)

      // Detect anomalies using Z-score
      const anomalies = []
      const chartData = []

      for (let i = 0; i < data.length; i++) {
        const value = Number(data[i][anomalyColumn])
        if (isNaN(value)) continue

        const zScore = (value - mean) / stdDev
        const isAnomaly = Math.abs(zScore) > anomalyThreshold

        chartData.push({
          index: i,
          value,
          zScore,
          isAnomaly,
        })

        if (isAnomaly) {
          anomalies.push({
            index: i,
            value,
            zScore,
            deviation: Math.abs(value - mean),
            record: data[i],
          })
        }
      }

      // Sort anomalies by severity (absolute z-score)
      anomalies.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore))

      setAnomalyResults({
        mean,
        stdDev,
        anomalies,
        chartData,
        threshold: anomalyThreshold,
        anomalyCount: anomalies.length,
        anomalyPercentage: (anomalies.length / values.length) * 100,
      })
    } catch (error) {
      setAnomalyResults({ error: "Error detecting anomalies: " + (error as Error).message })
    }
  }

  // Prediction Model
  const generatePredictions = () => {
    if (!timeColumn || !valueColumn || data.length < 10) return

    try {
      // Sort data by time
      const sortedData = [...data]
        .map((row) => ({
          time: new Date(row[timeColumn]),
          value: Number(row[valueColumn]),
        }))
        .filter((item) => !isNaN(item.time.getTime()) && !isNaN(item.value))
        .sort((a, b) => a.time.getTime() - b.time.getTime())

      if (sortedData.length < 10) {
        setPredictionResults({ error: "Not enough valid data points for prediction" })
        return
      }

      // Simple linear regression for trend
      const n = sortedData.length

      // Convert dates to numeric values (days since first date)
      const firstDate = sortedData[0].time.getTime()
      const xValues = sortedData.map((item) => (item.time.getTime() - firstDate) / (1000 * 60 * 60 * 24))
      const yValues = sortedData.map((item) => item.value)

      // Calculate means
      const sumX = xValues.reduce((sum, x) => sum + x, 0)
      const sumY = yValues.reduce((sum, y) => sum + y, 0)
      const meanX = sumX / n
      const meanY = sumY / n

      // Calculate slope and intercept
      let numerator = 0
      let denominator = 0

      for (let i = 0; i < n; i++) {
        numerator += (xValues[i] - meanX) * (yValues[i] - meanY)
        denominator += Math.pow(xValues[i] - meanX, 2)
      }

      const slope = numerator / denominator
      const intercept = meanY - slope * meanX

      // Calculate R-squared
      let ssr = 0 // Sum of squared regression
      let sst = 0 // Total sum of squares

      for (let i = 0; i < n; i++) {
        const predicted = slope * xValues[i] + intercept
        ssr += Math.pow(predicted - meanY, 2)
        sst += Math.pow(yValues[i] - meanY, 2)
      }

      const rSquared = ssr / sst

      // Calculate standard error
      let sumSquaredErrors = 0

      for (let i = 0; i < n; i++) {
        const predicted = slope * xValues[i] + intercept
        sumSquaredErrors += Math.pow(yValues[i] - predicted, 2)
      }

      const standardError = Math.sqrt(sumSquaredErrors / (n - 2))

      // Generate predictions
      const lastX = xValues[n - 1]
      const lastDate = sortedData[n - 1].time
      const predictions = []

      // Determine time interval (average days between points)
      let avgInterval = 0
      if (n > 1) {
        avgInterval = (xValues[n - 1] - xValues[0]) / (n - 1)
      } else {
        avgInterval = 1 // Default to 1 day if only one point
      }

      for (let i = 1; i <= predictionPeriods; i++) {
        const futureX = lastX + i * avgInterval
        const predictedValue = slope * futureX + intercept

        // Calculate confidence interval (95%)
        const tValue = 1.96 // Approximate t-value for 95% confidence
        const seOfPrediction = standardError * Math.sqrt(1 + 1 / n + Math.pow(futureX - meanX, 2) / denominator)
        const marginOfError = tValue * seOfPrediction

        const futureDate = new Date(lastDate)
        futureDate.setDate(lastDate.getDate() + Math.round(i * avgInterval))

        predictions.push({
          x: futureX,
          date: futureDate,
          value: predictedValue,
          lower: predictedValue - marginOfError,
          upper: predictedValue + marginOfError,
        })
      }

      // Prepare chart data
      const chartData = sortedData.map((item, index) => ({
        name: item.time.toLocaleDateString(),
        value: item.value,
        fitted: slope * xValues[index] + intercept,
      }))

      // Add predictions to chart data
      predictions.forEach((pred) => {
        chartData.push({
          name: pred.date.toLocaleDateString(),
          value: null,
          fitted: null,
          predicted: pred.value,
          lower: pred.lower,
          upper: pred.upper,
        })
      })

      setPredictionResults({
        slope,
        intercept,
        rSquared,
        standardError,
        predictions,
        chartData,
        equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`,
        confidence: 95,
      })
    } catch (error) {
      setPredictionResults({ error: "Error generating predictions: " + (error as Error).message })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Intelligent Analysis</CardTitle>
          <CardDescription>
            Advanced analytics to automatically detect patterns, correlations, anomalies, and predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Trend Detection</span>
              </TabsTrigger>
              <TabsTrigger value="correlation" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Correlation Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="anomalies" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Anomaly Detection</span>
              </TabsTrigger>
              <TabsTrigger value="prediction" className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4" />
                <span className="hidden sm:inline">Prediction Models</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="value-column">Value Column</Label>
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

              <Button onClick={detectTrends} disabled={!timeColumn || !valueColumn} className="w-full sm:w-auto">
                <TrendingUp className="mr-2 h-4 w-4" />
                Detect Trends
              </Button>

              {trendResults?.error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{trendResults.error}</AlertDescription>
                </Alert>
              )}

              {trendResults?.trends && (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <ChartContainer className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={trendResults.chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#8884d8" dot={{ r: 2 }} name={valueColumn} />
                            <Line
                              type="monotone"
                              dataKey="movingAvg"
                              stroke="#82ca9d"
                              strokeWidth={2}
                              dot={false}
                              name="Moving Average"
                            />

                            {trendResults.significantTrends.slice(0, 3).map((trend, index) => (
                              <ReferenceArea
                                key={index}
                                x1={trendResults.chartData[trend.startIndex]?.name}
                                x2={trendResults.chartData[trend.endIndex]?.name}
                                stroke={trend.direction === "up" ? "#4CAF50" : "#F44336"}
                                strokeOpacity={0.3}
                                fill={trend.direction === "up" ? "#4CAF50" : "#F44336"}
                                fillOpacity={0.1}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Significant Trends</h3>
                    {trendResults.trends.length > 0 ? (
                      <div className="space-y-2">
                        {trendResults.trends.map((trend, index) => (
                          <div key={index} className="p-3 border rounded-md">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded-full ${trend.direction === "up" ? "bg-green-500" : "bg-red-500"}`}
                              />
                              <span className="font-medium">
                                {trend.direction === "up" ? "Upward" : "Downward"} Trend
                              </span>
                            </div>
                            <div className="mt-2 text-sm">
                              <p>
                                From {new Date(trend.startDate).toLocaleDateString()} to{" "}
                                {new Date(trend.endDate).toLocaleDateString()}
                              </p>
                              <p>
                                Value change: {trend.startValue.toFixed(2)} → {trend.endValue.toFixed(2)}(
                                {(((trend.endValue - trend.startValue) / trend.startValue) * 100).toFixed(2)}%)
                              </p>
                              <p>Duration: {trend.duration} data points</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No significant trends detected</p>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="correlation" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correlation-column-1">First Variable</Label>
                  <Select value={correlationColumn1} onValueChange={setCorrelationColumn1}>
                    <SelectTrigger id="correlation-column-1">
                      <SelectValue placeholder="Select first variable" />
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
                  <Label htmlFor="correlation-column-2">Second Variable</Label>
                  <Select value={correlationColumn2} onValueChange={setCorrelationColumn2}>
                    <SelectTrigger id="correlation-column-2">
                      <SelectValue placeholder="Select second variable" />
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

              <Button
                onClick={analyzeCorrelation}
                disabled={!correlationColumn1 || !correlationColumn2 || correlationColumn1 === correlationColumn2}
                className="w-full sm:w-auto"
              >
                <Zap className="mr-2 h-4 w-4" />
                Analyze Correlation
              </Button>

              {correlationResults?.error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{correlationResults.error}</AlertDescription>
                </Alert>
              )}

              {correlationResults?.correlation !== undefined && (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              type="number"
                              dataKey="x"
                              name={correlationColumn1}
                              label={{ value: correlationColumn1, position: "bottom" }}
                            />
                            <YAxis
                              type="number"
                              dataKey="y"
                              name={correlationColumn2}
                              label={{ value: correlationColumn2, angle: -90, position: "left" }}
                            />
                            <Tooltip
                              formatter={(value) => Number(value).toFixed(2)}
                              labelFormatter={() => `${correlationColumn1} vs ${correlationColumn2}`}
                            />
                            <Scatter name="Data Points" data={correlationResults.pairs} fill="#8884d8" />
                            <Line
                              type="monotone"
                              dataKey="y"
                              data={correlationResults.regressionLine}
                              stroke={correlationResults.color}
                              strokeWidth={2}
                              dot={false}
                              activeDot={false}
                              name="Regression Line"
                            />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <h3 className="text-lg font-medium">Correlation Coefficient</h3>
                          <div className="text-5xl font-bold my-4" style={{ color: correlationResults.color }}>
                            {correlationResults.correlation.toFixed(2)}
                          </div>
                          <p className="text-lg">{correlationResults.strength} correlation</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-medium">Linear Regression</h3>
                            <p className="text-lg font-mono mt-2">{correlationResults.equation}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">R² (Coefficient of Determination)</h4>
                            <p className="text-lg">{correlationResults.r2.toFixed(4)}</p>
                            <p className="text-sm text-gray-500">
                              {correlationResults.r2 > 0.7
                                ? "Strong predictive power"
                                : correlationResults.r2 > 0.3
                                  ? "Moderate predictive power"
                                  : "Weak predictive power"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle>Interpretation</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>
                        {correlationResults.correlation > 0
                          ? `As ${correlationColumn1} increases, ${correlationColumn2} tends to increase.`
                          : `As ${correlationColumn1} increases, ${correlationColumn2} tends to decrease.`}
                      </p>
                      <p>
                        {correlationResults.r2 > 0.5
                          ? `${(correlationResults.r2 * 100).toFixed(1)}% of the variation in ${correlationColumn2} can be explained by changes in ${correlationColumn1}.`
                          : `Only ${(correlationResults.r2 * 100).toFixed(1)}% of the variation in ${correlationColumn2} can be explained by changes in ${correlationColumn1}, suggesting other factors are involved.`}
                      </p>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </TabsContent>

            <TabsContent value="anomalies" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="anomaly-column">Column to Analyze</Label>
                  <Select value={anomalyColumn} onValueChange={setAnomalyColumn}>
                    <SelectTrigger id="anomaly-column">
                      <SelectValue placeholder="Select column" />
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
                  <Label htmlFor="anomaly-threshold">Z-Score Threshold: {anomalyThreshold}</Label>
                  <Slider
                    id="anomaly-threshold"
                    min={1}
                    max={5}
                    step={0.1}
                    value={[anomalyThreshold]}
                    onValueChange={(value) => setAnomalyThreshold(value[0])}
                  />
                  <p className="text-xs text-gray-500">Higher values detect fewer but more extreme anomalies</p>
                </div>
              </div>

              <Button onClick={detectAnomalies} disabled={!anomalyColumn} className="w-full sm:w-auto">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Detect Anomalies
              </Button>

              {anomalyResults?.error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{anomalyResults.error}</AlertDescription>
                </Alert>
              )}

              {anomalyResults?.chartData && (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <ChartContainer className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={anomalyResults.chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="index" label={{ value: "Data Point Index", position: "bottom" }} />
                            <YAxis />
                            <Tooltip
                              formatter={(value) => Number(value).toFixed(2)}
                              labelFormatter={(value) => `Data Point ${value}`}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#8884d8"
                              name={anomalyColumn}
                              dot={(props) => {
                                const { cx, cy, payload } = props
                                return payload.isAnomaly ? (
                                  <circle cx={cx} cy={cy} r={6} fill="#F44336" stroke="#F44336" />
                                ) : (
                                  <circle cx={cx} cy={cy} r={3} fill="#8884d8" />
                                )
                              }}
                            />
                            <ReferenceLine
                              y={anomalyResults.mean}
                              stroke="#82ca9d"
                              strokeDasharray="3 3"
                              label="Mean"
                            />
                            <ReferenceLine
                              y={anomalyResults.mean + anomalyResults.threshold * anomalyResults.stdDev}
                              stroke="#FF9800"
                              strokeDasharray="3 3"
                              label="Upper Threshold"
                            />
                            <ReferenceLine
                              y={anomalyResults.mean - anomalyResults.threshold * anomalyResults.stdDev}
                              stroke="#FF9800"
                              strokeDasharray="3 3"
                              label="Lower Threshold"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <h3 className="text-lg font-medium">Anomalies Detected</h3>
                          <div className="text-5xl font-bold my-4 text-red-500">{anomalyResults.anomalyCount}</div>
                          <p className="text-sm">{anomalyResults.anomalyPercentage.toFixed(1)}% of data points</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <h3 className="text-lg font-medium">Mean Value</h3>
                          <div className="text-3xl font-bold my-4">{anomalyResults.mean.toFixed(2)}</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <h3 className="text-lg font-medium">Standard Deviation</h3>
                          <div className="text-3xl font-bold my-4">{anomalyResults.stdDev.toFixed(2)}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {anomalyResults.anomalies.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Top Anomalies</h3>
                      <div className="space-y-2">
                        {anomalyResults.anomalies.slice(0, 5).map((anomaly, index) => (
                          <div key={index} className="p-3 border rounded-md">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-red-500" />
                              <span className="font-medium">Anomaly at data point {anomaly.index}</span>
                            </div>
                            <div className="mt-2 text-sm">
                              <p>Value: {anomaly.value.toFixed(2)}</p>
                              <p>Z-Score: {anomaly.zScore.toFixed(2)}</p>
                              <p>
                                {anomaly.zScore > 0
                                  ? `${anomaly.deviation.toFixed(2)} above mean`
                                  : `${anomaly.deviation.toFixed(2)} below mean`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="prediction" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prediction-time-column">Time Column</Label>
                  <Select value={timeColumn} onValueChange={setTimeColumn}>
                    <SelectTrigger id="prediction-time-column">
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
                  <Label htmlFor="prediction-value-column">Value to Predict</Label>
                  <Select value={valueColumn} onValueChange={setValueColumn}>
                    <SelectTrigger id="prediction-value-column">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prediction-periods">Prediction Periods: {predictionPeriods}</Label>
                  <Slider
                    id="prediction-periods"
                    min={1}
                    max={20}
                    step={1}
                    value={[predictionPeriods]}
                    onValueChange={(value) => setPredictionPeriods(value[0])}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confidence-interval" className="flex items-center justify-between">
                    <span>Show Confidence Interval</span>
                    <Switch
                      id="confidence-interval"
                      checked={showConfidenceInterval}
                      onCheckedChange={setShowConfidenceInterval}
                    />
                  </Label>
                  <p className="text-xs text-gray-500">95% confidence interval for predictions</p>
                </div>
              </div>

              <Button onClick={generatePredictions} disabled={!timeColumn || !valueColumn} className="w-full sm:w-auto">
                <BrainCircuit className="mr-2 h-4 w-4" />
                Generate Predictions
              </Button>

              {predictionResults?.error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{predictionResults.error}</AlertDescription>
                </Alert>
              )}

              {predictionResults?.chartData && (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <ChartContainer className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={predictionResults.chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => (value ? Number(value).toFixed(2) : "N/A")} />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#8884d8"
                              dot={{ r: 2 }}
                              name="Historical Data"
                              connectNulls={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="fitted"
                              stroke="#82ca9d"
                              strokeWidth={2}
                              dot={false}
                              name="Fitted Line"
                              dot={false}
                              name="Fitted Line"
                              connectNulls={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="predicted"
                              stroke="#ff7300"
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              dot={{ r: 4 }}
                              name="Prediction"
                              connectNulls={false}
                            />
                            {showConfidenceInterval && predictionResults?.chartData && (
                              <Area
                                type="monotone"
                                dataKey="upper"
                                data={predictionResults.chartData.filter((d) => d.predicted !== undefined)}
                                stroke="transparent"
                                fill="#ff7300"
                                fillOpacity={0.1}
                                name="Upper Bound"
                              />
                            )}
                            {showConfidenceInterval && predictionResults?.chartData && (
                              <Area
                                type="monotone"
                                dataKey="lower"
                                data={predictionResults.chartData.filter((d) => d.predicted !== undefined)}
                                stroke="transparent"
                                fill="#ff7300"
                                fillOpacity={0.1}
                                name="Lower Bound"
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-medium">Linear Regression Model</h3>
                            <p className="text-lg font-mono mt-2">{predictionResults.equation}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Model Quality</h4>
                            <p className="text-lg">R² = {predictionResults.rSquared.toFixed(4)}</p>
                            <p className="text-sm text-gray-500">
                              {predictionResults.rSquared > 0.7
                                ? "Strong predictive power"
                                : predictionResults.rSquared > 0.3
                                  ? "Moderate predictive power"
                                  : "Weak predictive power"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Predictions</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {predictionResults.predictions.map((pred, index) => (
                            <div key={index} className="flex justify-between text-sm border-b pb-1">
                              <span>{pred.date.toLocaleDateString()}</span>
                              <span className="font-medium">{pred.value.toFixed(2)}</span>
                              {showConfidenceInterval && (
                                <span className="text-gray-500">
                                  [{pred.lower.toFixed(2)} - {pred.upper.toFixed(2)}]
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900">
                    <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle>Prediction Disclaimer</AlertTitle>
                    <AlertDescription>
                      <p>
                        These predictions are based on historical trends and assume that past patterns will continue.
                        Actual future values may differ due to external factors not captured in the model.
                      </p>
                      {predictionResults.rSquared < 0.5 && (
                        <p className="mt-2 font-medium">
                          Note: The model's predictive power is relatively low (R² ={" "}
                          {predictionResults.rSquared.toFixed(2)}), so predictions should be interpreted with caution.
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
