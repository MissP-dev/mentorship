import { Link } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  return (
    <section style={{ padding: '40px 20px', textAlign: 'center' }}>
      <img src={reactLogo} alt="React logo" width="80" height="80" />
      <h1>Welcome to M-Link</h1>
      <p>A React project built with Vite and TypeScript.</p>
      <Link to="/" style={{ marginTop: '24px', display: 'inline-block' }}>
        Go to Home
      </Link>
    </section>
  )
}

export default App
