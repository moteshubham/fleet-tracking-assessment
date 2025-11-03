# Fleet Tracking Event Generator

This script generates realistic sample trip events for fleet tracking systems using real road routes from the OSRM (Open Source Routing Machine) API.

## Features

- Fetches real driving routes between two coordinates using OSRM public API
- Generates `location_ping` events with realistic GPS data along the route
- Calculates realistic speed, heading, and movement data
- Adds GPS accuracy variations and signal quality indicators
- Outputs events in chronological order with proper timestamps

## Current Implementation

The script now generates **comprehensive fleet tracking events** with both specific and random placement logic. It creates a trip from San Francisco to Los Angeles with:

**Specific Placement Events (~4,123 events):**
- **4,096 location_ping events** (one every 30 seconds)
- **4 trip lifecycle events** (tracking_started, trip_started, trip_completed, tracking_stopped)
- **8 distance milestone events** (at 50km, 100km, 150km, etc. intervals)
- **9 time milestone events** (at 1hr, 2hr, 4hr, etc. intervals - accounts for stopping time)
- **6 scheduled stop events** (3 stops with arrival/departure at 25%, 50%, 75% of route)

**Random Placement Events (~76 events):**
- **Movement/Behavior Events**: speed_changed, speed_violation, vehicle_stopped, vehicle_moving, unscheduled_stop
- **Technical/System Events**: signal_degraded, signal_lost/recovered, device_battery_low, device_overheating, device_error
- **Conditional Events**: fuel_level_low, refueling_started/completed, trip_paused/resumed, vehicle_telemetry
- **Trip Cancellation**: trip_cancelled (5% chance, early in trip - truncates all subsequent events)

**Features:**
- **~34 hour trip duration** (realistic for the 613km route)
- **Realistic GPS data**: speed, heading, accuracy, altitude, signal quality
- **Smart time calculations**: Time milestones account for unscheduled stops
- **Fuel consumption modeling**: Based on distance and consumption rate
- **Proper event structure** matching the fleet tracking event types specification
- **Chronological ordering** of all events by timestamp

## Usage

1. Navigate to data generator and install dependencies:
```bash
cd data-generator
npm install
```

2. Run the script:
```bash
npm start
```

3. Generate assessment data (5 different trip scenarios):
```bash
cd data-generator
npm run assessment
# OR for candidates:
npm run generate
```

4. Generate GeoJSON from trip events:
```bash
npm run geojson
```

5. The scripts will (run from `data-generator/` folder):
   - **npm start**: Generate single comprehensive trip (SF→LA) for development/testing
   - **npm run assessment** / **npm run generate**: Generate 5 different trip scenarios for candidate assessment
   - **npm run geojson**: Process `trip-events.json` and create GeoJSON LineString feature files in `test/` folder

## Output Files

### Assessment Trip Files (`assessment-YYYY-MM-DD-HH-MM-SS/` folder)
The assessment script generates 5 different trip scenarios with **randomized diverse routes** across the United States:

1. **`trip_1_cross_country.json`** - Cross-country long haul delivery
   - **Routes**: NY→LA, SF→Miami, Chicago→Seattle, Houston→Boston
   - **Purpose**: Tests comprehensive event handling and extended streaming
   - **Features**: Transcontinental distances, multiple time zones, varied terrain

2. **`trip_2_urban_dense.json`** - Dense urban delivery route
   - **Routes**: Chicago metro, LA metro, NYC metro, SF Bay Area
   - **Purpose**: Tests high-frequency event processing and urban patterns
   - **Features**: Dense location updates, traffic patterns, short distances

3. **`trip_3_mountain_cancelled.json`** - Mountain route cancelled due to weather
   - **Routes**: Denver→Salt Lake, Salt Lake→Boise, Denver→Vail, Fresno→Yosemite
   - **Purpose**: Tests edge case handling and abrupt stream termination
   - **Features**: High altitude routes, weather cancellations, terrain challenges

4. **`trip_4_southern_technical.json`** - Southern route with technical issues
   - **Routes**: Houston→Miami, Atlanta→New Orleans, Austin→El Paso, Tampa→Orlando
   - **Purpose**: Tests error state visualization and device problem handling
   - **Features**: Gulf Coast/Southern routes, enhanced technical events, heat issues

5. **`trip_5_regional_logistics.json`** - Regional logistics with fuel management
   - **Routes**: Seattle→Portland, Boston→NYC, Detroit→Chicago, Sacramento→Fresno
   - **Purpose**: Tests operational event visualization and fuel management
   - **Features**: Regional corridors, fuel optimization, maintenance events

**🎲 Randomization**: Each generation selects different routes from 20+ options, ensuring unique assessment data per candidate.

**Additional Assessment Files:**
- `fleet-tracking-event-types.md` - Complete event type reference

### Development Trip Events (`trip-events.json`)
Single comprehensive trip for development/testing. Here's an example location_ping event structure:

```json
{
  "event_id": "evt_1762154470128_letpsjcr4",
  "event_type": "location_ping",
  "timestamp": "2025-11-03T10:00:00.000Z",
  "vehicle_id": "VH_123",
  "trip_id": "trip_20251103_100000",
  "location": {
    "lat": 37.774938,
    "lng": -122.419449,
    "accuracy_meters": 14.1,
    "altitude_meters": 31.2
  },
  "movement": {
    "speed_kmh": 0,
    "heading_degrees": 0,
    "moving": false
  },
  "signal_quality": "excellent"
}
```

### GeoJSON Route Files (`test/` folder)
The GeoJSON generator creates two output files in the `test/` directory:

