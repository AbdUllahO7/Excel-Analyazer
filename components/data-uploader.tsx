"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { FileSpreadsheet, Upload } from "lucide-react"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DataUploaderProps {
  onDataUpload: (data: any[], columns: string[], fileName?: string) => void
}

export function DataUploader({ onDataUpload }: DataUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const processFile = useCallback(
    (file: File) => {
      setIsUploading(true)
      setUploadProgress(0)
      setError(null)
      setFileName(file.name)

      const reader = new FileReader()

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(progress)
        }
      }

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          if (jsonData.length === 0) {
            setError("The uploaded file contains no data.")
            setIsUploading(false)
            return
          }

          // Extract column names from the first row
          const columns = Object.keys(jsonData[0])

          // Simulate a slight delay to show progress
          setTimeout(() => {
            onDataUpload(jsonData, columns, file.name)
            setIsUploading(false)
            setUploadProgress(100)
          }, 500)
        } catch (error) {
          setError("Failed to parse the Excel file. Please ensure it's a valid Excel format.")
          setIsUploading(false)
        }
      }

      reader.onerror = () => {
        setError("An error occurred while reading the file.")
        setIsUploading(false)
      }

      reader.readAsArrayBuffer(file)
    },
    [onDataUpload],
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        processFile(file)
      }
    },
    [processFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    multiple: false,
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <FileSpreadsheet className="h-10 w-10 text-gray-400" />
          <p className="text-lg font-medium">
            {isDragActive ? "Drop the Excel file here" : "Drag & drop an Excel file here"}
          </p>
          <p className="text-sm text-gray-500">or click to browse files</p>
          <p className="text-xs text-gray-400">Supports .xlsx, .xls, and .csv formats</p>
        </div>
      </div>

      {fileName && (
        <div className="flex items-center space-x-2 text-sm">
          <FileSpreadsheet className="h-4 w-4" />
          <span>{fileName}</span>
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center">
        <Button
          onClick={() => document.getElementById("file-upload")?.click()}
          disabled={isUploading}
          className="w-full sm:w-auto"
        >
          <Upload className="mr-2 h-4 w-4" />
          Select Excel File
        </Button>
      </div>
    </div>
  )
}
