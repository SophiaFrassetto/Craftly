import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pt-14 md:pl-64 md:pt-0">
        {children}
      </main>
    </div>
  )
}
