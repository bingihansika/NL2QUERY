import React, { useRef, useState } from 'react';
import { Database, UploadCloud, FileSpreadsheet, CheckCircle2, ChevronDown, ChevronRight, Hash, Type, Link2, BarChart2, Key } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = () => {
  const {
    selectedDatabase,
    setSelectedDatabase,
    uploadedFiles,
    schemaData,
    isReadyToQuery,
    handleFileUpload,
    setIsAnalyticsOpen,
    chatHistory
  } = useApp();

  const fileInputRef = useRef(null);
  const [expandedTables, setExpandedTables] = useState({});

  const toggleTable = (tableName) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: prev[tableName] === false ? true : false
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => handleFileUpload(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => handleFileUpload(file));
    }
  };

  const recentQueries = chatHistory
    .filter(msg => msg.type === 'user')
    .slice(-4)
    .reverse();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Database size={20} />
        </div>
        <div>
          <div className="sidebar-title">NL2QUERY</div>
          <div className="sidebar-subtitle">QUERY ENGINE</div>
        </div>
      </div>

      <div className="sidebar-content">
        {/* DATA SOURCES SECTION */}
        <div>
          <div className="section-label">
            <span>Data Sources</span>
            {uploadedFiles.length > 0 && (
              <span style={{ fontSize: '0.7rem', color: '#00f2fe' }}>
                {uploadedFiles.length} {uploadedFiles.length === 1 ? 'FILE SELECTED' : 'FILES SELECTED'}
              </span>
            )}
          </div>

          {/* DROPZONE */}
          <div
            className="upload-box"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".csv,.xlsx,.xls"
              multiple
              onChange={handleFileChange}
            />
            <div className="upload-icon-container">
              <UploadCloud size={24} />
            </div>
            <div className="upload-title">Drop your files here</div>
            <div className="upload-subtitle">CSV or Excel files supported</div>
            <button className="btn-browse" type="button">Browse Files</button>
          </div>

          {/* DATABASE SELECTION DROPDOWN - Clean Database List */}
          <div className="db-select-container">
            <label className="db-select-label">Select Database Engine:</label>
            <select
              className="db-select"
              value={selectedDatabase}
              onChange={(e) => setSelectedDatabase(e.target.value)}
            >
              <option value="">-- Select Database Engine --</option>
              <option value="mysql">MySQL Engine</option>
              <option value="postgresql">PostgreSQL Engine</option>
              <option value="mongodb">MongoDB</option>
              <option value="neo4j">Neo4j</option>
              <option value="sqlite">SQLite Engine</option>
            </select>
          </div>

          {/* UPLOADED FILE PILLS */}
          {uploadedFiles.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="file-pill">
                  <FileSpreadsheet size={16} className="file-pill-icon" />
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <div className="file-pill-name">{file.filename}</div>
                    <div className="file-pill-size">{file.row_count} rows</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* READY TO QUERY BADGE - Appears ONLY after selecting database & uploading dataset */}
          {isReadyToQuery && (
            <div className="ready-badge" style={{ marginTop: '12px' }}>
              <CheckCircle2 size={16} />
              <span>Ready to Query</span>
            </div>
          )}
        </div>

        {/* DETECTED JOINS SECTION */}
        {schemaData?.detected_joins?.length > 0 && (
          <div>
            <div className="section-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link2 size={14} /> DETECTED JOINS
              </span>
            </div>
            {schemaData.detected_joins.map((join, i) => (
              <div key={i} className="join-pill">
                <span>{join.table1}</span>
                <span style={{ opacity: 0.6 }}>({join.column})</span>
                <span>↔</span>
                <span>{join.table2}</span>
                <span style={{ opacity: 0.6 }}>({join.column})</span>
              </div>
            ))}
          </div>
        )}

        {/* SCHEMA EXPLORER SECTION - Matching Image 2 */}
        <div>
          <div className="section-label">
            <span>SCHEMA</span>
            <span style={{ fontSize: '0.68rem', cursor: 'pointer' }}>HIDE</span>
          </div>

          {schemaData?.tables?.length > 0 ? (
            <div className="schema-tree">
              {schemaData.tables.map((tbl, idx) => {
                const isExpanded = expandedTables[tbl.table_name] !== false;
                return (
                  <div key={idx} className="schema-table-card">
                    <div
                      className="schema-table-header"
                      onClick={() => toggleTable(tbl.table_name)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span className="schema-table-name">{tbl.table_name}</span>
                      </div>
                      <span className="schema-table-cols">{tbl.columns.length} columns</span>
                    </div>

                    {isExpanded && (
                      <div className="schema-col-list">
                        {tbl.columns.map((col, cIdx) => (
                          <div key={cIdx} className="schema-col-item">
                            <span className="schema-col-name" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              {col.primary_key ? (
                                <Key size={13} color="#f59e0b" title="Primary Key" />
                              ) : col.type?.includes('INT') || col.type?.includes('REAL') || col.type?.includes('FLOAT') ? (
                                <Hash size={13} color="#00f2fe" />
                              ) : (
                                <Type size={13} color="#94a3b8" />
                              )}
                              <span>{col.name}</span>
                              {col.primary_key && (
                                <span style={{
                                  fontSize: '0.62rem',
                                  background: 'rgba(245, 158, 11, 0.25)',
                                  color: '#f59e0b',
                                  padding: '1px 4px',
                                  borderRadius: '3px',
                                  fontWeight: '700',
                                  lineHeight: 1
                                }}>
                                  PK
                                </span>
                              )}
                            </span>
                            <span className="schema-col-type">{col.type}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '16px 0' }}>
              {uploadedFiles.length === 0
                ? "Upload files to view schema"
                : "Select a database engine to view schema"}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <button className="btn-analytics" onClick={() => setIsAnalyticsOpen(true)}>
          <BarChart2 size={18} color="#00f2fe" />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Analytics</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>View Insights</div>
          </div>
        </button>

        {recentQueries.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <div className="section-label">RECENT QUERIES</div>
            {recentQueries.map((rq, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: '0.78rem',
                  color: '#94a3b8',
                  padding: '4px 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: 'pointer'
                }}
              >
                {rq.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
