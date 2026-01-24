import React, { useState } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { FileText, Copy, Download, Trash, Printer } from 'lucide-react';

export default function ICS213Form({ stationSettings, onAddToLog }) {
    const [form, setForm] = useState({
        incident: 'SET-2026',
        priority: 'ROUTINE', // EMERGENCY, PRIORITY, ROUTINE, WELFARE
        toName: '',
        toPos: '',
        fromName: stationSettings.callsign || '',
        fromPos: 'OPERATOR',
        subject: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kuala_Lumpur' }),
        message: '',
        approvedName: '',
        approvedPos: '',
        txFreq: '145.500',
        txMode: 'FM'
    });

    const [savedMessages, setSavedMessages] = useLocalStorage('ics213_outbox', []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value.toUpperCase() }));
    };

    const generateText = () => {
        return `
ICS - 213 MESSAGE
---------------
    Incident: ${form.incident}
    Priority: ${form.priority}
To: ${form.toName} (${form.toPos})
From: ${form.fromName} (${form.fromPos})
Subject: ${form.subject}
Date / Time: ${form.date} ${form.time}

Message:
${form.message}

Approved By: ${form.approvedName} (${form.approvedPos})
`.trim();
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateText());
        alert('Message copied to clipboard!');
    };

    const saveMessage = () => {
        const msg = { ...form, id: Date.now() };
        setSavedMessages([msg, ...savedMessages]);

        // Auto-add to Tactical Logger
        if (onAddToLog) {
            onAddToLog({
                id: Date.now(),
                date: form.date,
                time: form.time,
                callsign: form.toName || 'STATION', // Use To Name as callsign if available
                freq: form.txFreq || 'MSG', // Use entered freq or default
                mode: form.txMode || 'ICS213',
                rstSent: '59',
                rstRcvd: '59',
                remarks: `[${form.priority}] ${form.subject} ${stationSettings.power === 'BATTERY' ? '[BATT]' : '[MAINS]'}`,
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

    const generatePreviewText = (data) => {
        return `
ICS - 213 MESSAGE
---------------
    Incident: ${data.incident}
    Priority: ${data.priority}
To: ${data.toName} (${data.toPos})
From: ${data.fromName} (${data.fromPos})
Subject: ${data.subject}
Date / Time: ${data.date} ${data.time}

Message:
${data.message}

Approved By: ${data.approvedName} (${data.approvedPos})
`.trim();
    };

    const handlePrint = (msg) => {
        const printWindow = window.open('', '_blank');
        const text = generatePreviewText(msg);

        printWindow.document.write(`
            <html>
                <head>
                    <title>ICS-213 Message - ${msg.incident}</title>
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
                    <h1>ICS-213 RADIO MESSAGE</h1>
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
                            <div className="bg-black p-4 rounded border border-gray-800 text-radio-amber whitespace-pre-wrap">
                                {generatePreviewText(viewMsg)}
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
                                    navigator.clipboard.writeText(generatePreviewText(viewMsg));
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

            {/* The Form */}
            <div className="panel-tactical">
                <div className="flex items-center gap-2 mb-4 text-radio-amber">
                    <FileText className="w-6 h-6" />
                    <h2 className="font-bold uppercase tracking-wider">ICS-213 General Message</h2>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">1. Incident Name</label>
                            <input name="incident" value={form.incident} onChange={handleChange} className="input-tactical" />
                        </div>
                        <div>
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">Priority</label>
                            <select
                                name="priority"
                                value={form.priority}
                                onChange={handleChange}
                                className={`input-tactical font-bold ${form.priority === 'EMERGENCY' ? 'text-radio-red border-radio-red' :
                                    form.priority === 'PRIORITY' ? 'text-radio-amber border-radio-amber' :
                                        'text-radio-cyan'
                                    }`}
                            >
                                <option value="ROUTINE">ROUTINE</option>
                                <option value="PRIORITY">PRIORITY</option>
                                <option value="EMERGENCY">EMERGENCY</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">2. To (CALLSIGN/NAME)</label>
                            <input name="toName" value={form.toName} onChange={handleChange} className="input-tactical" />
                        </div>
                        <div>
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">Position</label>
                            <input name="toPos" value={form.toPos} onChange={handleChange} className="input-tactical" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">3. From (CALLSIGN/NAME)</label>
                            <input name="fromName" value={form.fromName} onChange={handleChange} className="input-tactical" />
                        </div>
                        <div>
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">Position</label>
                            <input name="fromPos" value={form.fromPos} onChange={handleChange} className="input-tactical" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">4. Subject</label>
                        <input name="subject" value={form.subject} onChange={handleChange} className="input-tactical" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">5. Date</label>
                            <input type="date" name="date" value={form.date} onChange={handleChange} className="input-tactical" />
                        </div>
                        <div>
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">Time</label>
                            <input type="time" name="time" value={form.time} onChange={handleChange} className="input-tactical" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">6. Message</label>
                        <textarea
                            rows="6"
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            placeholder="E.g.: UPDATE ON FLOOD STATUS. WATER LEVEL RISING AT SUNGAI BATU. REQUESTING LOGISTICS SUPPORT AT EVACUATION CENTER A."
                            className="input-tactical font-mono text-sm placeholder:text-gray-600 uppercase"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">7. Approved By</label>
                            <input name="approvedName" value={form.approvedName} onChange={handleChange} className="input-tactical" />
                        </div>
                        <div>
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">Position</label>
                            <input name="approvedPos" value={form.approvedPos} onChange={handleChange} className="input-tactical" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-700 mb-4">
                        <div>
                            <label className="text-xs uppercase text-radio-green font-bold block mb-1 font-orbitron tracking-wider">Tx Freq (MHz)</label>
                            <input name="txFreq" value={form.txFreq} onChange={handleChange} className="input-tactical" placeholder="145.500" />
                        </div>
                        <div>
                            <label className="text-xs uppercase text-radio-green font-bold block mb-1 font-orbitron tracking-wider">Tx Mode</label>
                            <select name="txMode" value={form.txMode} onChange={handleChange} className="input-tactical">
                                <option value="FM">FM</option>
                                <option value="AM">AM</option>
                                <option value="USB">USB</option>
                                <option value="LSB">LSB</option>
                                <option value="CW">CW</option>
                                <option value="DIG">DIG</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button onClick={saveMessage} className="flex-1 btn-tactical border-radio-green/50 text-radio-green hover:bg-radio-green hover:text-black">
                            Save to Outbox
                        </button>
                        <button onClick={copyToClipboard} className="flex-1 btn-tactical text-white hover:bg-white/10 flex items-center justify-center gap-2">
                            <Copy className="w-4 h-4" /> Copy Text
                        </button>
                    </div>
                </div>
            </div>

            {/* Outbox / Preview */}
            <div className="space-y-6">
                <div className="panel-tactical bg-slate-900 border-dashed">
                    <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">Message Preview (Text Format)</h3>
                    <pre className="text-xs font-mono text-radio-amber whitespace-pre-wrap bg-black p-4 rounded border border-gray-800">
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
                                            {msg.priority === 'EMERGENCY' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${msg.priority === 'EMERGENCY' ? 'bg-red-900/50 text-red-400 border border-red-900' :
                                                msg.priority === 'PRIORITY' ? 'bg-amber-900/50 text-amber-400 border border-amber-900' :
                                                    'bg-gray-800 text-gray-400 border border-gray-700'
                                                }`}>{msg.priority}</span>
                                            <span className="text-radio-green font-bold text-sm tracking-tight">{msg.incident}</span>
                                        </div>
                                        <span className="text-xs text-gray-500 font-mono">{msg.date} {msg.time}</span>
                                    </div>

                                    <div className="font-bold text-sm text-white mb-1">{msg.subject}</div>
                                    <div className="text-xs text-gray-400 mb-3 flex items-center justify-between">
                                        <span>To: {msg.toName}</span>
                                        <span>From: {msg.fromName}</span>
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
