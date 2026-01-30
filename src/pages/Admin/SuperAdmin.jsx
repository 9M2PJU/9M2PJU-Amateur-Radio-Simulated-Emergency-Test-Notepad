import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Shield, Eye, UserX, Loader, ToggleLeft, ToggleRight, Settings, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SuperAdmin() {
    const { profile, impersonate, impersonatedUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile?.is_super_admin) {
            fetchUsers();
        }
    }, [profile]);

    const fetchUsers = async () => {
        try {
            // Note: In a real Supabase setup, you can't easily query auth.users from common client. 
            // We usually rely on the 'profiles' table which should sync with auth.users via triggers.
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data);
            fetchMessageCounts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessageCounts = async (usersList) => {
        try {
            // Fetch all message metadata (lightweight, just user_id)
            const { data: messages, error } = await supabase
                .from('messages')
                .select('user_id');

            if (error) throw error;

            // Count messages per user
            const counts = {};
            messages.forEach(msg => {
                counts[msg.user_id] = (counts[msg.user_id] || 0) + 1;
            });

            // Merge counts into users state
            setUsers(prevUsers => prevUsers.map(u => ({
                ...u,
                messageCount: counts[u.id] || 0
            })));
        } catch (error) {
            console.error("Error fetching message counts:", error);
        }
    };

    const handleImpersonate = (userId) => {
        impersonate(userId);
    };





    if (!profile?.is_super_admin) {
        return <div className="p-8 text-center text-red-500 font-bold font-mono">UNAUTHORIZED ACCESS. INCIDENT LOGGED.</div>;
    }

    return (
        <div className="h-screen overflow-y-auto bg-tactical-bg text-radio-amber font-inter p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="flex justify-between items-center border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-red-500" />
                        <div>
                            <h1 className="text-2xl font-bold font-orbitron tracking-widest text-red-500">SUPER ADMIN CONSOLE</h1>
                            <p className="text-xs font-mono text-radio-amber/60">Authorized Personnel Only // 9M2PJU Network</p>
                        </div>
                    </div>
                    <Link to="/" className="btn-tactical py-2 px-4 text-xs">RETURN TO DASHBOARD</Link>
                </header>

                {impersonatedUser && (
                    <div className="bg-red-500/10 border border-red-500/50 p-4 rounded flex justify-between items-center animate-pulse">
                        <div className="flex items-center gap-2 text-red-400 font-bold font-mono">
                            <Eye className="w-5 h-5" />
                            <span>CURRENTLY IMPERSONATING: {impersonatedUser} (ID)</span>
                        </div>
                        <button onClick={handleStopImpersonating} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-xs font-bold font-orbitron">
                            STOP IMPERSONATION
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* System Configuration Panel */}
                    <SystemConfigPanel />

                    {/* Registered Stations Panel */}
                    <div className="panel-tactical p-0 overflow-hidden md:col-span-2">
                        <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                            <h2 className="font-bold text-radio-amber/90 font-orbitron tracking-wider">REGISTERED STATIONS</h2>
                            <span className="text-xs font-mono bg-radio-cyan/20 text-radio-cyan px-2 py-1 rounded">{users.length} TOTAL</span>
                        </div>

                        {loading ? (
                            <div className="p-12 flex justify-center text-radio-cyan"><Loader className="animate-spin" /></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left font-mono text-sm">
                                    <thead className="bg-black/40 text-radio-amber/60 text-xs uppercase">
                                        <tr>
                                            <th className="p-4">Callsign / ID</th>
                                            <th className="p-4">Email</th>
                                            <th className="p-4">Grid</th>
                                            <th className="p-4 text-center">Outbox</th>
                                            <th className="p-4 text-center">Donation</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {users.map(user => (
                                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-bold text-radio-amber">
                                                    {user.callsign || <span className="opacity-50 text-[10px] italic">Checking Profile... {user.id.substring(0, 8)}</span>}
                                                    {user.is_super_admin && <span className="ml-2 text-[9px] bg-red-500 text-white px-1 rounded">ADMIN</span>}
                                                </td>
                                                <td className="p-4 text-radio-amber/90">{user.email}</td>
                                                <td className="p-4 text-radio-amber/60">{user.grid || '-'}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${user.messageCount > 0 ? 'bg-radio-green/20 text-radio-green' : 'bg-white/5 text-radio-amber/60'}`}>
                                                        {user.messageCount || 0}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={() => toggleDonation(user.id, user.show_donation !== false)}
                                                        className={`hover:text-white transition-colors ${user.show_donation !== false ? 'text-green-400' : 'text-radio-amber/60'}`}
                                                        title={user.show_donation !== false ? "Donation Popup ON" : "Donation Popup OFF"}
                                                    >
                                                        {user.show_donation !== false ?
                                                            <ToggleRight className="w-6 h-6" /> :
                                                            <ToggleLeft className="w-6 h-6" />
                                                        }
                                                    </button>
                                                </td>
                                                <td className="p-4 text-right min-w-[140px] flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleImpersonate(user.id)}
                                                        disabled={impersonatedUser === user.id}
                                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                                                            ${impersonatedUser === user.id
                                                                ? 'bg-red-500 text-white cursor-not-allowed'
                                                                : 'bg-white/5 hover:bg-white/10 text-radio-cyan border border-radio-cyan/30'
                                                            }`}
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        {impersonatedUser === user.id ? 'ACTIVE' : 'IMPERSONATE'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SystemConfigPanel() {
    const [duration, setDuration] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('system_config')
                .select('value')
                .eq('key', 'donation_popup_duration')
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'not found'

            setDuration(data?.value?.seconds || 10);
        } catch (error) {
            console.error("Error fetching system config:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('system_config')
                .upsert({
                    key: 'donation_popup_duration',
                    value: { seconds: parseInt(duration) },
                    description: 'Duration in seconds for the donation popup countdown'
                });

            if (error) throw error;
            alert("Configuration saved successfully!");
        } catch (error) {
            console.error("Error saving config:", error);
            alert("Failed to save configuration.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="panel-tactical p-0 overflow-hidden h-full">
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-2">
                <Settings className="w-5 h-5 text-radio-amber" />
                <h2 className="font-bold text-radio-amber/90 font-orbitron tracking-wider">SYSTEM CONFIG</h2>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">Donation Popup Duration (Seconds)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="input-tactical flex-1 max-w-[150px] font-mono text-center"
                            placeholder="10"
                        />
                        <button
                            onClick={handleSave}
                            disabled={loading || saving}
                            className="btn-tactical py-2 px-4 flex items-center gap-2 text-xs"
                        >
                            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            SAVE
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 font-mono">
                        Controls how long the donation popup stays open before auto-closing.
                        <br />Default: 10 seconds.
                    </p>
                </div>
            </div>
        </div>
    );
}
