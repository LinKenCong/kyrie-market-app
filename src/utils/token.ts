import { getBalance, readContract, writeContract } from "@wagmi/core";
import { config } from "@/wagmi";
import { NativeCurrency, Web3OperationResult } from "@/types";
import { ABI_ERC1155, ABI_ERC20, ABI_ERC721 } from "@/abis";

// Native

export const getNativeBalance = async (address: `0x${string}`) => {
  let res: Web3OperationResult<NativeCurrency> = {
    res: null,
    error: null,
  };
  try {
    const balance = await getBalance(config, {
      address: address,
    });
    if (balance) {
      res.res = {
        decimals: balance.decimals,
        formatted: balance.formatted,
        symbol: balance.symbol,
        value: `${balance.value}n`,
      };
    }
  } catch (error) {
    console.error("Failed to fetch native balance", error);
    res.error = error;
  }
  return res;
};

// ERC20

export const getERC20Balance = async (token: string, address: string) => {
  let res: Web3OperationResult<string> = {
    res: null,
    error: null,
  };
  try {
    const balance = await readContract(config, {
      abi: ABI_ERC20,
      functionName: "balanceOf",
      address: token as `0x${string}`,
      args: [address],
    });
    res.res = String(balance);
  } catch (error) {
    console.error(`Failed to fetch ERC20 balance for token: ${token}`, error);
    res.error = error;
  }
  return res;
};

export const approveERC20 = async (
  token: string,
  spender: string,
  amount: string | bigint
) => {
  let res: Web3OperationResult<boolean> = {
    res: null,
    error: null,
  };
  try {
    const tx = await writeContract(config, {
      abi: ABI_ERC20,
      functionName: "approve",
      address: token as `0x${string}`,
      args: [spender, BigInt(amount)],
    });
    res.res = tx !== null;
  } catch (error) {
    console.error(`Failed to approve ERC20 for token: ${token}`, error);
    res.error = error;
  }
  return res;
};

export const getTokenDecimals = async (token: string) => {
  let res: Web3OperationResult<number> = {
    res: null,
    error: null,
  };
  try {
    const decimals = await readContract(config, {
      abi: ABI_ERC20,
      functionName: "decimals",
      address: token as `0x${string}`,
    });
    res.res = Number(decimals);
  } catch (error) {
    console.error(`Failed to fetch ERC20 decimals for token: ${token}`, error);
    res.error = error;
  }
  return res;
};

export const getTokenName = async (token: string) => {
  let res: Web3OperationResult<string> = {
    res: null,
    error: null,
  };
  try {
    const name = await readContract(config, {
      abi: ABI_ERC20,
      functionName: "name",
      address: token as `0x${string}`,
    });
    res.res = name as string;
  } catch (error) {
    console.error(`Failed to fetch ERC20 name for token: ${token}`, error);
    res.error = error;
  }
  return res;
};

// ERC721

export const getERC721Owner = async (token: string, tokenId: string) => {
  let res: Web3OperationResult<string> = {
    res: null,
    error: null,
  };
  try {
    const owner = await readContract(config, {
      abi: ABI_ERC721,
      functionName: "ownerOf",
      address: token as `0x${string}`,
      args: [BigInt(tokenId)],
    });
    res.res = owner as string;
  } catch (error) {
    console.error(
      `Failed to fetch ERC721 owner for token: ${token}, tokenId: ${tokenId}`,
      error
    );
    res.error = error;
  }
  return res;
};

export const approveERC721 = async (
  token: string,
  spender: string,
  tokenId: string
) => {
  let res: Web3OperationResult<boolean> = {
    res: null,
    error: null,
  };
  try {
    const tx = await writeContract(config, {
      abi: ABI_ERC721,
      functionName: "approve",
      address: token as `0x${string}`,
      args: [spender, BigInt(tokenId)],
    });
    res.res = tx !== null;
  } catch (error) {
    console.error(`Failed to approve ERC721 for token: ${token}`, error);
    res.error = error;
  }
  return res;
};

export const getTokenURI = async (token: string, tokenId: string) => {
  let res: Web3OperationResult<string> = {
    res: null,
    error: null,
  };
  try {
    const uri = await readContract(config, {
      abi: ABI_ERC721,
      functionName: "tokenURI",
      address: token as `0x${string}`,
      args: [BigInt(tokenId)],
    });
    res.res = uri as string;
  } catch (error) {
    console.error(
      `Failed to fetch ERC721 token URI for token: ${token}, tokenId: ${tokenId}`,
      error
    );
    res.error = error;
  }
  return res;
};

// ERC1155

export const getERC1155Balance = async (
  token: string,
  address: string,
  tokenId: string
) => {
  let res: Web3OperationResult<string> = {
    res: null,
    error: null,
  };
  try {
    const balance = await readContract(config, {
      abi: ABI_ERC1155,
      functionName: "balanceOf",
      address: token as `0x${string}`,
      args: [address, BigInt(tokenId)],
    });
    res.res = String(balance);
  } catch (error) {
    console.error(
      `Failed to fetch ERC1155 balance for token: ${token}, tokenId: ${tokenId}`,
      error
    );
    res.error = error;
  }
  return res;
};

export const approveERC1155 = async (token: string, spender: string) => {
  let res: Web3OperationResult<boolean> = {
    res: null,
    error: null,
  };
  try {
    const tx = await writeContract(config, {
      abi: ABI_ERC1155,
      functionName: "setApprovalForAll",
      address: token as `0x${string}`,
      args: [spender, true],
    });
    res.res = tx !== null;
  } catch (error) {
    console.error(`Failed to approve ERC1155 for token: ${token}`, error);
    res.error = error;
  }
  return res;
};

export const getERC1155URI = async (token: string, tokenId: string) => {
  let res: Web3OperationResult<string> = {
    res: null,
    error: null,
  };
  try {
    const uri = await readContract(config, {
      abi: ABI_ERC1155,
      functionName: "uri",
      address: token as `0x${string}`,
      args: [BigInt(tokenId)],
    });
    res.res = uri as string;
  } catch (error) {
    console.error(
      `Failed to fetch ERC1155 token URI for token: ${token}, tokenId: ${tokenId}`,
      error
    );
    res.error = error;
  }
  return res;
};

// ALL

export const approveTokenTo = async (
  assertType: string,
  to: string,
  token: string,
  tokenId: string,
  amount: bigint
) => {
  try {
    switch (assertType) {
      case "erc20":
        await approveERC20(token, to, amount);
        break;
      case "erc721":
        await approveERC721(token, to, tokenId);
        break;
      case "erc1155":
        await approveERC1155(token, to);
        break;
    }
  } catch (error) {
    console.error("Failed to approve", error);
  }
};
