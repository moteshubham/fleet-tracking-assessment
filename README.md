# MapUp - Fleet Tracking Dashboard Assessment

## Overview

The objective of this assessment is to build a **real-time fleet tracking dashboard** using realistic vehicle trip data. You'll work with comprehensive fleet tracking events to create an interactive dashboard that visualizes vehicle movements, metrics, and operational insights. This assessment tests your skills in real-time data processing, dashboard design, and fleet management visualization.

### We encourage the use of AI and LLM tools for this assessment! However, you must understand what you're building and be able to explain your implementation decisions.

## Dataset

You have two options for obtaining your assessment data:

### Option 1: Generate Your Own Unique Data (Highly Recommended)
Generate your own unique trip data using our fleet tracking simulator. This ensures you have a completely unique dataset and demonstrates technical proficiency.

**📖 [HOW_TO_GENERATE_DATA.md](./HOW_TO_GENERATE_DATA.md)** - Complete instructions for generating your assessment data

### Option 2: Use Pre-generated Fallback Data
If you encounter issues with data generation, pre-generated sample data is available in the `assessment-fallback-data/` folder.

## Data Structure

Your dataset will contain **5 different trip scenarios** with comprehensive event coverage:

1. **Cross-Country Long Haul** - Transcontinental freight delivery (10,000+ events)
2. **Urban Dense Delivery** - Dense urban route with frequent updates (500+ events) 
3. **Mountain Route Cancelled** - Trip cancelled due to weather conditions (100+ events)
4. **Southern Technical Issues** - Route with device and technical problems (1,000+ events)
5. **Regional Logistics** - Regional route with fuel management events (2,000+ events)

**📖 [FLEET_TRACKING_EVENT_TYPES.md](./FLEET_TRACKING_EVENT_TYPES.md)** - Complete reference for all 27 event types in your dataset

## Tasks

### Dashboard Creation:

- **Real-time Visualization**: Create a dashboard that simulates real-time fleet tracking using event timestamps
- **Interactive Maps**: Display vehicle movements on interactive maps with route visualization
- **Operational Metrics**: Show key metrics like speed, fuel levels, alerts, trip progress, and milestones
- **Event Processing**: Handle all event types including lifecycle, location, technical, and operational events
- **Alert Management**: Visualize violations, technical issues, fuel warnings, and cancellations
- **Multi-trip Support**: Display and manage multiple concurrent vehicle trips
- **Timeline Controls**: Implement playback controls for event streaming simulation

### Technical Requirements:

- **Event Stream Processing**: Process events chronologically to simulate real-time data
- **State Management**: Track vehicle status, trip progress, and alert states
- **Performance**: Efficiently handle datasets with 10,000+ events
- **Responsive Design**: Ensure dashboard works across different screen sizes
- **User Experience**: Create intuitive navigation and information hierarchy

### Deployment:

- Deploy your fleet tracking dashboard to a hosting platform of your choice
- Make sure the dashboard is publicly accessible
- Ensure it can load and process the generated trip data files

## Evaluation Criteria

Your submission will be evaluated based on:

- **Real-time Processing**: Effectiveness in simulating real-time fleet tracking
- **Dashboard Design**: Clarity, aesthetics, and usability of the fleet management interface
- **Technical Implementation**: Code quality, performance, and architecture decisions
- **Data Insights**: Ability to present meaningful fleet operational insights
- **Event Handling**: Comprehensive coverage of different event types and edge cases
- **User Experience**: Intuitive controls and information presentation

## Assessment Scenarios

Your dashboard should effectively handle these scenarios:

### Scenario 1: Long Haul Monitoring
- Track transcontinental delivery over multiple days
- Display progress milestones and scheduled stops
- Handle extended event streams (10,000+ events)

### Scenario 2: Urban Operations
- Monitor dense urban delivery with frequent location updates
- Show real-time traffic and route optimization
- Handle high-frequency event processing

### Scenario 3: Emergency Response
- Display trip cancellation and emergency scenarios
- Show alert escalation and incident management
- Handle abrupt event stream termination

### Scenario 4: Technical Issues
- Visualize device malfunctions and signal problems
- Display system health and diagnostic information
- Handle error states and recovery scenarios

### Scenario 5: Operational Efficiency
- Monitor fuel consumption and refueling events
- Display maintenance alerts and operational metrics
- Show cost optimization insights

## Submission Guidelines

- Fork this repository to your GitHub account
- Complete your fleet tracking dashboard implementation
- Deploy the dashboard to a hosting platform
- Update this README with the URL to your live dashboard
- **Repository Access:** Keep your repository private to avoid visibility by other candidates. Add the following email addresses as collaborators:
  - vedantp@mapup.ai
  - ajayap@mapup.ai  
  - atharvd@mapup.ai
- Finally, please fill out the google form that you received via email to submit the assessment for review

## Getting Started

1. **Generate Your Data**: Follow [HOW_TO_GENERATE_DATA.md](./HOW_TO_GENERATE_DATA.md) to create your unique dataset
2. **Study Event Types**: Review [FLEET_TRACKING_EVENT_TYPES.md](./FLEET_TRACKING_EVENT_TYPES.md) to understand the data structure
3. **Plan Your Dashboard**: Design your approach for real-time visualization and event processing
4. **Build & Deploy**: Implement your solution and deploy to a hosting platform

## Technical Stack Flexibility

Feel free to use any technology stack you prefer:
- **Frontend**: React, Vue, Angular, Svelte, or vanilla JavaScript
- **Mapping**: Leaflet, Mapbox, Google Maps, or OpenStreetMap
- **Charts**: D3.js, Chart.js, Recharts, or any visualization library
- **Deployment**: Vercel, Netlify, AWS, or any hosting platform

---

**Ready to build your fleet tracking dashboard? Start by generating your unique assessment data!**

📖 **Next Step**: [HOW_TO_GENERATE_DATA.md](./HOW_TO_GENERATE_DATA.md)

---

## Technical Documentation

For technical details about the data generator implementation, see [data-generator/TECHNICAL_README.md](./data-generator/TECHNICAL_README.md)
