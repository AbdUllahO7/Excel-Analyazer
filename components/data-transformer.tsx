"use client"

import { useState } from "react"
import { ArrowRight, Calculator, Check, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"

interface DataTransformerProps {
  data: any[]
  columns: string[]
  onDataTransformed: (transformedData: any[]) => void
}

export function DataTransformer({ data, columns, onDataTransformed }: DataTransformerProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>(columns[0] || "")
  const [newColumnName, setNewColumnName] = useState<string>("")
  const [normalizationMethod, setNormalizationMethod] = useState<string>("minmax")
  const [binningMethod, setBinningMethod] = useState<string>("equalwidth")
  const [numBins, setNumBins] = useState<number>(5)
  const [formula, setFormula] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleNormalization = () => {
    if (!selectedColumn || !newColumnName) return

    let transformedData = [...data]
    const values = data.map((row) => Number.parseFloat(row[selectedColumn])).filter((val) => !isNaN(val))

    if (normalizationMethod === "minmax") {
      // Min-Max Normalization
      const min = Math.min(...values)
      const max = Math.max(...values)
      const range = max - min

      transformedData = transformedData.map((row) => {
        const val = Number.parseFloat(row[selectedColumn])
        if (isNaN(val)) {
          return { ...row, [newColumnName]: null }
        }
        const normalized = range === 0 ? 0 : (val - min) / range
        return { ...row, [newColumnName]: normalized }
      })
    } else if (normalizationMethod === "zscore") {
      // Z-Score Normalization
      const sum = values.reduce((acc, val) => acc + val, 0)
      const mean = sum / values.length
      const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
      const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length
      const stdDev = Math.sqrt(variance)

      transformedData = transformedData.map((row) => {
        const val = Number.parseFloat(row[selectedColumn])
        if (isNaN(val)) {
          return { ...row, [newColumnName]: null }
        }
        const normalized = stdDev === 0 ? 0 : (val - mean) / stdDev
        return { ...row, [newColumnName]: normalized }
      })
    } else if (normalizationMethod === "log") {
      // Log Transformation
      transformedData = transformedData.map((row) => {
        const val = Number.parseFloat(row[selectedColumn])
        if (isNaN(val) || val <= 0) {
          return { ...row, [newColumnName]: null }
        }
        return { ...row, [newColumnName]: Math.log(val) }
      })
    }

    onDataTransformed(transformedData)
    setSuccessMessage(`Successfully normalized column "${selectedColumn}" to "${newColumnName}"`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleBinning = () => {
    if (!selectedColumn || !newColumnName || numBins < 2) return

    let transformedData = [...data]
    const values = data.map((row) => Number.parseFloat(row[selectedColumn])).filter((val) => !isNaN(val))

    if (binningMethod === "equalwidth") {
      // Equal-width binning
      const min = Math.min(...values)
      const max = Math.max(...values)
      const binWidth = (max - min) / numBins

      transformedData = transformedData.map((row) => {
        const val = Number.parseFloat(row[selectedColumn])
        if (isNaN(val)) {
          return { ...row, [newColumnName]: null }
        }

        let binIndex = Math.floor((val - min) / binWidth)
        // Handle edge case for the maximum value
        if (binIndex === numBins) binIndex = numBins - 1

        return { ...row, [newColumnName]: `Bin ${binIndex + 1}` }
      })
    } else if (binningMethod === "equalfreq") {
      // Equal-frequency binning
      values.sort((a, b) => a - b)
      const binSize = Math.ceil(values.length / numBins)
      const boundaries: number[] = []

      for (let i = 1; i < numBins; i++) {
        const index = i * binSize
        if (index < values.length) {
          boundaries.push(values[index])
        }
      }

      transformedData = transformedData.map((row) => {
        const val = Number.parseFloat(row[selectedColumn])
        if (isNaN(val)) {
          return { ...row, [newColumnName]: null }
        }

        let binIndex = 0
        for (let i = 0; i < boundaries.length; i++) {
          if (val >= boundaries[i]) {
            binIndex = i + 1
          }
        }

        return { ...row, [newColumnName]: `Bin ${binIndex + 1}` }
      })
    }

    onDataTransformed(transformedData)
    setSuccessMessage(`Successfully binned column "${selectedColumn}" to "${newColumnName}"`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleCustomFormula = () => {
    if (!newColumnName || !formula) return

    try {
      // Create a safe evaluation function
      const evaluateFormula = (row: any) => {
        // Create a context with column values
        const context: Record<string, any> = {}
        for (const col of columns) {
          const val = Number.parseFloat(row[col])
          context[col.replace(/\s+/g, "_")] = isNaN(val) ? 0 : val
        }

        // Replace column names with context variables
        let safeFormula = formula
        for (const col of columns) {
          const safeName = col.replace(/\s+/g, "_")
          safeFormula = safeFormula.replace(new RegExp(col, "g"), `context.${safeName}`)
        }

        // Add Math functions to context
        const mathFunctions = ["abs", "sqrt", "pow", "log", "exp", "round", "floor", "ceil", "sin", "cos", "tan"]
        for (const fn of mathFunctions) {
          context[fn] = Math[fn]
        }

        // Evaluate the formula
        // eslint-disable-next-line no-new-func
        const result = new Function("context", `return ${safeFormula}`)(context)
        return isNaN(result) ? null : result
      }

      const transformedData = data.map((row) => {
        try {
          const result = evaluateFormula(row)
          return { ...row, [newColumnName]: result }
        } catch (e) {
          return { ...row, [newColumnName]: null }
        }
      })

      onDataTransformed(transformedData)
      setSuccessMessage(`Successfully created column "${newColumnName}" using custom formula`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      setSuccessMessage(`Error: Invalid formula. Please check your syntax.`)
      setTimeout(() => setSuccessMessage(null), 3000)
    }
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

      <Tabs defaultValue="normalize" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="normalize">Normalize</TabsTrigger>
          <TabsTrigger value="binning">Binning</TabsTrigger>
          <TabsTrigger value="formula">Custom Formula</TabsTrigger>
        </TabsList>

        <TabsContent value="normalize" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="normalize-column">Select Column (Numeric)</Label>
              <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                <SelectTrigger id="normalize-column">
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
              <Label htmlFor="new-column-name">New Column Name</Label>
              <Input
                id="new-column-name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="e.g., normalized_column"
              />
            </div>

            <div className="space-y-2">
              <Label>Normalization Method</Label>
              <RadioGroup value={normalizationMethod} onValueChange={setNormalizationMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="minmax" id="minmax-norm" />
                  <Label htmlFor="minmax-norm">Min-Max Scaling (0-1)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="zscore" id="zscore-norm" />
                  <Label htmlFor="zscore-norm">Z-Score Standardization</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="log" id="log-norm" />
                  <Label htmlFor="log-norm">Log Transformation</Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={handleNormalization}
              disabled={!selectedColumn || !newColumnName}
              className="w-full sm:w-auto"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Apply Normalization
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="binning" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="binning-column">Select Column (Numeric)</Label>
              <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                <SelectTrigger id="binning-column">
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
              <Label htmlFor="bin-column-name">New Column Name</Label>
              <Input
                id="bin-column-name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="e.g., binned_column"
              />
            </div>

            <div className="space-y-2">
              <Label>Binning Method</Label>
              <RadioGroup value={binningMethod} onValueChange={setBinningMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="equalwidth" id="equalwidth-bin" />
                  <Label htmlFor="equalwidth-bin">Equal-Width Binning</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="equalfreq" id="equalfreq-bin" />
                  <Label htmlFor="equalfreq-bin">Equal-Frequency Binning</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="num-bins">Number of Bins: {numBins}</Label>
              </div>
              <Slider
                id="num-bins"
                min={2}
                max={20}
                step={1}
                value={[numBins]}
                onValueChange={(value) => setNumBins(value[0])}
              />
            </div>

            <Button onClick={handleBinning} disabled={!selectedColumn || !newColumnName} className="w-full sm:w-auto">
              <ArrowRight className="mr-2 h-4 w-4" />
              Apply Binning
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="formula" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="formula-column-name">New Column Name</Label>
              <Input
                id="formula-column-name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="e.g., calculated_column"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="formula">Custom Formula</Label>
              <Input
                id="formula"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="e.g., column1 + column2 * 2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use column names directly in your formula. Supported operations: +, -, *, /, %, Math.pow(), Math.sqrt(),
                etc.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Available Columns</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border rounded-md p-4 max-h-40 overflow-y-auto">
                {columns.map((column) => (
                  <div key={column} className="text-sm">
                    {column}
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleCustomFormula} disabled={!newColumnName || !formula} className="w-full sm:w-auto">
              <Calculator className="mr-2 h-4 w-4" />
              Apply Formula
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
