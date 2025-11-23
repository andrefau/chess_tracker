import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

async function main() {
    try {
        const userCount = await prisma.user.count()
        console.log(`Successfully connected. User count: ${userCount}`)
    } catch (e) {
        console.error('Error connecting to database:', e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
