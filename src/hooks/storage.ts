"use client";

import { useState, useEffect, useCallback } from "react";
import LocalStorageHelper from "@/utils/localStorageHelper";
import { AccountInfo, NativeCurrency } from "@/types";
import { useAccount, useAccountEffect, useBalance } from "wagmi";
import makeBlockie from "ethereum-blockies-base64";
import { useRouter } from "next/navigation";

/**
 * Custom hook for managing data in local storage with TypeScript support
 *
 * @template T - Type of data to store
 * @param {string} key - The local storage key
 * @param {T} [initialValue] - Optional initial value if storage is empty
 * @returns {Object} Storage operations and state
 *
 * @example
 * // Basic usage
 * const { data, isLoading, save } = useKMLocalStorage<UserPreferences>("user_prefs");
 *
 * @example
 * // With initial value
 * const { data, save, remove } = useKMLocalStorage<UserPreferences>(
 *   "user_prefs",
 *   { theme: "dark", notifications: true }
 * );
 *
 * @example
 * // Handling loading and error states
 * const { data, isLoading, error, refresh } = useKMLocalStorage<UserData>("user_data");
 *
 * if (isLoading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 * return <UserProfile data={data} />;
 */
export const useKMLocalStorage = <T>(key: string, initialValue?: T) => {
  // Use a single state object for better management
  const [state, setState] = useState<{
    data: T | null;
    isLoading: boolean;
    error: Error | null;
  }>({
    data: null,
    isLoading: true,
    error: null,
  });

  // Fetch data from local storage
  const fetchData = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const storageData = LocalStorageHelper.getItem<T>(key);
      setState({
        data: storageData,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
    }
  }, [key]);

  /**
   * Save data to local storage
   * Merges with existing data if partial update
   *
   * @param {Partial<T>} value - Full or partial data to save
   * @returns {boolean} Success status of the operation
   */
  const save = useCallback(
    (value: Partial<T>) => {
      try {
        // Get latest data from state to avoid dependency on data
        setState((prevState) => {
          const newValue = prevState.data
            ? ({ ...prevState.data, ...value } as T)
            : (value as T);

          LocalStorageHelper.updateItem(key, newValue);

          return {
            data: newValue,
            isLoading: false,
            error: null,
          };
        });
        return true;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err : new Error(String(err)),
        }));
        return false;
      }
    },
    [key]
  );

  // Initialize storage
  useEffect(() => {
    if (
      initialValue !== undefined &&
      LocalStorageHelper.getItem(key) === null
    ) {
      LocalStorageHelper.updateItem(key, initialValue);
      setState({
        data: initialValue,
        isLoading: false,
        error: null,
      });
    } else {
      fetchData();
    }
  }, [key, initialValue, fetchData]);

  /**
   * Remove data from local storage
   * @returns {boolean} Success status of the operation
   */
  const remove = useCallback(() => {
    try {
      LocalStorageHelper.removeItem(key);
      setState((prev) => ({ ...prev, data: null }));
      return true;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
      return false;
    }
  }, [key]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    save,
    remove,
    refresh: fetchData,
  };
};

/**
 * Type definition for user state stored in local storage
 */
export type CurrentUserState = {
  accountInfo?: AccountInfo;
  nativeCurrency?: NativeCurrency;
};

/**
 * Custom hook for managing blockchain user data
 * Handles account connection, wallet balance and related user information
 *
 * @returns {Object} User data and operations
 *
 * @example
 * // Basic usage
 * const { data: user, isLoading } = useKMUser();
 *
 * @example
 * // Access account and currency information
 * const { data } = useKMUser();
 *
 * if (data?.accountInfo) {
 *   console.log(`Connected to account: ${data.accountInfo.account}`);
 *   console.log(`On chain: ${data.accountInfo.chainId}`);
 * }
 *
 * if (data?.nativeCurrency) {
 *   console.log(`Balance: ${data.nativeCurrency.formatted} ${data.nativeCurrency.symbol}`);
 * }
 *
 * @example
 * // Manual refresh
 * const { refresh, update } = useKMUser();
 *
 * const handleRefresh = () => {
 *   refresh(); // Refresh from local storage
 *   update(); // Force update with latest blockchain data
 * };
 */
export const useKMUser = () => {
  const STORAGE_KEY = "current_user";
  const router = useRouter();

  const {
    data: user,
    save,
    remove,
    isLoading,
    error,
    refresh,
  } = useKMLocalStorage<CurrentUserState>(STORAGE_KEY);

  // Get blockchain account data
  const { address, isConnected, chainId } = useAccount();

  // Get native currency balance
  const { data: balanceData } = useBalance({
    address: address,
  });

  /**
   * Update user state with latest blockchain data
   * @returns {void}
   */
  const update = useCallback(() => {
    const newUserState: CurrentUserState = {};

    // Update account information if available
    if (address && chainId) {
      newUserState.accountInfo = {
        account: address,
        chainId,
        isConnected,
        icon: makeBlockie(address), // Generate blockie avatar from address
      };
    }

    // Update currency information if available
    if (balanceData) {
      newUserState.nativeCurrency = {
        decimals: balanceData.decimals,
        formatted: balanceData.formatted,
        symbol: balanceData.symbol,
        value: balanceData.value.toString(), // Store value as string without 'n' suffix
      };
    }

    // Only save if we have data to update
    if (Object.keys(newUserState).length > 0) {
      save(newUserState);
    }
  }, [address, chainId, isConnected, balanceData, save]);

  // Handle wallet connection/disconnection events
  useAccountEffect({
    onConnect() {
      router.refresh(); // Refresh the page when wallet connects
    },
    onDisconnect() {
      remove(); // Clear user data when wallet disconnects
      router.push("/"); // Navigate to home page
    },
  });

  // Update user data when relevant blockchain data changes
  useEffect(() => {
    update();
  }, [address, chainId, isConnected, balanceData, update]);

  return {
    data: user,
    update,
    remove,
    isLoading,
    error,
    refresh,
  };
};
