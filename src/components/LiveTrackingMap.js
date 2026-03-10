'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons
const clientIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const workerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Auto-adjust bounds to fit both markers
function MapBounds({ clientPos, workerPos }) {
    const map = useMap();
    useEffect(() => {
        if (clientPos && workerPos) {
            const bounds = L.latLngBounds([clientPos, workerPos]);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (clientPos) {
            map.setView(clientPos, 14);
        }
    }, [clientPos, workerPos, map]);
    return null;
}

export default function LiveTrackingMap({ clientLocation, workerLocation, isCompleted, workerName }) {
    const [workerPos, setWorkerPos] = useState(null);
    const [clientPos, setClientPos] = useState(null);

    // Initialize positions
    useEffect(() => {
        if (clientLocation?.lat && clientLocation?.lng) {
            setClientPos([clientLocation.lat, clientLocation.lng]);
        }

        if (workerLocation?.lat && workerLocation?.lng) {
            setWorkerPos([workerLocation.lat, workerLocation.lng]);
        } else if (clientLocation?.lat && clientLocation?.lng) {
            // Generate a fake starting position for the worker 2-5km away for the demo if no explicit location given
            const offsetLat = (Math.random() - 0.5) * 0.05;
            const offsetLng = (Math.random() - 0.5) * 0.05;
            setWorkerPos([clientLocation.lat + offsetLat, clientLocation.lng + offsetLng]);
        }
    }, [clientLocation, workerLocation]);

    // Simulate worker moving towards client
    useEffect(() => {
        if (!workerPos || !clientPos || isCompleted) return;

        // Distance vector
        const dLat = clientPos[0] - workerPos[0];
        const dLng = clientPos[1] - workerPos[1];

        // If very close, snap to client
        if (Math.abs(dLat) < 0.0001 && Math.abs(dLng) < 0.0001) {
            setWorkerPos(clientPos);
            return;
        }

        // Move the worker 2% of the way every 2 seconds
        const interval = setInterval(() => {
            setWorkerPos(prev => {
                if (!prev) return prev;
                const stepLat = (clientPos[0] - prev[0]) * 0.02;
                const stepLng = (clientPos[1] - prev[1]) * 0.02;
                return [prev[0] + stepLat, prev[1] + stepLng];
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [workerPos, clientPos, isCompleted]);

    if (!clientPos) {
        return <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '12px' }}>Loading Map Data...</div>;
    }

    return (
        <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', zIndex: 0, position: 'relative' }}>
            <MapContainer center={clientPos} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {workerPos && <MapBounds clientPos={clientPos} workerPos={workerPos} />}

                {/* Client Location */}
                <Marker position={clientPos} icon={clientIcon}>
                    <Popup>Your Location (Job Site)</Popup>
                </Marker>

                {/* Worker Location & Route line */}
                {workerPos && !isCompleted && (
                    <>
                        <Marker position={workerPos} icon={workerIcon}>
                            <Popup>{workerName || 'Worker'} is moving towards you...</Popup>
                        </Marker>
                        <Polyline positions={[workerPos, clientPos]} color="#3b82f6" dashArray="5, 10" weight={3} />
                    </>
                )}
            </MapContainer>
        </div>
    );
}
