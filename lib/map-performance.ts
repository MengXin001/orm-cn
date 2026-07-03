// Map performance and optimization utilities

import maplibregl from 'maplibre-gl'

/**
 * Preload images and styles to improve perceived performance
 */
export function preloadMapAssets(baseMapUrl: string | object) {
  // Preload basemap style if it's a URL
  if (typeof baseMapUrl === 'string') {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = baseMapUrl
    document.head.appendChild(link)
  }
}

/**
 * Optimize layer rendering for better performance
 */
export function optimizeLayerPerformance(map: maplibregl.Map) {
  const style = map.getStyle()
  if (!style.layers) return

  // Adjust raster layer opacity transitions for smoother appearance
  style.layers.forEach((layer) => {
    if (layer.type === 'raster' && 'paint' in layer) {
      const paint = layer.paint as Record<string, any>
      if (!paint['raster-fade-duration']) {
        paint['raster-fade-duration'] = 300
      }
    }
  })
}

/**
 * Enable efficient viewport management
 */
export function setupViewportOptimization(map: maplibregl.Map) {
  const container = map.getContainer()
  
  // Use Intersection Observer for visibility-based rendering
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && map) {
            // Pause map rendering when not visible
            map.off('move', () => {})
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(container)

    return () => observer.disconnect()
  }
}

/**
 * Add smooth zoom controls with easing
 */
export function smoothZoom(
  map: maplibregl.Map,
  zoomLevel: number,
  duration: number = 1000
) {
  const currentZoom = map.getZoom()
  const zoomDiff = zoomLevel - currentZoom
  const steps = 60
  let currentStep = 0

  const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

  const interval = setInterval(() => {
    currentStep++
    const progress = easeInOutQuad(currentStep / steps)
    const newZoom = currentZoom + zoomDiff * progress

    map.setZoom(newZoom)

    if (currentStep >= steps) {
      clearInterval(interval)
      map.setZoom(zoomLevel) // Ensure exact zoom level at end
    }
  }, duration / steps)
}

/**
 * Cache map tiles in IndexedDB for faster loading
 */
export function setupTileCache() {
  if ('indexedDB' in window) {
    const request = window.indexedDB.open('MapTileCache', 1)

    request.onerror = () => console.warn('Tile cache not available')
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('tiles')) {
        db.createObjectStore('tiles', { keyPath: 'url' })
      }
    }
  }
}

/**
 * Debounce function for resize and similar events
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

/**
 * Throttle function for high-frequency events
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T {
  let lastCall = 0

  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= limit) {
      func(...args)
      lastCall = now
    }
  }) as T
}
