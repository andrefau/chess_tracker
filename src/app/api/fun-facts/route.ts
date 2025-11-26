import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: {
                matchesAsA: true,
                matchesAsB: true,
            },
        })

        const matches = await prisma.match.findMany()
        const facts: string[] = []

        if (users.length === 0) {
            return NextResponse.json({ facts: [] })
        }

        // 1. Win percentage
        const playersWithGames = users.filter(u => u.matchesAsA.length + u.matchesAsB.length > 0)
        if (playersWithGames.length > 0) {
            const randomPlayer = playersWithGames[Math.floor(Math.random() * playersWithGames.length)]
            const totalGames = randomPlayer.matchesAsA.length + randomPlayer.matchesAsB.length
            let wins = 0
            randomPlayer.matchesAsA.forEach(m => { if (m.result === 'A_WON') wins++ })
            randomPlayer.matchesAsB.forEach(m => { if (m.result === 'B_WON') wins++ })

            const winRate = Math.round((wins / totalGames) * 100)
            facts.push(`${randomPlayer.name} har vunne ${winRate}% av kampane sine.`)
        }

        // 2. Color win rate (White/Black)
        // Assuming Player A is White, Player B is Black
        if (playersWithGames.length > 0) {
            const randomPlayer = playersWithGames[Math.floor(Math.random() * playersWithGames.length)]

            // White (As A)
            const gamesAsWhite = randomPlayer.matchesAsA.length
            let winsAsWhite = 0
            randomPlayer.matchesAsA.forEach(m => { if (m.result === 'A_WON') winsAsWhite++ })
            const whiteWinRate = gamesAsWhite > 0 ? Math.round((winsAsWhite / gamesAsWhite) * 100) : 0

            // Black (As B)
            const gamesAsBlack = randomPlayer.matchesAsB.length
            let winsAsBlack = 0
            randomPlayer.matchesAsB.forEach(m => { if (m.result === 'B_WON') winsAsBlack++ })
            const blackWinRate = gamesAsBlack > 0 ? Math.round((winsAsBlack / gamesAsBlack) * 100) : 0

            if (gamesAsWhite > 0 && gamesAsBlack > 0) {
                if (whiteWinRate > blackWinRate + 10) {
                    facts.push(`${randomPlayer.name} vinn oftare som kvit (${whiteWinRate}%) enn som svart (${blackWinRate}%).`)
                } else if (blackWinRate > whiteWinRate + 10) {
                    facts.push(`${randomPlayer.name} vinn oftare som svart (${blackWinRate}%) enn som kvit (${whiteWinRate}%).`)
                }
            }
        }

        // 3. Played this week?
        const now = new Date()
        const startOfWeek = new Date(now)
        const day = startOfWeek.getDay()
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
        startOfWeek.setDate(diff)
        startOfWeek.setHours(0, 0, 0, 0)

        const activePlayersThisWeek = new Set<string>()
        matches.forEach(m => {
            if (new Date(m.date) >= startOfWeek) {
                activePlayersThisWeek.add(m.playerAId)
                activePlayersThisWeek.add(m.playerBId)
            }
        })

        const inactivePlayers = users.filter(u => !activePlayersThisWeek.has(u.id))
        if (inactivePlayers.length > 0) {
            const randomInactive = inactivePlayers[Math.floor(Math.random() * inactivePlayers.length)]
            facts.push(`${randomInactive.name} har ikkje spelt denne veka.`)
        }

        // 4. Total games played
        if (matches.length > 0) {
            facts.push(`Det har blitt spelt totalt ${matches.length} kampar i systemet.`)
        }

        // 5. Longest win streak (simplified check for current streak)
        // This is a bit complex to calculate efficiently for everyone, maybe skip for now or do a simple one.

        return NextResponse.json({ facts })

    } catch (error) {
        console.error('Error calculating fun facts:', error)
        return NextResponse.json({ error: 'Failed to calculate facts' }, { status: 500 })
    }
}
