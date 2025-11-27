'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

export default function FunFact() {
    const [fact, setFact] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchFact = async () => {
        try {
            const res = await fetch('/api/fun-facts')
            const data = await res.json()
            if (data.fact) {
                setFact(data.fact)
            }
        } catch (error) {
            console.error('Failed to fetch fun facts', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFact()
        const interval = setInterval(fetchFact, 20000) // Fetch new fact every 20 seconds
        return () => clearInterval(interval)
    }, [])

    if (loading || !fact) return null

    return (
        <div className="relative overflow-hidden rounded-2xl p-6 border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-xl shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-16 h-16 text-purple-400" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center gap-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-wider text-xs mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Visste du at?</span>
                </div>

                <p className="text-lg md:text-xl font-medium text-white animate-fade-in key={fact}">
                    {fact}
                </p>
            </div>
        </div>
    )
}
