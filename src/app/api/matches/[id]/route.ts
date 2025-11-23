import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { recalculateAllElos } from '@/lib/recalculate'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.match.delete({
            where: { id },
        })

        // Trigger recalculation
        await recalculateAllElos()

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting match' }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { result } = body

        await prisma.match.update({
            where: { id },
            data: { result },
        })

        // Trigger recalculation
        await recalculateAllElos()

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error updating match' }, { status: 500 })
    }
}
