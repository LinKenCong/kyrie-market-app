import { FormModalBox } from "@/components/ui/ModalBox";
import { OrderComponents, OrderCreateParams } from "@/types";
import {
  fetchKMGet,
  fetchKMPost,
  signMsg,
  verifyShopAllowance,
  verifyTokenBalance,
  parseTokenValue,
  approveTokenTo,
  msgSigner,
  getOrderHash,
} from "@/utils";
import { useState } from "react";
import LocalStorageHelper from "@/utils/localStorageHelper";
import { CurrentAccountState, CurrentShopState } from "@/types/localStorage";
import { AssetTypeToId } from "@/consts/enums";

interface ListedAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormParams = {
  itemType: string;
  provider: string;
  token: string;
  tokenId: string;
  amount: string;
  price: string;
  expiry: string;
};

/// TODO: Change to stepper
export default function ListedAssetModal({
  isOpen,
  onClose,
}: ListedAssetModalProps) {
  const initialFormData = {
    itemType: "",
    provider: "",
    token: "",
    tokenId: "",
    amount: "",
    price: "",
    expiry: "",
  } as FormParams;

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const prepareOrderData = (account: `0x${string}`, data: FormParams) => {
    let newData: OrderComponents;
    newData = {
      offerer: account,
      asset: {
        itemType: data.itemType,
        provider: data.provider as `0x${string}`,
        token: data.token as `0x${string}`,
        tokenId: data.tokenId,
        amount: data.amount,
      },
      price: data.price,
      expiry: data.expiry,
      salt: "",
    };
    switch (data.itemType) {
      case "erc20":
        newData.asset.tokenId = "0";
        /// TODO: Get token decimals
        newData.asset.amount = parseTokenValue(data.amount);
        break;
      case "erc721":
        newData.asset.amount = "1";
        break;
      case "erc1155":
        break;
    }
    return newData;
  };

  const handleListedAsset = async (data: FormParams) => {
    const account = LocalStorageHelper.getItem<CurrentAccountState>("account");
    const currentShop =
      LocalStorageHelper.getItem<CurrentShopState>("currentShop");
    if (!account || !currentShop) return;
    const currentAccount = account.accountInfo!.account as `0x${string}`;
    const currentShopAccount = currentShop.shopInfo!.account as `0x${string}`;
    const currencyDecimals = currentShop.nativeCurrency!.decimals;
    let componentsData: OrderComponents = prepareOrderData(
      currentAccount,
      data
    );

    // Verify asset validity
    if (componentsData.asset.provider !== currentShopAccount) {
      if (
        !(await verifyTokenBalance(
          componentsData.asset.itemType,
          componentsData.asset.provider,
          componentsData.asset.token,
          componentsData.asset.tokenId,
          BigInt(componentsData.asset.amount)
        ))
      ) {
        console.error("Insufficient balance");
        setFormData(initialFormData);
        onClose();
        return;
      }

      if (
        !(await verifyShopAllowance(
          componentsData.asset.itemType,
          currentShopAccount,
          componentsData.asset.provider,
          componentsData.asset.token,
          componentsData.asset.tokenId,
          BigInt(componentsData.asset.amount)
        ))
      ) {
        await approveTokenTo(
          componentsData.asset.itemType,
          currentShopAccount,
          componentsData.asset.token,
          componentsData.asset.tokenId,
          BigInt(componentsData.asset.amount)
        );
        if (
          !(await verifyShopAllowance(
            componentsData.asset.itemType,
            currentShopAccount,
            componentsData.asset.provider,
            componentsData.asset.token,
            componentsData.asset.tokenId,
            BigInt(componentsData.asset.amount)
          ))
        ) {
          console.error("Failed to approve token");
          setFormData(initialFormData);
          onClose();
          return;
        }
      }
    } else {
      if (
        !(await verifyTokenBalance(
          componentsData.asset.itemType,
          currentShopAccount,
          componentsData.asset.token,
          componentsData.asset.tokenId,
          BigInt(componentsData.asset.amount)
        ))
      ) {
        console.error("Insufficient balance");
        setFormData(initialFormData);
        onClose();
        return;
      }
    }

    // Prepare data
    componentsData.price = parseTokenValue(
      componentsData.price,
      currencyDecimals
    );
    componentsData.expiry = String(
      Math.floor(Date.now() / 1000) +
        (componentsData.expiry ? parseInt(componentsData.expiry) * 60 : 0)
    );

    // Get salt
    const getSaltRes = await fetchKMGet("/orders/salt");
    if (getSaltRes.error) {
      console.error("Failed to get salt", getSaltRes.error);
      return;
    }
    componentsData.salt = `0x${getSaltRes.res!.data.salt}`;

    const orderComponentsStruct = [
      componentsData.offerer,
      [
        AssetTypeToId[componentsData.asset.itemType],
        componentsData.asset.provider,
        componentsData.asset.token,
        componentsData.asset.tokenId,
        componentsData.asset.amount,
      ],
      componentsData.price,
      componentsData.expiry,
      componentsData.salt,
    ];

    // Sign order
    // const orderHash = keccak256Str(calcOrderHash(orderComponentsStruct));
    const orderHash = (
      await getOrderHash(currentShopAccount, orderComponentsStruct)
    ).res as string;
    const signature = await signMsg(orderHash);
    const signer = msgSigner(orderHash, signature);
    if (!signature || signer !== componentsData.offerer)
      return console.error("Failed to sign message");

    const reqData = {
      signature: signature,
      shop: currentShopAccount,
      offerer: componentsData.offerer,
      itemType: componentsData.asset.itemType,
      provider: componentsData.asset.provider,
      token: componentsData.asset.token,
      tokenId: componentsData.asset.tokenId,
      amount: componentsData.asset.amount,
      price: componentsData.price,
      expiry: componentsData.expiry,
      salt: componentsData.salt,
      orderHash: orderHash,
      componentsPayload: JSON.stringify(orderComponentsStruct),
    } as OrderCreateParams;

    // Post order
    const post = await fetchKMPost("/orders", reqData);
    if (post.error) {
      console.error("Failed to list asset", post.error);
      return;
    }
    onClose();
    window.location.reload();
  };

  return (
    <FormModalBox
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleListedAsset}
      title="Listed Asset"
      formData={formData}
    >
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Token Address
          </label>
          <input
            type="text"
            name="token"
            value={formData.token}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Token Address"
          />
        </div>
        <div>
          <label
            htmlFor="itemType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Asset Type
          </label>
          <select
            id="itemType"
            name="itemType"
            value={formData.itemType}
            required
            onChange={handleChange}
            className="mb-1 bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">Choose</option>
            <option value="erc20">ERC20</option>
            <option value="erc721">ERC721</option>
            <option value="erc1155">ERC1155</option>
          </select>
        </div>
        {formData.itemType && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider
              </label>
              <input
                type="text"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Provider"
              />
            </div>
            {formData.itemType != "erc20" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  tokenId
                </label>
                <input
                  type="text"
                  name="tokenId"
                  value={formData.tokenId}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="tokenId"
                />
              </div>
            )}
            {formData.itemType != "erc721" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="text"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Amount"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry
              </label>
              <input
                type="text"
                name="expiry"
                value={formData.expiry}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Expiry"
              />
            </div>
          </>
        )}
      </>
    </FormModalBox>
  );
}
