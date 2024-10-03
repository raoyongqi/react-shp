// 初始化地图的函数

import AMapLoader from '@amap/amap-jsapi-loader';
import L from 'leaflet';

export  const initMap = async (container, selectedCity,mapInstance) => {
  window._AMapSecurityConfig = {
    securityJsCode: "16f81296c450f8bb5149a86056dae9c8",
  };

  if (!container) {
    console.error("Map container is required");
    return;
  }

  try {
    const AMap = await AMapLoader.load({
      key: "514c99148afec38a187b745ddbd1e517",
      version: "2.0",
      plugins: [
        "Map3D",
        "AMap.Scale",
        "AMap.ToolBar",
        "AMap.MouseTool",
        "AMap.PolyEditor",
        "AMap.PlaceSearch",
        "AMap.Autocomplete",
        "AMap.DistrictSearch",
        "AMap.MarkerClusterer",
      ],
      Loca: { version: '2.0.0' },
      AMapUI: {
        version: "1.1",
        plugins: ["overlay/SimpleMarker"],
      },
    });

    // Assuming `mapInstance` is a reference to your map element.
    const map = mapInstance;
    if (!map) {
      console.error("Map instance is not initialized");
      return;
    }

    const districtSearch = new AMap.DistrictSearch({
      extensions: "all",
      subdistrict: 0,
    });

    return new Promise((resolve, reject) => {
      districtSearch.search(selectedCity, (status, result) => {
        if (status === 'complete' && result.districtList.length > 0) {
          const boundaries = result.districtList[0].boundaries;
          const pathArray = [];

          if (boundaries && Array.isArray(boundaries)) {
            boundaries.forEach(boundary => {
              if (Array.isArray(boundary)) {
                const coordinates = boundary.map(coord => {
                  if (coord instanceof AMap.LngLat) {
                    // Convert AMap LngLat to Leaflet format [lat, lng]
                    return [coord.lat, coord.lng];
                  } else {
                    console.warn('Invalid coordinate format:', coord);
                    return null;
                  }
                }).filter(latlng => latlng !== null);

                if (coordinates.length > 0) {
                  pathArray.push(coordinates);
                }
              }
            });

            // Create an outer boundary for the entire map area
            const outer = [
              new AMap.LngLat(-360, 90, true),
              new AMap.LngLat(-360, -90, true),
              new AMap.LngLat(360, -90, true),
              new AMap.LngLat(360, 90, true),
            ];

            // Add outer boundary as the first path
            pathArray.unshift(outer.map(coord => [coord.lat, coord.lng]));

            // Create the Leaflet-compatible polygon
            const polygon = L.polygon(pathArray, {
              color: "#99ffff",
              weight: 4,
              opacity: 1,
              fillColor: "#fff",
              fillOpacity: 1,  // Semi-transparent fill to mask the area
            });

            // Resolve the Promise with the Leaflet polygon
            resolve(polygon);
          } else {
            reject(new Error('Invalid boundary data format:', boundaries));
          }
        } else {
          reject(new Error('Failed to retrieve city information or no result found'));
        }
      });
    });

  } catch (error) {
    console.error("Error loading AMap or initializing map:", error);
    throw error;
  }
};