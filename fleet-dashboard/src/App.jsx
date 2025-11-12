/**
 * Main App Component
 * Orchestrates the fleet tracking dashboard
 */

import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useFleetStore } from './store/fleetStore';
import { loadTripData, mergeAndSortEvents } from './utils/eventProcessor';
import { SimulationEngine } from './utils/simulationEngine';
import Sidebar from './components/Sidebar';
import PlaybackControls from './components/PlaybackControls';
import FleetOverview from './components/FleetOverview';
import FleetMap from './components/FleetMap';
import LiveTripStatus from './components/LiveTripStatus';
import TripCard from './components/TripCard';
import TripDetail from './components/TripDetail';
import './App.css';

// Dashboard Component
function Dashboard() {
  const {
    trips,
    events,
    simulationTime,
    simulationProgress,
    isPlaying,
    playbackSpeed,
    tripStates,
    fleetMetrics,
    setTrips,
    setEvents,
    resetAllState,
    updateSimulationTime,
    setPlaying,
    setPlaybackSpeed,
    processEvent,
    calculateFleetMetrics
  } = useFleetStore();

  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const simulationRef = useRef(null);

  const handleTripClick = (trip) => {
    navigate(`/trip/${trip.tripId}`);
  };

  // Load trip data on mount
  useEffect(() => {
    async function initialize() {
      try {
        setLoading(true);
        const loadedTrips = await loadTripData();
        setTrips(loadedTrips);
        
        const mergedEvents = mergeAndSortEvents(loadedTrips);
        setEvents(mergedEvents);
        
        setError(null);
      } catch (err) {
        console.error('Error loading trip data:', err);
        setError('Failed to load trip data. Please check the data files.');
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, [setTrips, setEvents]);

  // Initialize simulation engine when events are loaded
  useEffect(() => {
    if (events.length === 0) return;

    let eventCount = 0;

    // Create simulation engine with initial speed
    const engine = new SimulationEngine(
      events,
      (event) => {
        // Process each event as it's simulated
        processEvent(event);
        eventCount++;
        // Recalculate fleet metrics periodically (every 50 events for better performance)
        if (eventCount % 50 === 0) {
          calculateFleetMetrics();
        }
      },
      (time, progress) => {
        // Update simulation time and progress
        updateSimulationTime(time, progress);
      },
      playbackSpeed // Pass initial speed
    );

    simulationRef.current = engine;

    // Cleanup on unmount
    return () => {
      if (simulationRef.current) {
        simulationRef.current.pause();
      }
    };
  }, [events, processEvent, updateSimulationTime, calculateFleetMetrics, playbackSpeed]);

  // Sync simulation state with store
  useEffect(() => {
    if (simulationRef.current) {
      if (isPlaying && !simulationRef.current.isPlaying) {
        simulationRef.current.play();
      } else if (!isPlaying && simulationRef.current.isPlaying) {
        simulationRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (simulationRef.current && simulationRef.current.speed !== playbackSpeed) {
      simulationRef.current.setSpeed(playbackSpeed);
    }
  }, [playbackSpeed]);

  // Recalculate metrics when trip states change (debounced)
  useEffect(() => {
    if (Object.keys(tripStates).length > 0) {
      const timeoutId = setTimeout(() => {
        calculateFleetMetrics();
      }, 500); // Debounce to avoid excessive recalculations
      
      return () => clearTimeout(timeoutId);
    }
  }, [tripStates, calculateFleetMetrics]);

  const handlePlay = () => {
    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  const handleReset = () => {
    if (simulationRef.current) {
      simulationRef.current.reset();
      resetAllState();
      setPlaying(false);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

  const handleFastForward = () => {
    if (simulationRef.current) {
      simulationRef.current.fastForward();
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading fleet tracking data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-container">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        
        <main className="main-content">
          <div className="app-content">
            <div className="app-header">
              <div className="header-title">
                <h1>Dashboard</h1>
                <p>Real-time overview of all fleet operations.</p>
              </div>
              <PlaybackControls
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onPause={handlePause}
                onReset={handleReset}
                onFastForward={handleFastForward}
                speed={playbackSpeed}
                onSpeedChange={handleSpeedChange}
                simulationTime={simulationTime}
                progress={simulationProgress}
              />
            </div>

            <FleetOverview
              metrics={fleetMetrics}
              trips={trips}
              tripStates={tripStates}
            />

            <div className="fleet-map-section">
              <FleetMap
                trips={trips}
                tripStates={tripStates}
                onTripClick={handleTripClick}
              />
            </div>

            <LiveTripStatus
              trips={trips}
              tripStates={tripStates}
              onTripClick={handleTripClick}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

// Trip Detail Page Component
function TripDetailPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const {
    trips,
    tripStates,
    events,
    processedEvents: allProcessedEvents,
    simulationTime: simTime,
    setTrips,
    setEvents,
    resetAllState,
    updateSimulationTime,
    setPlaying,
    setPlaybackSpeed,
    processEvent,
    calculateFleetMetrics,
    isPlaying,
    playbackSpeed,
    simulationProgress
  } = useFleetStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const simulationRef = useRef(null);

  // Find the trip by ID
  const trip = trips.find(t => t.tripId === tripId);

  // Load trip data on mount if not loaded
  useEffect(() => {
    async function initialize() {
      if (trips.length === 0) {
        try {
          setLoading(true);
          const loadedTrips = await loadTripData();
          setTrips(loadedTrips);
          
          const mergedEvents = mergeAndSortEvents(loadedTrips);
          setEvents(mergedEvents);
          
          setError(null);
        } catch (err) {
          console.error('Error loading trip data:', err);
          setError('Failed to load trip data. Please check the data files.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    initialize();
  }, [trips.length, setTrips, setEvents]);

  // Initialize simulation engine when events are loaded
  useEffect(() => {
    if (events.length === 0) return;

    let eventCount = 0;

    const engine = new SimulationEngine(
      events,
      (event) => {
        processEvent(event);
        eventCount++;
        if (eventCount % 50 === 0) {
          calculateFleetMetrics();
        }
      },
      (time, progress) => {
        updateSimulationTime(time, progress);
      },
      playbackSpeed // Pass initial speed
    );

    simulationRef.current = engine;

    return () => {
      if (simulationRef.current) {
        simulationRef.current.pause();
      }
    };
  }, [events, processEvent, updateSimulationTime, calculateFleetMetrics, playbackSpeed]);

  // Sync simulation state
  useEffect(() => {
    if (simulationRef.current) {
      if (isPlaying && !simulationRef.current.isPlaying) {
        simulationRef.current.play();
      } else if (!isPlaying && simulationRef.current.isPlaying) {
        simulationRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (simulationRef.current && simulationRef.current.speed !== playbackSpeed) {
      simulationRef.current.setSpeed(playbackSpeed);
    }
  }, [playbackSpeed]);

  const handlePlay = () => {
    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  const handleReset = () => {
    if (simulationRef.current) {
      simulationRef.current.reset();
      resetAllState();
      setPlaying(false);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

  const handleFastForward = () => {
    if (simulationRef.current) {
      simulationRef.current.fastForward();
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading trip data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="app-error">
        <h2>Trip Not Found</h2>
        <p>The trip you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-container">
        <Sidebar activeView="dashboard" onViewChange={() => navigate('/dashboard')} />
        
        <main className="main-content">
          <div className="app-content">
            <div className="app-header">
              <div className="header-title">
                <h1>Trip Details</h1>
                <p>Detailed view of trip {trip.tripId}.</p>
              </div>
              <PlaybackControls
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onPause={handlePause}
                onReset={handleReset}
                onFastForward={handleFastForward}
                speed={playbackSpeed}
                onSpeedChange={handleSpeedChange}
                simulationTime={simTime}
                progress={simulationProgress}
              />
            </div>

            <TripDetail
              trip={trip}
              tripState={tripStates[trip.tripId]}
              processedEvents={allProcessedEvents}
              simulationTime={simTime}
              onClose={() => navigate('/dashboard')}
              tripIndex={trips.findIndex(t => t.tripId === trip.tripId)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

// Main App Component with Routes
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/trip/:tripId" element={<TripDetailPage />} />
    </Routes>
  );
}

export default App;
