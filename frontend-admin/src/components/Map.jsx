import React, { useMemo } from 'react';
import { User } from 'lucide-react';
import { Map as MapCN, MapMarker, MarkerTooltip as MapTooltip, MarkerContent } from '@/components/ui/map';
import 'maplibre-gl/dist/maplibre-gl.css';

const Map = ({ markers }) => {
    // UseMemo to prevent re-rendering map config unnecessarily
    const initialViewState = useMemo(() => ({
        longitude: -43.1729,
        latitude: -22.9068,
        zoom: 12
    }), []);

    const mapRef = React.useRef();

    React.useEffect(() => {
        if (Object.keys(markers).length > 0 && mapRef.current) {
            const lastMarkerKey = Object.keys(markers).pop();
            const marker = markers[lastMarkerKey];
            mapRef.current.flyTo({
                center: [marker.lng, marker.lat],
                zoom: 15, // Zoom in closer when tracking
                essential: true
            });
        }
    }, [markers]);

    return (
        <div className="w-full h-full relative">
            <MapCN
                ref={mapRef}
                initialViewState={initialViewState}
            >
                {Object.values(markers).map((marker) => (
                    <MapMarker
                        key={marker.id}
                        longitude={marker.lng}
                        latitude={marker.lat}
                        color="#3B82F6" // Tailwind blue-500
                    >
                        <MarkerContent>
                            <div className="relative">
                                <div className="h-8 w-8 rounded-full border-2 border-white bg-blue-500 shadow-lg flex items-center justify-center text-white">
                                    <User size={16} />
                                </div>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rotate-45 border-r border-b border-white"></div>
                            </div>
                        </MarkerContent>
                        <MapTooltip offset={20}>
                            <div className="text-sm font-bold text-gray-900">{marker.id}</div>
                            <div className="text-xs text-gray-500">
                                {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
                            </div>
                        </MapTooltip>
                    </MapMarker>
                ))}
            </MapCN>
        </div>
    );
};

export default Map;
