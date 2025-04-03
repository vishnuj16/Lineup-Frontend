// Add this to both your Login.js and Register.js files

// First, create a BackgroundAnimation component
import React, { useEffect, useRef } from 'react';

const BackgroundAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Resize handling
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Create floating elements
    const elements = [];
    const shapes = ['circle', 'triangle', 'square', 'star'];
    const colors = ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#6B66FF', '#4ECDC4'];
    
    for (let i = 0; i < 30; i++) {
      elements.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 20 + 10,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.1
      });
    }
    
    // Draw functions for different shapes
    const drawShape = (ctx, element) => {
      ctx.save();
      ctx.globalAlpha = element.opacity;
      ctx.fillStyle = element.color;
      ctx.translate(element.x, element.y);
      ctx.rotate(element.rotation);
      
      switch(element.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, element.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -element.size);
          ctx.lineTo(element.size, element.size);
          ctx.lineTo(-element.size, element.size);
          ctx.closePath();
          ctx.fill();
          break;
        case 'square':
          ctx.fillRect(-element.size/2, -element.size/2, element.size, element.size);
          break;
        case 'star':
          drawStar(ctx, 0, 0, 5, element.size/2, element.size);
          break;
        default:
          ctx.fillRect(-element.size/2, -element.size/2, element.size, element.size);
      }
      
      ctx.restore();
    };
    
    const drawStar = (ctx, cx, cy, spikes, innerRadius, outerRadius) => {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      let step = Math.PI / spikes;
      
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      
      for(let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      elements.forEach(element => {
        // Update position
        element.x += element.speedX;
        element.y += element.speedY;
        element.rotation += element.rotationSpeed;
        
        // Bounce off edges
        if (element.x < 0 || element.x > width) element.speedX *= -1;
        if (element.y < 0 || element.y > height) element.speedY *= -1;
        
        // Draw the element
        drawShape(ctx, element);
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default BackgroundAnimation;