'use client'

import { useEffect, useState } from 'react'
import { Trophy, Medal, Crown, TrendingUp, Minus, TrendingDown } from 'lucide-react'
import FunFact from './FunFact'
import WeeklySummaryModal from './WeeklySummaryModal'

interface PlayerStats {
    rank: number
    id: string
    name: string
    rating: number
    wins: number
    losses: number
    draws: number
    gamesPlayed: number
    gamesAsWhite: number
    gamesAsBlack: number
}

export default function Scoreboard({ date }: { date?: Date }) {
    const [players, setPlayers] = useState<PlayerStats[]>([])
    const [loading, setLoading] = useState(true)
    const [showSummaryModal, setShowSummaryModal] = useState(false)

    const fetchScoreboard = async () => {
        setLoading(true)
        try {
            const query = date ? `?date=${date.toISOString()}` : ''
            const res = await fetch(`/api/scoreboard${query}`)
            const data = await res.json()
            setPlayers(data)
        } catch (error) {
            console.error('Failed to fetch scoreboard', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchScoreboard()
        const interval = setInterval(fetchScoreboard, 60000)
        return () => clearInterval(interval)
    }, [date])

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 animate-pulse">Lastar rangering...</p>
        </div>
    )

    if (players.length === 0) {
        return (
            <div className="text-center py-20 px-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Ingen spelarar enno</h3>
                <p className="text-gray-400">Arenaen er tom. Ver den første til å bli med!</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowSummaryModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg border border-yellow-500/20 transition-all hover:scale-105"
                >
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium">Vekas vinnar</span>
                </button>
            </div>

            {/* Top 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {players.slice(0, 3).map((player) => (
                    <div key={player.id}
                        className={`relative overflow-hidden rounded-2xl p-6 border backdrop-blur-xl transition-all duration-500 hover:transform hover:-translate-y-1
              ${player.rank === 1
                                ? 'bg-gradient-to-b from-yellow-500/10 to-yellow-900/5 border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)] md:-mt-4 md:mb-4 z-10'
                                : player.rank === 2
                                    ? 'bg-gradient-to-b from-gray-400/10 to-gray-900/5 border-gray-400/30'
                                    : 'bg-gradient-to-b from-amber-700/10 to-amber-900/5 border-amber-700/30'
                            }`}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Crown className="w-24 h-24" />
                        </div>

                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-3 shadow-lg
                ${player.rank === 1 ? 'bg-yellow-500 text-black' :
                                    player.rank === 2 ? 'bg-gray-300 text-black' :
                                        'bg-amber-700 text-white'}`}>
                                {player.rank}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1 truncate w-full">{player.name}</h3>
                            <p className={`text-2xl font-mono font-bold mb-4 
                ${player.rank === 1 ? 'text-yellow-400' :
                                    player.rank === 2 ? 'text-gray-300' :
                                        'text-amber-600'}`}>
                                {player.gamesPlayed > 0 ? player.rating : '-'}
                            </p>

                            <div className="flex items-center gap-4 text-sm bg-black/20 rounded-lg px-4 py-2 w-full justify-between">
                                <div className="flex flex-col">
                                    <span className="text-green-400 font-bold">{player.wins}V</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-red-400 font-bold">{player.losses}T</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-400 font-bold">{player.draws}U</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Fun Fact Infobox */}
            <div className="mb-8">
                <FunFact />
            </div>

            {/* List View for Rest */}
            {players.length > 3 && (
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-md shadow-xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-black/20 text-gray-400 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4 font-semibold text-center w-16">Rang</th>
                                <th className="p-4 font-semibold">Spelar</th>
                                <th className="p-4 font-semibold text-right">Rating</th>
                                <th className="p-4 font-semibold text-center hidden sm:table-cell">Statistikk (V-T-U)</th>
                                <th className="p-4 font-semibold text-right">Kampar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {players.slice(3).map((player) => (
                                <tr key={player.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 text-center font-mono text-gray-500 font-bold">#{player.rank}</td>
                                    <td className="p-4 font-medium text-gray-200 group-hover:text-white transition-colors">{player.name}</td>
                                    <td className="p-4 text-right font-mono text-blue-400 font-bold">{player.gamesPlayed > 0 ? player.rating : '-'}</td>
                                    <td className="p-4 text-center hidden sm:table-cell">
                                        <div className="flex items-center justify-center gap-3 font-mono text-sm">
                                            <span className="text-green-500">{player.wins}</span>
                                            <span className="text-gray-600">/</span>
                                            <span className="text-red-500">{player.losses}</span>
                                            <span className="text-gray-600">/</span>
                                            <span className="text-gray-400">{player.draws}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right text-gray-400">{player.gamesPlayed}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <WeeklySummaryModal
                isOpen={showSummaryModal}
                onClose={() => setShowSummaryModal(false)}
                players={players}
            />
        </div>
    )
}
