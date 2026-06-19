import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../store/AdminContext'
import NotesBanner from '../components/admin/NotesBanner'

export default function Products() {
  const { config } = useAdmin()
  const navigate = useNavigate()

  const activeProducts = config.products.filter((p) => p.active)

  if (activeProducts.length === 0) {
    return (
      <div className="section">
        <div className="max-w-6xl mx-auto text-center py-20">
          <h2 className="h2 mb-4">المنتجات</h2>
          <p className="body-secondary">لا توجد منتجات متاحة حالياً</p>
        </div>
      </div>
    )
  }

  return (
    <div className="section">
      <div className="max-w-6xl mx-auto">
        <NotesBanner section="products" />
        <h2 className="h2 mb-2">المنتجات</h2>
        <p className="body-secondary mb-8">تصفح المنتجات المتاحة للشراء</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeProducts.map((product) => {
            const outOfStock = product.stock !== null && product.stock <= 0

            return (
              <div
                key={product.id}
                className="luxury-card p-5 flex flex-col cursor-pointer hover:border-gold/50 transition-colors"
                onClick={() => !outOfStock && navigate(`/products/${product.id}`)}
              >
                {product.image ? (
                  <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-espresso-faint">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg mb-4 bg-espresso-faint flex items-center justify-center">
                    <span className="body-secondary">لا توجد صورة</span>
                  </div>
                )}

                <h3 className="h4 mb-1">{product.name}</h3>

                {product.description && (
                  <p className="body-secondary text-sm mb-3 line-clamp-2">{product.description}</p>
                )}

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-3">
                    <span className="mono gold-text text-lg">${product.priceUSD.toFixed(2)}</span>
                    <span className="caption">
                      {outOfStock ? 'نفذت الكمية' : product.stock === null ? 'متوفر' : `بقي ${product.stock}`}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.paymentMethods.map((pm) => {
                      const wal = config.wallets.find((w) => w.id === pm)
                      return <span key={pm} className="pill-luxury text-xs">{wal?.label || pm}</span>
                    })}
                  </div>

                  <button
                    className={`btn-gold w-full text-sm ${outOfStock ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!outOfStock) navigate(`/products/${product.id}`)
                    }}
                  >
                    {outOfStock ? 'نفذت الكمية' : 'اشتري الآن'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
