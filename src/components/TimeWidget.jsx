import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function TimeWidget({ className = "", compact = false }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date, timeZone) => {
        return date.toLocaleTimeString('en-GB', {
            timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    if (compact) {
        return (
            <div className={`flex items-center gap-2 font-mono text-xs ${className}`}>
                <div className="flex flex-col items-end">
                    <div className="text-radio-cyan font-bold leading-none">
                        {formatTime(time, 'UTC')}Z
                    </div>
                    <div className="text-[9px] text-gray-400 leading-none mt-0.5">
                        {formatTime(time, undefined)}L
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`panel-tactical p-3 bg-black/40 border-radio-cyan/20 ${className}`}>
            <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] uppercase font-bold text-gray-500 font-orbitron tracking-widest">Timing</span>
            </div>
            <div className="space-y-1">
                <div className="flex justify-between items-end">
                    <span className="text-xl font-bold font-mono text-radio-cyan text-glow-cyan">{formatTime(time, 'UTC')}</span>
                    <span className="text-[10px] font-bold text-radio-cyan/50 mb-1">UTC</span>
                </div>
                <div className="flex justify-between items-end">
                    <span className="text-sm font-bold font-mono text-gray-300">{formatTime(time, undefined)}</span>
                    <span className="text-[9px] text-gray-500 mb-0.5">LOCAL</span>
                </div>
            </div>
        </div>
    );
}
