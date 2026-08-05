// app/layout.tsx (Server Component por defecto)
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

export const metadata = {
  title: "CarImport",
  description: "Sistema de gestión",
  manifest: "/manifest.json",
  themeColor: "#059669",
};