import { useState, useEffect } from 'react';
import { getDashboardStats, getExceptions, getOrders } from '../api';
import { Link } from 'react-router-dom';
import { Activity, Package, AlertTriangle, AlertCircle, CheckCircle, ArrowRight, Clock } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [exceptions, setExceptions] = useState([]);
  const [urgentOrders, setUrgentOrders] = useState([]);

  useEffect(() => {
    getDashboardStats().then(setStats);
    getExceptions().then(data => setExceptions(data.filter(e => e.status !== 'Resolved').slice(0, 3)));
    getOrders('Priority').then(data => setUrgentOrders(data.filter(o => !['Shipped', 'Staged'].includes(o.status)).slice(0, 3)));
  }, []);

  if (!stats) return <div className="p-8 flex justify-center"><Activity className="animate-spin text-blue-500" /></div>;

  const statCards = [
    { label: "Today's Orders", value: stats.orders_today, icon: <Package className="text-blue-500" />, bg: "bg-blue-50" },
    { label: "Pending Processing", value: stats.pending_processing, icon: <Clock className="text-orange-500" />, bg: "bg-orange-50" },
    { label: "Priority Orders", value: stats.priority_orders, icon: <Activity className="text-red-500" />, bg: "bg-red-50" },
    { label: "At Risk", value: stats.at_risk, icon: <AlertTriangle className="text-rose-500" />, bg: "bg-rose-50" },
    { label: "Inventory Issues", value: stats.inventory_issues, icon: <AlertCircle className="text-amber-500" />, bg: "bg-amber-50" },
    { label: "Ready for Pickup", value: stats.ready_for_pickup, icon: <CheckCircle className="text-emerald-500" />, bg: "bg-emerald-50" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 mt-1">Real-time operational status</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${s.bg}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50/30">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Urgent Attention
            </h2>
            <Link to="/orders" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {urgentOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No urgent orders right now.</div>
            ) : (
              urgentOrders.map(o => (
                <div key={o.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                  <div>
                    <Link to={`/orders/${o.id}`} className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {o.order_number}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">{o.priority}</span>
                      <span className="text-slate-500">{o.status}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Due</p>
                    <p className="font-medium text-slate-900">{new Date(o.due_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-amber-50/30">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="text-amber-500" size={20} />
              Recent Exceptions
            </h2>
            <Link to="/exceptions" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {exceptions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No open exceptions. Great job!</div>
            ) : (
              exceptions.map(e => (
                <div key={e.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-slate-900">{e.issue_type}</p>
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800">{e.status}</span>
                  </div>
                  <p className="text-sm text-slate-600">{e.description}</p>
                  <div className="mt-2 text-xs text-slate-500 flex gap-2">
                    {e.order && <Link to={`/orders/${e.order.id}`} className="font-medium text-blue-600 hover:underline">{e.order.order_number}</Link>}
                    <span>•</span>
                    <span>{new Date(e.time_reported).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
