# MapUp - Fleet Tracking Dashboard

A real-time fleet tracking dashboard built with React, Vite, and Leaflet that visualizes and monitors multiple vehicle trips simultaneously. The dashboard processes 10,000+ events chronologically to simulate real-time fleet operations with interactive maps, detailed metrics, and comprehensive alert management.

## 🌐 Live Demo

**Live URL:** [www.xyz.vercel.app](https://www.xyz.vercel.app)

## 📋 Dashboard Description

The Fleet Tracking Dashboard provides fleet managers with a comprehensive real-time view of all vehicle operations. It processes and visualizes 5 simultaneous trips across the United States, displaying vehicle locations, trip progress, alerts, and fleet-wide metrics on an interactive map interface. The dashboard features a minimal, elegant dark theme design with smooth animations and responsive layouts.

## ✨ Key Features

### 🗺️ Interactive Mapping
- **Fleet Map View**: Simultaneous visualization of all 5 trips on a single map with color-coded routes
- **Individual Trip Maps**: Detailed view for each trip with complete route visualization
- **Dark/Light Theme Toggle**: Switch between CartoDB Dark Matter and OpenStreetMap tiles
- **Animated Markers**: Smooth vehicle position updates with custom truck icons
- **Map Legend**: Visual guide showing active trips with color swatches and progress indicators
- **Enhanced Popups**: Detailed vehicle information including fuel, battery, signal strength, and alerts
- **Hover Tooltips**: Quick vehicle identification on marker hover

### 📊 Real-time Simulation
- **Playback Controls**: Play, pause, reset, and fast forward functionality
- **Variable Speed Control**: Adjustable playback speeds (1x, 5x, 10x, 50x, 100x, 200x) with 200x as default
- **Fast Forward**: Skip ahead by 1 hour with automatic trip completion detection
- **Time-based Processing**: Chronological event processing based on timestamps
- **Progress Tracking**: Real-time simulation progress and time display

### 📈 Fleet Overview & Metrics
- **Key Metrics Cards**:
  - Total Distance Traveled (km)
  - Average Fleet Speed (km/h)
  - Critical Alerts Count
  - Average Progress of Active Trips
- **Recent Alerts Section**: 
  - Collapsible dropdown (closed by default)
  - Shows latest 3 alerts with scrollable list
  - Displays vehicle ID, alert type, timestamp, and severity
  - Color-coded by severity (warning, moderate, severe)
  - Always visible even when no alerts present

### 🚛 Live Trip Status Table
- **Comprehensive Trip Information**:
  - Trip ID and Vehicle ID
  - Destination/Progress
  - Current Speed (km/h)
  - Fuel Level (%)
  - Battery Level (%)
  - Trip Status (Ongoing, Finished, Cancelled, Pending)
  - Alert Indicators
- **Fixed Column Sizes**: Prevents table resizing as data updates
- **Color-coded Status**: Visual status indicators with blue for "Ongoing"
- **Clickable Rows**: Navigate to individual trip details

### 🔍 Search & Navigation
- **Smart Search Bar**: 
  - Search by Trip ID or Vehicle ID
  - Real-time filtering with dropdown results
  - Click to navigate directly to trip details
  - Clear button for quick reset
- **Sidebar Navigation**:
  - Fixed sidebar with company branding
  - Dashboard, Vehicles, Reports, Alerts, Settings links
  - "Coming Soon" notifications for future features
  - Responsive design with mobile-friendly collapsed view

### 📱 Individual Trip Details
- **Trip-Specific View**:
  - Dedicated route map with timeline filtering
  - Real-time metrics (speed, fuel, battery, signal)
  - Complete alert history with scrollable list
  - Trip timeline synchronized with simulation
- **Enhanced Metrics Display**:
  - Icon-based metric cards
  - Vertical stack layout
  - Color-coded indicators for fuel, battery, and signal levels
- **Alerts Panel**: 
  - Bottom-right positioned alerts section
  - Scrollable list for multiple alerts
  - Detailed alert information

### 🎨 User Interface
- **Modern Dark Theme**: Minimal, elegant design with consistent color palette
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Smooth Animations**: Fluid transitions and marker movements
- **Intuitive Icons**: Lucide React icons throughout the interface
- **Professional Typography**: Manrope font family for clean readability

### ⚡ Performance Optimizations
- **Efficient Event Processing**: Handles 10,000+ events with optimized state management
- **Memoization**: React.memo for component optimization
- **Debounced Calculations**: Periodic metric updates to reduce computational load
- **Lazy Loading**: Optimized data loading and rendering

## 🛠️ Technical Stack

- **Frontend Framework**: React 18 with Vite
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Maps**: React Leaflet with Leaflet
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Styling**: CSS Modules with component-specific stylesheets

## 🏗️ Architecture

### State Management
- **Zustand Store**: Centralized state for trips, events, simulation state, trip states, and fleet metrics
- **Event Processing**: Chronological event processing with timestamp-based simulation
- **Real-time Updates**: State updates triggered by simulation engine events

### Components Structure
- `App.jsx`: Main application with routing (Dashboard and Trip Detail pages)
- `FleetOverview`: Fleet-wide metrics and alerts
- `FleetMap`: Multi-trip map visualization
- `LiveTripStatus`: Tabular trip status display
- `TripDetail`: Individual trip detailed view
- `PlaybackControls`: Simulation playback controls
- `Sidebar`: Navigation sidebar with search

### Key Utilities
- `simulationEngine.js`: Real-time event processing engine with speed control
- `eventProcessor.js`: Trip data loading and event merging/sorting
- `fleetStore.js`: Zustand store for global state management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn

### Installation

```bash
cd fleet-dashboard
npm install
```

### Development

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
fleet-dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── FleetOverview.jsx
│   │   ├── FleetMap.jsx
│   │   ├── LiveTripStatus.jsx
│   │   ├── TripDetail.jsx
│   │   ├── PlaybackControls.jsx
│   │   ├── Sidebar.jsx
│   │   └── *.css           # Component-specific styles
│   ├── store/
│   │   └── fleetStore.js  # Zustand state management
│   ├── utils/
│   │   ├── simulationEngine.js
│   │   └── eventProcessor.js
│   ├── App.jsx
│   └── main.jsx
├── public/
│   └── data-generator/     # Trip data files
└── package.json
```

## 📊 Data Processing

The dashboard processes 5 simultaneous trips:
1. **Cross-Country Long Haul** - 10,000+ events
2. **Urban Dense Delivery** - 500+ events
3. **Mountain Route Cancelled** - 100+ events
4. **Southern Technical Issues** - 1,000+ events
5. **Regional Logistics** - 2,000+ events

All events are merged chronologically and processed in real-time based on their timestamps.

## 🎯 Key Implementation Highlights

- **Real-time Simulation**: Timestamp-based event processing with configurable playback speeds
- **Efficient State Management**: Zustand for lightweight, performant state updates
- **Map Integration**: React Leaflet with custom markers, routes, and interactive controls
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Performance**: Optimized for handling large datasets (10,000+ events)
- **User Experience**: Intuitive navigation, search functionality, and clear information hierarchy

## 📝 Notes

- The dashboard uses a simulation engine to process events based on their timestamps
- Default playback speed is set to 200x for faster visualization
- All alerts are tracked and displayed with severity levels
- Trip states are updated in real-time as events are processed
- The map theme can be toggled between dark and light modes

## 📚 Additional Resources

**📖 [FLEET_TRACKING_EVENT_TYPES.md](./FLEET_TRACKING_EVENT_TYPES.md)** - Complete reference for all 27 event types in the dataset

## 📄 License

This project is part of the MapUp Fleet Tracking Dashboard Assessment.

---

**Built with ❤️ for MapUp**
