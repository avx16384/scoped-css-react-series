import { useCSS } from '@gmono/scoped-css-react'

interface Product {
  name: string
  category: string
  price: string
  rating: number
  emoji: string
}

const PRODUCTS: Product[] = [
  { name: 'Wireless Headphones', category: 'Audio', price: '$199', rating: 5, emoji: '🎧' },
  { name: 'Mechanical Keyboard', category: 'Peripherals', price: '$149', rating: 4, emoji: '⌨️' },
  { name: 'USB-C Hub', category: 'Accessories', price: '$59', rating: 4, emoji: '🔌' },
  { name: 'Desk Lamp', category: 'Office', price: '$89', rating: 5, emoji: '💡' },
  { name: 'Coffee Mug', category: 'Lifestyle', price: '$24', rating: 3, emoji: '☕' },
  { name: 'Notebook Pro', category: 'Stationery', price: '$39', rating: 5, emoji: '📓' },
]

export function CardGrid() {
  const { classes, style } = useCSS(`
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }
    .card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      transition: box-shadow 0.2s ease, transform 0.2s ease;
      display: flex;
      flex-direction: column;
    }
    .card:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }
    .card-image {
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3.5rem;
      background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
    }
    .card-body {
      padding: 1.25rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .card-category {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6366f1;
      margin-bottom: 0.35rem;
    }
    .card-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }
    .card-rating {
      display: flex;
      gap: 2px;
      margin-bottom: 0.75rem;
    }
    .card-star {
      color: #fbbf24;
      font-size: 0.9rem;
    }
    .card-star-empty {
      color: #d1d5db;
      font-size: 0.9rem;
    }
    .card-footer {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-price {
      font-size: 1.25rem;
      font-weight: 800;
      color: #1e293b;
    }
    .card-buy {
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
      font-family: inherit;
    }
    .card-buy:hover { background: #4f46e5; }
  `)

  return (
    <div>
      {style}
      <div className={classes['grid']}>
        {PRODUCTS.map((product) => (
          <div key={product.name} className={classes['card']}>
            <div className={classes['card-image']}>{product.emoji}</div>
            <div className={classes['card-body']}>
              <span className={classes['card-category']}>{product.category}</span>
              <h3 className={classes['card-name']}>{product.name}</h3>
              <div className={classes['card-rating']}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < product.rating ? classes['card-star'] : classes['card-star-empty']}>
                    ★
                  </span>
                ))}
              </div>
              <div className={classes['card-footer']}>
                <span className={classes['card-price']}>{product.price}</span>
                <button className={classes['card-buy']}>Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
