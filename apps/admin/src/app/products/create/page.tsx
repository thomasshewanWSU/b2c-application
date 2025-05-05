import { ProductForm } from "../../../components/products/productForm";

export default function CreateProductPage() {
  return (
    <div className="py-6">
      <ProductForm mode="create" />
    </div>
  );
}
