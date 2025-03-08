"use client";

import { AssetCard } from "@/components/ui/AssetCard";
import PageLayout from "@/components/ui/PageLayoutBox";
import { FadeInElement } from "@/components/ui/FadeInElement";
import { useKMAssetList } from "@/hooks";

export default function Home() {
  const listData = useKMAssetList({
    paginationParams: {
      page_num: 1,
      page_size: 50,
    },
  });

  return (
    <PageLayout title="Welcome to Kyrie Market!">
      <section className="w-full grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {listData.isLoading ? (
          <div className="col-span-full text-center py-10">
            Loading assets...
          </div>
        ) : (
          listData.data &&
          listData.data.map((item, i) => (
            <FadeInElement key={item.uuid} delay={i * 150}>
              <AssetCard {...item} />
            </FadeInElement>
          ))
        )}
      </section>
    </PageLayout>
  );
}
