import { useEffect, useState } from 'react';

const BACKGROUND_IMAGES = [
  "url('/images/background.jpg')",
  "url('/images/background01.jpg')",
  "url('/images/background02.jpg')",
];

const ROTATION_INTERVAL = 30000; // 30 seconds

export default function BackgroundManager() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Apply current image to CSS variable
    document.documentElement.style.setProperty('--app-bg-image', BACKGROUND_IMAGES[index]);

    const intervalId = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(intervalId);
  }, [index]);

  return null; // This component doesn't render anything
}
