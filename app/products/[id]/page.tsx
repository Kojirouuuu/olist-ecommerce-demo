import { getProductById } from "@/lib/data";
import Image from "next/image";

export default async function Page({ params }: { params: { id: string }}) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const product = await getProductById(id);

    if (!product) return null;

    // product.idをシードとして使用してランダム画像を取得
    // product.idをハッシュしてシードとして使用
    const seed = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageUrl = `https://picsum.photos/seed/${seed}/800/600`;

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
        </div>
    )
}