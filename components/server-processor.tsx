"use client"

import { useState } from "react"
import { Server, Database, HardDrive, Cpu, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface ServerProcessorProps {
  onProcessComplete: (data: any[], columns: string[], fileName: string) => void
  currentFileName?: string
}

export function ServerProcessor({ onProcessComplete, currentFileName }: ServerProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingMode, setProcessingMode] = useState("standard")
  const [maxRows, setMaxRows] = useState(100000)
  const [enableCaching, setEnableCaching] = useState(true)
  const [parallelProcessing, setParallelProcessing] = useState(true)
  const [memoryLimit, setMemoryLimit] = useState(4)
  const [processingComplete, setProcessingComplete] = useState(false)
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [processingStats, setProcessingStats] = useState<{
    rowsProcessed: number
    processingTime: number
    memoryUsed: number
    cacheHits: number
  } | null>(null)

  const steps = [
    { name: "Uploading", icon: <UploadCloud className="h-5 w-5" /> },
    { name: "Parsing", icon: <Database className="h-5 w-5" /> },
    { name: "Processing", icon: <Cpu className="h-5 w-5" /> },
    { name: "Optimizing", icon: <HardDrive className="h-5 w-5" /> },
    { name: "Complete", icon: <CheckCircle2 className="h-5 w-5" /> },
  ]

  const handleStartProcessing = () => {
    setIsProcessing(true)
    setProcessingStep(0)
    setProcessingProgress(0)
    setProcessingComplete(false)
    setProcessingError(null)
    setProcessingStats(null)

    // Simulate file upload
    simulateProcessingStep(0, () => {
      // Simulate parsing
      simulateProcessingStep(1, () => {
        // Simulate processing
        simulateProcessingStep(2, () => {
          // Simulate optimizing
          simulateProcessingStep(3, () => {
            // Complete
            setProcessingStep(4)
            setProcessingProgress(100)
            setIsProcessing(false)
            setProcessingComplete(true)

            // Generate random stats
            const processingTime = Math.floor(Math.random() * 20) + 10 // 10-30 seconds
            const rowsProcessed = processingMode === "standard" ? maxRows : maxRows * 10
            const memoryUsed = (Math.random() * 2 + 0.5) * memoryLimit // 0.5-2.5x the memory limit
            const cacheHits = enableCaching ? Math.floor(rowsProcessed * 0.3) : 0 // 30% cache hits if enabled

            setProcessingStats({
              rowsProcessed,
              processingTime,
              memoryUsed,
              cacheHits,
            })

            // Generate sample data based on the processing mode
            const sampleData = generateSampleData(
              processingMode === "standard" ? 1000 : 10000,
              processingMode === "advanced" ? 20 : 10,
            )

            // Notify the parent component
            onProcessComplete(
              sampleData.data,
              sampleData.columns,
              currentFileName ? `${currentFileName} (Processed)` : "Processed Data",
            )

            toast({
              title: "Processing complete",
              description: `Successfully processed ${rowsProcessed.toLocaleString()} rows in ${processingTime} seconds`,
            })
          })
        })
      })
    })
  }

  const simulateProcessingStep = (step: number, onComplete: () => void) => {
    setProcessingStep(step)
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 5 + 1 // Random progress between 1-6%
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        onComplete()
      }
      setProcessingProgress(progress)
    }, 200)
  }

  const generateSampleData = (rows: number, columns: number) => {
    const columnNames = [
      "ID",
      "Date",
      "Product",
      "Category",
      "Region",
      "Quantity",
      "Price",
      "Revenue",
      "Customer",
      "Satisfaction",
      "Age",
      "Gender",
      "Income",
      "LoyaltyYears",
      "PurchaseCount",
      "StockLevel",
      "ReorderPoint",
      "LeadTimeDays",
      "SupplierID",
      "UnitCost",
    ]

    const selectedColumns = columnNames.slice(0, columns)
    const data = []

    for (let i = 0; i < rows; i++) {
      const row: Record<string, any> = {}
      selectedColumns.forEach((column) => {
        switch (column) {
          case "ID":
            row[column] = i + 1
            break
          case "Date":
            const date = new Date()
            date.setDate(date.getDate() - Math.floor(Math.random() * 365))
            row[column] = date.toISOString().split("T")[0]
            break
          case "Product":
            row[column] = ["Laptop", "Smartphone", "Desk Chair", "Monitor", "Desk"][Math.floor(Math.random() * 5)]
            break
          case "Category":
            row[column] = ["Electronics", "Furniture", "Office Supplies"][Math.floor(Math.random() * 3)]
            break
          case "Region":
            row[column] = ["North", "South", "East", "West"][Math.floor(Math.random() * 4)]
            break
          case "Quantity":
            row[column] = Math.floor(Math.random() * 50) + 1
            break
          case "Price":
            row[column] = Math.floor(Math.random() * 1000) + 100
            break
          case "Revenue":
            row[column] = row["Quantity"] * row["Price"] || Math.floor(Math.random() * 10000) + 1000
            break
          case "Customer":
            row[column] = ["Enterprise", "Consumer", "Small Business"][Math.floor(Math.random() * 3)]
            break
          case "Satisfaction":
            row[column] = (Math.random() * 5).toFixed(1)
            break
          default:
            if (typeof column === "string" && ["Age", "Income", "LoyaltyYears"].includes(column)) {
              row[column] = Math.floor(Math.random() * 100) + 18
            } else {
              row[column] = `Value ${i}-${column}`
            }
        }
      })
      data.push(row)
    }

    return { data, columns: selectedColumns }
  }

  const handleSimulateError = () => {
    setIsProcessing(true)
    setProcessingStep(0)
    setProcessingProgress(0)
    setProcessingComplete(false)
    setProcessingError(null)

    // Simulate file upload
    simulateProcessingStep(0, () => {
      // Simulate parsing
      simulateProcessingStep(1, () => {
        // Simulate error during processing
        setProcessingStep(2)
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 5 + 1
          if (progress >= 60) {
            // Stop at 60% with an error
            clearInterval(interval)
            setProcessingProgress(60)
            setIsProcessing(false)
            setProcessingError(
              "Memory limit exceeded during processing. Try increasing the memory allocation or reducing the dataset size.",
            )
          } else {
            setProcessingProgress(progress)
          }
        }, 200)
      })
    })
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span>Server Processing</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Server-Side Processing</DialogTitle>
            <DialogDescription>
              Process large datasets on the server to improve performance and handle files that exceed browser
              limitations.
            </DialogDescription>
          </DialogHeader>

          {!isProcessing && !processingComplete && !processingError && (
            <Tabs defaultValue="basic" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Processing Mode</Label>
                    <RadioGroup
                      value={processingMode}
                      onValueChange={setProcessingMode}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard" className="flex items-center gap-2 cursor-pointer">
                          <Database className="h-4 w-4 text-blue-500" />
                          <div>
                            <span className="font-medium">Standard Processing</span>
                            <p className="text-sm text-muted-foreground">
                              Optimized for datasets up to 100,000 rows (recommended)
                            </p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="advanced" id="advanced" />
                        <Label htmlFor="advanced" className="flex items-center gap-2 cursor-pointer">
                          <Cpu className="h-4 w-4 text-purple-500" />
                          <div>
                            <span className="font-medium">Advanced Processing</span>
                            <p className="text-sm text-muted-foreground">
                              For very large datasets (1M+ rows) with distributed processing
                            </p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="max-rows">Maximum Rows: {maxRows.toLocaleString()}</Label>
                    </div>
                    <Slider
                      id="max-rows"
                      min={1000}
                      max={1000000}
                      step={1000}
                      value={[maxRows]}
                      onValueChange={(value) => setMaxRows(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Limit the number of rows to process. Higher values require more server resources.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enable-caching"
                        checked={enableCaching}
                        onCheckedChange={(checked) => setEnableCaching(checked as boolean)}
                      />
                      <Label htmlFor="enable-caching" className="cursor-pointer">
                        Enable result caching
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      Cache processing results to improve performance for repeated operations
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="parallel-processing"
                        checked={parallelProcessing}
                        onCheckedChange={(checked) => setParallelProcessing(checked as boolean)}
                      />
                      <Label htmlFor="parallel-processing" className="cursor-pointer">
                        Enable parallel processing
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      Process data across multiple server cores simultaneously
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="memory-limit">Memory Allocation: {memoryLimit} GB</Label>
                    </div>
                    <Slider
                      id="memory-limit"
                      min={1}
                      max={16}
                      step={1}
                      value={[memoryLimit]}
                      onValueChange={(value) => setMemoryLimit(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Allocate server memory for processing. Higher values improve performance for large datasets.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeout">Processing Timeout (minutes)</Label>
                    <Input id="timeout" type="number" min="1" max="60" defaultValue="30" className="w-full" />
                    <p className="text-xs text-muted-foreground">Maximum time allowed for processing before timeout</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Data Retention</Label>
                    <RadioGroup defaultValue="24h" className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="24h" id="24h" />
                        <Label htmlFor="24h">24 hours</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="7d" id="7d" />
                        <Label htmlFor="7d">7 days</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="30d" id="30d" />
                        <Label htmlFor="30d">30 days</Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">How long to keep processed data on the server</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {isProcessing && (
            <div className="space-y-6 mt-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-full">{steps[processingStep].icon}</div>
                  <div>
                    <h3 className="font-medium">{steps[processingStep].name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Step {processingStep + 1} of {steps.length - 1}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{Math.round(processingProgress)}%</p>
                </div>
              </div>

              <Progress value={processingProgress} className="h-2" />

              <div className="grid grid-cols-4 gap-2">
                {steps.slice(0, -1).map((step, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center p-2 rounded-lg border ${
                      index < processingStep
                        ? "bg-green-50 border-green-200 text-green-700"
                        : index === processingStep
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-gray-50 border-gray-200 text-gray-400"
                    }`}
                  >
                    {step.icon}
                    <span className="text-xs mt-1">{step.name}</span>
                  </div>
                ))}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {processingMode === "standard" ? (
                  <p>Processing up to {maxRows.toLocaleString()} rows of data...</p>
                ) : (
                  <p>Advanced processing with distributed computing...</p>
                )}
              </div>
            </div>
          )}

          {processingError && (
            <div className="mt-4 space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Processing Error</AlertTitle>
                <AlertDescription>{processingError}</AlertDescription>
              </Alert>

              <div className="grid grid-cols-4 gap-2">
                {steps.slice(0, -1).map((step, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center p-2 rounded-lg border ${
                      index < processingStep
                        ? "bg-green-50 border-green-200 text-green-700"
                        : index === processingStep
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-gray-50 border-gray-200 text-gray-400"
                    }`}
                  >
                    {index === processingStep ? <AlertCircle className="h-5 w-5" /> : step.icon}
                    <span className="text-xs mt-1">{step.name}</span>
                  </div>
                ))}
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Error occurred during the {steps[processingStep].name.toLowerCase()} step.</p>
                <p className="mt-1">
                  Recommendation:{" "}
                  {memoryLimit < 8
                    ? "Try increasing the memory allocation."
                    : "Try reducing the dataset size or enabling parallel processing."}
                </p>
              </div>
            </div>
          )}

          {processingComplete && processingStats && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
                <h3 className="text-lg font-medium">Processing Complete</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Rows Processed</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="text-2xl font-bold">{processingStats.rowsProcessed.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="text-2xl font-bold">{processingStats.processingTime} seconds</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Memory Used</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="text-2xl font-bold">{processingStats.memoryUsed.toFixed(1)} GB</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Cache Hits</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="text-2xl font-bold">{processingStats.cacheHits.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertTitle>Processing Summary</AlertTitle>
                <AlertDescription>
                  Successfully processed {processingStats.rowsProcessed.toLocaleString()} rows in{" "}
                  {processingStats.processingTime} seconds using {processingStats.memoryUsed.toFixed(1)} GB of memory.
                  {enableCaching &&
                    ` ${processingStats.cacheHits.toLocaleString()} operations were accelerated by caching.`}
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter className="mt-4">
            {!isProcessing && !processingComplete && !processingError && (
              <>
                <Button variant="outline" onClick={handleSimulateError}>
                  Simulate Error
                </Button>
                <Button onClick={handleStartProcessing}>Start Processing</Button>
              </>
            )}

            {(processingComplete || processingError) && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setProcessingComplete(false)
                    setProcessingError(null)
                  }}
                >
                  Back to Settings
                </Button>
                {processingComplete && (
                  <Button
                    onClick={() => {
                      toast({
                        title: "Data loaded",
                        description: "Processed data has been loaded into the analyzer",
                      })
                    }}
                  >
                    Continue to Analysis
                  </Button>
                )}
                {processingError && <Button onClick={handleStartProcessing}>Retry Processing</Button>}
              </>
            )}

            {isProcessing && (
              <Button variant="outline" disabled>
                Processing...
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
