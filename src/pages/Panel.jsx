import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Panel() {
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({});
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setMe(profile);

      if (profile?.role !== "admin") {
        setLoading(false);
        return;
      }

      const { data: clientsData } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      setClients(clientsData || []);

      // Calculate stats
      const pendingCount = clientsData?.filter(c => ['pending', 'verifying', 'documents', 'payment'].includes(c.status)).length || 0;
      const approvedCount = clientsData?.filter(c => ['approved', 'active'].includes(c.status)).length || 0;
      const rejectedCount = clientsData?.filter(c => c.status === 'rejected').length || 0;
      const completedCount = clientsData?.filter(c => c.status === 'completed').length || 0;

      setStats({
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        completed: completedCount,
        total: clientsData?.length || 0,
      });

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateClientStatus = async (clientId, newStatus) => {
    try {
      const updates = { 
        status: newStatus,
        last_activity: new Date().toISOString()
      };

      if (newStatus === 'approved') {
        updates.progress_percentage = 100;
        updates.current_step = 'Approved - Ready to Process';
      } else if (newStatus === 'rejected') {
        updates.progress_percentage = 0;
        updates.current_step = 'Rejected';
      }

      await supabase
        .from("clients")
        .update(updates)
        .eq("id", clientId);

      await loadData();
    } catch (error) {
      console.error("Error updating client:", error);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedRows.size === 0) return;

    const clientIds = Array.from(selectedRows);
    
    try {
      for (const clientId of clientIds) {
        await updateClientStatus(clientId, action);
      }
      setSelectedRows(new Set());
    } catch (error) {
      console.error("Error with bulk action:", error);
    }
  };

  const toggleRowSelection = (clientId) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(clientId)) {
      newSelection.delete(clientId);
    } else {
      newSelection.add(clientId);
    }
    setSelectedRows(newSelection);
  };

  const getStatusInfo = (client) => {
    const statusConfig = {
      pending: { 
        color: 'bg-amber-500', 
        textColor: 'text-amber-700', 
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        progress: 'bg-amber-400' 
      },
      verifying: { 
        color: 'bg-blue-500', 
        textColor: 'text-blue-700', 
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        progress: 'bg-blue-500' 
      },
      documents: { 
        color: 'bg-purple-500', 
        textColor: 'text-purple-700', 
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        progress: 'bg-purple-500' 
      },
      payment: { 
        color: 'bg-orange-500', 
        textColor: 'text-orange-700', 
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        progress: 'bg-orange-500' 
      },
      approved: { 
        color: 'bg-green-500', 
        textColor: 'text-green-700', 
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        progress: 'bg-green-500' 
      },
      active: { 
        color: 'bg-emerald-600', 
        textColor: 'text-emerald-700', 
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        progress: 'bg-emerald-600' 
      },
      completed: { 
        color: 'bg-green-700', 
        textColor: 'text-green-800', 
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        progress: 'bg-green-700' 
      },
      rejected: { 
        color: 'bg-red-500', 
        textColor: 'text-red-700', 
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        progress: 'bg-red-500' 
      },
    };
    return statusConfig[client.status] || statusConfig.pending;
  };

  const filteredClients = clients.filter(client => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['pending', 'verifying', 'documents', 'payment'].includes(client.status);
    return client.status === filter;
  });

  const timeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading CRM...</p>
        </div>
      </div>
    );
  }

  if (!me || me.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need admin privileges to access this panel.</p>
          <button 
            onClick={handleLogout}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-6 bg-gradient-to-t from-orange-500 to-orange-400 rounded-sm"></div>
                  <div className="w-2 h-7 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-sm"></div>
                  <div className="w-2 h-8 bg-gradient-to-t from-green-500 to-green-400 rounded-sm"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">EasyTradelines</h1>
                  <p className="text-xs text-green-600 font-medium">Admin Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{me.first_name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{me.unique_id}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                title="Sign Out"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-800">Client Management</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleBulkAction('approved')}
                    disabled={selectedRows.size === 0}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Approve</span>
                  </button>
                  <button 
                    onClick={() => handleBulkAction('rejected')}
                    disabled={selectedRows.size === 0}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Reject</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 text-sm px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All ({stats.total})</option>
                  <option value="pending">Pending ({stats.pending})</option>
                  <option value="approved">Approved ({stats.approved})</option>
                  <option value="completed">Completed ({stats.completed})</option>
                  <option value="rejected">Rejected ({stats.rejected})</option>
                </select>
                
                {selectedRows.size > 0 && (
                  <span className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                    {selectedRows.size} selected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Client Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(new Set(filteredClients.map(c => c.id)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                      checked={selectedRows.size === filteredClients.length && filteredClients.length > 0}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => {
                  const statusInfo = getStatusInfo(client);
                  const isSelected = selectedRows.has(client.id);

                  return (
                    <tr 
                      key={client.id} 
                      className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                      onClick={() => toggleRowSelection(client.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleRowSelection(client.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${statusInfo.color}`}></div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">{client.first_name} {client.last_name}</span>
                              <span className="text-xs text-gray-500 font-mono">{client.unique_id}</span>
                            </div>
                            <div className="text-sm text-gray-500">{client.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} border`}>
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${statusInfo.progress}`}
                            style={{ width: `${client.progress_percentage || 0}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {client.progress_percentage || 0}% - {client.current_step || 'Pending'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(client.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {timeAgo(client.last_activity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {client.status === 'pending' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                updateClientStatus(client.id, 'approved');
                              }}
                              className="text-green-600 hover:text-green-900 hover:bg-green-50 p-1 rounded transition-colors"
                              title="Approve"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          {['pending', 'verifying'].includes(client.status) && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                updateClientStatus(client.id, 'rejected');
                              }}
                              className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1 rounded transition-colors"
                              title="Reject"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredClients.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first client.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
