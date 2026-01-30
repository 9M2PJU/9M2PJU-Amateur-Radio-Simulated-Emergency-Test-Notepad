import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Radio } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email, password);
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
                    <Radio className="w-12 h-12 text-radio-cyan mb-2 animate-pulse" />
                    <h1 className="text-2xl font-bold font-orbitron text-glow tracking-widest text-center">9M2PJU SET PAD</h1>
                    <span className="text-xs text-radio-cyan/70 tracking-[0.3em] font-mono">ACCESS CONTROL</span>
                </div>

                {error && <div className="bg-red-900/50 border border-red-500 text-red-200 text-xs font-mono p-3 mb-4 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-radio-amber tracking-widest block mb-1">Callsign / Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/50 border border-radio-cyan/30 rounded px-4 py-2 text-radio-cyan font-mono focus:border-radio-cyan outline-none transition-colors"
                            placeholder="OPERATOR EMAIL"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-radio-amber tracking-widest block mb-1">Passkey</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-radio-cyan/30 rounded px-4 py-2 text-radio-cyan font-mono focus:border-radio-cyan outline-none transition-colors"
                            placeholder="••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-tactical py-3 text-sm font-bold tracking-widest mt-4"
                    >
                        {loading ? 'AUTHENTICATING...' : 'INITIATE UPLINK'}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs font-mono text-gray-500">
                    NEW STATION? <Link to="/register" className="text-radio-cyan hover:text-white underline decoration-1 underline-offset-4">REGISTER SIGNAL</Link>
                </div>
            </div>
        </div>
    );
}
