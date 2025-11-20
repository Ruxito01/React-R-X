// src/components/InteractiveBackground.jsx
import React from 'react';
import './InteractiveBackground.css';

// Importa tus 5 imágenes
import img1 from '../assets/login-bg-1.jpg';
import img2 from '../assets/login-bg-2.jpg';
import img3 from '../assets/login-bg-3.jpg';
import img4 from '../assets/login-bg-4.jpg';
import img5 from '../assets/login-bg-5.jpg';

const images = [img1, img2, img3, img4, img5];

const InteractiveBackground = () => {
  return (
    <div className="interactive-background">
      {images.map((img, index) => (
        <div
          key={index}
          className="background-strip"
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
    </div>
  );
};

export default InteractiveBackground;