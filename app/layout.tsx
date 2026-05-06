import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Work_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RGL Estudio",
  description: "Plataforma de gestión de servicios, reservas y suscripciones de RGL Estudio.",
  applicationName: "RGL Estudio",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RGL Estudio",
  },
};

export const viewport: Viewport = {
  themeColor: "#ae2900",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${workSans.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
