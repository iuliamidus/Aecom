import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ScenarioProvider } from './lib/ScenarioContext.jsx'
import { App } from './App.jsx'
import './theme/aecom-theme.css'
import './theme/app.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScenarioProvider>
        <App />
      </ScenarioProvider>
    </BrowserRouter>
  </React.StrictMode>
)
