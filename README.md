# NL2Query: AI-Assisted Natural Language Querying

> **Academic Final Year Project**  
> An AI-powered full-stack web application that empowers both technical and non-technical users to upload CSV/Excel datasets, choose a database engine (MySQL, PostgreSQL, MongoDB, Neo4j, or built-in SQLite), ask questions in plain English, automatically generate database-specific queries using **Google Gemini AI**, validate & execute queries, and view results through tables, visualizations, and factual AI summaries.

---

## 📋 Table of Contents
- [Overview & Objectives](#-overview--objectives)
- [Key Features](#-key-features)
- [Architecture & Data Flow](#-architecture--data-flow)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Installation & Prerequisites](#-installation--prerequisites)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [Database Setup & Driver Guide](#-database-setup--driver-guide)
- [API Documentation](#-api-documentation)
- [Sample Queries & Testing](#-sample-queries--testing)

---

## 🎯 Overview & Objectives

Traditional database querying requires expertise in SQL, MongoDB Aggregation pipelines, or Neo4j Cypher syntax. **NL2Query** bridges this gap by providing an intuitive conversational and visual analytics interface.

### Core Objectives:
1. **Multi-Database Support**: Execute queries against MySQL, PostgreSQL, MongoDB, Neo4j, and built-in SQLite out-of-the-box.
2. **Schema-Aware AI Query Generation**: Send actual schema metadata to Google Gemini AI to generate accurate database-native query syntax.
3. **Strict Query Sanitization & Validation**: Reject dangerous write operations (`DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, etc.) to ensure a read-only analytical workflow.
4. **Multi-Modal Output**: Present query results in interactive tables, Recharts visualizations (Bar, Line, Donut), and concise natural language AI summaries.
5. **Interactive Follow-Up Querying**: Retain dataset context across session chats for seamless query refinement.

---

## 🚀 Key Features

- **Dataset Upload & Ingestion**: Upload CSV, XLSX, or XLS files. Automatic column name cleaning, data type inference, missing value handling, and sample previews.
- **Database Selector**: Dynamically select database targets:
  - **SQLite** (Built-in instant execution, zero external setup required!)
  - **MySQL** (Relational table storage via SQLAlchemy)
  - **PostgreSQL** (Relational storage via SQLAlchemy)
  - **MongoDB** (NoSQL BSON document collection)
  - **Neo4j** (Graph nodes & properties via Neo4j Driver)
- **Automatic Join Detection**: Scans multi-table datasets for shared keys (`student_id`, `department`, etc.) and displays relationships in the sidebar.
- **Visual Analytics Dashboard Modal**: Overview cards displaying total rows, column counts, table metrics, null counts, distribution bar charts, proportion donut charts, and numerical trend line charts.
- **Interactive Result Tabs**: Switch between Data Table, Recharts Chart, and AI Natural Language Summary, plus 1-click CSV Export.

---

## 🏗️ Architecture & Data Flow

```
[ User Upload (CSV/Excel) ] 
         │
         ▼
[ Dataset Ingestion & Pandas Cleaning ]
         │
         ▼
[ Selected Database Manager (SQLite / MySQL / Postgres / Mongo / Neo4j) ]
         │
         ▼
[ Schema Extraction & Join Detector ]
         │
         ▼
[ Natural Language Question + Schema + DB Type ] ──► [ Google Gemini AI ]
                                                              │
                                                              ▼
                                                   [ Generated Query String ]
                                                              │
                                                              ▼
                                                   [ Query Sanitizer & Validator ]
                                                              │ (Valid Read-Only)
                                                              ▼
                                                   [ Database Execution Layer ]
                                                              │
                                                              ▼
[ Results Table ]  ◄───  [ Result Formatter ]  ───►  [ Recharts Visualization ]
                                   │
                                   ▼
                       [ Gemini AI Summary Generator ]
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js (Bootstrapped with Vite)
- **Language**: JavaScript (ES6+)
- **Styling**: Modern CSS Design System with Dark Slate & Cyan Glow Aesthetics (`#00f2fe`)
- **Icons**: Lucide React
- **Charting**: Recharts
- **HTTP Client**: Axios

### Backend
- **Framework**: Python 3.10+ & FastAPI
- **Data Processing**: Pandas, OpenPyXL
- **Validation & Models**: Pydantic v2
- **AI Integration**: Google Gemini API (`gemini-2.5-flash`)
- **Database Libraries**:
  - SQLite3 (Python Built-in)
  - SQLAlchemy & PyMySQL (MySQL)
  - SQLAlchemy & Psycopg2 (PostgreSQL)
  - PyMongo (MongoDB)
  - Neo4j Python Driver (Neo4j)

---

## 📁 Project Directory Structure

```
NL2QUERY/
├── backend/
│   ├── app/
│   │   ├── api/             # REST API Endpoints (Upload, Schema, Query, Analytics)
│   │   ├── db/              # Database Abstraction Managers & Factory
│   │   ├── models/          # Pydantic Request/Response Schemas
│   │   ├── services/        # Dataset, Schema, Gemini, Validation, & Summary Services
│   │   ├── config.py        # Environment Configuration
│   │   └── main.py          # FastAPI Main Entry Point
│   ├── sample_data/         # Preloaded Sample CSV Datasets (employees.csv, placements.csv, student.csv)
│   ├── tests/               # Automated Unit Tests
│   ├── requirements.txt     # Python Dependencies
│   ├── .env                 # Environment Variables with Gemini Key
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Sidebar, Header, ChatView, QueryResultCard, AnalyticsModal, etc.
│   │   ├── context/         # AppContext Global State Manager
│   │   ├── services/        # Axios API Client
│   │   ├── App.jsx          # Main App Component
│   │   └── index.css        # UI Styling & Design Tokens
│   ├── package.json
│   └── vite.config.js
├── run_app.bat              # 1-Click Launch Script
└── README.md                # Project Documentation
```

---

## ⚡ Installation & Prerequisites

### Prerequisites
- **Python 3.10+**
- **Node.js v18+ & NPM**

### 1. Setup Backend
```bash
cd backend
python -m pip install -r requirements.txt
```

### 2. Setup Frontend
```bash
cd frontend
npm install
```

---

## 🔑 Environment Configuration

Create a `.env` file inside `backend/` with your Gemini API Key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Optional External Database Credentials
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=nl2query_db

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=nl2query_db

MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=nl2query_db

NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
```

---

## 🚀 Running the Application

### Option A: Quick 1-Click Launch (Windows)
Double-click `run_app.bat` or run:
```cmd
.\run_app.bat
```

### Option B: Manual Launch

1. **Start Backend (FastAPI)**:
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
*Backend runs on:* `http://localhost:8000`

2. **Start Frontend (Vite + React)**:
```bash
cd frontend
npm run dev
```
*Frontend runs on:* `http://localhost:3000`

---

## 📡 API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload CSV/Excel dataset file |
| `POST` | `/api/dataset/import` | Import dataset into target database engine |
| `GET` | `/api/schema` | Retrieve table schema & detected relationships |
| `POST` | `/api/query` | Complete NL2Query pipeline (Gemini -> Execute -> Summarize) |
| `GET` | `/api/analytics` | Fetch metrics and charts for Analytics Dashboard |
| `GET` | `/api/health` | Backend status check |

---

## 🧪 Sample Queries & Testing

### Test Questions (using preloaded `employees.csv` or `placements.csv`):
1. **Aggregation Query**: "What is the average salary by department?"
2. **Filtering Query**: "Show employees with salary greater than 70000."
3. **Top-N Query**: "Show the top 5 highest-paid employees."
4. **Counting Query**: "How many employees are in the IT department?"
5. **Follow-Up Query**: "Which department has the highest average salary?"

---

## 📜 License & Academic Usage
This project is built for academic demonstration, research, and project reviews.
