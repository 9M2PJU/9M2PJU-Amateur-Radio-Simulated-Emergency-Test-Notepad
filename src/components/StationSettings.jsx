import React from 'react';
import { Settings, Battery, Zap, MapPin } from 'lucide-react';

export default function StationSettings({ settings, updateSettings }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        updateSettings({ ...settings, [name]: value });
    };

    return (
        <div className="panel-tactical mb-6">
            <div className="flex items-center gap-2 mb-4 text-radio-amber">
                <Settings className="w-6 h-6" />
                <h2 className="text-xl font-bold uppercase tracking-wider">Station Configuration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Operator Callsign */}
                <div>
                    <label className="block text-gray-400 text-xs uppercase font-semibold mb-1">Operator Callsign</label>
                    <input
                        type="text"
                        name="callsign"
                        value={settings.callsign || ''}
                        onChange={handleChange}
                        placeholder="YOUR CALLSIGN"
                        className="input-tactical font-mono text-lg uppercase"
                    />
                </div>

                {/* Grid Square */}
                <div>
                    <label className="block text-gray-400 text-xs uppercase font-semibold mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Grid Square
                    </label>
                    <input
                        type="text"
                        name="grid"
                        value={settings.grid || ''}
                        onChange={handleChange}
                        placeholder="OJ03"
                        className="input-tactical font-mono text-lg uppercase"
                    />
                </div>

                {/* Power Source */}
                <div>
                    <label className="block text-gray-400 text-xs uppercase font-semibold mb-1">Power Source</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => updateSettings({ ...settings, power: 'MAINS' })}
                            className={`flex-1 py-2 rounded border border-tactical-highlight flex items-center justify-center gap-2 transition-colors ${settings.power === 'MAINS' ? 'bg-radio-red text-white' : 'bg-transparent text-gray-500 hover:text-white'
                                }`}
                        >
                            <Zap className="w-4 h-4" /> Mains
                        </button>
                        <button
                            onClick={() => updateSettings({ ...settings, power: 'BATTERY' })}
                            className={`flex-1 py-2 rounded border border-tactical-highlight flex items-center justify-center gap-2 transition-colors ${settings.power === 'BATTERY' ? 'bg-radio-green text-black' : 'bg-transparent text-gray-500 hover:text-white'
                                }`}
                        >
                            <Battery className="w-4 h-4" /> Batt
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-tactical-highlight">
                <p className="text-[10px] text-gray-600 uppercase font-mono tracking-widest">
                    Build: {new Date().toISOString().split('T')[0]} (v1.1)
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-[10px] text-radio-amber hover:text-white uppercase font-bold tracking-wider"
                >
                    Check for Updates
                </button>
            </div>
        </div>
    );
}
