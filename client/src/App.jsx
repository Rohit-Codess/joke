import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PhotoEditor from './views/PhotoEditor'
import './index.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col justify-between">
        <div>
          <Routes>
            <Route path="/" element={<PhotoEditor />} />
          </Routes>
        </div>
        <footer className="w-full text-center text-xs text-gray-500 py-2 bg-black/80">
          Develop &amp; Maintained by <a href="https://rtcodex.dev/" className="underline hover:text-green-400">RTCodeX</a>
        </footer>
      </div>
    </Router>
  )
}

export default App