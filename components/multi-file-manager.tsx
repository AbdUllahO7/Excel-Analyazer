"use client"

import { useState } from "react"
import { Files, FileSpreadsheet, ArrowRight, X, Check, AlertCircle, FileUp } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useDropzone } from "react-dropzone"
import * as XLSX from "xlsx"

interface DataFile {
  id: string
  name: string
  data: any[]
  columns: string[]
  size: number
  dateAdded: string
  selected?: boolean
}

interface MultiFileManagerProps {
  onFilesSelected: (files: DataFile[]) => void
  currentFileName?: string
}

export function MultiFileManager({ onFilesSelected, currentFileName }: MultiFileManagerProps) {
  const [files, setFiles] = useState<DataFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [mergeType, setMergeType] = useState("append")
  const [keyColumn, setKeyColumn] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingError, setProcessingError] = useState<string | null>(null)

  const onDrop = async (acceptedFiles: File[]) => {
    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    const newFiles: DataFile[] = []
    let processedFiles = 0

    for (const file of acceptedFiles) {
      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const newProgress = prev + Math.random() * 5
            return newProgress > 100 ? 100 : newProgress
          })
        }, 100)

        // Read the file
        const data = await readExcelFile(file)
        clearInterval(progressInterval)

        if (data.length === 0) {
          setUploadError(`File "${file.name}" contains no data.`)
          setIsUploading(false)
          return
        }

        // Extract column names from the first row
        const columns = Object.keys(data[0])

        newFiles.push({
          id: Date.now() + processedFiles.toString(),
          name: file.name,
          data,
          columns,
          size: file.size,
          dateAdded: new Date().toISOString(),
        })

        processedFiles++
        setUploadProgress((processedFiles / acceptedFiles.length) * 100)
      } catch (error) {
        setUploadError(`Failed to parse file "${file.name}". Please ensure it's a valid Excel format.`)
        setIsUploading(false)
        return
      }
    }

    setFiles((prevFiles) => [...prevFiles, ...newFiles])
    setIsUploading(false)
    setUploadProgress(100)

    toast({
      title: "Files uploaded",
      description: `Successfully uploaded ${newFiles.length} file(s)`,
    })
  }

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error("An error occurred while reading the file."))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    multiple: true,
  })

  const handleRemoveFile = (fileId: string) => {
    setFiles(files.filter((file) => file.id !== fileId))
  }

  const handleToggleFileSelection = (fileId: string) => {
    setFiles(files.map((file) => (file.id === fileId ? { ...file, selected: !file.selected } : file)))
  }

  const handleSelectAllFiles = (selected: boolean) => {
    setFiles(files.map((file) => ({ ...file, selected })))
  }

  const handleProcessFiles = () => {
    const selectedFiles = files.filter((file) => file.selected)

    if (selectedFiles.length < 2) {
      toast({
        title: "Selection required",
        description: "Please select at least two files to process",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setProcessingProgress(0)
    setProcessingError(null)

    // Simulate processing
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 5 + 1
      if (progress >= 100) {
        clearInterval(interval)
        progress = 100

        try {
          let processedData: any[] = []

          if (mergeType === "append") {
            // Simple append - concatenate all data
            processedData = selectedFiles.flatMap((file) => file.data)
          } else if (mergeType === "join") {
            // Join on key column
            if (!keyColumn) {
              throw new Error("Key column is required for join operations")
            }

            // Check if key column exists in all selected files
            const missingKeyFiles = selectedFiles.filter((file) => !file.columns.includes(keyColumn))
            if (missingKeyFiles.length > 0) {
              throw new Error(`Key column "${keyColumn}" not found in ${missingKeyFiles.length} file(s)`)
            }

            // Create a map of key values to rows from the first file
            const keyMap = new Map()
            selectedFiles[0].data.forEach((row) => {
              const keyValue = row[keyColumn]
              if (keyValue !== undefined && keyValue !== null) {
                keyMap.set(keyValue, { ...row })
              }
            })

            // Merge data from other files based on key
            for (let i = 1; i < selectedFiles.length; i++) {
              const file = selectedFiles[i]
              file.data.forEach((row) => {
                const keyValue = row[keyColumn]
                if (keyValue !== undefined && keyValue !== null && keyMap.has(keyValue)) {
                  // Merge row data with existing entry
                  const existingRow = keyMap.get(keyValue)
                  keyMap.set(keyValue, { ...existingRow, ...row })
                }
              })
            }

            processedData = Array.from(keyMap.values())
          }

          // Get all unique columns
          const allColumns = Array.from(new Set(selectedFiles.flatMap((file) => file.columns)))

          onFilesSelected([
            {
              id: "merged-" + Date.now(),
              name: "Merged Data",
              data: processedData,
              columns: allColumns,
              size: processedData.length * 100, // Rough estimate
              dateAdded: new Date().toISOString(),
            },
          ])

          toast({
            title: "Files processed",
            description: `Successfully merged ${selectedFiles.length} files with ${processedData.length} rows`,
          })

          setIsProcessing(false)
        } catch (error) {
          setProcessingError((error as Error).message)
          setIsProcessing(false)
        }
      }
      setProcessingProgress(progress)
    }, 100)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  // Get common columns across all selected files
  const selectedFiles = files.filter((file) => file.selected)
  const commonColumns =
    selectedFiles.length > 0
      ? selectedFiles.reduce((common, file) => {
          if (common.length === 0) return [...file.columns]
          return common.filter((col) => file.columns.includes(col))
        }, [] as string[])
      : []

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Files className="h-4 w-4" />
            <span>Multi-File</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Multi-File Manager</DialogTitle>
            <DialogDescription>
              Upload, manage, and analyze multiple files together. Combine data from different sources for comprehensive
              analysis.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="upload" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                <span>Upload Files</span>
              </TabsTrigger>
              <TabsTrigger value="process" className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                <span>Process Files</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <FileSpreadsheet className="h-10 w-10 text-gray-400" />
                  <p className="text-lg font-medium">
                    {isDragActive ? "Drop the Excel files here" : "Drag & drop Excel files here"}
                  </p>
                  <p className="text-sm text-gray-500">or click to browse files</p>
                  <p className="text-xs text-gray-400">Supports multiple .xlsx, .xls, and .csv files</p>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {uploadError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Upload Error</AlertTitle>
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Uploaded Files</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAllFiles(true)}
                      disabled={files.length === 0}
                      className="h-8 text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAllFiles(false)}
                      disabled={files.length === 0}
                      className="h-8 text-xs"
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md overflow-hidden">
                  {files.length > 0 ? (
                    <div className="divide-y">
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center p-3 hover:bg-muted/50">
                          <Checkbox
                            checked={file.selected}
                            onCheckedChange={() => handleToggleFileSelection(file.id)}
                            className="mr-3"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <FileSpreadsheet className="h-4 w-4 mr-2 flex-shrink-0" />
                              <p className="font-medium truncate">{file.name}</p>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <span>{file.data.length} rows</span>
                              <span className="mx-1">•</span>
                              <span>{file.columns.length} columns</span>
                              <span className="mx-1">•</span>
                              <span>{formatFileSize(file.size)}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFile(file.id)}
                            className="h-8 w-8 ml-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      <p>No files uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="process" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Merge Type</Label>
                  <RadioGroup value={mergeType} onValueChange={setMergeType} className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="append" id="append" />
                      <Label htmlFor="append" className="cursor-pointer">
                        <div>
                          <span className="font-medium">Append (Stack)</span>
                          <p className="text-sm text-muted-foreground">
                            Combine files by stacking rows on top of each other
                          </p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="join" id="join" />
                      <Label htmlFor="join" className="cursor-pointer">
                        <div>
                          <span className="font-medium">Join (Merge)</span>
                          <p className="text-sm text-muted-foreground">
                            Combine files by matching rows based on a key column
                          </p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {mergeType === "join" && (
                  <div className="space-y-2">
                    <Label htmlFor="key-column">Key Column</Label>
                    <div className="flex gap-2">
                      <select
                        id="key-column"
                        value={keyColumn}
                        onChange={(e) => setKeyColumn(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select a column</option>
                        {commonColumns.map((column) => (
                          <option key={column} value={column}>
                            {column}
                          </option>
                        ))}
                      </select>
                    </div>
                    {commonColumns.length === 0 && selectedFiles.length > 0 && (
                      <p className="text-xs text-amber-500">
                        No common columns found across selected files. Please select files with common columns.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Selected Files</h3>
                  <div className="border rounded-md p-3">
                    {selectedFiles.length > 0 ? (
                      <div className="space-y-2">
                        {selectedFiles.map((file) => (
                          <div key={file.id} className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">({file.data.length} rows)</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <p>No files selected</p>
                        <p className="text-xs mt-1">Please select files in the Upload tab</p>
                      </div>
                    )}
                  </div>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing files...</span>
                      <span>{Math.round(processingProgress)}%</span>
                    </div>
                    <Progress value={processingProgress} />
                  </div>
                )}

                {processingError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Processing Error</AlertTitle>
                    <AlertDescription>{processingError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button
              onClick={handleProcessFiles}
              disabled={selectedFiles.length < 2 || isProcessing || (mergeType === "join" && !keyColumn)}
            >
              Process Files
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
