import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Register from './pages/register'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Register></Register>
    </>
  );
}

export default App
