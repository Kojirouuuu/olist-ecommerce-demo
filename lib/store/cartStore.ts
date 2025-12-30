import { create } from "zustand";
import { persist } from "zustand/middleware"; // ローカルストレージに保存
import type { CartItem } from "@/lib/types/cart";

interface CartState {
    // 状態(state)
    items: CartItem[];
    isOpen: boolean;

    // アクション(mutators)
    addItem: (item: Omit<CartItem, "subtotal" | "freightTotal" | "total">) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;

    // 計算プロパティ(getter)
    getTotalPrice: () => number;
    getTotalFreight: () => number;
    getGrandTotal: () => number;
    getItemCount: () => number;
    getItemByProductId: (productId: string) => CartItem | undefined;
}

// ヘルパー関数:アイテムの合計を計算
const calculateItemTotal = (item: CartItem): CartItem => {
    const subtotal = item.price * item.quantity;
    const freightTotal = item.freightValue * item.quantity;
    const total = subtotal + freightTotal;

    return {
        ...item,
        subtotal,
        freightTotal,
        total,
    }
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            // 初期状態
            items: [],
            isOpen: false,

            // 商品をカートに追加
            addItem: (newItem) => {
                const { items } = get();
                const existingItem = items.find((item) => item.productId === newItem.productId);

                if (existingItem) {
                    // すでにカートにある場合は数量を増やす
                    const updatedItem = calculateItemTotal({
                        ...existingItem,
                        quantity: existingItem.quantity + newItem.quantity,
                    });

                    set({
                        items: items.map((item =>
                            item.productId === newItem.productId ? updatedItem : item
                        )),
                    });
                } else {
                    // 新規追加
                    const calculatedItem = calculateItemTotal(newItem);
                    set({ items: [...items, calculatedItem] });
                }
            },

            // 商品をカートから削除
            removeItem: (productId) => {
                set({
                    items: get().items.filter(item => item.productId !== productId),
                });
            },

            // 数量を更新
            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                }

                const { items } = get();
                const updatedItems = items.map(item => {
                    if (item.productId === productId) {
                        return calculateItemTotal({
                            ...item,
                            quantity,
                        });
                    }
                    return item;
                });

                set({ items: updatedItems });
            },

            // カートをクリア
            clearCart: () => {
                set({ items: [] });
            },

            // カートUIの開閉
            toggleCart: () => {
                set((state) => ({ isOpen: !state.isOpen }));
            },

            // 合計金額を取得
            getTotalPrice: () => {
                return get().items.reduce((sum, item) => {
                    return sum + (item.price * item.quantity);
                }, 0);
            },

            // 配送料の合計
            getTotalFreight: () => {
                return get().items.reduce((sum, item) => {
                    return sum + (item.freightValue * item.quantity);
                }, 0);
            },

            // 総合計
            getGrandTotal: () => {
                return get().getTotalPrice() + get().getTotalFreight();
            },

            // カート内の商品個数
            getItemCount: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },

            // 特定商品の取得
            getItemByProductId: (productId) => {
                return get().items.find(item => item.productId === productId);
            },
        }),
        {
            name: "cart-storage", // ローカルストレージのキー名
            // 永続化するフィールドを指定
            partialize: (state) => ({ items: state.items }),
        }
    )
);
