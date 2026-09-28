# Fulfillment Hub Dashboard

A full-stack, end-to-end operational dashboard designed for warehouse operators and fulfillment analysts. Built with an "Operations Analyst" framing, this application focuses on making exceptions visible and next actions obvious rather than just displaying raw data.

## 🌟 Features

- **Operations Dashboard**: Real-time overview of the fulfillment center, highlighting "At Risk" orders, inventory shortages, and urgent exceptions that need immediate attention.
- **Orders Center**: A comprehensive list of orders with a clear state machine workflow (`Received → Processing → Picking → Packing → Staged → Shipped`). Includes filtering by status, priority, and issues.
- **Order Details**: Deep dive into individual orders, view items, see shipping cutoff times, report issues, and advance workflow status with a single click.
- **Inventory Management**: Tracks stock across "Main" and "Overflow" warehouses. Includes visual indicators for low stock and a mock transfer capability to move items between warehouses.
- **Exceptions Tracker**: A dedicated operational issue tracker to move away from informal communication. Tracks courier delays, inventory mismatches, and incorrect variants.

## 🚀 Tech Stack

### Frontend
- **React 19**
- **Vite** (Build Tool)
- **Tailwind CSS v4** (Utility-first styling, using the new Vite integration)
- **React Router v7** (Client-side routing)
- **Axios** (Data fetching)
- **Lucide React** (Beautiful, consistent iconography)

### Backend
- **FastAPI** (High-performance Python web framework)
- **SQLite** (Lightweight embedded database)
- **SQLAlchemy** (ORM)
- **Pydantic** (Data validation and schemas)

---

## 🛠️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [Python](https://www.python.org/) (3.9 or newer)

### 1. Backend Setup
Navigate to the `backend` directory and set up the Python environment:

```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install "fastapi[standard]"
```

### 2. Seeding the Database
Before running the application, generate the mock data (Orders, Products, Inventory, and Exceptions):

```bash
# Ensure your virtual environment is still activated
python seed.py
```
*Note: This drops the existing tables and recreates them with ~50 mock orders and simulated inventory.*

### 3. Frontend Setup
Navigate to the `frontend` directory and install the Node modules:

```bash
cd frontend
npm install
```

---

## 🏃‍♂️ Running the Application

You will need to run the backend and frontend simultaneously in two different terminal windows.

### Start the Backend
```bash
cd backend
.\venv\Scripts\activate  # Ensure venv is active
uvicorn main:app --host 127.0.0.1 --port 8000
```
- The backend API will be running at: `http://localhost:8000/api`
- Auto-generated interactive API docs (Swagger): `http://localhost:8000/docs`

### Start the Frontend
```bash
cd frontend
npm run dev
```
- The frontend will be running at: `http://localhost:5173/`

---

## 📁 Project Structure

```
fulfillment-hub/
│
├── backend/
│   ├── database.py      # SQLite connection and session setup
│   ├── main.py          # FastAPI application & route definitions
│   ├── models.py        # SQLAlchemy database models
│   ├── schemas.py       # Pydantic validation schemas
│   ├── seed.py          # Data generation script
│   └── requirements.txt # Python dependencies
│
└── frontend/
    ├── vite.config.js   # Vite + Tailwind v4 configuration
    ├── package.json     # Node dependencies
    └── src/
        ├── App.jsx      # Main application, Sidebar, and Routing
        ├── index.css    # Global CSS and Tailwind import
        ├── api.js       # Axios API client setup
        └── components/  # React Components
            ├── Dashboard.jsx
            ├── Orders.jsx
            ├── OrderDetails.jsx
            ├── Inventory.jsx
            └── Exceptions.jsx
```

## 🔌 API Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Returns aggregated stats for the main dashboard views. |
| GET | `/api/orders` | Returns a list of all orders. Supports a `?status=` filter. |
| GET | `/api/orders/{id}` | Returns details of a specific order. |
| PUT | `/api/orders/{id}/status` | Updates the workflow status of an order. |
| GET | `/api/inventory` | Returns real-time stock levels across warehouses. |
| POST | `/api/inventory/transfer` | Simulates transferring stock from overflow to main. |
| GET | `/api/exceptions` | Returns the list of operational exceptions. |
| PUT | `/api/exceptions/{id}/resolve`| Marks an operational issue as resolved. |

## 🎨 Design Philosophy
The application was built emphasizing:
1. **Glassmorphism & Clean Typography**: Soft borders, rounded corners, and slate-based color palettes to make the UI feel native and premium.
2. **Action-Oriented Interfaces**: No dead ends. Orders have clear status progression buttons; Exceptions can be resolved in one click; Inventory can trigger transfers directly from the list.
