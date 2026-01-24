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
  const [activeTab, setActiveTab] = useState('ics213'); // 'ics213', 'logger', 'settings'

  return (
    <div className="flex flex-col h-[100dvh] bg-tactical-bg text-gray-100 font-sans selection:bg-radio-green selection:text-black overflow-hidden">

      {/* Desktop/Tablet Header - Hidden on small mobile if we want a cleaner look, or kept simplified */}
      <header className="flex-none bg-tactical-surface border-b border-tactical-highlight p-4 shadow-md z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-radio-green p-2 rounded text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]">
              <Radio className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-widest uppercase leading-none">MySET <span className="text-radio-green">Notepad</span></h1>
              <p className="text-[0.6rem] sm:text-xs text-gray-400 tracking-wider">Simulated Emergency Test Tool</p>
            </div>
          </div>

          {/* Desktop Nav - Visible hidden on mobile */}
          <div className="hidden md:flex gap-1 bg-slate-900/50 p-1 rounded-lg border border-gray-800">
            {['ics213', 'logger', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-bold uppercase rounded transition-all ${activeTab === tab
                  ? 'bg-radio-green text-black shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {tab === 'logger' && 'Logger'}
                {tab === 'ics213' && 'ICS-213'}
                {tab === 'settings' && 'Settings'}
              </button>
            ))}
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-sm font-mono text-radio-amber">{stationSettings.callsign || 'NO CALLSIGN'}</div>
            <div className="text-xs text-gray-500">{stationSettings.grid}</div>
          </div>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:pb-4 scroll-smooth">
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'settings' && (
            <StationSettings settings={stationSettings} updateSettings={setStationSettings} />
          )}

          {activeTab === 'logger' && (
            <TacticalLogger logs={logs} setLogs={setLogs} stationSettings={stationSettings} />
          )}

          {activeTab === 'ics213' && (
            <ICS213Form
              stationSettings={stationSettings}
              onAddToLog={(logEntry) => setLogs(prev => [logEntry, ...prev])}
            />
          )}
        </div>

        <footer className="py-8 text-center text-[10px] uppercase tracking-widest text-gray-600">
          <p>Made for 🇲🇾 by <a href="https://hamradio.my" target="_blank" rel="noopener noreferrer" className="font-bold text-radio-amber hover:text-white transition-colors">9M2PJU</a></p>
        </footer>
      </main>

      {/* Mobile Bottom Navigation - Hidden on Desktop */}
      <nav className="md:hidden flex-none bg-tactical-surface border-t border-tactical-highlight pb-safe fixed bottom-0 w-full z-20">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setActiveTab('ics213')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'ics213' ? 'text-radio-green' : 'text-gray-500'}`}
          >
            <div className={`p-1 rounded-full ${activeTab === 'ics213' ? 'bg-radio-green/10' : ''}`}>
              {/* FileText Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">ICS-213</span>
          </button>

          <button
            onClick={() => setActiveTab('logger')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'logger' ? 'text-radio-green' : 'text-gray-500'}`}
          >
            <div className={`p-1 rounded-full ${activeTab === 'logger' ? 'bg-radio-green/10' : ''}`}>
              {/* List/Logger Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Log</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'settings' ? 'text-radio-green' : 'text-gray-500'}`}
          >
            <div className={`p-1 rounded-full ${activeTab === 'settings' ? 'bg-radio-green/10' : ''}`}>
              {/* Settings Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Station</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
