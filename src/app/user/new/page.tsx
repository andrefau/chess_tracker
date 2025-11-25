'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { ArrowLeft, UserPlus } from 'lucide-react'

export default function NewUserPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            })

            if (res.ok) {
                router.push('/')
                router.refresh()
            }
        } catch (error) {
            console.error('Failed to create user', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen p-4 flex items-center justify-center">
            <div className="w-full max-w-md bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
                <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Tilbake til poengtavla
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Legg til ny spelar</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <Input
                        label="Spelarnamn"
                        placeholder="f.eks. Magnus Carlsen"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />

                    <Button type="submit" disabled={loading || !name.trim()} className="w-full mt-2">
                        {loading ? 'Legg til...' : 'Legg til spelar'}
                    </Button>
                </form>
            </div>
        </main>
    )
}
