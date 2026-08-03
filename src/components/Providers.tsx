"use client"
import { SessionProvider } from "next-auth/react"
import React from "react"
import { ThemeProvider } from "@/components/ThemeProvider"
import { CarDataProvider } from "@/components/CarDataProvider"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <ThemeProvider>
        <CarDataProvider>
          {children}
        </CarDataProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
