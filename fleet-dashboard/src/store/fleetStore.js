/**
 * Fleet Tracking State Management
 * Uses Zustand for lightweight state management
 */

import { create } from 'zustand';

export const useFleetStore = create((set, get) => ({
  // Trip data
  trips: [],
  events: [],
  processedEvents: [], // Events processed so far in simulation
  
  // Simulation state
  simulationTime: null,
  simulationProgress: 0,
  isPlaying: false,
  playbackSpeed: 200,
  
  // Trip states (tracked per trip)
  tripStates: {}, // { tripId: { status, progress, currentLocation, etc. } }
  
  // Fleet metrics
  fleetMetrics: {
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    totalDistance: 0,
    averageSpeed: 0,
    alerts: []
  },

  // Actions
  setTrips: (trips) => set({ trips }),
  
  setEvents: (events) => set({ events }),
  
  addProcessedEvent: (event) => set((state) => {
    const newProcessedEvents = [...state.processedEvents, event];
    return { processedEvents: newProcessedEvents };
  }),
  
  resetProcessedEvents: () => set({ processedEvents: [] }),
  
  resetAllState: () => set({
    processedEvents: [],
    tripStates: {},
    simulationTime: null,
    simulationProgress: 0,
    isPlaying: false,
    playbackSpeed: 200,
    fleetMetrics: {
      totalTrips: 0,
      activeTrips: 0,
      completedTrips: 0,
      cancelledTrips: 0,
      totalDistance: 0,
      averageSpeed: 0,
      alerts: []
    }
  }),
  
  updateSimulationTime: (time, progress) => set({ 
    simulationTime: time, 
    simulationProgress: progress 
  }),
  
  setPlaying: (isPlaying) => set({ isPlaying }),
  
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  
  /**
   * Update trip state based on processed events
   */
  updateTripState: (tripId, updates) => set((state) => {
    const currentState = state.tripStates[tripId] || {};
    return {
      tripStates: {
        ...state.tripStates,
        [tripId]: {
          ...currentState,
          ...updates
        }
      }
    };
  }),

  /**
   * Process an event and update relevant state
   */
  processEvent: (event) => {
    const state = get();
    const tripId = event.tripId || event.trip_id;
    const vehicleId = event.vehicleId || event.vehicle_id;
    
    // Add to processed events
    state.addProcessedEvent(event);
    
    // Update trip state based on event type
    const tripState = state.tripStates[tripId] || {
      status: 'pending',
      progress: 0,
      distanceTravelled: 0,
      plannedDistance: 0,
      currentLocation: null,
      currentSpeed: 0,
      alerts: [],
      startTime: null,
      endTime: null,
      fuelLevel: null,
      batteryLevel: null,
      signalQuality: null,
      routePath: []
    };

    switch (event.event_type) {
      case 'trip_started':
        state.updateTripState(tripId, {
          status: 'active',
          startTime: new Date(event.timestamp),
          plannedDistance: event.planned_distance_km || 0,
          currentLocation: event.location
        });
        break;

      case 'trip_completed':
        state.updateTripState(tripId, {
          status: 'completed',
          endTime: new Date(event.timestamp),
          distanceTravelled: event.total_distance_km || 0,
          currentLocation: event.location,
          progress: 100
        });
        break;

      case 'trip_cancelled':
        state.updateTripState(tripId, {
          status: 'cancelled',
          endTime: new Date(event.timestamp),
          distanceTravelled: event.distance_completed_km || 0,
          currentLocation: event.location,
          cancellationReason: event.cancellation_reason
        });
        break;

      case 'location_ping':
      case 'vehicle_telemetry':
        if (event.location) {
          const updates = {
            currentLocation: event.location,
            currentSpeed: event.movement?.speed_kmh || 0,
            distanceTravelled: event.distance_travelled_km || tripState.distanceTravelled,
            signalQuality: event.signal_quality || tripState.signalQuality,
            batteryLevel: event.device?.battery_level || tripState.batteryLevel
          };

          // Add location to route path
          const routePath = [...(tripState.routePath || [])];
          routePath.push([event.location.lat, event.location.lng]);
          updates.routePath = routePath;

          // Update fuel level from telemetry
          if (event.event_type === 'vehicle_telemetry' && event.telemetry) {
            updates.fuelLevel = event.telemetry.fuel_level_percent;
          }

          state.updateTripState(tripId, updates);
          
          // Update progress if we have planned distance
          const newDistance = event.distance_travelled_km || tripState.distanceTravelled;
          if (tripState.plannedDistance > 0) {
            const progress = (newDistance / tripState.plannedDistance) * 100;
            state.updateTripState(tripId, { progress: Math.min(progress, 100) });
          }
        }
        break;

      case 'speed_violation':
        const alerts = [...(tripState.alerts || [])];
        alerts.push({
          type: 'speed_violation',
          timestamp: event.timestamp,
          severity: event.severity || 'moderate',
          message: `Speed violation: ${event.violation_amount_kmh} km/h over limit`,
          vehicleId: vehicleId,
          tripId: tripId
        });
        state.updateTripState(tripId, { alerts });
        break;

      case 'device_error':
        const errorAlerts = [...(tripState.alerts || [])];
        errorAlerts.push({
          type: 'device_error',
          timestamp: event.timestamp,
          severity: event.severity || 'warning',
          message: event.error_message || 'Device error detected',
          vehicleId: vehicleId,
          tripId: tripId
        });
        state.updateTripState(tripId, { alerts: errorAlerts });
        break;

      case 'fuel_level_low':
        const fuelAlerts = [...(tripState.alerts || [])];
        fuelAlerts.push({
          type: 'fuel_low',
          timestamp: event.timestamp,
          severity: 'warning',
          message: `Low fuel: ${event.fuel_level_percent}% remaining`,
          vehicleId: vehicleId,
          tripId: tripId
        });
        state.updateTripState(tripId, { 
          alerts: fuelAlerts,
          fuelLevel: event.fuel_level_percent 
        });
        break;

      case 'refueling_completed':
        state.updateTripState(tripId, {
          fuelLevel: event.fuel_level_after_refuel || tripState.fuelLevel
        });
        break;

      case 'battery_low':
        const batteryAlerts = [...(tripState.alerts || [])];
        batteryAlerts.push({
          type: 'battery_low',
          timestamp: event.timestamp,
          severity: 'warning',
          message: `Low battery: ${event.battery_level_percent}% remaining`,
          vehicleId: vehicleId,
          tripId: tripId
        });
        state.updateTripState(tripId, { 
          alerts: batteryAlerts,
          batteryLevel: event.battery_level_percent 
        });
        break;

      case 'signal_recovered':
        state.updateTripState(tripId, {
          signalQuality: event.signal_quality_after_recovery || event.signal_quality || tripState.signalQuality
        });
        break;

      case 'signal_lost':
        const signalAlerts = [...(tripState.alerts || [])];
        signalAlerts.push({
          type: 'signal_lost',
          timestamp: event.timestamp,
          severity: 'warning',
          message: 'GPS signal lost',
          vehicleId: vehicleId,
          tripId: tripId
        });
        state.updateTripState(tripId, { alerts: signalAlerts });
        break;
    }
  },

  /**
   * Calculate fleet-wide metrics
   * Optimized to only recalculate when needed
   */
  calculateFleetMetrics: () => {
    const state = get();
    const tripStates = state.tripStates;
    const tripIds = Object.keys(tripStates);
    
    if (tripIds.length === 0) {
      set({
        fleetMetrics: {
          totalTrips: 0,
          activeTrips: 0,
          completedTrips: 0,
          cancelledTrips: 0,
          totalDistance: 0,
          averageSpeed: 0,
          alerts: []
        }
      });
      return;
    }
    
    let activeTrips = 0;
    let completedTrips = 0;
    let cancelledTrips = 0;
    let totalDistance = 0;
    let totalSpeed = 0;
    let speedCount = 0;
    const allAlerts = [];

    tripIds.forEach(tripId => {
      const tripState = tripStates[tripId];
      
      if (tripState.status === 'active') activeTrips++;
      if (tripState.status === 'completed') completedTrips++;
      if (tripState.status === 'cancelled') cancelledTrips++;
      
      totalDistance += tripState.distanceTravelled || 0;
      
      if (tripState.currentSpeed > 0) {
        totalSpeed += tripState.currentSpeed;
        speedCount++;
      }
      
      if (tripState.alerts) {
        allAlerts.push(...tripState.alerts);
      }
    });

    set({
      fleetMetrics: {
        totalTrips: tripIds.length,
        activeTrips,
        completedTrips,
        cancelledTrips,
        totalDistance,
        averageSpeed: speedCount > 0 ? totalSpeed / speedCount : 0,
        alerts: allAlerts.slice(-10) // Keep only last 10 alerts for performance
      }
    });
  }
}));

