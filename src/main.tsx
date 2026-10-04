import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import packageDetails from '../package.json'
import './styles.css'
import './theme.css'

document.title = packageDetails.appTitle

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
