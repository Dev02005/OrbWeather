import React, { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine, ISourceOptions } from '@tsparticles/engine';

interface WeatherBackgroundProps {
  weatherCode: number;
}

export function WeatherBackground({ weatherCode }: WeatherBackgroundProps) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (!init) return null;

  // Determine condition based on WMO code
  // Snow: 71, 73, 75, 77, 85, 86
  // Rain: 51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99
  const isSnow = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isRain = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode);
  
  // Default is clear/cloudy (floating dust/stars)
  let particlesConfig: ISourceOptions = {
    fpsLimit: 60,
    particles: {
      color: { value: '#ffffff' },
      links: { enable: false },
      move: {
        direction: 'none',
        enable: true,
        outModes: { default: 'out' },
        random: true,
        speed: 0.5,
        straight: false,
      },
      number: { density: { enable: true }, value: 30 },
      opacity: { value: { min: 0.1, max: 0.3 } },
      shape: { type: 'circle' },
      size: { value: { min: 1, max: 2 } },
    },
    detectRetina: true,
  };

  if (isRain) {
    particlesConfig = {
      fpsLimit: 60,
      particles: {
        color: { value: '#a5b4fc' },
        links: { enable: false },
        move: {
          direction: 'bottom',
          enable: true,
          outModes: { default: 'out' },
          random: false,
          speed: 25,
          straight: true,
        },
        number: { density: { enable: true }, value: 100 },
        opacity: { value: { min: 0.2, max: 0.6 } },
        shape: { type: 'line' },
        size: { value: { min: 1, max: 20 } },
        stroke: { color: '#a5b4fc', width: 1 }
      },
      detectRetina: true,
    };
  } else if (isSnow) {
    particlesConfig = {
      fpsLimit: 60,
      particles: {
        color: { value: '#ffffff' },
        links: { enable: false },
        move: {
          direction: 'bottom',
          enable: true,
          outModes: { default: 'out' },
          random: true,
          speed: 2,
          straight: false,
        },
        number: { density: { enable: true }, value: 150 },
        opacity: { value: { min: 0.3, max: 0.8 } },
        shape: { type: 'circle' },
        size: { value: { min: 2, max: 4 } },
      },
      detectRetina: true,
    };
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none', opacity: 0.6 }}>
      <Particles id="tsparticles" options={particlesConfig} />
    </div>
  );
}
