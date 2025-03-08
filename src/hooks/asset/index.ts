"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { KM_API } from "@/consts/config";
import { AssetBaseData } from "@/types";
import { useKMUser } from "..";
import { formatAssetCardList } from "@/utils";

type FetchKMRes<T> = {
  code: number;
  message: string;
  data: T;
};

type OrderInfo = {
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

interface CommonPaginationReq {
  page_num: number | string;
  page_size: number | string;
}

interface CommonPaginationRes extends CommonPaginationReq {
  total: number;
}

interface AssetListResData<T> extends CommonPaginationRes {
  list: T[];
}

interface UseAssetListParameters extends CommonPaginationReq {
  uri?: string;
}

/**
 * Custom hook to fetch and process asset list data using React Query
 *
 * @param {Object} options - Configuration options
 * @param {UseAssetListParameters} [options.paginationParams] - Pagination parameters
 * @param {boolean} [options.enabled=true] - Whether to fetch data automatically
 * @returns {Object} Processed asset data and query state
 *
 * @example
 * // Basic usage with automatic fetching
 * const { data, isLoading, error } = useKMAssetList();
 *
 * @example
 * // With custom pagination
 * const { data, isLoading, refetch } = useKMAssetList({
 *   paginationParams: { page_num: 2, page_size: 20 }
 * });
 *
 * @example
 * // With disabled automatic fetching
 * const { data, isLoading, refetch } = useKMAssetList({ enabled: false });
 * // Later: trigger fetch manually
 * const handleLoadData = () => refetch();
 */
export const useKMAssetList = ({
  paginationParams = { page_num: "1", page_size: "50" },
  enabled = true,
}: {
  paginationParams?: UseAssetListParameters;
  enabled?: boolean;
} = {}) => {
  // Get user data for currency symbol
  const { data: userData } = useKMUser();
  const currencySymbol = userData?.nativeCurrency?.symbol || "ETH";

  const { page_num, page_size, uri } = paginationParams;

  // Generate query parameters
  const queryParams = useMemo(
    () => ({
      page_num: String(page_num),
      page_size: String(page_size),
    }),
    [page_num, page_size]
  );

  // Construct API URL
  const apiUrl = useMemo(() => {
    const baseUrl = KM_API.endsWith("/") ? KM_API.slice(0, -1) : KM_API;
    return `${baseUrl}/orders${uri ? `/${uri}` : ""}`;
  }, [uri]);

  // Query key includes all parameters that affect the query
  const queryKey = useMemo(
    () => ["assetList", apiUrl, queryParams],
    [apiUrl, queryParams]
  );

  // Fetch and process data in a single query
  const {
    data: assets,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      // 1. Fetch API data
      const response = await fetch(
        `${apiUrl}?${new URLSearchParams(queryParams)}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const apiResponse = (await response.json()) as FetchKMRes<
        AssetListResData<OrderInfo>
      >;

      // 2. Validate response structure
      if (!apiResponse?.data?.list) {
        return {
          assets: null,
          total: 0,
        };
      }

      // 3. Process data
      const formattedAssets = await formatAssetCardList(
        apiResponse.data.list,
        currencySymbol
      );

      return {
        assets: formattedAssets as AssetBaseData[],
        total: apiResponse.data.total as number,
      };
    },
    enabled: enabled, // Only run when enabled and currency is available
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep data in cache for 10 minutes (formerly cacheTime)
  });

  return {
    data: assets?.assets,
    total: assets?.total,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
