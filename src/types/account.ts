export type CurrentAccountInfo = {
  account: `0x${string}` | undefined;
  balance: bigint | undefined;
  decimals: number | undefined;
  currency: string | undefined;
  choosedShopAccount?: string;
};

export type Web3OperationResult<T> = {
  res: T | null;
  error: any;
};

export type ShopInfoType = {
  name: string;
  uri: string;
  account: `0x${string}`;
  onSell?: number;
  description?: string;
  img?: string;
};

// 

export type AccountInfo = {
  account: `0x${string}`;
  chainId: number;
  isConnected: boolean;
  icon?: string;
};

export type NativeCurrency = {
  decimals: number;
  formatted: string;
  symbol: string;
  value: string;
};