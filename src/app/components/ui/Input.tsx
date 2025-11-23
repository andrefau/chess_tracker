import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
}

export function Input({ label, className, ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-2 group">
            {label && <label className="text-sm font-medium text-gray-400 group-focus-within:text-blue-400 transition-colors">{label}</label>}
            <input
                className={`bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300 ${className || ''}`}
                {...props}
            />
        </div>
    )
}
