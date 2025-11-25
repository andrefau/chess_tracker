import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateElo } from '@/lib/elo'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')

    let dateFilter = {}
    if (dateParam) {
        const targetDate = new Date(dateParam)
        const day = targetDate.getDay()
        const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1)

        const startOfWeek = new Date(targetDate)
        startOfWeek.setDate(diff)
        startOfWeek.setHours(0, 0, 0, 0)

        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 7)

        dateFilter = {
            date: {
                gte: startOfWeek,
                lt: endOfWeek,
            },
        }
    }

    const matches = await prisma.match.findMany({
        where: dateFilter,
        orderBy: { date: 'desc' },
        include: {
            playerA: true,
            playerB: true,
        },
    })
    return NextResponse.json(matches)
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { playerAId, playerBId, result } = body // result: "A_WON", "B_WON", "DRAW"

        if (!playerAId || !playerBId || !result) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Fetch players
        const playerA = await prisma.user.findUnique({ where: { id: playerAId } })
        const playerB = await prisma.user.findUnique({ where: { id: playerBId } })

        if (!playerA || !playerB) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 })
        }

        // Calculate Elo
        let scoreA = 0.5
        if (result === 'A_WON') scoreA = 1
        else if (result === 'B_WON') scoreA = 0

        const newRatingA = calculateElo(playerA.currentElo, playerB.currentElo, scoreA)
        const newRatingB = calculateElo(playerB.currentElo, playerA.currentElo, 1 - scoreA)

        // Transaction
        const match = await prisma.$transaction(async (tx) => {
            const match = await tx.match.create({
                data: {
                    playerAId,
                    playerBId,
                    result,
                },
            })

            await tx.user.update({
                where: { id: playerAId },
                data: { currentElo: newRatingA },
            })

            await tx.user.update({
                where: { id: playerBId },
                data: { currentElo: newRatingB },
            })

            return match
        })

        return NextResponse.json(match)
    } catch (error) {
        console.error('Error creating match:', error)
        return NextResponse.json({ error: 'Error creating match' }, { status: 500 })
    }
}
