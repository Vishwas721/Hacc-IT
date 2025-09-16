// File: client-admin/src/pages/MapView.jsx

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useMap } from 'react-leaflet/hooks'; // Import the useMap hook
import L from 'leaflet'; // Import Leaflet
import 'leaflet.heat'; // Import the leaflet.heat plugin

import api from '../api/api';
import 'leaflet/dist/leaflet.css';

// This is our new, custom component that adds the heatmap to the map
const HeatmapComponent = ({ points }) => {
    const map = useMap(); // Get the underlying map instance

    useEffect(() => {
        if (!map || points.length === 0) return;

        // Create the heat layer with our points
        const heatLayer = L.heatLayer(points, { 
            radius: 25, 
            blur: 15,
            maxZoom: 18,
        });

        // Add the heat layer to the map
        map.addLayer(heatLayer);

        // Cleanup function: remove the layer when the component is unmounted or points change
        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, points]); // Rerun this effect if the map or points change

    return null; // This component doesn't render any HTML itself
};


const MapView = () => {
    const [reports, setReports] = useState([]);
    
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get('/reports');
                setReports(response.data);
            } catch (error) {
                console.error("Failed to fetch reports for map", error);
            }
        };
        fetchReports();
    }, []);

    // Format the points for leaflet.heat: [latitude, longitude, intensity]
    const heatmapPoints = reports.map(r => [
        r.location.coordinates[1], // Latitude
        r.location.coordinates[0], // Longitude
        1.0 // Intensity (can be adjusted based on urgency_score, etc.)
    ]);

    return (
        <MapContainer center={[23.3441, 85.3096]} zoom={12} style={{ height: '85vh', width: '100%', borderRadius: '0.75rem' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Render our custom heatmap component with the points */}
            <HeatmapComponent points={heatmapPoints} />
        </MapContainer>
    );
};

export default MapView;