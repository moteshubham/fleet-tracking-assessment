/**
 * Fleet Map Component
 * Displays all trips simultaneously on a single map
 */

import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import { useMemo, useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Navigation, Gauge, Fuel, Battery, Radio, AlertTriangle, MapPin, Moon, Sun } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './FleetMap.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Elegant color scheme for different trips
const TRIP_COLORS = [
  { color: '#60a5fa', name: 'Soft Blue' },      // Trip 1 - elegant blue
  { color: '#34d399', name: 'Mint Green' },      // Trip 2 - elegant green
  { color: '#fbbf24', name: 'Amber' },           // Trip 3 - elegant amber
  { color: '#f87171', name: 'Coral' },          // Trip 4 - elegant coral
  { color: '#a78bfa', name: 'Lavender' }         // Trip 5 - elegant purple
];

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

// Animated Marker Component for smooth transitions
function AnimatedMarker({ position, icon, children, eventHandlers }) {
  const markerRef = useRef(null);
  const prevPositionRef = useRef(position);

  useEffect(() => {
    if (markerRef.current && position && prevPositionRef.current) {
      const marker = markerRef.current;
      const prevPos = prevPositionRef.current;
      
      // Only animate if position actually changed
      if (prevPos[0] !== position[0] || prevPos[1] !== position[1]) {
        marker.setLatLng(position);
      }
    }
    prevPositionRef.current = position;
  }, [position]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
      eventHandlers={eventHandlers}
    >
      {children}
    </Marker>
  );
}

// Map controls component
function MapControls() {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleCenter = () => {
    const bounds = map.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <div className="map-controls">
      <button className="map-control-button" onClick={handleZoomIn} title="Zoom In">
        <ZoomIn size={20} />
      </button>
      <button className="map-control-button" onClick={handleZoomOut} title="Zoom Out">
        <ZoomOut size={20} />
      </button>
      <button className="map-center-button" onClick={handleCenter} title="Fit All Vehicles">
        <Navigation size={20} />
      </button>
    </div>
  );
}

