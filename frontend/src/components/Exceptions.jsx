import { useState, useEffect } from 'react';
import { getExceptions, resolveException } from '../api';
import { CheckCircle, Clock, User, ArrowRight } from 'lucide-react';
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

      <div className="space-y-6">
        {loading ? (
          <div className="p-12 flex justify-center"><Clock className="animate-pulse text-amber-500 w-8 h-8 opacity-50" /></div>
        ) : exceptions.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center shadow-sm border border-slate-200">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">All Clear</h3>
            <p className="text-slate-500 mt-2">No operational exceptions at the moment.</p>
          </div>
        ) : (
          exceptions.map(exc => (
            <div key={exc.id} className={clsx(
              "bg-white rounded-xl shadow-sm border overflow-hidden transition-all",
              exc.status === 'Resolved' ? "border-slate-200 opacity-60" : "border-slate-300 shadow-md"
            )}>
              <div className="p-5 md:p-6 grid md:grid-cols-5 gap-6 items-center relative">
                {exc.status !== 'Resolved' && (
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-orange-500"></div>
                )}
                
                {/* Issue Info */}
                <div className="md:col-span-2">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Issue</p>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">{exc.issue_type}</h3>
                  <div className="mt-2 space-y-1">
                    {exc.order && (
                      <p className="text-sm text-slate-600 font-medium">Order: <Link to={`/orders/${exc.order.id}`} className="text-blue-600 hover:underline">{exc.order.order_number}</Link></p>
                    )}
                    <p className="text-sm text-slate-500 font-mono">{exc.description}</p>
                  </div>
                </div>
                
                {/* Owner */}
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Owner</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <User size={14} />
                    </div>
                    <span className="font-semibold text-slate-900">{exc.owner || 'Unassigned'}</span>
                  </div>
                </div>
                
                {/* Status */}
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <span className={clsx(
                    "inline-flex px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wide",
                    exc.status === 'Open' && "bg-rose-100 text-rose-800",
                    exc.status === 'Investigating' && "bg-amber-100 text-amber-800",
                    exc.status === 'Resolved' && "bg-emerald-100 text-emerald-800"
                  )}>
                    {exc.status}
                  </span>
                </div>
                
                {/* Action & Resolution */}
                <div className="md:col-span-1 text-right md:text-left">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-1">Action</p>
                  {exc.status !== 'Resolved' ? (
                    <div className="flex flex-col md:items-start items-end gap-2">
                      <span className="font-medium text-slate-700">{exc.action}</span>
                      <button 
                        onClick={() => handleResolve(exc.id)}
                        className="px-4 py-2 rounded-lg font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors text-sm flex items-center gap-2"
                      >
                        Resolve <ArrowRight size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end md:justify-start gap-2 text-emerald-600 font-bold">
                      <CheckCircle size={20} />
                      Resolved
                    </div>
                  )}
                </div>

              </div>
              
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><Clock size={14} /> Reported {format(new Date(exc.time_reported), 'MMM d, h:mm a')}</span>
                <span>•</span>
                <span>By: {exc.reported_by}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
