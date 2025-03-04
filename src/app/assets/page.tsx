"use client";

import { BaseLoadingIndicator } from "@/components/ui/LoadingIndicator";
import PageLayout from "@/components/ui/PageLayoutBox";
import { OrderInfo, TokenMetadata } from "@/types";
import { CurrentAccountState, CurrentAssetState } from "@/types/localStorage";
import {
  fetchKMGet,
  formatTokenValue,
  formatAssetBaseData,
  fetchKMPost,
} from "@/utils";
import LocalStorageHelper from "@/utils/localStorageHelper";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Assets() {
  const { openConnectModal } = useConnectModal();
  const router = useRouter();
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid");
  const [assetInfo, setAssetInfo] = useState<OrderInfo | null>(null);
  const [currentAccountState, setCurrentAccountState] =
    useState<CurrentAccountState | null>(null);

  const getAssetInfo = async () => {
    try {
      const response: any = await fetchKMGet(`orders/${uuid}`);
      const data = response.res.data.order;
      let newInfo: OrderInfo = {
        uuid: data.uuid,
        signature: data.signature,
        chainId: data.chainId,
        shop: data.shop,
        offerer: data.offerer,
        itemType: data.itemType,
        provider: data.provider,
        token: data.token,
        tokenId: data.tokenId,
        amount: data.amount,
        price: data.price,
        expiry: data.expiry,
        salt: data.salt,
        orderHash: data.orderHash,
        orderStatus: data.orderStatus,
        componentsPayload: data.componentsPayload,
        createAt: data.createAt,
      };
      LocalStorageHelper.updateItem<CurrentAssetState>("currentAsset", {
        orderInfo: newInfo,
        metadata: null,
      });

      setAssetInfo(newInfo);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAssetInfo();
  }, []);

  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);

  const initAssetMetadata = async () => {
    if (assetInfo) {
      const data = await formatAssetBaseData(assetInfo);
      if (data) {
        const newMetadata: TokenMetadata = data.metadata as TokenMetadata;
        LocalStorageHelper.updateItem<CurrentAssetState>("currentAsset", {
          metadata: newMetadata,
        });
        setMetadata(newMetadata);
      }
    }
  };

  useEffect(() => {
    initAssetMetadata();
    const storageAccountInfo =
      LocalStorageHelper.getItem<CurrentAccountState>("account");
    if (storageAccountInfo) {
      setCurrentAccountState({ ...storageAccountInfo });
    }
  }, [assetInfo]);

  return (
    <PageLayout title={`${(metadata && metadata.name) || "Asset"}`}>
      {assetInfo && metadata ? (
        <section className="km-border py-8 bg-white md:py-16 dark:bg-gray-900 antialiased">
          <div className="max-w-screen-xl px-4 mx-auto 2xl:px-0">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
              <div className="shrink-0 max-w-md lg:max-w-lg mx-auto">
                <img
                  className="km-border w-full dark:hidden"
                  src={metadata.imageUrl}
                  alt=""
                />
                <img
                  className="km-border w-full hidden dark:block"
                  src={metadata.imageUrl}
                  alt=""
                />
              </div>

              <div className="mt-6 sm:mt-8 lg:mt-0">
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                  {metadata.name}
                </h1>
                <div className="mt-4 sm:items-center sm:gap-4 sm:flex">
                  <p className="text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white">
                    {assetInfo.price} ETH
                  </p>
                </div>
                <div className="mt-4 sm:items-center sm:gap-4 sm:flex">
                  {assetInfo.itemType !== "erc20" && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300">
                      {`ID: #${assetInfo.tokenId}`}
                    </span>
                  )}
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-gray-300">
                    {`x${assetInfo.amount}`}
                  </span>
                </div>

                <div className="mt-6 sm:gap-4 sm:items-center sm:flex sm:mt-8">
                  {/* /// TODO:cancel btn */}
                  {currentAccountState?.accountInfo?.account ===
                  assetInfo.offerer ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await fetchKMPost(`orders/${assetInfo.uuid}`, {
                          orderStatus: "cancelled",
                        });
                        router.push(`/`);
                      }}
                      className="km-border text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 font-medium text-sm px-5 py-2.5 text-center me-2 mb-2"
                    >
                      Cancel Sale
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentAccountState?.accountInfo?.isConnected) {
                          openConnectModal?.();
                        } else {
                          router.push(`/confirm`);
                        }
                      }}
                      className="km-border text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium text-sm px-5 py-2.5 text-center me-2 mb-2"
                    >
                      Buy Now
                    </button>
                  )}
                </div>

                <hr className="my-6 md:my-8 border-gray-200 dark:border-gray-800" />

                {/* Asset MetaData */}
                <p className="mb-6 text-gray-500 dark:text-gray-400">
                  {metadata.description}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <BaseLoadingIndicator />
      )}
    </PageLayout>
  );
}
