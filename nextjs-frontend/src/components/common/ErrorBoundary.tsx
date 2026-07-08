'use client';

import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }

interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="glass rounded-2xl p-6 text-center border border-destructive/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-destructive mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
          <p className="text-sm font-bold text-foreground">خطایی رخ داد</p>
          <p className="text-xs text-muted-foreground mt-1">بخش مورد نظر بارگذاری نشد.</p>
          <button onClick={() => this.setState({ hasError: false })} className="btn btn-primary btn-sm mt-3">تلاش مجدد</button>
        </div>
      );
    }
    return this.props.children;
  }
}
