import { Installments, Price } from "@/components/common/price";
import type { Product } from "@/types";

export function ProductPrice({
  product,
  size = "md",
}: {
  product: Product;
  size?: "sm" | "md" | "lg";
}) {
  return <Price value={product.price} compareAtValue={product.compareAtPrice} size={size} />;
}

export function ProductInstallments({ product }: { product: Product }) {
  return <Installments total={product.price} />;
}
