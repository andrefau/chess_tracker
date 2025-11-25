'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Button'
import { Select } from '@/app/components/ui/Select'
import { ArrowLeft, Swords, Trophy, Minus } from 'lucide-react'
import { calculateElo } from '@/lib/elo'

interface User {
    id: string
    name: string
    rating: number
}

export default function NewMatchPage() {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [playerAId, setPlayerAId] = useState('')
    const [playerBId, setPlayerBId] = useState('')
    const [result, setResult] = useState('A_WON') // A_WON, B_WON, DRAW

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/scoreboard')
                const data = await res.json()
                setUsers(data)
            } catch (error) {
                console.error('Failed to fetch users', error)
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    const getRatingChange = (playerId: string, isPlayerA: boolean) => {
        if (!playerAId || !playerBId || playerAId === playerBId) return null

        const playerA = users.find(u => u.id === playerAId)
        const playerB = users.find(u => u.id === playerBId)

        if (!playerA || !playerB) return null

        let scoreA = 0.5
        if (result === 'A_WON') scoreA = 1
        else if (result === 'B_WON') scoreA = 0

        const currentRating = isPlayerA ? playerA.rating : playerB.rating
        const opponentRating = isPlayerA ? playerB.rating : playerA.rating
        const score = isPlayerA ? scoreA : 1 - scoreA

        const newRating = calculateElo(currentRating, opponentRating, score)
        const delta = newRating - currentRating

        return delta
    }

    const renderRatingChange = (delta: number | null) => {
        if (delta === null) return null
        const color = delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-gray-400'
        const sign = delta > 0 ? '+' : ''
        return <span className={`text-sm font-mono font-bold ${color} ml-2`}>{sign}{delta}</span>
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!playerAId || !playerBId || playerAId === playerBId) return

        setSubmitting(true)
        try {
            const res = await fetch('/api/matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerAId, playerBId, result }),
            })

            if (res.ok) {
                router.push('/')
                router.refresh()
            }
        } catch (error) {
            console.error('Failed to record match', error)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    return (
        <main className="min-h-screen p-4 flex items-center justify-center">
            <div className="w-full max-w-lg bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
                <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Tilbake til poengtavla
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                        <Swords className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Registrer kamp</h1>
                        <p className="text-gray-400 text-sm">Kven gjekk av med sigeren?</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="relative">
                            <Select
                                label={
                                    <span className="flex items-center">
                                        Kvite brikker
                                        {renderRatingChange(getRatingChange(playerAId, true))}
                                    </span>
                                }
                                value={playerAId}
                                onChange={(e) => setPlayerAId(e.target.value)}
                                required
                                className="bg-white/10 border-white/20"
                            >
                                <option value="" className="bg-gray-900">Vel spelar...</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id} disabled={user.id === playerBId} className="bg-gray-900">
                                        {user.name} ({user.rating})
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="hidden md:flex justify-center pb-4 text-gray-500 font-bold text-xs uppercase tracking-widest">VS</div>

                        <div className="relative">
                            <Select
                                label={
                                    <span className="flex items-center">
                                        Svarte brikker
                                        {renderRatingChange(getRatingChange(playerBId, false))}
                                    </span>
                                }
                                value={playerBId}
                                onChange={(e) => setPlayerBId(e.target.value)}
                                required
                                className="bg-black/40 border-white/10"
                            >
                                <option value="" className="bg-gray-900">Vel spelar...</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id} disabled={user.id === playerAId} className="bg-gray-900">
                                        {user.name} ({user.rating})
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="bg-black/20 p-6 rounded-xl border border-white/5">
                        <label className="text-sm font-medium text-gray-400 mb-4 block text-center uppercase tracking-wider">Kampresultat</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setResult('A_WON')}
                                className={`p-4 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-2 ${result === 'A_WON'
                                    ? 'bg-white text-black shadow-lg scale-105'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <Trophy className={`w-5 h-5 ${result === 'A_WON' ? 'text-yellow-500' : 'text-gray-600'}`} />
                                Kvit
                            </button>
                            <button
                                type="button"
                                onClick={() => setResult('DRAW')}
                                className={`p-4 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-2 ${result === 'DRAW'
                                    ? 'bg-gray-600 text-white shadow-lg scale-105'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <Minus className="w-5 h-5" />
                                Uavgjort
                            </button>
                            <button
                                type="button"
                                onClick={() => setResult('B_WON')}
                                className={`p-4 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-2 ${result === 'B_WON'
                                    ? 'bg-black text-white border border-white/20 shadow-lg scale-105'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <Trophy className={`w-5 h-5 ${result === 'B_WON' ? 'text-yellow-500' : 'text-gray-600'}`} />
                                Svart
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={submitting || !playerAId || !playerBId || playerAId === playerBId}
                        className="w-full py-4 text-lg shadow-xl shadow-blue-500/20"
                    >
                        {submitting ? 'Registrerer kamp...' : 'Send inn resultat'}
                    </Button>
                </form>
            </div>
        </main>
    )
}
