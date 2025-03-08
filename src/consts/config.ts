export const KM_API =
  process.env.NEXT_PUBLIC_ENABLE_KM_API || "http://127.0.0.1:8000/";

/// TODO: Add Chain ID Enum
export const KM_CONTRACTS = {
  ShopFactory: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" as `0x${string}`,
};

export const MOCKTOKEN_CONTRACTS = {
  MockERC20: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" as `0x${string}`,
  MockERC721: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9" as `0x${string}`,
  MockERC1155: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707" as `0x${string}`,
};

export const IMG_ERROR_PATH = "/images/imageNotFound.svg";
