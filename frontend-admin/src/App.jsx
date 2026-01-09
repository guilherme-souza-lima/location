import { useState, useEffect, useRef } from 'react';
import Map from './components/Map';

function App() {
  const [markers, setMarkers] = useState({});
  const [connected, setConnected] = useState(false);
  const reconnectTimeout = useRef(null);

  useEffect(() => {
    let ws;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Connect to the API port 1800 on the same hostname
      const wsUrl = `${protocol}//${window.location.hostname}:1800/ws?type=viewer`;

      console.log('Connecting to WebSocket:', wsUrl);
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WS Connection Established');
        setConnected(true);
      };

      ws.onmessage = (event) => {
        console.log('WS Message Received:', event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.id && data.lat && data.lng) {
            console.log('Updating marker for:', data.id);
            setMarkers(prev => ({
              ...prev,
              [data.id]: data
            }));
          } else {
            console.warn('Invalid message format:', data);
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

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      {/* Sidebar for Connection List */}
      <aside className="w-80 bg-white shadow-md z-20 flex flex-col border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Connected Devices</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-600">{connected ? 'System Online' : 'System Offline'}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.keys(markers).length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              No devices connected.
            </div>
          ) : (
            Object.values(markers).map(marker => (
              <div key={marker.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-700">{marker.id}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Active</span>
                </div>
                <div className="text-xs text-gray-500">
                  <div>{marker.info}</div>
                  <div className="font-mono mt-1">{marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative h-full">
        <header className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-sm font-bold text-gray-800">Real-Time Tracker Admin</h1>
        </header>
        <main className="flex-1 relative h-full w-full">
          <Map markers={markers} />
        </main>
      </div>
    </div>
  );
}

export default App;
