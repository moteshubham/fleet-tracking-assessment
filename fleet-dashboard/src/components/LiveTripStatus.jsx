/**
 * Live Trip Status Table Component
 * Displays trips in a table format matching the design
 */

import { AlertTriangle, XCircle, Gauge, Fuel, Battery } from 'lucide-react';
import './LiveTripStatus.css';

export default function LiveTripStatus({ trips, tripStates, onTripClick }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="status-badge status-ongoing">Ongoing</span>;
      case 'completed':
        return <span className="status-badge status-finished">Finished</span>;
      case 'cancelled':
        return <span className="status-badge status-cancelled">Cancelled</span>;
      default:
        return <span className="status-badge status-pending">Pending</span>;
    }
  };

  const getProgressColor = (status) => {
    if (status === 'cancelled') return '#dc3545';
    if (status === 'active') return '#3b82f6';
    if (status === 'completed') return '#28a745';
    return '#92adc9';
  };

  const getAlertIcon = (tripState) => {
    if (!tripState?.alerts || tripState.alerts.length === 0) return null;
    
    const hasSevere = tripState.alerts.some(a => a.severity === 'severe');
    const hasWarning = tripState.alerts.some(a => a.severity === 'warning' || a.severity === 'moderate');
    
    if (hasSevere) {
      return <XCircle size={20} className="alert-icon severe" />;
    }
    if (hasWarning) {
      return <AlertTriangle size={20} className="alert-icon warning" />;
    }
    return null;
  };

  return (
    <div className="live-trip-status">
      <div className="table-header">
        <h2>Live Trip Status</h2>
      </div>
      <div className="table-container">
        <table className="trip-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Vehicle</th>
              <th>Destination</th>
              <th>Progress</th>
              <th>Speed</th>
              <th>Fuel</th>
              <th>Battery</th>
              <th className="text-center">Status</th>
              <th className="text-center">Alerts</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => {
              const state = tripStates[trip.tripId] || {};
              const progress = state.progress || 0;
              const status = state.status || 'pending';
              const alertIcon = getAlertIcon(state);
              
              return (
                <tr
                  key={trip.tripId}
                  className="table-row"
                  onClick={() => onTripClick && onTripClick(trip)}
                >
                  <td className="trip-id-cell">#{trip.tripId}</td>
                  <td className="vehicle-cell">{trip.vehicleId}</td>
                  <td className="destination-cell">
                    {state.plannedDistance 
                      ? `${state.distanceTravelled?.toFixed(0) || 0} / ${state.plannedDistance?.toFixed(0)} km`
                      : state.currentLocation 
                        ? `${state.currentLocation.lat?.toFixed(2) || 'N/A'}, ${state.currentLocation.lng?.toFixed(2) || 'N/A'}`
                        : 'Loading...'}
                  </td>
                  <td className="progress-cell">
                    <div className="progress-bar-wrapper">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: getProgressColor(status)
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="speed-cell">
                    <div className="metric-cell-content">
                      <Gauge size={14} className="metric-icon" />
                      <span>{state.currentSpeed?.toFixed(0) || 0} km/h</span>
                    </div>
                  </td>
                  <td className="fuel-cell">
                    {state.fuelLevel !== null && state.fuelLevel !== undefined && typeof state.fuelLevel === 'number' ? (
                      <div className="metric-cell-content">
                        <Fuel size={14} className="metric-icon" style={{ color: state.fuelLevel > 25 ? '#10b981' : state.fuelLevel > 15 ? '#f59e0b' : '#ef4444' }} />
                        <span style={{ color: state.fuelLevel > 25 ? '#10b981' : state.fuelLevel > 15 ? '#f59e0b' : '#ef4444' }}>
                          {state.fuelLevel.toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <span className="no-data">-</span>
                    )}
                  </td>
                  <td className="battery-cell">
                    {state.batteryLevel !== null && state.batteryLevel !== undefined && typeof state.batteryLevel === 'number' ? (
                      <div className="metric-cell-content">
                        <Battery size={14} className="metric-icon" style={{ color: state.batteryLevel > 50 ? '#10b981' : state.batteryLevel > 20 ? '#f59e0b' : '#ef4444' }} />
                        <span style={{ color: state.batteryLevel > 50 ? '#10b981' : state.batteryLevel > 20 ? '#f59e0b' : '#ef4444' }}>
                          {state.batteryLevel.toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <span className="no-data">-</span>
                    )}
                  </td>
                  <td className="status-cell text-center">
                    {getStatusBadge(status)}
                  </td>
                  <td className="alerts-cell text-center">
                    {alertIcon || <span>-</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

