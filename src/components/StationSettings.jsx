import React from 'react';
import { Settings, Battery, Zap, MapPin, Save } from 'lucide-react';

export default function StationSettings({ settings, updateSettings, onSaveProfile, toggleTheme, currentTheme }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        updateSettings({ ...settings, [name]: value.toUpperCase() });
    };

    return (
        <div className="panel-tactical mb-6 border-l-4 border-l-radio-amber">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-radio-amber">
                    <Settings className="w-6 h-6 animate-spin-slow" />
                    <h2 className="text-xl font-bold uppercase tracking-wider font-orbitron text-glow-amber">Station Configuration</h2>
                </div>
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-3 py-1.5 rounded border border-radio-cyan/50 text-radio-cyan hover:bg-radio-cyan/20 transition-all font-orbitron text-xs font-bold uppercase"
                >
                    {currentTheme === 'dark' ? '☀ DESERT MODE' : '☾ JUNGLE MODE'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Operator Callsign */}
                <div>
                    <label className="block text-gray-400 text-xs uppercase font-semibold mb-1 font-orbitron tracking-wider">Operator Callsign</label>
                    <input
                        type="text"
                        name="callsign"
                        value={settings.callsign || ''}
                        onChange={handleChange}
                        placeholder="YOUR CALLSIGN"
                        className="input-tactical font-mono text-lg uppercase border-radio-amber/50 focus:border-radio-amber focus:ring-radio-amber text-radio-amber bg-radio-amber/5 placeholder:text-gray-600"
                    />
                </div>

                {/* Grid Square */}
                <div>
                    <label className="block text-gray-400 text-xs uppercase font-semibold mb-1 flex items-center gap-1 font-orbitron tracking-wider">
                        <MapPin className="w-3 h-3" /> Grid Square
                    </label>
                    <input
                        type="text"
                        name="grid"
                        value={settings.grid || ''}
                        onChange={handleChange}
                        placeholder="OJ03"
                        className="input-tactical font-mono text-lg uppercase border-radio-amber/50 focus:border-radio-amber focus:ring-radio-amber text-radio-amber bg-radio-amber/5 placeholder:text-gray-600"
                    />
                </div>

                {/* Power Source */}
                <div>
                    <label className="block text-gray-400 text-xs uppercase font-semibold mb-1 font-orbitron tracking-wider">Power Source</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => updateSettings({ ...settings, power: 'MAINS' })}
                            className={`flex-1 py-2 rounded border flex items-center justify-center gap-2 transition-all font-orbitron tracking-wider text-sm font-bold ${settings.power === 'MAINS' ? 'bg-radio-red text-white border-radio-red shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-transparent text-gray-500 border-gray-700 hover:text-white hover:border-gray-500'
                                }`}
                        >
                            <Zap className="w-4 h-4" /> Mains
                        </button>
                        <button
                            onClick={() => updateSettings({ ...settings, power: 'BATTERY' })}
                            className={`flex-1 py-2 rounded border flex items-center justify-center gap-2 transition-all font-orbitron tracking-wider text-sm font-bold ${settings.power === 'BATTERY' ? 'bg-radio-green text-black border-radio-green shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-transparent text-gray-500 border-gray-700 hover:text-white hover:border-gray-500'
                                }`}
                        >
                            <Battery className="w-4 h-4" /> Batt
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
                <p className="text-[10px] text-gray-600 uppercase font-mono tracking-widest">
                    Build: {new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kuala_Lumpur' })}
                </p>
                {onSaveProfile && (
                    <button
                        onClick={() => onSaveProfile(settings)}
                        className="flex items-center gap-2 bg-radio-cyan/10 hover:bg-radio-cyan/20 text-radio-cyan border border-radio-cyan/50 px-4 py-2 rounded transition-all font-orbitron text-xs font-bold uppercase tracking-wider"
                    >
                        <Save className="w-4 h-4" /> Save Profile
                    </button>
                )}
            </div>
        </div>
    );
}
