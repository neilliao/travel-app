import React from 'react'
import ReactDOM from 'react-dom/client'
// 在您的本機電腦上，請使用下面這兩行 import：
// import App from './App.jsx'
// import './index.css'

// 為了讓此線上預覽不報錯，我們先定義一個暫時的 App
const App = () => (
  <div style={{ padding: 20 }}>
    <h1>這是 src/main.jsx</h1>
    <p>請在您的電腦上取消註解 import App 和 import index.css</p>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)