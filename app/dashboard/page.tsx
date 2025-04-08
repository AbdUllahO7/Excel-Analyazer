import type { Metadata } from "next"

import { DataDashboard } from "@/components/data-dashboard"

export const metadata: Metadata = {
  title: "Dashboard | Excel Data Analyzer",
  description: "Interactive dashboard for analyzing Excel data",
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <DataDashboard />
      </main>
    </div>
  )
}
