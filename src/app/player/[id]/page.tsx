'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Swords, Trash2, Pencil, X } from 'lucide-react'
import EloGraph from '@/app/components/EloGraph'
import ConfirmationModal from '@/app/components/ConfirmationModal'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'

interface PlayerData {
    user: {
        id: string
        name: string
        createdAt: string
    }
    stats: {
        wins: number
        losses: number
        draws: number
        gamesPlayed: number
        currentElo: number
        gamesAsWhite: number
        gamesAsBlack: number
    }
    history: { date: string; elo: number; matchId?: string }[]
    matches: any[]
}

export default function PlayerPage() {
    const { id } = useParams()
    const router = useRouter()
    const [data, setData] = useState<PlayerData | null>(null)
    const [loading, setLoading] = useState(true)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showRenameModal, setShowRenameModal] = useState(false)
    const [nameInput, setNameInput] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/users/${id}`)
                if (res.ok) {
                    const json = await res.json()
                    setData(json)
                }
            } catch (error) {
                console.error('Error fetching player data:', error)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchData()
    }, [id])

    const handleRename = async () => {
        if (!nameInput.trim()) return
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: nameInput.trim() }),
            })
            if (res.ok) {
                setData(prev => prev ? { ...prev, user: { ...prev.user, name: nameInput.trim() } } : prev)
                setShowRenameModal(false)
            }
        } catch (error) {
            console.error('Error renaming user:', error)
        }
    }

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
            if (res.ok) {
                router.push('/')
            }
        } catch (error) {
            console.error('Error deleting user:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 animate-pulse">Hentar spelardata...</p>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl font-bold mb-4">Spelar ikkje funnet</h1>
                <Link href="/" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Tilbake til oversikta
                </Link>
            </div>
        )
    }

    return (
        <main className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row items-baseline justify-between gap-4 border-b border-white/10 pb-6">
                <div className="flex-1">
                    <div className="flex justify-between items-start w-full">
                        <div>
                            <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2 mb-4 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Tilbake til oversikta
                            </Link>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{data.user.name}</h1>
                            <p className="text-gray-400 text-sm">Medlem sidan {new Date(data.user.createdAt).toLocaleDateString('no-NO')}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => { setNameInput(data.user.name); setShowRenameModal(true) }}
                                className="p-2 text-gray-400/50 hover:text-gray-200 hover:bg-white/10 rounded-lg transition-all"
                                title="Endre namn"
                            >
                                <Pencil className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                title="Slett spelar"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Noverande Rating</p>
                        <p className="text-3xl font-mono font-bold text-blue-400">{data.stats.currentElo}</p>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                    <p className="text-green-400 text-xs uppercase font-bold mb-1">Sigrar</p>
                    <p className="text-2xl font-mono text-white">{data.stats.wins}</p>
                    <p className="text-xs text-slate-400 mt-1">{Math.round((data.stats.wins / data.stats.gamesPlayed) * 100 || 0)}%</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                    <p className="text-red-400 text-xs uppercase font-bold mb-1">Tap</p>
                    <p className="text-2xl font-mono text-white">{data.stats.losses}</p>
                    <p className="text-xs text-slate-400 mt-1">{Math.round((data.stats.losses / data.stats.gamesPlayed) * 100 || 0)}%</p>
                </div>
                <div className="bg-gray-500/10 border border-gray-500/20 p-4 rounded-xl">
                    <p className="text-gray-400 text-xs uppercase font-bold mb-1">Uavgjort</p>
                    <p className="text-2xl font-mono text-white">{data.stats.draws}</p>
                    <p className="text-xs text-slate-400 mt-1">{Math.round((data.stats.draws / data.stats.gamesPlayed) * 100 || 0)}%</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                    <p className="text-blue-400 text-xs uppercase font-bold mb-1">Kampar totalt</p>
                    <p className="text-2xl font-mono text-white">{data.stats.gamesPlayed}</p>
                </div>
            </div>

            {/* Graph */}
            <EloGraph data={data.history} />

            {/* Match History */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-white">
                    <Swords className="w-5 h-5 text-gray-400" />
                    <h2 className="text-xl font-bold">Kamphistorikk</h2>
                </div>

                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-black/20 text-gray-400 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="p-4 font-semibold w-1/4">Motstandar</th>
                                    <th className="p-4 font-semibold text-center w-24">Resultat</th>
                                    <th className="p-4 font-semibold text-center w-24">Rating</th>
                                    <th className="p-4 font-semibold text-right w-1/3">Dato</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.matches.map((match) => {
                                    const isWin = (match.playerAId === data.user.id && match.result === 'A_WON') ||
                                        (match.playerBId === data.user.id && match.result === 'B_WON')
                                    const isDraw = match.result === 'DRAW'
                                    // Better diff calculation: find prev elo
                                    // Actually we can just show the new elo for now, or calculate diff if we want to be fancy.
                                    // Let's just show the new Elo.

                                    return (
                                        <tr key={match.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-200">{match.opponent.name}</span>
                                                    <span className="text-xs text-gray-500">Motstandar rating: {match.opponentEloAfter}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex px-2 py-1 rounded text-xs font-bold
                                                    ${isWin ? 'bg-green-500/20 text-green-400' :
                                                        isDraw ? 'bg-gray-500/20 text-gray-400' :
                                                            'bg-red-500/20 text-red-400'}`}>
                                                    {isWin ? 'SIGER' : isDraw ? 'UAVGJORT' : 'TAP'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center font-mono text-blue-300">
                                                {match.userEloAfter}
                                            </td>
                                            <td className="p-4 text-right text-gray-400 text-sm">
                                                {new Date(match.date).toLocaleDateString('no-NO', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                        </tr>
                                    )
                                })}
                                {data.matches.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-500">
                                            Ingen kampar spelt enno
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showRenameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="relative w-full max-w-md bg-[#0f1115] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
                        <button
                            onClick={() => setShowRenameModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-white mb-6">Endre namn</h2>
                        <Input
                            label="Nytt namn"
                            value={nameInput}
                            onChange={e => setNameInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleRename()}
                            autoFocus
                        />
                        <div className="flex gap-3 mt-6">
                            <Button variant="secondary" className="flex-1" onClick={() => setShowRenameModal(false)}>
                                Avbryt
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={handleRename}
                                disabled={!nameInput.trim()}
                            >
                                Lagre
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Slett spelar"
                message="Er du sikker på at du vil slette denne spelaren? Alle kampar og historikk vil bli sletta permanent. Dette kan ikkje angrast."
                confirmText="Slett spelar"
                variant="danger"
            />
        </main>
    )
}
