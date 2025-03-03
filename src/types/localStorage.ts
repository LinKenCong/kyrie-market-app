import { AccountInfo, NativeCurrency } from "./account";
import { ShopInfo, TokenMetadata, OrderInfo } from "./asset";

export type CurrentAccountState = {
  accountInfo: AccountInfo | null;
  nativeCurrency: NativeCurrency | null;
};

export type CurrentShopState = {
  shopInfo: ShopInfo | null;
  metadata: TokenMetadata | null;
  nativeCurrency: NativeCurrency | null;
};

export type CurrentAssetState = {
  orderInfo: OrderInfo | null;
  metadata: TokenMetadata | null;
};
