import React, { useState, useEffect } from 'react';
import { Lock, RotateCcw, Copy, ArrowRightLeft, Unlock, Key } from 'lucide-react';

const CIPHERS = {
    CAESAR: {
        name: 'CAESAR',
        process: (text, shift = 3, decode = false) => {
            const s = decode ? (26 - (shift % 26)) : shift;
            return text.toUpperCase().replace(/[A-Z]/g, (c) =>
                String.fromCharCode(((c.charCodeAt(0) - 65 + s) % 26) + 65)
            );
        }
    },
    ATBASH: {
        name: 'ATBASH',
        process: (text) => {
            return text.toUpperCase().replace(/[A-Z]/g, (c) =>
                String.fromCharCode(90 - (c.charCodeAt(0) - 65))
            );
        }
    },
    SUBSTITUTION: {
        name: 'SUBSTITUTION',
        process: (text, key = 'ZEBRA', decode = false) => {
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const cleanKey = (key || 'ZEBRA').toUpperCase().replace(/[^A-Z]/g, '');
            const uniqueKey = Array.from(new Set(cleanKey.split(''))).join('');
            const remaining = alphabet.split('').filter(c => !uniqueKey.includes(c)).join('');
            const mixed = uniqueKey + remaining;

            const source = decode ? mixed : alphabet;
            const target = decode ? alphabet : mixed;

            return text.toUpperCase().replace(/[A-Z]/g, (c) => {
                const idx = source.indexOf(c);
                return idx !== -1 ? target[idx] : c;
            });
        }
    },
    PLAYFAIR: {
        name: 'PLAYFAIR',
        process: (text, key = 'KEYWORD', decode = false) => {
            let alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // No 'J'
            let cleanKey = (key || 'KEYWORD').toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
            let matrixArr = Array.from(new Set(cleanKey + alphabet));
            let matrix = [];
            for (let i = 0; i < 5; i++) matrix.push(matrixArr.slice(i * 5, i * 5 + 5));

            let input = text.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "");
            if (!decode) {
                let prepared = "";
                for (let i = 0; i < input.length; i++) {
                    prepared += input[i];
                    if (input[i] === input[i + 1]) prepared += "X";
                }
                if (prepared.length % 2 !== 0) prepared += "X";
                input = prepared;
            }

            let result = "";
            for (let i = 0; i < input.length; i += 2) {
                let a = input[i], b = input[i + 1];
                let rowA, colA, rowB, colB;
                for (let r = 0; r < 5; r++) {
                    for (let c = 0; c < 5; c++) {
                        if (matrix[r][c] === a) { rowA = r; colA = c; }
                        if (matrix[r][c] === b) { rowB = r; colB = c; }
                    }
                }

                if (rowA === rowB) {
                    let d = decode ? 4 : 1;
                    result += matrix[rowA][(colA + d) % 5] + matrix[rowB][(colB + d) % 5];
                } else if (colA === colB) {
                    let d = decode ? 4 : 1;
                    result += matrix[(rowA + d) % 5][colA] + matrix[(rowB + d) % 5][colB];
                } else {
                    result += matrix[rowA][colB] + matrix[rowB][colA];
                }
            }
            return result;
        }
    },
    TRANSPOSITION: {
        name: 'TRANSPOSITION',
        process: (text, key = 'SECRET', decode = false) => {
            let cleanKey = (key || 'SECRET').toUpperCase().replace(/[^A-Z]/g, '');
            if (!cleanKey) return text;
            let input = text.toUpperCase().replace(/[^A-Z]/g, '');
            let keyLen = cleanKey.length;
            let keyOrder = cleanKey.split('').map((char, i) => ({ char, i }))
                .sort((a, b) => a.char.localeCompare(b.char) || a.i - b.i)
                .map((obj, i) => ({ ...obj, order: i }));

            if (!decode) {
                let rows = Math.ceil(input.length / keyLen);
                let grid = Array.from({ length: rows }, () => Array(keyLen).fill('X'));
                for (let i = 0; i < input.length; i++) {
                    grid[Math.floor(i / keyLen)][i % keyLen] = input[i];
                }
                let result = "";
                keyOrder.sort((a, b) => a.order - b.order).forEach(k => {
                    for (let r = 0; r < rows; r++) result += grid[r][k.i];
                });
                return result;
            } else {
                let rows = Math.ceil(input.length / keyLen);
                let grid = Array.from({ length: rows }, () => Array(keyLen).fill(''));
                let cur = 0;
                keyOrder.sort((a, b) => a.order - b.order).forEach(k => {
                    for (let r = 0; r < rows; r++) grid[r][k.i] = input[cur++];
                });
                return grid.flat().join('');
            }
        }
    }
};

