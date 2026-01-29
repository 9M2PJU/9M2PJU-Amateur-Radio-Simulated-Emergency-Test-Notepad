import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Volume2, RotateCcw, Copy } from 'lucide-react';

const MORSE_CODE = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
    '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
    ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
    '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/'
};

export default function MorseConverter() {
    const [text, setText] = useState('');
    const [morse, setMorse] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [wpm, setWpm] = useState(20);
    const [frequency, setFrequency] = useState(700);
    const [currentCharIndex, setCurrentCharIndex] = useState(-1);

    const contextRef = useRef(null);
    const oscillatorRef = useRef(null);
    const gainNodeRef = useRef(null);
    const timeoutIdsRef = useRef([]);

    // Convert text to morse on input change
    useEffect(() => {
        const converted = text.toUpperCase().split('').map(char => {
            return MORSE_CODE[char] || char; // Keep unknown chars as is
        }).join(' ');
        setMorse(converted);
    }, [text]);

    // Cleanup on unmount
    useEffect(() => {
        return () => stopPlayback();
    }, []);

    const stopPlayback = () => {
        setIsPlaying(false);
        setCurrentCharIndex(-1);

        timeoutIdsRef.current.forEach(id => clearTimeout(id));
        timeoutIdsRef.current = [];

        if (oscillatorRef.current) {
            try {
                oscillatorRef.current.stop();
                oscillatorRef.current.disconnect();
            } catch (e) { /* ignore */ }
            oscillatorRef.current = null;
        }

        if (contextRef.current && contextRef.current.state !== 'closed') {
            // Close context to release hardware
            // contextRef.current.close(); 
            // Actually, usually better to suspend or just stop oscillator, keeping context open often preferred for reuse
            // For this simple app, stopping oscillator is enough.
        }
    };

    const playMorse = async () => {
        if (isPlaying) {
            stopPlayback();
            return;
        }

        if (!morse) return;

        // Initialize Audio Context
        if (!contextRef.current) {
            contextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (contextRef.current.state === 'suspended') {
            await contextRef.current.resume();
        }

        setIsPlaying(true);
        timeoutIdsRef.current = [];

        const dotLen = 1.2 / wpm; // seconds. Standard parsing: WPM = width of dot. T = 1200 / wpm (ms) roughly. 
        // Paris standard: 50 dot lengths per word. t_dot = 60 / (50 * wpm) = 1.2 / wpm.

        let currentTime = contextRef.current.currentTime + 0.1; // mild start delay

        // Loop through characters to schedule audio
        const characters = text.toUpperCase().split('');
        let charIndex = 0;

        // We need to map visual highlighting sync with audio layout
        // This is complex because we scheduled audio ahead of time.
        // Simplified approach: use setTimeout for visuals, synced basically with the timing calc.

        let visualTimeAccumulator = 100; // ms

        characters.forEach((char, idx) => {
            const code = MORSE_CODE[char];

            // Schedule visual highlight
            const scheduleVisual = setTimeout(() => {
                setCurrentCharIndex(idx);
            }, visualTimeAccumulator);
            timeoutIdsRef.current.push(scheduleVisual);

            if (code) {
                // Play sounds
                const symbols = code.split('');
                symbols.forEach(symbol => {
                    const duration = symbol === '.' ? dotLen : dotLen * 3;

                    // Audio
                    const osc = contextRef.current.createOscillator();
                    const gain = contextRef.current.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(frequency, currentTime);

                    // Envelope to avoid clicking
                    gain.gain.setValueAtTime(0, currentTime);
                    gain.gain.linearRampToValueAtTime(0.1, currentTime + 0.005);
                    gain.gain.setValueAtTime(0.1, currentTime + duration - 0.005);
                    gain.gain.linearRampToValueAtTime(0, currentTime + duration);

                    osc.connect(gain);
                    gain.connect(contextRef.current.destination);

                    osc.start(currentTime);
                    osc.stop(currentTime + duration);

                    currentTime += duration + dotLen; // symbol space (1 unit)
                    visualTimeAccumulator += (duration + dotLen) * 1000;
                });

                // Inter-character space (3 units total, so add 2 more, because we added 1 after last symbol)
                currentTime += dotLen * 2;
                visualTimeAccumulator += (dotLen * 2) * 1000;

            } else if (char === ' ') {
                // Word space (7 units). We already added 3 units of visual time (conceptually) from "end of char". 
                // Actually spacing logic: 
                // Symbol gap: 1 dot (handled in loop)
                // Char gap: 3 dots (handled after loop)
                // Word gap: 7 dots.
                // If space, we just add time.
                currentTime += dotLen * 4; // Add 4 more to the 3 from previous char to make 7? Or simple 7 space.
                // Resetting to simple spacing:
                // Previous char added 3 units gap. Space needs 7 units. So add 4.
                visualTimeAccumulator += (dotLen * 4) * 1000;
            }
        });

        // Cleanup at end
        const endTimeout = setTimeout(() => {
            setIsPlaying(false);
            setCurrentCharIndex(-1);
        }, visualTimeAccumulator);
        timeoutIdsRef.current.push(endTimeout);
    };

    return (
        <div className="panel-tactical h-full flex flex-col animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-radio-cyan/20 pb-2">
                <div className="flex items-center gap-2 text-radio-cyan">
                    <Volume2 className="w-5 h-5 animate-pulse-slow" />
                    <h2 className="text-lg font-bold font-orbitron tracking-wider text-glow">TEXT TO MORSE CONVERTER</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <label className="text-[10px] text-raido-cyan/50 font-mono uppercase">SPEED (WPM)</label>
                        <input
                            type="range"
                            min="5" max="40"
                            value={wpm}
                            onChange={(e) => setWpm(Number(e.target.value))}
                            className="w-24 accent-radio-cyan h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-radio-cyan font-bold">{wpm} WPM</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <label className="text-[10px] text-raido-cyan/50 font-mono uppercase">FREQ (HZ)</label>
                        <input
                            type="range"
                            min="400" max="1000" step="50"
                            value={frequency}
                            onChange={(e) => setFrequency(Number(e.target.value))}
                            className="w-24 accent-radio-cyan h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-radio-cyan font-bold">{frequency} Hz</span>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
                <div className="flex-1 flex flex-col space-y-2">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-500 font-orbitron tracking-widest">
                        <span>Input Text</span>
                        <button onClick={() => setText('')} className="flex items-center gap-1 hover:text-white transition-colors">
                            <RotateCcw className="w-3 h-3" /> CLEAR
                        </button>
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="TYPE MESSAGE HERE..."
                        className="flex-1 w-full bg-black/40 border border-radio-cyan/20 rounded-lg p-4 font-mono text-gray-200 focus:border-radio-cyan focus:ring-1 focus:ring-radio-cyan/50 outline-none resize-none uppercase placeholder:text-gray-700"
                    />
                </div>

                {/* Output Area (Visual) */}
                <div className="flex-1 flex flex-col space-y-2">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-500 font-orbitron tracking-widest">
                        <span>Morse Output</span>
                        <button onClick={() => navigator.clipboard.writeText(morse)} className="flex items-center gap-1 hover:text-white transition-colors">
                            <Copy className="w-3 h-3" /> COPY
                        </button>
                    </div>
                    <div className="flex-1 bg-black/60 border border-radio-cyan/10 rounded-lg p-4 font-mono text-xl md:text-2xl tracking-widest leading-loose text-radio-cyan/80 overflow-y-auto break-words shadow-inner">
                        {text.split('').map((char, index) => {
                            const code = MORSE_CODE[char.toUpperCase()];
                            return (
                                <span
                                    key={index}
                                    className={`transition-all duration-100 ${index === currentCharIndex ? 'text-white text-glow bg-radio-cyan/20 rounded px-1' : ''}`}
                                >
                                    {code ? code + ' ' : char}
                                </span>
                            );
                        })}
                        {text.length === 0 && <span className="text-gray-700 opacity-50 select-none">... --- ...</span>}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="mt-4 pt-4 border-t border-radio-cyan/20 flex justify-center">
                <button
                    onClick={playMorse}
                    className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold font-orbitron tracking-widest transition-all ${isPlaying
                            ? 'bg-radio-red hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                            : 'bg-radio-cyan hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        }`}
                >
                    {isPlaying ? (
                        <>
                            <Square className="w-5 h-5 fill-current" /> STOP TRANSMISSION
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5 fill-current" /> PLAY MORSE
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
