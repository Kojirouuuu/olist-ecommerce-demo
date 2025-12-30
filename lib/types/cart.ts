export interface CartItem {
    // 必須フィールド
    productId: string;        // order_itemsのproduct_idに対応
    quantity: number;         // 数量
    price: number;            // order_itemsのpriceに対応（商品単価）
    freightValue: number;     // order_itemsのfreight_valueに対応（配送料）
    
    // 表示用フィールド（商品情報から取得）
    description: string;
    categoryName: string | null;
    imageUrl?: string;        // 商品画像URL（現在はpicsum.photosを使用）
    
    // 計算フィールド（オプション、ストア内で計算可能）
    subtotal?: number;        // price * quantity
    freightTotal?: number;    // freightValue * quantity（商品ごとの配送料合計）
    total?: number;           // subtotal + freightTotal
  }