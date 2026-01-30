import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../utils/useLocalStorage';
import { supabase } from '../lib/supabase';
import StationSettings from '../components/StationSettings';
import TacticalLogger from '../components/TacticalLogger';
import IARUMessageForm from '../components/IARUMessageForm';
import MorseConverter from '../components/MorseConverter';
import CipherConverter from '../components/CipherConverter';
import TimeWidget from '../components/TimeWidget';
import CursorTrail from '../components/CursorTrail';
import DonationModal from '../components/DonationModal';
import { Radio, List, Settings, FileText, AudioWaveform, Lock, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { logout, profile, impersonatedUser, effectiveUser } = useAuth();
    const [theme, setTheme] = useLocalStorage('theme', 'dark'); // 'dark' or 'light'

    // Logic to sync station settings with profile will be handled inside components or via specific effect later
    // For now we keep local storage for settings as a cache/fallback or UI state
    const [stationSettings, setStationSettings] = useLocalStorage('stationSettings', {
        callsign: '',
        grid: '',
        power: 'BATTERY'
    });

    // Effect to populate station settings from Profile on load
    // Effect to populate station settings from Profile on load OR when effectiveUser changes (Impersonation)
    useEffect(() => {
        const syncProfile = async () => {
            if (!effectiveUser) return;

            // If checking own profile, we might use context 'profile', but for code simplicity and impersonation support,
            // let's fetch the fresh profile for ANY effectiveUser ID.
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', effectiveUser.id)
                    .single();

                if (data) {
                    setStationSettings(prev => ({
                        ...prev,
                        callsign: data.callsign || prev.callsign || '',
                        grid: data.grid || prev.grid || ''
                    }));
                }
            } catch (err) {
                console.error("Error syncing profile:", err);
            }
        };

        syncProfile();
    }, [effectiveUser]);

    const [logs, setLogs] = useState([]);

    useEffect(() => {
        if (effectiveUser) {
            fetchLogs();
        } else {
            setLogs([]);
        }
    }, [effectiveUser]);

    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase
                .from('logs')
                .select('*')
                .eq('user_id', effectiveUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLogs(data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    const handleAddLog = async (logData) => {
        if (!effectiveUser) return;

        // Prepare data for DB
        const dbData = {
            user_id: effectiveUser.id,
            date: logData.date,
            time: logData.time,
            callsign: logData.callsign,
            freq: logData.freq,
            mode: logData.mode,
            rst_sent: logData.rstSent || logData.rst_sent,
            rst_rcvd: logData.rstRcvd || logData.rst_rcvd,
            remarks: logData.remarks,
            operator: logData.operator
        };

        try {
            const { data, error } = await supabase
                .from('logs')
                .insert([dbData])
                .select()
                .single();

            if (error) throw error;
            setLogs(prev => [data, ...prev]);
        } catch (error) {
            console.error("Error adding log:", error);
            alert("Failed to add log entry.");
        }
    };

    const handleUpdateLog = async (logData) => {
        if (!effectiveUser) return;

        const dbData = {
            date: logData.date,
            time: logData.time,
            callsign: logData.callsign,
            freq: logData.freq,
            mode: logData.mode,
            rst_sent: logData.rstSent || logData.rst_sent,
            rst_rcvd: logData.rstRcvd || logData.rst_rcvd,
            remarks: logData.remarks,
        };

        try {
            const { error } = await supabase
                .from('logs')
                .update(dbData)
                .eq('id', logData.id);

            if (error) throw error;
            setLogs(prev => prev.map(l => l.id === logData.id ? { ...l, ...logData } : l));
        } catch (error) {
            console.error("Error updating log:", error);
            alert("Failed to update log entry.");
        }
    };

    const handleDeleteLog = async (id) => {
        try {
            const { error } = await supabase.from('logs').delete().eq('id', id);
            if (error) throw error;
            setLogs(prev => prev.filter(l => l.id !== id));
        } catch (error) {
            console.error("Error deleting log:", error);
            alert("Failed to delete log.");
        }
    };

    const handleSaveProfile = async (newSettings) => {
        if (!effectiveUser) return;

        try {
            const updates = {
                id: effectiveUser.id,
                callsign: newSettings.callsign,
                grid: newSettings.grid,
                updated_at: new Date()
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
            alert("Profile updated successfully on cloud.");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert(`Failed to update profile: ${error.message}`);
        }
    };

    const [activeTab, setActiveTab] = useState('iaru'); // 'iaru', 'logger', 'settings'
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallModal, setShowInstallModal] = useState(false);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            // ...
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        // Install logic placeholder
        setShowInstallModal(false);
    };

    const [showDonationModal, setShowDonationModal] = useState(false);
    const [systemConfig, setSystemConfig] = useState({});
    useEffect(() => {
        const fetchSystemConfig = async () => {
            try {
                // Fetch frequency specifically
                const { data, error } = await supabase
                    .from('system_config')
                    .select('value')
                    .eq('key', 'donation_popup_frequency')
                    .single();

                if (error && error.code !== 'PGRST116') throw error;

                if (data?.value) {
                    setSystemConfig(data.value); // { minutes: 60 }
                }
            } catch (error) {
                console.error('Error fetching system config:', error);
            }
        };

        fetchSystemConfig();
    }, []);

    useEffect(() => {
        // PERMISSION CHECK:
        // 1. Must have a profile loaded
        // 2. Must not be in the VIP list (Hardcoded safety)
        // 3. Must have show_donation = true in DB

        if (!profile) return;

        console.log("Donation Check: Profile loaded:", profile.email);
        console.log("Donation Check: show_donation flag:", profile.show_donation);

        const vipEmails = ['9m2pju@hamradio.my'];
        if (vipEmails.includes(profile.email)) {
            console.log("Donation Check: User is VIP. Skipping.");
            return;
        }

        if (profile.show_donation === false) {
            console.log("Donation Check: User has toggled OFF donations. Skipping.");
            return;
        }

        // FREQUENCY CHECK
        const frequencyMinutes = systemConfig.minutes || 60; // Default 60 mins from config or fallback
        const frequencyMs = frequencyMinutes * 60 * 1000;

        const lastDismissed = localStorage.getItem('lastDonationDismissed');
        const now = Date.now();

        console.log(`Donation Check: Frequency is ${frequencyMinutes} mins. Last seen: ${lastDismissed}`);

        if (!lastDismissed || (now - parseInt(lastDismissed, 10) > frequencyMs)) {
            console.log("Donation Check: Showing modal (Threshold passed or never seen).");
            // Small delay for better UX
            const timer = setTimeout(() => {
                setShowDonationModal(true);
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            const timeLeft = frequencyMs - (now - parseInt(lastDismissed, 10));
            console.log(`Donation Check: Too soon. Waiting another ${Math.ceil(timeLeft / 1000 / 60)} mins.`);
        }
    }, [profile, systemConfig]); // Check when profile OR config loads

    const handleCloseDonation = () => {
        setShowDonationModal(false);
        localStorage.setItem('lastDonationDismissed', Date.now().toString());
    };

    const handleAddToLog = (msg) => {
        setLogs(prevLogs => [msg, ...prevLogs]);
    };

    return (
        <div className={`flex flex-col lg:flex-row h-[100dvh] text-radio-amber font-inter overflow-hidden bg-cover bg-center selection:bg-radio-cyan selection:text-black ${theme === 'light' ? 'light-mode text-slate-900' : ''}`}
            style={{ backgroundImage: theme === 'light' ? "none" : "url('https://images.unsplash.com/photo-1595878715977-2a8f8d0c0cdd?q=80&w=2670&auto=format&fit=crop')" }}>

            {/* Camo Pattern Overlay for Dark Mode */}
            {theme === 'dark' && <div className="absolute inset-0 bg-tactical-bg/85 z-0 mix-blend-multiply"></div>}

            {/* Light Mode Plain Background (Sand) */}
            {theme === 'light' && <div className="absolute inset-0 bg-tactical-bg z-0"></div>}

            {/* Impersonation Banner */}
            {impersonatedUser && (
                <div className="absolute top-0 left-0 right-0 z-[100] bg-red-600/90 text-white text-xs font-bold font-mono text-center p-1 animate-pulse">
                    ⚠ VIEWING AS: {impersonatedUser} ⚠
                </div>
            )}

            {/* PWA Install Modal */}
            {showInstallModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="panel-tactical max-w-sm w-full text-center space-y-4 border-radio-cyan animate-in zoom-in-95 duration-300">
                        <Radio className="w-12 h-12 text-radio-cyan mx-auto animate-pulse" />
                        <h3 className="text-xl font-bold font-orbitron text-glow">COMMUNICATION LINK</h3>
                        <p className="text-sm text-radio-amber/60 font-mono">Install MySET Digital Notepad for offline tactical access and native performance.</p>
                        <div className="flex gap-3 pt-2">
                            <button onClick={handleInstall} className="btn-tactical flex-1 py-3 text-sm">INSTALL SYSTEM</button>
                            <button onClick={() => { setShowInstallModal(false); localStorage.setItem('lastInstallPrompt', Date.now().toString()); }}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-radio-amber/60 py-3 rounded-md text-xs font-bold uppercase tracking-widest transition-all">DISMISS</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Donation Modal */}
            {showDonationModal && <DonationModal onClose={handleCloseDonation} />}

            {/* Sidebar for Desktop (xl+) */}
            <aside className="hidden lg:flex flex-col w-72 bg-tactical-surface/40 backdrop-blur-2xl border-r border-white/5 z-20 relative overflow-hidden">
                <div className="p-6 border-b border-white/5 space-y-4">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <img src="dares-logo.png" alt="DARES Logo" className="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
                        <div>
                            <h1 className="text-xl font-bold font-orbitron tracking-tighter text-glow">9M2PJU SET Pad</h1>
                            <div className="text-[10px] text-green-400 tracking-[0.2em] font-mono leading-tight uppercase mt-1">DIGITAL AMATEUR RADIO EMERGENCY SUITE (DARES)</div>
                        </div>
                    </div>


                    <div className="panel-tactical p-3 bg-black/40 border-radio-amber/20">
                        <div className="text-[10px] text-radio-amber font-orbitron uppercase tracking-widest mb-1">Station Status</div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-mono font-bold">{profile?.callsign || stationSettings.callsign || '9M2XXX'}</span>
                            <span className="text-[10px] font-mono p-1 rounded bg-radio-amber/10 text-radio-amber border border-radio-amber/30">{stationSettings.power}</span>
                        </div>
                        <div className="text-[9px] text-radio-amber/50 font-mono mt-1 opacity-60">{profile?.grid || stationSettings.grid || 'NO GRID'}</div>
                    </div>

                    <TimeWidget />
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {[
                        { id: 'iaru', icon: FileText, label: 'IARU Radiogram' },
                        { id: 'logger', icon: List, label: 'LOGGER' },
                        { id: 'morse', icon: AudioWaveform, label: 'Morse Code (CW)' },
                        { id: 'cipher', icon: Lock, label: 'Cipher Converter' },
                        { id: 'settings', icon: Settings, label: 'Station Config' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all font-orbitron text-xs uppercase tracking-widest ${activeTab === tab.id
                                ? 'bg-radio-cyan/20 text-radio-cyan border border-radio-cyan/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                : 'text-radio-amber/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-radio-cyan' : ''}`} />
                            {tab.label}
                        </button>
                    ))}

                    {profile?.is_super_admin && (
                        <Link to="/admin" className="w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all font-orbitron text-xs uppercase tracking-widest text-red-400 hover:text-red-200 hover:bg-red-900/20">
                            <Shield className="w-4 h-4" />
                            SUPER ADMIN
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button onClick={logout} className="w-full flex items-center gap-2 justify-center py-2 text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors uppercase">
                        <LogOut className="w-4 h-4" /> Terminate Link
                    </button>
                </div>
            </aside>

            {/* Main Content Pane */}
            <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
                {/* Mobile/Tablet Header */}
                <header className="lg:hidden flex-none bg-tactical-surface/50 backdrop-blur-md border-b border-white/5 p-4 z-20 pt-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="dares-logo.png" alt="DARES" className="w-6 h-6 object-contain" />
                            <div className="flex flex-col">
                                <h1 className="text-sm font-bold font-orbitron tracking-widest text-glow leading-none">9M2PJU</h1>
                                <span className="text-[8px] tracking-[0.2em] font-mono text-radio-cyan/80">SET PAD</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <TimeWidget compact={true} />
                            <div className="text-xs font-mono text-radio-amber font-bold border-l border-white/10 pl-3">{profile?.callsign || stationSettings.callsign || 'NOCAL'}</div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Viewport */}
                <main className="flex-1 overflow-y-auto p-0 scroll-smooth pb-24 lg:pb-0 flex flex-col">
                    <div className="w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {activeTab === 'settings' && (
                            <StationSettings
                                settings={stationSettings}
                                updateSettings={setStationSettings}
                                onSaveProfile={handleSaveProfile}
                                toggleTheme={toggleTheme}
                                currentTheme={theme}
                            />
                        )}

                        {activeTab === 'logger' && (
                            <TacticalLogger
                                logs={logs}
                                onAddLog={handleAddLog}
                                onDeleteLog={handleDeleteLog}
                                onUpdateLog={handleUpdateLog}
                                stationSettings={stationSettings}
                            />
                        )}

                        {activeTab === 'morse' && (
                            <MorseConverter />
                        )}

                        {activeTab === 'cipher' && (
                            <CipherConverter />
                        )}

                        {activeTab === 'iaru' && (
                            <IARUMessageForm
                                stationSettings={stationSettings}
                                onAddToLog={handleAddLog}
                            />
                        )}

                        <footer className="py-12 text-center text-[10px] uppercase tracking-[0.4em] text-green-400 font-orbitron">
                            <p>DIGITAL AMATEUR RADIO EMERGENCY SUITE (DARES) // <a href="https://hamradio.my" target="_blank" rel="noopener noreferrer" className="text-radio-cyan hover:text-white transition-colors border-b border-radio-cyan/30">9M2PJU</a></p>
                        </footer>
                    </div>
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="lg:hidden flex-none bg-tactical-surface/80 backdrop-blur-3xl border-t border-white/5 pb-safe fixed bottom-0 w-full z-30">
                    <div className="flex justify-around items-center h-16 px-4">
                        {profile?.is_super_admin && (
                            <Link to="/admin" className="flex flex-col items-center justify-center w-full h-full space-y-1 text-red-400">
                                <Shield className="w-5 h-5" />
                                <span className="text-[10px] font-bold tracking-tighter font-orbitron uppercase">ADMIN</span>
                            </Link>
                        )}
                        {[
                            { id: 'iaru', icon: FileText, label: 'MSG' },
                            { id: 'logger', icon: List, label: 'LOGGER' },
                            { id: 'morse', icon: AudioWaveform, label: 'CW' },
                            { id: 'cipher', icon: Lock, label: 'Cipher' },
                            { id: 'settings', icon: Settings, label: 'CFG' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === tab.id ? 'text-radio-cyan scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'text-gray-500'}`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="text-[10px] font-bold tracking-tighter font-orbitron uppercase">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    );
}
