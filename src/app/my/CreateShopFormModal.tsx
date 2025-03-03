import { FormModalBox } from "@/components/ui/ModalBox";
import { KM_CONTRACTS } from "@/consts/config";
import { createShop } from "@/utils";
import { useState } from "react";

interface CreateShopFormProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormParams = {
  name: string;
  uri: string;
};

export default function CreateShopFormModal({
  isOpen,
  onClose,
}: CreateShopFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    uri: "",
  } as FormParams);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateShop = async (data: FormParams) => {
    const tx = await createShop(KM_CONTRACTS.ShopFactory, data.name, data.uri);
    if (tx.res) {
      onClose();
      window.location.reload();
    } else {
      console.error("Failed to create shop", tx.error);
    }
  };

  return (
    <FormModalBox
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleCreateShop}
      title="Create Shop"
      formData={formData}
    >
      <>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shop Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="My Awesome Shop"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shop URI
          </label>
          <input
            type="text"
            name="uri"
            value={formData.uri}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="shop-uri"
          />
        </div>
      </>
    </FormModalBox>
  );
}
