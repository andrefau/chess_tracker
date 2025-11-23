import { prisma } from '@/lib/prisma'
import { calculateElo } from '@/lib/elo'

export async function recalculateAllElos() {
    // 1. Reset all users to 1200 (in memory map, we will overwrite DB at the end)
    const users = await prisma.user.findMany()
    const userElos: Record<string, number> = {}
    users.forEach(u => userElos[u.id] = 1200)

    // 2. Fetch all matches ordered by date
    const matches = await prisma.match.findMany({
        orderBy: { date: 'asc' }
    })

    // 3. Replay
    for (const match of matches) {
        const { playerAId, playerBId, result } = match
        const ratingA = userElos[playerAId] ?? 1200
        const ratingB = userElos[playerBId] ?? 1200

        let scoreA = 0.5
        if (result === 'A_WON') scoreA = 1
        else if (result === 'B_WON') scoreA = 0

        const newRatingA = calculateElo(ratingA, ratingB, scoreA)
        const newRatingB = calculateElo(ratingB, ratingA, 1 - scoreA)

        userElos[playerAId] = newRatingA
        userElos[playerBId] = newRatingB
    }

    // 4. Update all users
    const updates = Object.entries(userElos).map(([id, elo]) =>
        prisma.user.update({
            where: { id },
            data: { currentElo: elo }
        })
    )

    await prisma.$transaction(updates)
}
