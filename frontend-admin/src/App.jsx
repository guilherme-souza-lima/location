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
    setSelectedDeviceId(deviceId);
  };

  // Palette "Earth Tech":
  // #5a372c (Brown) -> Text / Sidebar Dark
  // #8b8b70 (Olive) -> Borders / Muted
  // #98c7b0 (Mint) -> Success
  // #f0f0d8 (Cream) -> Backgrounds (Light Theme)
  // #c94b0c (Rust) -> Accents / Active

  return (
    <div className="flex h-screen w-screen bg-[#f0f0d8] text-[#5a372c] overflow-hidden font-sans selection:bg-[#c94b0c]/30">

      {/* Sidebar */}
      <aside className="w-96 bg-[#fdfdf5] border-r border-[#8b8b70] flex flex-col shadow-xl z-20">

        {/* Header Section */}
        <div className="p-6 border-b border-[#8b8b70]/50 bg-[#f0f0d8]/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight text-[#5a372c] uppercase flex items-center gap-2">
              <Activity size={20} className="text-[#c94b0c]" />
              Operations
            </h2>
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-sm border ${connected ? 'bg-[#98c7b0]/20 border-[#98c7b0] text-[#5a372c]' : 'bg-red-100 border-red-400 text-red-600'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#5a372c] animate-pulse' : 'bg-red-600'}`}></div>
              <span className="text-[10px] font-bold tracking-widest uppercase">{connected ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8b70] group-focus-within:text-[#c94b0c] transition-colors" size={16} />
            <input
              type="text"
              placeholder="SEARCH UNIT..."
              className="w-full bg-white border border-[#8b8b70] rounded-sm py-2.5 pl-10 pr-4 text-xs font-mono text-[#5a372c] placeholder:text-[#8b8b70] focus:outline-none focus:border-[#c94b0c] focus:ring-1 focus:ring-[#c94b0c] transition-all uppercase tracking-wide"
            />
          </div>
        </div>

        {/* Device List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fdfdf5]">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[10px] font-bold text-[#8b8b70] uppercase tracking-widest">Active Links ({Object.keys(markers).length})</span>
          </div>

          {Object.keys(markers).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#8b8b70] space-y-3 border border-dashed border-[#8b8b70] rounded-sm bg-[#f0f0d8]/50 p-6 opacity-70">
              <Signal size={24} />
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wide">Signal Lost</p>
                <p className="text-[10px]">Awaiting telemetry...</p>
              </div>
            </div>
          ) : (
            Object.values(markers).map(marker => (
              <div
                key={marker.id}
                onClick={() => handleDeviceClick(marker.id)}
                className={`group cursor-pointer p-4 rounded-sm border transition-all duration-200 relative overflow-hidden
                  ${selectedDeviceId === marker.id
                    ? 'bg-white border-[#c94b0c] shadow-[4px_0_0_0_#c94b0c_inset] shadow-md'
                    : 'bg-white border-[#8b8b70]/40 hover:border-[#c94b0c]/50 hover:shadow-sm'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-1.5 rounded-sm border ${selectedDeviceId === marker.id ? 'bg-[#c94b0c] text-white border-[#c94b0c]' : 'bg-[#f0f0d8] text-[#8b8b70] border-[#8b8b70]/30'}`}>
                      <User size={16} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#5a372c] leading-tight">
                        {marker.info || 'Unknown Agent'}
                      </h3>
                      <p className="text-[10px] font-mono text-[#8b8b70] mt-0.5 uppercase">
                        ID: {marker.id.substring(0, 12)}
                      </p>
                    </div>
                  </div>

                  {/* Coordinates Tag */}
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border ${selectedDeviceId === marker.id ? 'bg-[#f0f0d8] border-[#c94b0c]/30' : 'bg-[#f0f0d8]/50 border-transparent'}`}>
                      <MapPin size={10} className={selectedDeviceId === marker.id ? 'text-[#c94b0c]' : 'text-[#8b8b70]'} />
                      <span className="font-mono text-[10px] font-medium text-[#5a372c]">
                        {marker.lat.toFixed(3)}, {marker.lng.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#8b8b70] bg-[#f0f0d8]">
          <div className="flex justify-between items-center text-[10px] text-[#5a372c]/70 font-mono uppercase tracking-wide">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#98c7b0] rounded-sm"></div>
              System Nominal
            </span>
            <span>v3.1.0</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative h-full bg-[#f0f0d8]">
        <main className="flex-1 relative h-full w-full">
          <Map markers={markers} selectedDeviceId={selectedDeviceId} />

          {/* Floating Map Controls / Legend */}
          <div className="absolute top-6 left-6 pointer-events-none">
            <div className="bg-white/90 backdrop-blur border border-[#8b8b70] p-4 rounded-sm shadow-sm pointer-events-auto">
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
