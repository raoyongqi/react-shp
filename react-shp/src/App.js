import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.chinatmsproviders/src/leaflet.ChineseTmsProviders';
import AMapLoader from '@amap/amap-jsapi-loader';
const CombinedComponent = () => {
  const [geojsonFiles, setGeojsonFiles] = useState([]); // 读取的GeoJSON文件列表
  const [selectedGeojson, setSelectedGeojson] = useState(''); // 选中的GeoJSON文件
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // 省份中心点坐标
  const provinceCenters = {
    '内蒙古自治区': [40.8173, 111.7653],   // 内蒙古自治区
    '四川省': [30.6592, 104.0665],         // 四川省
    '新疆维吾尔自治区': [43.7934, 87.6272], // 新疆维吾尔自治区
    '甘肃省': [36.0583, 103.8343],         // 甘肃省
    '西藏自治区': [29.6475, 91.1175],      // 西藏自治区
    '青海省': [36.6171, 101.7789],         // 青海省
  };

  // 读取 geojson 文件夹下的文件列表
  useEffect(() => {
    const fetchGeojsonFiles = async () => {
      try {
        const response = await fetch('http://localhost:8000/geojson');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setGeojsonFiles(data); // 假设返回的数据是文件名列表
      } catch (error) {
        console.error('Error fetching GeoJSON file names:', error);
      }
    };

    fetchGeojsonFiles();
  }, []);

  // 初始化地图
  useEffect(() => {
    const map = L.map(mapRef.current, {
      center: [35.8617, 104.1954], // China center
      zoom: 4, // 初始缩放级别
    });

    // Add tile layer
    L.tileLayer.chinaProvider('GaoDe.Normal.Map', {
      maxZoom: 8,
      attribution: 'Map data &copy; <a href="https://www.amap.com/">高德地图</a>',
    }).addTo(map);

    mapInstance.current = map; // 存储地图实例

    return () => {
      map.remove(); // 组件卸载时清理
    };
  }, []);

  // 获取选中省份的掩膜（从 AMap 获取）
  const fetchProvinceMask = async (selectedCity) => {
    const initMap = async (container, selectedCity) => {
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
        const map = mapInstance.current;
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
  
    // Initialize map with the container and the selected city
    return initMap("your-map-container", selectedCity);  // Replace with the actual container ID or reference
  };
  

  // 处理 GeoJSON 文件选择
  const handleGeojsonSelection = async (geojsonFile) => {
    setSelectedGeojson(geojsonFile);

    try {
      const geojsonResponse = await fetch(`http://localhost:8000/geojson/${geojsonFile}`);

      if (!geojsonResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const geojsonData = await geojsonResponse.json();

      // Remove previous GeoJSON layer if exists
      if (mapInstance.current.geojsonLayer) {
        mapInstance.current.geojsonLayer.clearLayers(); // Clear previous layers
      }

      // Custom styling function based on 'Major Vege'
      const getColor = (majorVege) => {
        switch (majorVege) {
          case '草甸': return 'purple';
          case '草原': return 'blue';
          case '草丛': return 'yellow';
          default: return 'gray'; // Default color if not matched
        }
      };

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
      }).addTo(mapInstance.current);

      // Store the GeoJSON layer for potential removal later
      mapInstance.current.geojsonLayer = geoJsonLayer;

      // Move map center to the selected province
      const provinceName = geojsonFile.split('.geojson')[0]; // Extract province name from file name
      const center = provinceCenters[provinceName];
      if (center) {
        mapInstance.current.setView(center, 6); // Set the map view to the center of the province with zoom level 6
        fetchProvinceMask(provinceName).then(polygon => {
          // Add the polygon to the Leaflet map
          polygon.addTo(mapInstance.current);
        }).catch(error => {
          console.error('Error fetching province mask:', error);
        });
      }

    } catch (error) {
      console.error('Error loading or parsing GeoJSON file:', error);
    }
  };

  return (
    <div>
      <div ref={mapRef} style={{ height: '100vh', width: '100%' }} /> {/* Fullscreen map */}
      <select onChange={(e) => handleGeojsonSelection(e.target.value)} value={selectedGeojson}>
        <option value="">Select a GeoJSON file</option>
        {geojsonFiles.map((geojsonFile, index) => (
          <option key={index} value={geojsonFile}>{geojsonFile.split('.geojson')[0]}</option>
        ))}
      </select>
    </div>
  );
};

export default CombinedComponent;
