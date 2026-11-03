import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { logout as clearAuth, setToken, setUser as setReduxUser } from '../store/authSlice';
import client from './client';

// Auth Hooks
export const useAuth = () => {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  // On first mount: if we have a stored token, silently refresh it to confirm it's still valid
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await client.get('/auth/me');
        const authenticatedUser = response.data.data;
        setUser(authenticatedUser);
        dispatch(setReduxUser(authenticatedUser));
      } catch (error) {
        // Token invalid - clear everything
        setUser(null);
        dispatch(clearAuth());
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [dispatch]);

  // Auto-refresh access token every 13 minutes (before 15min expiry)
  useEffect(() => {
    if (!user) return;

    const refreshSession = async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await client.post('/auth/refresh-token', { refreshToken });
        if (response.data?.data?.accessToken) {
          localStorage.setItem('accessToken', response.data.data.accessToken);
          dispatch(setToken(response.data.data.accessToken));
        }
      } catch (error) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        dispatch(clearAuth());
      }
    };

    refreshTimerRef.current = setInterval(refreshSession, 13 * 60 * 1000);
    return () => clearInterval(refreshTimerRef.current);
  }, [user, dispatch]);

  // Listen for forced logout triggered when refresh also fails
  useEffect(() => {
    const handler = () => {
      clearInterval(refreshTimerRef.current);
      setUser(null);
      dispatch(clearAuth());
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [dispatch]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await client.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      dispatch(setReduxUser(user));
      dispatch(setToken(accessToken));
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  }, [dispatch]);

  const register = useCallback(async (email, password, fullName) => {
    try {
      const response = await client.post('/auth/register', { email, password, fullName });
      const { accessToken, refreshToken, user } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      dispatch(setReduxUser(user));
      dispatch(setToken(accessToken));
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  }, [dispatch]);

  const logoutUser = useCallback(() => {
    clearInterval(refreshTimerRef.current);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    dispatch(clearAuth());
  }, [dispatch]);

  const logout = useCallback(() => {
    client.post('/auth/logout').catch(() => {});
    logoutUser();
  }, [logoutUser]);

  return { user, loading, login, register, logout };
};

// Schemes Hook
export const useSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchemes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await client.get('/schemes');
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setSchemes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  useEffect(() => {
    const handleSchemesUpdated = () => fetchSchemes();
    window.addEventListener('schemes:updated', handleSchemesUpdated);
    return () => window.removeEventListener('schemes:updated', handleSchemesUpdated);
  }, [fetchSchemes]);

  const getSchemeById = useCallback(async (id) => {
    try {
      const response = await client.get(`/schemes/${id}`);
      return response.data.data;
    } catch (err) {
      throw err;
    }
  }, []);

  return { schemes, loading, error, fetchSchemes, getSchemeById };
};

