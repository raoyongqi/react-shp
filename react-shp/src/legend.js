import React from 'react';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

// Function to get color based on vegetation type
const getColor = (majorVege) => {
  switch (majorVege) {
    case '草甸': return 'purple';
    case '草原': return 'blue';
    case '草丛': return 'yellow';
    default: return 'gray'; // Default color if not matched
  }
};

const Legend = () => {
  // Define vegetation categories to be displayed in the legend
  const vegetationCategories = ['草甸', '草原', '草丛'];

  return (
    <ResizableBox
      width={200}   // Initial width of the legend
      height={200}  // Initial height of the legend
      minConstraints={[100, 100]}  // Minimum width and height
      maxConstraints={[300, 300]}  // Maximum width and height
      className="resizable-box"
      resizeHandles={['se']}   // Resize from the bottom-right corner
      style={{
        position: 'absolute',
        bottom: 10,  // Move to bottom
        right: 10,   // Move to right
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 1000,
        MozWindowDragging: true
      }}
    >
      <div style={{ padding: '10px', overflow: 'auto' }}>
        <h4>Legend</h4>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {vegetationCategories.map((category, index) => (
            <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: getColor(category), // Use the color value
                marginRight: '10px',
                border: '1px solid #ddd'
              }}></div>
              <span>{category}</span>
            </li>
          ))}
        </ul>
      </div>
    </ResizableBox>
  );
};

export default Legend;
