import React, { useState } from 'react';
import { useLocalStorage } from './utils/useLocalStorage';
import StationSettings from './components/StationSettings';
import TacticalLogger from './components/TacticalLogger';
import IARUMessageForm from './components/IARUMessageForm';
import { Radio, List, Settings, FileText } from 'lucide-react';

function App() {
  const [stationSettings, setStationSettings] = useLocalStorage('stationSettings', {
    callsign: '',
    grid: '',
    power: 'BATTERY'
  });

  const [logs, setLogs] = useLocalStorage('stationLogs', []);
  const [activeTab, setActiveTab] = useState('iaru'); // 'iaru', 'logger', 'settings'

  const handleAddToLog = (logEntry) => {
    setLogs(prev => [logEntry, ...prev]);
  };

  return (
    <div className="flex flex-col h-[100dvh] text-gray-100 font-inter overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop')" }}>
      {/* Dark overlay to ensure text readability over background image */}
      <div className="absolute inset-0 bg-tactical-bg/90 z-0"></div>

      {/* Desktop/Tablet Header */}
      <header className="flex-none bg-tactical-surface/50 backdrop-blur-md border-b border-radio-cyan/20 p-4 shadow-[0_4px_20px_-5px_rgba(6,182,212,0.1)] z-10 sticky top-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-radio-cyan/10 p-2 rounded-lg border border-radio-cyan/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <Radio className="w-6 h-6 text-radio-cyan animate-pulse-slow" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent uppercase tracking-widest text-glow font-orbitron">MySET Notepad</h1>
              <div className="text-[10px] text-radio-cyan/80 tracking-[0.2em] font-mono">DIGITAL AMATEUR RADIO EMERGENCY SUITE</div>
            </div>
          </div>

          <div className="hidden md:flex gap-2 bg-black/20 p-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
            {['iaru', 'logger', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-bold uppercase rounded-md transition-all font-orbitron tracking-wider ${activeTab === tab
                  ? 'bg-radio-cyan/20 text-radio-cyan shadow-[0_0_10px_rgba(6,182,212,0.2)] border border-radio-cyan/50'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {tab === 'logger' && 'Logger'}
                {tab === 'iaru' && 'IARU MSG'}
                {tab === 'settings' && 'Settings'}
              </button>
            ))}
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-sm font-mono text-radio-amber uppercase text-glow-amber">{stationSettings.callsign || 'NO CALLSIGN'}</div>
            <div className="text-xs text-gray-500 font-mono tracking-widest">{stationSettings.grid}</div>
          </div>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:pb-4 scroll-smooth z-10 relative">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'settings' && (
            <StationSettings settings={stationSettings} updateSettings={setStationSettings} />
          )}

          {activeTab === 'logger' && (
            <TacticalLogger logs={logs} setLogs={setLogs} stationSettings={stationSettings} />
          )}

          {activeTab === 'iaru' && (
            <IARUMessageForm
              stationSettings={stationSettings}
              onAddToLog={handleAddToLog}
            />
          )}
        </div>

        <footer className="py-8 text-center text-[10px] uppercase tracking-[0.3em] text-gray-600 font-orbitron opacity-50 hover:opacity-100 transition-opacity">
          <p>MADE FOR 🇲🇾 BY <a href="https://hamradio.my" target="_blank" rel="noopener noreferrer" className="text-radio-cyan hover:text-white transition-colors border-b border-radio-cyan/30 hover:border-white">9M2PJU</a></p>
        </footer>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden flex-none bg-tactical-surface/80 backdrop-blur-xl border-t border-radio-cyan/20 pb-safe fixed bottom-0 w-full z-20 shadow-[0_-5px_20px_-5px_rgba(6,182,212,0.1)]">
        <div className="flex justify-around items-center h-16">
          <button onClick={() => setActiveTab('iaru')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === 'iaru' ? 'text-radio-cyan drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'text-gray-500'}`}>
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-wider font-orbitron">RADIOGRAM</span>
          </button>
          <button onClick={() => setActiveTab('logger')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === 'logger' ? 'text-radio-green drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'text-gray-500'}`}>
            <List className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-wider font-orbitron">LOGS</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${activeTab === 'settings' ? 'text-radio-amber drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'text-gray-500'}`}>
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-wider font-orbitron">CFG</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
