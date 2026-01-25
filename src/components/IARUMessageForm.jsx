import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { FileText, Copy, Trash, Printer } from 'lucide-react';

export default function IARUMessageForm({ stationSettings, onAddToLog }) {
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
NR ${data.number} ${data.precedence} ${data.stationOfOrigin} ${data.check} ${data.placeOfOrigin} ${data.filingTime} ${data.filingDate}
TO: ${data.to}

${data.message}

SIG: ${data.from}
`.trim();
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

    // Styling helpers to match the classic form look
    const labelStyle = "text-[10px] font-bold text-black uppercase block text-center bg-transparent";
    const inputStyle = "w-full bg-white/50 border-none text-black font-mono font-bold text-center focus:ring-1 focus:ring-blue-500 rounded-sm";
    const sectionBorder = "border border-black";

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
                            <div className="bg-orange-100 p-4 rounded text-black whitespace-pre-wrap border-2 border-black">
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
            <div className="bg-white text-black font-sans shadow-2xl relative overflow-hidden">
                {/* Header Strip */}
                <div className="bg-orange-200 border-2 border-black p-1 flex justify-center items-center relative">
                    <h2 className="text-2xl font-bold italic tracking-wider text-black">IARU MESSAGE</h2>
                    <span className="absolute right-2 text-xs italic">International</span>
                </div>

                {/* Header Grid */}
                <div className="grid grid-cols-7 border-x-2 border-b-2 border-black text-center divide-x-2 divide-black">
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
                            className={`${inputStyle} appearance-none bg-green-100`}
                        >
                            <option value="R">ROUTINE</option>
                            <option value="P">PRIORITY</option>
                            <option value="O">IMMEDIATE</option>
                            <option value="Z">FLASH</option>
                        </select>
                    </div>
                    <div className="col-span-1 p-1">
                        <label className={labelStyle}>STATION OF ORIGIN</label>
                        <input name="stationOfOrigin" value={form.stationOfOrigin} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div className="col-span-1 p-1">
                        <label className={labelStyle}>WORD COUNT</label>
                        <input name="check" value={form.check} readOnly className={`${inputStyle} bg-gray-100 cursor-not-allowed`} />
                    </div>
                    <div className="col-span-2 p-1">
                        <label className={labelStyle}>PLACE OF ORIGIN</label>
                        <input name="placeOfOrigin" value={form.placeOfOrigin} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div className="col-span-1 grid grid-rows-2 divide-y divide-black">
                        <div className="flex flex-col p-0.5">
                            <label className="text-[8px] font-bold uppercase">FILING TIME</label>
                            <input name="filingTime" value={form.filingTime} onChange={handleChange} className="w-full text-xs font-mono text-center outline-none bg-transparent" />
                        </div>
                        <div className="flex flex-col p-0.5">
                            <label className="text-[8px] font-bold uppercase">FILING DATE</label>
                            <input name="filingDate" value={form.filingDate} onChange={handleChange} className="w-full text-xs font-mono text-center outline-none bg-transparent" />
                        </div>
                    </div>
                </div>

                {/* TO Section */}
                <div className="relative border-x-2 border-b-2 border-black p-2 bg-white">
                    <label className="text-xs font-bold uppercase absolute top-1 left-2">TO:</label>
                    <textarea
                        name="to"
                        value={form.to}
                        onChange={handleChange}
                        className="w-full mt-4 h-24 p-2 bg-blue-50/50 border border-blue-200 rounded resize-none font-mono text-lg uppercase"
                    />
                </div>

                {/* Special Instructions */}
                <div className="border-x-2 border-b-2 border-black bg-gray-300 p-1 flex items-center">
                    <label className="text-xs font-bold italic mr-2 whitespace-nowrap">Special Delivery Instructions</label>
                    <input
                        name="specialInstructions"
                        value={form.specialInstructions}
                        onChange={handleChange}
                        placeholder="OPTIONAL INFORMATION"
                        className="w-full bg-white border border-blue-300 rounded px-2 py-0.5 text-sm uppercase"
                    />
                </div>

                {/* Message Body */}
                <div className="relative border-x-2 border-b-2 border-black p-2 bg-green-50">
                    <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={8}
                        className="w-full p-2 bg-white border border-gray-300 rounded resize-none font-mono text-lg uppercase leading-relaxed"
                    />
                </div>

                {/* From / Signature */}
                <div className="border-x-2 border-b-2 border-black p-2 flex items-center bg-white">
                    <label className="text-xs font-bold uppercase mr-2">FROM:</label>
                    <input
                        name="from"
                        value={form.from}
                        onChange={handleChange}
                        className="flex-1 bg-blue-50 border border-blue-200 rounded px-2 py-1 uppercase font-bold"
                    />
                </div>

                {/* Operator Use */}
                <div className="border-x-2 border-b-2 border-black p-1">
                    <label className="text-xs font-bold block mb-1">Radio operator use:</label>
                    <div className="grid grid-cols-2 gap-0 border border-black">
                        <div className="grid grid-cols-3 divide-x divide-black border-r border-black">
                            <div className="col-span-1 p-1 text-center">
                                <label className="text-[8px] block text-gray-500">RECEIVED FROM</label>
                                <input name="recvdFrom" value={form.recvdFrom} onChange={handleChange} className="w-full text-center font-mono text-xs uppercase bg-blue-50 rounded" />
                            </div>
                            <div className="col-span-1 p-1 text-center">
                                <label className="text-[8px] block text-gray-500">DATE</label>
                                <input name="recvdDate" value={form.recvdDate} onChange={handleChange} className="w-full text-center font-mono text-xs uppercase bg-blue-50 rounded" />
                            </div>
                            <div className="col-span-1 p-1 text-center">
                                <label className="text-[8px] block text-gray-500">TIME</label>
                                <input name="recvdTime" value={form.recvdTime} onChange={handleChange} className="w-full text-center font-mono text-xs uppercase bg-blue-50 rounded" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 divide-x divide-black">
                            <div className="col-span-1 p-1 text-center">
                                <label className="text-[8px] block text-gray-500">SENT TO</label>
                                <input name="sentTo" value={form.sentTo} onChange={handleChange} className="w-full text-center font-mono text-xs uppercase bg-blue-50 rounded" />
                            </div>
                            <div className="col-span-1 p-1 text-center">
                                <label className="text-[8px] block text-gray-500">DATE</label>
                                <input name="sentDate" value={form.sentDate} onChange={handleChange} className="w-full text-center font-mono text-xs uppercase bg-blue-50 rounded" />
                            </div>
                            <div className="col-span-1 p-1 text-center">
                                <label className="text-[8px] block text-gray-500">TIME</label>
                                <input name="sentTime" value={form.sentTime} onChange={handleChange} className="w-full text-center font-mono text-xs uppercase bg-blue-50 rounded" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-white border-x-2 border-b-2 border-black flex justify-between items-center">
                    <div className="flex gap-2">
                        <button onClick={saveMessage} className="bg-green-700 hover:bg-green-800 text-white font-bold py-1 px-4 rounded shadow">
                            Submit
                        </button>
                        <button onClick={() => setForm({ ...form, message: '', to: '', from: '' })} className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-1 px-4 rounded border border-blue-300 shadow-sm">
                            Reset Form
                        </button>
                    </div>
                    <div className="text-[10px] text-red-800 italic">
                        Express Ver 43.2 (Original credits to OE3VRW) - Remade by 9M2PJU
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
