import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { MascotProvider } from './context/MascotContext.jsx';
import './styles/global.css';
import './styles/admin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <MascotProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </MascotProvider>
    </BrowserRouter>
  </React.StrictMode>
);
