import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const users = await prisma.user.findMany({
        orderBy: { name: 'asc' },
    })
    return NextResponse.json(users)
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const user = await prisma.user.create({
            data: { name },
        })

        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ error: 'Error creating user' }, { status: 500 })
    }
}
