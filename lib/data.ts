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
