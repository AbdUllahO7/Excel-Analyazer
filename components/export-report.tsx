"use client"

import { useState } from "react"
import { FileText, Download, FileImage, FileJson, FileSpreadsheet } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface ExportReportProps {
  data: any[]
  columns: string[]
  currentFileName: string
}

export function ExportReport({ data, columns, currentFileName }: ExportReportProps) {
  const [exportFormat, setExportFormat] = useState("pdf")
  const [exportTab, setExportTab] = useState("report")
  const [reportTitle, setReportTitle] = useState(`${currentFileName} Analysis Report`)
  const [includeDataTable, setIncludeDataTable] = useState(true)
  const [includeVisualizations, setIncludeVisualizations] = useState(true)
  const [includeStatistics, setIncludeStatistics] = useState(true)
  const [includeInsights, setIncludeInsights] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const handleExport = () => {
    // In a real app, this would generate and download the report
    // For now, we'll simulate the export process
    setIsExporting(true)
    setExportProgress(0)

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsExporting(false)

          // Simulate download completion
          setTimeout(() => {
            const fileName = reportTitle.replace(/\s+/g, "-").toLowerCase()
            const extension =
              exportFormat === "csv"
                ? "csv"
                : exportFormat === "json"
                  ? "json"
                  : exportFormat === "excel"
                    ? "xlsx"
                    : exportFormat === "image"
                      ? "png"
                      : "pdf"

            toast({
              title: "Export complete",
              description: `${fileName}.${extension} has been downloaded`,
            })
          }, 500)

          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Export Analysis</DialogTitle>
            <DialogDescription>Export your analysis as a report or raw data in various formats.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="report" onValueChange={setExportTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="report" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Report</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Raw Data</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="report" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="report-title">Report Title</Label>
                <Input id="report-title" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Report Format</Label>
                <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4 text-red-500" />
                      <span>PDF Document</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="word" id="word" />
                    <Label htmlFor="word" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span>Word Document</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="image" id="image" />
                    <Label htmlFor="image" className="flex items-center gap-2 cursor-pointer">
                      <FileImage className="h-4 w-4 text-purple-500" />
                      <span>Image (PNG)</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Include in Report</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-data"
                      checked={includeDataTable}
                      onCheckedChange={(checked) => setIncludeDataTable(checked as boolean)}
                    />
                    <Label htmlFor="include-data" className="cursor-pointer">
                      Data Table
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-viz"
                      checked={includeVisualizations}
                      onCheckedChange={(checked) => setIncludeVisualizations(checked as boolean)}
                    />
                    <Label htmlFor="include-viz" className="cursor-pointer">
                      Visualizations
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-stats"
                      checked={includeStatistics}
                      onCheckedChange={(checked) => setIncludeStatistics(checked as boolean)}
                    />
                    <Label htmlFor="include-stats" className="cursor-pointer">
                      Statistical Analysis
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-insights"
                      checked={includeInsights}
                      onCheckedChange={(checked) => setIncludeInsights(checked as boolean)}
                    />
                    <Label htmlFor="include-insights" className="cursor-pointer">
                      Insights & Recommendations
                    </Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <RadioGroup value={exportFormat} onValueChange={setExportFormat} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4 text-green-500" />
                      <span>CSV File</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excel" id="excel" />
                    <Label htmlFor="excel" className="flex items-center gap-2 cursor-pointer">
                      <FileSpreadsheet className="h-4 w-4 text-green-700" />
                      <span>Excel Spreadsheet</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="json" id="json" />
                    <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                      <FileJson className="h-4 w-4 text-yellow-500" />
                      <span>JSON File</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Data to Export</Label>
                  <span className="text-sm text-muted-foreground">{data.length} rows</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-all" checked={true} disabled />
                    <Label htmlFor="export-all" className="cursor-pointer">
                      All data
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-filtered" disabled />
                    <Label htmlFor="export-filtered" className="cursor-pointer text-muted-foreground">
                      Filtered data only (no filters applied)
                    </Label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {isExporting && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span>Exporting...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} />
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2">
              {isExporting ? (
                <>Processing...</>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
