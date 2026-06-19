import { useState } from 'react'
import { useAdmin } from '../../store/AdminContext'
import { XIcon, WalletIcon } from '../../components/icons/Icons'
import { generateId } from '../../store/types'

export default function ServicesManager() {
  const {
    config, toggleService, toggleMaintenance, updateService,
    addService, deleteService, addWalletToService, removeWalletFromService,
    addWallet, saveConfig,
  } = useAdmin()

  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [walletModal, setWalletModal] = useState<{ serviceId: string } | null>(null)
  const [walletMode, setWalletMode] = useState<'existing' | 'new'>('existing')
  const [selectedWalletId, setSelectedWalletId] = useState('')
  const [newWalletLabel, setNewWalletLabel] = useState('')
  const [newWalletValue, setNewWalletValue] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [feeEditId, setFeeEditId] = useState<string | null>(null)
  const [feeEditValue, setFeeEditValue] = useState('')

  const walletMap: Record<string, string> = {}
  for (const w of config.wallets) {
    walletMap[w.id] = w.label
  }

  const availableWallets = config.wallets.filter((w) => w.enabled)

  const handleStartEdit = (id: string, name: string) => {
    setEditId(id)
    setEditName(name)
  }

  const handleSaveName = (id: string) => {
    if (editName.trim()) {
      updateService(id, { name: editName.trim() })
      saveConfig()
    }
    setEditId(null)
  }

  const handleAddService = () => {
    if (!newName.trim()) return
    const id = generateId('svc-')
    addService({
      id,
      name: newName.trim(),
      active: true,
      maintenance: false,
      allowedWallets: [],
    })
    saveConfig()
    setNewName('')
    setShowAdd(false)
  }

  const handleDeleteService = (id: string) => {
    const orderCount = config.orders.filter((o) => o.operator === id || o.type.includes(id)).length
    if (orderCount > 0) {
      if (!window.confirm(`هذه الخدمة مرتبطة بـ ${orderCount} طلب. تعطيلها بدلاً من الحذف؟`)) {
        setDeleteConfirm(null)
        return
      }
      toggleService(id)
      saveConfig()
      setDeleteConfirm(null)
      return
    }
    deleteService(id)
    saveConfig()
    setDeleteConfirm(null)
  }

  const handleAddWalletExisting = () => {
    if (!walletModal || !selectedWalletId) return
    addWalletToService(walletModal.serviceId, selectedWalletId)
    setSelectedWalletId('')
  }

  const handleAddWalletNew = () => {
    if (!walletModal || !newWalletLabel.trim() || !newWalletValue.trim()) return
    const id = generateId('wal-')
    addWallet({
      id,
      label: newWalletLabel.trim(),
      value: newWalletValue.trim(),
      enabled: true,
      createdAt: new Date().toISOString(),
    })
    addWalletToService(walletModal.serviceId, id)
    setNewWalletLabel('')
    setNewWalletValue('')
    setWalletMode('existing')
  }

  const serviceCount = (id: string): number => {
    return config.orders.filter((o) => o.operator === id || o.type.includes(id)).length
  }

  function handleStartFeeEdit(id: string, currentFee: number | undefined) {
    setFeeEditId(id)
    setFeeEditValue(currentFee?.toString() ?? '')
  }

  function handleSaveFee(id: string) {
    const val = feeEditValue.trim()
    updateService(id, { feePercent: val === '' ? undefined : parseFloat(val) })
    setFeeEditId(null)
    setFeeEditValue('')
  }

  function handleResetFee(id: string) {
    updateService(id, { feePercent: undefined })
    setFeeEditId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="h3 md:h2 text-espresso">إدارة الخدمات</h2>
        <div className="flex items-center gap-2">
          <button type="button" onClick={saveConfig} className="btn-gold text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2">
            حفظ التغييرات
          </button>
          <button type="button"
            onClick={() => setShowAdd(true)}
            className="btn-outline-gold text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-1.5"
          >
            إضافة خدمة
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="luxury-card p-4 mb-4 animate-fade-up">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="اسم الخدمة الجديدة..."
              className="input-luxury flex-1 text-sm"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
            />
            <button type="button" onClick={handleAddService} className="btn-gold text-sm px-4 py-2" disabled={!newName.trim()}>
              إضافة
            </button>
            <button type="button" onClick={() => { setShowAdd(false); setNewName('') }} className="p-2 text-espresso-muted hover:text-espresso">
              <XIcon size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {config.services.map((svc) => (
          <div key={svc.id} className="luxury-card p-4 md:p-5 animate-fade-up">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                {editId === svc.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-luxury text-sm font-heading font-medium"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName(svc.id)}
                      onBlur={() => handleSaveName(svc.id)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm md:text-base font-heading font-medium text-espresso cursor-pointer hover:text-gold transition-colors"
                      onClick={() => handleStartEdit(svc.id, svc.name)}
                      title="اضغط لتعديل الاسم"
                    >
                      {svc.name}
                    </span>
                    <span className="text-[10px] md:text-xs text-espresso-faint font-mono bg-ivory-dark px-1.5 py-0.5 rounded">{svc.id}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-[10px] md:text-xs text-espresso-muted">تشغيل</span>
                  <button type="button"
                    onClick={() => toggleService(svc.id)}
                    className="toggle"
                    data-on={svc.active ? 'true' : 'false'}
                    aria-label={svc.active ? 'إيقاف الخدمة' : 'تشغيل الخدمة'}
                  />
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-[10px] md:text-xs text-espresso-muted">صيانة</span>
                  <button type="button"
                    onClick={() => toggleMaintenance(svc.id)}
                    className="toggle"
                    data-on={svc.maintenance ? 'true' : 'false'}
                    aria-label={svc.maintenance ? 'إلغاء الصيانة' : 'تفعيل الصيانة'}
                  />
                </label>
                <button type="button"
                  onClick={() => setDeleteConfirm(svc.id)}
                  className="p-1.5 rounded-md text-espresso-faint hover:text-red hover:bg-error-faint transition-colors"
                  title="حذف الخدمة"
                >
                  <XIcon size={14} />
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-heading font-semibold text-espresso-muted flex items-center gap-1.5">
                  <WalletIcon size={14} />
                  طرق الدفع المسموحة
                </span>
                <button type="button"
                  onClick={() => setWalletModal({ serviceId: svc.id })}
                  className="text-xs font-heading font-medium text-gold hover:text-gold/80 transition-colors flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                  إضافة طريقة دفع
                </button>
              </div>

              {svc.allowedWallets.length === 0 ? (
                <p className="text-xs text-espresso-faint">لم يتم تحديد طرق دفع لهذه الخدمة</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {svc.allowedWallets.map((wid) => (
                    <div
                      key={wid}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-ivory-dark text-xs font-heading font-medium text-espresso group"
                    >
                      <span>{walletMap[wid] || wid}</span>
                      {config.orders.some((o) => o.paymentMethod === wid) ? (
                        <span className="text-espresso-faint text-[10px]" title="مستخدمة في طلبات">*</span>
                      ) : (
                        <button type="button"
                          onClick={() => removeWalletFromService(svc.id, wid)}
                          className="opacity-0 group-hover:opacity-100 text-espresso-faint hover:text-red transition-all"
                        >
                          <XIcon size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {serviceCount(svc.id) > 0 && (
              <p className="text-[10px] text-espresso-faint mt-2">{serviceCount(svc.id)} طلب/طلبات مرتبطة</p>
            )}

            <div className="border-t border-border pt-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-heading font-semibold text-espresso-muted">الرسوم (%)</span>
                {feeEditId !== svc.id && (
                  <button type="button"
                    onClick={() => handleStartFeeEdit(svc.id, svc.feePercent)}
                    className="text-xs font-heading font-medium text-gold hover:text-gold/80 transition-colors"
                  >
                    {svc.feePercent != null ? `${svc.feePercent}%` : 'رسوم عامة'}
                  </button>
                )}
              </div>
              {feeEditId === svc.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={feeEditValue}
                    onChange={(e) => setFeeEditValue(e.target.value)}
                    className="input-luxury text-sm font-mono w-24"
                    placeholder="0"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveFee(svc.id)}
                  />
                  <span className="text-xs text-espresso-faint">%</span>
                  <button type="button" onClick={() => handleSaveFee(svc.id)} className="btn-gold text-xs py-1 px-3">حفظ</button>
                  <button type="button" onClick={() => handleResetFee(svc.id)} className="text-xs text-espresso-faint hover:text-red">استعادة العامة</button>
                  <button type="button" onClick={() => setFeeEditId(null)} className="text-espresso-faint hover:text-espresso"><XIcon size={14} /></button>
                </div>
              ) : (
                <p className="text-[10px] text-espresso-faint">
                  {svc.feePercent != null ? `رسوم هذه الخدمة: ${svc.feePercent}%` : `تستخدم الرسوم العامة: ${config.feePercent}%`}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {walletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="luxury-card p-5 md:p-6 w-full max-w-md mx-auto animate-fade-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="h3 text-espresso">إضافة طريقة دفع</h3>
              <button type="button" onClick={() => { setWalletModal(null); setWalletMode('existing'); setSelectedWalletId(''); setNewWalletLabel(''); setNewWalletValue('') }} className="text-espresso-muted hover:text-espresso">
                <XIcon size={20} />
              </button>
            </div>

            <div className="flex gap-3 mb-4">
              <button type="button"
                onClick={() => setWalletMode('existing')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-heading font-medium transition-colors border ${
                  walletMode === 'existing'
                    ? 'bg-gold text-white border-gold'
                    : 'bg-white text-espresso-muted border-border'
                }`}
              >
                اختيار من المحافظ
              </button>
              <button type="button"
                onClick={() => setWalletMode('new')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-heading font-medium transition-colors border ${
                  walletMode === 'new'
                    ? 'bg-gold text-white border-gold'
                    : 'bg-white text-espresso-muted border-border'
                }`}
              >
                إنشاء محفظة جديدة
              </button>
            </div>

            {walletMode === 'existing' ? (
              <div>
                <label className="caption block mb-1.5 font-medium">اختر محفظة</label>
                <select
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className="input-luxury w-full mb-4"
                >
                  <option value="">-- اختر --</option>
                  {availableWallets
                    .filter((w) => !walletModal.serviceId || !config.services.find((s) => s.id === walletModal.serviceId)?.allowedWallets.includes(w.id))
                    .map((w) => (
                      <option key={w.id} value={w.id}>{w.label} ({w.id})</option>
                    ))}
                </select>
                <button type="button"
                  onClick={handleAddWalletExisting}
                  className="btn-gold w-full text-sm py-2.5"
                  disabled={!selectedWalletId}
                >
                  إضافة
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="caption block mb-1.5 font-medium">اسم المحفظة</label>
                  <input
                    type="text"
                    value={newWalletLabel}
                    onChange={(e) => setNewWalletLabel(e.target.value)}
                    className="input-luxury w-full"
                    placeholder="مثال: USDT (TRC20)"
                  />
                </div>
                <div>
                  <label className="caption block mb-1.5 font-medium">العنوان / الرقم</label>
                  <input
                    type="text"
                    value={newWalletValue}
                    onChange={(e) => setNewWalletValue(e.target.value)}
                    className="input-luxury w-full font-mono text-sm"
                    placeholder="أدخل عنوان المحفظة..."
                  />
                </div>
                <p className="text-xs text-espresso-faint">
                  المحفظة الجديدة ستظهر أيضاً في صفحة المحافظ العامة
                </p>
                <button type="button"
                  onClick={handleAddWalletNew}
                  className="btn-gold w-full text-sm py-2.5"
                  disabled={!newWalletLabel.trim() || !newWalletValue.trim()}
                >
                  إنشاء وإضافة
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="luxury-card p-5 md:p-6 w-full max-w-sm mx-auto animate-fade-up">
            <h3 className="h3 text-espresso mb-2">حذف الخدمة</h3>
            <p className="body-secondary mb-5">هل أنت متأكد من حذف هذه الخدمة؟</p>
            <div className="flex gap-3">
              <button type="button"
                onClick={() => handleDeleteService(deleteConfirm)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-heading font-semibold bg-red text-white hover:bg-red/90 transition-colors"
              >
                حذف
              </button>
              <button type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-heading font-medium bg-ivory-dark text-espresso-muted hover:text-espresso transition-colors"
              >
                رجوع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
