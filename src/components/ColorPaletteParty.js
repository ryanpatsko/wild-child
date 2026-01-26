import React from 'react';
import colorPaletteInfo1 from '../assets/color-palette/color-palette-info-1.jpg';
import colorPaletteInfo2 from '../assets/color-palette/color-palette-info-2.jpg';

const ColorPaletteParty = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Color Palette Party</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <img 
          src={colorPaletteInfo1} 
          alt="Color Palette Party Information" 
          style={{ width: '100%', height: 'auto', display: 'block', marginBottom: '1rem' }}
        />
        <img 
          src={colorPaletteInfo2} 
          alt="Color Palette Party Information" 
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>
    </div>
  );
};

export default ColorPaletteParty;