// Map Theme Toggle Component
function MapThemeToggle({ isDarkTheme, onToggle }) {
  return (
    <div className="map-theme-toggle">
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

// Map Legend Component
function MapLegend({ trips, tripStates }) {
  const visibleTrips = trips.filter((trip, index) => {
    const state = tripStates[trip.tripId];
    return state?.currentLocation;
  });

  if (visibleTrips.length === 0) return null;

  return (
    <div className="map-legend">
      <div className="map-legend-header">
        <MapPin size={16} />
        <span>Active Trips</span>
      </div>
      <div className="map-legend-items">
        {visibleTrips.slice(0, 5).map((trip, index) => {
          const color = TRIP_COLORS[index % TRIP_COLORS.length].color;
          const state = tripStates[trip.tripId];
          return (
            <div key={trip.tripId} className="map-legend-item">
              <div 
                className="map-legend-color" 
                style={{ backgroundColor: color }}
              ></div>
              <div className="map-legend-info">
                <span className="map-legend-vehicle">{trip.vehicleId}</span>
                <span className="map-legend-progress">
                  {state?.progress?.toFixed(0) || 0}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FleetMap({ trips, tripStates, onTripClick }) {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  
  // Calculate map bounds to fit all trips
  const bounds = useMemo(() => {
    const locations = [];
    
    trips.forEach((trip, index) => {
      const state = tripStates[trip.tripId];
      if (state?.currentLocation) {
        const loc = state.currentLocation;
        if (loc.lat && loc.lng) {
          locations.push([loc.lat, loc.lng]);
        }
      }
    });

    if (locations.length === 0) {
      return [[40.7128, -74.0060], [40.7580, -73.9855]]; // Default NYC bounds
    }

    const lats = locations.map(loc => loc[0]);
    const lngs = locations.map(loc => loc[1]);
    
    return [
      [Math.min(...lats) - 0.5, Math.min(...lngs) - 0.5],
      [Math.max(...lats) + 0.5, Math.max(...lngs) + 0.5]
    ];
  }, [trips, tripStates]);

  const center = useMemo(() => {
    if (bounds) {
      return [
        (bounds[0][0] + bounds[1][0]) / 2,
        (bounds[0][1] + bounds[1][1]) / 2
      ];
    }
    return [40.7128, -74.0060];
  }, [bounds]);

  // Check if any trips have locations
  const hasAnyLocation = trips.some(trip => {
    const state = tripStates[trip.tripId];
    return state?.currentLocation;
  });

  // Use default center if no locations
  const mapCenter = hasAnyLocation ? center : [39.8283, -98.5795];
  const mapZoom = hasAnyLocation ? 5 : 4;

  return (
    <div className="fleet-map-container">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '480px', width: '100%' }}
        bounds={hasAnyLocation && bounds ? bounds : undefined}
        boundsOptions={hasAnyLocation ? { padding: [50, 50] } : undefined}
        key={`map-${hasAnyLocation}-${trips.length}`}
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
        
        <MapControls />
        <MapThemeToggle isDarkTheme={isDarkTheme} onToggle={() => setIsDarkTheme(!isDarkTheme)} />
        <MapLegend trips={trips} tripStates={tripStates} />
        
        {trips.map((trip, index) => {
          const state = tripStates[trip.tripId];
          if (!state?.currentLocation) return null;

          const location = state.currentLocation;
          const color = TRIP_COLORS[index % TRIP_COLORS.length].color;
          
          // Convert location to array format
          let locationArray = null;
          if (location.lat && location.lng) {
            locationArray = [location.lat, location.lng];
          } else if (Array.isArray(location)) {
            locationArray = location;
          }

          if (!locationArray) return null;

          return (
            <div key={trip.tripId}>
              {/* Route path */}
              {state.routePath && state.routePath.length > 0 && (
                <Polyline
                  positions={state.routePath}
                  color={color}
                  weight={3}
                  opacity={0.6}
                />
              )}

              {/* Current location marker */}
              <AnimatedMarker
                position={locationArray}
                icon={createTruckIcon(color, trip.vehicleId)}
                eventHandlers={{
                  click: () => onTripClick && onTripClick(trip)
                }}
              >
                <Tooltip permanent={false} direction="top" offset={[0, -10]}>
                  {trip.vehicleId}
                </Tooltip>
                <Popup>
                  <div className="map-popup">
                    <div className="map-popup-header" style={{ borderLeftColor: color }}>
                      <h3>{trip.vehicleId}</h3>
                      <span className="map-popup-trip-id">#{trip.tripId}</span>
                    </div>
                    
                    <div className="map-popup-metrics">
                      <div className="map-popup-metric">
                        <div className="map-popup-metric-label">
                          <Gauge size={14} />
                          <span>Speed</span>
                        </div>
                        <span className="map-popup-metric-value">
                          {state.currentSpeed?.toFixed(0) || 0} km/h
                        </span>
                      </div>
                      
                      <div className="map-popup-metric">
                        <div className="map-popup-metric-label">
                          <span>Progress</span>
                        </div>
                        <span className="map-popup-metric-value">
                          {state.progress?.toFixed(1) || 0}%
                        </span>
                      </div>
                      
                      {state.fuelLevel !== null && state.fuelLevel !== undefined && typeof state.fuelLevel === 'number' && (
                        <div className="map-popup-metric">
                          <div className="map-popup-metric-label">
                            <Fuel size={14} style={{ color: state.fuelLevel > 25 ? '#10b981' : state.fuelLevel > 15 ? '#f59e0b' : '#ef4444' }} />
                            <span>Fuel</span>
                          </div>
                          <span className="map-popup-metric-value" style={{ color: state.fuelLevel > 25 ? '#10b981' : state.fuelLevel > 15 ? '#f59e0b' : '#ef4444' }}>
                            {state.fuelLevel.toFixed(0)}%
                          </span>
                        </div>
                      )}
                      
                      {state.batteryLevel !== null && state.batteryLevel !== undefined && typeof state.batteryLevel === 'number' && (
                        <div className="map-popup-metric">
                          <div className="map-popup-metric-label">
                            <Battery size={14} style={{ color: state.batteryLevel > 50 ? '#10b981' : state.batteryLevel > 20 ? '#f59e0b' : '#ef4444' }} />
                            <span>Battery</span>
                          </div>
                          <span className="map-popup-metric-value" style={{ color: state.batteryLevel > 50 ? '#10b981' : state.batteryLevel > 20 ? '#f59e0b' : '#ef4444' }}>
                            {state.batteryLevel.toFixed(0)}%
                          </span>
                        </div>
                      )}
                      
                      {state.signalQuality && (
                        <div className="map-popup-metric">
                          <div className="map-popup-metric-label">
                            <Radio size={14} />
                            <span>Signal</span>
                          </div>
                          <span className="map-popup-metric-value">{state.signalQuality}</span>
                        </div>
                      )}
                    </div>
                    
                    {state.alerts && state.alerts.length > 0 && (
                      <div className="map-popup-alerts">
                        <AlertTriangle size={14} />
                        <span>{state.alerts.length} alert{state.alerts.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    
                    <button 
                      className="map-popup-button"
                      onClick={() => onTripClick && onTripClick(trip)}
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </AnimatedMarker>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
