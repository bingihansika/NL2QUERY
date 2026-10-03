import React, { useState } from 'react';
import { Sparkles, ArrowRight, Send, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QueryResultCard } from './QueryResultCard';

const getDatasetSuggestions = (schemaData, uploadedFiles) => {
  if (!uploadedFiles || uploadedFiles.length === 0) return [];

  const tables = schemaData?.tables || [];
  const primaryTable = tables[0] || (uploadedFiles[0] ? {
    table_name: uploadedFiles[0].filename.split('.')[0].toLowerCase().replace(/[^\w]/g, '_'),
    columns: uploadedFiles[0].columns || []
  } : null);

  if (!primaryTable || !primaryTable.columns || primaryTable.columns.length === 0) {
    return [
      "Show all records from the uploaded dataset",
      "What are the total number of records?",
      "Show summary statistics of the data",
      "List top 5 records"
    ];
  }

  const tableName = primaryTable.table_name;
  const cols = primaryTable.columns;

  const colNames = cols.map(c => c.name);
  const numCols = cols.filter(c => {
    const t = (c.type || '').toUpperCase();
    return t.includes('INT') || t.includes('REAL') || t.includes('FLOAT') || t.includes('NUM') || t.includes('DECIMAL');
  }).map(c => c.name);

  const textCols = cols.filter(c => !numCols.includes(c.name)).map(c => c.name);

  // Placements dataset
  if (colNames.some(c => c.includes('salary_package') || c.includes('placement') || c.includes('company'))) {
    const list = [
      "Show top 5 companies by highest salary package",
      "What is the average salary package by job role?",
      "List all placement records with accepted offer status",
      "Count total placements grouped by offer status"
    ];
    if (tables.length > 1) {
      list[3] = "Show student details joined with placement records";
    }
    return list;
  }

  // Student dataset
  if (colNames.some(c => c.includes('student') || c.includes('cgpa') || c.includes('branch'))) {
    return [
      "Show top 10 students with highest CGPA",
      "Count total students grouped by branch",
      "List students with CGPA greater than 8.0",
      "Show placement details for student_id 310"
    ];
  }

  // Employee dataset
  if (colNames.some(c => c.includes('employee') || c.includes('salary') || c.includes('department'))) {
    return [
      "Show top 5 highest paid employees",
      "What is the average salary by department?",
      "Count total employees in each department",
      "List employees with salary greater than 50000"
    ];
  }

  // Sales / Products / Revenue dataset
  if (colNames.some(c => c.includes('revenue') || c.includes('sales') || c.includes('amount') || c.includes('price'))) {
    const valCol = colNames.find(c => c.includes('revenue') || c.includes('sales') || c.includes('amount') || c.includes('price')) || "sales";
    const groupCol = textCols.find(c => !c.includes('id')) || "category";
    return [
      `Show top 10 records by ${valCol}`,
      `What is the average ${valCol} grouped by ${groupCol}?`,
      `List records where ${valCol} is above average`,
      `Show total ${valCol} per ${groupCol}`
    ];
  }

  // Generic fallback using dataset column names
  const numMetric = numCols.find(c => !c.endsWith('_id') && c !== 'id') || numCols[0];
  const catField = textCols.find(c => !c.includes('id') && !c.includes('date')) || textCols[0];

  const suggestions = [];
  if (numMetric && catField) {
    suggestions.push(`Show top 5 ${catField} by highest ${numMetric}`);
    suggestions.push(`What is the average ${numMetric} grouped by ${catField}?`);
    suggestions.push(`Count total records grouped by ${catField}`);
    suggestions.push(`List all ${tableName} records with ${numMetric} above average`);
  } else if (catField) {
    suggestions.push(`Show total count grouped by ${catField}`);
    suggestions.push(`List distinct values of ${catField}`);
    suggestions.push(`Show top 10 records from ${tableName}`);
    suggestions.push(`Filter ${tableName} by ${catField}`);
  } else if (numMetric) {
    suggestions.push(`Show top 10 records with highest ${numMetric}`);
    suggestions.push(`What is the average ${numMetric} across all records?`);
    suggestions.push(`Show maximum and minimum ${numMetric}`);
    suggestions.push(`List records where ${numMetric} is greater than 0`);
  } else {
    suggestions.push(`Show all records from ${tableName}`);
    suggestions.push(`Count total number of rows in ${tableName}`);
    suggestions.push(`Select first 10 rows from ${tableName}`);
    suggestions.push(`Summarize the dataset ${tableName}`);
  }

  return suggestions.slice(0, 4);
};

