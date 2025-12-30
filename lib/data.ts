import { prisma } from "@/lib/prisma";

export async function getProducts() {
    const products = await prisma.product.findMany({
        take: 50,
        include: {
            orderItems: {
                take: 1,
                select: { price: true }
            }
        }
    });

    return products;
}

export async function getProductById(id: string) {
    const product = await prisma.product.findUnique({
        where: { id },
        include: { orderItems: { select: { price: true } } }
    });

    return product;
}

export async function getProductWithPrice(id: string) {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            orderItems: {
                take: 1,
                orderBy: { price: "desc" }, // 最新または最高価格を取得
                select: {
                    price: true,
                    freight: true,
                }
            }
        }
    })

    if (!product) return null;

    const price = product.orderItems[0]?.price ?? 0;
    const freightValue = product.orderItems[0]?.freight ?? 0;

    return {
        ...product,
        price,
        freightValue,
    }
}
