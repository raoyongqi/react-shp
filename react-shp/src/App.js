import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.chinatmsproviders/src/leaflet.ChineseTmsProviders';

const MapComponent = () => {
  const mapRef = useRef(null); // Create a ref to store the map instance

  useEffect(() => {
    // Initialize map only once
    const map = L.map(mapRef.current, {
      center: [35.8617, 104.1954], // Center point for China
      zoom: 4, // Initial zoom level
    });

    // Add tile layer
    L.tileLayer.chinaProvider('GaoDe.Normal.Map', {
      maxZoom: 8,
      attribution: 'Map data &copy; <a href="https://www.amap.com/">高德地图</a>',
    }).addTo(map);

    // Clean up on unmount
    return () => {
      map.remove();
    };
  }, []);

  return <div ref={mapRef} style={{ height: '500px', width: '100%' }} />;
};

export default MapComponent;
