import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
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
    <html lang="pt-BR">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
