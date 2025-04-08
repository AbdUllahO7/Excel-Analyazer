"use client"

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
import { Database, DollarSign, Users, ShoppingCart, BarChart, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Sample datasets
export const sampleDatasets = [
  {
    id: "sales-data",
    name: "Sales Data",
    description: "Monthly sales data with product categories, regions, and revenue figures",
    icon: <DollarSign className="h-4 w-4" />,
    rowCount: 500,
    columnCount: 8,
    data: [
      {
        Date: "2023-01-01",
        Product: "Laptop",
        Category: "Electronics",
        Region: "North",
        Quantity: 12,
        Price: 1200,
        Revenue: 14400,
        Customer: "Enterprise",
      },
      {
        Date: "2023-01-15",
        Product: "Smartphone",
        Category: "Electronics",
        Region: "South",
        Quantity: 25,
        Price: 800,
        Revenue: 20000,
        Customer: "Consumer",
      },
      {
        Date: "2023-01-22",
        Product: "Desk Chair",
        Category: "Furniture",
        Region: "East",
        Quantity: 10,
        Price: 250,
        Revenue: 2500,
        Customer: "Enterprise",
      },
      {
        Date: "2023-02-05",
        Product: "Monitor",
        Category: "Electronics",
        Region: "West",
        Quantity: 15,
        Price: 350,
        Revenue: 5250,
        Customer: "Consumer",
      },
      {
        Date: "2023-02-12",
        Product: "Desk",
        Category: "Furniture",
        Region: "North",
        Quantity: 8,
        Price: 400,
        Revenue: 3200,
        Customer: "Enterprise",
      },
      // More data would be included in the actual implementation
    ],
  },
  {
    id: "customer-data",
    name: "Customer Demographics",
    description: "Customer data with demographics, purchase history, and satisfaction scores",
    icon: <Users className="h-4 w-4" />,
    rowCount: 1000,
    columnCount: 10,
    data: [
      {
        CustomerID: 1001,
        Age: 34,
        Gender: "Female",
        Region: "North",
        Income: 75000,
        PurchaseCount: 12,
        TotalSpent: 2450,
        SatisfactionScore: 4.5,
        LoyaltyYears: 3,
        CustomerType: "Premium",
      },
      {
        CustomerID: 1002,
        Age: 28,
        Gender: "Male",
        Region: "South",
        Income: 52000,
        PurchaseCount: 5,
        TotalSpent: 850,
        SatisfactionScore: 3.8,
        LoyaltyYears: 1,
        CustomerType: "Standard",
      },
      {
        CustomerID: 1003,
        Age: 45,
        Gender: "Male",
        Region: "East",
        Income: 92000,
        PurchaseCount: 20,
        TotalSpent: 4200,
        SatisfactionScore: 4.9,
        LoyaltyYears: 5,
        CustomerType: "Premium",
      },
      {
        CustomerID: 1004,
        Age: 52,
        Gender: "Female",
        Region: "West",
        Income: 110000,
        PurchaseCount: 15,
        TotalSpent: 3800,
        SatisfactionScore: 4.2,
        LoyaltyYears: 4,
        CustomerType: "Premium",
      },
      {
        CustomerID: 1005,
        Age: 23,
        Gender: "Female",
        Region: "South",
        Income: 48000,
        PurchaseCount: 3,
        TotalSpent: 420,
        SatisfactionScore: 3.5,
        LoyaltyYears: 0.5,
        CustomerType: "Standard",
      },
      // More data would be included in the actual implementation
    ],
  },
  {
    id: "inventory-data",
    name: "Inventory Management",
    description: "Inventory data with stock levels, reorder points, and supplier information",
    icon: <ShoppingCart className="h-4 w-4" />,
    rowCount: 200,
    columnCount: 9,
    data: [
      {
        ProductID: "P001",
        ProductName: "Laptop",
        Category: "Electronics",
        StockLevel: 45,
        ReorderPoint: 20,
        LeadTimeDays: 14,
        SupplierID: "S001",
        UnitCost: 800,
        LastRestockDate: "2023-01-15",
      },
      {
        ProductID: "P002",
        ProductName: "Smartphone",
        Category: "Electronics",
        StockLevel: 78,
        ReorderPoint: 30,
        LeadTimeDays: 10,
        SupplierID: "S001",
        UnitCost: 500,
        LastRestockDate: "2023-02-01",
      },
      {
        ProductID: "P003",
        ProductName: "Desk Chair",
        Category: "Furniture",
        StockLevel: 12,
        ReorderPoint: 15,
        LeadTimeDays: 21,
        SupplierID: "S002",
        UnitCost: 150,
        LastRestockDate: "2023-01-10",
      },
      {
        ProductID: "P004",
        ProductName: "Monitor",
        Category: "Electronics",
        StockLevel: 25,
        ReorderPoint: 20,
        LeadTimeDays: 14,
        SupplierID: "S003",
        UnitCost: 200,
        LastRestockDate: "2023-02-10",
      },
      {
        ProductID: "P005",
        ProductName: "Desk",
        Category: "Furniture",
        StockLevel: 8,
        ReorderPoint: 10,
        LeadTimeDays: 21,
        SupplierID: "S002",
        UnitCost: 250,
        LastRestockDate: "2023-01-05",
      },
      // More data would be included in the actual implementation
    ],
  },
  {
    id: "time-series-data",
    name: "Website Traffic",
    description: "Daily website traffic data with page views, unique visitors, and conversion rates",
    icon: <Calendar className="h-4 w-4" />,
    rowCount: 365,
    columnCount: 7,
    data: [
      {
        Date: "2023-01-01",
        PageViews: 12500,
        UniqueVisitors: 4200,
        BounceRate: 0.45,
        AvgSessionDuration: 185,
        Conversions: 120,
        ConversionRate: 0.0286,
      },
      {
        Date: "2023-01-02",
        PageViews: 13200,
        UniqueVisitors: 4500,
        BounceRate: 0.42,
        AvgSessionDuration: 195,
        Conversions: 135,
        ConversionRate: 0.03,
      },
      {
        Date: "2023-01-03",
        PageViews: 14100,
        UniqueVisitors: 4800,
        BounceRate: 0.4,
        AvgSessionDuration: 210,
        Conversions: 142,
        ConversionRate: 0.0296,
      },
      {
        Date: "2023-01-04",
        PageViews: 13800,
        UniqueVisitors: 4600,
        BounceRate: 0.41,
        AvgSessionDuration: 205,
        Conversions: 138,
        ConversionRate: 0.03,
      },
      {
        Date: "2023-01-05",
        PageViews: 14500,
        UniqueVisitors: 4900,
        BounceRate: 0.39,
        AvgSessionDuration: 215,
        Conversions: 150,
        ConversionRate: 0.0306,
      },
      // More data would be included in the actual implementation
    ],
  },
  {
    id: "survey-data",
    name: "Customer Satisfaction Survey",
    description: "Survey results with satisfaction scores across different product and service dimensions",
    icon: <BarChart className="h-4 w-4" />,
    rowCount: 500,
    columnCount: 12,
    data: [
      {
        ResponseID: 1,
        Age: 34,
        Gender: "Female",
        ProductSatisfaction: 4,
        ServiceSatisfaction: 5,
        EaseOfUse: 4,
        ValueForMoney: 3,
        WouldRecommend: "Yes",
        PurchaseFrequency: "Monthly",
        FeedbackText: "Great product, excellent service",
        SubmissionDate: "2023-01-15",
      },
      {
        ResponseID: 2,
        Age: 28,
        Gender: "Male",
        ProductSatisfaction: 3,
        ServiceSatisfaction: 2,
        EaseOfUse: 4,
        ValueForMoney: 2,
        WouldRecommend: "No",
        PurchaseFrequency: "Rarely",
        FeedbackText: "Product is good but overpriced",
        SubmissionDate: "2023-01-16",
      },
      {
        ResponseID: 3,
        Age: 45,
        Gender: "Male",
        ProductSatisfaction: 5,
        ServiceSatisfaction: 5,
        EaseOfUse: 5,
        ValueForMoney: 4,
        WouldRecommend: "Yes",
        PurchaseFrequency: "Weekly",
        FeedbackText: "Excellent all around",
        SubmissionDate: "2023-01-17",
      },
      {
        ResponseID: 4,
        Age: 52,
        Gender: "Female",
        ProductSatisfaction: 4,
        ServiceSatisfaction: 4,
        EaseOfUse: 3,
        ValueForMoney: 4,
        WouldRecommend: "Yes",
        PurchaseFrequency: "Monthly",
        FeedbackText: "Good product but could be more intuitive",
        SubmissionDate: "2023-01-18",
      },
      {
        ResponseID: 5,
        Age: 23,
        Gender: "Female",
        ProductSatisfaction: 3,
        ServiceSatisfaction: 4,
        EaseOfUse: 3,
        ValueForMoney: 3,
        WouldRecommend: "Maybe",
        PurchaseFrequency: "Rarely",
        FeedbackText: "Decent but not outstanding",
        SubmissionDate: "2023-01-19",
      },
      // More data would be included in the actual implementation
    ],
  },
]

interface SampleDatasetsProps {
  onSelectDataset: (dataset: any) => void
  className?: string
}

export function SampleDatasets({ onSelectDataset, className }: SampleDatasetsProps) {
  const [showDatasetDialog, setShowDatasetDialog] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={`flex items-center gap-2 ${className}`}>
            <Database className="h-4 w-4" />
            <span className="hidden md:inline">Sample Data</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Sample Datasets</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sampleDatasets.map((dataset) => (
            <DropdownMenuItem
              key={dataset.id}
              onClick={() => onSelectDataset(dataset)}
              className="flex items-center gap-2"
            >
              {dataset.icon}
              <span>{dataset.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDatasetDialog(true)}>View all samples</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDatasetDialog} onOpenChange={setShowDatasetDialog}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Sample Datasets</DialogTitle>
            <DialogDescription>
              Choose a sample dataset to explore the features of Excel Data Analyzer
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {sampleDatasets.map((dataset) => (
              <Card key={dataset.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {dataset.icon}
                    {dataset.name}
                  </CardTitle>
                  <CardDescription>{dataset.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rows:</span>
                      <span>{dataset.rowCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Columns:</span>
                      <span>{dataset.columnCount}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      onSelectDataset(dataset)
                      setShowDatasetDialog(false)
                    }}
                  >
                    Load Dataset
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
