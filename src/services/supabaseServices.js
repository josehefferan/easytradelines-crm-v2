// SUPABASE SERVICES FOR EXISTING DATABASE STRUCTURE
// Archivo: src/services/supabaseServices.js
// ================================================

import { supabase } from '../lib/supabase';

// ================================================
// PROFILE SERVICES (Brokers, Affiliates, etc.)
// ================================================

export const profileService = {
  // Obtener todos los brokers
  async getBrokers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'broker')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Obtener todos los affiliates
  async getAffiliates() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'affiliate')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Crear nuevo broker
  async createBroker(brokerData) {
    try {
      // Generar unique_id
      const uniqueId = await this.generateUniqueId('broker');
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          email: brokerData.email,
          role: 'broker',
          unique_id: uniqueId,
          first_name: brokerData.firstName,
          last_name: brokerData.lastName,
          phone: brokerData.phone,
          commission_rate: brokerData.commissionRate || 15.00,
          is_active: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Crear nuevo affiliate
  async createAffiliate(affiliateData) {
    try {
      // Generar unique_id
      const uniqueId = await this.generateUniqueId('affiliate');
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          email: affiliateData.email,
          role: 'affiliate',
          unique_id: uniqueId,
          first_name: affiliateData.firstName,
          last_name: affiliateData.lastName,
          phone: affiliateData.phone,
          company_name: affiliateData.company,
          commission_rate: affiliateData.commissionRate || 8.00,
          is_active: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Generar unique_id
  async generateUniqueId(role) {
    try {
      let prefix;
      switch (role) {
        case 'broker': prefix = 'B-'; break;
        case 'affiliate': prefix = 'A-'; break;
        case 'client': prefix = 'C-'; break;
        default: prefix = 'U-';
      }

      // Obtener el último número usado
      const { data } = await supabase
        .from('profiles')
        .select('unique_id')
        .like('unique_id', `${prefix}%`)
        .order('unique_id', { ascending: false })
        .limit(1);

      let nextNum = 1;
      if (data && data.length > 0) {
        const lastId = data[0].unique_id;
        const lastNum = parseInt(lastId.split('-')[1]);
        nextNum = lastNum + 1;
      }

      return `${prefix}${nextNum.toString().padStart(4, '0')}`;
    } catch (error) {
      return `${prefix}0001`;
    }
  },

  // Actualizar profile
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Obtener profile por ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
};

// ================================================
// CLIENT SERVICES
// ================================================

export const clientService = {
  // Obtener todos los clients con información completa
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('clients_with_details')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Crear nuevo client
  async create(clientData) {
    try {
      // Generar unique_id para client
      const uniqueId = await profileService.generateUniqueId('client');
      
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          unique_id: uniqueId,
          first_name: clientData.firstName,
          last_name: clientData.lastName,
          email: clientData.email,
          phone: clientData.phone,
          status: clientData.status || 'pending',
          progress_percentage: 0,
          assigned_broker_id: clientData.brokerId,
          source_affiliate_id: clientData.affiliateId,
          estimated_amount: clientData.estimatedAmount || 0,
          notes: clientData.notes
        }])
        .select()
        .single();
      
      if (error) throw error;

      // Registrar actividad
      await activityService.create({
        client_id: data.id,
        action_type: 'client_created',
        description: `Client ${clientData.firstName} ${clientData.lastName} was created`
      });
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Actualizar client
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Obtener client por ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('clients_with_details')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Obtener estadísticas del dashboard
  async getStats() {
    try {
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .single();
      
      if (error) throw error;
      
      // También obtener estadísticas por status
      const { data: statusData, error: statusError } = await supabase
        .from('clients')
        .select('status, estimated_amount');

      if (statusError) throw statusError;

      const statusCounts = {};
      let totalRevenue = 0;

      statusData.forEach(client => {
        statusCounts[client.status] = (statusCounts[client.status] || 0) + 1;
        totalRevenue += client.estimated_amount || 0;
      });

      return { 
        data: { 
          ...data, 
          ...statusCounts,
          total_revenue: totalRevenue 
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
};

// ================================================
// ACTIVITY SERVICES
// ================================================

export const activityService = {
  // Crear nueva actividad
  async create(activityData) {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .insert([{
          client_id: activityData.client_id,
          user_id: activityData.user_id,
          action_type: activityData.action_type,
          description: activityData.description,
          old_value: activityData.old_value,
          new_value: activityData.new_value,
          metadata: activityData.metadata
        }])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Obtener actividades recientes
  async getRecent(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          client:clients(id, first_name, last_name, unique_id),
          user:profiles(id, first_name, last_name, role)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Obtener actividades por client
  async getByClient(clientId) {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          user:profiles(id, first_name, last_name, role)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
};

// ================================================
// TRADELINE SERVICES
// ================================================

export const tradelineService = {
  // Obtener tradelines disponibles
  async getAvailable() {
    try {
      const { data, error } = await supabase
        .from('available_tradelines')
        .select('*')
        .eq('is_available', true)
        .order('price', { ascending: true });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Asignar tradeline a cliente
  async assignToClient(assignmentData) {
    try {
      const { data, error } = await supabase
        .from('client_tradelines')
        .insert([{
          client_id: assignmentData.clientId,
          tradeline_id: assignmentData.tradelineId,
          broker_id: assignmentData.brokerId,
          purchase_price: assignmentData.purchasePrice,
          commission_broker: assignmentData.commissionBroker || 0,
          commission_affiliate: assignmentData.commissionAffiliate || 0,
          status: 'pending',
          notes: assignmentData.notes
        }])
        .select()
        .single();
      
      if (error) throw error;

      // Registrar actividad
      await activityService.create({
        client_id: assignmentData.clientId,
        action_type: 'tradeline_assigned',
        description: `Tradeline assigned with purchase price $${assignmentData.purchasePrice}`
      });
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Obtener tradelines de un cliente
  async getByClient(clientId) {
    try {
      const { data, error } = await supabase
        .from('client_tradelines')
        .select(`
          *,
          tradeline:available_tradelines(*),
          broker:profiles(id, first_name, last_name)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Actualizar estado de tradeline asignada
  async updateAssignment(id, updates) {
    try {
      const { data, error } = await supabase
        .from('client_tradelines')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }
};

// ================================================
// AUTH SERVICES
// ================================================

export const authService = {
  // Obtener usuario actual con profile
  async getCurrentUser() {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user.user) return { data: null, error: 'No user found' };

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

      if (profileError) throw profileError;

      return { 
        data: { 
          ...user.user, 
          profile 
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }
};

// ================================================
// EXPORT DEFAULT
// ================================================

export default {
  profileService,
  clientService,
  activityService,
  tradelineService,
  authService
};
