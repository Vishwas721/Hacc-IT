// File: src/components/MapResizeComponent.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const MapResizeComponent = () => {
    const map = useMap();

    useEffect(() => {
        // This function tells the map to re-evaluate its size.
        // The timeout ensures it runs after other elements have settled.
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);

        return () => clearTimeout(timer); // Cleanup on component unmount
    }, [map]);

    return null; // This component renders nothing itself
};

export default MapResizeComponent;