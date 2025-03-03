import {
  readContract,
  signMessage,
  writeContract,
  simulateContract,
} from "@wagmi/core";
import { config } from "@/wagmi";
import { fetchNFTMetadata, FetchResponse, MetadataType } from "./api";
import { ShopInfoType, Web3OperationResult } from "@/types";

import { KM_CONTRACTS } from "@/consts/config";
import { ethers } from "ethers";
import { ABI_ERC721, ABI_SHOP_FACTORY, ABI_SHOP_ACCOUNT } from "@/abis";

export const signMsg = async (msg: string) => {
  const sig = await signMessage(config, {
    message: {
      raw: ethers.getBytes(msg),
    },
  });
  return sig;
};

/// TODO: Optimize this function
export const getNFTMetadata = async (token: string, tokenId: string) => {
  let data: FetchResponse<MetadataType> = {
    res: {
      name: "Unknown",
      image: "/fallback-image.png",
    },
    error: "",
  };
  try {
    const tokenUrl = await readContract(config, {
      abi: ABI_ERC721,
      functionName: "tokenURI",
      address: token as `0x${string}`,
      args: [BigInt(tokenId)],
    });
    if (!tokenUrl || typeof tokenUrl !== "string") {
      throw new Error("Invalid token URI returned");
    }
    const metadata = await fetchNFTMetadata(tokenUrl);
    return metadata;
  } catch (error) {
    console.error(
      `Failed to fetch NFT metadata for token: ${token}, tokenId: ${tokenId}`,
      error
    );
    return data;
  }
};

export const getShopInfo = async (shopId: string) => {
  let res: Web3OperationResult<ShopInfoType> = {
    res: null,
    error: null,
  };
  try {
    const shopInfo = (await readContract(config, {
      abi: ABI_SHOP_FACTORY,
      functionName: "shops",
      address: KM_CONTRACTS.ShopFactory,
      args: [BigInt(shopId)],
    })) as [string, string, string];
    res.res = {
      name: shopInfo[0],
      uri: shopInfo[1],
      account: shopInfo[2],
    } as ShopInfoType;
  } catch (error) {
    console.error(`Failed to fetch shop info for shopId: ${shopId}`, error);
    res.error = error;
  }
  return res;
};

export const recoverOrderSigner = async (
  shop: string,
  msg: string,
  sig: `0x${string}`
) => {
  let res: Web3OperationResult<string> = {
    res: null,
    error: null,
  };
  try {
    const signer = await readContract(config, {
      abi: ABI_SHOP_ACCOUNT,
      functionName: "recoverSigner",
      address: shop as `0x${string}`,
      args: [msg, sig],
    });
    res.res = String(signer);
  } catch (error) {
    console.error(`Failed to execute order to shop`, error);
    res.error = error;
  }
  return res;
};

export const getOrderHash = async (
  shop: string,
  data: (string | (string | number)[])[]
) => {
  let res: Web3OperationResult<string> = {
    res: null,
    error: null,
  };
  try {
    const hash = await readContract(config, {
      abi: ABI_SHOP_ACCOUNT,
      functionName: "getOrderHash",
      address: shop as `0x${string}`,
      args: [data],
    });

    res.res = String(hash);
  } catch (error) {
    console.error(`Failed to execute order to shop`, error);
    res.error = error;
  }
  return res;
};

export const calcOrderHash = (data: (string | (string | number)[])[]) => {
  // Create AbiCoder instance
  const abiCoder = new ethers.AbiCoder();

  // Encode struct fields with proper padding (like abi.encode)
  const encodedData = abiCoder.encode(
    [
      "address", // offerer
      "tuple(uint8,address,address,uint256,uint256)", // (itemType,provider,token,id,amount)
      "uint256", // price
      "uint256", // expiry
      "bytes32", // salt
    ],
    data
  );
  return encodedData;
};

export const createShop = async (
  factory: `0x${string}`,
  name: string,
  uri: string
) => {
  let res: Web3OperationResult<boolean> = {
    res: null,
    error: null,
  };
  try {
    const { request } = await simulateContract(config, {
      abi: ABI_SHOP_FACTORY,
      functionName: "createShop",
      address: factory,
      args: [name, uri],
    });
    const hash = await writeContract(config, request);
    res.res = hash !== null;
  } catch (error) {
    console.error(`Failed to create shop`, error);
    res.error = error;
  }
  return res;
};

export const executeOrderToShop = async (
  shop: `0x${string}`,
  orderComponents: string,
  signature: `0x${string}`
) => {
  let res: Web3OperationResult<boolean> = {
    res: null,
    error: null,
  };
  const orderComponentsData = JSON.parse(orderComponents);
  try {
    const { request } = await simulateContract(config, {
      abi: ABI_SHOP_ACCOUNT,
      functionName: "executeOrder",
      address: shop,
      args: [orderComponentsData, signature],
      value: orderComponentsData[2],
    });
    const hash = await writeContract(config, request);
    res.res = hash !== null;
  } catch (error) {
    console.error(`Failed to execute order to shop`, error);
    res.error = error;
  }
  return res;
};