// KPIs Hook
export const useKPIs = (schemeIdOrCode = null, stateId = null) => {
  const [kpis, setKpis] = useState([]);
  const [kpiValues, setKpiValues] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchKPIs = useCallback(async () => {
    try {
      setLoading(true);
      // Support both scheme code (string) and scheme ID (number)
      let url = '/kpis';
      if (schemeIdOrCode) {
        if (typeof schemeIdOrCode === 'string') {
          // Scheme code like 'PMAY'
          const stateQuery = stateId ? `?stateId=${encodeURIComponent(stateId)}` : '';
          url = `/kpis/status/${schemeIdOrCode}${stateQuery}`;
        } else {
          // Scheme ID like 1
          url = `/kpis?schemeId=${schemeIdOrCode}`;
        }
      }
      const response = await client.get(url);
      const payload = response.data?.kpi_status ?? response.data?.data?.kpi_status ?? response.data?.data;
      const data = Array.isArray(payload) ? payload : [];
      setKpis(data);
    } catch (err) {
      console.error('Error fetching KPIs:', err);
      setKpis([]);
    } finally {
      setLoading(false);
    }
  }, [schemeIdOrCode, stateId]);

  const fetchLatestKPIValues = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/kpis/latest';
      if (schemeIdOrCode) {
        if (typeof schemeIdOrCode === 'string') {
          const stateQuery = stateId ? `?stateId=${encodeURIComponent(stateId)}` : '';
          url = `/kpis/status/${schemeIdOrCode}${stateQuery}`;
        } else {
          url = `/kpis/latest?schemeId=${schemeIdOrCode}`;
        }
      }
      const response = await client.get(url);
      const payload = response.data?.kpi_status ?? response.data?.data?.kpi_status ?? response.data?.data;
      const data = Array.isArray(payload) ? payload : [];
      setKpiValues(data);
    } catch (err) {
      console.error('Error fetching KPI values:', err);
      setKpiValues([]);
    } finally {
      setLoading(false);
    }
  }, [schemeIdOrCode, stateId]);

  const getKPITrend = useCallback(async (kpiId, days = 90) => {
    try {
      const response = await client.get(`/kpis/${kpiId}/trend?days=${days}`);
      return response.data.data;
    } catch (err) {
      throw err;
    }
  }, []);

  const getKPIStatistics = useCallback(async (kpiId) => {
    try {
      const response = await client.get(`/kpis/${kpiId}/statistics`);
      return response.data.data;
    } catch (err) {
      throw err;
    }
  }, []);

  const getTopPerformers = useCallback(async (kpiId) => {
    try {
      const response = await client.get(`/kpis/${kpiId}/top?limit=5`);
      return response.data.data;
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchKPIs();
    fetchLatestKPIValues();
  }, [fetchKPIs, fetchLatestKPIValues]);

  useEffect(() => {
    const refreshKpis = () => {
      fetchKPIs();
      fetchLatestKPIValues();
    };
    window.addEventListener('kpi-data:updated', refreshKpis);
    return () => window.removeEventListener('kpi-data:updated', refreshKpis);
  }, [fetchKPIs, fetchLatestKPIValues]);

  return {
    kpis,
    kpiValues,
    loading,
    fetchKPIs,
    fetchLatestKPIValues,
    getKPITrend,
    getKPIStatistics,
    getTopPerformers,
  };
};

// KPI Status Hook (Real-time KPI values by scheme)
export const useKPIStatus = (schemeCode) => {
  const [kpiStatus, setKpiStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchKPIStatus = useCallback(async () => {
    if (!schemeCode) return;
    try {
      setLoading(true);
      const response = await client.get(`/kpis/status/${schemeCode}`);
      const kpiData = response.data?.data?.kpi_status || response.data?.kpi_status || [];
      setKpiStatus(kpiData);
      setError(null);
    } catch (err) {
      setError(err.message);
      setKpiStatus([]);
    } finally {
      setLoading(false);
    }
  }, [schemeCode]);

  useEffect(() => {
    fetchKPIStatus();
    const interval = setInterval(fetchKPIStatus, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [fetchKPIStatus]);

  return {
    kpiStatus,
    loading,
    error,
    refetch: fetchKPIStatus,
  };
};

// Geographic Hook
export const useGeographic = () => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await client.get('/geo/states');
      setStates(response.data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDistricts = useCallback(async (stateId) => {
    try {
      const response = await client.get(`/geo/districts?stateId=${stateId}`);
      setDistricts(response.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchBlocks = useCallback(async (districtId) => {
    try {
      const response = await client.get(`/geo/blocks?districtId=${districtId}`);
      setBlocks(response.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchVillages = useCallback(async (blockId) => {
    try {
      const response = await client.get(`/geo/villages?blockId=${blockId}`);
      setVillages(response.data.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  return {
    states,
    districts,
    blocks,
    villages,
    loading,
    fetchStates,
    fetchDistricts,
    fetchBlocks,
    fetchVillages,
  };
};

export default {
  useAuth,
  useSchemes,
  useKPIs,
  useGeographic,
};
