/**
 * Fleet Overview Component
 * Displays collective fleet metrics and insights
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { Truck, ChevronDown, ChevronUp } from 'lucide-react';
import './FleetOverview.css';

export default function FleetOverview({ metrics, trips, tripStates }) {
  const [showAlerts, setShowAlerts] = useState(false);
  const getTripStatusCount = (status) => {
    return Object.values(tripStates).filter(ts => ts.status === status).length;
  };

  const getTripsByProgress = (minProgress) => {
    return Object.values(tripStates).filter(
      ts => ts.progress >= minProgress && ts.status === 'active'
    ).length;
  };

  const totalTrips = metrics.totalTrips || trips.length;
  const activeTrips = getTripStatusCount('active');
  const completedTrips = getTripStatusCount('completed');
  const completedPercentage = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0;

  // Calculate better insights
  const totalDistance = (metrics.totalDistance || 0).toFixed(1);
  const averageSpeed = (metrics.averageSpeed || 0).toFixed(1);
  
  // Calculate average progress of active trips
  const activeTripStates = Object.values(tripStates).filter(ts => ts.status === 'active');
  const avgProgress = activeTripStates.length > 0
    ? Math.round(activeTripStates.reduce((sum, ts) => sum + (ts.progress || 0), 0) / activeTripStates.length)
    : 0;

  // Count critical alerts (severe)
  const criticalAlerts = metrics.alerts.filter(a => a.severity === 'severe').length;

  return (
    <div className="fleet-overview">
      <div className="metrics-grid">
        <div className="metric-card active">
          <div className="metric-label">Total Distance</div>
          <div className="metric-value">{totalDistance}</div>
          <div className="metric-insight">km traveled</div>
        </div>

        <div className="metric-card completed">
          <div className="metric-label">Average Speed</div>
          <div className="metric-value">{averageSpeed}</div>
          <div className="metric-insight">km/h fleet avg</div>
        </div>

        <div className="metric-card alerts">
          <div className="metric-label">Critical Alerts</div>
          <div className="metric-value">{criticalAlerts}</div>
          <div className="metric-insight">{metrics.alerts.length} total alerts</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Avg Progress</div>
          <div className="metric-value">{avgProgress}%</div>
          <div className="metric-insight">{activeTrips} active trips</div>
        </div>
      </div>

      <div className="alerts-section">
        <div className="alerts-header" onClick={() => setShowAlerts(!showAlerts)}>
          <h3>Recent Alerts ({metrics.alerts.length})</h3>
          <button className="alerts-toggle-btn" aria-label={showAlerts ? 'Hide alerts' : 'Show alerts'}>
            {showAlerts ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        {showAlerts && (
          <div className="alerts-list">
            {metrics.alerts.length > 0 ? (
              metrics.alerts.slice().reverse().map((alert, index) => (
                <div key={index} className={`alert-item alert-${alert.severity || 'warning'}`}>
                  <div className="alert-header-info">
                    {alert.vehicleId && (
                      <span className="alert-vehicle">
                        <Truck size={12} />
                        {alert.vehicleId}
                      </span>
                    )}
                    <span className="alert-type">{alert.type.replace(/_/g, ' ')}</span>
                    {alert.timestamp && (
                      <span className="alert-time">
                        {format(new Date(alert.timestamp), 'HH:mm:ss')}
                      </span>
                    )}
                  </div>
                  <div className="alert-message">{alert.message}</div>
                </div>
              ))
            ) : (
              <div className="alerts-empty">
                <span>No alerts at this time</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
