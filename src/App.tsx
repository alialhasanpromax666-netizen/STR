import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AdminProvider } from './store/AdminContext'
import { AuthProvider } from './store/AuthContext'
import Layout from './components/Layout/Layout'

const Home = lazy(() => import('./pages/Home'))
const ServicePage = lazy(() => import('./pages/ServicePage'))
const Recharge = lazy(() => import('./pages/Recharge'))
const Crypto = lazy(() => import('./pages/Crypto'))
const OrderHistory = lazy(() => import('./pages/OrderHistory'))
const Login = lazy(() => import('./pages/Login'))
const Profile = lazy(() => import('./pages/Profile'))
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const Contact = lazy(() => import('./pages/Contact'))
const Products = lazy(() => import('./pages/Products'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const Admin = lazy(() => import('./pages/Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))

function LoadingFallback() {
  return (
    <div className="section flex items-center justify-center py-24">
      <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/recharge" element={<Layout><Recharge /></Layout>} />
      <Route path="/service/:id" element={<Layout><ServicePage /></Layout>} />
      <Route path="/crypto" element={<Layout><Crypto /></Layout>} />
      <Route path="/orders" element={<Layout><OrderHistory /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />
      <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/products" element={<Layout><Products /></Layout>} />
      <Route path="/products/:id" element={<Layout><ProductPage /></Layout>} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <Suspense fallback={<LoadingFallback />}>
            <AppRoutes />
          </Suspense>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