export const ChatView = () => {
  const {
    chatHistory,
    sendNaturalLanguageQuery,
    loading,
    statusMessage,
    activeDataset,
    uploadedFiles,
    selectedDatabase,
    schemaData,
    isReadyToQuery
  } = useApp();
  const [inputText, setInputText] = useState('');

  const suggestions = getDatasetSuggestions(schemaData, uploadedFiles);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading || !isReadyToQuery) return;
    sendNaturalLanguageQuery(inputText);
    setInputText('');
  };

  const handleSuggestionClick = (prompt) => {
    if (loading || !isReadyToQuery) return;
    sendNaturalLanguageQuery(prompt);
  };

  return (
    <div className="chat-container">
      {chatHistory.length === 0 ? (
        <div className="welcome-box">
          <div className="sparkle-icon-large">
            <Sparkles size={36} />
          </div>

          <div className="welcome-title">
            {isReadyToQuery
              ? "Ready to Query"
              : uploadedFiles.length > 0
              ? "Select Database Engine"
              : "Welcome to NL2QUERY"}
          </div>

          <div className="welcome-subtitle">
            {isReadyToQuery
              ? `Your data is loaded in ${selectedDatabase.toUpperCase()} Engine. Ask questions in plain English and I'll generate the query for you.`
              : uploadedFiles.length > 0
              ? "Dataset uploaded! Please select a database engine in the left sidebar to generate schema and query suggestions."
              : "Upload your CSV or Excel files to get started. Then select a database engine to explore schema & query data."}
          </div>

          {/* Show prompt suggestions ONLY after files are uploaded AND database selected */}
          {isReadyToQuery && suggestions.length > 0 && (
            <div className="suggestions-grid">
              {suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className="suggestion-card"
                  onClick={() => handleSuggestionClick(sug)}
                >
                  <ArrowRight size={16} className="suggestion-arrow" />
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '960px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {chatHistory.map((item) => {
            if (item.type === 'user') {
              return (
                <div
                  key={item.id}
                  style={{
                    alignSelf: 'flex-end',
                    background: '#008489',
                    border: '1px solid #00c6ff',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '20px 20px 4px 20px',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    maxWidth: '80%',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {item.text}
                </div>
              );
            } else if (item.type === 'bot') {
              return <QueryResultCard key={item.id} resultData={item.data} />;
            } else if (item.type === 'error') {
              return (
                <div
                  key={item.id}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    maxWidth: '80%'
                  }}
                >
                  ⚠️ {item.text}
                </div>
              );
            }
            return null;
          })}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#00f2fe', fontSize: '0.9rem', padding: '12px 0' }}>
              <Loader2 className="animate-spin" size={18} />
              <span>{statusMessage || "Processing request..."}</span>
            </div>
          )}
        </div>
      )}

      {/* Fixed Bottom Search Bar */}
      <div className="bottom-search-wrapper">
        <form className="search-input-box" onSubmit={handleSubmit}>
          <input
            type="text"
            className="input-field"
            placeholder={isReadyToQuery ? "Ask a question about your data..." : uploadedFiles.length > 0 ? "Select database engine to start querying..." : "Upload dataset files to start querying..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading || !isReadyToQuery}
          />
          <button type="submit" className="btn-send" disabled={loading || !inputText.trim() || !isReadyToQuery}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};
