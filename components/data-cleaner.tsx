"use client"

import { useState } from "react"
import { Check, Eraser, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DataCleanerProps {
  data: any[]
  columns: string[]
  onDataCleaned: (cleanedData: any[]) => void
}

export function DataCleaner({ data, columns, onDataCleaned }: DataCleanerProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>(columns[0] || "")
  const [missingValueStrategy, setMissingValueStrategy] = useState<string>("remove")
  const [replacementValue, setReplacementValue] = useState<string>("")
  const [duplicateColumns, setDuplicateColumns] = useState<string[]>([])
  const [outlierDetectionMethod, setOutlierDetectionMethod] = useState<string>("iqr")
  const [outlierAction, setOutlierAction] = useState<string>("remove")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleMissingValues = () => {
    if (!selectedColumn) return

    let cleanedData = [...data]

    if (missingValueStrategy === "remove") {
      cleanedData = cleanedData.filter(
        (row) => row[selectedColumn] !== null && row[selectedColumn] !== undefined && row[selectedColumn] !== "",
      )
    } else if (missingValueStrategy === "replace") {
      cleanedData = cleanedData.map((row) => {
        if (row[selectedColumn] === null || row[selectedColumn] === undefined || row[selectedColumn] === "") {
          return { ...row, [selectedColumn]: replacementValue }
        }
        return row
      })
    }

    onDataCleaned(cleanedData)
    setSuccessMessage(`Successfully handled missing values in column "${selectedColumn}"`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleDuplicates = () => {
    if (duplicateColumns.length === 0) return

    // Create a unique key based on the selected columns
    const getRowKey = (row: any) => duplicateColumns.map((col) => row[col]).join("|")

    const seen = new Set<string>()
    const cleanedData = data.filter((row) => {
      const key = getRowKey(row)
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })

    onDataCleaned(cleanedData)
    setSuccessMessage(`Successfully removed duplicates based on selected columns`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleOutliers = () => {
    if (!selectedColumn) return

    let cleanedData = [...data]
    const values = data.map((row) => Number.parseFloat(row[selectedColumn])).filter((val) => !isNaN(val))

    if (outlierDetectionMethod === "iqr") {
      // IQR method
      values.sort((a, b) => a - b)
      const q1 = values[Math.floor(values.length / 4)]
      const q3 = values[Math.floor((values.length * 3) / 4)]
      const iqr = q3 - q1
      const lowerBound = q1 - 1.5 * iqr
      const upperBound = q3 + 1.5 * iqr

      if (outlierAction === "remove") {
        cleanedData = cleanedData.filter((row) => {
          const val = Number.parseFloat(row[selectedColumn])
          return isNaN(val) || (val >= lowerBound && val <= upperBound)
        })
      } else if (outlierAction === "cap") {
        cleanedData = cleanedData.map((row) => {
          const val = Number.parseFloat(row[selectedColumn])
          if (isNaN(val)) return row
          if (val < lowerBound) return { ...row, [selectedColumn]: lowerBound }
          if (val > upperBound) return { ...row, [selectedColumn]: upperBound }
          return row
        })
      }
    } else if (outlierDetectionMethod === "zscore") {
      // Z-score method
      const sum = values.reduce((acc, val) => acc + val, 0)
      const mean = sum / values.length
      const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
      const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length
      const stdDev = Math.sqrt(variance)

      const threshold = 3 // Standard threshold for z-score

      if (outlierAction === "remove") {
        cleanedData = cleanedData.filter((row) => {
          const val = Number.parseFloat(row[selectedColumn])
          if (isNaN(val)) return true
          const zScore = Math.abs((val - mean) / stdDev)
          return zScore <= threshold
        })
      } else if (outlierAction === "cap") {
        cleanedData = cleanedData.map((row) => {
          const val = Number.parseFloat(row[selectedColumn])
          if (isNaN(val)) return row
          const zScore = (val - mean) / stdDev
          if (zScore > threshold) return { ...row, [selectedColumn]: mean + threshold * stdDev }
          if (zScore < -threshold) return { ...row, [selectedColumn]: mean - threshold * stdDev }
          return row
        })
      }
    }

    onDataCleaned(cleanedData)
    setSuccessMessage(`Successfully handled outliers in column "${selectedColumn}"`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleColumnChange = (column: string) => {
    setSelectedColumn(column)
  }

  const handleDuplicateColumnToggle = (column: string) => {
    setDuplicateColumns((prev) => (prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]))
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="missing" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="missing">Missing Values</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
          <TabsTrigger value="outliers">Outliers</TabsTrigger>
        </TabsList>

        <TabsContent value="missing" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="column-select">Select Column</Label>
              <Select value={selectedColumn} onValueChange={handleColumnChange}>
                <SelectTrigger id="column-select">
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

            <div className="space-y-2">
              <Label>Strategy for Missing Values</Label>
              <RadioGroup value={missingValueStrategy} onValueChange={setMissingValueStrategy}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="remove" id="remove-rows" />
                  <Label htmlFor="remove-rows">Remove rows with missing values</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="replace" id="replace-values" />
                  <Label htmlFor="replace-values">Replace with a value</Label>
                </div>
              </RadioGroup>
            </div>

            {missingValueStrategy === "replace" && (
              <div className="space-y-2">
                <Label htmlFor="replacement-value">Replacement Value</Label>
                <Input
                  id="replacement-value"
                  value={replacementValue}
                  onChange={(e) => setReplacementValue(e.target.value)}
                  placeholder="Enter replacement value"
                />
              </div>
            )}

            <Button onClick={handleMissingValues} className="w-full sm:w-auto">
              <Eraser className="mr-2 h-4 w-4" />
              Clean Missing Values
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="duplicates" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Columns to Check for Duplicates</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border rounded-md p-4 max-h-60 overflow-y-auto">
                {columns.map((column) => (
                  <div key={column} className="flex items-center space-x-2">
                    <Checkbox
                      id={`col-${column}`}
                      checked={duplicateColumns.includes(column)}
                      onCheckedChange={() => handleDuplicateColumnToggle(column)}
                    />
                    <Label htmlFor={`col-${column}`} className="text-sm">
                      {column}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleDuplicates} disabled={duplicateColumns.length === 0} className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Duplicates
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="outliers" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="outlier-column">Select Column (Numeric)</Label>
              <Select value={selectedColumn} onValueChange={handleColumnChange}>
                <SelectTrigger id="outlier-column">
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

            <div className="space-y-2">
              <Label>Outlier Detection Method</Label>
              <RadioGroup value={outlierDetectionMethod} onValueChange={setOutlierDetectionMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="iqr" id="iqr-method" />
                  <Label htmlFor="iqr-method">IQR Method (1.5 × IQR)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="zscore" id="zscore-method" />
                  <Label htmlFor="zscore-method">Z-Score Method (3σ)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Action for Outliers</Label>
              <RadioGroup value={outlierAction} onValueChange={setOutlierAction}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="remove" id="remove-outliers" />
                  <Label htmlFor="remove-outliers">Remove outliers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cap" id="cap-outliers" />
                  <Label htmlFor="cap-outliers">Cap outliers (winsorize)</Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={handleOutliers} className="w-full sm:w-auto">
              <X className="mr-2 h-4 w-4" />
              Handle Outliers
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
