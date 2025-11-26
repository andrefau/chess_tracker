'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

export default function FunFact() {
    const [facts, setFacts] = useState<string[]>([])
    const [currentFactIndex, setCurrentFactIndex] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFacts = async () => {
            try {
                const res = await fetch('/api/fun-facts')
                const data = await res.json()
                if (data.facts && data.facts.length > 0) {
                    setFacts(data.facts)
                }
            } catch (error) {
                console.error('Failed to fetch fun facts', error)
            } finally {
                setLoading(false)
            }
        }

        fetchFacts()
    }, [])

    useEffect(() => {
        if (facts.length === 0) return

        const interval = setInterval(() => {
            setCurrentFactIndex((prev) => (prev + 1) % facts.length)
        }, 20000) // Rotate every 20 seconds

        return () => clearInterval(interval)
    }, [facts])

    if (loading || facts.length === 0) return null

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

                <p className="text-lg md:text-xl font-medium text-white animate-fade-in key={currentFactIndex}">
                    {facts[currentFactIndex]}
                </p>
            </div>
        </div>
    )
}
