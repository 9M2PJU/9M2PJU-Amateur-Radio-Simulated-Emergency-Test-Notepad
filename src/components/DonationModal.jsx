import React, { useEffect, useState } from 'react';
import { Coffee, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function DonationModal({ onClose }) {
    const [timeLeft, setTimeLeft] = useState(null); // Wait for fetch
    const [duration, setDuration] = useState(10); // Default 10s

    useEffect(() => {
        const fetchDuration = async () => {
            try {
                const { data, error } = await supabase
                    .from('system_config')
                    .select('value')
                    .eq('key', 'donation_popup_duration')
                    .single();

                if (data?.value?.seconds) {
                    setDuration(data.value.seconds);
                    setTimeLeft(data.value.seconds);
                } else {
                    setTimeLeft(10);
                }
            } catch (err) {
                console.error("Error fetching duration:", err);
                setTimeLeft(10);
            }
        };
        fetchDuration();
    }, []);

    useEffect(() => {
        if (timeLeft === null) return; // Don't start timer until configured

        if (timeLeft <= 0) {
            // Check if document is hidden when time runs out
            const wasHidden = document.hidden;
            onClose(wasHidden);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onClose]);

    // Handle manual close (user clicked X or backdrop) - definitely NOT hidden/missed
    const handleManualClose = () => {
        onClose(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="panel-tactical max-w-sm w-full text-center space-y-4 border-radio-amber animate-in zoom-in-95 duration-300 relative overflow-hidden">

                {/* Close Button (X) */}
                <button
                    onClick={handleManualClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors p-2"
                >
                    <span className="sr-only">Close</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 h-1 bg-radio-amber transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / duration) * 100}%` }}></div>

                <div className="flex flex-col items-center gap-3 pt-4">
                    <div className="p-3 bg-white rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        <img src="/duitnow-qr.png" alt="Scan to Donate" className="w-48 h-48 object-contain mix-blend-normal" />
                    </div>
                    <h3 className="text-xl font-bold font-orbitron text-glow-amber mt-2">SUPPORT THE MISSION</h3>
                </div>

                <p className="text-xs text-gray-400 font-mono leading-relaxed px-4">
                    Scan via <span className="text-radio-amber font-bold">DuitNow / E-Wallet</span> to keep the servers running.
                </p>

                <div className="pt-2 space-y-3">
                    <a
                        href="https://buymeacoffee.com/9m2pju"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black font-bold py-3 rounded shadow-[0_0_10px_rgba(255,221,0,0.3)] font-orbitron tracking-widest transition-all text-xs"
                    >
                        <Coffee className="w-4 h-4" />
                        OR BUY COFFEE (WEB)
                    </a>
                </div>

                <div className="text-[10px] text-gray-500 font-mono border-t border-white/5 pt-3 mt-2 space-y-1">
                    <div>AUTO-CLOSING IN {timeLeft}s</div>
                    <div className="text-emerald-500/60 italic">Note: If you have donated, this popup will not appear.</div>
                </div>
            </div>
        </div>
    );
}
