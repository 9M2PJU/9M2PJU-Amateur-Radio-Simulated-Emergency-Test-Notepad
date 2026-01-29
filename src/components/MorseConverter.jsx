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
    const [result, setResult] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [wpm, setWpm] = useState(20);
    const [frequency, setFrequency] = useState(700);
    const [currentCharIndex, setCurrentCharIndex] = useState(-1);

    const contextRef = useRef(null);
    const timeoutIdsRef = useRef([]);

    useEffect(() => {
        const converted = text.toUpperCase().split('').map(char => {
            return MORSE_CODE[char] || char;
        }).join(' ');
        setResult(converted);
    }, [text]);

    useEffect(() => { return () => stopPlayback(); }, []);

    const stopPlayback = () => {
        setIsPlaying(false);
        setCurrentCharIndex(-1);
        timeoutIdsRef.current.forEach(id => clearTimeout(id));
        timeoutIdsRef.current = [];
    };

    const playMorse = async () => {
        if (isPlaying) { stopPlayback(); return; }
        if (!result) return;

        if (!contextRef.current) contextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        if (contextRef.current.state === 'suspended') await contextRef.current.resume();

        setIsPlaying(true);
        timeoutIdsRef.current = [];
        const dotLen = 1.2 / wpm;
        let currentTime = contextRef.current.currentTime + 0.1;
        const characters = text.toUpperCase().split('');
        let visualTimeAccumulator = 100;

        characters.forEach((char, idx) => {
            const code = MORSE_CODE[char];
            const scheduleVisual = setTimeout(() => setCurrentCharIndex(idx), visualTimeAccumulator);
            timeoutIdsRef.current.push(scheduleVisual);

            if (code) {
                code.split('').forEach(symbol => {
                    const duration = symbol === '.' ? dotLen : dotLen * 3;
                    const osc = contextRef.current.createOscillator();
                    const gain = contextRef.current.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(frequency, currentTime);
                    gain.gain.setValueAtTime(0, currentTime);
                    gain.gain.linearRampToValueAtTime(0.1, currentTime + 0.005);
                    gain.gain.setValueAtTime(0.1, currentTime + duration - 0.005);
                    gain.gain.linearRampToValueAtTime(0, currentTime + duration);
                    osc.connect(gain);
                    gain.connect(contextRef.current.destination);
                    osc.start(currentTime);
                    osc.stop(currentTime + duration);
                    currentTime += duration + dotLen;
                    visualTimeAccumulator += (duration + dotLen) * 1000;
                });
                currentTime += dotLen * 2;
                visualTimeAccumulator += (dotLen * 2) * 1000;
            } else if (char === ' ') {
                currentTime += dotLen * 4;
                visualTimeAccumulator += (dotLen * 4) * 1000;
            }
        });

        const endTimeout = setTimeout(() => { setIsPlaying(false); setCurrentCharIndex(-1); }, visualTimeAccumulator);
        timeoutIdsRef.current.push(endTimeout);
    };

    return (
        <div className="panel-tactical h-full flex flex-col animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 border-b border-radio-cyan/20 pb-2 gap-4">
                <div className="flex items-center gap-2 text-radio-cyan">
                    <Volume2 className="w-5 h-5 animate-pulse-slow" />
                    <h2 className="text-lg font-bold font-orbitron tracking-wider text-glow uppercase">Morse Code TOOL (CW)</h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <label className="text-[9px] text-radio-cyan/50 font-mono uppercase">WPM</label>
                        <input type="range" min="5" max="40" value={wpm} onChange={(e) => setWpm(Number(e.target.value))} className="w-20 accent-radio-cyan h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                    </div>
                    <div className="flex flex-col items-end">
                        <label className="text-[9px] text-radio-cyan/50 font-mono uppercase">FREQ</label>
                        <input type="range" min="400" max="1000" step="50" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} className="w-20 accent-radio-cyan h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 font-orbitron tracking-widest flex-1">INPUT MESSAGE</label>
                <button onClick={() => setText('')} className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-white transition-colors">
                    <RotateCcw className="w-3 h-3" /> CLEAR
                </button>
            </div>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="TYPE TACTICAL MESSAGE..."
                className="w-full h-32 bg-black/40 border border-radio-cyan/20 rounded-lg p-4 font-mono text-gray-200 focus:ring-1 focus:border-radio-cyan focus:ring-radio-cyan/50 outline-none resize-none uppercase placeholder:text-gray-700 mb-4"
            />

            <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 font-orbitron tracking-widest">TRANSMISSION SEQUENCE</label>
                <button onClick={() => navigator.clipboard.writeText(result)} className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-white transition-colors">
                    <Copy className="w-3 h-3" /> COPY
                </button>
            </div>

            <div className="flex-1 bg-black/60 border border-radio-cyan/10 rounded-lg p-4 font-mono text-xl tracking-widest leading-loose overflow-y-auto break-words shadow-inner text-radio-cyan/80 min-h-[100px]">
                {text.split('').map((char, index) => {
                    const code = MORSE_CODE[char.toUpperCase()];
                    return (
                        <span key={index} className={`transition-all duration-100 ${index === currentCharIndex ? 'text-white text-glow bg-radio-cyan/20 rounded px-1' : ''}`}>
                            {code ? code + ' ' : char}
                        </span>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-radio-cyan/20 flex justify-center">
                <button
                    onClick={playMorse}
                    className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold font-orbitron tracking-widest transition-all ${isPlaying
                            ? 'bg-radio-red hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                            : 'bg-radio-cyan hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        }`}
                >
                    {isPlaying ? <><Square className="w-5 h-5 fill-current" /> HALT</> : <><Play className="w-5 h-5 fill-current" /> TRANSMIT</>}
                </button>
            </div>
        </div>
    );
}
