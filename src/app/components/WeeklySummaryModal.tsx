import { Trophy, X, Medal, Crown } from 'lucide-react'
import { useEffect, useState } from 'react'

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

interface WeeklySummaryModalProps {
    isOpen: boolean
    onClose: () => void
    players: PlayerStats[]
}

export default function WeeklySummaryModal({ isOpen, onClose, players }: WeeklySummaryModalProps) {
    const [winner, setWinner] = useState<PlayerStats | null>(null)

    useEffect(() => {
        if (isOpen && players.length > 0) {
            setWinner(players[0])
        }
    }, [isOpen, players])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl bg-[#0f1115] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                    {/* Winner Section */}
                    <div className="w-full md:w-2/5 bg-gradient-to-br from-yellow-900/40 via-yellow-600/10 to-transparent p-8 flex flex-col items-center justify-center text-center relative overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
                        {/* Background effects */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent animate-pulse"></div>
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>

                        {winner ? (
                            <div className="relative z-10 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-700 delay-100">
                                <div className="mb-2 text-yellow-500 font-bold tracking-widest uppercase text-sm">Vekas vinnar</div>

                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 rounded-full"></div>
                                    <Trophy className="w-32 h-32 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-bounce-slow" />
                                    <Crown className="absolute -top-4 -right-4 w-12 h-12 text-yellow-200 rotate-12 animate-pulse" />
                                </div>

                                <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">{winner.name}</h2>
                                <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-1.5 rounded-full border border-yellow-500/30">
                                    <span className="text-yellow-200 font-mono font-bold text-xl">{winner.rating}</span>
                                    <span className="text-yellow-500/70 text-xs font-bold uppercase">Rating</span>
                                </div>

                                <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-xs">
                                    <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-2xl font-bold text-green-400">{winner.wins}</span>
                                        <span className="text-xs text-gray-400 uppercase tracking-wider">Sigrar</span>
                                    </div>
                                    <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-2xl font-bold text-white">{winner.gamesPlayed}</span>
                                        <span className="text-xs text-gray-400 uppercase tracking-wider">Kampar</span>
                                    </div>
                                    <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-2xl font-bold text-blue-400">{Math.round((winner.wins / winner.gamesPlayed) * 100)}%</span>
                                        <span className="text-xs text-gray-400 uppercase tracking-wider">Vinn%</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-400">Ingen vinnar enno</div>
                        )}
                    </div>

                    {/* Stats List Section */}
                    <div className="w-full md:w-3/5 bg-[#0f1115] flex flex-col h-full overflow-hidden">
                        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                <Medal className="w-5 h-5 text-blue-400" />
                                Vekesoversikt
                            </h3>
                        </div>

                        <div className="overflow-y-auto flex-1 p-0">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-black/20 text-gray-400 uppercase text-[10px] tracking-wider sticky top-0 backdrop-blur-md z-10">
                                    <tr>
                                        <th className="p-4 font-semibold text-center w-12">#</th>
                                        <th className="p-4 font-semibold">Spelar</th>
                                        <th className="p-4 font-semibold text-center">Kvit / Svart</th>
                                        <th className="p-4 font-semibold text-center">V - T - U</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {players.map((player, index) => (
                                        <tr key={player.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4 text-center font-mono text-gray-500 font-bold">
                                                {index === 0 ? <span className="text-yellow-500">1</span> :
                                                    index === 1 ? <span className="text-gray-300">2</span> :
                                                        index === 2 ? <span className="text-amber-600">3</span> :
                                                            index + 1}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-200 group-hover:text-white transition-colors">{player.name}</div>
                                                <div className="text-xs text-gray-500 font-mono">Rating: {player.rating}</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2 text-xs font-mono">
                                                    <span className="bg-gray-200 text-black px-2 py-0.5 rounded-md font-bold" title="Kampar som kvit">{player.gamesAsWhite}</span>
                                                    <span className="text-gray-600">/</span>
                                                    <span className="bg-gray-800 text-gray-200 px-2 py-0.5 rounded-md font-bold border border-gray-700" title="Kampar som svart">{player.gamesAsBlack}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2 font-mono text-sm">
                                                    <span className="text-green-500 font-bold" title="Sigrar">{player.wins}</span>
                                                    <span className="text-gray-700">·</span>
                                                    <span className="text-red-500 font-bold" title="Tap">{player.losses}</span>
                                                    <span className="text-gray-700">·</span>
                                                    <span className="text-gray-400 font-bold" title="Uavgjort">{player.draws}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
