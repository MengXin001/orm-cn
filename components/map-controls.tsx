'use client'

import { Train, Gauge, Radio, Zap, Map, Crosshair, Check, X, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { BasemapOption, RailwayMode } from '@/lib/map-config'

interface MapControlsProps {
  baseOptions: (BasemapOption & { available: boolean })[]
  railwayModes: RailwayMode[]
  activeBase: BasemapOption & { available: boolean }
  activeRail: RailwayMode
  baseMap: string
  railMode: string
  locateStatus: string
  locateStatusText: Record<string, string>
  updateTime: string
  agoHours: number
  text: {
    title: string
    basemapLabel: string
    railwayLabel: string
    locateButton: string
    locateStatus: string
    available: string
    missing: string
  }
  onBaseMapChange: (value: string) => void
  onRailModeChange: (value: string) => void
  onLocate: () => void
}

const RAIL_ICONS: Record<string, React.ReactNode> = {
  standard: <Train className="h-4 w-4" />,
  maxspeed: <Gauge className="h-4 w-4" />,
  signals: <Radio className="h-4 w-4" />,
  electrification: <Zap className="h-4 w-4" />,
}

function SidebarContent({
  baseOptions,
  railwayModes,
  baseMap,
  railMode,
  locateStatus,
  locateStatusText,
  text,
  onBaseMapChange,
  onRailModeChange,
  onLocate,
}: Omit<MapControlsProps, 'activeBase' | 'activeRail'>) {
  return (
    <div className="flex h-full flex-col">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Base Map Selector */}
        <div className="mb-6">
          <label className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Map className="h-3.5 w-3.5" />
            {text.basemapLabel}
          </label>
          <Select value={baseMap} onValueChange={onBaseMapChange}>
            <SelectTrigger className="w-full border-border bg-background">
              <SelectValue placeholder="选择底图" />
            </SelectTrigger>
            <SelectContent>
              {baseOptions.map((option) => (
                <SelectItem
                  key={option.key}
                  value={option.key}
                  disabled={!option.available}
                >
                  <span className="flex items-center gap-2">
                    {option.label}
                    {option.requiresToken && (
                      option.available ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-destructive" />
                      )
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Railway Mode Selector */}
        <div className="mb-6">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Train className="h-3.5 w-3.5" />
            {text.railwayLabel}
          </p>
          <div className="space-y-2">
            {railwayModes.map((mode) => (
              <button
                key={mode.key}
                onClick={() => onRailModeChange(mode.key)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${railMode === mode.key
                  ? 'border-primary bg-accent text-foreground shadow-sm'
                  : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent/50'
                  }`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-md ${railMode === mode.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                  {RAIL_ICONS[mode.key] || <Train className="h-4 w-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{mode.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{mode.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <Button
          onClick={onLocate}
          disabled={locateStatus === 'locating'}
          className="w-full"
        >
          <Crosshair className="mr-2 h-4 w-4" />
          {text.locateButton}
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {locateStatusText[locateStatus] || locateStatus}
        </p>
      </div>
    </div>
  )
}

export function MapControls(props: MapControlsProps) {
  const { agoHours, updateTime, text } = props
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 z-20 h-full w-80 flex-col border-r border-border bg-card">
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Train className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{text.title}</h1>
              <div className="flex items-center whitespace-nowrap">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground pr-1">最后更新于:</p>
                <p className="text-xs font-medium text-foreground">{updateTime}</p>
                {agoHours > 0 && (
                  <p className="text-xs text-muted-foreground">, {agoHours}小时前</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <SidebarContent {...props} />
      </aside>

      {/* Mobile Header & Sheet */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 flex items-center gap-3 border-b border-border bg-card p-3 h-12">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">打开菜单</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="border-b border-border p-4">
              <SheetTitle className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Train className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-base font-semibold">{text.title}</p>
                  <p className="items-center whitespace-nowrap text-xs font-normal text-muted-foreground">最后更新于: {updateTime}{agoHours > 0 && (
                    <p className="mt-0.5 text-xs text-muted-foreground">, {agoHours} 小时前</p>
                  )}</p>
                </div>
              </SheetTitle>
            </SheetHeader>
            <SidebarContent {...props} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <Train className="h-4 w-4" />
          </div>
          <span className="font-semibold text-foreground truncate">{text.title}</span>
        </div>
      </div>
    </>
  )
}
