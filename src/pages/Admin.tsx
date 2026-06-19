import { useState } from 'react'
import { useAdmin } from '../store/AdminContext'
import LoginGate from './admin/LoginGate'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import OrdersManager from './admin/OrdersManager'
import ServicesManager from './admin/ServicesManager'
import BlockedPhones from './admin/BlockedPhones'
import WalletsManager from './admin/WalletsManager'
import RateEditor from './admin/RateEditor'
import ContentEditor from './admin/ContentEditor'
import Security from './admin/Security'
import ProductsManager from './admin/ProductsManager'

export default function Admin() {
  const { isAuthenticated } = useAdmin()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (!isAuthenticated) {
    return <LoginGate />
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'orders':
        return <OrdersManager />
      case 'services':
        return <ServicesManager />
      case 'wallets':
        return <WalletsManager />
      case 'blocked':
        return <BlockedPhones />
      case 'rates':
        return <RateEditor />
      case 'content':
        return <ContentEditor />
      case 'security':
        return <Security />
      case 'products':
        return <ProductsManager />
      default:
        return <Dashboard />
    }
  }

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTab()}
    </AdminLayout>
  )
}
