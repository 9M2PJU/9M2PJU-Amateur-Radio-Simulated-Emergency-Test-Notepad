import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Shield, Eye, UserX, Loader } from 'lucide-react';
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

    const handleStopImpersonating = () => {
        impersonate(null);
    };

    if (!profile?.is_super_admin) {
        return <div className="p-8 text-center text-red-500 font-bold font-mono">UNAUTHORIZED ACCESS. INCIDENT LOGGED.</div>;
    }

    return (
        <div className="min-h-screen bg-tactical-bg text-gray-100 font-inter p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="flex justify-between items-center border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-red-500" />
                        <div>
                            <h1 className="text-2xl font-bold font-orbitron tracking-widest text-red-500">SUPER ADMIN CONSOLE</h1>
                            <p className="text-xs font-mono text-gray-500">Authorized Personnel Only // 9M2PJU Network</p>
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

                <div className="panel-tactical p-0 overflow-hidden">
                    <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                        <h2 className="font-bold text-gray-300 font-orbitron tracking-wider">REGISTERED STATIONS</h2>
                        <span className="text-xs font-mono bg-radio-cyan/20 text-radio-cyan px-2 py-1 rounded">{users.length} TOTAL</span>
                    </div>

                    {loading ? (
                        <div className="p-12 flex justify-center text-radio-cyan"><Loader className="animate-spin" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono text-sm">
                                <thead className="bg-black/40 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="p-4">Callsign / ID</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Grid</th>
                                        <th className="p-4 text-center">Outbox</th>
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
                                            <td className="p-4 text-gray-300">{user.email}</td>
                                            <td className="p-4 text-gray-400">{user.grid || '-'}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${user.messageCount > 0 ? 'bg-radio-green/20 text-radio-green' : 'bg-white/5 text-gray-600'}`}>
                                                    {user.messageCount || 0}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
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
    );
}
