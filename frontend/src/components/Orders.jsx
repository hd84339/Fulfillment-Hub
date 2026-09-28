import { useState, useEffect } from 'react';
import { getOrders } from '../api';
import { Link } from 'react-router-dom';
import { Activity, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

const FILTERS = ['All', 'Priority', 'At Risk', 'Inventory Issue', 'Processing', 'Picking', 'Packing', 'Staged'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    setLoading(true);
    getOrders(activeFilter).then(data => {
      setOrders(data);
      setLoading(false);
    });
  }, [activeFilter]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Orders</h1>
        <p className="text-slate-500 mt-1">Manage and track fulfillment</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              activeFilter === f 
                ? "bg-slate-900 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            )}
          >
            {f}
          </button>
        ))}
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
                  <th className="p-4 font-medium">Order</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Priority</th>
                  <th className="p-4 font-medium">Items</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Due</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">No orders found for this filter.</td>
                  </tr>
                ) : (
                  orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4">
                        <Link to={`/orders/${o.id}`} className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {o.order_number}
                        </Link>
                      </td>
                      <td className="p-4 text-slate-600">{o.customer_name}</td>
                      <td className="p-4">
                        {o.priority === 'High' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            High
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">Normal</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-600">{o.items.reduce((acc, item) => acc + item.quantity, 0)}</td>
                      <td className="p-4">
                        <span className={clsx(
                          "px-3 py-1 rounded-full text-xs font-medium border",
                          o.status === 'Processing' && "bg-blue-50 text-blue-700 border-blue-200",
                          o.status === 'Picking' && "bg-amber-50 text-amber-700 border-amber-200",
                          o.status === 'Packing' && "bg-purple-50 text-purple-700 border-purple-200",
                          o.status === 'Staged' && "bg-emerald-50 text-emerald-700 border-emerald-200",
                          o.status === 'Shipped' && "bg-slate-100 text-slate-700 border-slate-200",
                          !['Processing', 'Picking', 'Packing', 'Staged', 'Shipped'].includes(o.status) && "bg-slate-100 text-slate-700 border-slate-200"
                        )}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {format(new Date(o.due_time), 'MMM d, p')}
                      </td>
                      <td className="p-4">
                        <Link to={`/orders/${o.id}`} className="text-sm text-blue-600 font-medium hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
