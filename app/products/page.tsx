import { getProducts } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";

export default async function ProductsPage() {
    const products = await getProducts();

    return (
        <div>
            {products.map((product) => (
                <ProductCard key={product.id} id={product.id} categoryName={product.categoryName} description={product.description} price={product.orderItems[0].price} />
            ))}
        </div>
    );
}