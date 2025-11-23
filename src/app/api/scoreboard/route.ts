import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    // Determine start of week (Monday)
    const now = new Date()
    const day = now.getDay() // 0 (Sun) - 6 (Sat)
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    const startOfWeek = new Date(now.setDate(diff))
    startOfWeek.setHours(0, 0, 0, 0)

    // Fetch users ordered by Elo
    const users = await prisma.user.findMany({
        orderBy: { currentElo: 'desc' },
    })

    // Fetch matches for this week
    const matches = await prisma.match.findMany({
        where: {
            date: {
                gte: startOfWeek,
            },
        },
    })

    // Aggregate stats
    const stats: Record<string, { wins: number; losses: number; draws: number }> = {}

    users.forEach(user => {
        stats[user.id] = { wins: 0, losses: 0, draws: 0 }
    })

    matches.forEach(match => {
        const { playerAId, playerBId, result } = match

        if (result === 'A_WON') {
            if (stats[playerAId]) stats[playerAId].wins++
            if (stats[playerBId]) stats[playerBId].losses++
        } else if (result === 'B_WON') {
            if (stats[playerAId]) stats[playerAId].losses++
            if (stats[playerBId]) stats[playerBId].wins++
        } else {
            if (stats[playerAId]) stats[playerAId].draws++
            if (stats[playerBId]) stats[playerBId].draws++
        }
    })

    // Combine
    const scoreboard = users.map((user, index) => ({
        rank: index + 1,
        id: user.id,
        name: user.name,
        rating: user.currentElo,
        wins: stats[user.id]?.wins || 0,
        losses: stats[user.id]?.losses || 0,
        draws: stats[user.id]?.draws || 0,
        gamesPlayed: (stats[user.id]?.wins || 0) + (stats[user.id]?.losses || 0) + (stats[user.id]?.draws || 0)
    }))

    return NextResponse.json(scoreboard)
}
