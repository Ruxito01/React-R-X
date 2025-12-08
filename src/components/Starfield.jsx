import React, { useEffect, useRef } from 'react';

// Clase Star: representa cada estrella en el espacio 3D
class Star {
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth - canvasWidth / 2;
    this.y = Math.random() * canvasHeight - canvasHeight / 2;
    this.z = Math.random() * canvasWidth;
    this.prevZ = this.z;
  }

  // Actualiza la posición de la estrella (movimiento hacia adelante)
  update(speed) {
    this.prevZ = this.z;
    this.z -= speed;
  }

  // Reinicia la estrella cuando sale de la pantalla
  reset(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth - canvasWidth / 2;
    this.y = Math.random() * canvasHeight - canvasHeight / 2;
    this.z = canvasWidth;
    this.prevZ = this.z;
  }
}

const Starfield = () => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null });
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;

    // Función para ajustar el tamaño del canvas al contenedor
    const resizeCanvas = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Reinicializar estrellas cuando cambia el tamaño
      initStars();
    };

    // Inicializar array de estrellas
    const initStars = () => {
      const numStars = 400; // Cantidad base de estrellas
      starsRef.current = [];
      for (let i = 0; i < numStars; i++) {
        starsRef.current.push(new Star(canvas.width, canvas.height));
      }
    };

    // Manejo del mouse para generar estelas
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;

      // Generar estrellas adicionales cerca del mouse
      for (let i = 0; i < 3; i++) {
        const star = new Star(canvas.width, canvas.height);
        // Posicionar cerca del mouse
        star.x = (mouseRef.current.x - canvas.width / 2) + (Math.random() - 0.5) * 100;
        star.y = (mouseRef.current.y - canvas.height / 2) + (Math.random() - 0.5) * 100;
        star.z = Math.random() * 200 + 200; // Más cerca visualmente
        starsRef.current.push(star);
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    // Loop de animación
    const animate = () => {
      // Fondo semitransparente para crear efecto de destello/trail sin bloquear la imagen
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Centro del canvas
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Velocidad base del movimiento
      const speed = 3;

      // Renderizar cada estrella
      starsRef.current.forEach((star, index) => {
        star.update(speed);

        // Si la estrella sale de la pantalla, reiniciarla
        if (star.z < 1) {
          star.reset(canvas.width, canvas.height);
        }

        // Proyección 3D a 2D
        const sx = (star.x / star.z) * canvas.width + cx;
        const sy = (star.y / star.z) * canvas.height + cy;

        // Posición anterior para crear líneas
        const prevSx = (star.x / star.prevZ) * canvas.width + cx;
        const prevSy = (star.y / star.prevZ) * canvas.height + cy;

        // Calcular el tamaño basado en la profundidad (más cerca = más grande)
        const size = Math.max(0, (1 - star.z / canvas.width) * 3);

        // Estrellas blancas brillantes
        const alpha = Math.min(1, 0.6 + (1 - star.z / canvas.width) * 0.4);

        // --- EFECTO HOVER ELEGANTE ---
        let hoverMultiplier = 1;
        let hoverColor = { r: 255, g: 255, b: 255 }; // Blanco por defecto
        let glowIntensity = 0;

        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          // Calcular distancia del mouse a la estrella proyectada en 2D
          const dx = sx - mouseRef.current.x;
          const dy = sy - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const hoverRadius = 150; // Radio de influencia del hover

          if (distance < hoverRadius) {
            // Factor de proximidad (1 = muy cerca, 0 = en el borde)
            const proximity = 1 - (distance / hoverRadius);
            
            // Hacer estrellas más grandes cerca del mouse
            hoverMultiplier = 1 + proximity * 2; // Hasta 3x más grandes
            
            // Cambiar a tono dorado brillante
            const goldAmount = proximity * 0.7;
            hoverColor = {
              r: 255,
              g: Math.floor(255 - goldAmount * 40), // Ligeramente menos verde
              b: Math.floor(255 - goldAmount * 155)  // Mucho menos azul = dorado
            };
            
            // Intensidad de brillo/glow
            glowIntensity = proximity;
          }
        }

        // Aplicar multiplicador de hover al tamaño
        const finalSize = size * hoverMultiplier;
        const finalAlpha = Math.min(1, alpha + glowIntensity * 0.3);

        // Dibujar la estrella como línea (estela/destello)
        ctx.strokeStyle = `rgba(${hoverColor.r}, ${hoverColor.g}, ${hoverColor.b}, ${finalAlpha})`;
        ctx.lineWidth = finalSize;
        ctx.beginPath();
        ctx.moveTo(prevSx, prevSy);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        // Dibujar punto brillante blanco/dorado
        ctx.fillStyle = `rgba(${hoverColor.r}, ${hoverColor.g}, ${hoverColor.b}, ${finalAlpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, finalSize, 0, Math.PI * 2);
        ctx.fill();

        // Agregar halo brillante para estrellas en hover
        if (glowIntensity > 0.3) {
          const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, finalSize * 4);
          gradient.addColorStop(0, `rgba(${hoverColor.r}, ${hoverColor.g}, ${hoverColor.b}, ${glowIntensity * 0.6})`);
          gradient.addColorStop(0.5, `rgba(${hoverColor.r}, ${hoverColor.g}, ${hoverColor.b}, ${glowIntensity * 0.3})`);
          gradient.addColorStop(1, `rgba(${hoverColor.r}, ${hoverColor.g}, ${hoverColor.b}, 0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(sx, sy, finalSize * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Limpiar estrellas extras generadas por el mouse (mantener pool manejable)
      if (starsRef.current.length > 600) {
        starsRef.current = starsRef.current.slice(0, 450);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Inicializar
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Iniciar animación
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="starfield-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    />
  );
};

export default Starfield;
