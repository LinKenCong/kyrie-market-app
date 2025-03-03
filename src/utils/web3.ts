import { IMG_ERROR_PATH } from "@/consts/config";
import { AssetTypeImagePathByName } from "@/consts/enums";
import { AssetBaseData, OrderInfo, TokenMetadata } from "@/types";
import { ethers } from "ethers";
import {
  getERC1155URI,
  getTokenDecimals,
  getTokenName,
  getTokenURI,
} from "./token";
import { fetchNFTMetadata } from "./api";

export const formatTokenValue = (
  v: string | bigint | number,
  decimals: number = 18
) => {
  return ethers.formatUnits(v, decimals);
};

export const parseTokenValue = (v: string, decimals: number = 18): string => {
  return ethers.parseUnits(v, decimals).toString();
};

export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const keccak256Str = (str: `0x${string}`) => {
  return ethers.keccak256(str);
};

export const msgSigner = (msg: string, signature: string) => {
  const signer = ethers.verifyMessage(ethers.getBytes(msg), signature);
  return signer;
};

export const formatImgSrc = (src: any) => {
  const str = typeof src === "string" ? src : JSON.stringify(src);

  if (str.length > 8) {
    const cleanStr = str.replace(/^"|"$/g, "");
    if (cleanStr.startsWith("ipfs://")) {
      const ipfsPath = cleanStr.replace("ipfs://", "");
      return `https://ipfs.io/ipfs/${ipfsPath}`;
    }
    return str;
  } else {
    return `${IMG_ERROR_PATH}`;
  }
};

export const formatAssetImgSrc = (tokenType: string, src: any) => {
  switch (tokenType) {
    case "erc20":
      return AssetTypeImagePathByName[tokenType];
    case "erc721":
      return formatImgSrc(src);
    case "erc1155":
      return formatImgSrc(src);
    default:
      return `${IMG_ERROR_PATH}`;
  }
};

export const formatAssetAmount = (tokenType: string, amount: string) => {
  switch (tokenType) {
    case "erc20":
      return formatTokenValue(amount);
    case "erc721":
      return "1";
    case "erc1155":
      return amount;
    default:
      return "0";
  }
};

export const formatAssetBaseData = async (
  item: OrderInfo,
  currency: string = "ETH",
  decimals: number = 18
) => {
  let title = "Unknown";
  let amount = item.amount;
  let image = AssetTypeImagePathByName[item.itemType];
  let tokenMetadata;

  switch (item.itemType) {
    case "erc20":
      {
        const tokenDecimals = (await getTokenDecimals(item.token)).res;
        const tokenName = (await getTokenName(item.token)).res;
        title = tokenName as string;
        amount = formatTokenValue(item.amount, tokenDecimals as number);
        tokenMetadata = {
          image: image,
          name: title,
          imageUrl: image,
        };
      }
      break;
    case "erc721":
      {
        const tokenUri = (await getTokenURI(item.token, item.tokenId)).res;
        const metadata = (await fetchNFTMetadata(tokenUri as string)).res;
        image = formatImgSrc(metadata?.image || "");
        title = metadata?.name as string;
        amount = "1";
        tokenMetadata = {
          image: metadata?.image || image,
          name: title,
          imageUrl: image,
          description: metadata?.description,
          attributes: metadata?.attributes,
        };
      }
      break;
    case "erc1155":
      {
        const tokenUri = (await getERC1155URI(item.token, item.tokenId)).res;
        const metadata = (await fetchNFTMetadata(tokenUri as string)).res;
        image = formatImgSrc(metadata?.image || "");
        title = metadata?.name as string;
        tokenMetadata = {
          image: metadata?.image || image,
          name: title,
          imageUrl: image,
          description: metadata?.description,
          attributes: metadata?.attributes,
        };
      }
      break;
    default:
      break;
  }

  let price = formatTokenValue(item.price, decimals);

  let asset: AssetBaseData = {
    uuid: item.uuid,
    itemType: item.itemType,
    token: item.token,
    tokenId: item.tokenId,
    amount: amount,
    price: price,
    currency: currency,
    title: title,
    image: image,
    metadata: tokenMetadata as TokenMetadata,
  };
  return asset;
};

export const formatAssetCardList = async (
  list: OrderInfo[],
  currency: string = "ETH",
  decimals: number = 18
) => {
  let cardList: AssetBaseData[] = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const asset = await formatAssetBaseData(item, currency, decimals);
    cardList.push(asset);
  }
  return cardList;
};
