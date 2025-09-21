import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const NeuralNetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const pointsRef = useRef<Point[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initPoints = () => {
      const numPoints = Math.floor((canvas.width * canvas.height) / 15000);
      pointsRef.current = [];
      
      for (let i = 0; i < numPoints; i++) {
        pointsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
        });
      }
    };

    const drawPoint = (point: Point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(147, 197, 253, 0.8)';
      ctx.fill();
    };

    const drawLine = (point1: Point, point2: Point, distance: number, maxDistance: number) => {
      const opacity = 1 - (distance / maxDistance);
      ctx.beginPath();
      ctx.moveTo(point1.x, point1.y);
      ctx.lineTo(point2.x, point2.y);
      ctx.strokeStyle = `rgba(147, 197, 253, ${opacity * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const updatePoints = () => {
      pointsRef.current.forEach(point => {
        point.x += point.vx;
        point.y += point.vy;

        if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
        if (point.y < 0 || point.y > canvas.height) point.vy *= -1;

        point.x = Math.max(0, Math.min(canvas.width, point.x));
        point.y = Math.max(0, Math.min(canvas.height, point.y));
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#1e1b4b');
      gradient.addColorStop(1, '#581c87');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      updatePoints();

      // Draw connections
      const maxDistance = 120;
      for (let i = 0; i < pointsRef.current.length; i++) {
        for (let j = i + 1; j < pointsRef.current.length; j++) {
          const point1 = pointsRef.current[i];
          const point2 = pointsRef.current[j];
          const distance = Math.sqrt(
            Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
          );

          if (distance < maxDistance) {
            drawLine(point1, point2, distance, maxDistance);
          }
        }
      }

      // Draw points
      pointsRef.current.forEach(drawPoint);

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initPoints();
    animate();

    const handleResize = () => {
      resizeCanvas();
      initPoints();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #581c87 100%)' }}
    />
  );
};

export default NeuralNetworkBackground;