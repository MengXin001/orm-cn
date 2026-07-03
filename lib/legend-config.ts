// Legend configuration for railway map modes

export interface LegendItem {
  label: string
  color: string
  width?: number
  pattern?: string // For dashed/dotted lines
}

export interface LegendCategory {
  title: string
  items: LegendItem[]
}

export interface ModeLegend {
  key: string
  title: string
  categories: LegendCategory[]
}

export const RAILWAY_LEGENDS: Record<string, ModeLegend> = {
  standard: {
    key: 'standard',
    title: '标准铁路地图',
    categories: [
      {
        title: '铁路类型',
        items: [
          { label: '高速铁路', color: '#ff0c00', width: 3 },
          { label: '普通铁路', color: '#ff8100', width: 2.5 },
          { label: '支线铁路', color: '#c4b600', width: 2 },
          { label: '货运铁路', color: '#87491d', width: 2 },
          { label: '专用线', color: '#87491d', width: 1.5 },
          { label: '站线', color: '#000000', width: 1.5 },
          { label: '侧线', color: '#000000', width: 1 },
          { label: '地铁', color: '#0300c3', width: 2 },
          { label: '轻轨', color: '#00bd14', width: 1.5 },
          { label: '有轨电车', color: '#d877b8', width: 1.5 },
          { label: '规划/在建铁路', color: '#000000', width: 3, pattern: 'dashed' },
          { label: '废弃铁路', color: '#70584d', width: 2, pattern: 'dashed' },
          { label: '遗迹铁路', color: '#7f6a62', width: 2, pattern: 'dashed' },
          { label: '历史铁路', color: '#94847e', width: 2, pattern: 'dashed' },
        ],
      },
    ],
  },
  maxspeed: {
    key: 'maxspeed',
    title: '最高速度地图',
    categories: [
      {
        title: '运营时速',
        items: [
          { label: '无数据', color: '#C0C0C0' },
          { label: '≤60 km/h', color: '#0098CB' },
          { label: '70 km/h', color: '#00B7CB' },
          { label: '80 km/h', color: '#00CBC1' },
          { label: '90 km/h', color: '#00CBA2' },
          { label: '100 km/h', color: '#00CB84' },
          { label: '110 km/h', color: '#00CB66' },
          { label: '120 km/h', color: '#00CB47' },
          { label: '130 km/h', color: '#00CB29' },
          { label: '140 km/h', color: '#00CB0A' },
          { label: '150 km/h', color: '#14CB00' },
          { label: '160 km/h', color: '#33CB00' },
          { label: '170 km/h', color: '#51CB00' },
          { label: '180 km/h', color: '#70CB00' },
          { label: '190 km/h', color: '#8ECB00' },
          { label: '200 km/h', color: '#ADCB00' },
          { label: '210 km/h', color: '#CBCB00' },
          { label: '220 km/h', color: '#CBAD00' },
          { label: '230 km/h', color: '#CB8E00' },
          { label: '240 km/h', color: '#CB7000' },
          { label: '250 km/h', color: '#CB5100' },
          { label: '260 km/h', color: '#CB3300' },
          { label: '270 km/h', color: '#CB1400' },
          { label: '280 km/h', color: '#CB0007' },
          { label: '290 km/h', color: '#CB0025' },
          { label: '300 km/h', color: '#CB0044' },
          { label: '320 km/h', color: '#CB0062' },
          { label: '340 km/h', color: '#CB0081' },
          { label: '360 km/h', color: '#CB009F' },
          { label: '380 km/h', color: '#CB00BD' },
        ],
      },
    ],
  },
  signals: {
    key: 'signals',
    title: '铁路信号系统',
    categories: [
      {
        title: '信号类型',
        items: [
          { label: '无数据', color: '#C0C0C0' },
        ],
      },
    ],
  },
  electrification: {
    key: 'electrification',
    title: '电气化状态',
    categories: [
      {
        title: '电气化情况',
        items: [
          { label: '无数据', color: 'black' },
          { label: '非电气化', color: '#70584D' },
          { label: '接触网供电', color: '#0000FF' },
          { label: '第三轨供电', color: '#000000' },
        ],
      },
      {
        title: '供电电压',
        items: [
          { label: '<750V', color: '#FF79B8' },
          { label: '750V', color: '#F930FF' },
          { label: '750–1000V', color: '#D033FF' },
          { label: '1kV', color: '#5C1CCB' },
          { label: '1–1.5kV', color: '#007ACB' },
          { label: '1.5kV', color: '#0098CB' },
          { label: '1.5–3kV', color: '#00B7CB' },
          { label: '3kV', color: '#0000FF' },

          { label: '<15kV', color: '#97FF2F' },
          { label: '15kV 16⅔Hz', color: '#00FF00' },
          { label: '15kV 16.7Hz', color: '#00CB66' },
          { label: '15–25kV', color: '#F1F100' },
          { label: '>25kV', color: '#FF9F19' },

          { label: '25kV 50Hz', color: '#FF0000' },
          { label: '25kV 60Hz', color: '#C00000' },

          { label: '12kV 25Hz', color: '#CCCC00' },
          { label: '12.5kV 60Hz', color: '#999900' },
          { label: '20kV 50Hz', color: '#FFCC66' },
          { label: '20kV 60Hz', color: '#FF9966' },
        ]
      },
    ],
  },
}

export function getLegendByMode(mode: string): ModeLegend | undefined {
  return RAILWAY_LEGENDS[mode]
}

export function getAllLegendItems(mode: string): LegendItem[] {
  const legend = getLegendByMode(mode)
  if (!legend) return []
  return legend.categories.flatMap((cat) => cat.items)
}
