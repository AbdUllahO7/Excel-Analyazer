"use client"

import { useState } from "react"
import { BarChart, Filter, Table, Trash2, Upload, Wand2, TrendingUp, ArrowLeftRight, BrainCircuit } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataUploader } from "@/components/data-uploader"
import { DataTable } from "@/components/data-table"
import { DataCleaner } from "@/components/data-cleaner"
import { DataTransformer } from "@/components/data-transformer"
import { ColumnManager } from "@/components/column-manager"
import { DataVisualizer } from "@/components/data-visualizer"
import { ComparativeAnalysis } from "@/components/comparative-analysis"
import { IntelligentAnalysis } from "@/components/intelligent-analysis"
import { ThemeToggle } from "@/components/theme-toggle"
import { GuidedTour } from "@/components/guided-tour"
import { TemplatesMenu, type AnalysisTemplate } from "@/components/templates-menu"
import { RecentFiles, type RecentFile } from "@/components/recent-files"
import { SampleDatasets } from "@/components/sample-datasets"
import { ShareDialog } from "@/components/share-dialog"
import { ExportReport } from "@/components/export-report"
import { CommentsPanel } from "@/components/comments-panel"
import { CollaborationIndicator } from "@/components/collaboration-indicator"
import { ServerProcessor } from "@/components/server-processor"
import { SessionManager } from "@/components/session-manager"
import { MultiFileManager } from "@/components/multi-file-manager"
import { ApiConnector } from "@/components/api-connector"
import { AITools } from "@/components/ai-tools"

