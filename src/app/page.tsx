import Link from 'next/link'
import Scoreboard from './components/Scoreboard'
import RegisterMatchButton from './components/RegisterMatchButton'
import { Button } from './components/ui/Button'
import { UserPlus, History, Trophy } from 'lucide-react'

export default function Home() {
    return (
        <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-4 py-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/20">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent tracking-tight">
                            Sjakkmeisterskapet
                        </h1>
                        <p className="text-blue-400/80 font-medium tracking-wide uppercase text-sm mt-1">Vekentleg kontormeisterskap</p>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/history">
                        <Button variant="secondary" className="flex items-center gap-2">
                            <History className="w-4 h-4" /> Historikk
                        </Button>
                    </Link>
                    <Link href="/user/new">
                        <Button variant="outline" className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" /> Legg til spelar
                        </Button>
                    </Link>
                    <RegisterMatchButton />
                </div>
            </header>

            <Scoreboard />
        </main>
    )
}
