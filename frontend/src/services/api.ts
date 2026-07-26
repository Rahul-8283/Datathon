import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const baseURL = isLocalhost
  ? (import.meta.env.VITE_API_DEV_URL || 'http://127.0.0.1:8000')
  : (import.meta.env.VITE_API_PRO_URL || 'http://127.0.0.1:8000');

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const session = useAuthStore.getState().session;
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface CaseBase {
  fir_number: string;
  date_reported: string; // ISO String
  district: string;
  status: string;
  description?: string;
}

export interface CaseResponse extends CaseBase {
  id: string;
  created_at: string;
  updated_at: string;
}

export const getCases = async (skip = 0, limit = 100): Promise<CaseResponse[]> => {
  const response = await api.get<CaseResponse[]>('/api/v1/cases/', {
    params: { skip, limit },
  });
  return response.data;
};

export const createCase = async (caseData: CaseBase): Promise<CaseResponse> => {
  const response = await api.post<CaseResponse>('/api/v1/cases/', caseData);
  return response.data;
};

export const deleteCase = async (caseId: string): Promise<CaseResponse> => {
  const response = await api.delete<CaseResponse>(`/api/v1/cases/${caseId}`);
  return response.data;
};

export const uploadCaseFile = async (file: File): Promise<{ message: string; task_id: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/v1/ingest/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const checkTaskStatus = async (taskId: string): Promise<{ task_id: string; status: string; result?: any; info?: any }> => {
  const response = await api.get(`/api/v1/ingest/status/${taskId}`);
  return response.data;
};

// Search Interfaces
export interface SearchResult {
  id: string;
  document: string;
  metadata: {
    filename?: string;
    content_type?: string;
    [key: string]: any;
  };
  distance: number;
}

export const searchModusOperandi = async (query: string, limit: number = 5): Promise<SearchResult[]> => {
  const response = await api.get('/api/v1/search/mo', {
    params: { query, limit },
  });
  return response.data;
};

// Graph Interfaces
export interface GraphNode {
  id: string;
  label: string;
  properties: Record<string, any>;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export const getNetworkGraph = async (): Promise<GraphData> => {
  const response = await api.get('/api/v1/graph/network');
  return response.data;
};

export const runAnomalyDetection = async (): Promise<any> => {
  const response = await api.post('/api/v1/ml/anomalies');
  return response.data;
};

// Stats Interfaces
export interface OverviewStats {
  cases_logged: number;
  network_entities: number;
  active_alerts: number;
  high_risk_zones: number;
  weekly_signal: number[];
}

export const getOverviewStats = async (): Promise<OverviewStats> => {
  const response = await api.get('/api/v1/stats/overview');
  return response.data;
};

// Geospatial Interfaces
export interface DistrictGeospatial {
  district: string;
  code: string;
  lat: number;
  lng: number;
  total_cases: number;
  anomalies: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE';
  color: string;
  crime_rate_change: string;
  top_crime_type: string;
}

export interface Hotspot {
  id: string;
  fir_number: string;
  crime_type: string;
  district: string;
  lat: number;
  lng: number;
  timestamp: string;
  hour: number;
  is_anomaly: boolean;
  intensity: number;
}

export const getDistrictGeospatial = async (): Promise<DistrictGeospatial[]> => {
  const response = await api.get('/api/v1/geospatial/districts');
  return response.data;
};

export const getSpatiotemporalHotspots = async (time_window = 'ALL'): Promise<Hotspot[]> => {
  const response = await api.get('/api/v1/geospatial/hotspots', {
    params: { time_window },
  });
  return response.data;
};
