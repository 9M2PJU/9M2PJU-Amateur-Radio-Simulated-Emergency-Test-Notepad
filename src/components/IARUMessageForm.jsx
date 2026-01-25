import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { FileText, Copy, Trash, Printer } from 'lucide-react';

export default function IARUMessageForm({ stationSettings, onAddToLog }) {
    const [useUTC, setUseUTC] = useState(true);
    const [form, setForm] = useState({
        number: '1',
        precedence: 'R', // R, P, O, Z (Routine, Priority, Immediate, Flash) - keeping simplified for now
        stationOfOrigin: stationSettings.callsign || '',
        check: '0',
        placeOfOrigin: stationSettings.grid || '',
        filingTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kuala_Lumpur' }).replace(':', '') + 'Z', // default to Z logic later (manual for now)
        filingDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase(),
        to: '',
        specialInstructions: '',
        message: '',
        from: '', // signature
        // Operator Use
        recvdFrom: '',
        recvdDate: '',
        recvdTime: '',
        sentTo: '',
        sentDate: '',
        sentTime: ''
    });

    const [savedMessages, setSavedMessages] = useLocalStorage('iaru_outbox', []);

    // Auto update word count
    useEffect(() => {
        if (form.message) {
            const count = form.message.trim().split(/\s+/).filter(w => w.length > 0).length;
            setForm(prev => ({ ...prev, check: count.toString() }));
        } else {
            setForm(prev => ({ ...prev, check: '0' }));
        }
    }, [form.message]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value.toUpperCase() }));
    };

    const generateText = (data = form) => {
        return `
IARU Message

Priority: ${getPriorityLabel(data.precedence)}
Message # ${data.number}
Station of Origin: ${data.stationOfOrigin}
Word Count: ${data.check}
Place of Origin: ${data.placeOfOrigin}
Date ${data.filingDate} and Time: ${data.filingTime}

Special Delivery Instructions:
${data.specialInstructions}

DELIVER TO:
${data.to}

MESSAGE:
${data.message}

From: ${data.from}
For radio operator use only:

RECEIVED
FROM: ${data.recvdFrom}  
DATE: ${data.recvdDate} TIME: ${data.recvdTime}

SENT
TO: ${data.sentTo}  
DATE: ${data.sentDate} TIME: ${data.sentTime}
Sent free by Amateur Radio Operator: ${stationSettings.callsign || '9M2PJU'}
`.trim();
    };

    const getPriorityLabel = (code) => {
        switch (code) {
            case 'E': return '[Emergency]';
            case 'P': return '[Priority]';
            case 'R': return '[Routine]';
            default: return `[${code}]`;
        }
    };

    const saveMessage = () => {
        const msg = { ...form, id: Date.now() };
        setSavedMessages([msg, ...savedMessages]);

        // Auto-add to Tactical Logger
        if (onAddToLog) {
            onAddToLog({
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                callsign: data.to ? data.to.split('\n')[0] : 'STATION',
                freq: 'MSG',
                mode: 'RADIOGRAM',
                rstSent: '59',
                rstRcvd: '59',
                remarks: `NR ${form.number} ${form.precedence} TO ${form.to?.substring(0, 10)}...`,
                operator: stationSettings.callsign || 'OP'
            });
        }

        alert('Message saved to Outbox and added to Tactical Logger.');
    };

    const [viewMsg, setViewMsg] = useState(null);

    const deleteMessage = (id) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            setSavedMessages(prev => prev.filter(msg => msg.id !== id));
            if (viewMsg && viewMsg.id === id) setViewMsg(null);
        }
    };

    const handlePrint = (msg) => {
        const printWindow = window.open('', '_blank');
        const text = generateText(msg);

        printWindow.document.write(`
            <html>
                <head>
                    <title>IARU Message - ${msg.number}</title>
                    <style>
                        body { font-family: monospace; font-size: 14px; padding: 40px; }
                        h1 { font-family: sans-serif; font-size: 18px; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 5px; }
                        pre { white-space: pre-wrap; background: #f5f5f5; padding: 20px; border: 1px solid #ddd; }
                        .footer { margin-top: 30px; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 5px; }
                        @media print {
                            body { padding: 0; }
                            pre { border: none; background: none; padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <h1>IARU RADIOGRAM</h1>
                    <pre>${text}</pre>
                    <div class="footer">Printed from MySET Notepad on ${new Date().toLocaleString()}</div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Styling helpers to match the classic form look but in TACTICAL DARK MODE
    const labelStyle = "text-[10px] font-bold text-radio-amber uppercase block text-center bg-transparent tracking-wider font-orbitron";
    const inputStyle = "w-full bg-black/30 border-none text-radio-cyan font-mono font-bold text-center focus:ring-1 focus:ring-radio-cyan rounded-sm placeholder-gray-700";
    const sectionBorder = "border-radio-cyan/30";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">

            {/* Message Viewer Modal */}
            {viewMsg && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setViewMsg(null)}>
                    <div className="bg-tactical-surface border border-tactical-highlight rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-slate-900/50 rounded-t-lg">
                            <h3 className="font-bold text-white uppercase flex items-center gap-2">
                                <FileText className="w-5 h-5 text-radio-amber" />
                                Message Viewer
                            </h3>
                            <button onClick={() => setViewMsg(null)} className="text-gray-400 hover:text-white transition-colors">
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 font-mono text-sm">
                            <div className="bg-black p-4 rounded text-radio-amber whitespace-pre-wrap border border-radio-amber/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                {generateText(viewMsg)}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-700 bg-slate-900/50 rounded-b-lg flex gap-3">
                            <button
                                onClick={() => handlePrint(viewMsg)}
                                className="flex-1 bg-tactical-surface border border-tactical-highlight text-white hover:bg-slate-700 font-bold py-2 rounded transition-colors flex items-center justify-center gap-2"
                            >
                                <Printer className="w-4 h-4" /> Print
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(generateText(viewMsg));
                                    alert('Copied to clipboard!');
                                }}
                                className="flex-1 bg-tactical-highlight text-white font-bold py-2 rounded hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Copy className="w-4 h-4" /> Copy Text
                            </button>
                            <button
                                onClick={() => deleteMessage(viewMsg.id)}
                                className="px-4 bg-red-900/50 text-red-200 font-bold py-2 rounded hover:bg-red-900 transition-colors border border-red-900 flex items-center justify-center gap-2"
                            >
                                <Trash className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* The IARU FORM */}
            <div className="bg-tactical-surface text-gray-100 font-sans shadow-[0_0_30px_rgba(6,182,212,0.1)] relative overflow-hidden border border-radio-cyan/20 rounded-lg">
                {/* Header Strip */}
                <div className="bg-radio-amber/10 border-b-2 border-radio-amber/50 p-2 flex justify-center items-center relative">
                    <h2 className="text-2xl font-bold italic tracking-[0.2em] text-radio-amber font-orbitron drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">IARU MESSAGE</h2>
                    <span className="absolute right-2 text-[10px] italic text-radio-amber/70 font-mono tracking-widest">INTERNATIONAL</span>
                </div>

                {/* Header Grid */}
                <div className={`grid grid-cols-7 border-b border-radio-cyan/30 text-center divide-x divide-radio-cyan/30`}>
                    <div className="col-span-1 p-1">
                        <label className={labelStyle}>NUMBER</label>
                        <input name="number" value={form.number} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div className="col-span-1 p-1">
                        <label className={labelStyle}>PRECEDENCE</label>
                        <select
                            name="precedence"
                            value={form.precedence}
                            onChange={handleChange}
                            className={`${inputStyle} appearance-none bg-black/30 text-radio-cyan`}
                        >
                            <option value="R">ROUTINE</option>
                            <option value="P">PRIORITY</option>
                            <option value="E">EMERGENCY</option>
                        </select>
                    </div>
                    <div className="col-span-1 p-1">
                        <label className={labelStyle}>STATION OF ORIGIN</label>
                        <input name="stationOfOrigin" value={form.stationOfOrigin} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div className="col-span-1 p-1">
                        <label className={labelStyle}>WORD COUNT</label>
                        <input name="check" value={form.check} readOnly className={`${inputStyle} bg-white/5 text-gray-400 cursor-not-allowed`} />
                    </div>
                    <div className="col-span-2 p-1">
                        <label className={labelStyle}>PLACE OF ORIGIN</label>
                        <input name="placeOfOrigin" value={form.placeOfOrigin} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div className="col-span-1 grid grid-rows-2 divide-y divide-radio-cyan/30 relative group">
                        <button
                            onClick={() => {
                                const newMode = !useUTC;
                                setUseUTC(newMode);
                                const now = new Date();
                                const timeStr = newMode
                                    ? now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).replace(':', '') + 'Z'
                                    : now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kuala_Lumpur' }).replace(':', '') + 'L';
                                setForm(prev => ({ ...prev, filingTime: timeStr }));
                            }}
                            className="absolute -right-6 top-1/2 -translate-y-1/2 bg-radio-cyan/20 hover:bg-radio-cyan/40 text-[8px] text-radio-cyan border border-radio-cyan/50 rounded px-1 transition-colors z-10"
                            title="Toggle UTC/Local Time"
                        >
                            {useUTC ? 'UTC' : 'LOC'}
                        </button>
                        <div className="flex flex-col p-0.5">
                            <label className="text-[8px] font-bold uppercase text-radio-amber/70 font-orbitron">FILING TIME</label>
                            <input name="filingTime" value={form.filingTime} onChange={handleChange} className="w-full text-xs font-mono text-center outline-none bg-transparent text-radio-cyan" />
                        </div>
                        <div className="flex flex-col p-0.5">
                            <label className="text-[8px] font-bold uppercase text-radio-amber/70 font-orbitron">FILING DATE</label>
                            <input name="filingDate" value={form.filingDate} onChange={handleChange} className="w-full text-xs font-mono text-center outline-none bg-transparent text-radio-cyan" />
                        </div>
                    </div>
                </div>

                {/* TO Section */}
                <div className={`relative border-b border-radio-cyan/30 p-2 bg-black/10`}>
                    <label className="text-xs font-bold uppercase absolute top-1 left-2 text-radio-amber font-orbitron">TO:</label>
                    <textarea
                        name="to"
                        value={form.to}
                        onChange={handleChange}
                        className="w-full mt-4 h-24 p-2 bg-black/30 border border-radio-cyan/20 rounded resize-none font-mono text-lg uppercase text-white focus:border-radio-cyan/50 focus:ring-1 focus:ring-radio-cyan/50 outline-none"
                    />
                </div>

                {/* Special Instructions */}
                <div className={`border-b border-radio-cyan/30 bg-tactical-highlight p-1 flex items-center`}>
                    <label className="text-[10px] font-bold italic mr-2 whitespace-nowrap text-gray-400 font-orbitron">SPECIAL DELIVERY INSTRUCTIONS</label>
                    <input
                        name="specialInstructions"
                        value={form.specialInstructions}
                        onChange={handleChange}
                        placeholder="OPTIONAL INFORMATION"
                        className="w-full bg-black/20 border border-gray-700 rounded px-2 py-0.5 text-sm uppercase text-gray-300 placeholder-gray-600 focus:border-radio-cyan/50 outline-none"
                    />
                </div>

                {/* Message Body */}
                <div className={`relative border-b border-radio-cyan/30 p-2 bg-black/20`}>
                    <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={8}
                        className="w-full p-2 bg-black/30 border border-radio-cyan/20 rounded resize-none font-mono text-lg uppercase leading-relaxed text-radio-green focus:border-radio-green/50 focus:ring-1 focus:ring-radio-green/50 outline-none shadow-inner"
                    />
                </div>

                {/* From / Signature */}
                <div className={`border-b border-radio-cyan/30 p-2 flex items-center bg-black/10`}>
                    <label className="text-xs font-bold uppercase mr-2 text-radio-amber font-orbitron">FROM:</label>
                    <input
                        name="from"
                        value={form.from}
                        onChange={handleChange}
                        className="flex-1 bg-black/30 border border-radio-cyan/20 rounded px-2 py-1 uppercase font-bold text-radio-cyan font-mono focus:border-radio-cyan/50 outline-none"
                    />
                </div>

                {/* Operator Use */}
                <div className="p-1">
                    <label className="text-[10px] font-bold block mb-1 text-gray-500 font-orbitron tracking-wider">RADIO OPERATOR USE:</label>
                    <div className={`grid grid-cols-2 gap-0 border border-radio-cyan/30 rounded overflow-hidden`}>
                        <div className={`grid grid-cols-3 divide-x divide-radio-cyan/30 border-r border-radio-cyan/30`}>
                            <div className="col-span-1 p-1 text-center bg-black/20">
                                <label className="text-[8px] block text-gray-500 font-bold">RECVD FROM</label>
                                <input name="recvdFrom" value={form.recvdFrom} onChange={handleChange} className="w-full text-center font-mono text-xs uppercase bg-transparent text-white outline-none" />
                            </div>
                            <div className="col-span-1 p-1 text-center bg-black/20">
                                <label className="text-[8px] block text-gray-500 font-bold">DATE</label>
                                <input name="recvdDate" value={form.recvdDate} onChange={handleChange} className="w-full text-center font-mono text-xs uppercase bg-transparent text-white outline-none" />
                            </div>
                            <div className="col-span-1 p-1 text-center bg-black/20">
                                <label className="text-[8px] block text-gray-500 font-bold">TIME</label>
                                <input name="recvdTime" value={form.recvdTime} onChange={handleChange} className="w-full text-center font-mono text-xs uppercase bg-transparent text-white outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 divide-x divide-radio-cyan/30">
                            <div className="col-span-1 p-1 text-center bg-black/20">
                                <label className="text-[8px] block text-gray-500 font-bold">SENT TO</label>
                                <input name="sentTo" value={form.sentTo} onChange={handleChange} className="w-full text-center font-mono text-xs uppercase bg-transparent text-white outline-none" />
                            </div>
                            <div className="col-span-1 p-1 text-center bg-black/20">
                                <label className="text-[8px] block text-gray-500 font-bold">DATE</label>
                                <input name="sentDate" value={form.sentDate} onChange={handleChange} className="w-full text-center font-mono text-xs uppercase bg-transparent text-white outline-none" />
                            </div>
                            <div className="col-span-1 p-1 text-center bg-black/20">
                                <label className="text-[8px] block text-gray-500 font-bold">TIME</label>
                                <input name="sentTime" value={form.sentTime} onChange={handleChange} className="w-full text-center font-mono text-xs uppercase bg-transparent text-white outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className={`p-4 bg-black/20 border-t border-radio-cyan/30 flex justify-between items-center`}>
                    <div className="flex gap-2">
                        <button onClick={saveMessage} className="bg-radio-green hover:bg-emerald-600 text-black font-bold py-1 px-4 rounded shadow-[0_0_10px_rgba(16,185,129,0.4)] font-orbitron tracking-wider transition-all">
                            SUBMIT
                        </button>
                        <button onClick={() => setForm({ ...form, message: '', to: '', from: '' })} className="bg-transparent hover:bg-white/5 text-radio-cyan font-bold py-1 px-4 rounded border border-radio-cyan/50 font-orbitron tracking-wider transition-all">
                            RESET
                        </button>
                    </div>
                    <div className="text-[10px] text-gray-600 italic font-mono">
                        System Ready
                    </div>
                </div>
            </div>

            {/* Outbox / Preview */}
            <div className="space-y-6">
                <div className="panel-tactical bg-slate-900 border-dashed">
                    <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">Message Preview (Radiogram Format)</h3>
                    <pre className="text-xs font-mono text-radio-amber whitespace-pre-wrap bg-black p-4 rounded border border-gray-800 leading-normal">
                        {generateText()}
                    </pre>
                </div>

                {savedMessages.length > 0 && (
                    <div className="panel-tactical">
                        <h3 className="font-bold uppercase text-white mb-4">Outbox ({savedMessages.length})</h3>
                        <div className="space-y-3">
                            {savedMessages.map(msg => (
                                <div key={msg.id} className="bg-slate-900 p-3 rounded border border-gray-700 hover:border-gray-500 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${msg.precedence === 'O' || msg.precedence === 'Z' ? 'bg-red-900/50 text-red-400 border border-red-900' :
                                                msg.precedence === 'P' ? 'bg-amber-900/50 text-amber-400 border border-amber-900' :
                                                    'bg-gray-800 text-gray-400 border border-gray-700'
                                                }`}>{msg.precedence}</span>
                                            <span className="text-radio-green font-bold text-sm tracking-tight">NR {msg.number}</span>
                                        </div>
                                        <span className="text-xs text-gray-500 font-mono">{msg.filingDate} {msg.filingTime}</span>
                                    </div>

                                    <div className="font-bold text-sm text-white mb-1 truncate">{msg.message?.substring(0, 50)}...</div>
                                    <div className="text-xs text-gray-400 mb-3 flex items-center justify-between">
                                        <span className="truncate max-w-[120px]">To: {msg.to?.split('\n')[0]}</span>
                                        <span>From: {msg.from}</span>
                                    </div>

                                    <div className="flex gap-2 pt-2 border-t border-gray-800">
                                        <button
                                            onClick={() => setViewMsg(msg)}
                                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs text-white py-1.5 rounded transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <FileText className="w-3 h-3" /> View
                                        </button>
                                        <button
                                            onClick={() => deleteMessage(msg.id)}
                                            className="px-3 bg-slate-900 hover:bg-red-900/30 text-xs text-gray-400 hover:text-red-400 py-1.5 rounded transition-colors"
                                            title="Delete Message"
                                        >
                                            <Trash className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
