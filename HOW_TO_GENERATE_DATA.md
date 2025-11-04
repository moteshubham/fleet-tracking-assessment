# How to Generate Trip Data

## Prerequisites
- Node.js installed on your system
- Internet connection for route data

## Generate Your Trip Data

1. **Navigate to the data generator:**
   ```bash
   cd data-generator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate your unique trip data:**
   ```bash
   npm run generate
   ```

4. **Find your data:**
   Your data will be created in a timestamped folder: `data-generator/assessment-YYYY-MM-DD-HH-MM-SS/`

## Generated Files

**5 Trip Data Files:**
- `trip_1_cross_country.json` - Long haul delivery across the US
- `trip_2_urban_dense.json` - Dense urban delivery route  
- `trip_3_mountain_cancelled.json` - Mountain route cancelled due to weather
- `trip_4_southern_technical.json` - Route with technical issues
- `trip_5_regional_logistics.json` - Regional logistics with fuel management

**Reference Documentation:**
- `fleet-tracking-event-types.md` - Complete event type specifications

## Data Generation Benefits

✅ **Unique data per candidate** - No identical solutions possible  
✅ **Diverse routes** - Different geographic challenges  
✅ **Realistic scenarios** - Based on actual US highway routes  
✅ **Comprehensive events** - 10,000+ events across all trip types  

## Fallback Option

If you encounter issues generating data, pre-generated sample data is available in the `assessment-fallback-data/` folder at the root level. However, **generating your own unique dataset is highly recommended**.

## Technical Notes

- **Routes are randomized** - Each generation creates different route combinations
- **Event timestamps** - Chronologically ordered for simulation
- **Geographic diversity** - Routes span different US regions and terrain types
- **Tested on Node.js v18+** - Should work on most recent Node versions

---

**Ready to generate? Run `npm run generate` in the data-generator folder**
