// File: src/pages/MapView.jsx
/* eslint-disable no-unused-vars */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Container, Button } from 'react-bootstrap';
import styles from './ReportDetails.module.css'; // We can reuse the same styles

const MapView = () => {
    const navigate = useNavigate();
    const { state } = useLocation(); // Get the state passed from the Link component

    // If the page is loaded directly without location data, handle it gracefully
    if (!state || !state.location) {
        return (
            <Container>
                <h1>Error</h1>
                <p>No location data provided. Please go back to a report to view its location.</p>
                <Button onClick={() => navigate(-1)}>&larr; Go Back</Button>
            </Container>
        );
    }

    const { location, description } = state;
    const position = [location.coordinates[1], location.coordinates[0]];

    return (
        <div style={{ height: 'calc(100vh - 90px)', width: '100%' }}>
            <MapContainer center={position} zoom={17} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={position}>
                    <Popup>{description || 'Report Location'}</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default MapView;