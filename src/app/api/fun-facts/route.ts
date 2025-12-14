import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const getRandom = <T>(arr: T[]): T | undefined => arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            include: {
                matchesAsA: { include: { playerB: true } },
                matchesAsB: { include: { playerA: true } },
            },
        })
        const matches = await prisma.match.findMany({
            orderBy: { date: 'desc' },
            include: { playerA: true, playerB: true }
        })

        if (users.length < 2 || matches.length === 0) {
            return NextResponse.json({ fact: "Ikkje nok data til å generere fakta enno." })
        }

        const generators: (() => string | null)[] = [
            // 1. Win percentage
            () => {
                const player = getRandom(users.filter(u => u.matchesAsA.length + u.matchesAsB.length > 0))
                if (!player) return null
                const total = player.matchesAsA.length + player.matchesAsB.length
                const wins = player.matchesAsA.filter(m => m.result === 'A_WON').length + player.matchesAsB.filter(m => m.result === 'B_WON').length
                const rate = Math.round((wins / total) * 100)
                return `${player.name} har vunne ${rate}% av kampane sine.`
            },
            // 2. Color disparity
            () => {
                const player = getRandom(users.filter(u => u.matchesAsA.length > 0 && u.matchesAsB.length > 0))
                if (!player) return null
                const whiteWins = player.matchesAsA.filter(m => m.result === 'A_WON').length
                const whiteRate = Math.round((whiteWins / player.matchesAsA.length) * 100)
                const blackWins = player.matchesAsB.filter(m => m.result === 'B_WON').length
                const blackRate = Math.round((blackWins / player.matchesAsB.length) * 100)

                if (whiteRate > blackRate + 15) return `${player.name} vinn oftare som kvit (${whiteRate}%) enn som svart (${blackRate}%).`
                if (blackRate > whiteRate + 15) return `${player.name} vinn oftare som svart (${blackRate}%) enn som kvit (${whiteRate}%).`
                return null
            },
            // 3. Kryptonite: Player A lost last 4+ games vs Player B
            () => {
                const p1 = getRandom(users)
                if (!p1) return null
                const opponents = users.filter(u => u.id !== p1.id)
                for (const p2 of opponents) {
                    const headToHead = matches.filter(m =>
                        (m.playerAId === p1.id && m.playerBId === p2.id) ||
                        (m.playerAId === p2.id && m.playerBId === p1.id)
                    )
                    if (headToHead.length < 4) continue

                    let streak = 0
                    for (const m of headToHead) {
                        const p1Won = (m.playerAId === p1.id && m.result === 'A_WON') || (m.playerBId === p1.id && m.result === 'B_WON')
                        if (!p1Won && m.result !== 'DRAW') streak++
                        else break
                    }

                    if (streak >= 4) return `${p2.name} er ${p1.name} sin kryptonitt! ${p1.name} har tapt dei siste ${streak} kampane mot han/henne.`
                }
                return null
            },
            // 4. Dead Heat: Identical stats this week (wins, losses, draws) for active players
            () => {
                const d = new Date()
                const day = d.getDay()
                const diff = d.getDate() - day + (day == 0 ? -6 : 1)
                const monday = new Date(d.setDate(diff))
                monday.setHours(0, 0, 0, 0)

                const weeklyMatches = matches.filter(m => new Date(m.date) >= monday)
                if (weeklyMatches.length === 0) return null

                const playerStats = []
                for (const u of users) {
                    const myMatches = weeklyMatches.filter(m => m.playerAId === u.id || m.playerBId === u.id)
                    if (myMatches.length === 0) continue

                    let wins = 0, losses = 0, draws = 0
                    for (const m of myMatches) {
                        if (m.result === 'DRAW') {
                            draws++
                        } else if ((m.playerAId === u.id && m.result === 'A_WON') || (m.playerBId === u.id && m.result === 'B_WON')) {
                            wins++
                        } else {
                            losses++
                        }
                    }
                    playerStats.push({ user: u, wins, losses, draws })
                }

                if (playerStats.length < 2) return null

                for (let i = 0; i < playerStats.length; i++) {
                    for (let j = i + 1; j < playerStats.length; j++) {
                        const p1 = playerStats[i]
                        const p2 = playerStats[j]

                        if (p1.wins === p2.wins && p1.losses === p2.losses && p1.draws === p2.draws) {
                            return `Daudt løp mellom ${p1.user.name} og ${p2.user.name}! Begge har ${p1.wins} sigrar, ${p1.losses} tap og ${p1.draws} remis denne veka.`
                        }
                    }
                }
                return null
            },
            // 5. Long Time Since Win: > 10 days
            () => {
                const p1 = getRandom(users)
                if (!p1) return null
                const opponents = users.filter(u => u.id !== p1.id)
                for (const p2 of opponents) {
                    const headToHead = matches.filter(m =>
                        (m.playerAId === p1.id && m.playerBId === p2.id) ||
                        (m.playerAId === p2.id && m.playerBId === p1.id)
                    )
                    const lastWin = headToHead.find(m => (m.playerAId === p1.id && m.result === 'A_WON') || (m.playerBId === p1.id && m.result === 'B_WON'))
                    if (lastWin) {
                        const diffTime = Math.abs(new Date().getTime() - new Date(lastWin.date).getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays > 10) {
                            const dateStr = new Date(lastWin.date).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit' })
                            return `${p1.name} har ikkje slått ${p2.name} sidan ${dateStr} (${diffDays} dagar sidan).`
                        }
                    }
                }
                return null
            },
            // 6. Unstoppable: Win streak 3+ this week
            () => {
                const p = getRandom(users)
                if (!p) return null
                const d = new Date()
                const day = d.getDay()
                const diff = d.getDate() - day + (day == 0 ? -6 : 1)
                const monday = new Date(d.setDate(diff))
                monday.setHours(0, 0, 0, 0)

                const myMatches = matches.filter(m =>
                    (m.playerAId === p.id || m.playerBId === p.id) &&
                    new Date(m.date) >= monday
                )

                let streak = 0
                for (const m of myMatches) {
                    const won = (m.playerAId === p.id && m.result === 'A_WON') || (m.playerBId === p.id && m.result === 'B_WON')
                    if (won) streak++
                    else break
                }

                if (streak >= 3) return `${p.name} er ustoppeleg! Han/ho har ${streak} sigrar på rad denne veka.`
                return null
            },
            // 7. Needs a hug: Loss streak 3+
            () => {
                const p = getRandom(users)
                if (!p) return null
                const myMatches = matches.filter(m => m.playerAId === p.id || m.playerBId === p.id)
                let streak = 0
                for (const m of myMatches) {
                    const lost = (m.playerAId === p.id && m.result === 'B_WON') || (m.playerBId === p.id && m.result === 'A_WON')
                    if (lost) streak++
                    else break
                }
                if (streak >= 3) return `${p.name} treng ein klem (eller kaffi). Han/ho har 0 sigrar på dei siste ${streak} forsøka.`
                return null
            },
            // 8. Hasn't lost since: No losses since [Day] (min 1 day)
            () => {
                const p = getRandom(users)
                if (!p) return null
                const myMatches = matches.filter(m => m.playerAId === p.id || m.playerBId === p.id)
                const lastLoss = myMatches.find(m => (m.playerAId === p.id && m.result === 'B_WON') || (m.playerBId === p.id && m.result === 'A_WON'))
                if (lastLoss) {
                    const diffTime = Math.abs(new Date().getTime() - new Date(lastLoss.date).getTime());
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays >= 1) {
                        const days = ['søndag', 'måndag', 'tysdag', 'onsdag', 'torsdag', 'fredag', 'laurdag']
                        const dayName = days[new Date(lastLoss.date).getDay()]
                        return `${p.name} har ikkje tapt ein einaste kamp sidan ${dayName}.`
                    }
                }
                return null
            },
            // 9. Productivity tanking: > 5 games today
            () => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const matchesToday = matches.filter(m => new Date(m.date) >= today)
                if (matchesToday.length >= 5) {
                    return `Produktiviteten stuper? ${matchesToday.length} kampar har blitt spelt så langt i dag.`
                }
                return null
            },
            // 10. Hates conflict: Draws > 25%
            () => {
                const p = getRandom(users)
                if (!p) return null
                const total = p.matchesAsA.length + p.matchesAsB.length
                if (total < 5) return null
                const draws = p.matchesAsA.filter(m => m.result === 'DRAW').length + p.matchesAsB.filter(m => m.result === 'DRAW').length
                const percentage = Math.round((draws / total) * 100)
                if (percentage > 25) return `${p.name} hatar konflikt. Han/ho har flest remis på kontoret (${percentage}%).`
                return null
            },
            // 11. Upset of the week (today)
            () => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const matchesToday = matches.filter(m => new Date(m.date) >= today)
                for (const m of matchesToday) {
                    const pA = users.find(u => u.id === m.playerAId)
                    const pB = users.find(u => u.id === m.playerBId)
                    if (!pA || !pB) continue

                    if (m.result === 'A_WON' && pA.currentElo < pB.currentElo - 100) {
                        return `Vekas bombe! ${pA.name} slo nettopp ${pB.name}!`
                    }
                    if (m.result === 'B_WON' && pB.currentElo < pA.currentElo - 100) {
                        return `Vekas bombe! ${pB.name} slo nettopp ${pA.name}!`
                    }
                }
                return null
            },
            // 12. Milestone: 100th game
            () => {
                const p = getRandom(users)
                if (!p) return null
                const total = p.matchesAsA.length + p.matchesAsB.length
                if (total > 0 && total % 100 === 0) {
                    return `Gratulerer til ${p.name}, som nettopp registrerte sin ${total}. kamp!`
                }
                return null
            }
        ]

        const shuffled = generators.sort(() => 0.5 - Math.random())

        for (const gen of shuffled) {
            const fact = gen()
            if (fact) return NextResponse.json({ fact })
        }

        return NextResponse.json({ fact: "Ingen spesielle hendingar akkurat no." })

    } catch (error) {
        console.error('Error calculating fun facts:', error)
        return NextResponse.json({ error: 'Failed to calculate facts' }, { status: 500 })
    }
}
