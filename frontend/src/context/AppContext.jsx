import React, { createContext, useContext, useState, useEffect } from 'react';
import { uploadFile as uploadFileApi, getSchema as getSchemaApi, executeQuery as executeQueryApi, importDataset as importDatasetApi } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [activeDataset, setActiveDataset] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [schemaData, setSchemaData] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);

  // Fetch schema only when a dataset is uploaded AND a database is selected
  const fetchSchema = async (db = selectedDatabase, dsId = activeDataset?.dataset_id) => {
    if (!db || !uploadedFiles.length) {
      setSchemaData(null);
      return;
    }
    try {
      const res = await getSchemaApi(db, dsId);
      setSchemaData(res);
    } catch (err) {
      console.error("Schema fetch error:", err);
    }
  };

  useEffect(() => {
    if (selectedDatabase && uploadedFiles.length) {
      fetchSchema(selectedDatabase, activeDataset?.dataset_id);
    } else {
      setSchemaData(null);
    }
  }, [selectedDatabase, activeDataset, uploadedFiles]);

  // Handle file upload
  const handleFileUpload = async (file) => {
    setLoading(true);
    setStatusMessage('Uploading and processing dataset...');
    setError(null);
    try {
      const res = await uploadFileApi(file);
      if (res.success) {
        const ds = res.dataset;
        setActiveDataset(ds);
        setUploadedFiles(prev => [...prev.filter(f => f.filename !== ds.filename), ds]);
        setStatusMessage('Dataset uploaded successfully. Please select a database engine.');
        
        // If a database is already selected, import immediately
        if (selectedDatabase) {
          await importDatasetApi(ds.dataset_id, selectedDatabase);
          await fetchSchema(selectedDatabase, ds.dataset_id);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to upload dataset file.";
      setError(msg);
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  // Handle Database Selection
  const handleDatabaseChange = async (db) => {
    setSelectedDatabase(db);
    if (!db) return;
    if (activeDataset) {
      setLoading(true);
      setStatusMessage(`Importing structure & generating schema for ${db.toUpperCase()}...`);
      try {
        await importDatasetApi(activeDataset.dataset_id, db);
        await fetchSchema(db, activeDataset.dataset_id);
      } catch (err) {
        console.warn(`Database change import warning (${db}):`, err);
      } finally {
        setLoading(false);
        setStatusMessage('');
      }
    }
  };

  // Execute Natural Language Query
  const sendNaturalLanguageQuery = async (promptText) => {
    if (!promptText.trim()) return;
    if (!selectedDatabase || !uploadedFiles.length) {
      setError("Please upload a dataset and select a database engine first.");
      return;
    }

    const userMessage = { id: Date.now(), type: 'user', text: promptText };
    setChatHistory(prev => [...prev, userMessage]);

    setLoading(true);
    setStatusMessage('Asking Gemini AI and executing query...');
    setError(null);

    try {
      const res = await executeQueryApi(promptText, selectedDatabase, activeDataset?.dataset_id);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        data: res
      };
      setChatHistory(prev => [...prev, botMessage]);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Unable to execute query. Please check database configuration.";
      setError(msg);
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        type: 'error',
        text: msg
      }]);
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  // Requirement 1: Clear everything on "New Chat" to start 100% fresh!
  const handleNewChat = () => {
    setActiveDataset(null);
    setUploadedFiles([]);
    setSelectedDatabase('');
    setSchemaData(null);
    setChatHistory([]);
    setError(null);
  };

  const isReadyToQuery = uploadedFiles.length > 0 && selectedDatabase !== '';

  return (
    <AppContext.Provider value={{
      selectedDatabase,
      setSelectedDatabase: handleDatabaseChange,
      activeDataset,
      uploadedFiles,
      schemaData,
      chatHistory,
      isAnalyticsOpen,
      setIsAnalyticsOpen,
      loading,
      statusMessage,
      error,
      isReadyToQuery,
      handleFileUpload,
      sendNaturalLanguageQuery,
      handleNewChat,
      fetchSchema
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
