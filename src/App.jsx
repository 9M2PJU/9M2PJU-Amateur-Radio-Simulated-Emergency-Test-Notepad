import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './utils/useLocalStorage';
import StationSettings from './components/StationSettings';
import TacticalLogger from './components/TacticalLogger';
import IARUMessageForm from './components/IARUMessageForm';
import TimeWidget from './components/TimeWidget';
import CursorTrail from './components/CursorTrail';
import { Radio, List, Settings, FileText } from 'lucide-react';

function App() {
  const [theme, setTheme] = useLocalStorage('theme', 'dark'); // 'dark' or 'light'
  const [stationSettings, setStationSettings] = useLocalStorage('stationSettings', {
    callsign: '',
    grid: '',
    power: 'BATTERY'
  });

  const [logs, setLogs] = useLocalStorage('stationLogs', []);
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

  // ... (handleInstall remains same)

  const handleAddToLog = (msg) => {
    // ...
  };

  return (
    <div className={`flex flex-col lg:flex-row h-[100dvh] text-gray-100 font-inter overflow-hidden bg-cover bg-center selection:bg-radio-cyan selection:text-black ${theme === 'light' ? 'light-mode text-slate-900' : ''}`}
      style={{ backgroundImage: theme === 'light' ? "none" : "url('https://images.unsplash.com/photo-1595878715977-2a8f8d0c0cdd?q=80&w=2670&auto=format&fit=crop')" }}>

      {/* Camo Pattern Overlay for Dark Mode */}
      {theme === 'dark' && <div className="absolute inset-0 bg-tactical-bg/85 z-0 mix-blend-multiply"></div>}

      {/* Light Mode Plain Background (Sand) */}
      {theme === 'light' && <div className="absolute inset-0 bg-tactical-bg z-0"></div>}

      {/* PWA Install Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="panel-tactical max-w-sm w-full text-center space-y-4 border-radio-cyan animate-in zoom-in-95 duration-300">
            <Radio className="w-12 h-12 text-radio-cyan mx-auto animate-pulse" />
            <h3 className="text-xl font-bold font-orbitron text-glow">COMMUNICATION LINK</h3>
            <p className="text-sm text-gray-400 font-mono">Install MySET Digital Notepad for offline tactical access and native performance.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={handleInstall} className="btn-tactical flex-1 py-3 text-sm">INSTALL SYSTEM</button>
              <button onClick={() => { setShowInstallModal(false); localStorage.setItem('lastInstallPrompt', Date.now().toString()); }}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 py-3 rounded-md text-xs font-bold uppercase tracking-widest transition-all">DISMISS</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar for Desktop (xl+) */}
      <aside className="hidden lg:flex flex-col w-72 bg-tactical-surface/40 backdrop-blur-2xl border-r border-white/5 z-20 relative overflow-hidden">
        <div className="p-6 border-b border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-radio-cyan/10 p-2 rounded-lg border border-radio-cyan/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Radio className="w-6 h-6 text-radio-cyan" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-orbitron tracking-tighter text-glow">9M2PJU SET Pad</h1>
              <div className="text-[8px] text-radio-cyan/60 tracking-[0.3em] font-mono leading-tight uppercase">Simulated Emergency Test Notepad</div>
            </div>
          </div>


          <div className="panel-tactical p-3 bg-black/40 border-radio-amber/20">
            <div className="text-[10px] text-radio-amber font-orbitron uppercase tracking-widest mb-1">Station Status</div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono font-bold">{stationSettings.callsign || '9M2XXX'}</span>
              <span className="text-[10px] font-mono p-1 rounded bg-radio-amber/10 text-radio-amber border border-radio-amber/30">{stationSettings.power}</span>
            </div>
            <div className="text-[9px] text-gray-500 font-mono mt-1 opacity-60">{stationSettings.grid || 'NO GRID'}</div>
          </div>

          <TimeWidget />
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'iaru', icon: FileText, label: 'IARU Radiogram' },
            { id: 'logger', icon: List, label: 'Tactical logger' },
            { id: 'settings', icon: Settings, label: 'Station Config' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all font-orbitron text-xs uppercase tracking-widest ${activeTab === tab.id
                ? 'bg-radio-cyan/20 text-radio-cyan border border-radio-cyan/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-radio-cyan' : ''}`} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 text-[9px] text-gray-600 font-mono space-y-1">
          <p>SYSTEM v1.2.0-STABLE</p>
          <p>© 2026 9M2PJU PROJECT</p>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Mobile/Tablet Header */}
        <header className="lg:hidden flex-none bg-tactical-surface/50 backdrop-blur-md border-b border-white/5 p-4 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-radio-cyan animate-pulse-slow" />
              <div className="flex flex-col">
                <h1 className="text-sm font-bold font-orbitron tracking-widest text-glow leading-none">9M2PJU</h1>
                <span className="text-[8px] tracking-[0.2em] font-mono text-radio-cyan/80">SET PAD</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TimeWidget compact={true} />
              <div className="text-xs font-mono text-radio-amber font-bold border-l border-white/10 pl-3">{stationSettings.callsign || 'NOCAL'}</div>
            </div>
          </div>
        </header>

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth pb-24 lg:pb-8 flex flex-col">
          <div className="max-w-screen-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full flex-1 flex flex-col xl:scale-[0.90] xl:origin-top">
            {activeTab === 'settings' && (
              <StationSettings
                settings={stationSettings}
                updateSettings={setStationSettings}
                toggleTheme={toggleTheme}
                currentTheme={theme}
              />
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

            <footer className="py-12 text-center text-[10px] uppercase tracking-[0.4em] text-gray-700 font-orbitron">
              <p>DIGITAL AMATEUR RADIO EMERGENCY SUITE // <a href="https://hamradio.my" target="_blank" rel="noopener noreferrer" className="text-radio-cyan hover:text-white transition-colors border-b border-radio-cyan/30">9M2PJU</a></p>
            </footer>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden flex-none bg-tactical-surface/80 backdrop-blur-3xl border-t border-white/5 pb-safe fixed bottom-0 w-full z-30">
          <div className="flex justify-around items-center h-16 px-4">
            {[
              { id: 'iaru', icon: FileText, label: 'MSG' },
              { id: 'logger', icon: List, label: 'LOG' },
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

export default App;
