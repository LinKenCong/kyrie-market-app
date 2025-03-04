"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ListedAssetModal from "./ListedAssetModal";
import { useBalance } from "wagmi";
import { IMG_ERROR_PATH, KM_CONTRACTS } from "@/consts/config";
import {
  getShopInfo,
  formatTokenValue,
  fetchKMGet,
  formatImgSrc,
  formatAssetCardList,
  fetchNFTMetadata,
  getTokenURI,
} from "@/utils";
import { ShopInfoType } from "@/types/account";
import ShopImage from "./ShopImage";
import LocalStorageHelper from "@/utils/localStorageHelper";
import { CurrentShopState } from "@/types/localStorage";
import { AssetCard } from "@/components/ui/AssetCard";
import { FadeInElement } from "@/components/ui/FadeInElement";
import { AssetBaseData } from "@/types";

export default function Shop() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // Get account info
  const [isOpen, setOpen] = useState(false);
  const [shopInfo, setShopInfo] = useState({
    account: "0x",
    name: "",
    uri: "",
    onSell: 0,
    description: "",
    img: "",
  } as ShopInfoType);

  const { data: balanceData, refetch } = useBalance({
    address: shopInfo.account as `0x${string}`,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [assets, setAssets] = useState<AssetBaseData[]>([]);

  const fetchAssets = async () => {
    const response = await fetchKMGet(`orders/shop/${shopInfo.account}`, {
      page_num: "1",
      page_size: "50",
    });
    if (response.res && response.res.data) {
      setShopInfo({
        ...shopInfo,
        onSell: response.res.data.total,
      });
      const list: Array<any> = response.res.data.list;
      let newAssets: AssetBaseData[] = await formatAssetCardList(
        list,
        balanceData?.symbol as string
      );
      if (newAssets.length > 0) {
        setAssets(newAssets);
      }
    }
    setIsLoading(false);
  };

  const initShopInfo = async () => {
    const shopInfoRes = await getShopInfo(id as string);
    const info = shopInfoRes.res as ShopInfoType;

    const tokenUri = (await getTokenURI(KM_CONTRACTS.ShopFactory, id as string))
      .res;
    const metadata = (await fetchNFTMetadata(tokenUri as string)).res;
    const imageSrc = formatImgSrc(metadata?.image || "");

    LocalStorageHelper.updateItem<CurrentShopState>("currentShop", {
      shopInfo: {
        account: info.account,
        uri: info.uri,
        name: info.name,
        onSell: 0,
      },
      metadata: {
        ...metadata,
        imageSrc: imageSrc,
      },
    });
    setShopInfo({
      ...info,
      description: metadata?.description as string,
      img: imageSrc,
    });
    refetch();
  };

  useEffect(() => {
    initShopInfo();
  }, []);

  useEffect(() => {
    fetchAssets();
    if (balanceData) {
      LocalStorageHelper.updateItem<CurrentShopState>("currentShop", {
        nativeCurrency: {
          account: shopInfo.account,
          balance: `${balanceData.value}n`,
          decimals: balanceData.decimals,
          symbol: balanceData.symbol,
        },
      });
    }
  }, [balanceData]);

  return (
    <div className="flex flex-col min-h-screen p-8 pb-20 gap-16 sm:p-10 font-[family-name:var(--font-geist-sans)]">
      <header className="flex flex-col gap-4 items-center">
        <ShopImage
          src={shopInfo.img || `${IMG_ERROR_PATH}`}
          alt={shopInfo.name}
        />
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-center">{`#${id} ${shopInfo.name}`}</h1>
          <p className="text-xl text-center">
            {balanceData
              ? `Value: ${formatTokenValue(
                  balanceData.value,
                  balanceData.decimals
                )} ${balanceData.symbol}`
              : "Value: ... ETH"}
          </p>
          <p className="text-xl text-center">
            On Sell: {shopInfo.onSell}
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="km-border text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Listed Asset
          </button>
        </div>
      </header>
      <main className="flex flex-col gap-8 w-full">
        <hr className="border-gray-300" />
        <section className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold">Products</h2>
          <div className="w-full grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full text-center py-10">
                Loading assets...
              </div>
            ) : (
              assets.map((item, i) => (
                <FadeInElement key={item.uuid} delay={i * 150}>
                  <AssetCard {...item} />
                </FadeInElement>
              ))
            )}
          </div>
        </section>
      </main>
      <ListedAssetModal isOpen={isOpen} onClose={() => setOpen(false)} />
    </div>
  );
}
