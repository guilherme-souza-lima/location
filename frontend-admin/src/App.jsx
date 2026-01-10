import { useState, useEffect, useRef } from 'react';
import Map from './components/Map';
import { Activity, Radio, MapPin, Search, ChevronRight, User, Signal } from 'lucide-react';

function App() {
  const [markers, setMarkers] = useState({});
  const [connected, setConnected] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const reconnectTimeout = useRef(null);

  useEffect(() => {
    let ws;

    const connect = () => {
      let wsUrl;
      if (window.location.hostname.includes('cubevisservice.site')) {
        wsUrl = 'wss://api.location.cubevisservice.site/ws?type=viewer';
      } else {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${protocol}//${window.location.hostname}:1800/ws?type=viewer`;
      }

      console.log('Connecting to WebSocket:', wsUrl);
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WS Connection Established');
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'disconnect' && data.id) {
            setMarkers(prev => {
              const newMarkers = { ...prev };
              delete newMarkers[data.id];
              return newMarkers;
            });
            return;
          }

          if (data.id && data.lat && data.lng) {
            setMarkers(prev => ({
              ...prev,
              [data.id]: data
            }));
          }
        } catch (e) {
          console.error('Failed to parse WS message:', e);
        }
      };

      ws.onclose = () => {
        console.log('WS Disconnected');
        setConnected(false);
        // Reconnect logic
        reconnectTimeout.current = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error('WS Error:', err);
        ws.close();
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, []);

  const handleDeviceClick = (deviceId) => {
    if (selectedDeviceId === deviceId) {
      setSelectedDeviceId(null);
    } else {
      setSelectedDeviceId(deviceId);
    }
  };

  // Palette "Visual Identity":
  // #5a372c (Café) -> Text / Icons
  // #8b8b70 (Oliva) -> Borders / Secondary
  // #98c7b0 (Menta) -> Status / Highlights
  // #f0f0d8 (Creme) -> Background
  // #c94b0c (Ferrugem) -> Actions / Alerts

  return (
    <div className="flex h-screen w-screen bg-[#f0f0d8] text-[#5a372c] overflow-hidden font-sans selection:bg-[#c94b0c]/30">

      {/* Sidebar - Master Design Guidelines Applied */}
      <aside className="w-[400px] bg-[#f0f0d8] border-r border-[#8b8b70] flex flex-col shadow-2xl z-20 relative font-sans">

        {/* Header Section */}
        <div className="p-6 flex flex-col gap-6 bg-[#f0f0d8]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#5a372c]/5 rounded-md border border-[#8b8b70]/20">
                <Activity size={20} className="text-[#5a372c]" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-[#5a372c] uppercase">
                Operations
              </h2>
            </div>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${connected
                ? 'bg-[#98c7b0]/20 border-[#98c7b0] text-[#5a372c]'
                : 'bg-red-50 border-red-200 text-[#c94b0c]'
              }`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-[#98c7b0] animate-pulse' : 'bg-[#c94b0c]'}`}></div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#5a372c]">{connected ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          {/* Search Input - Industrial Modern (4-6px radius) */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b8b70]" size={18} />
            <input
              type="text"
              placeholder="SEARCH UNIT..."
              className="w-full bg-[#fdfdf5] border border-[#8b8b70] rounded-md py-3 pl-11 pr-4 text-sm text-[#5a372c] placeholder:text-[#8b8b70] focus:outline-none focus:border-[#c94b0c] focus:ring-1 focus:ring-[#c94b0c] transition-all"
            />
          </div>
        </div>

        {/* Separator / List Header - Oliva, Uppercase, Tracking 0.05em */}
        <div className="px-6 flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-bold text-[#8b8b70] uppercase flex items-center gap-2" style={{ letterSpacing: '0.05em' }}>
            Active Links
          </h3>
          <span className="text-[#8b8b70] text-[10px] font-bold">{Object.keys(markers).length} UNIT(S)</span>
        </div>

        {/* Device List - Gap 20-24px logic via space-y-4 (16px) + padding */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 bg-[#f0f0d8] scrollbar-thin scrollbar-thumb-[#8b8b70]/20">
          {Object.keys(markers).length === 0 ? (
            /* Signal Lost Card - Darker Creme, Rust Text */
            <div className="flex flex-col items-center justify-center py-10 rounded-md border border-[#8b8b70]/30 bg-[#e6e6c8]">
              <div className="p-3 bg-[#c94b0c]/10 rounded-full mb-3">
                <Signal size={24} className="text-[#c94b0c]" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-[#c94b0c] uppercase tracking-wide">Signal Lost</p>
                <p className="text-xs text-[#5a372c]/70">Awaiting telemetry...</p>
              </div>
            </div>
          ) : (
            Object.values(markers).map(marker => (
              <div
                key={marker.id}
                onClick={() => handleDeviceClick(marker.id)}
                className={`group cursor-pointer p-5 rounded-md transition-all duration-200 relative overflow-hidden border
                  ${selectedDeviceId === marker.id
                    ? 'bg-white border-[#c94b0c] shadow-md'
                    : 'bg-[#fdfdf5] border-[#8b8b70]/40 hover:bg-[#98c7b0]/20 hover:border-[#8b8b70]'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 p-2 rounded-md border ${selectedDeviceId === marker.id
                        ? 'bg-[#c94b0c] text-white border-[#c94b0c]'
                        : 'bg-[#f0f0d8] text-[#5a372c] border-[#8b8b70]/20'
                      }`}>
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#5a372c] leading-tight mb-1">
                        {marker.info || 'Unknown Agent'}
                      </h3>
                      <p className="text-[10px] font-mono text-[#8b8b70] uppercase tracking-wide">
                        ID: {marker.id.substring(0, 12)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border ${selectedDeviceId === marker.id
                        ? 'bg-[#f0f0d8] border-[#c94b0c]/30 text-[#c94b0c]'
                        : 'bg-[#f0f0d8] border-transparent text-[#8b8b70]'
                      }`}>
                      <MapPin size={10} strokeWidth={2.5} />
                      <span className="font-mono text-[10px] font-bold">
                        {marker.lat.toFixed(3).slice(0, 5)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#8b8b70] bg-[#f0f0d8]">
          <div className="flex justify-between items-center text-[10px] text-[#5a372c]/70 font-mono uppercase tracking-wide">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#98c7b0] rounded-full ring-1 ring-[#5a372c]/10"></div>
              System Nominal
            </span>
            <span className="opacity-50">v3.2.0</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative h-full bg-[#f0f0d8]">
        <main className="flex-1 relative h-full w-full">
          <Map markers={markers} selectedDeviceId={selectedDeviceId} />

          {/* Floating Map Controls / Legend */}
          <div className="absolute top-6 left-6 pointer-events-none">
            <div className="bg-[#fdfdf5]/90 backdrop-blur border border-[#8b8b70] p-4 rounded-md shadow-sm pointer-events-auto">
              <h1 className="text-sm font-bold text-[#5a372c] uppercase tracking-widest mb-1">
                Global Monitor
              </h1>
              <div className="h-0.5 w-8 bg-[#c94b0c] mb-2"></div>
              <div className="text-[10px] text-[#8b8b70] font-mono">
                LIVESTREAM // SECURE L2
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
