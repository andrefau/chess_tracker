import React from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: React.ReactNode
}

export function Select({ label, className, children, ...props }: SelectProps) {
    return (
        <div className="flex flex-col gap-2 group">
            {label && <label className="text-sm font-medium text-gray-400 group-focus-within:text-blue-400 transition-colors">{label}</label>}
            <div className="relative">
                <select
                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:bg-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300 ${className || ''}`}
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500 group-focus-within:text-blue-400 transition-colors">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>
        </div>
    )
}
