import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateElo } from '@/lib/elo'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const user = await prisma.user.findUnique({
        where: { id },
    })

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get ALL matches to replay history
    // We need to replay from the beginning to get accurate historical Elo
    const allMatches = await prisma.match.findMany({
        orderBy: { date: 'asc' }, // Oldest first
        include: {
            playerA: { select: { id: true, name: true } },
            playerB: { select: { id: true, name: true } },
        },
    })

    // Replay state
    const playerRatings: Record<string, number> = {}
    const history: { date: string; elo: number; matchId: string }[] = []

    // Initial rating
    history.push({
        date: user.createdAt.toISOString(),
        elo: 1200,
        matchId: 'init'
    })
    playerRatings[user.id] = 1200

    // Stats
    let wins = 0
    let losses = 0
    let draws = 0
    let gamesAsWhite = 0
    let gamesAsBlack = 0

    // Filtered matches for the list view (only ones involving this player)
    const playerMatches: any[] = []

    for (const match of allMatches) {
        // Initialize ratings if not present
        if (!playerRatings[match.playerAId]) playerRatings[match.playerAId] = 1200
        if (!playerRatings[match.playerBId]) playerRatings[match.playerBId] = 1200

        const ratingA = playerRatings[match.playerAId]
        const ratingB = playerRatings[match.playerBId]

        let scoreA = 0.5
        if (match.result === 'A_WON') scoreA = 1
        else if (match.result === 'B_WON') scoreA = 0

        const newRatingA = calculateElo(ratingA, ratingB, scoreA)
        const newRatingB = calculateElo(ratingB, ratingA, 1 - scoreA)

        // Update current ratings
        playerRatings[match.playerAId] = newRatingA
        playerRatings[match.playerBId] = newRatingB

        // If this match involves our user, record it
        if (match.playerAId === id || match.playerBId === id) {
            const isA = match.playerAId === id
            const currentRating = isA ? newRatingA : newRatingB

            history.push({
                date: match.date.toISOString(),
                elo: currentRating,
                matchId: match.id
            })

            // Stats
            if (match.result === 'DRAW') {
                draws++
            } else if ((isA && match.result === 'A_WON') || (!isA && match.result === 'B_WON')) {
                wins++
            } else {
                losses++
            }

            if (isA) gamesAsWhite++
            else gamesAsBlack++

            playerMatches.push({
                ...match,
                userEloAfter: currentRating,
                opponentEloAfter: isA ? newRatingB : newRatingA,
                opponent: isA ? match.playerB : match.playerA
            })
        }
    }

    // Sort matches descending for the UI
    playerMatches.reverse()

    return NextResponse.json({
        user,
        stats: {
            wins,
            losses,
            draws,
            gamesAsWhite,
            gamesAsBlack,
            gamesPlayed: wins + losses + draws,
            currentElo: playerRatings[id] || 1200
        },
        history,
        matches: playerMatches
    })
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Delete user and all their matches in a transaction
        await prisma.$transaction(async (tx) => {
            // Delete matches where user is playerA or playerB
            await tx.match.deleteMany({
                where: {
                    OR: [
                        { playerAId: id },
                        { playerBId: id }
                    ]
                }
            })

            // Delete the user
            await tx.user.delete({
                where: { id }
            })
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json({ error: 'Error deleting user' }, { status: 500 })
    }
}
