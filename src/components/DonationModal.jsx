import React from 'react';
import { Heart, Coffee, X } from 'lucide-react';

export default function DonationModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="panel-tactical max-w-sm w-full text-center space-y-4 border-radio-amber animate-in zoom-in-95 duration-300">
                <div className="flex justify-end">
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-radio-amber/10 rounded-full border border-radio-amber/30 animate-pulse-slow">
                        <Heart className="w-8 h-8 text-radio-amber fill-radio-amber/20" />
                    </div>
                    <h3 className="text-xl font-bold font-orbitron text-glow-amber">SUPPORT THE MISSION</h3>
                </div>

                <p className="text-sm text-gray-400 font-mono leading-relaxed">
                    Developing and maintaining the <span className="text-radio-amber font-bold">DARES Suite</span> requires significant resources. Your contribution keeps the servers running and features evolving.
                </p>

                <div className="pt-4 space-y-3">
                    <a 
                        href="https://buymeacoffee.com/9m2pju" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black font-bold py-3 rounded shadow-[0_0_15px_rgba(255,221,0,0.4)] font-orbitron tracking-widest transition-all"
                    >
                        <Coffee className="w-4 h-4" />
                        BUY ME A COFFEE
                    </a>
                    
                    <button 
                        onClick={onClose} 
                        className="w-full bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white py-2 rounded text-xs font-bold uppercase tracking-widest transition-all"
                    >
                        STANDBY (LATER)
                    </button>
                </div>
                
                <p className="text-[9px] text-gray-600 font-mono pt-2">
                    SECURE TRANSMISSION // END ENCRYPTION
                </p>
            </div>
        </div>
    );
}
