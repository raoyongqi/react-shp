import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.chinatmsproviders/src/leaflet.ChineseTmsProviders';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { handleGeojsonSelection } from './handleGeojsonSelection';

import Legend from './legend'; // Import the Legend component

const CombinedComponent = () => {
  const [geojsonFiles, setGeojsonFiles] = useState([]); // 读取的GeoJSON文件列表
  const [selectedGeojson, setSelectedGeojson] = useState(''); // 选中的GeoJSON文件
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [size, setSize] = useState({ width: 2000, height: 2000 }); // 初始地图容器的大小
  const polygonRef = useRef(null); // 用来存储polygon

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

    // 监听窗口大小变化，重新调整地图大小
    const handleResize = () => {
      map.invalidateSize(); // 重新计算地图大小
    };
    window.addEventListener('resize', handleResize);

    // 清理函数：组件卸载时移除事件监听
    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove(); // 组件卸载时清理地图
    };
  }, []);

  // 调用 handleGeojsonSelection 每当选择的 GeoJSON 文件发生变化时
  useEffect(() => {
    if (selectedGeojson) {
      // 调用 handleGeojsonSelection 函数，传入所需参数
      handleGeojsonSelection(selectedGeojson, mapInstance.current, setSelectedGeojson, polygonRef);
    }
  }, [selectedGeojson]); // 当 selectedGeojson 改变时触发

  // 处理地图容器大小调整
  const handleResizeStop = (e, { size }) => {
    setSize(size); // 更新地图容器的宽高
  };

  return (
    <div>
      {/* 可调整大小的容器 */}
      <ResizableBox
        width={size.width}  // 动态宽度
        height={size.height} // 动态高度
        minConstraints={[300, 300]} // 最小宽度和高度
        maxConstraints={[1000, 800]} // 最大宽度和高度
        className="resizable-box"
        resizeHandles={['se']} // 右下角的调整大小句柄
        onResizeStop={handleResizeStop} // 当调整大小完成时更新状态
        style={{ border: '2px solid #000', marginBottom: '20px', padding: '10px' }} // 设置边框、间距和内边距
      >
        {/* 地图容器 */}
        <div
          ref={mapRef}
          style={{ height: 'calc(100% - 20px)', width: 'calc(100% - 20px)' }} // 留出容器边距
        />
      </ResizableBox>

      {/* Legend */}
      <Legend />

      {/* 下拉选择GeoJSON */}
      <select
        onChange={(e) => setSelectedGeojson(e.target.value)} // 更新选中的GeoJSON
        value={selectedGeojson}
      >
        <option value="">Select GeoJSON</option>
        {geojsonFiles.map((file, index) => (
          <option key={index} value={file}>
            {file}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CombinedComponent;
