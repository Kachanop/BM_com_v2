import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Cart from './pages/Cart';
import History from './pages/History';
import Admin from './pages/Admin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="cart" element={<Cart />} />
        <Route path="history" element={<History />} />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<div className="text-center py-20 text-2xl font-bold">404 - ไม่พบหน้าเว็บที่คุณค้นหา</div>} />
      </Route>
    </Routes>
  );
}

export default App;
