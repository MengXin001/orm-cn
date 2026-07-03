'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  BASEMAPS,
  DEFAULT_VIEW,
  RAILWAY_MODES,
  buildStyle,
  ensureRailwayOverlay,
  getDefaultBaseMapKey,
  isBaseMapAvailable,
  type TokenConfig,
} from '@/lib/map-config'
import { setupTileCache, setupViewportOptimization } from '@/lib/map-performance'
import { MapControls } from './map-controls'

const TEXT = {
  title: 'OpenRailwayMap CN',
  basemapLabel: '底图',
  railwayLabel: '选择地图样式',
  legendLabel: '图例',
  themeToggleLabel: '切换主题',
  themeToDarkLabel: '切换到夜间模式',
  themeToLightLabel: '切换到日间模式',
  locateButton: '定位',
  locateStatus: '定位状态',
  available: '已配置',
  missing: '未配置',
}

const LOCATE_STATUS_TEXT: Record<string, string> = {
  idle: '待命',
  locating: '定位中',
  located: '已定位',
  tracking: '追踪中',
  error: '失败',
}

export function RailwayMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const geolocateRef = useRef<maplibregl.GeolocateControl | null>(null)
  const skipFirstStyleUpdate = useRef(true)

  const [tokens] = useState<TokenConfig>({
    tdt: process.env.NEXT_PUBLIC_TDT_TOKEN || '',
    mapbox: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '',
  })

  const [baseMap, setBaseMap] = useState(() => getDefaultBaseMapKey(tokens))
  const [railMode, setRailMode] = useState('standard')
  const [locateStatus, setLocateStatus] = useState('idle')
  const [updateTime, setUpdateTime] = useState('不可用')
  const [agoHours, setAgoHours] = useState(0)

  const baseOptions = BASEMAPS.map((item) => ({
    ...item,
    available: isBaseMapAvailable(item, tokens),
  }))

  const activeBase = baseOptions.find((item) => item.key === baseMap) ?? baseOptions[0]
  const activeRail = RAILWAY_MODES.find((item) => item.key === railMode) ?? RAILWAY_MODES[0]

  useEffect(() => {
    fetch('/v2/timestamp')
      .then((response) => response.text())
      .then((text) => {
        const timestamp = parseInt(text)
        if (isNaN(timestamp) || timestamp <= 0) {
          setUpdateTime('不可用')
          return
        }
        const lastUpdate = new Date(0)
        lastUpdate.setUTCSeconds(timestamp)
        setUpdateTime(lastUpdate.toLocaleString())
        setAgoHours(Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)))
      })
      .catch(() => {
        setUpdateTime('不可用')
        setAgoHours(0)
      })
  }, [])

  const localizeControls = useCallback((container: HTMLElement) => {
    const labels: [string, string][] = [
      ['.maplibregl-ctrl-zoom-in', '放大'],
      ['.maplibregl-ctrl-zoom-out', '缩小'],
      ['.maplibregl-ctrl-compass', '重置朝向'],
      ['.maplibregl-ctrl-geolocate', '定位并追踪'],
    ]

    labels.forEach(([selector, text]) => {
      const element = container.querySelector(selector)
      if (element) {
        element.setAttribute('title', text)
        element.setAttribute('aria-label', text)
      }
    })
  }, [])

  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: buildStyle(baseMap, tokens) as maplibregl.StyleSpecification | string,
      center: DEFAULT_VIEW.center,
      zoom: DEFAULT_VIEW.zoom,
      maxPitch: 80,
      pitch: 0,
      bearing: 0,
      attributionControl: true,
    })

    mapRef.current = map
    setupTileCache()
    setupViewportOptimization(map)
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')

    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: true,
      fitBoundsOptions: { maxZoom: 20 },
    })

    geolocateRef.current = geolocate
    map.addControl(geolocate, 'top-right')

    geolocate.on('trackuserlocationstart', () => setLocateStatus('tracking'))
    geolocate.on('trackuserlocationend', () => setLocateStatus('idle'))
    geolocate.on('geolocate', () => setLocateStatus('located'))
    geolocate.on('error', () => setLocateStatus('error'))

    const onMapLoad = () => {
      ensureRailwayOverlay(map, railMode)
      localizeControls(map.getContainer())
    }

    const onStyleLoad = () => {
      ensureRailwayOverlay(map, railMode)
      localizeControls(map.getContainer())
    }

    map.on('load', onMapLoad)
    map.on('style.load', onStyleLoad)

    return () => {
      map.off('load', onMapLoad)
      map.off('style.load', onStyleLoad)
      map.remove()
      mapRef.current = null
      geolocateRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (map && map.isStyleLoaded()) {
      ensureRailwayOverlay(map, railMode)
    }
  }, [railMode])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (skipFirstStyleUpdate.current) {
      skipFirstStyleUpdate.current = false
      return
    }

    const view = {
      center: map.getCenter(),
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
    }

    const restoreView = () => {
      map.jumpTo(view)
      ensureRailwayOverlay(map, railMode)
      localizeControls(map.getContainer())
    }

    map.once('style.load', restoreView)
    map.setStyle(buildStyle(baseMap, tokens) as maplibregl.StyleSpecification | string, { diff: false })
  }, [baseMap, tokens, railMode, localizeControls])

  const handleLocate = () => {
    if (!geolocateRef.current) {
      setLocateStatus('error')
      return
    }

    setLocateStatus('locating')
    geolocateRef.current.trigger()
  }

  return (
    <div className="relative flex h-full w-full bg-background">
      <MapControls
        baseOptions={baseOptions}
        railwayModes={RAILWAY_MODES}
        activeBase={activeBase}
        activeRail={activeRail}
        baseMap={baseMap}
        railMode={railMode}
        locateStatus={locateStatus}
        locateStatusText={LOCATE_STATUS_TEXT}
        updateTime={updateTime}
        agoHours={agoHours}
        text={TEXT}
        onBaseMapChange={setBaseMap}
        onRailModeChange={setRailMode}
        onLocate={handleLocate}
      />

      <div className="mt-12 flex-1 bg-background md:ml-80 md:mt-0">
        <div ref={mapContainerRef} className="h-full w-full" />
      </div>
    </div>
  )
}
