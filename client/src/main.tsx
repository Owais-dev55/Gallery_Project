import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import  { Bounce, ToastContainer } from "react-toastify";
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  
  <StrictMode>
    <BrowserRouter>
<ToastContainer
  position="top-right"
  autoClose={5000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick={false}
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="light"
  transition={Bounce}
/>
<App />
</BrowserRouter>
  </StrictMode>,
)
