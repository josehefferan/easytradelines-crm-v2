import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, CreditCard, 
  LogOut, Menu, X, Plus, Search, Filter,
  Clock, CheckCircle, AlertCircle, TrendingUp,
  Calendar, DollarSign, Target, Award
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import NewClientModal from '../components/NewClientModal';

const BrokerPanel = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [brokerData, setBrokerData] = useState(null);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    pendingClients: 0,
    completedThisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  useEffect(() => {
    checkAuth();
    loadBrokerData();
  }, []);

const checkAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    // Establecer el usuario actual basado en el email de la sesión
    setCurrentUser({
      email: session.user.email,
      role: 'broker', // Asumimos que es broker si llegó a esta página
      name: session.user.email.split('@')[0] // Nombre temporal del email
    });
    
    // No necesitamos verificar en la tabla users porque los brokers no están ahí
    // Solo cargamos los datos del broker directamente
  } catch (error) {
    console.error('Auth check error:', error);
    navigate('/login');
  }
};

  const loadBrokerData = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Load broker profile usando el email de la sesión
    const { data: broker, error: brokerError } = await supabase
      .from('brokers')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (brokerError) {
      console.error('Error loading broker data:', brokerError);
      return;
    }

    setBrokerData(broker);
    
    if (broker) {
      setCurrentUser({
        email: broker.email,
        role: 'broker',
        name: `${broker.first_name} ${broker.last_name}`
      });
    }


      setClients(clientsData || []);

      // Calculate stats
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      setStats({
        totalClients: clientsData?.length || 0,
        activeClients: clientsData?.filter(c => c.status === 'in_process' || c.status === 'reviewing_documents').length || 0,
        pendingClients: clientsData?.filter(c => c.status === 'new_lead' || c.status === 'pending').length || 0,
        completedThisMonth: clientsData?.filter(c => {
          const completedDate = new Date(c.updated_at);
          return c.status === 'completed' && completedDate >= startOfMonth;
        }).length || 0
      });

    } catch (error) {
      console.error('Error loading broker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'new_lead': 'bg-blue-100 text-blue-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_process': 'bg-purple-100 text-purple-800',
      'reviewing_documents': 'bg-orange-100 text-orange-800',
      'submitted_to_processor': 'bg-indigo-100 text-indigo-800',
      'approved': 'bg-green-100 text-green-800',
      'completed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredClients = clients.filter(client => 
    client.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.client_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading broker panel...</p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeClients}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingClients}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed (Month)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedThisMonth}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Client Activity</h3>
        </div>
        <div className="p-6">
          {filteredClients.slice(0, 5).map((client) => (
            <div key={client.id} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 rounded-full p-2">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {client.first_name} {client.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{client.client_number}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                  {client.status?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">My Clients</h3>
          <button 
            onClick={() => setIsNewClientModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Client
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {client.first_name} {client.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{client.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{client.client_number}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                    {getStatusIcon(client.status)}
                    {client.status?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(client.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-green-600 hover:text-green-900">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding a new client'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button 
                  onClick={() => setIsNewClientModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add New Client
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className={`font-bold text-xl text-gray-800 ${!isSidebarOpen && 'hidden'}`}>
              Broker Portal
            </h2>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Broker Info */}
          {isSidebarOpen && brokerData && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Welcome back,</p>
              <p className="font-semibold text-gray-900">{brokerData.first_name} {brokerData.last_name}</p>
              <p className="text-xs text-green-600 mt-1">{brokerData.broker_number}</p>
            </div>
          )}
        </div>

        <nav className="px-4 pb-4">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`w-full flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
              activeSection === 'dashboard' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            {isSidebarOpen && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => setActiveSection('clients')}
            className={`w-full flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
              activeSection === 'clients' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Users className="w-5 h-5" />
            {isSidebarOpen && <span>My Clients</span>}
          </button>

          <button
            onClick={() => setActiveSection('commissions')}
            className={`w-full flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
              activeSection === 'commissions' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            {isSidebarOpen && <span>Commissions</span>}
          </button>

          <button
            onClick={() => setActiveSection('documents')}
            className={`w-full flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
              activeSection === 'documents' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            {isSidebarOpen && <span>Documents</span>}
          </button>

          <button
            onClick={() => setActiveSection('profile')}
            className={`w-full flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
              activeSection === 'profile' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            {isSidebarOpen && <span>Profile</span>}
          </button>

          <div className="mt-8 pt-4 border-t">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${isSidebarOpen ? 'justify-start' : 'justify-center'} gap-3 px-4 py-3 text-left rounded-lg hover:bg-red-50 text-red-600 transition-colors`}
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {activeSection === 'dashboard' && 'Dashboard'}
              {activeSection === 'clients' && 'My Clients'}
              {activeSection === 'commissions' && 'Commissions'}
              {activeSection === 'documents' && 'Documents'}
              {activeSection === 'profile' && 'My Profile'}
            </h1>
            <p className="text-gray-600 mt-2">
              {activeSection === 'dashboard' && 'Overview of your broker activities'}
              {activeSection === 'clients' && 'Manage and track your assigned clients'}
              {activeSection === 'commissions' && 'Track your earnings and commissions'}
              {activeSection === 'documents' && 'Access important documents and resources'}
              {activeSection === 'profile' && 'Manage your profile and settings'}
            </p>
          </div>

          {/* Render content based on active section */}
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'clients' && renderClients()}
          {activeSection === 'commissions' && (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Commissions tracking coming soon...</p>
            </div>
          )}
          {activeSection === 'documents' && (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Documents section coming soon...</p>
            </div>
          )}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Broker Profile</h3>
              {brokerData && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{brokerData.first_name} {brokerData.last_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{brokerData.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{brokerData.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Broker Number</label>
                    <p className="mt-1 text-sm text-gray-900">{brokerData.broker_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      brokerData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {brokerData.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Nuevo Cliente */}
      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => {
          setIsNewClientModalOpen(false);
          loadBrokerData(); // Recargar datos después de crear un cliente
        }}
        currentUser={currentUser}
      />
    </div>
  );
};

export default BrokerPanel;
