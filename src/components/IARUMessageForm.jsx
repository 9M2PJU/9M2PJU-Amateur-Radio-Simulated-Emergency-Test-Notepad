import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { FileText, Copy, Trash, Printer, FileDown, Mail } from 'lucide-react';
import { jsPDF } from "jspdf";

export default function IARUMessageForm({ stationSettings, onAddToLog }) {
    const { effectiveUser } = useAuth();
    // ... (rest of state definitions same as before)
    const [useUTC, setUseUTC] = useState(true);
    const [isAutoTime, setIsAutoTime] = useState(true);
    const [txDetails, setTxDetails] = useState({ freq: '145.500', mode: 'FM' });

    const [form, setForm] = useState({
        number: '1',
        precedence: 'R', // R, P, O, Z (Routine, Priority, Immediate, Flash) - keeping simplified for now
        stationOfOrigin: stationSettings.callsign || '',
        check: '0',
        placeOfOrigin: stationSettings.grid || '',
        filingTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).replace(/:/g, '') + 'Z',
        filingDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
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


    const [savedMessages, setSavedMessages] = useState([]);

    useEffect(() => {
        if (effectiveUser) {
            fetchMessages();
        } else {
            setSavedMessages([]);
        }
    }, [effectiveUser]);

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('user_id', effectiveUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSavedMessages(data);

            // Auto-calculate next message number
            if (data && data.length > 0) {
                const maxNum = data.reduce((max, msg) => {
                    const num = parseInt(msg.number);
                    return !isNaN(num) && num > max ? num : max;
                }, 0);
                setForm(prev => ({ ...prev, number: (maxNum + 1).toString() }));
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Realtime Filing Time Sync (hh:mm only)
    useEffect(() => {
        if (!isAutoTime) return;

        const updateTime = () => {
            const now = new Date();
            const timeStr = useUTC
                ? now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).replace(/:/g, '') + 'Z'
                : now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kuala_Lumpur' }).replace(/:/g, '') + 'L';

            setForm(prev => {
                if (prev.filingTime === timeStr) return prev;
                return { ...prev, filingTime: timeStr };
            });
        };

        const timer = setInterval(updateTime, 1000);
        updateTime();

        return () => clearInterval(timer);
    }, [isAutoTime, useUTC]);

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
        if (name === 'filingTime') setIsAutoTime(false);
        setForm(prev => ({ ...prev, [name]: value.toUpperCase() }));
    };

    const normalizeMessage = (data) => {
        return {
            number: data.number,
            precedence: data.precedence,
            stationOfOrigin: data.stationOfOrigin || data.station_of_origin || '',
            check: data.check || data.check_count || '0',
            placeOfOrigin: data.placeOfOrigin || data.place_of_origin || '',
            filingDate: data.filingDate || data.filing_date || '',
            filingTime: data.filingTime || data.filing_time || '',
            to: data.to || data.to_field || '',
            specialInstructions: data.specialInstructions || data.special_instructions || '',
            message: data.message || data.message_body || '',
            from: data.from || data.from_field || '',
            recvdFrom: data.recvdFrom || data.recvd_from || '',
            recvdDate: data.recvdDate || data.recvd_date || '',
            recvdTime: data.recvdTime || data.recvd_time || '',
            sentTo: data.sentTo || data.sent_to || '',
            sentDate: data.sentDate || data.sent_date || '',
            sentTime: data.sentTime || data.sent_time || ''
        };
    };

    const generateText = (inputData = form) => {
        const data = normalizeMessage(inputData);
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
Sent by Amateur Radio Operator: ${stationSettings.callsign || '9M2PJU'}
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

    const saveMessage = async () => {
        if (!effectiveUser) {
            alert("Please login to save messages.");
            return;
        }

        try {
            const msgData = {
                user_id: effectiveUser.id,
                number: form.number,
                precedence: form.precedence,
                station_of_origin: form.stationOfOrigin,
                check_count: form.check,
                place_of_origin: form.placeOfOrigin,
                filing_time: form.filingTime,
                filing_date: form.filingDate,
                to_field: form.to,
                special_instructions: form.specialInstructions,
                message_body: form.message,
                from_field: form.from,
                recvd_from: form.recvdFrom,
                recvd_date: form.recvdDate,
                recvd_time: form.recvdTime,
                sent_to: form.sentTo,
                sent_date: form.sentDate,
                sent_time: form.sentTime,
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('messages')
                .insert([msgData])
                .select()
                .single();

            if (error) throw error;

            setSavedMessages([data, ...savedMessages]);

            // Auto-add to Tactical Logger
            if (onAddToLog) {
                onAddToLog({
                    id: Date.now(), // Temporarily ID until logger acts
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                    callsign: form.to ? form.to.split('\n')[0] : 'STATION',
                    freq: txDetails.freq || '145.500',
                    mode: txDetails.mode || 'FM',
                    rstSent: '59',
                    rstRcvd: '59',
                    remarks: `NR ${form.number} ${form.precedence} TO ${form.to?.substring(0, 10)}...`,
                    operator: stationSettings.callsign || 'OP'
                });
            }

            alert('Message saved to Outbox and added to Tactical Logger.');

            // Auto-increment number for next message
            const nextNum = (parseInt(form.number) + 1).toString();
            setForm(prev => ({
                ...prev,
                number: nextNum,
                check: '0',
                message: '',
                specialInstructions: ''
            }));

        } catch (error) {
            console.error("Error saving message:", error);
            alert("Failed to save message.");
        }
    };

    const [viewMsg, setViewMsg] = useState(null);

    const deleteMessage = async (id) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                const { error } = await supabase
                    .from('messages')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setSavedMessages(prev => prev.filter(msg => msg.id !== id));
                if (viewMsg && viewMsg.id === id) setViewMsg(null);
            } catch (error) {
                console.error("Error deleting message:", error);
                alert("Failed to delete message.");
            }
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
                    <div class="footer">Printed from 9M2PJU SET Pad on ${new Date().toLocaleString()}</div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleExportPDF = async (msg) => {
        const doc = new jsPDF();

        const loadImage = (src) => new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });

        try {
            // Header
            try {
                const logo = await loadImage('favicon.png');
                doc.addImage(logo, 'PNG', 15, 10, 15, 15);
            } catch (e) {
                console.warn("Could not load logo for PDF");
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.setTextColor(6, 182, 212); // Brand Cyan
            doc.text("9M2PJU SET Pad", 35, 20);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text("SIMULATED EMERGENCY TEST NOTEPAD", 35, 26);

            doc.setDrawColor(200);
            doc.setLineWidth(0.5);
            doc.line(15, 32, 195, 32);

            // Message Content
            doc.setFont("courier", "bold");
            doc.setFontSize(16);
            doc.setTextColor(0);
            const contentStartY = 45;
            doc.text("IARU RADIOGRAM", 20, contentStartY);

            const lines = doc.splitTextToSize(generateText(msg), 170);
            doc.setFont("courier", "normal");
            doc.setFontSize(11);
            doc.text(lines, 20, contentStartY + 10);

            // Footer
            const pageHeight = doc.internal.pageSize.height;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(128);
            doc.text("9M2PJU SET Pad // Made for Malaysia by 9M2PJU", 105, pageHeight - 10, { align: "center" });

            doc.save(`IARU_MSG_${msg.number}_${msg.filingDate}.pdf`);
        } catch (error) {
            console.error("PDF Generation Error", error);
            alert("Failed to generate PDF");
        }
    };

    // Styling helpers to match the classic form look but in TACTICAL DARK MODE
    const labelStyle = "text-[9px] font-bold text-radio-amber uppercase block text-center bg-transparent tracking-wide font-orbitron";
    const inputStyle = "w-full bg-black/30 border-none text-radio-cyan font-mono font-bold text-center focus:ring-1 focus:ring-radio-cyan rounded-sm placeholder-radio-amber/30";
    const sectionBorder = "border-radio-cyan/30";

    return (
        <div className="flex flex-col lg:flex-row gap-6 relative h-full min-h-0">

            {/* Message Viewer Modal */}
            {viewMsg && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={() => setViewMsg(null)}>
                    <div className="bg-tactical-surface border border-tactical-highlight rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-radio-amber/20 bg-slate-900/50 rounded-t-lg">
                            <h3 className="font-bold text-white uppercase flex items-center gap-2">
                                <FileText className="w-5 h-5 text-radio-amber" />
                                Message Viewer
                            </h3>
                            <button onClick={() => setViewMsg(null)} className="text-radio-amber/60 hover:text-white transition-colors">
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 font-mono text-sm">
                            <div className="bg-black p-4 rounded text-radio-amber whitespace-pre-wrap border border-radio-amber/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                {generateText(viewMsg)}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-700 bg-slate-900/50 rounded-b-lg flex gap-3 flex-wrap">
                            <button
                                onClick={() => handlePrint(viewMsg)}
                                className="flex-1 bg-tactical-surface border border-tactical-highlight text-white hover:bg-slate-700 font-bold py-2 rounded transition-colors flex items-center justify-center gap-2 text-xs md:text-sm"
                            >
                                <Printer className="w-4 h-4" /> Print
                            </button>
                            <button
                                onClick={() => handleExportPDF(viewMsg)}
                                className="flex-1 bg-radio-cyan/10 border border-radio-cyan/50 text-radio-cyan hover:bg-radio-cyan/20 font-bold py-2 rounded transition-colors flex items-center justify-center gap-2 text-xs md:text-sm"
                            >
                                <FileDown className="w-4 h-4" /> PDF
                            </button>
                            <button
                                onClick={() => {
                                    const subject = encodeURIComponent(`IARU RADIOGRAM NR ${viewMsg.number}`);
                                    const body = encodeURIComponent(generateText(viewMsg));
                                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                                }}
                                className="flex-1 bg-radio-green/10 border border-radio-green/50 text-radio-green hover:bg-radio-green/20 font-bold py-2 rounded transition-colors flex items-center justify-center gap-2 text-xs md:text-sm"
                            >
                                <Mail className="w-4 h-4" /> Email
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(generateText(viewMsg));
                                    alert('Copied to clipboard!');
                                }}
                                className="flex-1 bg-tactical-highlight text-white font-bold py-2 rounded hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-xs md:text-sm"
                            >
                                <Copy className="w-4 h-4" /> Copy
                            </button>
                            <button
                                onClick={() => deleteMessage(viewMsg.id)}
                                className="px-4 bg-red-900/50 text-red-200 font-bold py-2 rounded hover:bg-red-900 transition-colors border border-red-900 flex items-center justify-center gap-2 text-xs md:text-sm"
                            >
                                <Trash className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* The IARU FORM */}
            <div className="flex-1 flex flex-col min-h-0 bg-tactical-surface text-radio-amber font-sans shadow-[0_0_30px_rgba(163,184,108,0.1)] relative overflow-hidden border border-radio-cyan/20 rounded-lg">
                <div className="overflow-y-auto custom-scrollbar flex-1 flex flex-col">
                    {/* Header Strip */}
                    <div className="flex-none bg-radio-amber/10 border-b-2 border-radio-amber/50 p-2 flex flex-col sm:flex-row justify-center items-center relative gap-1">
                        <h2 className="text-xl sm:text-2xl font-bold italic tracking-[0.2em] text-radio-amber font-orbitron drop-shadow-[0_0_5px_rgba(245,158,11,0.5)] text-center">IARU MESSAGE</h2>
                        <span className="sm:absolute sm:right-2 text-[9px] sm:text-[10px] italic text-radio-amber/70 font-mono tracking-widest bg-radio-amber/5 px-1 rounded">INTERNATIONAL</span>
                    </div>

                    {/* Header Grid */}
                    <div className={`flex-none grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 border-b border-radio-cyan/30 text-center divide-x divide-y sm:divide-y-0 divide-radio-cyan/30`}>
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
                        <div className="col-span-2 sm:col-span-2 md:col-span-2 p-1">
                            <label className={labelStyle}>PLACE OF ORIGIN</label>
                            <input name="placeOfOrigin" value={form.placeOfOrigin} onChange={handleChange} className={inputStyle} />
                        </div>
                        <div className="col-span-2 sm:col-span-2 md:col-span-1 grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 divide-x md:divide-x-0 md:divide-y divide-radio-cyan/30 relative group">
                            <div className="flex flex-col p-1 h-full items-center justify-between">
                                <label className="text-[8px] font-bold uppercase text-radio-amber/70 font-orbitron mb-1">FILING TIME</label>
                                <div className="flex items-center gap-1 w-full justify-center">
                                    <input name="filingTime" value={form.filingTime} onChange={handleChange} className="w-16 text-xs font-mono text-center outline-none bg-transparent text-radio-cyan" />
                                    <button
                                        onClick={() => {
                                            const newMode = !useUTC;
                                            setUseUTC(newMode);
                                            setIsAutoTime(true);
                                            const now = new Date();
                                            const timeStr = newMode
                                                ? now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).replace(/:/g, '') + 'Z'
                                                : now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kuala_Lumpur' }).replace(/:/g, '') + 'L';
                                            setForm(prev => ({ ...prev, filingTime: timeStr }));
                                        }}
                                        className="text-[7px] text-radio-cyan/70 hover:text-radio-cyan border border-radio-cyan/30 hover:border-radio-cyan rounded px-1 py-0 transition-colors uppercase font-bold"
                                        title="Toggle UTC/Local"
                                    >
                                        {useUTC ? 'U' : 'L'}
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col p-1 h-full items-center justify-between">
                                <label className="text-[8px] font-bold uppercase text-radio-amber/70 font-orbitron mb-1">FILING DATE</label>
                                <input name="filingDate" value={form.filingDate} onChange={handleChange} className="w-full text-[10px] md:text-xs font-mono text-center outline-none bg-transparent text-radio-cyan" />
                            </div>
                        </div>
                    </div>

                    {/* TO Section */}
                    <div className={`flex-none relative border-b border-radio-cyan/30 p-1 bg-black/10`}>
                        <label className="text-[10px] font-bold uppercase absolute top-1 left-2 text-radio-amber font-orbitron">TO:</label>
                        <textarea
                            name="to"
                            value={form.to}
                            onChange={handleChange}
                            className="w-full mt-4 h-16 p-1 bg-black/30 border border-radio-cyan/20 rounded resize-none font-mono text-base uppercase text-white focus:border-radio-cyan/50 focus:ring-1 focus:ring-radio-cyan/50 outline-none leading-tight"
                        />
                    </div>

                    {/* Special Instructions */}
                    <div className={`flex-none border-b border-radio-cyan/30 bg-tactical-highlight p-1 flex flex-col sm:flex-row items-start sm:items-center`}>
                        <label className="text-[9px] sm:text-[10px] font-bold italic mb-1 sm:mb-0 sm:mr-2 whitespace-nowrap text-gray-400 font-orbitron">SPECIAL DELIVERY INSTRUCTIONS</label>
                        <input
                            name="specialInstructions"
                            value={form.specialInstructions}
                            onChange={handleChange}
                            placeholder="OPTIONAL INFORMATION"
                            className="w-full bg-black/20 border border-gray-700 rounded px-2 py-1 text-xs sm:text-sm uppercase text-gray-300 placeholder-gray-600 focus:border-radio-cyan/50 outline-none"
                        />
                    </div>

                    {/* Message Body - FLEX GROW */}
                    <div className={`flex-1 relative border-b border-radio-cyan/30 p-1 bg-black/20 flex flex-col`}>
                        <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            className="w-full flex-1 p-2 bg-black/30 border border-radio-cyan/20 rounded resize-none font-mono text-base uppercase leading-snug text-radio-green focus:border-radio-green/50 focus:ring-1 focus:ring-radio-green/50 outline-none shadow-inner"
                        />
                    </div>

                    {/* From / Signature */}
                    <div className={`flex-none border-b border-radio-cyan/30 p-2 flex items-center bg-black/10`}>
                        <label className="text-xs font-bold uppercase mr-2 text-radio-amber font-orbitron">FROM:</label>
                        <input
                            name="from"
                            value={form.from}
                            onChange={handleChange}
                            className="flex-1 bg-black/30 border border-radio-cyan/20 rounded px-2 py-1 uppercase font-bold text-radio-cyan font-mono focus:border-radio-cyan/50 outline-none"
                        />
                    </div>

                    {/* Operator Use */}
                    <div className="flex-none p-1">
                        <label className="text-[10px] font-bold block mb-1 text-gray-500 font-orbitron tracking-wider">RADIO OPERATOR USE:</label>
                        <div className={`flex flex-col sm:grid sm:grid-cols-2 gap-0 border border-radio-cyan/30 rounded overflow-hidden`}>
                            <div className={`grid grid-cols-3 divide-x divide-radio-cyan/30 border-b sm:border-b-0 sm:border-r border-radio-cyan/30`}>
                                <div className="col-span-1 p-1 text-center bg-black/20">
                                    <label className="text-[7px] md:text-[8px] block text-gray-500 font-bold leading-none mb-1">RECVD FROM</label>
                                    <input name="recvdFrom" value={form.recvdFrom} onChange={handleChange} className="w-full text-center font-mono text-[10px] md:text-xs uppercase bg-transparent text-white outline-none" placeholder="..." />
                                </div>
                                <div className="col-span-1 p-1 text-center bg-black/20">
                                    <label className="text-[7px] md:text-[8px] block text-gray-500 font-bold leading-none mb-1">DATE</label>
                                    <input name="recvdDate" value={form.recvdDate} onChange={handleChange} className="w-full text-center font-mono text-[10px] md:text-xs uppercase bg-transparent text-white outline-none" placeholder="..." />
                                </div>
                                <div className="col-span-1 p-1 text-center bg-black/20">
                                    <label className="text-[7px] md:text-[8px] block text-gray-500 font-bold leading-none mb-1">TIME</label>
                                    <input name="recvdTime" value={form.recvdTime} onChange={handleChange} className="w-full text-center font-mono text-[10px] md:text-xs uppercase bg-transparent text-white outline-none" placeholder="..." />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 divide-x divide-radio-cyan/30">
                                <div className="col-span-1 p-1 text-center bg-black/20">
                                    <label className="text-[7px] md:text-[8px] block text-gray-500 font-bold leading-none mb-1">SENT TO</label>
                                    <input name="sentTo" value={form.sentTo} onChange={handleChange} className="w-full text-center font-mono text-[10px] md:text-xs uppercase bg-transparent text-white outline-none" placeholder="..." />
                                </div>
                                <div className="col-span-1 p-1 text-center bg-black/20">
                                    <label className="text-[7px] md:text-[8px] block text-gray-500 font-bold leading-none mb-1">DATE</label>
                                    <input name="sentDate" value={form.sentDate} onChange={handleChange} className="w-full text-center font-mono text-[10px] md:text-xs uppercase bg-transparent text-white outline-none" placeholder="..." />
                                </div>
                                <div className="col-span-1 p-1 text-center bg-black/20">
                                    <label className="text-[7px] md:text-[8px] block text-gray-500 font-bold leading-none mb-1">TIME</label>
                                    <input name="sentTime" value={form.sentTime} onChange={handleChange} className="w-full text-center font-mono text-[10px] md:text-xs uppercase bg-transparent text-white outline-none" placeholder="..." />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Custom Transmission Inputs */}
                <div className="p-2 bg-black/10 border-t border-radio-cyan/30 grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-[9px] font-bold text-radio-amber uppercase block mb-1 font-orbitron">Freq (MHz)</label>
                        <input
                            value={txDetails.freq}
                            onChange={e => setTxDetails({ ...txDetails, freq: e.target.value.toUpperCase() })}
                            className="w-full bg-black/30 border border-radio-cyan/20 rounded px-2 py-1 text-xs font-mono text-radio-cyan focus:border-radio-cyan/50 outline-none" placeholder="145.500"
                        />
                    </div>
                    <div>
                        <label className="text-[9px] font-bold text-radio-amber uppercase block mb-1 font-orbitron">Mode</label>
                        <input
                            value={txDetails.mode}
                            onChange={e => setTxDetails({ ...txDetails, mode: e.target.value.toUpperCase() })}
                            className="w-full bg-black/30 border border-radio-cyan/20 rounded px-2 py-1 text-xs font-mono text-radio-cyan focus:border-radio-cyan/50 outline-none" placeholder="FM"
                        />
                    </div>
                </div>

                {/* Footer Controls */}
                <div className={`p-4 bg-black/20 border-t border-radio-cyan/30 flex flex-col sm:flex-row justify-between items-center bg-tactical-surface gap-3`}>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={saveMessage} className="flex-1 sm:flex-none bg-radio-green hover:bg-emerald-600 text-black font-bold py-2 px-6 rounded shadow-[0_0_10px_rgba(77,124,15,0.4)] font-orbitron tracking-wider transition-all text-sm">
                            SUBMIT
                        </button>
                        <button onClick={() => setForm({ ...form, message: '', to: '', from: '' })} className="flex-1 sm:flex-none bg-transparent hover:bg-white/5 text-radio-cyan font-bold py-2 px-6 rounded border border-radio-cyan/50 font-orbitron tracking-wider transition-all text-sm">
                            RESET
                        </button>
                    </div>
                    <div className="text-[10px] text-gray-600 italic font-mono self-end sm:self-center">
                        System Ready
                    </div>
                </div>
            </div>

            {/* Right Panel (Side Panel) - Maximized Vertical Space */}
            <div className="flex flex-col gap-6 flex-1 min-h-0 mt-4 lg:mt-0">
                <div className="bg-black/40 border border-white/10 rounded-lg p-4 shadow-lg flex flex-col flex-1 h-full min-h-0">
                    <h3 className="text-sm font-bold text-gray-400 mb-2 font-orbitron uppercase tracking-widest border-b border-gray-700 pb-2">Message Preview (Radiogram Format)</h3>
                    <div className="font-mono text-xs text-radio-amber whitespace-pre-wrap overflow-y-auto flex-1 custom-scrollbar leading-relaxed p-2 bg-black/20 rounded border border-white/5">
                        {generateText(form)}
                    </div>
                </div>

                <div className="panel-tactical p-4 flex flex-col gap-2 shrink-0">
                    <h4 className="text-[10px] font-bold text-radio-cyan font-orbitron mb-2 uppercase tracking-widest">Saved Outbox ({savedMessages.length})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {savedMessages.length === 0 && <div className="text-xs text-gray-600 italic text-center py-4">No messages in outbox.</div>}
                        {savedMessages.map(msg => (
                            <div key={msg.id} className="bg-black/40 border border-white/10 p-2 rounded flex justify-between items-center hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setViewMsg(msg)}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-1 rounded border ${msg.precedence === 'E' ? 'border-red-500 text-red-500' : clsPriority(msg.precedence)}`}>{msg.precedence}</span>
                                        <span className="text-xs font-bold text-radio-cyan">NR {msg.number}</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400">TO: {msg.to?.split('\n')[0].substring(0, 15)}</div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[9px] text-gray-600">{msg.filingTime}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }} className="text-red-500 hover:text-red-400 p-1"><Trash className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper for priority color 
const clsPriority = (p) => {
    if (p === 'P') return 'border-orange-500 text-orange-500';
    if (p === 'E') return 'border-red-500 text-red-500';
    return 'border-radio-cyan/50 text-radio-cyan/70';
};


