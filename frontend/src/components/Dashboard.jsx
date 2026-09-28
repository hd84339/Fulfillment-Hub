import { useState, useEffect } from 'react';
import { getDashboardStats, getExceptions, getOrders } from '../api';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Package, Activity, Inbox, Cog, CheckCircle, Truck, PlaySquare } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [exceptions, setExceptions] = useState([]);
  const [urgentOrders, setUrgentOrders] = useState([]);

  useEffect(() => {
    getDashboardStats().then(setStats);
    getExceptions().then(data => setExceptions(data.filter(e => e.status !== 'Resolved').slice(0, 5)));
    getOrders('Priority').then(data => setUrgentOrders(data.filter(o => !['Shipped', 'Staged'].includes(o.status)).slice(0, 5)));
  }, []);

  if (!stats) return <div className="p-8 flex justify-center"><Activity className="animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Fulfillment Hub</h1>
        <p className="text-slate-500 mt-1 font-medium">Operations Overview • {format(new Date(), 'EEEE, MMMM d')}</p>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-900 text-white rounded-xl shadow-lg overflow-hidden divide-x divide-slate-800 border border-slate-900">
        <div className="p-6 text-center">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Orders</p>
          <p className="text-4xl font-black">{stats.total_orders}</p>
        </div>
        <div className="p-6 text-center bg-red-900/20">
          <p className="text-red-400 text-sm font-bold uppercase tracking-wider mb-2">At Risk</p>
          <p className="text-4xl font-black text-red-400">{stats.at_risk}</p>
        </div>
        <div className="p-6 text-center bg-amber-900/20">
          <p className="text-amber-400 text-sm font-bold uppercase tracking-wider mb-2">Priority</p>
          <p className="text-4xl font-black text-amber-400">{stats.priority}</p>
        </div>
        <div className="p-6 text-center">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Issues</p>
          <p className="text-4xl font-black">{stats.issues}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-8">
        {/* Urgent Actions - takes up 2 columns */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Urgent Actions</h2>
          
          <div className="space-y-4">
            {urgentOrders.map(o => (
              <div key={o.id} className="bg-white p-5 rounded-xl border border-red-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                <div className="pl-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                    <h3 className="font-bold text-lg text-slate-900">{o.order_number}</h3>
                  </div>
                  <p className="text-slate-600 font-medium">Priority order • {o.status}</p>
                  <p className="text-sm text-red-600 mt-1 font-semibold">
                    Due in {formatDistanceToNow(new Date(o.due_time))}
                  </p>
                </div>
                <div>
                  <Link to={`/orders/${o.id}`} className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors shadow-md">
                    View Order
                  </Link>
                </div>
              </div>
            ))}

            {exceptions.map(e => (
              <div key={e.id} className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500"></div>
                <div className="pl-2">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle size={18} className="text-amber-500" />
                    <h3 className="font-bold text-lg text-slate-900">{e.order?.order_number || 'General Issue'}</h3>
                  </div>
                  <p className="text-slate-600 font-medium">{e.issue_type}</p>
                  <p className="text-sm text-slate-500 mt-1 font-mono">{e.description}</p>
                </div>
                <div>
                  <Link to={`/exceptions`} className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                    Resolve
                  </Link>
                </div>
              </div>
            ))}
            
            {urgentOrders.length === 0 && exceptions.length === 0 && (
              <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
                No urgent actions required.
              </div>
            )}
          </div>
        </div>

        {/* Order Pipeline - 1 column */}
        <div>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-6">Order Pipeline</h2>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 text-slate-600">
                <Inbox size={18} /> <span className="font-medium">Received</span>
              </div>
              <span className="font-black text-lg text-slate-900">{stats.pipeline.Received}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 text-slate-600">
                <Cog size={18} /> <span className="font-medium">Processing</span>
              </div>
              <span className="font-black text-lg text-slate-900">{stats.pipeline.Processing}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors bg-blue-50/50">
              <div className="flex items-center gap-3 text-blue-700">
                <PlaySquare size={18} /> <span className="font-bold">Picking</span>
              </div>
              <span className="font-black text-lg text-blue-700">{stats.pipeline.Picking}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors bg-purple-50/50">
              <div className="flex items-center gap-3 text-purple-700">
                <Package size={18} /> <span className="font-bold">Packing</span>
              </div>
              <span className="font-black text-lg text-purple-700">{stats.pipeline.Packing}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 text-slate-600">
                <CheckCircle size={18} /> <span className="font-medium">Staged</span>
              </div>
              <span className="font-black text-lg text-slate-900">{stats.pipeline.Staged}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 text-slate-600">
                <Truck size={18} /> <span className="font-medium">Shipped</span>
              </div>
              <span className="font-black text-lg text-slate-900">{stats.pipeline.Shipped}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
