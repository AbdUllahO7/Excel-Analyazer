"use client"

import { useState, useRef } from "react"
import { BarChartIcon, LineChartIcon, PieChartIcon, Download, MessageSquarePlus, X } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
  ReferenceArea,
  Label,
} from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Label as UILabel } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface DataVisualizerProps {
  data: any[]
  columns: string[]
}

interface Annotation {
  id: string
  text: string
  x: number | string
  y?: number
  color: string
  type: "point" | "line" | "area"
  x2?: number | string
  y2?: number
  position: "top" | "bottom" | "left" | "right"
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#6B66FF"]

export function DataVisualizer({ data, columns }: DataVisualizerProps) {
  const [chartType, setChartType] = useState<string>("bar")
  const [xAxisColumn, setXAxisColumn] = useState<string>(columns[0] || "")
  const [yAxisColumn, setYAxisColumn] = useState<string>(columns[1] || "")
  const [pieColumn, setPieColumn] = useState<string>(columns[0] || "")
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false)
  const [newAnnotation, setNewAnnotation] = useState<Partial<Annotation>>({
    text: "",
    color: "#FF6B6B",
    type: "point",
    position: "top",
  })
  const chartRef = useRef<HTMLDivElement>(null)

  const numericColumns = columns.filter((column) => {
    // Check if column contains numeric values
    return data.some((row) => {
      const val = row[column]
      return val !== null && val !== undefined && !isNaN(Number(val))
    })
  })

  const categoricalColumns = columns.filter((column) => {
    // Check if column contains categorical values (non-numeric or few unique values)
    const uniqueValues = new Set(data.map((row) => row[column]))
    return uniqueValues.size < Math.min(20, data.length / 5)
  })

  const prepareBarLineData = () => {
    if (!xAxisColumn || !yAxisColumn) return []

    // Group by x-axis column and calculate average of y-axis values
    const groupedData: Record<string, { count: number; sum: number }> = {}

    data.forEach((row) => {
      const xValue = String(row[xAxisColumn] || "Unknown")
      const yValue = Number(row[yAxisColumn])

      if (!isNaN(yValue)) {
        if (!groupedData[xValue]) {
          groupedData[xValue] = { count: 0, sum: 0 }
        }
        groupedData[xValue].count += 1
        groupedData[xValue].sum += yValue
      }
    })

    // Convert to array and calculate averages
    return Object.entries(groupedData)
      .map(([name, { count, sum }]) => ({
        name,
        value: sum / count,
      }))
      .sort((a, b) => a.value - b.value)
      .slice(-15) // Limit to 15 items for readability
  }

  const preparePieData = () => {
    if (!pieColumn) return []

    // Count occurrences of each unique value
    const counts: Record<string, number> = {}

    data.forEach((row) => {
      const value = String(row[pieColumn] || "Unknown")
      counts[value] = (counts[value] || 0) + 1
    })

    // Convert to array and sort by count
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // Limit to 8 slices for readability
  }

  const barLineData = prepareBarLineData()
  const pieData = preparePieData()

