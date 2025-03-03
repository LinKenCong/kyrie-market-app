import { KM_API } from "@/consts/config";

export type FetchResponse<T> = {
  res: T | null;
  error: any;
};

export type KMResponseType = {
  code: number;
  message: string;
  data: any;
};

export const fetchKMGet = async (
  uri: string,
  params?: Record<string, string>
) => {
  let url = `${KM_API}${uri}`;
  if (params) {
    url = `${url}?${new URLSearchParams(params).toString()}`;
  }
  const response: FetchResponse<KMResponseType> = { res: null, error: null };
  try {
    const data = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    response.res = await data.json();
  } catch (error) {
    response.error = error;
  }
  return response;
};

export const fetchKMPost = async (uri: string, body: Record<string, any>) => {
  const response: FetchResponse<KMResponseType> = { res: null, error: null };
  try {
    const data = await fetch(`${KM_API}${uri}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    response.res = await data.json();
  } catch (error) {
    response.error = error;
  }
  return response;
};

export type MetadataType = {
  image: string;
  name?: string;
  description?: string;
  attributes?: { trait_type: string; value: string }[];
};

export const fetchNFTMetadata = async (url: string) => {
  const response: FetchResponse<MetadataType> = { res: null, error: null };
  try {
    const data = await fetch(url);
    const res: MetadataType = await data.json();
    response.res = res;
  } catch (error) {
    response.error = error;
  }
  return response;
};
