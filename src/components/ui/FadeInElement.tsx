"use client";

import { useEffect, useRef, useState } from "react";

interface FadeInElementProps {
  children: React.ReactNode;
  delay?: number;
}

export const FadeInElement: React.FC<FadeInElementProps> = ({
  children,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div ref={elementRef} className={`km-fade-in-up ${isVisible ? "appear" : ""}`}>
      {children}
    </div>
  );
};
