import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/app-sidebar";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <SidebarTrigger className="mb-4 md:hidden">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          {children}
        </main>
      </SidebarProvider>
    </ProtectedRoute>
  );
}