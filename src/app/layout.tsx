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
  title: "TravelNJoy — Premium Used Cars",
  description:
    "Discover your perfect pre-owned vehicle at TravelNJoy. Browse hundreds of quality certified used cars with transparent pricing, full service history, and expert support.",
  keywords: [
    "used cars",
    "pre-owned vehicles",
    "buy used car",
    "certified used cars",
    "TravelNJoy",
    "car dealership",
  ],
  openGraph: {
    title: "TravelNJoy — Premium Used Cars",
    description:
      "Find your dream used car at TravelNJoy. Transparent pricing, verified vehicles, seamless buying experience.",
    type: "website",
    siteName: "TravelNJoy",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-[var(--font-inter)] antialiased">
        <div className="relative min-h-screen">
          {/* Background gradients */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-900/15 rounded-full blur-3xl" />
          </div>

          <Navbar />
          <main className="relative z-10">{children}</main>
          <Footer />
        </div>

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
