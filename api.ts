import { offlineDb } from './offlineDb';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const isOnline = () => window.navigator.onLine;

export const api = {
  async login(username: string, password: string) {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },

  async register(data: any) {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  async getDashboardData() {
    try {
      const res = await fetch('/api/dashboard_data', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      // Cache results for offline viewing
      localStorage.setItem('cached_dashboard', JSON.stringify(data));
      return data;
    } catch (error) {
      if (!isOnline()) {
        const cached = localStorage.getItem('cached_dashboard');
        if (cached) return JSON.parse(cached);
      }
      throw error;
    }
  },

  async getChildren() {
    try {
      const res = await fetch('/api/children', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch children');
      const data = await res.json();
      localStorage.setItem('cached_children', JSON.stringify(data));
      return data;
    } catch (error) {
      if (!isOnline()) {
        const cached = localStorage.getItem('cached_children');
        if (cached) return JSON.parse(cached);
      }
      throw error;
    }
  },

  async addChild(data: any) {
    if (!isOnline()) {
      await offlineDb.addRequest({ type: 'addChild', data });
      return { offline: true, message: 'Saved locally. Will sync when online.' };
    }
    const res = await fetch('/api/add_child', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add child');
    return res.json();
  },

  async addNutrition(data: any) {
    if (!isOnline()) {
      await offlineDb.addRequest({ type: 'addNutrition', data });
      return { offline: true, message: 'Saved locally. Will sync when online.' };
    }
    const res = await fetch('/api/add_nutrition', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add nutrition record');
    return res.json();
  },

  async getProfile() {
    try {
      const res = await fetch('/api/profile', { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      if (!isOnline()) {
        const cached = localStorage.getItem('user');
        if (cached) return JSON.parse(cached);
      }
      throw error;
    }
  },

  async updateProfile(data: any) {
    if (!isOnline()) {
      await offlineDb.addRequest({ type: 'updateProfile', data });
      localStorage.setItem('user', JSON.stringify(data));
      return { offline: true, message: 'Saved locally. Will sync when online.' };
    }
    const res = await fetch('/api/update_profile', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  async saveFullChildRecord(childData: any, nutritionData: any) {
    if (!isOnline()) {
      // Save as one atomic unit for offline sync
      await offlineDb.addRequest({ 
        type: 'fullChildRecord', 
        data: { childData, nutritionData } 
      });
      return { offline: true, message: 'Record saved locally' };
    }

    // Online: Sequential standard calls
    const childRes = await this.addChild(childData);
    const nutritionRes = await this.addNutrition({
      ...nutritionData,
      child_id: childRes.id
    });
    return { childRes, nutritionRes };
  },

  async syncOfflineData() {
    if (!isOnline()) return;
    
    const requests = await offlineDb.getAllRequests();
    if (requests.length === 0) return;

    for (const req of requests) {
      try {
        if (req.type === 'addChild') {
          await this.addChild(req.data);
        } else if (req.type === 'addNutrition') {
          await this.addNutrition(req.data);
        } else if (req.type === 'updateProfile') {
          await this.updateProfile(req.data);
        } else if (req.type === 'fullChildRecord') {
          const { childData, nutritionData } = req.data;
          const childRes = await this.addChild(childData);
          await this.addNutrition({
            ...nutritionData,
            child_id: childRes.id
          });
        }
        await offlineDb.deleteRequest(req.id!);
      } catch (err) {
        console.error('Failed to sync request:', req, err);
      }
    }
    
    window.dispatchEvent(new Event('syncComplete'));
  }
};
