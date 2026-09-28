import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrder, updateOrderStatus } from '../api';
import { Activity, ArrowLeft, Package, User, Clock, Truck, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

const STATUS_FLOW = ['Received', 'Processing', 'Picking', 'Packing', 'Staged', 'Shipped'];

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id).then(data => {
      setOrder(data);
      setLoading(false);
    }).catch(() => {
      navigate('/orders');
    });
  }, [id, navigate]);

  const advanceStatus = async () => {
    const currentIndex = STATUS_FLOW.indexOf(order.status);
    if (currentIndex < STATUS_FLOW.length - 1) {
      const nextStatus = STATUS_FLOW[currentIndex + 1];
      await updateOrderStatus(id, nextStatus);
      setOrder({ ...order, status: nextStatus });
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Activity className="animate-spin text-blue-500 w-8 h-8" /></div>;
  if (!order) return null;

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-6">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} /> Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{order.order_number}</h1>
              {order.priority === 'High' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Priority
                </span>
              )}
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-1.5"><User size={16} /> {order.customer_name}</div>
              <div className="flex items-center gap-1.5"><Clock size={16} /> Due: {format(new Date(order.due_time), 'MMM d, p')}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 rounded-xl font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-500" />
              Report Issue
            </button>
            {currentStatusIndex < STATUS_FLOW.length - 1 && (
              <button 
                onClick={advanceStatus}
                className="px-5 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 flex items-center gap-2"
              >
                Mark {STATUS_FLOW[currentStatusIndex + 1]}
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Main content - Items */}
          <div className="md:col-span-2 p-8 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Package size={20} className="text-slate-400" />
              Items to Fulfill
            </h3>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                    <Box size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{item.product.name}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">SKU: <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{item.product.sku}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Qty</p>
                    <p className="text-xl font-black text-slate-900">{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Status and Courier */}
          <div className="p-8 space-y-8">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Workflow Status</h3>
              <div className="space-y-3">
                {STATUS_FLOW.map((step, idx) => {
                  const isCompleted = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;
                  
                  return (
                    <div key={step} className={clsx(
                      "flex items-center gap-3",
                      isCompleted ? "text-slate-900" : "text-slate-400"
                    )}>
                      <div className={clsx(
                        "w-6 h-6 rounded-full flex items-center justify-center border-2",
                        isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200",
                        isCurrent && "ring-4 ring-emerald-100"
                      )}>
                        {isCompleted && <Check size={14} strokeWidth={3} />}
                      </div>
                      <span className={clsx("font-medium", isCurrent && "font-bold")}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Shipping Info</h3>
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <Truck className="text-blue-500 mt-0.5" size={20} />
                <div>
                  <p className="font-bold text-slate-900">{order.courier?.name || 'Unassigned'}</p>
                  <p className="text-sm text-slate-500 mt-1">Pickup Cutoff: 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Temporary icon component for this file
function Box(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
}
