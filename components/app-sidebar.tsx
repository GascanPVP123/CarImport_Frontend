"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
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
    nombre: "CarImport S.A.C.",
    version: "v1.0.0",
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
    <Sidebar collapsible="icon" {...props} className="border-r border-slate-800">
      {/* Header */}lrfjk298+
      <SidebarHeader className="bg-slate-950 border-b border-slate-800 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 font-bold text-slate-950">
                CI
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-semibold text-slate-200">
                  {data.empresa.nombre}
                </span>
                <span className="text-xs text-slate-400">{data.empresa.version}</span>
              </div>
            </div>
          </SidebarMenuItem>
          
        </SidebarMenu>
      </SidebarHeader>   

      {/* Menú */}
      <SidebarContent className="bg-slate-900 px-2 py-4">
        {data.navegacion.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="px-3 mb-2 text-xs font-bold u .ppercase tracking-wider text-slate-400">
              {group.title}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1">
              {group.items.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      className="w-full"
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

      {/* Footer */}
      <SidebarFooter className="bg-slate-950 border-t border-slate-800 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/login");
              }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-950/40"
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