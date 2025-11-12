/**
 * Event Stream Processor
 * Loads and processes fleet tracking events chronologically
 */

/**
 * Load all trip data files
 */
export async function loadTripData() {
  const tripFiles = [
    'trip_1_cross_country.json',
    'trip_2_urban_dense.json',
    'trip_3_mountain_cancelled.json',
    'trip_4_southern_technical.json',
    'trip_5_regional_logistics.json'
  ];

  const basePath = '/data-generator/assessment-2025-11-11-23-56-11/';
  
  const trips = await Promise.all(
    tripFiles.map(async (filename, index) => {
      try {
        const response = await fetch(`${basePath}${filename}`);
        const events = await response.json();
        return {
          tripId: events[0]?.trip_id || `trip_${index + 1}`,
          vehicleId: events[0]?.vehicle_id || `VH_00${index + 1}`,
          events: events,
          filename: filename
        };
      } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return null;
      }
    })
  );

  return trips.filter(trip => trip !== null);
}

/**
 * Merge all events from all trips and sort chronologically
 */
export function mergeAndSortEvents(trips) {
  const allEvents = [];
  
  trips.forEach(trip => {
    trip.events.forEach(event => {
      allEvents.push({
        ...event,
        tripId: trip.tripId,
        vehicleId: trip.vehicleId
      });
    });
  });

  // Sort by timestamp
  return allEvents.sort((a, b) => {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
}

/**
 * Get the earliest and latest timestamps from events
 */
export function getTimeRange(events) {
  if (events.length === 0) return { start: null, end: null };
  
  const timestamps = events.map(e => new Date(e.timestamp));
  return {
    start: new Date(Math.min(...timestamps)),
    end: new Date(Math.max(...timestamps))
  };
}

/**
 * Filter events that should be visible at a given simulation time
 */
export function getEventsUpToTime(events, simulationTime) {
  return events.filter(event => {
    const eventTime = new Date(event.timestamp);
    return eventTime <= simulationTime;
  });
}

/**
 * Group events by trip ID
 */
export function groupEventsByTrip(events) {
  const grouped = {};
  events.forEach(event => {
    const tripId = event.tripId || event.trip_id;
    if (!grouped[tripId]) {
      grouped[tripId] = [];
    }
    grouped[tripId].push(event);
  });
  return grouped;
}

