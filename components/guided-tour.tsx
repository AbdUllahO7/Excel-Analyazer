"use client"

import { useState, useEffect } from "react"
import { HelpCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

interface GuidedTourProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

interface TourStep {
  target: string
  title: string
  content: string
  placement?: "top" | "bottom" | "left" | "right"
  tab?: string
}

export function GuidedTour({ activeTab, onTabChange }: GuidedTourProps) {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenTour, setHasSeenTour] = useState(false)

  useEffect(() => {
    // Check if the user has seen the tour before
    const tourSeen = localStorage.getItem("excel-analyzer-tour-seen")
    if (!tourSeen) {
      // Show the tour automatically for first-time users
      setTimeout(() => {
        setOpen(true)
      }, 1000)
    } else {
      setHasSeenTour(true)
    }
  }, [])

  const steps: TourStep[] = [
    {
      target: ".tour-upload",
      title: "Upload Data",
      content: "Start by uploading your Excel file here. We support .xlsx, .xls, and .csv formats.",
      placement: "bottom",
      tab: "upload",
    },
    {
      target: ".tour-explore",
      title: "Explore Data",
      content: "After uploading, you can explore your data with advanced filtering and sorting options.",
      placement: "bottom",
      tab: "explore",
    },
    {
      target: ".tour-clean",
      title: "Clean Data",
      content: "Clean your data by handling missing values, removing duplicates, and fixing inconsistencies.",
      placement: "bottom",
      tab: "clean",
    },
    {
      target: ".tour-transform",
      title: "Transform Data",
      content: "Transform your data with operations like normalization, binning, and encoding.",
      placement: "bottom",
      tab: "transform",
    },
    {
      target: ".tour-columns",
      title: "Manage Columns",
      content: "Manage columns by adding, removing, or modifying them.",
      placement: "bottom",
      tab: "columns",
    },
    {
      target: ".tour-visualize",
      title: "Visualize Data",
      content: "Create interactive charts and graphs to visualize your data with annotations.",
      placement: "bottom",
      tab: "visualize",
    },
    {
      target: ".tour-compare",
      title: "Compare Data",
      content: "Compare data across different dimensions and datasets with side-by-side visualizations.",
      placement: "bottom",
      tab: "compare",
    },
    {
      target: ".tour-intelligent",
      title: "Intelligent Analysis",
      content:
        "Use intelligent analysis to automatically detect trends, correlations, anomalies, and make predictions.",
      placement: "bottom",
      tab: "intelligent",
    },
    {
      target: ".tour-templates",
      title: "Templates",
      content: "Use predefined templates for common data analysis scenarios.",
      placement: "bottom",
      tab: "upload",
    },
    {
      target: ".tour-samples",
      title: "Sample Datasets",
      content: "Explore sample datasets to learn how to use the tool effectively.",
      placement: "bottom",
      tab: "upload",
    },
    {
      target: ".tour-recent",
      title: "Recent Files",
      content: "Quickly access your recently uploaded files here.",
      placement: "bottom",
      tab: "upload",
    },
    {
      target: ".tour-theme",
      title: "Theme Toggle",
      content: "Toggle between light and dark mode for comfortable viewing.",
      placement: "left",
      tab: "upload",
    },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)

      // Change tab if needed
      if (steps[nextStep].tab && steps[nextStep].tab !== activeTab) {
        onTabChange(steps[nextStep].tab)
      }
    } else {
      handleFinish()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)

      // Change tab if needed
      if (steps[prevStep].tab && steps[prevStep].tab !== activeTab) {
        onTabChange(steps[prevStep].tab)
      }
    }
  }

  const handleFinish = () => {
    setOpen(false)
    localStorage.setItem("excel-analyzer-tour-seen", "true")
    setHasSeenTour(true)
    onTabChange("upload")
  }

  const startTour = () => {
    setOpen(true)
    setCurrentStep(0)
    onTabChange("upload")
  }

  return (
    <>
      <Button variant="outline" size="icon" className="rounded-full" onClick={startTour} title="Start guided tour">
        <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Start guided tour</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{steps[currentStep].title}</DialogTitle>
            <DialogDescription>
              Step {currentStep + 1} of {steps.length}
            </DialogDescription>
          </DialogHeader>

          <Card className="mt-4">
            <CardContent className="pt-6">{steps[currentStep].content}</CardContent>
          </Card>

          <DialogFooter className="flex justify-between mt-4">
            <div>
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
                Previous
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleFinish}>
                Skip
              </Button>
              <Button onClick={handleNext}>
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "Finish"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
