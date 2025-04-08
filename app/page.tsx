import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Excel Data Analyzer",
  description: "A comprehensive tool for analyzing and visualizing Excel data",
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Excel Data Analyzer
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Transform your Excel data into actionable insights with our comprehensive analysis tool. Clean,
                    transform, visualize, and explore your data with ease.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-1.5">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/docs">
                    <Button size="lg" variant="outline">
                      Documentation
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[450px] w-full overflow-hidden rounded-xl border bg-background p-4 shadow-xl">
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <div className="ml-2 text-sm font-medium">Excel Data Analyzer</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <div className="h-24 rounded-md bg-muted" />
                        <div className="mt-2 h-4 w-3/4 rounded-md bg-muted" />
                        <div className="mt-1 h-3 w-1/2 rounded-md bg-muted" />
                      </div>
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <div className="h-24 rounded-md bg-muted" />
                        <div className="mt-2 h-4 w-3/4 rounded-md bg-muted" />
                        <div className="mt-1 h-3 w-1/2 rounded-md bg-muted" />
                      </div>
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <div className="h-24 rounded-md bg-muted" />
                        <div className="mt-2 h-4 w-3/4 rounded-md bg-muted" />
                        <div className="mt-1 h-3 w-1/2 rounded-md bg-muted" />
                      </div>
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <div className="h-24 rounded-md bg-muted" />
                        <div className="mt-2 h-4 w-3/4 rounded-md bg-muted" />
                        <div className="mt-1 h-3 w-1/2 rounded-md bg-muted" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
