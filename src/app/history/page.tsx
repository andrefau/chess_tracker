'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Button'
import { ArrowLeft, Trash2, Edit2, Save, X, Calendar, Swords, History } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Match {
    id: string
    playerA: { name: string }
    playerB: { name: string }
    result: string
    date: string
}

export default function HistoryPage() {
    const router = useRouter()
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editResult, setEditResult] = useState('')

    const fetchMatches = async () => {
        try {
            const res = await fetch('/api/matches')
            const data = await res.json()
            setMatches(data)
        } catch (error) {
            console.error('Failed to fetch matches', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMatches()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this match? This will recalculate all Elo ratings.')) return

        try {
            await fetch(`/api/matches/${id}`, { method: 'DELETE' })
            fetchMatches()
            router.refresh()
        } catch (error) {
            console.error('Failed to delete match', error)
        }
    }

    const handleSave = async (id: string) => {
        try {
            await fetch(`/api/matches/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ result: editResult }),
            })
            setEditingId(null)
            fetchMatches()
            router.refresh()
        } catch (error) {
            console.error('Failed to update match', error)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    return (
        <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
            <header className="flex items-center gap-6 mb-10">
                <Link href="/">
                    <Button variant="secondary" className="p-3 rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <History className="w-8 h-8 text-blue-500" />
                        Match History
                    </h1>
                    <p className="text-gray-400 mt-1">Recent battles in the arena</p>
                </div>
            </header>

            <div className="space-y-4">
                {matches.map((match) => (
                    <div key={match.id} className="bg-white/5 rounded-xl border border-white/10 p-4 md:p-6 backdrop-blur-sm hover:bg-white/10 transition-all group">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                            <div className="flex items-center gap-3 text-gray-400 text-sm min-w-[120px]">
                                <Calendar className="w-4 h-4" />
                                {new Date(match.date).toLocaleDateString()}
                            </div>

                            <div className="flex-1 flex items-center justify-center gap-4 md:gap-8">
                                <span className={`font-bold text-lg ${match.result === 'A_WON' ? 'text-green-400' : 'text-white'}`}>
                                    {match.playerA.name}
                                </span>
                                <div className="px-3 py-1 bg-black/30 rounded-full text-xs font-mono text-gray-500 flex items-center gap-2">
                                    <Swords className="w-3 h-3" /> VS
                                </div>
                                <span className={`font-bold text-lg ${match.result === 'B_WON' ? 'text-green-400' : 'text-white'}`}>
                                    {match.playerB.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 min-w-[200px] justify-end">
                                {editingId === match.id ? (
                                    <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg">
                                        <select
                                            value={editResult}
                                            onChange={(e) => setEditResult(e.target.value)}
                                            className="bg-transparent text-white text-sm p-1 focus:outline-none"
                                        >
                                            <option value="A_WON" className="bg-gray-900">White Won</option>
                                            <option value="B_WON" className="bg-gray-900">Black Won</option>
                                            <option value="DRAW" className="bg-gray-900">Draw</option>
                                        </select>
                                        <button onClick={() => handleSave(match.id)} className="p-1 text-green-500 hover:bg-green-500/20 rounded">
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="p-1 text-gray-500 hover:bg-gray-500/20 rounded">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${match.result === 'DRAW' ? 'bg-gray-500/20 text-gray-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {match.result === 'A_WON' ? 'White Won' :
                                                match.result === 'B_WON' ? 'Black Won' :
                                                    'Draw'}
                                        </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => {
                                                    setEditingId(match.id)
                                                    setEditResult(match.result)
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(match.id)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}
