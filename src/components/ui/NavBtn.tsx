"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAccount, useAccountEffect, useBalance } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect } from "react";
import { CurrentAccountState } from "@/types/localStorage";
import LocalStorageHelper from "@/utils/localStorageHelper";
import makeBlockie from "ethereum-blockies-base64";

export default function NavBtn() {
  const router = useRouter();
  const { address, isConnected, chainId } = useAccount();
  const { data: balanceData } = useBalance({
    address: address,
  });

  const saveAccountInfo = () => {
    if (address && chainId) {
      LocalStorageHelper.updateItem<CurrentAccountState>("account", {
        accountInfo: {
          account: address,
          chainId: chainId,
          isConnected: true,
          icon: makeBlockie(address),
        },
      });
    }
  };

  const saveBalanceInfo = () => {
    if (balanceData) {
      const newAccountState = {
        nativeCurrency: {
          decimals: balanceData.decimals,
          formatted: balanceData.formatted,
          symbol: balanceData.symbol,
          value: `${balanceData.value}n`,
        },
      };
      LocalStorageHelper.updateItem<CurrentAccountState>(
        "account",
        newAccountState
      );
    }
  };

  useEffect(() => {
    saveAccountInfo();
    saveBalanceInfo();
  }, [balanceData]);

  useAccountEffect({
    onConnect(data) {
      console.log("Connected!");
      window.location.reload();
    },
    onDisconnect() {
      console.log("Disconnected!");
      LocalStorageHelper.removeItem("currentShop");
      LocalStorageHelper.removeItem("account");
      router.push("/");
    },
  });

  const { openConnectModal } = useConnectModal();

  const pathname = usePathname();

  const isHomePage = pathname === "/";
  const navigateTo = isHomePage ? "/my" : "/";
  const buttonText = isHomePage ? "My" : "Home";

  return (
    <div className="fixed -bottom-12 left-1/2 transform -translate-x-1/2 z-10">
      <button
        type="button"
        className="km-border-rounded w-24 h-24 text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-full text-sm text-center"
        onClick={() => {
          if (navigateTo === "/my" && !isConnected) {
            openConnectModal?.();
          } else {
            router.push(navigateTo);
          }
        }}
      >
        <span className="font-bold relative -top-3 block">{buttonText}</span>
      </button>
    </div>
  );
}
