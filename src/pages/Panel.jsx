import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Archive, 
  Shield, 
  DollarSign, 
  Eye, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus, 
  Filter, 
  UserCheck, 
  Building2 
} from 'lucide-react';

const ModernCRMPanel = () => {
  const [currentUser] = useState({
    role: 'admin',
    name: 'Jose Hefferan',
    email: 'josehefferan@gmail.com'
  });

  const [selectedView, setSelectedView] = useState('dashboard');

  const [clients] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      status: 'nuevo_lead',
      broker: 'Maria Garcia',
      created: '2024-01-15',
      lastActivity: '2024-01-20',
      progress: 20,
      amount: 2500
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      status: 'contactado',
      broker: 'Carlos Rodriguez',
      created: '2024-01-18',
      lastActivity: '2024-01-22',
      progress: 40,
      amount: 3200
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike@example.com',
      status: 'en_validacion',
      broker: 'Maria Garcia',
      created: '2024-01-20',
      lastActivity: '2024-01-23',
      progress: 60,
      amount: 1800
    },
    {
      id: 4,
      name: 'Lisa Brown',
      email: 'lisa@example.com',
      status: 'aprobado',
      broker: 'Carlos Rodriguez',
      created: '2024-01-12',
      lastActivity: '2024-01-24',
      progress: 80,
      amount: 4500
    },
    {
      id: 5,
      name: 'David Lee',
      email: 'david@example.com',
      status: 'activo',
      broker: 'Maria Garcia',
      created: '2024-01-10',
      lastActivity: '2024-01-25',
      progress: 100,
      amount: 5200
    }
  ]);

  const statusConfig = {
    nuevo_lead: { 
      label: 'New Lead', 
      color: 'bg-blue-500', 
      bgColor: 'bg-blue-50', 
      textColor: 'text-blue-700',
      icon: Plus
    },
    contactado: { 
      label: 'Contacted', 
      color: 'bg-yellow-500', 
      bgColor: 'bg-yellow-50', 
      textColor: 'text-yellow-700',
      icon: Users
    },
    en_validacion: { 
      label: 'In Validation', 
      color: 'bg-purple-500', 
      bgColor: 'bg-purple-50', 
      textColor: 'text-purple-700',
      icon: Clock
    },
    aprobado: { 
      label: 'Approved', 
      color: 'bg-green-500', 
      bgColor: 'bg-green-50', 
      textColor: 'text-green-700',
      icon: CheckCircle
    },
    rechazado: { 
      label: 'Rejected', 
      color: 'bg-red-500', 
      bgColor: 'bg-red-50', 
      textColor: 'text-red-700',
      icon: XCircle
    },
    activo: { 
      label: 'Active', 
      color: 'bg-emerald-500', 
      bgColor: 'bg-emerald-50', 
      textColor: 'text-emerald-700',
      icon: TrendingUp
    },
    muerto: { 
      label: 'Dead/Archived', 
      color: 'bg-gray-500', 
      bgColor: 'bg-gray-50', 
      textColor: 'text-gray-700',
      icon: Archive
    },
    blacklist: { 
      label: 'Blacklist', 
      color: 'bg-black', 
      bgColor: 'bg-gray-100', 
      textColor: 'text-gray-900',
      icon: Shield
    }
  };

  const getStats = () => {
    const stats = {};
    Object.keys(statusConfig).forEach(status => {
      stats[status] = clients.filter(client => client.status === status).length;
    });
    stats.total = clients.length;
    stats.revenue = clients.reduce((sum, client) => sum + client.amount, 0);
    return stats;
  };

  const stats = getStats();

  const LogoSVG = () => (
    <svg width="40" height="40" viewBox="0 0 120 60" className="mr-3">
      <rect x="8" y="35" width="12" height="20" fill="#FF6B35" rx="2"/>
      <rect x="24" y="25" width="12" height="30" fill="#FFB800" rx="2"/>
      <rect x="40" y="15" width="12" height="40" fill="#7CB342" rx="2"/>
      <path d="M45 8 L65 8 L60 3 M65 8 L60 13" 
            stroke="#2E7D32" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"/>
      <text x="75" y="25" 
            fill="#2E7D32" 
            fontSize="14" 
            fontWeight="bold" 
            fontFamily="Arial, sans-serif">EASY</text>
      <text x="75" y="42" 
            fill="#2E7D32" 
            fontSize="14" 
            fontWeight="bold" 
            fontFamily="Arial, sans-serif">TRADELINES</text>
    </svg>
  );

  const PipelineBoard = () => {
    const pipelineStages = ['nuevo_lead', 'contactado', 'en_validacion', 'aprobado', 'activo'];
    
    return (
      <div className="grid grid-cols-5 gap-4 h-full">
        {pipelineStages.map(stage => {
          const stageClients = clients.filter(client => client.status === stage);
          const config = statusConfig[stage];
          const IconComponent = config.icon;
          
          return (
            <div key={stage} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-800">{config.label}</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${config.bgColor} ${config.textColor}`}>
                  {stageClients.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {stageClients.map(client => (
                  <div key={client.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm text-gray-900">{client.name}</h4>
                      <span className="text-xs text-gray-500">${client.amount}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{client.email}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{client.broker}</span>
                      <div className="w-12 bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${config.color}`}
                          style={{ width: `${client.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const DashboardStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">New Leads</p>
            <p className="text-3xl font-bold">{stats.nuevo_lead}</p>
          </div>
          <Plus className="w-8 h-8 text-blue-200" />
        </div>
        <div className="mt-4 text-blue-100 text-sm">+12% vs last month</div>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Active</p>
            <p className="text-3xl font-bold">{stats.activo}</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-200" />
        </div>
        <div className="mt-4 text-green-100 text-sm">+8% vs last month</div>
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm">In Validation</p>
            <p className="text-3xl font-bold">{stats.en_validacion}</p>
          </div>
          <Clock className="w-8 h-8 text-purple-200" />
        </div>
        <div className="mt-4 text-purple-100 text-sm">Average 3 days</div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold">${stats.revenue.toLocaleString()}</p>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-200" />
        </div>
        <div className="mt-4 text-emerald-100 text-sm">+15% vs last month</div>
      </div>
    </div>
  );

  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'pipeline', label: 'Pipeline', icon: TrendingUp },
      { id: 'clients', label: 'Clients', icon: Users },
      { id: 'archive', label: 'Archive', icon: Archive },
      { id: 'reports', label: 'Reports', icon: Eye }
    ];

    // Admin-only items
    if (currentUser.role === 'admin') {
      baseItems.push(
        { id: 'brokers', label: 'Brokers', icon: UserCheck },
        { id: 'affiliates', label: 'Affiliates & Inhouse', icon: Building2 }
      );
    }

    baseItems.push({ id: 'settings', label: 'Settings', icon: Settings });
    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-red-500 p-4">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex items-center p-6 border-b">
          <LogoSVG />
          <div>
            <h1 className="text-lg font-bold text-gray-800">EasyTradelines</h1>
            <p className="text-xs text-green-600 font-medium">{currentUser.role.toUpperCase()}</p>
          </div>
        </div>

        <nav className="mt-6">
          {navigationItems.map(item => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedView(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  selectedView === item.id 
                    ? 'bg-green-50 text-green-700 border-r-2 border-green-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.email}</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center px-4 py-2 text-gray-600 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedView === 'dashboard' && 'Dashboard'}
              {selectedView === 'pipeline' && 'Sales Pipeline'}
              {selectedView === 'clients' && 'Client Management'}
              {selectedView === 'archive' && 'Archived Clients'}
              {selectedView === 'brokers' && 'Broker Management'}
              {selectedView === 'affiliates' && 'Affiliates & Inhouse List'}
              {selectedView === 'reports' && 'Reports & Analytics'}
              {selectedView === 'settings' && 'Settings'}
            </h2>
            <p className="text-gray-600 mt-1">
              {selectedView === 'dashboard' && 'CRM overview and key metrics'}
              {selectedView === 'pipeline' && 'Kanban view of client pipeline'}
              {selectedView === 'clients' && 'Manage all clients and tradelines'}
              {selectedView === 'archive' && 'View archived and dead clients'}
              {selectedView === 'brokers' && 'Manage brokers and their history'}
              {selectedView === 'affiliates' && 'Manage affiliates and inhouse tradelines'}
              {selectedView === 'reports' && 'Performance metrics and reports'}
              {selectedView === 'settings' && 'System configuration'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Plus className="w-4 h-4" />
              <span>New Client</span>
            </button>
          </div>
        </div>

        {/* Content based on selected view */}
        {selectedView === 'dashboard' && (
          <div>
            <DashboardStats />
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {clients.slice(0, 5).map(client => {
                    const StatusIcon = statusConfig[client.status].icon;
                    return (
                      <div key={client.id} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full ${statusConfig[client.status].color} flex items-center justify-center`}>
                          <StatusIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{client.name}</p>
                          <p className="text-xs text-gray-500">Changed to {statusConfig[client.status].label}</p>
                        </div>
                        <span className="text-xs text-gray-400">{client.lastActivity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const StatusIcon = config.icon;
                    return (
                      <div key={status} className={`p-3 rounded-lg ${config.bgColor}`}>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`w-4 h-4 ${config.textColor}`} />
                          <span className={`text-sm font-medium ${config.textColor}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className={`text-2xl font-bold ${config.textColor} mt-1`}>
                          {stats[status] || 0}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'pipeline' && (
          <div className="h-screen">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>All Brokers</option>
                  <option>Maria Garcia</option>
                  <option>Carlos Rodriguez</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
                Total: {clients.length} clients
              </div>
            </div>
            <PipelineBoard />
          </div>
        )}

        {selectedView === 'clients' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6">
              <p className="text-gray-600">Detailed client view - Enhanced table similar to current but improved</p>
            </div>
          </div>
        )}

        {selectedView === 'archive' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6">
              <p className="text-gray-600">Archived and dead clients management</p>
            </div>
          </div>
        )}

        {selectedView === 'brokers' && currentUser.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6">
              <p className="text-gray-600">Broker management and history - Admin only</p>
            </div>
          </div>
        )}

        {selectedView === 'affiliates' && currentUser.role === 'admin' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6">
              <p className="text-gray-600">Affiliates and inhouse tradelines management - Admin only</p>
            </div>
          </div>
        )}

        {selectedView === 'reports' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6">
              <p className="text-gray-600">Reports and analytics dashboard</p>
            </div>
          </div>
        )}

        {selectedView === 'settings' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6">
              <p className="text-gray-600">System settings and configuration</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernCRMPanel;