  const handleAddAnnotation = () => {
    if (!newAnnotation.text || !newAnnotation.x) return

    const annotation: Annotation = {
      id: Date.now().toString(),
      text: newAnnotation.text || "",
      x: newAnnotation.x || "",
      y: newAnnotation.y,
      color: newAnnotation.color || "#FF6B6B",
      type: newAnnotation.type as "point" | "line" | "area",
      position: newAnnotation.position as "top" | "bottom" | "left" | "right",
    }

    if (annotation.type === "area" || annotation.type === "line") {
      annotation.x2 = newAnnotation.x2
      if (annotation.type === "area") {
        annotation.y2 = newAnnotation.y2
      }
    }

    setAnnotations([...annotations, annotation])
    setNewAnnotation({
      text: "",
      color: "#FF6B6B",
      type: "point",
      position: "top",
    })
    setIsAddingAnnotation(false)
  }

  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter((a) => a.id !== id))
  }

  const exportChart = (format: "svg" | "png") => {
    if (!chartRef || !chartRef.current) return

    const svgElement = chartRef.current.querySelector("svg")
    if (!svgElement) return

    // Create a copy of the SVG to modify
    const svgClone = svgElement.cloneNode(true) as SVGElement

    // Set background for PNG export
    svgClone.setAttribute("background", "white")

    // Get SVG data
    const svgData = new XMLSerializer().serializeToString(svgClone)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })

    if (format === "svg") {
      // Download SVG directly
      const url = URL.createObjectURL(svgBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `chart-${chartType}-${Date.now()}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (format === "png") {
      // Convert SVG to PNG
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        const pngUrl = canvas.toDataURL("image/png")

        const link = document.createElement("a")
        link.href = pngUrl
        link.download = `chart-${chartType}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      img.src = URL.createObjectURL(svgBlob)
      img.crossOrigin = "anonymous"
    }
  }

  const renderAnnotations = () => {
    if (!annotations || annotations.length === 0) return null

    return annotations
      .filter((a) => {
        // Only show annotations relevant to the current chart type
        if (chartType === "pie") return false // No annotations for pie charts yet
        return true
      })
      .map((annotation) => {
        if (annotation.type === "point") {
          return (
            <ReferenceLine
              key={annotation.id}
              x={annotation.x}
              stroke={annotation.color}
              strokeWidth={2}
              strokeDasharray="3 3"
            >
              <Label value={annotation.text} position={annotation.position} fill={annotation.color} fontSize={12} />
            </ReferenceLine>
          )
        } else if (annotation.type === "line") {
          return (
            <ReferenceLine
              key={annotation.id}
              y={annotation.y}
              label={{
                value: annotation.text,
                position: annotation.position,
                fill: annotation.color,
                fontSize: 12,
              }}
              stroke={annotation.color}
              strokeDasharray="3 3"
            />
          )
        } else if (annotation.type === "area") {
          return (
            <ReferenceArea
              key={annotation.id}
              x1={annotation.x}
              x2={annotation.x2}
              y1={annotation.y}
              y2={annotation.y2}
              stroke={annotation.color}
              strokeOpacity={0.3}
              fill={annotation.color}
              fillOpacity={0.1}
              label={{
                value: annotation.text,
                position: "insideBottomRight",
                fill: annotation.color,
                fontSize: 12,
              }}
            />
          )
        }
        return null
      })
  }

  return (
    <div className="space-y-6">
      <Tabs value={chartType} onValueChange={setChartType} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="bar" className="flex items-center gap-2">
            <BarChartIcon className="h-4 w-4" />
            <span>Bar Chart</span>
          </TabsTrigger>
          <TabsTrigger value="line" className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            <span>Line Chart</span>
          </TabsTrigger>
          <TabsTrigger value="pie" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            <span>Pie Chart</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportChart("svg")} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              SVG
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportChart("png")} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              PNG
            </Button>
          </div>
          {chartType !== "pie" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingAnnotation(true)}
              className="flex items-center gap-1"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Add Annotation
            </Button>
          )}
        </div>

        <TabsContent value="bar" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <UILabel htmlFor="x-axis">X-Axis (Category)</UILabel>
              <Select value={xAxisColumn} onValueChange={setXAxisColumn}>
                <SelectTrigger id="x-axis">
                  <SelectValue placeholder="Select X-Axis" />
                </SelectTrigger>
                <SelectContent>
                  {categoricalColumns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <UILabel htmlFor="y-axis">Y-Axis (Value)</UILabel>
              <Select value={yAxisColumn} onValueChange={setYAxisColumn}>
                <SelectTrigger id="y-axis">
                  <SelectValue placeholder="Select Y-Axis" />
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

          <Card>
            <CardContent className="pt-6">
              <div ref={chartRef}>
                <ChartContainer
                  config={{
                    value: {
                      label: yAxisColumn,
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barLineData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} />
                      <YAxis />
                      <Tooltip formatter={(value) => Number(value).toFixed(2)} />
                      <Legend />
                      <Bar dataKey="value" name={yAxisColumn} fill="var(--color-value)" />
                      {renderAnnotations()}
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="line" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <UILabel htmlFor="x-axis-line">X-Axis (Category)</UILabel>
              <Select value={xAxisColumn} onValueChange={setXAxisColumn}>
                <SelectTrigger id="x-axis-line">
                  <SelectValue placeholder="Select X-Axis" />
                </SelectTrigger>
                <SelectContent>
                  {categoricalColumns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <UILabel htmlFor="y-axis-line">Y-Axis (Value)</UILabel>
              <Select value={yAxisColumn} onValueChange={setYAxisColumn}>
                <SelectTrigger id="y-axis-line">
                  <SelectValue placeholder="Select Y-Axis" />
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

          <Card>
            <CardContent className="pt-6">
              <div ref={chartRef}>
                <ChartContainer
                  config={{
                    value: {
                      label: yAxisColumn,
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={barLineData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} />
                      <YAxis />
                      <Tooltip formatter={(value) => Number(value).toFixed(2)} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={yAxisColumn}
                        stroke="var(--color-value)"
                        activeDot={{ r: 8 }}
                      />
                      {renderAnnotations()}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pie" className="space-y-4">
          <div className="space-y-2">
            <UILabel htmlFor="pie-column">Category Column</UILabel>
            <Select value={pieColumn} onValueChange={setPieColumn}>
              <SelectTrigger id="pie-column">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categoricalColumns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div ref={chartRef} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isAddingAnnotation && (
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Add Annotation</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsAddingAnnotation(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <UILabel htmlFor="annotation-text">Annotation Text</UILabel>
              <Textarea
                id="annotation-text"
                value={newAnnotation.text || ""}
                onChange={(e) => setNewAnnotation({ ...newAnnotation, text: e.target.value })}
                placeholder="Enter annotation text"
              />
            </div>

            <div className="space-y-2">
              <UILabel htmlFor="annotation-type">Annotation Type</UILabel>
              <Select
                value={newAnnotation.type as string}
                onValueChange={(value) => setNewAnnotation({ ...newAnnotation, type: value as any })}
              >
                <SelectTrigger id="annotation-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="point">Point (Vertical Line)</SelectItem>
                  <SelectItem value="line">Horizontal Line</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newAnnotation.type === "point" && (
              <div className="space-y-2">
                <UILabel htmlFor="annotation-x">X Value (Category)</UILabel>
                <Select
                  value={newAnnotation.x as string}
                  onValueChange={(value) => setNewAnnotation({ ...newAnnotation, x: value })}
                >
                  <SelectTrigger id="annotation-x">
                    <SelectValue placeholder="Select X value" />
                  </SelectTrigger>
                  <SelectContent>
                    {barLineData.map((item) => (
                      <SelectItem key={item.name} value={item.name}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newAnnotation.type === "line" && (
              <div className="space-y-2">
                <UILabel htmlFor="annotation-y">Y Value</UILabel>
                <Input
                  id="annotation-y"
                  type="number"
                  value={newAnnotation.y || ""}
                  onChange={(e) => setNewAnnotation({ ...newAnnotation, y: Number(e.target.value) })}
                  placeholder="Enter Y value"
                />
              </div>
            )}

            {newAnnotation.type === "area" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <UILabel htmlFor="annotation-x1">X1 Value</UILabel>
                    <Select
                      value={newAnnotation.x as string}
                      onValueChange={(value) => setNewAnnotation({ ...newAnnotation, x: value })}
                    >
                      <SelectTrigger id="annotation-x1">
                        <SelectValue placeholder="Select X1 value" />
                      </SelectTrigger>
                      <SelectContent>
                        {barLineData.map((item) => (
                          <SelectItem key={item.name} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <UILabel htmlFor="annotation-x2">X2 Value</UILabel>
                    <Select
                      value={newAnnotation.x2 as string}
                      onValueChange={(value) => setNewAnnotation({ ...newAnnotation, x2: value })}
                    >
                      <SelectTrigger id="annotation-x2">
                        <SelectValue placeholder="Select X2 value" />
                      </SelectTrigger>
                      <SelectContent>
                        {barLineData.map((item) => (
                          <SelectItem key={item.name} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <UILabel htmlFor="annotation-y1">Y1 Value</UILabel>
                    <Input
                      id="annotation-y1"
                      type="number"
                      value={newAnnotation.y || ""}
                      onChange={(e) => setNewAnnotation({ ...newAnnotation, y: Number(e.target.value) })}
                      placeholder="Enter Y1 value"
                    />
                  </div>
                  <div className="space-y-2">
                    <UILabel htmlFor="annotation-y2">Y2 Value</UILabel>
                    <Input
                      id="annotation-y2"
                      type="number"
                      value={newAnnotation.y2 || ""}
                      onChange={(e) => setNewAnnotation({ ...newAnnotation, y2: Number(e.target.value) })}
                      placeholder="Enter Y2 value"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <UILabel htmlFor="annotation-position">Text Position</UILabel>
              <Select
                value={newAnnotation.position as string}
                onValueChange={(value) => setNewAnnotation({ ...newAnnotation, position: value as any })}
              >
                <SelectTrigger id="annotation-position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <UILabel htmlFor="annotation-color">Color</UILabel>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: newAnnotation.color }} />
                <Input
                  id="annotation-color"
                  value={newAnnotation.color || "#FF6B6B"}
                  onChange={(e) => setNewAnnotation({ ...newAnnotation, color: e.target.value })}
                  placeholder="#FF6B6B"
                />
              </div>
            </div>

            <Button onClick={handleAddAnnotation} className="w-full">
              Add Annotation
            </Button>
          </div>
        </Card>
      )}

      {annotations.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Annotations</h3>
            <div className="space-y-2">
              {annotations.map((annotation) => (
                <div key={annotation.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: annotation.color }} />
                    <span>{annotation.text}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeAnnotation(annotation.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
