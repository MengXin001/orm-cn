// Map configuration for OpenRailwayMap CN

export const DEFAULT_VIEW = {
  center: [114.0, 22.5] as [number, number],
  zoom: 5,
}

export interface BasemapOption {
  key: string
  label: string
  requiresToken?: 'tdt' | 'mapbox'
}

export const BASEMAPS: BasemapOption[] = [
  { key: 'osm', label: 'OpenStreetMap' },
  { key: 'esri', label: 'Esri World Imagery' },
  { key: 'tdt_vec', label: '天地图矢量', requiresToken: 'tdt' },
  { key: 'tdt_img', label: '天地图影像', requiresToken: 'tdt' },
  { key: 'mapbox_streets', label: 'Mapbox Streets', requiresToken: 'mapbox' },
  { key: 'mapbox_satellite', label: 'Mapbox Satellite', requiresToken: 'mapbox' },
]

export interface RailwayMode {
  key: string
  label: string
  description: string
}

export const RAILWAY_MODES: RailwayMode[] = [
  { key: 'standard', label: '标准', description: '标准铁路地图样式' },
  { key: 'maxspeed', label: '速度', description: '按最高速度着色' },
  { key: 'signals', label: '信号', description: '铁路信号系统' },
  { key: 'electrification', label: '电气化', description: '电气化状态' },
]

export interface TokenConfig {
  tdt: string
  mapbox: string
}

export function getDefaultBaseMapKey(tokens: TokenConfig): string {
  if (tokens.tdt) return 'tdt_vec'
  if (tokens.mapbox) return 'mapbox_streets'
  return 'osm'
}

export function isBaseMapAvailable(basemap: BasemapOption, tokens: TokenConfig): boolean {
  if (!basemap.requiresToken) return true
  if (basemap.requiresToken === 'tdt') return !!tokens.tdt
  if (basemap.requiresToken === 'mapbox') return !!tokens.mapbox
  return false
}

export function buildStyle(baseMapKey: string, tokens: TokenConfig): string | object {
  switch (baseMapKey) {
    case 'esri':
      return {
        version: 8,
        sources: {
          esri: {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
            attribution: '&copy; Esri',
          },
        },
        layers: [{ id: 'esri-layer', type: 'raster', source: 'esri' }],
      }
    case 'tdt_vec':
      return {
        version: 8,
        sources: {
          'tdt-vec': {
            type: 'raster',
            tiles: [
              `https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tokens.tdt}`,
            ],
            tileSize: 256,
            attribution: '&copy; 天地图 审图号：GS（2025）1508号',
          },
          'tdt-cva': {
            type: 'raster',
            tiles: [
              `https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tokens.tdt}`,
            ],
            tileSize: 256,
          },
        },
        layers: [
          { id: 'tdt-vec-layer', type: 'raster', source: 'tdt-vec' },
          { id: 'tdt-cva-layer', type: 'raster', source: 'tdt-cva' },
        ],
      }
    case 'tdt_img':
      return {
        version: 8,
        sources: {
          'tdt-img': {
            type: 'raster',
            tiles: [
              `https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tokens.tdt}`,
            ],
            tileSize: 256,
            attribution: '&copy; 天地图 审图号：GS（2025）1508号',
          },
          'tdt-cia': {
            type: 'raster',
            tiles: [
              `https://t0.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${tokens.tdt}`,
            ],
            tileSize: 256,
          },
        },
        layers: [
          { id: 'tdt-img-layer', type: 'raster', source: 'tdt-img' },
          { id: 'tdt-cia-layer', type: 'raster', source: 'tdt-cia' },
        ],
      }
    case 'mapbox_streets':
      return `https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=${tokens.mapbox}`
    case 'mapbox_satellite':
      return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12?access_token=${tokens.mapbox}`
    case 'osm':
    default:
      return {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256
          },
        },
        layers: [{ id: 'osm-layer', type: 'raster', source: 'osm' }],
      }
  }
}

const RAILWAY_TILE_URL = 'https://orm-tiles.moexin.cn'

export function ensureRailwayOverlay(map: maplibregl.Map, mode: string): void {
  const sourceId = 'openrailwaymap'
  const layerId = 'openrailwaymap-layer'

  // Remove existing layer and source if they exist
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId)
  }
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId)
  }

  // Add railway overlay source
  map.addSource(sourceId, {
    type: 'raster',
    tiles: [`${RAILWAY_TILE_URL}/${mode}/{z}/{x}/{y}.png`],
    tileSize: 256,
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap contributors</a>, <a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>',
  })

  // Add railway overlay layer
  map.addLayer({
    id: layerId,
    type: 'raster',
    source: sourceId,
    paint: {
      'raster-opacity': 1,
    },
  })
}
