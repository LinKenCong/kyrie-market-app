"use client";

import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";

import { AssetCard } from "@/components/ui/AssetCard";
import { fetchKMGet, formatAssetCardList } from "@/utils";
import PageLayout from "@/components/ui/PageLayoutBox";
import { FadeInElement } from "@/components/ui/FadeInElement";
import { AssetBaseData } from "@/types";

export default function Home() {
  // Get account info
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({
    address: address,
  });

  // Get assets from the api
  const [assets, setAssets] = useState<AssetBaseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      /// TODO: Fetch more assets
      const response = await fetchKMGet("orders", {
        page_num: "1",
        page_size: "50",
      });
      if (response.res) {
        const list: Array<any> = response.res.data.list;
        let newAssets: AssetBaseData[] = await formatAssetCardList(
          list,
          balanceData?.symbol as string,
          balanceData?.decimals as number
        );
        if (newAssets.length > 0) {
          setAssets(newAssets);
        }
      }
      setIsLoading(false);
    };

    fetchAssets();
  }, []);

  return (
    <PageLayout title="Welcome to Kyrie Market!">
      <section className="w-full grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>
    </PageLayout>
  );
}
