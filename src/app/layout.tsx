import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { Toaster } from "sonner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KYN - Finanças Pessoais",
  description: "Registre e acompanhe seus gastos com o mínimo de atrito — pelo app ou pelo WhatsApp em 5 segundos.",
  keywords: ["finanças", "finanças pessoais", "controle financeiro", "gastos", "whatsapp"],
  authors: [{ name: "KYN" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "KYN - Finanças Pessoais",
    description: "Registre e acompanhe seus gastos com o mínimo de atrito",
    siteName: "KYN",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b77f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ServiceWorkerRegister />
          <Toaster position="top-center" richColors />
          {/* Landscape block overlay (mobile only, CSS-controlled) */}
          <div
            id="landscape-block"
            className="fixed inset-0 z-[9999] bg-background items-center justify-center text-center p-8 hidden"
          >
            <div>
              <p className="text-4xl mb-4">📱</p>
              <p className="text-lg font-semibold font-heading">Gire o celular</p>
              <p className="text-muted-foreground mt-1">O KYN funciona melhor em modo retrato.</p>
            </div>
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
