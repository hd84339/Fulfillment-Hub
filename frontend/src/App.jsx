import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Orders from './components/Orders';
import OrderDetails from './components/OrderDetails';
import Inventory from './components/Inventory';
import Exceptions from './components/Exceptions';
import { Package, LayoutDashboard, AlertCircle, Box, Menu } from 'lucide-react';
import { useState } from 'react';

function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/orders", icon: <Package size={20} />, label: "Orders" },
    { to: "/inventory", icon: <Box size={20} />, label: "Inventory" },
    { to: "/exceptions", icon: <AlertCircle size={20} />, label: "Exceptions" },
  ];

  return (
    <>
      <div className="md:hidden p-4 bg-slate-900 text-white flex justify-between items-center">
        <h1 className="font-bold text-xl tracking-tight">FULFILLMENT HUB</h1>
        <button onClick={() => setIsOpen(!isOpen)}><Menu /></button>
      </div>
      <div className={`w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 hidden md:block">
          <h1 className="text-2xl font-black text-white tracking-tighter bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">FULFILLMENT<br/>HUB</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === link.to
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              {link.icon}
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/exceptions" element={<Exceptions />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
