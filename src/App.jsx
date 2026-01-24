import React, { useState } from 'react';
import { useLocalStorage } from './utils/useLocalStorage';
import StationSettings from './components/StationSettings';
import TacticalLogger from './components/TacticalLogger';
import ICS213Form from './components/ICS213Form';
import { Radio } from 'lucide-react';

function App() {
  const [stationSettings, setStationSettings] = useState({
    callsign: '',
    grid: '',
    power: 'BATTERY'
  });

  const [logs, setLogs] = useLocalStorage('stationLogs', []);
  const [activeTab, setActiveTab] = useState('logger'); // 'logger', 'ics213', 'settings'

  return (
    <div className="min-h-screen bg-tactical-bg text-gray-100 p-4 font-sans selection:bg-radio-green selection:text-black">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 border-b border-tactical-highlight pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-radio-green p-2 rounded text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]">
              <Radio className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-widest uppercase">MySET <span className="text-radio-green">Notepad</span></h1>
              <p className="text-xs text-gray-400 tracking-wider">Simulated Emergency Test Tool</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-sm font-mono text-radio-amber">{stationSettings.callsign || 'NO CALLSIGN'}</div>
            <div className="text-xs text-gray-500">{stationSettings.grid}</div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex border-b border-tactical-highlight mb-6">
          <button
            onClick={() => setActiveTab('logger')}
            className={`px-6 py-3 font-bold uppercase text-sm tracking-wide border-b-2 transition-colors ${activeTab === 'logger' ? 'border-radio-green text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            Tactical Logger
          </button>
          <button
            onClick={() => setActiveTab('ics213')}
            className={`px-6 py-3 font-bold uppercase text-sm tracking-wide border-b-2 transition-colors ${activeTab === 'ics213' ? 'border-radio-green text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            ICS-213 Message
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-bold uppercase text-sm tracking-wide border-b-2 transition-colors ${activeTab === 'settings' ? 'border-radio-green text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            Station Settings
          </button>
        </div>

        {/* View Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'settings' && (
            <StationSettings settings={stationSettings} updateSettings={setStationSettings} />
          )}

          {activeTab === 'logger' && (
            <TacticalLogger logs={logs} setLogs={setLogs} stationSettings={stationSettings} />
          )}

          {activeTab === 'ics213' && (
            <ICS213Form stationSettings={stationSettings} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
