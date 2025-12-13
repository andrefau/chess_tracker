'use client'

import { useMemo, useState } from 'react'

interface EloGraphProps {
    data: { date: string; elo: number }[]
}

export default function EloGraph({ data }: EloGraphProps) {
    const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number; date: string } | null>(null)

    const processedData = useMemo(() => {
        if (data.length === 0) return []
        const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        return sorted.map(d => ({ ...d, dateObj: new Date(d.date) }))
    }, [data])

    if (processedData.length < 2) {
        return (
            <div className="w-full h-64 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500">
                Ikkje nok data til å vise graf
            </div>
        )
    }

    // Dimensions
    const width = 800
    const height = 300
    const padding = 40

    // Scales
    const minElo = Math.min(...processedData.map(d => d.elo))
    const maxElo = Math.max(...processedData.map(d => d.elo))
    const eloRange = maxElo - minElo || 100 // Prevent division by zero



    const getX = (index: number) => {
        return padding + (index / (processedData.length - 1 || 1)) * (width - 2 * padding)
    }

    const getY = (elo: number) => {
        return height - padding - ((elo - minElo) / eloRange) * (height - 2 * padding)
    }

    const points = processedData.map((d, i) => `${getX(i)},${getY(d.elo)}`).join(' ')

    // Create area path (for gradient fill)
    const areaPath = `
        ${padding},${height - padding} 
        ${points} 
        ${width - padding},${height - padding}
    `

    return (
        <div className="w-full bg-black/20 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
            <h3 className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Ratingutvikling</h3>
            <div className="relative w-full aspect-[8/3]">
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        className="w-full h-full overflow-visible"
                        onMouseLeave={() => setHoveredPoint(null)}
                    >
                        <defs>
                            <linearGradient id="eloGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
                            const y = height - padding - (tick * (height - 2 * padding))
                            return (
                                <line
                                    key={tick}
                                    x1={padding}
                                    y1={y}
                                    x2={width - padding}
                                    y2={y}
                                    stroke="rgba(255,255,255,0.05)"
                                    strokeWidth="1"
                                />
                            )
                        })}

                        {/* Area fill */}
                        <path
                            d={`M${areaPath} Z`}
                            fill="url(#eloGradient)"
                            stroke="none"
                        />

                        {/* Line */}
                        <polyline
                            points={points}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Data points (invisible for hit detection, visible on hover) */}
                        {processedData.map((d, i) => {
                            const x = getX(i)
                            const y = getY(d.elo)
                            return (
                                <circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r="6"
                                    fill="transparent"
                                    className="cursor-pointer hover:r-6 transition-all"
                                    onMouseEnter={() => setHoveredPoint({ x, y, value: d.elo, date: d.date })}
                                />
                            )
                        })}

                        {/* Hover indicator */}
                        {hoveredPoint && (
                            <>
                                <circle
                                    cx={hoveredPoint.x}
                                    cy={hoveredPoint.y}
                                    r="4"
                                    fill="#3b82f6"
                                    stroke="white"
                                    strokeWidth="2"
                                />
                                <line
                                    x1={hoveredPoint.x}
                                    y1={padding}
                                    x2={hoveredPoint.x}
                                    y2={height - padding}
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeDasharray="4 4"
                                />
                            </>
                        )}

                        {/* Y-axis labels */}
                        <text x={padding - 10} y={getY(minElo)} fill="#6b7280" fontSize="10" textAnchor="end" alignmentBaseline="middle">{minElo}</text>
                        <text x={padding - 10} y={getY(maxElo)} fill="#6b7280" fontSize="10" textAnchor="end" alignmentBaseline="middle">{maxElo}</text>
                    </svg>
                </div>

                {/* Tooltip Overlay */}
                {hoveredPoint && (
                    <div
                        className="absolute bg-gray-900/90 text-white text-xs p-2 rounded border border-white/10 shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
                        style={{
                            left: `${(hoveredPoint.x / width) * 100}%`,
                            top: `${(hoveredPoint.y / height) * 100}%`,
                            marginTop: '-10px'
                        }}
                    >
                        <div className="font-bold">{hoveredPoint.value}</div>
                        <div className="text-gray-400">{new Date(hoveredPoint.date).toLocaleDateString('no-NO')}</div>
                    </div>
                )}
            </div>
        </div>
    )
}
