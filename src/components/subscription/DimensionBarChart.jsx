import { useMemo } from "react"
import ReactECharts from "echarts-for-react"
import { getThemeColors, getTailwindShades } from "@/lib/chartColors"

// Bars are always drawn at the same thickness/spacing (~43px per row) so a
// 3-row chart and a 6-row chart read as the same visual "size" of chart.
const HEIGHT_PER_ROW = 43
const MIN_HEIGHT = 140

export default function DimensionBarChart({ rows, palette = "indigo", color, labelWidth = 100 }) {
  const option = useMemo(() => {
    const { foreground, mutedForeground, border } = getThemeColors()
    const labels = rows.map((r) => r.label)
    const counts = rows.map((r) => r.count)
    const shades = color ? rows.map(() => color) : getTailwindShades(palette, rows.length)

    // A category axis label naturally right-aligns/hugs the axis. To get a
    // left-aligned label column instead (flush left edge, ragged right edge,
    // like the plain HTML bar rows elsewhere on this page) the grid's left
    // offset is fixed rather than auto-sized, and the label's anchor is
    // pushed out past it via a matching negative-feeling margin.
    const gridLeft = labelWidth + 16

    return {
      grid: { left: gridLeft, right: 24, top: 8, bottom: 8, containLabel: false },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: border } },
        axisLabel: { color: mutedForeground, fontSize: 11 },
      },
      yAxis: {
        type: "category",
        data: labels,
        inverse: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: foreground,
          fontSize: 12,
          fontWeight: 500,
          align: "left",
          margin: gridLeft - 8,
          width: labelWidth,
          overflow: "truncate",
        },
      },
      series: [
        {
          type: "bar",
          data: counts.map((count, i) => ({ value: count, itemStyle: { color: shades[i] } })),
          barMaxWidth: 18,
          itemStyle: { borderRadius: [0, 4, 4, 0] },
          label: {
            show: true,
            position: "right",
            color: mutedForeground,
            fontSize: 12,
          },
        },
      ],
    }
  }, [rows, palette, color, labelWidth])

  const height = Math.max(MIN_HEIGHT, rows.length * HEIGHT_PER_ROW)

  return <ReactECharts option={option} style={{ height, width: "100%" }} notMerge />
}
