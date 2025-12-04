'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from './ui/Button'

export default function RegisterMatchButton() {
    const [isDisabled, setIsDisabled] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const checkTime = () => {
            const now = new Date()
            const day = now.getDay() // 0 = Sunday, 1 = Monday, ..., 5 = Friday
            const hour = now.getHours()

            // Disabled if:
            // - Friday (5) >= 14:00
            // - Saturday (6)
            // - Sunday (0)
            if (day === 0 || day === 6 || (day === 5 && hour >= 14)) {
                setIsDisabled(true)
            } else {
                setIsDisabled(false)
            }
        }

        checkTime()
        const interval = setInterval(checkTime, 60000) // Check every minute
        return () => clearInterval(interval)
    }, [])

    if (!mounted) {
        // Render enabled state by default during SSR/hydration to match server
        return (
            <Button className="flex items-center gap-2 shadow-lg shadow-blue-500/20">
                <Plus className="w-4 h-4" /> Registrer kamp
            </Button>
        )
    }

    if (isDisabled) {
        return (
            <div className="relative group">
                <Button
                    disabled
                    className="flex items-center gap-2 shadow-lg shadow-blue-500/20 opacity-50 cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" /> Registrer kamp
                </Button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-900 text-gray-300 text-xs rounded-lg border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Stengt til måndag!
                </div>
            </div>
        )
    }

    return (
        <Link href="/match/new">
            <Button className="flex items-center gap-2 shadow-lg shadow-blue-500/20">
                <Plus className="w-4 h-4" /> Registrer kamp
            </Button>
        </Link>
    )
}
