import React, { useState } from "react";
import Image from "next/image";
import { IMG_ERROR_PATH } from "@/consts/config";
import { ImageLoadingIndicator } from "./LoadingIndicator";

interface BasePageImageProps {
  src: string;
  size: number;
  alt: string;
  className?: string;
}

export const BasePageImage: React.FC<BasePageImageProps> = ({
  src,
  size,
  alt,
  className,
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasFailed, setHasFailed] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const handleLoad = () => {
    setLoading(false);
  };
  const handleError = () => {
    if (!hasFailed) {
      setHasFailed(true);
      setImageSrc(`${IMG_ERROR_PATH}`);
    }
  };

  return (
    <figure
      className={`relative pt-[100%] rounded-t-lg overflow-hidden ${className}`}
    >
      {isLoading && <ImageLoadingIndicator />}
      <Image
        src={imageSrc}
        width={size}
        height={size}
        onLoad={handleLoad}
        onError={handleError}
        alt={alt}
        className="absolute top-0 left-0 w-full h-full min-w-22 object-cover"
      />
      <figcaption className="sr-only">{alt}</figcaption>
    </figure>
  );
};
