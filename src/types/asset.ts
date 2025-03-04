export type TokenMetadata = {
  image: string;
  name: string;
  imageUrl: string;
  description?: string;
  attributes?: { trait_type: string; value: string }[];
  symbol?: string;
  decimals?: number;
};

export type ShopInfo = {
  account: string;
  uri: string;
  name: string;
  onSell: number;
};

export type AssetBaseData = {
  uuid: string;
  itemType: string;
  token: string;
  tokenId: string;
  amount: string;
  price: string;
  currency: string;
  title: string;
  image: string;
  metadata?: TokenMetadata;
};

export type OrderComponents = {
  offerer: `0x${string}`;
  asset: {
    itemType: string;
    provider: `0x${string}`;
    token: `0x${string}`;
    tokenId: string;
    amount: string;
  };
  price: string;
  expiry: string;
  salt: string;
};

export type OrderCreateParams = {
  signature: string;
  chainId: string;
  shop: string;
  offerer: string;
  itemType: string;
  provider: string;
  token: string;
  tokenId: string;
  amount: string;
  price: string;
  expiry: string;
  salt: string;
  orderHash: string;
  componentsPayload: string;
};

export type OrderInfo = {
  uuid: string;
  signature: string;
  chainId: string;
  shop: string;
  offerer: string;
  itemType: string;
  provider: string;
  token: string;
  tokenId: string;
  amount: string;
  price: string;
  expiry: string;
  salt: string;
  orderHash: string;
  orderStatus: string;
  componentsPayload: string;
  createAt: string;
};
