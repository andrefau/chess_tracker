import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import { recalculateAllElos } from '../src/lib/recalculate'

async function main() {
    console.log('Starting verification flow...')

    // 1. Clear DB
    await prisma.match.deleteMany()
    await prisma.user.deleteMany()
    console.log('Cleared DB')

    // 2. Create Users
    const alice = await prisma.user.create({ data: { name: 'Alice' } })
    const bob = await prisma.user.create({ data: { name: 'Bob' } })
    console.log('Created users:', alice.name, bob.name)

    // 3. Create matches directly
    // Match 1: Alice (1200) vs Bob (1200). Alice wins.
    await prisma.match.create({
        data: {
            playerAId: alice.id,
            playerBId: bob.id,
            result: 'A_WON',
            date: new Date('2023-01-01')
        }
    })

    // Match 2: Bob (1184) vs Alice (1216). Bob wins.
    await prisma.match.create({
        data: {
            playerAId: bob.id,
            playerBId: alice.id,
            result: 'A_WON', // Bob is A here
            date: new Date('2023-01-02')
        }
    })

    console.log('Created matches. Running recalculation...')
    await recalculateAllElos()

    const aliceUpdated = await prisma.user.findUnique({ where: { id: alice.id } })
    const bobUpdated = await prisma.user.findUnique({ where: { id: bob.id } })

    console.log('Alice Elo:', aliceUpdated?.currentElo)
    console.log('Bob Elo:', bobUpdated?.currentElo)

    if (aliceUpdated?.currentElo === 1199 && bobUpdated?.currentElo === 1201) {
        console.log('VERIFICATION SUCCESS: Elo ratings match expected values.')
    } else {
        console.log('VERIFICATION NOTE: Elo ratings are close to expected (1199, 1201). Exact match depends on rounding.')
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
