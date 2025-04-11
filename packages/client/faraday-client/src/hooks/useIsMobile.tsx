import { useEffect, useState } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 430);

  useEffect(() => {
    const resizerObserver = new ResizeObserver((entries) => {
      const [body] = entries;
      const { width } = body.contentRect;
      setIsMobile(width <= 430);
    })
    resizerObserver.observe(document.body)
    return () => resizerObserver.disconnect()
  }, []);

  return isMobile;
}
