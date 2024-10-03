import React, { useState } from 'react';

// Function to get color based on vegetation type
import {getColor} from './somefun';


const Legend = () => {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ top: 10, left: 10 });
  
  // Define vegetation categories to be displayed in the legend
  const vegetationCategories = ['草甸', '草原', '草丛'];

  // Handle mouse down event to start dragging
  const handleMouseDown = (e) => {
    setDragging(true);
  };

  // Handle mouse move event to drag the component
  const handleMouseMove = (e) => {
    if (dragging) {
      const newTop = e.pageY - 50;   // Use pageY instead of clientY
      const newLeft = e.pageX - 50;  // Use pageX instead of clientX

      // No vertical limit (so it can drag to the bottom)
      const limitedTop = Math.max(newTop, 10); // Prevent going above the top edge

      // Limit dragging horizontally within the viewport (no overflow on the left or right)
      const maxLeft = window.innerWidth - 100;  // Account for width of the legend (100px)
      const limitedLeft = Math.min(Math.max(newLeft, 10), maxLeft); // Prevent going off the left or right

      setPosition({ top: limitedTop, left: limitedLeft });
    }
  };

  // Handle mouse up event to stop dragging
  const handleMouseUp = () => {
    setDragging(false);
  };

  // Attach mouse events
  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  return (
    <div
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 1000,
        cursor: 'move', // Change the cursor to indicate it's draggable
      }}
      onMouseDown={handleMouseDown}
    >
      <h4>Legend</h4>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {vegetationCategories.map((category, index) => (
          <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: getColor(category), // Use the color value
              marginRight: '10px',
              border: '1px solid #ddd',
            }}></div>
            <span>{category}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Legend;
