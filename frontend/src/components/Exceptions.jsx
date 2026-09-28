import { useState, useEffect } from 'react';
import { getExceptions, resolveException } from '../api';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Exceptions() {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExceptions();
  }, []);

  const loadExceptions = () => {
    setLoading(true);
    getExceptions().then(data => {
      setExceptions(data);
      setLoading(false);
    });
  };

  const handleResolve = async (id) => {
    await resolveException(id);
    setExceptions(exceptions.map(e => e.id === id ? { ...e, status: 'Resolved' } : e));
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto h-full flex flex-col animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Issue Tracker</h1>
        <p className="text-slate-500 mt-1">Manage operational exceptions</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 flex justify-center"><AlertTriangle className="animate-pulse text-amber-500 w-8 h-8 opacity-50" /></div>
        ) : exceptions.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center shadow-sm border border-slate-200">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">All Clear</h3>
            <p className="text-slate-500 mt-2">No operational exceptions at the moment.</p>
          </div>
        ) : (
          exceptions.map(exc => (
            <div key={exc.id} className={clsx(
              "bg-white rounded-2xl p-6 shadow-sm border flex flex-col md:flex-row gap-6 transition-all",
              exc.status === 'Resolved' ? "border-slate-200 opacity-60" : "border-amber-200 shadow-amber-900/5 relative overflow-hidden"
            )}>
              {exc.status !== 'Resolved' && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
              )}
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{exc.issue_type}</h3>
                  <span className={clsx(
                    "px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider",
                    exc.status === 'Open' && "bg-rose-100 text-rose-800",
                    exc.status === 'Investigating' && "bg-amber-100 text-amber-800",
                    exc.status === 'Resolved' && "bg-emerald-100 text-emerald-800"
                  )}>
                    {exc.status}
                  </span>
                </div>
                <p className="text-slate-600 mb-4">{exc.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  {exc.order && (
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <span className="font-medium text-slate-700">Order:</span>
                      <Link to={`/orders/${exc.order.id}`} className="font-bold text-blue-600 hover:underline">{exc.order.order_number}</Link>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-slate-400" />
                    <span>Reported: {format(new Date(exc.time_reported), 'MMM d, h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {exc.reported_by.charAt(0)}
                    </span>
                    <span>By {exc.reported_by}</span>
                  </div>
                </div>
              </div>
              
              <div className="md:w-32 flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                {exc.status !== 'Resolved' ? (
                  <button 
                    onClick={() => handleResolve(exc.id)}
                    className="w-full px-4 py-2 rounded-xl font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors text-sm text-center"
                  >
                    Resolve
                  </button>
                ) : (
                  <div className="text-center text-emerald-600 flex flex-col items-center gap-1">
                    <CheckCircle size={24} />
                    <span className="text-sm font-medium">Resolved</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
