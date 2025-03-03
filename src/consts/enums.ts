export enum AssetTypeId {
  ERC20 = 0,
  ERC721 = 1,
  ERC1155 = 2,
}

export enum AssetType {
  ERC20 = "erc20",
  ERC721 = "erc721",
  ERC1155 = "erc1155",
}

export const AssetTypeToId: Record<string, number> = {
  [AssetType.ERC20]: AssetTypeId.ERC20,
  [AssetType.ERC721]: AssetTypeId.ERC721,
  [AssetType.ERC1155]: AssetTypeId.ERC1155,
};

export const AssetTypeById: Record<number, string> = {
  [AssetTypeId.ERC20]: AssetType.ERC20,
  [AssetTypeId.ERC721]: AssetType.ERC721,
  [AssetTypeId.ERC1155]: AssetType.ERC1155,
};

export const AssetTypeImagePathByName: Record<string, string> = {
  [AssetType.ERC20]: "/images/erc20.png",
  [AssetType.ERC721]: "/images/coin.svg",
  [AssetType.ERC1155]: "/images/coin.svg",
};
