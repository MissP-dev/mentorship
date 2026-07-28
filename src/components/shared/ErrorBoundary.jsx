import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 text-center">
          <p className="text-red-500 dark:text-red-400 font-semibold mb-2">Something went wrong</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 max-w-md">{this.state.error.message}</p>
          <button onClick={() => { this.setState({ error: null }); window.location.reload(); }} className="px-4 py-2 bg-purple-700 text-white rounded-lg text-sm">Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}
