import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './global.css'
// Importe vos deux composants
import Dashboard from './Dashboard.jsx'
import App from './App.jsx'
import Chat from './Chat.jsx'
// ... éventuellement Chat, etc.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Page d'accueil = Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Route pour le Dashboard s'il est distinct de l'accueil */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Chat (si besoin) */}

        <Route path="/chat" element={<Chat />} />

        {/* Route pour la page d'upload, avec paramètre :projectId */}
        <Route path="/download/:projectId" element={<App />} />

        {/* etc. */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

