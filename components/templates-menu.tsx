"use client"

import type React from "react"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { FileIcon as FileTemplate, TrendingUp, BarChart, Calendar, DollarSign, Users, ShoppingCart } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Define template types
export interface AnalysisTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  config: {
    visualizations: {
      type: string
      xAxis?: string
      yAxis?: string
      pieColumn?: string
    }[]
    transformations: {
      type: string
      column?: string
      newColumn?: string
      method?: string
    }[]
    intelligentAnalysis: {
      type: string
      columns?: string[]
    }[]
  }
}

// Sample templates
const templates: AnalysisTemplate[] = [
  {
    id: "sales-analysis",
    name: "Sales Analysis",
    description: "Analyze sales data with revenue trends, product performance, and customer segments",
    icon: <DollarSign className="h-4 w-4" />,
    config: {
      visualizations: [
        { type: "bar", xAxis: "Product", yAxis: "Revenue" },
        { type: "line", xAxis: "Date", yAxis: "Revenue" },
        { type: "pie", pieColumn: "Category" },
      ],
      transformations: [{ type: "normalize", column: "Revenue", newColumn: "NormalizedRevenue", method: "minmax" }],
      intelligentAnalysis: [
        { type: "trends", columns: ["Date", "Revenue"] },
        { type: "correlation", columns: ["Quantity", "Revenue"] },
      ],
    },
  },
  {
    id: "customer-segmentation",
    name: "Customer Segmentation",
    description: "Segment customers based on demographics, purchase behavior, and engagement",
    icon: <Users className="h-4 w-4" />,
    config: {
      visualizations: [
        { type: "scatter", xAxis: "Age", yAxis: "Income" },
        { type: "bar", xAxis: "Segment", yAxis: "CustomerCount" },
        { type: "pie", pieColumn: "Region" },
      ],
      transformations: [{ type: "binning", column: "Age", newColumn: "AgeGroup", method: "equalwidth" }],
      intelligentAnalysis: [
        { type: "correlation", columns: ["Age", "PurchaseFrequency"] },
        { type: "anomalies", columns: ["PurchaseValue"] },
      ],
    },
  },
  {
    id: "financial-reporting",
    name: "Financial Reporting",
    description: "Analyze financial data with profit/loss trends, expense breakdowns, and forecasting",
    icon: <TrendingUp className="h-4 w-4" />,
    config: {
      visualizations: [
        { type: "line", xAxis: "Month", yAxis: "Revenue" },
        { type: "bar", xAxis: "ExpenseCategory", yAxis: "Amount" },
        { type: "line", xAxis: "Quarter", yAxis: "Profit" },
      ],
      transformations: [{ type: "formula", newColumn: "Profit", formula: "Revenue - Expenses" }],
      intelligentAnalysis: [
        { type: "trends", columns: ["Month", "Revenue"] },
        { type: "prediction", columns: ["Month", "Revenue"] },
      ],
    },
  },
  {
    id: "inventory-management",
    name: "Inventory Management",
    description: "Track inventory levels, stock turnover, and reorder points",
    icon: <ShoppingCart className="h-4 w-4" />,
    config: {
      visualizations: [
        { type: "bar", xAxis: "Product", yAxis: "StockLevel" },
        { type: "line", xAxis: "Month", yAxis: "Turnover" },
      ],
      transformations: [{ type: "formula", newColumn: "DaysOfSupply", formula: "StockLevel / AverageDailySales" }],
      intelligentAnalysis: [
        { type: "prediction", columns: ["Date", "StockLevel"] },
        { type: "anomalies", columns: ["Turnover"] },
      ],
    },
  },
  {
    id: "time-series",
    name: "Time Series Analysis",
    description: "Analyze time-based data with trend detection, seasonality, and forecasting",
    icon: <Calendar className="h-4 w-4" />,
    config: {
      visualizations: [{ type: "line", xAxis: "Date", yAxis: "Value" }],
      transformations: [{ type: "normalize", column: "Value", newColumn: "NormalizedValue", method: "zscore" }],
      intelligentAnalysis: [
        { type: "trends", columns: ["Date", "Value"] },
        { type: "prediction", columns: ["Date", "Value"] },
      ],
    },
  },
  {
    id: "survey-results",
    name: "Survey Results Analysis",
    description: "Analyze survey responses with distribution charts and correlation analysis",
    icon: <BarChart className="h-4 w-4" />,
    config: {
      visualizations: [
        { type: "bar", xAxis: "Response", yAxis: "Count" },
        { type: "pie", pieColumn: "Category" },
      ],
      transformations: [{ type: "binning", column: "Rating", newColumn: "RatingGroup", method: "equalwidth" }],
      intelligentAnalysis: [{ type: "correlation", columns: ["Age", "Rating"] }],
    },
  },
]

interface TemplatesMenuProps {
  onSelectTemplate: (template: AnalysisTemplate) => void
  className?: string
}

export function TemplatesMenu({ onSelectTemplate, className }: TemplatesMenuProps) {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>(templates[0].id)

  const handleApplyTemplate = () => {
    const template = templates.find((t) => t.id === selectedTemplate)
    if (template) {
      onSelectTemplate(template)
    }
    setShowTemplateDialog(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={`flex items-center gap-2 ${className}`}>
            <FileTemplate className="h-4 w-4" />
            <span className="hidden md:inline">Templates</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Analysis Templates</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {templates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => {
                setSelectedTemplate(template.id)
                setShowTemplateDialog(true)
              }}
              className="flex items-center gap-2"
            >
              {template.icon}
              <span>{template.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply Analysis Template</DialogTitle>
            <DialogDescription>
              Choose a template to apply predefined visualizations and analysis to your data.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
              {templates.map((template) => (
                <div key={template.id} className="flex items-start space-x-2 space-y-1">
                  <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                  <div className="grid gap-1.5">
                    <Label htmlFor={template.id} className="font-medium flex items-center gap-2">
                      {template.icon}
                      {template.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyTemplate}>Apply Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
