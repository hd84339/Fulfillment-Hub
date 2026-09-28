import { useState, useEffect } from 'react';
import { getInventory, transferInventory } from '../api';
import { Box, ArrowRightLeft, Activity } from 'lucide-react';
import clsx from 'clsx';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferModal, setTransferModal] = useState(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = () => {
    setLoading(true);
    getInventory().then(data => {
      setInventory(data);
      setLoading(false);
    });
  };

  const handleTransfer = async () => {
    if (!transferModal) return;
    await transferInventory(transferModal.sku, transferModal.qty);
    setTransferModal(null);
    // In a real app we'd reload inventory here or update state locally
    // For mock, just updating local state to feel responsive
    setInventory(inventory.map(item => {
      if (item.sku === transferModal.sku) {
        return {
          ...item,
          main_warehouse: item.main_warehouse + transferModal.qty,
          overflow: item.overflow - transferModal.qty,
          status: (item.main_warehouse + transferModal.qty) > 0 ? 'OK' : item.status
        };
      }
      return item;
    }));
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-300">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-slate-500 mt-1">Real-time stock levels</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex justify-center items-center p-12">
            <Activity className="animate-spin text-blue-500 w-8 h-8" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                  <th className="p-4 font-medium">SKU</th>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium text-right">Main WH</th>
                  <th className="p-4 font-medium text-right">Overflow</th>
                  <th className="p-4 font-medium text-right">Available</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map(item => (
                  <tr key={item.sku} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded text-slate-700">{item.sku}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-900">{item.product_name}</td>
                    <td className="p-4 text-right font-medium text-slate-700">{item.main_warehouse}</td>
                    <td className="p-4 text-right text-slate-500">{item.overflow}</td>
                    <td className="p-4 text-right font-bold text-slate-900">{item.available}</td>
                    <td className="p-4 text-center">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider",
                        item.status === 'OK' && "bg-emerald-100 text-emerald-800",
                        item.status === 'MOVE' && "bg-blue-100 text-blue-800",
                        item.status === 'LOW' && "bg-amber-100 text-amber-800",
                        item.status === 'OUT' && "bg-red-100 text-red-800"
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.overflow > 0 && (
                        <button 
                          onClick={() => setTransferModal({ sku: item.sku, name: item.product_name, max: item.overflow, qty: Math.min(10, item.overflow) })}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          <ArrowRightLeft size={14} /> Transfer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {transferModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden slide-in-from-bottom-8">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Create Transfer</h2>
              <p className="text-slate-500 text-sm mt-1">Overflow → Main Warehouse</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-bold text-slate-700">Product</p>
                <p className="text-lg font-medium">{transferModal.name}</p>
                <p className="text-sm text-slate-500 font-mono mt-1">{transferModal.sku}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Transfer Quantity</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="1" 
                    max={transferModal.max} 
                    value={transferModal.qty}
                    onChange={(e) => setTransferModal({...transferModal, qty: parseInt(e.target.value)})}
                    className="flex-1 accent-blue-600"
                  />
                  <div className="w-16 px-3 py-2 bg-slate-100 rounded-lg text-center font-bold text-slate-900">
                    {transferModal.qty}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-right">Available in Overflow: {transferModal.max}</p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setTransferModal(null)}
                className="px-4 py-2 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleTransfer}
                className="px-6 py-2 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-colors"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
