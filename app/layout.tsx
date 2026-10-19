import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

// Vercel sets this on production deploys; fall back to localhost for dev.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Vishnu Sanjay",
  description:
    "Vishnu Sanjay, content creator. Writer, director, editor, designer and photographer making founders, products and brands worth watching.",
  openGraph: {
    title: "Vishnu Sanjay · Content Creator",
    description: "Making founders, products and brands worth watching.",
    // The link preview (WhatsApp, LinkedIn, iMessage, X…). 1200×630 card: name + portrait.
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Vishnu Sanjay, Content Creator" }],
    url: "/",
    siteName: "Vishnu Sanjay",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vishnu Sanjay · Content Creator",
    description: "Making founders, products and brands worth watching.",
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c0c0d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable} suppressHydrationWarning>
      <head>
        {/* Hide reveal-on-scroll elements only once JS is known to run */}
        <script dangerouslySetInnerHTML={{ __html: "var c=document.documentElement.classList;c.add('js');if(window.top!==window)c.add('booted','landed','skip-intro')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
