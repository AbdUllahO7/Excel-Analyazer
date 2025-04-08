"use client"

import { useState, useMemo } from "react"
import { Calculator } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface StatisticalAnalysisProps {
  data: any[]
  columns: string[]
}

export function StatisticalAnalysis({ data, columns }: StatisticalAnalysisProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>(columns[0] || "")

  const numericColumns = columns.filter((column) => {
    // Check if column contains numeric values
    return data.some((row) => {
      const val = row[column]
      return val !== null && val !== undefined && !isNaN(Number(val))
    })
  })

  const statistics = useMemo(() => {
    if (!selectedColumn) return null

    // Extract numeric values from the selected column
    const values = data.map((row) => Number.parseFloat(row[selectedColumn])).filter((val) => !isNaN(val))

    if (values.length === 0) return null

    // Sort values for percentile calculations
    const sortedValues = [...values].sort((a, b) => a - b)

    // Calculate basic statistics
    const count = values.length
    const sum = values.reduce((acc, val) => acc + val, 0)
    const mean = sum / count
    const min = Math.min(...values)
    const max = Math.max(...values)

    // Calculate median
    const mid = Math.floor(sortedValues.length / 2)
    const median = sortedValues.length % 2 === 0 ? (sortedValues[mid - 1] + sortedValues[mid]) / 2 : sortedValues[mid]

    // Calculate variance and standard deviation
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / count
    const stdDev = Math.sqrt(variance)

    // Calculate quartiles
    const q1Index = Math.floor(sortedValues.length * 0.25)
    const q3Index = Math.floor(sortedValues.length * 0.75)
    const q1 = sortedValues[q1Index]
    const q3 = sortedValues[q3Index]
    const iqr = q3 - q1

    // Calculate skewness
    const cubedDiffs = values.map((val) => Math.pow(val - mean, 3))
    const sumCubedDiffs = cubedDiffs.reduce((acc, val) => acc + val, 0)
    const skewness = sumCubedDiffs / (count * Math.pow(stdDev, 3))

    // Calculate kurtosis
    const fourthPowerDiffs = values.map((val) => Math.pow(val - mean, 4))
    const sumFourthPowerDiffs = fourthPowerDiffs.reduce((acc, val) => acc + val, 0)
    const kurtosis = sumFourthPowerDiffs / (count * Math.pow(stdDev, 4)) - 3

    return {
      count,
      min,
      max,
      range: max - min,
      sum,
      mean,
      median,
      q1,
      q3,
      iqr,
      variance,
      stdDev,
      skewness,
      kurtosis,
    }
  }, [data, selectedColumn])

  const frequencyData = useMemo(() => {
    if (!selectedColumn) return []

    // Count occurrences of each value
    const counts: Record<string, number> = {}
    let total = 0

    data.forEach((row) => {
      const value = String(row[selectedColumn] || "Unknown")
      counts[value] = (counts[value] || 0) + 1
      total++
    })

    // Convert to array and calculate percentages
    return Object.entries(counts)
      .map(([value, count]) => ({
        value,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 most frequent values
  }, [data, selectedColumn])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="stat-column">Select Column</Label>
        <Select value={selectedColumn} onValueChange={setSelectedColumn}>
          <SelectTrigger id="stat-column">
            <SelectValue placeholder="Select a column" />
          </SelectTrigger>
          <SelectContent>
            {columns.map((column) => (
              <SelectItem key={column} value={column}>
                {column}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {numericColumns.includes(selectedColumn) && statistics ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Descriptive Statistics
            </CardTitle>
            <CardDescription>Statistical summary for column "{selectedColumn}"</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Count</p>
                <p className="text-2xl">{statistics.count.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Mean</p>
                <p className="text-2xl">{statistics.mean.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Median</p>
                <p className="text-2xl">{statistics.median.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Std Dev</p>
                <p className="text-2xl">{statistics.stdDev.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Min</p>
                <p className="text-2xl">{statistics.min.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Max</p>
                <p className="text-2xl">{statistics.max.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Range</p>
                <p className="text-2xl">{statistics.range.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Sum</p>
                <p className="text-2xl">{statistics.sum.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Additional Statistics</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Statistic</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Q1 (25th Percentile)</TableCell>
                    <TableCell>{statistics.q1.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Q3 (75th Percentile)</TableCell>
                    <TableCell>{statistics.q3.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>IQR</TableCell>
                    <TableCell>{statistics.iqr.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Variance</TableCell>
                    <TableCell>{statistics.variance.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Skewness</TableCell>
                    <TableCell>{statistics.skewness.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Kurtosis</TableCell>
                    <TableCell>{statistics.kurtosis.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Frequency Analysis</CardTitle>
            <CardDescription>Most frequent values in column "{selectedColumn}"</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Value</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frequencyData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.value}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>{item.percentage.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
