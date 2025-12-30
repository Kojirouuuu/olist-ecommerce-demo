import { getProductWithPrice } from "@/lib/data";
import { ProductDetailClient } from "./ProductDetailClient";

export default async function Page({ params }: { params: { id: string }}) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const product = await getProductWithPrice(id);

    if (!product) return null;

    return <ProductDetailClient product={product} />
}