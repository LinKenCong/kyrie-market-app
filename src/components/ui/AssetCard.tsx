"use client";

import Link from "next/link";
import { BasePageImage } from "./PageImage";
import { AssetBaseData } from "@/types";

export const AssetCard = (item: AssetBaseData) => {
  const URL = `/asset?uuid=${encodeURIComponent(item.uuid)}`;
  /// TODO: Show Chain ID
  return (
    <div className="km-border w-full max-w-sm bg-white shadow-sm dark:bg-gray-800 ">
      <Link href={URL}>
        <BasePageImage
          src={item.image}
          size={500}
          alt={item.title}
          className="km-border-b"
        />

        <div className="p-4">
          <h5 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white truncate">
            {item.title}
          </h5>
          <div className="flex items-center justify-between pt-2">
            <span className="text-gray-900 dark:text-white">
              {`${item.price} ${item.currency}`}
            </span>
            <span>
              <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-gray-300">
                x{item.amount}
              </span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};
