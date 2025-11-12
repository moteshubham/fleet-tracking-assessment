/**
 * Trip Detail Component
 * Shows detailed view of a single trip with map and metrics
 */

import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import { useState } from 'react';
import { format } from 'date-fns';
import { 
  X, AlertTriangle, Clock, Circle, TrendingUp, MapPin, Route, 
  Gauge, Play, Square, Fuel, Battery, Radio, XCircle, Moon, Sun 
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './TripDetail.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Elegant color scheme for trips
const TRIP_COLORS = [
  { color: '#60a5fa', name: 'Soft Blue' },      // Trip 1 - elegant blue
  { color: '#34d399', name: 'Mint Green' },      // Trip 2 - elegant green
  { color: '#fbbf24', name: 'Amber' },           // Trip 3 - elegant amber
  { color: '#f87171', name: 'Coral' },          // Trip 4 - elegant coral
  { color: '#a78bfa', name: 'Lavender' }         // Trip 5 - elegant purple
];

// Trip Map Theme Toggle Component
function TripMapThemeToggle({ isDarkTheme, onToggle }) {
  return (
    <div className="trip-map-theme-toggle">
      <button 
        className="map-theme-button" 
        onClick={onToggle}
        title={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      >
        {isDarkTheme ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}

// Create solid truck icon with color
const createTruckIcon = (color, vehicleId) => {
  return L.divIcon({
    className: 'truck-marker',
    html: `
      <div class="truck-icon-wrapper" style="color: ${color};">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 3h15v13H1V3z" fill="currentColor"/>
          <path d="M16 6h4l2 4v6h-2V10l-1.5-3H16V6z" fill="currentColor"/>
          <circle cx="5" cy="19" r="2.5" fill="white" stroke="currentColor" stroke-width="1"/>
          <circle cx="19" cy="19" r="2.5" fill="white" stroke="currentColor" stroke-width="1"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });
};

export default function TripDetail({ trip, tripState, processedEvents, simulationTime, onClose, tripIndex = 0 }) {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const state = tripState || {};
  
  // Get color for this trip
  const tripColor = TRIP_COLORS[tripIndex % TRIP_COLORS.length].color;
  
  // Filter events for this trip and up to current simulation time
  const tripEvents = processedEvents.filter(e => {
    const isThisTrip = (e.tripId || e.trip_id) === trip.tripId;
    if (!isThisTrip) return false;
    
    // If simulation time is available, only show events up to that time
    if (simulationTime) {
      return new Date(e.timestamp) <= simulationTime;
    }
    return true;
  });

  // Get route path from state (already accumulated) or from events
  const routePath = state.routePath || tripEvents
    .filter(e => e.location && e.location.lat && e.location.lng)
    .map(e => [e.location.lat, e.location.lng]);

  // Convert currentLocation to array format if it's an object
  let currentLocation = null;
  if (state.currentLocation) {
    if (typeof state.currentLocation.lat === 'number' && typeof state.currentLocation.lng === 'number') {
      currentLocation = [state.currentLocation.lat, state.currentLocation.lng];
    } else if (Array.isArray(state.currentLocation) && 
               typeof state.currentLocation[0] === 'number' && 
               typeof state.currentLocation[1] === 'number') {
      currentLocation = state.currentLocation;
    }
  }
  
  if (!currentLocation && routePath.length > 0) {
    const lastPoint = routePath[routePath.length - 1];
    if (Array.isArray(lastPoint) && typeof lastPoint[0] === 'number' && typeof lastPoint[1] === 'number') {
      currentLocation = lastPoint;
    }
  }

  const center = currentLocation || [40.7128, -74.0060]; // Default to NYC

  // Get all alerts sorted by timestamp (newest first)
  const allAlerts = (state.alerts || []).sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA; // Newest first
  });

  return (
    <div className="trip-detail">
      <div className="trip-detail-header">
        <div>
          <h2>{trip.vehicleId} - Trip Details</h2>
          <p className="trip-id">{trip.tripId}</p>
        </div>
        <button onClick={onClose} className="btn-close">
          <X size={18} /> Close
        </button>
      </div>

      <div className="trip-detail-content">
        <div className="trip-detail-metrics">
          <div className="detail-metric">
            <div className="metric-left">
              <Circle size={16} className="metric-icon" />
              <label>Status</label>
            </div>
            <span className={`status-badge ${state.status || 'pending'}`}>
              {state.status || 'pending'}
            </span>
          </div>

          <div className="detail-metric">
            <div className="metric-left">
              <TrendingUp size={16} className="metric-icon" />
              <label>Progress</label>
            </div>
            <span>{state.progress?.toFixed(1) || 0}%</span>
          </div>

          <div className="detail-metric">
            <div className="metric-left">
              <MapPin size={16} className="metric-icon" />
              <label>Distance Travelled</label>
            </div>
            <span>{state.distanceTravelled?.toFixed(2) || 0} km</span>
          </div>

          <div className="detail-metric">
            <div className="metric-left">
              <Route size={16} className="metric-icon" />
              <label>Planned Distance</label>
            </div>
            <span>{state.plannedDistance?.toFixed(2) || 0} km</span>
          </div>

          <div className="detail-metric">
            <div className="metric-left">
              <Gauge size={16} className="metric-icon" />
              <label>Current Speed</label>
            </div>
            <span>{state.currentSpeed?.toFixed(1) || 0} km/h</span>
          </div>

          {state.startTime && (
            <div className="detail-metric">
              <div className="metric-left">
                <Play size={16} className="metric-icon" />
                <label>Start Time</label>
              </div>
              <span>{format(state.startTime, 'HH:mm:ss')}</span>
            </div>
          )}

          {state.endTime && (
            <div className="detail-metric">
              <div className="metric-left">
                <Square size={16} className="metric-icon" />
                <label>End Time</label>
              </div>
              <span>{format(state.endTime, 'HH:mm:ss')}</span>
            </div>
          )}

          {simulationTime && state.startTime && (
            <div className="detail-metric">
              <div className="metric-left">
                <Clock size={16} className="metric-icon" />
                <label>Current Time</label>
              </div>
              <span>{format(simulationTime, 'HH:mm:ss')}</span>
            </div>
          )}

          {state.fuelLevel !== null && state.fuelLevel !== undefined && typeof state.fuelLevel === 'number' && (
            <div className="detail-metric">
              <div className="metric-left">
                <Fuel size={16} className="metric-icon" />
                <label>Fuel Level</label>
              </div>
              <span>{state.fuelLevel.toFixed(1)}%</span>
            </div>
          )}

          {state.batteryLevel !== null && state.batteryLevel !== undefined && typeof state.batteryLevel === 'number' && (
            <div className="detail-metric">
              <div className="metric-left">
                <Battery size={16} className="metric-icon" />
                <label>Battery Level</label>
              </div>
              <span>{state.batteryLevel.toFixed(1)}%</span>
            </div>
          )}

          {state.signalQuality && (
            <div className="detail-metric">
              <div className="metric-left">
                <Radio size={16} className="metric-icon" />
                <label>Signal Quality</label>
              </div>
              <span>{state.signalQuality}</span>
            </div>
          )}

          {state.cancellationReason && (
            <div className="detail-metric">
              <div className="metric-left">
                <XCircle size={16} className="metric-icon" />
                <label>Cancellation Reason</label>
              </div>
              <span>{state.cancellationReason}</span>
            </div>
          )}
        </div>

        <div className="trip-detail-right">
          <div className="trip-detail-map">
            <MapContainer
              center={center}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                url={isDarkTheme 
                  ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
                attribution={isDarkTheme
                  ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }
                subdomains={isDarkTheme ? "abcd" : "abc"}
              />
              
              <TripMapThemeToggle isDarkTheme={isDarkTheme} onToggle={() => setIsDarkTheme(!isDarkTheme)} />
              
              {routePath.length > 0 && (
                <Polyline
                  positions={routePath}
                  color={tripColor}
                  weight={3}
                  opacity={0.6}
                />
              )}

            {currentLocation && Array.isArray(currentLocation) && 
             typeof currentLocation[0] === 'number' && typeof currentLocation[1] === 'number' && (
              <Marker position={currentLocation} icon={createTruckIcon(tripColor, trip.vehicleId)}>
                <Tooltip permanent={false} direction="top" offset={[0, -10]}>
                  {trip.vehicleId}
                </Tooltip>
                <Popup>
                  <div>
                    <strong>Current Location</strong><br />
                    {currentLocation[0].toFixed(4)}, {currentLocation[1].toFixed(4)}
                  </div>
                </Popup>
              </Marker>
            )}
            </MapContainer>
          </div>

          {allAlerts.length > 0 && (
            <div className="trip-alerts-detail">
              <h3>
                <AlertTriangle size={18} />
                Alerts & Events ({allAlerts.length})
              </h3>
              <div className="trip-alerts-list">
                {allAlerts.map((alert, index) => (
                  <div key={index} className={`trip-alert-item alert-${alert.severity || 'warning'}`}>
                    <div className="trip-alert-header">
                      <span className="trip-alert-type">{alert.type.replace(/_/g, ' ')}</span>
                      {alert.timestamp && (
                        <span className="trip-alert-time">
                          <Clock size={12} />
                          {format(new Date(alert.timestamp), 'HH:mm:ss')}
                        </span>
                      )}
                    </div>
                    <div className="trip-alert-message">{alert.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
