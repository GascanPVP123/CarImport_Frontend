"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  BarChart3,
  LogOut,
  Truck,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  empresa: {
    nombre: "CarImport",
    version: "v1.0",
  },
  navegacion: [
    {
      title: "General",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Comercial",
      items: [
        { title: "Cotizaciones", url: "/dashboard/cotizaciones", icon: FileText },
        { title: "Pedidos", url: "/dashboard/pedidos", icon: ShoppingCart },
      ],
    },
    {
      title: "Operaciones",
      items: [
        { title: "Consignaciones", url: "/dashboard/consignaciones", icon: Truck },
        { title: "Productos", url: "/dashboard/productos", icon: Package },
      ],
    },
    {
      title: "Finanzas",
      items: [
        { title: "Cuentas Corrientes", url: "/dashboard/cuentas-corrientes", icon: Wallet },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-100 p-4 bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 font-bold text-white shadow-sm">
                CI
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-bold text-gray-900">
                  {data.empresa.nombre}
                </span>
                <span className="text-xs text-gray-400">{data.empresa.version}</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-white px-2 py-4">
        {data.navegacion.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              {group.title}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1">
              {group.items.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      className={`w-full rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 font-semibold shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      render={
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 p-3 bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/login");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-500 transition-all hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}