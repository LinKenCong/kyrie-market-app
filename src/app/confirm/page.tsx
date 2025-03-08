"use client";

import PageLayout from "@/components/ui/PageLayoutBox";
import { PayStep, PayStepperModal } from "@/components/ui/StepperModal";
import { OrderInfo } from "@/types";
import { CurrentAccountState, CurrentAssetState } from "@/types/localStorage";
import {
  executeOrderToShop,
  fetchKMPost,
  verifyAssetValidity,
  verifyWalletBalance,
  verifyWalletConnection,
} from "@/utils";
import LocalStorageHelper from "@/utils/localStorageHelper";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

const formatPrice = (price: string) => {
  const etherPrice = (Number(price) / 1e18).toString();
  return `${etherPrice} ETH`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString();
};

export default function ConfirmPage() {
  const router = useRouter();
  const [isModalOpen, setModalOpen] = useState(false);
  const [data, setData] = useState<CurrentAssetState | null>(null);
  const [user, setUser] = useState<CurrentAccountState | null>(null);

  useEffect(() => {
    const fetchedData =
      LocalStorageHelper.getItem<CurrentAssetState>("currentAsset");

    const fetchedUser =
      LocalStorageHelper.getItem<CurrentAccountState>("account");
    if (!fetchedData || !fetchedUser) {
      if (typeof window !== "undefined") {
        router.push("/");
      }
      return;
    }
    setUser(fetchedUser);
    setData(fetchedData);
  }, []);

  const steps: PayStep[] = [
    {
      title: "Check Wallet",
      description: "Check wallet connection and balance.",
      action: async () => {
        const isConnection = await verifyWalletConnection(
          user!.accountInfo!.chainId
        );
        const isEnoughBalance = await verifyWalletBalance(
          user!.accountInfo!.account,
          BigInt(data!.orderInfo!.price)
        );
        return isConnection && isEnoughBalance;
      },
      requiresAction: true,
    },
    {
      title: "Asset Validity",
      description: "Verify asset validity.",
      action: async () => {
        const order = data!.orderInfo as OrderInfo;
        return await verifyAssetValidity(
          order.itemType,
          order.shop,
          order.provider,
          order.token,
          order.tokenId,
          BigInt(order.amount)
        );
      },
      requiresAction: false,
    },
    {
      title: "Pay",
      description: "Pay for the asset.",
      action: async () => {
        try {
          const order = data!.orderInfo as OrderInfo;

          const tx = await executeOrderToShop(
            order.shop as `0x${string}`,
            order.componentsPayload,
            order.signature as `0x${string}`
          );
          if (tx.error) {
            console.error("Failed to execute order to shop", tx.error);
            return false;
          }
          await fetchKMPost(`orders/${order.uuid}`, { orderStatus: "closed" });
          router.push("/");
        } catch (error) {
          console.error("Failed to execute order to shop", error);
          return false;
        }
        return true;
      },
      requiresAction: true,
    },
  ];

  return (
    <PageLayout title="Confirm Purchase">
      <section className="antialiased py-8">
        {data && data.orderInfo && data.metadata && (
          <>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2">
                <Image
                  src={data.metadata.imageUrl}
                  alt={data.metadata.name}
                  width={500}
                  height={500}
                  className="km-border"
                  priority
                />
              </div>
              <div className="km-border w-full md:w-1/2 p-4">
                <h1 className="text-2xl font-semibold mb-2">
                  {data.metadata.name}
                </h1>
                <hr className="border-gray-300 mb-2" />
                <div className="mb-4">
                  <p className="mb-2">
                    <span className="font-semibold">Token Type:</span>{" "}
                    {data.orderInfo.itemType}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Token Address:</span>{" "}
                    {data.orderInfo.token}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Price:</span>{" "}
                    {formatPrice(data.orderInfo.price)}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Amount:</span>{" "}
                    {data.orderInfo.amount}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Token ID:</span>{" "}
                    {data.orderInfo.tokenId}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Listed At:</span>{" "}
                    {formatDate(data.orderInfo.createAt)}
                  </p>
                </div>
                <hr className="border-gray-300 mb-2" />
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p className="text-gray-600 mb-4">
                    {data.metadata.description}
                  </p>
                </div>
                {data.metadata.attributes && (
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-2">Attributes</h2>
                    <ul className="list-disc list-inside">
                      {data.metadata.attributes.map((attr, index) => (
                        <li key={index} className="mb-2">
                          {attr.trait_type}: {attr.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end mt-10">
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="km-border bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4"
                  >
                    Confirm Purchase
                  </button>
                  <PayStepperModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    steps={steps}
                    overFunc={() => setModalOpen(false)}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </PageLayout>
  );
}
