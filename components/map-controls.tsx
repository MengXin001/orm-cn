'use client'

import { Train, Gauge, Radio, Zap, Map, Crosshair, Check, X, Menu, List, Moon, Sun } from 'lucide-react'
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
import { useTheme } from '@/hooks/use-theme'
import { getLegendByMode, type LegendItem } from '@/lib/legend-config'
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
    legendLabel: string
    themeToggleLabel: string
    themeToDarkLabel: string
    themeToLightLabel: string
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

function ThemeToggleButton({
  theme,
  mounted,
  toggleTheme,
  text,
}: {
  theme: 'light' | 'dark'
  mounted: boolean
  toggleTheme: () => void
  text: Pick<MapControlsProps['text'], 'themeToggleLabel' | 'themeToDarkLabel' | 'themeToLightLabel'>
}) {
  const nextThemeLabel = !mounted
    ? text.themeToggleLabel
    : theme === 'dark'
      ? text.themeToLightLabel
      : text.themeToDarkLabel

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      title={nextThemeLabel}
      aria-label={nextThemeLabel}
      className="shrink-0"
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        <Sun
          className={`absolute h-4 w-4 transition-opacity ${mounted && theme === 'dark' ? 'opacity-100' : 'opacity-0'
            }`}
        />
        <Moon
          className={`absolute h-4 w-4 transition-opacity ${mounted && theme === 'light' ? 'opacity-100' : 'opacity-0'
            }`}
        />
      </span>
      <span className="sr-only">{nextThemeLabel}</span>
    </Button>
  )
}

function LegendLine({ item }: { item: LegendItem }) {
  const dashArray =
    item.pattern === 'dashed' ? '4,2' : item.pattern === 'dotted' ? '1,2' : undefined

  return (
    <svg className="h-5 w-8 flex-shrink-0" viewBox="0 0 32 20" preserveAspectRatio="none">
      <line
        x1="0"
        y1="10"
        x2="32"
        y2="10"
        stroke={item.color}
        strokeWidth={item.width ?? 2}
        strokeDasharray={dashArray}
      />
    </svg>
  )
}

function LegendPanel({ railMode }: { railMode: string }) {
  const legend = getLegendByMode(railMode)

  if (!legend) return null

  return (
    <div className="bg-background/80 p-2">
      <div className="space-y-4">
        {legend.categories.map((category) => (
          <section key={category.title} className="space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {category.title}
            </h3>
            <div className="space-y-2">
              {category.items.map((item) => (
                <div key={`${category.title}-${item.label}`} className="flex items-center gap-3">
                  <LegendLine item={item} />
                  <span className="text-xs leading-5 text-foreground break-words">{item.label}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
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
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
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
                    {option.requiresToken &&
                      (option.available ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-destructive" />
                      ))}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-md ${railMode === mode.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                    }`}
                >
                  {RAIL_ICONS[mode.key] || <Train className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{mode.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{mode.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <List className="h-3.5 w-3.5" />
            {text.legendLabel}
          </p>
          <LegendPanel railMode={railMode} />
        </div>

      </div>

      <div className="border-t border-border p-4">
        <Button onClick={onLocate} disabled={locateStatus === 'locating'} className="w-full">
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

function UpdateTimestamp({ agoHours, updateTime }: Pick<MapControlsProps, 'agoHours' | 'updateTime'>) {
  return (
    <div className="flex flex-wrap items-center text-xs">
      <span className="pr-1 font-medium uppercase tracking-wide text-muted-foreground">
        最后更新于:
      </span>
      <span className="font-medium text-foreground">{updateTime}</span>
      {agoHours > 0 && <span className="text-muted-foreground">, {agoHours} 小时前</span>}
    </div>
  )
}

export function MapControls(props: MapControlsProps) {
  const { agoHours, updateTime, text } = props
  const { theme, toggleTheme, mounted } = useTheme()

  return (
    <>
      <aside className="fixed left-0 top-0 z-20 hidden h-full w-80 flex-col border-r border-border bg-card md:flex">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <ThemeToggleButton
              theme={theme}
              mounted={mounted}
              toggleTheme={toggleTheme}
              text={text}
            />
            <div>
              <h1 className="text-xl font-semibold text-foreground">{text.title}</h1>
              <UpdateTimestamp agoHours={agoHours} updateTime={updateTime} />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <SidebarContent {...props} />
        </div>
      </aside>

      <div className="fixed left-0 right-0 top-0 z-20 flex h-12 items-center gap-3 border-b border-border bg-card p-3 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">打开菜单</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex h-full w-80 max-w-[85vw] flex-col p-0">
            <SheetHeader className="border-b border-border p-4 text-left">
              <SheetTitle className="flex items-start gap-3 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Train className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold text-foreground">{text.title}</p>
                  <UpdateTimestamp agoHours={agoHours} updateTime={updateTime} />
                </div>
              </SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1">
              <SidebarContent {...props} />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Train className="h-4 w-4" />
          </div>
          <span className="truncate font-semibold text-foreground">{text.title}</span>
          <div className="ml-auto">
            <ThemeToggleButton
              theme={theme}
              mounted={mounted}
              toggleTheme={toggleTheme}
              text={text}
            />
          </div>
        </div>
      </div>
    </>
  )
}
