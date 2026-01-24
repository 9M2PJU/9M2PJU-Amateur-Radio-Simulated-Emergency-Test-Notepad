import React, { useState, useEffect, useRef } from 'react';
import { Send, Clock, Radio, Hash, MessageSquare, Trash2, Download } from 'lucide-react';

export default function TacticalLogger({ logs, setLogs, stationSettings }) {
    const [entry, setEntry] = useState({
        time: '',
        callsign: '',
        freq: '145.500',
        mode: 'FM',
        rstSent: '59',
        rstRcvd: '59',
        remarks: ''
    });

    const callsignInputRef = useRef(null);

    const exportToCSV = () => {
        if (logs.length === 0) {
            alert("No logs to export.");
            return;
        }
        const headers = ["Date", "Time", "Callsign", "Freq", "Mode", "RST_S", "RST_R", "Remarks", "Operator"];
        const csvContent = [
            headers.join(","),
            ...logs.map(log =>
                [log.date, log.time, log.callsign, log.freq, log.mode, log.rstSent, log.rstRcvd, `"${log.remarks}"`, log.operator].join(",")
            )
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `MYSET_LOG_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Auto-update time until manually edited
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setEntry(prev => {
                // Only update if callsign hasn't been started, or keep time current? 
                // Standard: Current time until Log button pressed? 
                // Better: Default to current time, but let user override.
                // Actually for a "Hot" logger, you want the time you click "Log" usually, 
                // OR the time you start typing? 
                // Let's just set default time on mount and update every minute if field is empty?
                // Simplest: Button "Now" next to time. 
                // For now, let's pre-fill with current time formatted HH:MM
                return prev.time ? prev : { ...prev, time: formatTime(now) };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kuala_Lumpur' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEntry(prev => ({ ...prev, [name]: value.toUpperCase() }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!entry.callsign) return;

        // Auto-append power status
        const powerTag = stationSettings.power === 'BATTERY' ? '[BATT]' : '[MAINS]';
        const finalRemarks = entry.remarks ? `${entry.remarks} ${powerTag}` : powerTag;

        const newLog = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            operator: stationSettings.callsign || 'MYSTATION',
            ...entry,
            remarks: finalRemarks,
            time: entry.time || formatTime(new Date()) // Ensure time is set
        };

        setLogs([newLog, ...logs]);

        // Reset for next contact
        setEntry(prev => ({
            ...prev,
            callsign: '',
            rstSent: '59',
            rstRcvd: '59',
            remarks: '',
            time: formatTime(new Date()) // Reset time to now
        }));

        // Focus back on callsign
        if (callsignInputRef.current) {
            callsignInputRef.current.focus();
        }
    };

    const deleteLog = (id) => {
        if (confirm('Delete this log entry?')) {
            setLogs(logs.filter(l => l.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            {/* Input Form */}
            <div className="panel-tactical border-l-4 border-l-radio-green">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">

                    <div className="md:col-span-2">
                        <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">Time</label>
                        <div className="relative">
                            <Clock className="w-4 h-4 absolute left-2 top-3 text-gray-500" />
                            <input
                                type="time"
                                name="time"
                                value={entry.time}
                                onChange={handleChange}
                                className="input-tactical pl-8"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <label className="text-xs uppercase text-radio-green font-bold block mb-1 font-orbitron tracking-wider text-glow">Callsign</label>
                        <input
                            ref={callsignInputRef}
                            type="text"
                            name="callsign"
                            value={entry.callsign}
                            onChange={handleChange}
                            placeholder="Target Call"
                            className="input-tactical text-xl font-bold uppercase tracking-wider border-radio-green/50 focus:ring-radio-green focus:border-radio-green bg-radio-green/10 text-white placeholder:text-gray-500"
                            autoComplete="off"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">Freq (MHz)</label>
                        <input
                            type="text"
                            name="freq"
                            value={entry.freq}
                            onChange={handleChange}
                            className="input-tactical"
                            list="freqs"
                        />
                        <datalist id="freqs">
                            <option value="145.500">V50 (National Calling)</option>
                            <option value="145.000">V00</option>
                            <option value="433.500">UHF Calling</option>
                        </datalist>
                    </div>

                    <div className="md:col-span-1">
                        <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">Mode</label>
                        <select
                            name="mode"
                            value={entry.mode}
                            onChange={handleChange}
                            className="input-tactical"
                        >
                            <option value="FM">FM</option>
                            <option value="AM">AM</option>
                            <option value="USB">USB</option>
                            <option value="LSB">LSB</option>
                            <option value="CW">CW</option>
                            <option value="DIG">DIG</option>
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">RST S</label>
                        <input
                            type="text"
                            name="rstSent"
                            value={entry.rstSent}
                            onChange={handleChange}
                            className="input-tactical text-center"
                        />
                    </div>

                    <div className="md:col-span-1">
                        <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">RST R</label>
                        <input
                            type="text"
                            name="rstRcvd"
                            value={entry.rstRcvd}
                            onChange={handleChange}
                            className="input-tactical text-center"
                        />
                    </div>

                    <div className="md:col-span-3 flex gap-2">
                        <div className="flex-grow">
                            <label className="text-xs uppercase text-gray-400 font-bold block mb-1 font-orbitron tracking-wider">Remarks</label>
                            <input
                                type="text"
                                name="remarks"
                                value={entry.remarks}
                                onChange={handleChange}
                                placeholder="Message / Name"
                                className="input-tactical"
                            />
                        </div>
                        <button type="submit" className="bg-radio-green/90 hover:bg-radio-green text-black font-bold px-4 py-2 rounded h-[42px] mt-auto flex items-center shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Log Table */}
            <div className="overflow-x-auto rounded-lg border border-white/10 shadow-lg">
                <div className="flex justify-between items-center bg-tactical-surface/50 backdrop-blur p-2 border-b border-white/5">
                    <h3 className="text-sm font-bold uppercase text-gray-400 pl-2 font-orbitron tracking-wider">Recent Contacts</h3>
                    <button onClick={exportToCSV} className="text-xs bg-white/5 hover:bg-white/10 text-radio-cyan border border-white/10 px-3 py-1 rounded flex items-center gap-1 transition-colors uppercase font-bold tracking-wider">
                        <Download className="w-3 h-3" /> Export CSV
                    </button>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-black/40 text-gray-400 uppercase text-xs font-bold font-orbitron">
                        <tr>
                            <th className="p-3">Time</th>
                            <th className="p-3">Callsign</th>
                            <th className="p-3">Freq</th>
                            <th className="p-3">Mode</th>
                            <th className="p-3">RST</th>
                            <th className="p-3">Remarks</th>
                            <th className="p-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-black/20 backdrop-blur-sm">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-gray-500 italic font-mono">No contacts logged yet. Start calling CQ!</td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-3 font-mono text-radio-amber">{log.time}</td>
                                    <td className="p-3 font-bold text-white tracking-wide font-mono group-hover:text-radio-cyan transition-colors">{log.callsign}</td>
                                    <td className="p-3 text-gray-400 font-mono">{log.freq}</td>
                                    <td className="p-3 text-xs text-gray-500 font-mono">{log.mode}</td>
                                    <td className="p-3 font-mono text-gray-300">{log.rstSent} / {log.rstRcvd}</td>
                                    <td className="p-3 text-gray-300">{log.remarks}</td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => deleteLog(log.id)}
                                            className="text-gray-600 hover:text-radio-red transition-colors p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
