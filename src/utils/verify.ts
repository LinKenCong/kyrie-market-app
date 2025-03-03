import { readContract, getAccount, getBalance } from "@wagmi/core";
import { config } from "@/wagmi";
import { Web3OperationResult } from "@/types/account";
import { ABI_ERC1155, ABI_ERC20, ABI_ERC721 } from "@/abis";

export const verifyWalletConnection = async (chainId: number) => {
  const account = getAccount(config);
  return account.isConnected && account.chainId === chainId;
};

export const verifyWalletBalance = async (address: string, price: bigint) => {
  const { value } = await getBalance(config, {
    address: address as `0x${string}`,
  });
  return value >= price;
};

export const verifyERC20Allowance = async (
  token: string,
  owner: string,
  spender: string,
  target: string | bigint
) => {
  let res: Web3OperationResult<boolean> = {
    res: null,
    error: null,
  };
  try {
    const allowance = await readContract(config, {
      abi: ABI_ERC20,
      functionName: "allowance",
      address: token as `0x${string}`,
      args: [owner, spender],
    });
    res.res = BigInt(String(allowance)) >= BigInt(target);
  } catch (error) {
    console.error(`Failed to fetch ERC20 allowance for token: ${token}`, error);
    res.error = error;
  }
  return res;
};

export const verifyERC721Allowance = async (
  token: string,
  tokenId: string,
  spender: string
) => {
  let res: Web3OperationResult<boolean> = {
    res: null,
    error: null,
  };
  try {
    const allowance = await readContract(config, {
      abi: ABI_ERC721,
      functionName: "getApproved",
      address: token as `0x${string}`,
      args: [BigInt(tokenId)],
    });
    res.res = allowance === spender;
  } catch (error) {
    console.error(
      `Failed to fetch ERC721 allowance for token: ${token}, tokenId: ${tokenId}`,
      error
    );
    res.error = error;
  }
  return res;
};

export const verifyERC1155Allowance = async (
  token: string,
  owner: string,
  spender: string,
  tokenId: string,
  target: string | bigint
) => {
  let res: Web3OperationResult<boolean> = {
    res: null,
    error: null,
  };
  try {
    const allowance = await readContract(config, {
      abi: ABI_ERC1155,
      functionName: "isApprovedForAll",
      address: token as `0x${string}`,
      args: [owner, spender],
    });
    res.res = Boolean(allowance);
  } catch (error) {
    console.error(
      `Failed to fetch ERC1155 allowance for token: ${token}, tokenId: ${tokenId}`,
      error
    );
    res.error = error;
  }
  return res;
};

export const verifyAssetValidity = async (
  assertType: string,
  spender: string,
  from: string,
  token: string,
  tokenId: string,
  amount: bigint
) => {
  if (spender === from) {
    return verifyTokenBalance(assertType, spender, token, tokenId, amount);
  } else {
    return verifyShopAllowance(
      assertType,
      spender,
      from,
      token,
      tokenId,
      amount
    );
  }
};

export const verifyTokenBalance = async (
  assertType: string,
  account: string,
  token: string,
  tokenId: string,
  amount: bigint
) => {
  let isVerified = false;
  try {
    switch (assertType) {
      case "erc20":
        {
          const balanceRes = await readContract(config, {
            abi: ABI_ERC20,
            functionName: "balanceOf",
            address: token as `0x${string}`,
            args: [account],
          });
          isVerified = BigInt(String(balanceRes)) >= amount;
        }
        break;
      case "erc721":
        {
          const owner = await readContract(config, {
            abi: ABI_ERC721,
            functionName: "ownerOf",
            address: token as `0x${string}`,
            args: [BigInt(tokenId)],
          });
          isVerified = owner === account;
        }
        break;
      case "erc1155":
        {
          const balanceRes = await readContract(config, {
            abi: ABI_ERC1155,
            functionName: "balanceOf",
            address: token as `0x${string}`,
            args: [account, BigInt(tokenId)],
          });
          isVerified = BigInt(String(balanceRes)) >= amount;
        }
        break;
      default:
        console.error("Invalid assert type");
        return false;
    }
  } catch (error) {
    console.error("Failed to verify balance", error);
  }
  return isVerified;
};

export const verifyShopAllowance = async (
  assertType: string,
  spender: string,
  from: string,
  token: string,
  tokenId: string,
  amount: bigint
) => {
  let isVerified = false;
  try {
    switch (assertType) {
      case "erc20":
        {
          const verifyAllowanceRes = await verifyERC20Allowance(
            token,
            from,
            spender,
            amount
          );
          isVerified = Boolean(verifyAllowanceRes.res);
        }
        break;
      case "erc721":
        {
          const verifyAllowanceRes = await verifyERC721Allowance(
            token,
            tokenId,
            spender
          );
          isVerified = Boolean(verifyAllowanceRes.res);
        }
        break;
      case "erc1155":
        {
          const verifyAllowanceRes = await verifyERC1155Allowance(
            token,
            from,
            spender,
            tokenId,
            amount
          );
          isVerified = Boolean(verifyAllowanceRes.res);
        }
        break;
      default:
        console.error("Invalid assert type");
        return false;
    }
  } catch (error) {
    console.error("Failed to verify allowance", error);
  }
  return isVerified;
};
