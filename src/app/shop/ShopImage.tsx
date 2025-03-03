import { useState } from "react";
import { ImageLoadingIndicator } from "@/components/ui/LoadingIndicator";

export type ShopImageProps = {
  src: string;
  alt: string;
};

export default function ShopImage(item: ShopImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };
  return (
    <div className="relative w-full h-96 overflow-hidden md:w-3/6">
      {isLoading && <ImageLoadingIndicator />}
      <img
        className="km-border absolute top-0 left-0  min-w-22 object-cover h-full w-full"
        src={item.src}
        alt={item.alt}
        onError={handleError}
        onLoad={handleImageLoad}
      />
    </div>
  );
}
