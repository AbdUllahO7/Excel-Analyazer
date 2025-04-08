"use client"

import { useState } from "react"
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
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface ComparativeAnalysisProps {
  data: any[]
  columns: string[]
}

export function ComparativeAnalysis({ data, columns }: ComparativeAnalysisProps) {
  const [chartType, setChartType] = useState<string>("bar")
  const [xAxisColumn, setXAxisColumn] = useState<string>(columns[0] || "")
  const [yAxisColumns, setYAxisColumns] = useState<string[]>([])
  const [dataset1Filter, setDataset1Filter] = useState<string>("")
  const [dataset2Filter, setDataset2Filter] = useState<string>("")
  const [filterValue1, setFilterValue1] = useState<string>("")
  const [filterValue2, setFilterValue2] = useState<string>("")

  const numericColumns = columns.filter((column) => {
    return data.some((row) => {
      const val = row[column]
      return val !== null && val !== undefined && !isNaN(Number(val))
    })
  })

  const categoricalColumns = columns.filter((column) => {
    const uniqueValues = new Set(data.map((row) => row[column]))
    return uniqueValues.size < Math.min(20, data.length / 5)
  })

  const getUniqueValuesForColumn = (column: string) => {
    if (!column) return []
    const uniqueValues = new Set<string>()
    data.forEach((row) => {
      if (row[column] !== null && row[column] !== undefined) {
        uniqueValues.add(String(row[column]))
      }
    })
    return Array.from(uniqueValues)
  }

  const toggleYAxisColumn = (column: string) => {
    setYAxisColumns((prev) => (prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]))
  }

  const prepareDataset1 = () => {
    if (!xAxisColumn || yAxisColumns.length === 0) return []

    let filteredData = data
    if (dataset1Filter && filterValue1) {
      filteredData = data.filter((row) => String(row[dataset1Filter]) === filterValue1)
    }

    // Group by x-axis column and calculate values for each y-axis column
    const groupedData: Record<string, Record<string, { count: number; sum: number }>> = {}

    filteredData.forEach((row) => {
      const xValue = String(row[xAxisColumn] || "Unknown")

      if (!groupedData[xValue]) {
        groupedData[xValue] = {}
      }

      yAxisColumns.forEach((yColumn) => {
        const yValue = Number(row[yColumn])

        if (!isNaN(yValue)) {
          if (!groupedData[xValue][yColumn]) {
            groupedData[xValue][yColumn] = { count: 0, sum: 0 }
          }
          groupedData[xValue][yColumn].count += 1
          groupedData[xValue][yColumn].sum += yValue
        }
      })
    })

    // Convert to array and calculate averages
    return Object.entries(groupedData)
      .map(([name, values]) => {
        const result: any = { name }

        yAxisColumns.forEach((yColumn) => {
          if (values[yColumn]) {
            result[yColumn] = values[yColumn].sum / values[yColumn].count
          } else {
            result[yColumn] = 0
          }
        })

        return result
      })
      .sort((a, b) => a[yAxisColumns[0]] - b[yAxisColumns[0]])
  }

  const prepareDataset2 = () => {
    if (!xAxisColumn || yAxisColumns.length === 0) return []

    let filteredData = data
    if (dataset2Filter && filterValue2) {
      filteredData = data.filter((row) => String(row[dataset2Filter]) === filterValue2)
    }

    // Group by x-axis column and calculate values for each y-axis column
    const groupedData: Record<string, Record<string, { count: number; sum: number }>> = {}

    filteredData.forEach((row) => {
      const xValue = String(row[xAxisColumn] || "Unknown")

      if (!groupedData[xValue]) {
        groupedData[xValue] = {}
      }

      yAxisColumns.forEach((yColumn) => {
        const yValue = Number(row[yColumn])

        if (!isNaN(yValue)) {
          if (!groupedData[xValue][yColumn]) {
            groupedData[xValue][yColumn] = { count: 0, sum: 0 }
          }
          groupedData[xValue][yColumn].count += 1
          groupedData[xValue][yColumn].sum += yValue
        }
      })
    })

    // Convert to array and calculate averages
    return Object.entries(groupedData)
      .map(([name, values]) => {
        const result: any = { name }

        yAxisColumns.forEach((yColumn) => {
          if (values[yColumn]) {
            result[`${yColumn}_2`] = values[yColumn].sum / values[yColumn].count
          } else {
            result[`${yColumn}_2`] = 0
          }
        })

        return result
      })
      .sort((a, b) => a[`${yAxisColumns[0]}_2`] - b[`${yAxisColumns[0]}_2`])
  }

  const prepareScatterData = () => {
    if (yAxisColumns.length < 2) return []

    let filteredData = data
    if (dataset1Filter && filterValue1) {
      filteredData = data.filter((row) => String(row[dataset1Filter]) === filterValue1)
    }

    return filteredData
      .map((row) => {
        const x = Number(row[yAxisColumns[0]])
        const y = Number(row[yAxisColumns[1]])

        if (isNaN(x) || isNaN(y)) return null

        return {
          x,
          y,
          z: 10, // Size of the dot
          name: row[xAxisColumn] || "Unknown",
        }
      })
      .filter(Boolean)
  }

  const dataset1 = prepareDataset1()
  const dataset2 = prepareDataset2()
  const scatterData = prepareScatterData()

  const exportChart = (chartRef: HTMLDivElement | null, format: "svg" | "png") => {
    if (!chartRef) return

    const svgElement = chartRef.querySelector("svg")
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
      link.download = `comparison-${chartType}-${Date.now()}.svg`
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
        link.download = `comparison-${chartType}-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      img.src = URL.createObjectURL(svgBlob)
      img.crossOrigin = "anonymous"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comparative Analysis</CardTitle>
          <CardDescription>Compare data across different dimensions and datasets</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={chartType} onValueChange={setChartType} className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="bar">Side-by-Side Bar</TabsTrigger>
              <TabsTrigger value="line">Overlaid Line</TabsTrigger>
              <TabsTrigger value="scatter">Scatter Plot</TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="x-axis-comp">X-Axis (Category)</Label>
                <Select value={xAxisColumn} onValueChange={setXAxisColumn}>
                  <SelectTrigger id="x-axis-comp">
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
                <Label>Y-Axis Columns (Values)</Label>
                <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                  {numericColumns.map((column) => (
                    <div key={column} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`y-axis-${column}`}
                        checked={yAxisColumns.includes(column)}
                        onCheckedChange={() => toggleYAxisColumn(column)}
                      />
                      <Label htmlFor={`y-axis-${column}`} className="text-sm">
                        {column}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Dataset 1 Filter</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={dataset1Filter} onValueChange={setDataset1Filter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No filter</SelectItem>
                      {categoricalColumns.map((column) => (
                        <SelectItem key={column} value={column}>
                          {column}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {dataset1Filter && (
                    <Select value={filterValue1} onValueChange={setFilterValue1}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter value" />
                      </SelectTrigger>
                      <SelectContent>
                        {getUniqueValuesForColumn(dataset1Filter).map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Dataset 2 Filter</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={dataset2Filter} onValueChange={setDataset2Filter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No filter</SelectItem>
                      {categoricalColumns.map((column) => (
                        <SelectItem key={column} value={column}>
                          {column}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {dataset2Filter && (
                    <Select value={filterValue2} onValueChange={setFilterValue2}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter value" />
                      </SelectTrigger>
                      <SelectContent>
                        {getUniqueValuesForColumn(dataset2Filter).map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  const chartDiv = (e.target as HTMLElement).closest(".chart-container")
                  exportChart(chartDiv as HTMLDivElement, "svg")
                }}
              >
                <Download className="h-4 w-4 mr-1" /> SVG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  const chartDiv = (e.target as HTMLElement).closest(".chart-container")
                  exportChart(chartDiv as HTMLDivElement, "png")
                }}
              >
                <Download className="h-4 w-4 mr-1" /> PNG
              </Button>
            </div>

            <TabsContent value="bar" className="space-y-4">
              <div className="chart-container">
                <ChartContainer
                  config={
                    yAxisColumns.length > 0
                      ? yAxisColumns.reduce(
                          (acc, column) => {
                            acc[column] = {
                              label: `${column} (Dataset 1)`,
                              color: `hsl(var(--chart-${yAxisColumns.indexOf(column) + 1}))`,
                            }
                            acc[`${column}_2`] = {
                              label: `${column} (Dataset 2)`,
                              color: `hsl(var(--chart-${yAxisColumns.indexOf(column) + 1 + yAxisColumns.length}))`,
                            }
                            return acc
                          },
                          {} as Record<string, { label: string; color: string }>,
                        )
                      : {}
                  }
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        type="category"
                        allowDuplicatedCategory={false}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => Number(value).toFixed(2)} />
                      <Legend />

                      {dataset1.length > 0 && yAxisColumns.length > 0 && (
                        <>
                          {yAxisColumns.map((column, index) => (
                            <Bar
                              key={`${column}-1`}
                              dataKey={column}
                              data={dataset1}
                              name={`${column} (${filterValue1 || "All"})`}
                              fill={`var(--color-${column})`}
                            />
                          ))}
                        </>
                      )}

                      {dataset2.length > 0 && (
                        <>
                          {yAxisColumns.map((column, index) => (
                            <Bar
                              key={`${column}-2`}
                              dataKey={`${column}_2`}
                              data={dataset2}
                              name={`${column} (${filterValue2 || "All"})`}
                              fill={`var(--color-${column}_2)`}
                            />
                          ))}
                        </>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </TabsContent>

            <TabsContent value="line" className="space-y-4">
              <div className="chart-container">
                <ChartContainer
                  config={
                    yAxisColumns.length > 0
                      ? yAxisColumns.reduce(
                          (acc, column) => {
                            acc[column] = {
                              label: `${column} (Dataset 1)`,
                              color: `hsl(var(--chart-${yAxisColumns.indexOf(column) + 1}))`,
                            }
                            acc[`${column}_2`] = {
                              label: `${column} (Dataset 2)`,
                              color: `hsl(var(--chart-${yAxisColumns.indexOf(column) + 1 + yAxisColumns.length}))`,
                            }
                            return acc
                          },
                          {} as Record<string, { label: string; color: string }>,
                        )
                      : {}
                  }
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        type="category"
                        allowDuplicatedCategory={false}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => Number(value).toFixed(2)} />
                      <Legend />

                      {dataset1.length > 0 && yAxisColumns.length > 0 && (
                        <>
                          {yAxisColumns.map((column, index) => (
                            <Line
                              key={`${column}-1`}
                              type="monotone"
                              dataKey={column}
                              data={dataset1}
                              name={`${column} (${filterValue1 || "All"})`}
                              stroke={`var(--color-${column})`}
                              activeDot={{ r: 8 }}
                            />
                          ))}
                        </>
                      )}

                      {dataset2.length > 0 && (
                        <>
                          {yAxisColumns.map((column, index) => (
                            <Line
                              key={`${column}-2`}
                              type="monotone"
                              dataKey={`${column}_2`}
                              data={dataset2}
                              name={`${column} (${filterValue2 || "All"})`}
                              stroke={`var(--color-${column}_2)`}
                              strokeDasharray="5 5"
                              activeDot={{ r: 8 }}
                            />
                          ))}
                        </>
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </TabsContent>

            <TabsContent value="scatter" className="space-y-4">
              <div className="chart-container">
                <ChartContainer className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name={yAxisColumns[0] || "X"}
                        label={{ value: yAxisColumns[0] || "X", position: "bottom" }}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name={yAxisColumns[1] || "Y"}
                        label={{ value: yAxisColumns[1] || "Y", angle: -90, position: "left" }}
                      />
                      <ZAxis type="number" dataKey="z" range={[60, 400]} />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        formatter={(value, name) => [Number(value).toFixed(2), name]}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-2 border rounded shadow-sm">
                                <p className="font-medium">{payload[0].payload.name}</p>
                                <p>{`${yAxisColumns[0]}: ${Number(payload[0].value).toFixed(2)}`}</p>
                                <p>{`${yAxisColumns[1]}: ${Number(payload[1].value).toFixed(2)}`}</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend />
                      <Scatter name={`${yAxisColumns[0]} vs ${yAxisColumns[1]}`} data={scatterData} fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
