import axios from 'axios';

const API_BASE = '/api';

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const importDataset = async (datasetId, database) => {
  const response = await axios.post(`${API_BASE}/dataset/import`, {
    dataset_id: datasetId,
    database: database
  });
  return response.data;
};

export const getSchema = async (database, datasetId) => {
  const response = await axios.get(`${API_BASE}/schema`, {
    params: { database, dataset_id: datasetId }
  });
  return response.data;
};

export const executeQuery = async (prompt, database, datasetId) => {
  const response = await axios.post(`${API_BASE}/query`, {
    prompt,
    database,
    dataset_id: datasetId
  });
  return response.data;
};

export const getAnalytics = async (datasetId) => {
  const response = await axios.get(`${API_BASE}/analytics`, {
    params: { dataset_id: datasetId }
  });
  return response.data;
};
