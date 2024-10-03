
import {initMap} from  './amap';
import {getColor,provinceCenters} from './somefun';
import L from 'leaflet';

const fetchProvinceMask = async (selectedCity,mapInstance) => {

    // Initialize map with the container and the selected city
    return initMap("your-map-container", selectedCity,mapInstance);  // Replace with the actual container ID or reference
  };

  // 处理 GeoJSON 文件选择
export const handleGeojsonSelection = async (geojsonFile,mapInstance,setSelectedGeojson,polygonRef) => {
    setSelectedGeojson(geojsonFile);

    try {
      const geojsonResponse = await fetch(`http://localhost:8000/geojson/${geojsonFile}`);

      if (!geojsonResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const geojsonData = await geojsonResponse.json();

      // Remove previous GeoJSON layer if exists
      if (mapInstance.geojsonLayer) {
        // console.log(mapInstance.geojsonLayer)
        mapInstance.geojsonLayer.clearLayers(); // Clear previous layers
      }
    //   console.log(mapInstance.polygon)

        if (polygonRef.current) {
            mapInstance.removeLayer(polygonRef.current); // 移除单个图层
        }



      // Custom styling function based on 'Major Vege'
      // Add GeoJSON to the map with zIndex to make it the topmost layer
      const geoJsonLayer = L.geoJSON(geojsonData, {
        style: (feature) => {
          return {
            color: getColor(feature.properties['Major Vege']), // Use the color based on the 'Major Vege' property
            weight: 0,
            opacity: 1,
          };
        },
        zIndex: 9999,  // Set a high z-index to ensure it's on top
      }).addTo(mapInstance);
      const layerCount = Object.keys(mapInstance._layers).length;
      console.log('Number of layers:', layerCount);
      // Store the GeoJSON layer for potential removal later
      mapInstance.geojsonLayer = geoJsonLayer;

      // Move map center to the selected province
      const provinceName = geojsonFile.split('.geojson')[0]; // Extract province name from file name
      const center = provinceCenters[provinceName];
      if (center) {
        mapInstance.setView(center, 6); // Set the map view to the center of the province with zoom level 6
        fetchProvinceMask(provinceName,mapInstance).then(polygon => {
          // Add the polygon to the Leaflet map
               // Remove previous province mask if exists
               polygonRef.current = polygon;
               polygon.addTo(mapInstance);

        }).catch(error => {
          console.error("Error fetching province mask:", error);
        });
      }

    } catch (error) {
      console.error("Failed to load GeoJSON data:", error);
    }
  };