import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, ErrorBoundaryState> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can log error info here
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: '2rem' }}>
          <h2>Something went wrong.</h2>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
