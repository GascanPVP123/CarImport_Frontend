import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "CarImport",
  description: "Sistema de gestión empresarial",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={3000}
            expand={false}
            visibleToasts={3}
            toastOptions={{
              style: {
                fontFamily: "inherit",
                fontSize: "13px",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}