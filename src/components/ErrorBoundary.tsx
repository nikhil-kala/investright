import React from 'react'

type ErrorBoundaryProps = {
  children: React.ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Uncaught error in component tree:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Something went wrong.</h1>
          <p style={{ color: '#555', marginBottom: 12 }}>Please check the console for details.</p>
          {this.state.error?.message && (
            <pre style={{ whiteSpace: 'pre-wrap', background: '#f8f8f8', padding: 12, borderRadius: 8 }}>
              {this.state.error.message}
            </pre>
          )}
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary


