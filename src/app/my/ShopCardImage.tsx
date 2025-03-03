import { useState } from "react";
import { ImageLoadingIndicator } from "@/components/ui/LoadingIndicator";

export type ShopCardImageProps = {
  src: string;
  alt: string;
};

export default function ShopCardImage(item: ShopCardImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };
  return (
    <div className="km-border-r relative w-full min-h-48 md:h-48 md:w-48 overflow-hidden">
      {isLoading && <ImageLoadingIndicator />}
      <img
        className="absolute top-0 left-0 h-full w-full rounded-t-lg md:rounded-none md:rounded-s-lg object-cover"
        src={item.src}
        alt={item.alt}
        onError={handleError}
        onLoad={handleImageLoad}
      />
    </div>
  );
}
