import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OpenRailwayMap CN",
  description: "OpenRailwayMap CN - An OpenStreetMap-based project for creating a map of the world&#39;s railway infrastructure.",
  keywords: 'openstreetmap, openrailwaymap, alexander matheisen, rurseekatze, openlayers, osm, matheisen, orm, eisenbahnkarte, bahnkarte, railmap, railway, railways, eisenbahn, streckenkarte',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="bg-background">
      <head>
      <link rel="icon" type="image/svg+xml" href="/openrailwaymap-16.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