export function DataDashboard() {
  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("upload")
  const [currentFileName, setCurrentFileName] = useState<string>("")

  // Handle data upload
  const handleDataUpload = (uploadedData: any[], uploadedColumns: string[], fileName = "Uploaded Data") => {
    setData(uploadedData)
    setColumns(uploadedColumns)
    setCurrentFileName(fileName)
    setActiveTab("explore")

    // Save to recent files
    if (uploadedData.length > 0) {
      saveToRecentFiles(uploadedData, uploadedColumns, fileName)
    }
  }

  // Save to recent files in localStorage
  const saveToRecentFiles = (uploadedData: any[], uploadedColumns: string[], fileName: string) => {
    try {
      // Get existing recent files
      const storedFiles = localStorage.getItem("excel-analyzer-recent-files")
      let recentFiles: RecentFile[] = storedFiles ? JSON.parse(storedFiles) : []

      // Create new file entry
      const newFile: RecentFile = {
        id: Date.now().toString(),
        name: fileName,
        date: new Date().toISOString(),
        columns: uploadedColumns,
        data: uploadedData.slice(0, 100), // Limit stored data to prevent localStorage overflow
      }

      // Add to beginning of array and limit to 10 files
      recentFiles = [newFile, ...recentFiles.filter((file) => file.name !== fileName)].slice(0, 10)

      // Save back to localStorage
      localStorage.setItem("excel-analyzer-recent-files", JSON.stringify(recentFiles))
    } catch (error) {
      console.error("Failed to save to recent files:", error)
    }
  }

  // Handle loading a recent file
  const handleLoadRecentFile = (file: RecentFile) => {
    setData(file.data)
    setColumns(file.columns)
    setCurrentFileName(file.name)
    setActiveTab("explore")
  }

  // Handle loading a sample dataset
  const handleLoadSampleDataset = (dataset: any) => {
    setData(dataset.data)
    setColumns(Object.keys(dataset.data[0] || {}))
    setCurrentFileName(dataset.name)
    setActiveTab("explore")
  }

  // Handle applying a template
  const handleApplyTemplate = (template: AnalysisTemplate) => {
    // Apply template settings based on the data
    // This would typically set up visualizations, transformations, etc.
    console.log("Applying template:", template.name)

    // For demonstration, we'll just navigate to the appropriate tab
    if (template.config.visualizations.length > 0) {
      setActiveTab("visualize")
    } else if (template.config.transformations.length > 0) {
      setActiveTab("transform")
    } else if (template.config.intelligentAnalysis.length > 0) {
      setActiveTab("intelligent")
    }
  }

  const handleDataCleaning = (cleanedData: any[]) => {
    setData(cleanedData)
  }

  const handleDataTransformation = (transformedData: any[]) => {
    setData(transformedData)
  }

  const handleColumnUpdate = (updatedColumns: string[]) => {
    setColumns(updatedColumns)
  }

  // Handle loading a session
  const handleLoadSession = (session: any) => {
    setData(session.dataSnapshot.data)
    setColumns(session.dataSnapshot.columns)
    setCurrentFileName(session.dataSnapshot.fileName)
    setActiveTab(session.activeTab)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Excel Data Analyzer</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="tour-templates">
              <TemplatesMenu onSelectTemplate={handleApplyTemplate} />
            </div>
            <div className="tour-samples">
              <SampleDatasets onSelectDataset={handleLoadSampleDataset} />
            </div>
            <div className="tour-recent">
              <RecentFiles onSelectFile={handleLoadRecentFile} />
            </div>
            <div className="tour-theme">
              <ThemeToggle />
            </div>
            <GuidedTour activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              {currentFileName ? currentFileName : "Upload your data to get started"}
            </h2>

            {data.length > 0 && (
              <div className="flex items-center gap-2">
                <ServerProcessor onProcessComplete={handleDataUpload} currentFileName={currentFileName} />
                <SessionManager
                  data={data}
                  columns={columns}
                  currentFileName={currentFileName}
                  activeTab={activeTab}
                  onSessionLoad={handleLoadSession}
                />
                <MultiFileManager onFilesSelected={handleDataUpload} currentFileName={currentFileName} />
                <ApiConnector onDataFetched={handleDataUpload} />
                <ShareDialog data={data} columns={columns} currentFileName={currentFileName} currentTab={activeTab} />
                <ExportReport data={data} columns={columns} currentFileName={currentFileName} />
                <CommentsPanel currentTab={activeTab} />
                <CollaborationIndicator currentTab={activeTab} />
              </div>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {data.length > 0
              ? `${data.length} rows, ${columns.length} columns`
              : "Upload, clean, transform, and analyze your Excel data"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-9 gap-2">
            <TabsTrigger value="upload" className="flex items-center gap-2 tour-upload">
              <Upload className="h-4 w-4" />
              <span className="hidden md:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="explore" className="flex items-center gap-2 tour-explore" disabled={!data.length}>
              <Table className="h-4 w-4" />
              <span className="hidden md:inline">Explore</span>
            </TabsTrigger>
            <TabsTrigger value="clean" className="flex items-center gap-2 tour-clean" disabled={!data.length}>
              <Trash2 className="h-4 w-4" />
              <span className="hidden md:inline">Clean</span>
            </TabsTrigger>
            <TabsTrigger value="transform" className="flex items-center gap-2 tour-transform" disabled={!data.length}>
              <Wand2 className="h-4 w-4" />
              <span className="hidden md:inline">Transform</span>
            </TabsTrigger>
            <TabsTrigger value="columns" className="flex items-center gap-2 tour-columns" disabled={!data.length}>
              <Filter className="h-4 w-4" />
              <span className="hidden md:inline">Columns</span>
            </TabsTrigger>
            <TabsTrigger value="visualize" className="flex items-center gap-2 tour-visualize" disabled={!data.length}>
              <BarChart className="h-4 w-4" />
              <span className="hidden md:inline">Visualize</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2 tour-compare" disabled={!data.length}>
              <ArrowLeftRight className="h-4 w-4" />
              <span className="hidden md:inline">Compare</span>
            </TabsTrigger>
            <TabsTrigger
              value="intelligent"
              className="flex items-center gap-2 tour-intelligent"
              disabled={!data.length}
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden md:inline">Intelligent</span>
            </TabsTrigger>
            <TabsTrigger value="ai-tools" className="flex items-center gap-2 tour-ai-tools" disabled={!data.length}>
              <BrainCircuit className="h-4 w-4" />
              <span className="hidden md:inline">AI Tools</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Excel Data</CardTitle>
                <CardDescription>
                  Upload your Excel file to begin analysis. We support .xlsx, .xls, and .csv formats.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataUploader onDataUpload={handleDataUpload} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="explore" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Explorer</CardTitle>
                <CardDescription>
                  Browse and search through your data with advanced filtering and sorting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable data={data} columns={columns} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clean" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Cleaning</CardTitle>
                <CardDescription>
                  Clean your data by handling missing values, removing duplicates, and fixing inconsistencies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataCleaner data={data} columns={columns} onDataCleaned={handleDataCleaning} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transform" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Transformation</CardTitle>
                <CardDescription>
                  Transform your data with operations like normalization, binning, and encoding.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTransformer data={data} columns={columns} onDataTransformed={handleDataTransformation} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="columns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Column Management</CardTitle>
                <CardDescription>Manage columns by adding, removing, or modifying them.</CardDescription>
              </CardHeader>
              <CardContent>
                <ColumnManager data={data} columns={columns} onColumnsUpdated={handleColumnUpdate} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visualize" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Visualization</CardTitle>
                <CardDescription>Create charts and graphs to visualize your data with annotations.</CardDescription>
              </CardHeader>
              <CardContent>
                <DataVisualizer data={data} columns={columns} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compare" className="space-y-4">
            <ComparativeAnalysis data={data} columns={columns} />
          </TabsContent>

          <TabsContent value="intelligent" className="space-y-4">
            <IntelligentAnalysis data={data} columns={columns} />
          </TabsContent>

          <TabsContent value="ai-tools" className="space-y-4">
            <AITools data={data} columns={columns} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
