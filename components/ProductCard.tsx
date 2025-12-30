interface ProductCardProps {
  id: string;
  categoryName: string | null;
  description: string | null;
  price: number | null;
}

export function ProductCard({ id, categoryName, description, price }: ProductCardProps) {
  return (
    <div>
      <div>
        <h3>{description || "No description"}</h3>
        {categoryName && <p>{categoryName}</p>}
      </div>
      <div>
        <p>Price: {price ? `R$ ${price}` : "No price"}</p>
      </div>
    </div>
  );
}

