import { ProductForm } from "@/components/products/ProductForm";

export default function CreateProductPage() {
  return (
    <div className="py-6">
      <ProductForm mode="create" />
    </div>
  );
}
