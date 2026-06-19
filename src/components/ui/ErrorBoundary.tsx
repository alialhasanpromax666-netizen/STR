import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props { children: ReactNode }

interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() { return { hasError: true } }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 text-center">
          <div>
            <h1 className="h2 text-espresso mb-2">حدث خطأ غير متوقع</h1>
            <p className="body-secondary mb-4">يرجى تحديث الصفحة أو المحاولة لاحقاً</p>
            <button className="btn-gold" onClick={() => window.location.reload()}>تحديث الصفحة</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
