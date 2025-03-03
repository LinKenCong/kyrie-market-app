import { IMG_ERROR_PATH, KM_CONTRACTS } from "@/consts/config";
import { getNFTMetadata, formatAddress, formatImgSrc } from "@/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import ShopCardImage from "./ShopCardImage";

export type ShopCardProps = {
  id: string;
  shopName: string;
  value: string;
  currency: string;
  account: string;
};

export function ShopCard(item: ShopCardProps) {
  const url = `/shop?id=${item.id}`;
  const [imgSrc, setImgSrc] = useState("/");

  const initShopInfo = async () => {
    const metadata = await getNFTMetadata(
      KM_CONTRACTS.ShopFactory,
      item.id as string
    );
    const imageSrc = formatImgSrc(metadata.res!.image);
    setImgSrc(imageSrc);
  };

  useEffect(() => {
    initShopInfo();
  }, [item.account]);
  return (
    <Link
      href={url}
      className="km-border w-full flex flex-col items-center bg-white shadow-sm md:flex-row md:max-w-xl hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      <ShopCardImage src={imgSrc} alt={item.shopName} />
      <div className="flex flex-col justify-between p-4 leading-normal">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {item.shopName}
        </h5>
        <div className="flex flex-col justify-between gap-2">
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Account: {item.account && formatAddress(item.account)}
          </p>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Value: {`${item.value} ${item.currency}`}
          </p>
        </div>
      </div>
    </Link>
  );
}
