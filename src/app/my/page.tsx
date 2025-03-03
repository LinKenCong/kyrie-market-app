"use client";

import { useDisconnect, useReadContract } from "wagmi";
import { useChainModal } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";

import { formatAddress, getNativeBalance } from "@/utils";
import { ABI_SHOP_FACTORY } from "@/abis";
import CreateShopFormModal from "./CreateShopFormModal";
import { ShopCard, ShopCardProps } from "./ShopCard";
import { IMG_ERROR_PATH, KM_CONTRACTS } from "@/consts/config";
import PageLayout from "@/components/ui/PageLayoutBox";
import LocalStorageHelper from "@/utils/localStorageHelper";
import { CurrentAccountState } from "@/types/localStorage";
import { AccountInfo, NativeCurrency } from "@/types";
import { FadeInElement } from "@/components/ui/FadeInElement";

const ADDR_ShopFactory = KM_CONTRACTS.ShopFactory as `0x${string}`;

export default function MyInfo() {
  const { disconnect } = useDisconnect();

  // Modal
  const [isOpen, setOpen] = useState(false);
  const { openChainModal } = useChainModal();

  // Get account info
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    account: "0x",
    chainId: 0,
    isConnected: false,
  });
  const [nativeCurrency, setNativeCurrency] = useState<NativeCurrency>({
    decimals: 0,
    formatted: "0",
    symbol: "",
    value: "0n",
  });
  useEffect(() => {
    const accountStorage =
      LocalStorageHelper.getItem<CurrentAccountState>("account");
    if (accountStorage) {
      const accountInfoGet = accountStorage.accountInfo as AccountInfo;
      const nativeCurrencyGet = accountStorage.nativeCurrency as NativeCurrency;
      setAccountInfo({ ...accountInfoGet });
      setNativeCurrency({ ...nativeCurrencyGet });
    }
  }, []);

  // Get shops of the account
  const [isLoading, setIsLoading] = useState(true);
  const shopListRes = useReadContract({
    abi: ABI_SHOP_FACTORY,
    address: ADDR_ShopFactory,
    functionName: "getShopsOf",
    args: [accountInfo.account],
    account: accountInfo.account,
  });
  const [shops, setShops] = useState<ShopCardProps[]>([]);
  const getShopList = async () => {
    try {
      const result: any = shopListRes.data;
      if (shopListRes.status === "success" && result[0].length > 0) {
        const formatRes = {
          ids: result[0] as bigint[],
          infos: result[1] as {
            name: string;
            uri: string;
            accountAddress: string;
          }[],
        };
        let list: ShopCardProps[] = [];
        for (let i = 0; i < formatRes.ids.length; i++) {
          const id = formatRes.ids[i].toString();
          const shop = formatRes.infos[i];
          try {
            // Get native currency balances of the shop
            const currency = (
              await getNativeBalance(shop.accountAddress as `0x${string}`)
            ).res;
            list.push({
              id: id,
              shopName: shop.name,
              value: currency!.formatted,
              currency: currency!.symbol,
              account: shop.accountAddress,
            });
          } catch (balanceError) {
            console.error(
              `Error fetching balance for shop ${id}:`,
              balanceError
            );
            list.push({
              id: id,
              shopName: shop.name,
              value: "Error",
              currency: "Unknown",
              account: shop.accountAddress,
            });
          }
        }
        setShops(list);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching shop data:", error);
    }
  };
  useEffect(() => {
    getShopList();
  }, [shopListRes.data]);

  return (
    <PageLayout title={`My Info`}>
      <CreateShopFormModal isOpen={isOpen} onClose={() => setOpen(false)} />
      <section className="km-border w-full md:min-w-96 px-4 bg-white shadow-sm dark:bg-gray-800">
        <div className="flex w-full flex-col items-center py-10">
          <img
            onClick={() => openChainModal?.()}
            className="km-border-rounded w-24 h-24 mb-3 shadow-lg"
            src={accountInfo.icon || `${IMG_ERROR_PATH}`}
            alt="User Icon"
          />
          <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
            {(accountInfo.isConnected && formatAddress(accountInfo.account)) ||
              "Not Connected"}
          </h5>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {(accountInfo.isConnected &&
              `${nativeCurrency.formatted} ${nativeCurrency.symbol}`) ||
              "... ETH"}
          </span>
          {accountInfo.isConnected && (
            <div className="flex mt-4 md:mt-6 gap-4">
              <button
                onClick={() => setOpen(true)}
                type="button"
                className="km-border inline-flex items-center px-4 py-2 text-sm font-bold text-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Add Shop
              </button>

              <button
                onClick={() => {
                  disconnect();
                }}
                type="button"
                className="km-border inline-flex items-center px-4 py-2 text-sm font-bold text-center text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center pb-10 px-4 gap-2">
          {isLoading ? (
            <div className="col-span-full text-center py-10">
              Loading assets...
            </div>
          ) : (
            shops.map((item, i) => (
              <FadeInElement key={i} delay={i * 150}>
                <ShopCard {...item} />
              </FadeInElement>
            ))
          )}
        </div>
      </section>
    </PageLayout>
  );
}
