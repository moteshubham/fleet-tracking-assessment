/**
 * Trip Card Component
 * Displays individual trip information and status
 */

import { memo } from 'react';
import { format } from 'date-fns';
import { 
  Circle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Fuel, 
  Battery, 
  Radio, 
  MapPin, 
  Calendar,
  AlertTriangle
} from 'lucide-react';
import './TripCard.css';

function TripCard({ trip, tripState, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Circle size={20} className="text-green-500" fill="currentColor" />;
      case 'completed': return <CheckCircle2 size={20} className="text-cyan-500" fill="currentColor" />;
      case 'cancelled': return <XCircle size={20} className="text-red-500" fill="currentColor" />;
      default: return <Clock size={20} className="text-gray-400" />;
    }
  };

  const state = tripState || { status: 'pending', progress: 0 };
  const alerts = state.alerts || [];
  
  // Get signal quality indicator
  const getSignalIcon = (quality) => {
    if (!quality) return <Radio size={18} className="text-gray-400" />;
    const q = quality.toLowerCase();
    if (q === 'excellent' || q === 'good') return <Radio size={18} className="text-green-500" />;
    if (q === 'fair') return <Radio size={18} className="text-amber-500" />;
    return <Radio size={18} className="text-red-500" />;
  };

  const getSignalColor = (quality) => {
    if (!quality) return '#9ca3af';
    const q = quality.toLowerCase();
    if (q === 'excellent') return '#10b981';
    if (q === 'good') return '#3b82f6';
    if (q === 'fair') return '#f59e0b';
    return '#ef4444';
  };

  const getFuelColor = (level) => {
    if (level === null || level === undefined || typeof level !== 'number') return '#9ca3af';
    if (level > 50) return '#10b981';
    if (level > 25) return '#f59e0b';
    return '#ef4444';
  };

  const getBatteryColor = (level) => {
    if (level === null || level === undefined || typeof level !== 'number') return '#9ca3af';
    if (level > 50) return '#10b981';
    if (level > 20) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="trip-card" onClick={onClick}>
      <div className="trip-header">
        <div className="trip-title">
          <span className="trip-icon">{getStatusIcon(state.status)}</span>
          <div>
            <h3>{trip.vehicleId}</h3>
            <p className="trip-id">{trip.tripId}</p>
          </div>
        </div>
        <div className={`status-badge ${getStatusColor(state.status)}`}>
          {state.status || 'pending'}
        </div>
      </div>

      <div className="trip-progress">
        <div className="progress-info">
          <span>Progress</span>
          <span>{state.progress?.toFixed(1) || 0}%</span>
        </div>
        <div className="progress-bar-small">
          <div
            className="progress-fill-small"
            style={{ width: `${state.progress || 0}%` }}
          ></div>
        </div>
      </div>

      <div className="trip-metrics">
        <div className="metric-item">
          <span className="metric-label">Distance</span>
          <span className="metric-value">
            {state.distanceTravelled?.toFixed(1) || 0} / {state.plannedDistance?.toFixed(1) || 0} km
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Speed</span>
          <span className="metric-value">{state.currentSpeed?.toFixed(0) || 0} km/h</span>
        </div>
      </div>

      <div className="trip-status-indicators">
        {state.fuelLevel !== null && state.fuelLevel !== undefined && typeof state.fuelLevel === 'number' && (
          <div className="status-indicator">
            <Fuel size={18} style={{ color: getFuelColor(state.fuelLevel) }} />
            <span className="indicator-label">Fuel</span>
            <span 
              className="indicator-value"
              style={{ color: getFuelColor(state.fuelLevel) }}
            >
              {state.fuelLevel.toFixed(0)}%
            </span>
          </div>
        )}
        
        {state.batteryLevel !== null && state.batteryLevel !== undefined && typeof state.batteryLevel === 'number' && (
          <div className="status-indicator">
            <Battery size={18} style={{ color: getBatteryColor(state.batteryLevel) }} />
            <span className="indicator-label">Battery</span>
            <span 
              className="indicator-value"
              style={{ color: getBatteryColor(state.batteryLevel) }}
            >
              {state.batteryLevel.toFixed(0)}%
            </span>
          </div>
        )}

        {state.signalQuality && (
          <div className="status-indicator">
            {getSignalIcon(state.signalQuality)}
            <span className="indicator-label">Signal</span>
            <span 
              className="indicator-value"
              style={{ color: getSignalColor(state.signalQuality) }}
            >
              {state.signalQuality}
            </span>
          </div>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="trip-alerts-detailed">
          <div className="alert-header">
            <span className="alert-count">
              <AlertTriangle size={16} /> {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="alert-types">
            {alerts.slice(-3).map((alert, idx) => (
              <span 
                key={idx} 
                className={`alert-badge alert-${alert.severity || 'warning'}`}
                title={alert.message}
              >
                {alert.type.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {state.currentLocation && (
        <div className="trip-location">
          <MapPin size={14} />
          <span>
            {(typeof state.currentLocation.lat === 'number' ? state.currentLocation.lat.toFixed(4) : 'N/A')
          }, {
            (typeof state.currentLocation.lng === 'number' ? state.currentLocation.lng.toFixed(4) : 'N/A')
          }</span>
        </div>
      )}

      {state.startTime && (
        <div className="trip-time">
          <Calendar size={14} />
          <span>Started: {format(state.startTime, 'HH:mm:ss')}</span>
        </div>
      )}
    </div>
  );
}

export default memo(TripCard);
