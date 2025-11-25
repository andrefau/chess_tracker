import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    // Determine start of week (Monday)
    const targetDate = dateParam ? new Date(dateParam) : new Date()
    const day = targetDate.getDay() // 0 (Sun) - 6 (Sat)
    const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday

    const startOfWeek = new Date(targetDate)
    startOfWeek.setDate(diff)
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    // Fetch users ordered by Elo
    const users = await prisma.user.findMany({
        orderBy: { currentElo: 'desc' },
    })

    // Fetch matches for this week
    const matches = await prisma.match.findMany({
        where: {
            date: {
                gte: startOfWeek,
                lt: endOfWeek,
            },
        },
    })

    // Aggregate stats
    const stats: Record<string, { wins: number; losses: number; draws: number }> = {}

    users.forEach((user: { id: string }) => {
        stats[user.id] = { wins: 0, losses: 0, draws: 0 }
    })

    matches.forEach((match: { playerAId: string; playerBId: string; result: string }) => {
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
    // Calculate weekly Elo
    const weeklyRatings: Record<string, number> = {}
    users.forEach((user: { id: string }) => {
        weeklyRatings[user.id] = 1200 // Reset to base Elo
    })

    // Sort matches by date to calculate Elo in order
    matches.sort((a: { date: Date }, b: { date: Date }) => new Date(a.date).getTime() - new Date(b.date).getTime())

    matches.forEach((match: { playerAId: string; playerBId: string; result: string }) => {
        const { playerAId, playerBId, result } = match
        const ratingA = weeklyRatings[playerAId] || 1200
        const ratingB = weeklyRatings[playerBId] || 1200

        const K = 32
        const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
        const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400))

        let scoreA = 0.5
        let scoreB = 0.5

        if (result === 'A_WON') {
            scoreA = 1
            scoreB = 0
        } else if (result === 'B_WON') {
            scoreA = 0
            scoreB = 1
        }

        weeklyRatings[playerAId] = Math.round(ratingA + K * (scoreA - expectedA))
        weeklyRatings[playerBId] = Math.round(ratingB + K * (scoreB - expectedB))
    })

    // Combine
    const scoreboard = users.map((user: { id: string; name: string }, index: number) => ({
        id: user.id,
        name: user.name,
        rating: weeklyRatings[user.id] || 1200,
        wins: stats[user.id]?.wins || 0,
        losses: stats[user.id]?.losses || 0,
        draws: stats[user.id]?.draws || 0,
        gamesPlayed: (stats[user.id]?.wins || 0) + (stats[user.id]?.losses || 0) + (stats[user.id]?.draws || 0)
    }))

    // Re-sort by weekly rating, but push 0 games played to bottom
    scoreboard.sort((a: { rating: number; gamesPlayed: number }, b: { rating: number; gamesPlayed: number }) => {
        if (a.gamesPlayed === 0 && b.gamesPlayed > 0) return 1
        if (b.gamesPlayed === 0 && a.gamesPlayed > 0) return -1
        return b.rating - a.rating
    })

    // Add rank
    const rankedScoreboard = scoreboard.map((player: { rating: number }, index: number) => ({
        ...player,
        rank: index + 1
    }))

    return NextResponse.json(rankedScoreboard)
}