export default function CipherConverter() {
    const [text, setText] = useState('');
    const [result, setResult] = useState('');
    const [cipherType, setCipherType] = useState('CAESAR');
    const [shift, setShift] = useState(13);
    const [cipherKey, setCipherKey] = useState('TACTICAL');
    const [isDecoding, setIsDecoding] = useState(false);

    useEffect(() => {
        const algo = CIPHERS[cipherType];
        if (algo) {
            if (cipherType === 'CAESAR') setResult(algo.process(text, shift, isDecoding));
            else if (cipherType === 'ATBASH') setResult(algo.process(text));
            else if (cipherType === 'SUBSTITUTION') setResult(algo.process(text, cipherKey, isDecoding));
            else if (cipherType === 'PLAYFAIR') setResult(algo.process(text, cipherKey, isDecoding));
            else if (cipherType === 'TRANSPOSITION') setResult(algo.process(text, cipherKey, isDecoding));
        }
    }, [text, cipherType, shift, cipherKey, isDecoding]);

    return (
        <div className="panel-tactical h-full flex flex-col animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 border-b border-radio-amber/20 pb-2 gap-4">
                <div className="flex items-center gap-2 text-radio-amber">
                    <Lock className="w-5 h-5 animate-pulse-slow" />
                    <h2 className="text-lg font-bold font-orbitron tracking-wider text-glow">TACTICAL CIPHER CONVERTER</h2>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={cipherType}
                        onChange={(e) => setCipherType(e.target.value)}
                        className="bg-black/40 border border-radio-amber/30 rounded text-xs text-radio-amber font-mono p-1 outline-none"
                    >
                        <option value="CAESAR">CAESAR</option>
                        <option value="ATBASH">ATBASH</option>
                        <option value="SUBSTITUTION">SIMPLE SUBSTITUTION</option>
                        <option value="PLAYFAIR">PLAYFAIR</option>
                        <option value="TRANSPOSITION">TRANSPOSITION</option>
                    </select>

                    {cipherType === 'CAESAR' && (
                        <div className="flex flex-col items-center">
                            <label className="text-[8px] text-radio-amber/50 font-mono">SHIFT</label>
                            <input
                                type="number"
                                min="1" max="25"
                                value={shift}
                                onChange={(e) => setShift(Number(e.target.value))}
                                className="w-12 bg-black/40 border border-radio-amber/30 rounded text-xs text-center text-radio-amber"
                            />
                        </div>
                    )}

                    {(cipherType === 'SUBSTITUTION' || cipherType === 'PLAYFAIR' || cipherType === 'TRANSPOSITION') && (
                        <div className="flex flex-col items-center">
                            <label className="text-[8px] text-radio-amber/50 font-mono text-center">KEYWORD</label>
                            <input
                                type="text"
                                value={cipherKey}
                                onChange={(e) => setCipherKey(e.target.value.toUpperCase())}
                                placeholder="KEY"
                                className="w-24 bg-black/40 border border-radio-amber/30 rounded text-xs text-center text-radio-amber uppercase"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 font-orbitron tracking-widest flex-1">
                    {isDecoding ? 'CIPHERTEXT INPUT' : 'PLAINTEXT INPUT'}
                </label>
                <button
                    onClick={() => setIsDecoding(!isDecoding)}
                    className="flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold hover:bg-white/10 transition-colors text-radio-amber"
                >
                    {isDecoding ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    {isDecoding ? 'DECRYPT' : 'ENCRYPT'}
                </button>
                <button onClick={() => setText('')} className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-white transition-colors">
                    <RotateCcw className="w-3 h-3" /> CLEAR
                </button>
            </div>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="ENTER DATA..."
                className="w-full h-32 bg-black/40 border border-radio-amber/20 rounded-lg p-4 font-mono text-gray-200 focus:ring-1 focus:border-radio-amber focus:ring-radio-amber/50 outline-none resize-none uppercase placeholder:text-gray-700 mb-4"
            />

            <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 font-orbitron tracking-widest">
                    {isDecoding ? 'DECRYPTED OUTPUT' : 'ENCRYPTED OUTPUT'}
                </label>
                <button onClick={() => navigator.clipboard.writeText(result)} className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-white transition-colors">
                    <Copy className="w-3 h-3" /> COPY
                </button>
            </div>

            <div className="flex-1 bg-black/60 border border-radio-amber/10 rounded-lg p-4 font-mono text-xl tracking-widest leading-loose overflow-y-auto break-words shadow-inner text-radio-amber/80 min-h-[100px]">
                {result || <span className="text-gray-700 opacity-50 select-none">...</span>}
            </div>
        </div>
    );
}
