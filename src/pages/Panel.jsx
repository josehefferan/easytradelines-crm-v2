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
      pending: { color: 'bg-gray-500', textColor: 'text-gray-600', progress: 'progress-bar-downloading' },
      verifying: { color: 'bg-blue-500', textColor: 'text-blue-600', progress: 'progress-bar-downloading' },
      documents: { color: 'bg-yellow-500', textColor: 'text-yellow-600', progress: 'progress-bar-downloading' },
      payment: { color: 'bg-orange-500', textColor: 'text-orange-600', progress: 'progress-bar-downloading' },
      approved: { color: 'bg-green-500', textColor: 'text-green-600', progress: 'progress-bar-seeding' },
      active: { color: 'bg-green-600', textColor: 'text-green-600', progress: 'progress-bar-seeding' },
      completed: { color: 'bg-green-700', textColor: 'text-green-600', progress: 'progress-bar-completed' },
      rejected: { color: 'bg-red-500', textColor: 'text-red-600', progress: 'progress-bar-error' },
      dead: { color: 'bg-gray-700', textColor: 'text-gray-600', progress: 'progress-bar-error' }
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
      <div className="flex items-center justify-center min-h-screen bg-bittorrent-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CRM...</p>
        </div>
      </div>
    );
  }

  if (!me || me.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bittorrent-bg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need admin privileges to access this panel.</p>
          <button 
            onClick={handleLogout}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bittorrent-bg font-system">
      {/* Header */}
      <div className="bg-white border-b-2 border-bittorrent-border px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-1 rounded">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-800">EasyTradelines CRM v1.0</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-600">Admin: {me.first_name || me.unique_id}</span>
            <button 
              onClick={handleLogout}
              className="text-xs text-gray-600 hover:text-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-bittorrent-toolbar border-b border-bittorrent-border px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              <button 
                onClick={() => handleBulkAction('approved')}
                disabled={selectedRows.size === 0}
                className="bg-white border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 rounded disabled:opacity-50"
              >
                ▶ Approve
              </button>
              <button 
                onClick={() => handleBulkAction('rejected')}
                disabled={selectedRows.size === 0}
                className="bg-white border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 rounded disabled:opacity-50"
              >
                ✗ Reject
              </button>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">Filter:</span>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 text-xs px-2 py-1 rounded"
              >
                <option value="all">All ({stats.total})</option>
                <option value="pending">Pending ({stats.pending})</option>
                <option value="approved">Approved ({stats.approved})</option>
                <option value="completed">Completed ({stats.completed})</option>
                <option value="rejected">Rejected ({stats.rejected})</option>
              </select>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            Selected: {selectedRows.size} clients
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border-b border-bittorrent-border">
        <div className="overflow-x-auto custom-scrollbar" style={{ height: '500px', overflowY: 'auto' }}>
          <table className="w-full bittorrent-table">
            <thead className="bg-bittorrent-toolbar sticky top-0" style={{ fontSize: '11px', fontWeight: '600', color: '#495057' }}>
              <tr>
                <th className="text-left p-2 border-r border-bittorrent-border w-8">
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
                  />
                </th>
                <th className="text-left p-2 border-r border-bittorrent-border w-20">ID</th>
                <th className="text-left p-2 border-r border-bittorrent-border w-48">Client</th>
                <th className="text-left p-2 border-r border-bittorrent-border w-24">Status</th>
                <th className="text-left p-2 border-r border-bittorrent-border w-32">Progress</th>
                <th className="text-left p-2 border-r border-bittorrent-border w-24">Created</th>
                <th className="text-left p-2 border-r border-bittorrent-border w-24">Last Activity</th>
                <th className="text-left p-2 border-r border-bittorrent-border w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, index) => {
                const statusInfo = getStatusInfo(client);
                const isSelected = selectedRows.has(client.id);
                const rowClass = isSelected 
                  ? "selected" 
                  : index % 2 === 0 ? "bittorrent-row" : "bittorrent-row";

                return (
                  <tr 
                    key={client.id} 
                    className={`${rowClass} cursor-pointer border-b border-gray-100`}
                    onClick={() => toggleRowSelection(client.id)}
                  >
                    <td className="p-2 border-r border-bittorrent-border">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleRowSelection(client.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-2 border-r border-bittorrent-border font-mono text-blue-600">
                      {client.unique_id}
                    </td>
                    <td className="p-2 border-r border-bittorrent-border">
                      <div className="flex items-center space-x-2">
                        <div className={`status-icon ${statusInfo.color.replace('bg-', 'status-')}`}></div>
                        <span className="font-medium text-blue-600 cursor-pointer hover:underline">
                          {client.first_name} {client.last_name}
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs">{client.email}</div>
                    </td>
                    <td className="p-2 border-r border-bittorrent-border">
                      <span className={`text-xs font-medium ${statusInfo.textColor}`}>
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-2 border-r border-bittorrent-border">
                      <div className="progress-bar-container mb-1">
                        <div 
                          className={statusInfo.progress}
                          style={{ width: `${client.progress_percentage || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {client.progress_percentage || 0}% - {client.current_step || 'Pending'}
                      </span>
                    </td>
                    <td className="p-2 border-r border-bittorrent-border">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2 border-r border-bittorrent-border">
                      {timeAgo(client.last_activity)}
                    </td>
                    <td className="p-2 border-r border-bittorrent-border">
                      <div className="flex space-x-1">
                        {client.status === 'pending' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateClientStatus(client.id, 'approved');
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                          >
                            ✓
                          </button>
                        )}
                        {['pending', 'verifying'].includes(client.status) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              updateClientStatus(client.id, 'rejected');
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                          >
                            ✗
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Stats Panel */}
      <div className="bg-gray-100 border-t border-bittorrent-border px-4 py-2">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Clients:</span>
              <span className="font-medium">{stats.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending:</span>
              <span className="font-medium text-blue-600">{stats.pending}</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between">
              <span className="text-gray-600">Approved:</span>
              <span className="font-medium text-green-600">{stats.approved}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rejected:</span>
              <span className="font-medium text-red-600">{stats.rejected}</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-medium text-green-600">{stats.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Success Rate:</span>
              <span className="font-medium">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
          <div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processing Speed:</span>
              <span className="font-medium">2.3 clients/hour</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Time:</span>
              <span className="font-medium">3.2 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
