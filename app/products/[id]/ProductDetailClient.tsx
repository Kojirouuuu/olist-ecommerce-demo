"use client";

import { useCartStore } from "@/lib/store/cartStore";
import Image from "next/image";

// クライアントコンポーネント
export function ProductDetailClient({ product }: { product: any }) {
    const addItem = useCartStore(state => state.addItem);
    // product.idをシードとして使用してランダム画像を取得
    // product.idをハッシュしてシードとして使用
    const seed = product.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const imageUrl = `https://picsum.photos/seed/${seed}/800/600`;

    const handleAddToCart = () => {
        addItem({
            productId: product.id,
            quantity: 1,
            price: product.price,
            freightValue: product.freightValue,
            description: product.description,
            categoryName: product.categoryName,
            imageUrl: imageUrl,
        })
    }
    return (
        <div>
            <Image 
                src={imageUrl}
                alt={product.description || "Product image"}
                width={800}
                height={600}
                unoptimized
            />
            <h1>{product.description}</h1>
            <p>{product.categoryName}</p>
            <p>{product.orderItems[0]?.price}</p>
            <button onClick={handleAddToCart}>Add to Cart</button>
        </div>
    )
}