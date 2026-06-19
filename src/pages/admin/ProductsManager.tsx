import { useState, useRef } from 'react'
import { useAdmin } from '../../store/AdminContext'
import { generateId } from '../../store/types'
import type { Product } from '../../store/types'
import Button from '../../components/ui/Button'

export default function ProductsManager() {
  const { config, addProduct, updateProduct, deleteProduct, saveConfig } = useAdmin()
  const fileRef = useRef<HTMLInputElement>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
    priceUSD: '',
    stock: '',
  })

  const [formPaymentMethods, setFormPaymentMethods] = useState<string[]>(['usdt'])
  const [newPaymentMethod, setNewPaymentMethod] = useState('')

  const walletOptions = config.wallets.filter((w) => w.enabled)

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm((prev) => ({ ...prev, image: ev.target?.result?.toString() ?? '' }))
    }
    reader.readAsDataURL(file)
  }

  function resetForm() {
    setForm({ name: '', description: '', image: '', priceUSD: '', stock: '' })
    setFormPaymentMethods(['usdt'])
    setNewPaymentMethod('')
  }

  function handleAdd() {
    if (!form.name.trim() || !form.priceUSD) return
    const product: Product = {
      id: generateId('prd-'),
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image,
      priceUSD: parseFloat(form.priceUSD),
      stock: form.stock === '' ? null : parseInt(form.stock, 10),
      paymentMethods: formPaymentMethods,
      active: true,
      createdAt: new Date().toISOString(),
    }
    addProduct(product)
    resetForm()
    setShowAdd(false)
  }

  function handleEdit(product: Product) {
    setEditId(product.id)
    setForm({
      name: product.name,
      description: product.description,
      image: product.image,
      priceUSD: product.priceUSD.toString(),
      stock: product.stock === null ? '' : product.stock.toString(),
    })
    setFormPaymentMethods([...product.paymentMethods])
  }

  function handleSaveEdit() {
    if (!editId || !form.name.trim() || !form.priceUSD) return
    updateProduct(editId, {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image,
      priceUSD: parseFloat(form.priceUSD),
      stock: form.stock === '' ? null : parseInt(form.stock, 10),
      paymentMethods: formPaymentMethods,
    })
    setEditId(null)
    resetForm()
  }

  function cancelEdit() {
    setEditId(null)
    resetForm()
  }

  function handleDelete(id: string) {
    deleteProduct(id)
    setDeleteConfirm(null)
  }

  function addPaymentMethod() {
    if (newPaymentMethod && !formPaymentMethods.includes(newPaymentMethod)) {
      setFormPaymentMethods([...formPaymentMethods, newPaymentMethod])
    }
    setNewPaymentMethod('')
  }

  function removePaymentMethod(id: string) {
    setFormPaymentMethods(formPaymentMethods.filter((p) => p !== id))
  }

  function toggleActive(product: Product) {
    updateProduct(product.id, { active: !product.active })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="h3">إدارة المنتجات</h2>
        <div className="flex gap-2">
          <Button variant="gold" onClick={saveConfig}>حفظ</Button>
          <button className="btn-gold text-sm" onClick={() => { resetForm(); setShowAdd(true) }}>
            + إضافة منتج
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="luxury-card p-6 mb-6">
          <h3 className="h4 mb-4">منتج جديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block body-secondary text-xs mb-1">اسم المنتج</label>
              <input className="input-luxury w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block body-secondary text-xs mb-1">السعر (USD)</label>
              <input className="input-luxury w-full" type="number" step="0.01" min="0" value={form.priceUSD} onChange={(e) => setForm({ ...form, priceUSD: e.target.value })} />
            </div>
            <div>
              <label className="block body-secondary text-xs mb-1">الكمية (فارغ = غير محدود)</label>
              <input className="input-luxury w-full" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="اترك فارغاً للكمية غير المحدودة" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block body-secondary text-xs mb-1">الوصف</label>
            <textarea className="input-luxury w-full min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="mb-4">
            <label className="block body-secondary text-xs mb-1">صورة المنتج</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
            {form.image && (
              <div className="mt-2 relative inline-block">
                <img src={form.image} alt="" className="h-24 w-24 object-cover rounded-lg border border-border" />
                <button className="absolute -top-2 -right-2 bg-error text-white rounded-full w-5 h-5 flex items-center justify-center text-xs" onClick={() => setForm({ ...form, image: '' })}>×</button>
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block body-secondary text-xs mb-1">طرق الدفع المتاحة</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formPaymentMethods.map((pm) => {
                const wal = config.wallets.find((w) => w.id === pm)
                return (
                  <span key={pm} className="pill-luxury flex items-center gap-1">
                    {wal?.label || pm}
                    <button className="text-error text-xs" onClick={() => removePaymentMethod(pm)}>×</button>
                  </span>
                )
              })}
            </div>
            <div className="flex gap-2">
              <select className="input-luxury text-sm" value={newPaymentMethod} onChange={(e) => setNewPaymentMethod(e.target.value)}>
                <option value="">اختر محفظة</option>
                {walletOptions.filter((w) => !formPaymentMethods.includes(w.id)).map((w) => (
                  <option key={w.id} value={w.id}>{w.label}</option>
                ))}
              </select>
              <Button variant="outline-gold" onClick={addPaymentMethod}>إضافة</Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="gold" onClick={handleAdd}>إضافة</Button>
            <Button variant="outline-gold" onClick={() => { setShowAdd(false); resetForm() }}>إلغاء</Button>
          </div>
        </div>
      )}

      {config.products.length === 0 ? (
        <div className="luxury-card p-8 text-center">
          <p className="body-secondary">لا توجد منتجات بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.products.map((product) => {
            const isEditing = editId === product.id
            return (
              <div key={product.id} className={`luxury-card p-4 ${!product.active ? 'opacity-50' : ''}`}>
                {isEditing ? (
                  <div>
                    <div className="grid grid-cols-1 gap-3">
                      <input className="input-luxury w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="الاسم" />
                      <input className="input-luxury w-full" type="number" step="0.01" value={form.priceUSD} onChange={(e) => setForm({ ...form, priceUSD: e.target.value })} placeholder="السعر" />
                      <input className="input-luxury w-full" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="الكمية (فارغ = غير محدود)" />
                      <textarea className="input-luxury w-full min-h-[60px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="الوصف" />
                      <div>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
                        {form.image && (
                          <div className="mt-1 relative inline-block">
                            <img src={form.image} alt="" className="h-16 w-16 object-cover rounded border border-border" />
                            <button className="absolute -top-1.5 -right-1.5 bg-error text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]" onClick={() => setForm({ ...form, image: '' })}>×</button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {formPaymentMethods.map((pm) => {
                          const wal = config.wallets.find((w) => w.id === pm)
                          return (
                            <span key={pm} className="pill-luxury text-xs flex items-center gap-1">
                              {wal?.label || pm}
                              <button className="text-error" onClick={() => removePaymentMethod(pm)}>×</button>
                            </span>
                          )
                        })}
                        <div className="flex gap-1 w-full mt-1">
                          <select className="input-luxury text-xs flex-1" value={newPaymentMethod} onChange={(e) => setNewPaymentMethod(e.target.value)}>
                            <option value="">+ محفظة</option>
                            {walletOptions.filter((w) => !formPaymentMethods.includes(w.id)).map((w) => (
                              <option key={w.id} value={w.id}>{w.label}</option>
                            ))}
                          </select>
                          <button className="btn-gold text-xs py-1 px-2" onClick={addPaymentMethod}>إضافة</button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="btn-gold text-sm" onClick={handleSaveEdit}>حفظ</button>
                      <button className="btn-outline-gold text-sm" onClick={cancelEdit}>إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start gap-3 mb-3">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-20 w-20 object-cover rounded-lg border border-border flex-shrink-0" />
                      ) : (
                        <div className="h-20 w-20 rounded-lg border border-border bg-espresso-faint flex items-center justify-center flex-shrink-0">
                          <span className="body-secondary text-xs">لا توجد صورة</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="h4 truncate">{product.name}</h4>
                        <p className="mono gold-text text-sm">${product.priceUSD.toFixed(2)}</p>
                        <p className="caption mt-1">
                          {product.stock === null ? 'كمية غير محدودة' : `المتبقي: ${product.stock}`}
                        </p>
                      </div>
                    </div>
                    {product.description && (
                      <p className="body-secondary text-sm mb-2 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.paymentMethods.map((pm) => {
                        const wal = config.wallets.find((w) => w.id === pm)
                        return <span key={pm} className="pill-luxury text-xs">{wal?.label || pm}</span>
                      })}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          className="toggle"
                          data-on={product.active ? 'true' : 'false'}
                          onClick={() => toggleActive(product)}
                          type="button"
                        />
                        <span className="caption">{product.active ? 'مفعل' : 'معطل'}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-outline-gold text-xs py-1 px-2" onClick={() => handleEdit(product)}>تعديل</button>
                        {deleteConfirm === product.id ? (
                          <div className="flex gap-1">
                            <button className="bg-error text-white text-xs py-1 px-2 rounded" onClick={() => handleDelete(product.id)}>تأكيد</button>
                            <button className="btn-outline-gold text-xs py-1 px-2" onClick={() => setDeleteConfirm(null)}>إلغاء</button>
                          </div>
                        ) : (
                          <button className="bg-error/20 text-error text-xs py-1 px-2 rounded" onClick={() => setDeleteConfirm(product.id)}>حذف</button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
