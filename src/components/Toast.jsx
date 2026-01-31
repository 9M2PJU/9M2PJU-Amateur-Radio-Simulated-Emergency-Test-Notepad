import React, { useEffect, useState } from 'react';
import { Coffee, X } from 'lucide-react';

export default function Toast({ message, onClick, onClose, duration = 10000 }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleClose = (e) => {
        e.stopPropagation();
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <div
            onClick={onClick}
            className={`fixed bottom-20 right-4 z-[90] max-w-sm w-full cursor-pointer transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
            <div className="bg-black/80 backdrop-blur-md border border-radio-amber/50 text-radio-amber p-4 rounded-lg shadow-[0_0_15px_rgba(255,165,0,0.3)] flex items-start gap-3 hover:bg-black/90 active:scale-95 transition-transform">
                <div className="bg-radio-amber/10 p-2 rounded-full animate-pulse">
                    <Coffee className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h4 className="font-orbitron font-bold text-sm text-glow-amber mb-1">SUPPORT UNIT</h4>
                    <p className="font-mono text-xs text-gray-400 leading-tight">{message}</p>
                </div>
                <button
                    onClick={handleClose}
                    className="text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            {/* Progress/Timer Bar */}
            <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-radio-amber/20 overflow-hidden rounded-b-lg">
                <div
                    className="h-full bg-radio-amber"
                    style={{
                        width: '100%',
                        animation: `width-shrink ${duration}ms linear forwards`
                    }}
                />
            </div>
            <style jsx>{`
                @keyframes width-shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
}