1. **`test/trip-route.geojson`** - Complete GeoJSON FeatureCollection with metadata:
```json
{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "properties": {
      "name": "Fleet Trip Route",
      "vehicle_id": "VH_123",
      "trip_id": "trip_20251103_100000",
      "total_points": 4115,
      "start_time": "2025-11-03T09:55:00.000Z",
      "end_time": "2025-11-04T20:13:00.000Z",
      "event_types_included": ["tracking_started", "location_ping", "time_milestone", "distance_milestone", "tracking_stopped"]
    },
    "geometry": {
      "type": "LineString",
      "coordinates": [[-122.419449, 37.774938], [-122.41934, 37.775026], ...]
    }
  }]
}
```

2. **`test/trip-route-simple.json`** - Simple LineString geometry for debugging:
```json
{
  "type": "LineString",
  "coordinates": [[-122.419449, 37.774938], [-122.41934, 37.775026], ...]
}
```

## Project Structure

```
fleet-tracking-assessment/
├── ASSESSMENT_INSTRUCTIONS.md    # 🎯 Main assessment entry point for candidates
├── HOW_TO_GENERATE_DATA.md       # 🛠️ Data generation instructions for candidates
├── FLEET_TRACKING_EVENT_TYPES.md # 📖 Complete event type reference (27 types)
├── README.md                      # This file (development documentation)
├── assessment-fallback-data/      # 💾 Pre-generated fallback data for candidates
│   ├── trip_1_cross_country.json  # Fallback cross-country trip
│   ├── trip_2_urban_dense.json    # Fallback urban trip
│   ├── trip_3_mountain_cancelled.json # Fallback cancelled trip
│   ├── trip_4_southern_technical.json # Fallback technical issues trip
│   ├── trip_5_regional_logistics.json # Fallback logistics trip
│   └── fleet-tracking-event-types.md # Event type reference
└── data-generator/                # 🔧 Data generation tools (for development)
    ├── generate-trip-events.js    # Single trip generator (development)
    ├── generate-assessment-trips.js # Assessment data generator (5 scenarios)
    ├── event-generators.js        # Specific placement event generators
    ├── random-event-generators.js # Random placement event generators
    ├── package.json               # Dependencies and scripts
    ├── package-lock.json          # Dependency lock file
    ├── trip-events.json           # Development trip events (~4,200 events)
    ├── node_modules/              # Dependencies
    ├── assessment-YYYY-MM-DD-HH-MM-SS/ # Generated assessment folder
    │   ├── trip_1_cross_country.json  # Cross-country long haul (varies)
    │   ├── trip_2_urban_dense.json    # Dense urban delivery (varies)
    │   ├── trip_3_mountain_cancelled.json # Mountain route cancelled (varies)
    │   ├── trip_4_southern_technical.json # Southern route with issues (varies)
    │   ├── trip_5_regional_logistics.json # Regional logistics (varies)
    │   └── fleet-tracking-event-types.md # Event type reference
    └── test/                      # Test scripts and outputs
        ├── generate-geojson.js    # GeoJSON generator script
        ├── trip-route.geojson     # Complete GeoJSON FeatureCollection
        ├── trip-route-simple.json # Simple LineString geometry
        └── README.md              # Test folder documentation
```

## Configuration

You can modify the following constants in `data-generator/generate-trip-events.js`:

- `START_COORDS`: Starting coordinates [longitude, latitude]
- `END_COORDS`: Ending coordinates [longitude, latitude]
- `VEHICLE_ID`: Vehicle identifier
- `TRIP_ID`: Trip identifier
- Time interval between location pings (currently 30 seconds)

## Event Types Generated

### Specific Placement Events (Position-Dependent)
- **Trip Lifecycle**: `tracking_started`, `trip_started`, `trip_completed`, `tracking_stopped`
- **Distance Milestones**: `distance_milestone` at 50km, 100km, 150km, 200km, 250km, 300km, 400km, 500km
- **Time Milestones**: `time_milestone` at 1hr, 2hr, 4hr, 6hr, 8hr, 12hr, 16hr, 20hr, 24hr intervals (accounts for stops)
- **Scheduled Stops**: `stop_arrival` and `stop_departure` at 25%, 50%, and 75% of the route
- **Location Pings**: `location_ping` every 30 seconds with realistic GPS data

### Random Placement Events (Context-Dependent)
- **Movement/Behavior**: `speed_changed`, `speed_violation`, `vehicle_stopped`, `vehicle_moving`, `unscheduled_stop`
- **Technical/System**: `signal_degraded`, `signal_lost`, `signal_recovered`, `device_battery_low`, `device_overheating`, `device_error`
- **Conditional**: `fuel_level_low`, `refueling_started`, `refueling_completed`, `trip_paused`, `trip_resumed`, `vehicle_telemetry`
- **Trip Cancellation**: `trip_cancelled` (5% chance, occurs early in trip, stops all further event generation)

## Next Steps

The script can be further extended with:
- **External data integration** (real fuel station locations, actual signal dead zones)
- **Multiple trip scenarios** (different routes, vehicle types, weather conditions)
- **Advanced fuel modeling** (real-time fuel station prices, route optimization)
- **Traffic condition events** (based on real traffic data)
- **Driver behavior analysis** (fatigue detection, driving patterns)
- **Fleet management integration** (dispatch events, maintenance scheduling)

## Dependencies

- **axios**: For HTTP requests to OSRM API
- **fs**: For file system operations (built-in Node.js module)

## API Used

- **OSRM API**: `http://router.project-osrm.org/route/v1/driving/` - Public routing service
- No API key required for the public OSRM instance
