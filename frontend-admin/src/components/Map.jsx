import React, { useMemo } from 'react';
import { User } from 'lucide-react';
import { Map as MapCN, MapMarker, MarkerTooltip as MapTooltip, MarkerContent } from '@/components/ui/map';
import 'maplibre-gl/dist/maplibre-gl.css';

const Map = ({ markers, selectedDeviceId }) => {
    // UseMemo to prevent re-rendering map config unnecessarily
    const initialViewState = useMemo(() => ({
        longitude: -43.1729,
        latitude: -22.9068,
        zoom: 12
    }), []);

    const mapRef = React.useRef();

    // Fly to the Selected Device when it changes or updates
    React.useEffect(() => {
        if (selectedDeviceId && markers[selectedDeviceId] && mapRef.current) {
            const marker = markers[selectedDeviceId];
            mapRef.current.flyTo({
                center: [marker.lng, marker.lat],
                zoom: 16,
                pitch: 45, // Add a slight pitch for 3D feel
                essential: true
            });
        }
    }, [selectedDeviceId, markers]); // Trigger on selection change OR data update for that device

    return (
        <div className="w-full h-full relative">
            <MapCN
                ref={mapRef}
                initialViewState={initialViewState}
                mapStyle="mapbox://styles/mapbox/dark-v11" // Dark mode map if possible, but mapcn defaults might need customization. Assuming default here.
            >
                {Object.values(markers).map((marker) => (
                    <MapMarker
                        key={marker.id}
                        longitude={marker.lng}
                        latitude={marker.lat}
                    >
                        <MarkerContent>
                            <div className="relative group cursor-pointer">
                                <div className={`h-12 w-12 rounded-full border-[3px] border-[#f0f0d8] shadow-md flex items-center justify-center text-[#f0f0d8] transition-all duration-300
                                    ${selectedDeviceId === marker.id ? 'bg-[#c94b0c] scale-110' : 'bg-[#5a372c] hover:bg-[#c94b0c]/80'}`}>
                                    <User size={20} />
                                </div>

                                {/* Live Pulse for Selected */}
                                {selectedDeviceId === marker.id && (
                                    <div className="absolute inset-0 -m-2 rounded-full border-2 border-[#c94b0c] animate-ping opacity-40"></div>
                                )}
                            </div>
                        </MarkerContent>
                        <MapTooltip offset={30} className="bg-[#f0f0d8] border-2 border-[#c94b0c] text-[#5a372c] rounded-lg shadow-xl p-4 min-w-[180px]">
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#8b8b70]/20">
                                <div className="w-2 h-2 rounded-full bg-[#c94b0c]"></div>
                                <span className="text-sm font-bold tracking-wide uppercase">{marker.info || 'Unknown'}</span>
                            </div>

                            <div className="space-y-1 font-mono text-xs">
                                <div className="flex justify-between">
                                    <span className="text-[#8b8b70]">ID</span>
                                    <span className="font-bold opacity-80">{marker.id.substring(0, 8)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#8b8b70]">POS</span>
                                    <span className="text-[#c94b0c]">{marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}</span>
                                </div>
                            </div>
                        </MapTooltip>
                    </MapMarker>
                ))}
            </MapCN>
        </div>
    );
};

export default Map;
