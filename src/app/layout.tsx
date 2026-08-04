import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://travel-n-joy.vercel.app"),
  title: "TravelNJoy — Premium Used Cars",
  description:
    "Discover your perfect pre-owned vehicle at TravelNJoy. Browse quality certified used cars with transparent pricing, verified documents, and expert support.",
  keywords: [
    "used cars",
    "pre-owned vehicles",
    "buy used car",
    "certified used cars",
    "TravelNJoy",
    "car dealership",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/images/logo.jpg", type: "image/jpeg" },
    ],
    shortcut: "/icon.svg",
    apple: "/images/logo.jpg",
  },
  openGraph: {
    title: "TravelNJoy — Premium Used Cars",
    description:
      "Find your dream used car at TravelNJoy. Transparent pricing, verified vehicles, seamless buying experience.",
    url: "https://travel-n-joy.vercel.app",
    siteName: "TravelNJoy",
    type: "website",
    images: [
      {
        url: "https://travel-n-joy.vercel.app/images/logo.jpg",
        width: 1200,
        height: 1200,
        alt: "TravelNJoy Premium Used Cars Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TravelNJoy — Premium Used Cars",
    description:
      "Find your dream used car at TravelNJoy. Transparent pricing, verified vehicles, seamless buying experience.",
    images: ["https://travel-n-joy.vercel.app/images/logo.jpg"],
  },
};

import Providers from "@/components/Providers";
import NetworkIndicator from "@/components/NetworkIndicator";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var d = document.documentElement;
                  var saved = localStorage.getItem('travelnjoy_theme');
                  var isDark = false;
                  if (saved === 'dark') {
                    isDark = true;
                  } else if (saved === 'light') {
                    isDark = false;
                  } else {
                    var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    var hour = new Date().getHours();
                    var timeDark = hour >= 19 || hour < 6;
                    isDark = !!(systemDark || timeDark);
                  }
                  if (isDark) {
                    d.classList.add('dark');
                    d.style.colorScheme = 'dark';
                  } else {
                    d.classList.remove('dark');
                    d.style.colorScheme = 'light';
                  }
                  d.setAttribute('data-theme-resolved', isDark ? 'dark' : 'light');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-[var(--font-inter)] antialiased bg-[#F8F7FF] text-slate-900 dark:bg-[#0A0A0F] dark:text-[#F8F8FF] transition-colors duration-300">
        <Providers>
          <div className="relative min-h-screen pb-16 md:pb-0">
            {/* Background gradients */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <div className="hidden md:block absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />
              <div className="hidden md:block absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/15 via-transparent to-transparent pointer-events-none" />
            </div>

            <Navbar />
            <main className="relative z-10">{children}</main>
            <Footer />
          </div>
          <NetworkIndicator />
        </Providers>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#13131F",
              color: "#F8F8FF",
              border: "1px solid rgba(124, 58, 237, 0.3)",
              borderRadius: "12px",
            },
            success: {
              iconTheme: {
                primary: "#7C3AED",
                secondary: "#F8F8FF",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
