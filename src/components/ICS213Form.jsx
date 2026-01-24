import React, { useState } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { FileText, Copy, Download, Trash } from 'lucide-react';

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
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        message: '',
        approvedName: '',
        approvedPos: ''
    });

    const [savedMessages, setSavedMessages] = useLocalStorage('ics213_outbox', []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
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
                freq: 'MSG', // Indicate it's a message
                mode: 'ICS213',
                rstSent: '59',
                rstRcvd: '59',
                remarks: `[${form.priority}] ${form.subject}`,
                operator: stationSettings.callsign || 'OP'
            });
        }

        alert('Message saved to Outbox and added to Tactical Logger.');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* The Form */}
            <div className="panel-tactical">
                <div className="flex items-center gap-2 mb-4 text-radio-amber">
                    <FileText className="w-6 h-6" />
                    <h2 className="font-bold uppercase tracking-wider">ICS-213 General Message</h2>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1">1. Incident Name</label>
                            <input name="incident" value={form.incident} onChange={handleChange} className="input-tactical" />
                        </div>
                        <div>
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1">Priority</label>
                            <select
                                name="priority"
                                value={form.priority}
                                onChange={handleChange}
                                className={`input-tactical font-bold ${form.priority === 'EMERGENCY' ? 'text-red-500 border-red-500' :
                                        form.priority === 'PRIORITY' ? 'text-amber-500 border-amber-500' :
                                            'text-white'
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
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1">2. To (Name)</label>
                            <input name="toName" value={form.toName} onChange={handleChange} className="input-tactical" />
                        </div>
                        <div>
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1">Position</label>
                            <input name="toPos" value={form.toPos} onChange={handleChange} className="input-tactical" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1">3. From (Name)</label>
                            <input name="fromName" value={form.fromName} onChange={handleChange} className="input-tactical" />
                        </div>
                        <div>
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1">Position</label>
                            <input name="fromPos" value={form.fromPos} onChange={handleChange} className="input-tactical" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs uppercase text-gray-400 font-bold block mb-1">4. Subject</label>
                        <input name="subject" value={form.subject} onChange={handleChange} className="input-tactical" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1">5. Date</label>
                            <input type="date" name="date" value={form.date} onChange={handleChange} className="input-tactical" />
                        </div>
                        <div>
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1">Time</label>
                            <input type="time" name="time" value={form.time} onChange={handleChange} className="input-tactical" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs uppercase text-gray-400 font-bold block mb-1">6. Message</label>
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
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1">7. Approved By</label>
                            <input name="approvedName" value={form.approvedName} onChange={handleChange} className="input-tactical" />
                        </div>
                        <div>
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1">Position</label>
                            <input name="approvedPos" value={form.approvedPos} onChange={handleChange} className="input-tactical" />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button onClick={saveMessage} className="flex-1 bg-radio-green text-black font-bold py-2 rounded hover:bg-green-600 transition-colors">
                            Save to Outbox
                        </button>
                        <button onClick={copyToClipboard} className="flex-1 bg-tactical-highlight text-white font-bold py-2 rounded hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
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
                                <div key={msg.id} className="bg-slate-900 p-3 rounded border border-gray-700">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-radio-green font-bold text-sm">{msg.incident}</span>
                                        <span className="text-xs text-gray-500">{msg.date} {msg.time}</span>
                                    </div>
                                    <div className="font-bold text-sm text-white mb-1">{msg.subject}</div>
                                    <div className="text-xs text-gray-400 mb-2">To: {msg.toName} | From: {msg.fromName}</div>
                                    <p className="text-xs text-gray-500 line-clamp-2">{msg.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
