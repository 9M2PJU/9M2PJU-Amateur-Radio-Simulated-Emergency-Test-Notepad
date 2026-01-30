import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export default function Register() {
    const [email, setEmail] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }
        try {
            await register(email, password);
            // Since email confirmation is disabled, user is logged in automatically or can login immediately
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-tactical-bg flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-tactical-bg/85 z-0 mix-blend-multiply pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md panel-tactical p-8 bg-black/60 backdrop-blur-md">
                <div className="flex flex-col items-center mb-8">
                    <UserPlus className="w-12 h-12 text-radio-green mb-2" />
                    <h1 className="text-2xl font-bold font-orbitron text-glow tracking-widest text-center">NEW STATION ENTRY</h1>
                    <span className="text-xs text-radio-green/70 tracking-[0.3em] font-mono">ESTABLISH CREDENTIALS</span>
                </div>

                {error && <div className="bg-red-900/50 border border-red-500 text-red-200 text-xs font-mono p-3 mb-4 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-radio-amber tracking-widest block mb-1">Email Frequency</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/50 border border-radio-green/30 rounded px-4 py-2 text-radio-green font-mono focus:border-radio-green outline-none transition-colors"
                            placeholder="operator@hamradio.my"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-radio-amber tracking-widest block mb-1">Secure Passkey</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-radio-green/30 rounded px-4 py-2 text-radio-green font-mono focus:border-radio-green outline-none transition-colors"
                            placeholder="••••••"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-radio-amber tracking-widest block mb-1">Confirm Passkey</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-black/50 border border-radio-green/30 rounded px-4 py-2 text-radio-green font-mono focus:border-radio-green outline-none transition-colors"
                            placeholder="••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-radio-green hover:bg-emerald-600 text-black font-bold py-3 rounded shadow-[0_0_15px_rgba(77,124,15,0.4)] font-orbitron tracking-widest transition-all mt-4"
                    >
                        {loading ? 'REGISTERING...' : 'CONFIRM UPLINK'}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs font-mono text-gray-500">
                    ALREADY ESTABLISHED? <Link to="/login" className="text-radio-green hover:text-white underline decoration-1 underline-offset-4">LOGIN HERE</Link>
                </div>
            </div>
        </div>
    );
}
