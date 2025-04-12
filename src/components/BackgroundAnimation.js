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
    
    // Wolf silhouette data
    const wolfSilhouettes = [
      // Wolf head silhouette path data
      "M15,0 C18,2 20,5 21,8 C25,7 28,8 30,12 C31,15 30,18 28,20 C30,22 30,25 28,27 C25,29 21,29 18,27 C16,29 12,30 9,29 C5,27 3,24 2,20 C0,18 -1,14 0,10 C2,5 5,2 8,1 C10,0 13,-1 15,0",
      // Wolf howling silhouette
      "M10,25 C12,22 13,18 14,15 C15,12 16,8 15,5 C17,4 19,2 20,0 C21,3 23,5 25,6 C27,6 29,5 30,3 C31,6 30,9 28,11 C29,13 30,16 28,18 C26,20 24,20 22,19 C23,22 22,25 20,27 C18,29 15,30 12,29 C9,28 8,25 10,25",
      // Running wolf silhouette
      "M2,15 C5,13 8,12 10,10 C13,8 15,5 18,3 C20,2 23,1 25,2 C27,3 28,5 27,7 C25,9 22,10 20,11 C23,11 26,10 29,12 C31,14 32,17 30,19 C28,21 25,21 22,20 C25,22 27,25 26,28 C24,30 21,30 18,29 C15,28 13,25 10,23 C7,21 4,19 2,17 C1,16 1,16 2,15",
    ];
    
    // Create wolf elements
    const wolves = [];
    const colors = ['#1A1A2E', '#16213E', '#0F3460', '#252A34', '#28293E'];
    
    for (let i = 0; i < 15; i++) {
      wolves.push({
        x: Math.random() * width,
        y: Math.random() * height,
        scale: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 1,
        speedY: (Math.random() - 0.5) * 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        silhouette: wolfSilhouettes[Math.floor(Math.random() * wolfSilhouettes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.4 + 0.1
      });
    }
    
    // Create stars/moon elements
    const stars = [];
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5,
        opacity: Math.random() * 0.5 + 0.1,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
    
    // Moon
    const moon = {
      x: width * 0.8,
      y: height * 0.2,
      radius: Math.min(width, height) * 0.08,
      opacity: 0.3
    };
    
    // Draw wolf silhouette
    const drawWolf = (ctx, wolf) => {
      ctx.save();
      ctx.globalAlpha = wolf.opacity;
      ctx.fillStyle = wolf.color;
      ctx.translate(wolf.x, wolf.y);
      ctx.rotate(wolf.rotation);
      ctx.scale(wolf.scale, wolf.scale);
      
      const path = new Path2D(wolf.silhouette);
      ctx.fill(path);
      
      ctx.restore();
    };
    
    // Draw star
    const drawStar = (ctx, star, time) => {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
      
      ctx.save();
      ctx.fillStyle = '#E4E4E4';
      ctx.globalAlpha = star.opacity * twinkle;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    
    // Draw moon
    const drawMoon = (ctx, moon) => {
      ctx.save();
      
      // Create gradient for moon glow
      const gradient = ctx.createRadialGradient(
        moon.x, moon.y, moon.radius * 0.5,
        moon.x, moon.y, moon.radius * 2
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      // Draw glow
      ctx.globalAlpha = moon.opacity * 0.5;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(moon.x, moon.y, moon.radius * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw moon
      ctx.globalAlpha = moon.opacity;
      ctx.fillStyle = '#E4E4E4';
      ctx.beginPath();
      ctx.arc(moon.x, moon.y, moon.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw moon craters
      ctx.globalAlpha = moon.opacity * 0.15;
      ctx.fillStyle = '#AAAAAA';
      
      // Add some craters
      const craters = [
        { x: moon.x - moon.radius * 0.3, y: moon.y - moon.radius * 0.2, r: moon.radius * 0.2 },
        { x: moon.x + moon.radius * 0.4, y: moon.y + moon.radius * 0.3, r: moon.radius * 0.15 },
        { x: moon.x - moon.radius * 0.1, y: moon.y + moon.radius * 0.4, r: moon.radius * 0.1 }
      ];
      
      craters.forEach(crater => {
        ctx.beginPath();
        ctx.arc(crater.x, crater.y, crater.r, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.restore();
    };
    
    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.01;
      
      // Create dark background with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#08082B');
      gradient.addColorStop(1, '#121212');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw stars
      stars.forEach(star => {
        drawStar(ctx, star, time);
      });
      
      // Draw moon
      drawMoon(ctx, moon);
      
      // Draw wolves
      wolves.forEach(wolf => {
        // Update position
        wolf.x += wolf.speedX;
        wolf.y += wolf.speedY;
        wolf.rotation += wolf.rotationSpeed;
        
        // Wrap around edges instead of bouncing
        if (wolf.x < -100) wolf.x = width + 100;
        if (wolf.x > width + 100) wolf.x = -100;
        if (wolf.y < -100) wolf.y = height + 100;
        if (wolf.y > height + 100) wolf.y = -100;
        
        // Draw the wolf
        drawWolf(ctx, wolf);
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