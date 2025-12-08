import React, { useEffect, useRef } from 'react';

const FlashlightOverlay = ({ backgroundImage }) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null });
  const imageRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;

    // Cargar la imagen de fondo
    const img = new Image();
    img.src = backgroundImage;
    img.onload = () => {
      imageRef.current = img;
    };

    // Ajustar tamaño del canvas al contenedor
    const resizeCanvas = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    // Rastrear posición del mouse
    const handleMouseMove = (e) => {
      const rect = parent.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    // Renderizar la imagen solo donde está el mouse
    const render = () => {
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mouseRef.current.x !== null && mouseRef.current.y !== null && imageRef.current) {
        const spotlightRadius = 250; // Radio del área visible
        
        // Guardar estado del contexto
        ctx.save();
        
        // Crear máscara circular con gradiente suave (bordes difuminados tipo linterna)
        const gradient = ctx.createRadialGradient(
          mouseRef.current.x, 
          mouseRef.current.y, 
          0, 
          mouseRef.current.x, 
          mouseRef.current.y, 
          spotlightRadius
        );
        // Centro: totalmente visible
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.95)'); // Casi todo visible
        gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.5)');  // Empieza a difuminar
        gradient.addColorStop(0.95, 'rgba(255, 255, 255, 0.1)'); // Muy difuminado
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');      // Totalmente transparente

        // Crear clip path circular
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, spotlightRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Dibujar la imagen NÍTIDA (sin blur)
        ctx.globalAlpha = 0.9; // Casi totalmente opaca
        ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
        
        // Aplicar gradiente para difuminar los bordes del círculo
        ctx.globalCompositeOperation = 'destination-in';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Restaurar estado
        ctx.restore();
      }

      requestAnimationFrame(render);
    };

    // Inicializar
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    parent.addEventListener('mousemove', handleMouseMove);
    parent.addEventListener('mouseleave', handleMouseLeave);

    // Iniciar renderizado
    render();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [backgroundImage]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2, // Sobre estrellas (z-index: 1)
        pointerEvents: 'none',
      }}
    />
  );
};

export default FlashlightOverlay;
