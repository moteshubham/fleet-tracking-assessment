/**
 * Real-time Simulation Engine
 * Handles playback of events based on timestamps with speed control
 */

export class SimulationEngine {
  constructor(events, onEventProcessed, onTimeUpdate, initialSpeed = 1) {
    this.events = events;
    this.onEventProcessed = onEventProcessed;
    this.onTimeUpdate = onTimeUpdate;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.speed = initialSpeed; // 1x, 5x, 10x, 50x, 100x, 200x speed multiplier
    this.intervalId = null;
    this.startTime = null;
    this.actualStartTime = null; // When simulation actually started
    this.timeRange = this.getTimeRange();
  }

  getTimeRange() {
    if (this.events.length === 0) return { start: null, end: null };
    const timestamps = this.events.map(e => new Date(e.timestamp));
    return {
      start: new Date(Math.min(...timestamps)),
      end: new Date(Math.max(...timestamps))
    };
  }

  /**
   * Start simulation from the beginning or resume from current position
   */
  play() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    
    // If starting fresh, reset to beginning
    if (this.currentIndex === 0) {
      this.actualStartTime = Date.now();
      this.startTime = this.timeRange.start;
    } else {
      // Resume from where we left off
      // Calculate how much real time has passed since we started
      const currentSimTime = this.getCurrentSimulationTime();
      if (currentSimTime && this.timeRange.start) {
        const simElapsed = currentSimTime.getTime() - this.timeRange.start.getTime();
        // Adjust actualStartTime so that elapsed * speed = simElapsed
        this.actualStartTime = Date.now() - (simElapsed / this.speed);
      } else {
        const elapsed = Date.now() - this.actualStartTime;
        this.actualStartTime = Date.now() - elapsed;
      }
    }

    // Use requestAnimationFrame for smoother updates, especially at high speeds
    this.processEvents();
  }

  /**
   * Pause simulation
   */
  pause() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Reset simulation to beginning
   */
  reset() {
    this.pause();
    this.currentIndex = 0;
    this.startTime = this.timeRange.start;
    this.actualStartTime = null;
    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.startTime, 0);
    }
  }

  /**
   * Set playback speed (1x, 5x, 10x)
   */
  setSpeed(speed) {
    this.speed = speed;
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  /**
   * Process events based on simulation time
   */
  processEvents() {
    if (this.currentIndex >= this.events.length) {
      this.pause();
      return;
    }

    const now = Date.now();
    const elapsed = (now - this.actualStartTime) * this.speed;
    const currentSimulationTime = new Date(
      this.timeRange.start.getTime() + elapsed
    );

    // Process all events that should have occurred by now
    while (
      this.currentIndex < this.events.length &&
      new Date(this.events[this.currentIndex].timestamp) <= currentSimulationTime
    ) {
      const event = this.events[this.currentIndex];
      if (this.onEventProcessed) {
        this.onEventProcessed(event, this.currentIndex);
      }
      this.currentIndex++;
    }

    // Calculate progress percentage
    const totalDuration = this.timeRange.end.getTime() - this.timeRange.start.getTime();
    const elapsedDuration = currentSimulationTime.getTime() - this.timeRange.start.getTime();
    const progress = totalDuration > 0 ? (elapsedDuration / totalDuration) * 100 : 0;

    if (this.onTimeUpdate) {
      this.onTimeUpdate(currentSimulationTime, progress);
    }

    // Check if we've reached the end
    if (this.currentIndex >= this.events.length) {
      this.pause();
      return;
    }

    // Schedule next check (more frequent checks for smoother updates)
    this.intervalId = setTimeout(() => {
      if (this.isPlaying) {
        this.processEvents();
      }
    }, 100); // Check every 100ms
  }

  /**
   * Jump to a specific time in the simulation
   */
  seekToTime(targetTime) {
    this.pause();
    const targetDate = new Date(targetTime);
    
    // Find the index of the first event after target time
    this.currentIndex = this.events.findIndex(
      event => new Date(event.timestamp) > targetDate
    );
    
    if (this.currentIndex === -1) {
      this.currentIndex = this.events.length;
    }

    // Process all events up to this point
    const eventsUpToNow = this.events.slice(0, this.currentIndex);
    eventsUpToNow.forEach((event, index) => {
      if (this.onEventProcessed) {
        this.onEventProcessed(event, index);
      }
    });

    if (this.onTimeUpdate) {
      const totalDuration = this.timeRange.end.getTime() - this.timeRange.start.getTime();
      const elapsedDuration = targetDate.getTime() - this.timeRange.start.getTime();
      const progress = totalDuration > 0 ? (elapsedDuration / totalDuration) * 100 : 0;
      this.onTimeUpdate(targetDate, progress);
    }
  }

  /**
   * Fast forward: Skip ahead by a fixed time (1 hour)
   * Also checks if trip_20251103_090000 has finished and continues after that
   */
  fastForward() {
    const currentTime = this.getCurrentSimulationTime();
    if (!currentTime) return;
    
    // Skip ahead by 1 hour (3600000 ms)
    const skipTime = 60 * 60 * 1000; // 1 hour in milliseconds
    const targetTime = new Date(currentTime.getTime() + skipTime);
    
    // Check if trip_20251103_090000 has completed
    // Find the completion event for this trip
    const targetTripId = 'trip_20251103_090000';
    const tripCompletedEvent = this.events.find(event => {
      const tripId = event.tripId || event.trip_id;
      return tripId === targetTripId && 
             (event.event_type === 'trip_completed' || event.event_type === 'trip_cancelled');
    });
    
    // If trip has completed, skip to after its completion time
    if (tripCompletedEvent) {
      const completionTime = new Date(tripCompletedEvent.timestamp);
      // Skip to 1 minute after completion
      const afterCompletionTime = new Date(completionTime.getTime() + 60 * 1000);
      
      // Use whichever is later: the fast forward time or after completion time
      const finalTargetTime = afterCompletionTime > targetTime ? afterCompletionTime : targetTime;
      this.seekToTime(finalTargetTime);
    } else {
      // Just skip ahead by 1 hour
      this.seekToTime(targetTime);
    }
  }

  /**
   * Get current simulation time
   */
  getCurrentSimulationTime() {
    if (this.currentIndex === 0) {
      return this.timeRange.start;
    }
    
    if (this.currentIndex >= this.events.length) {
      return this.timeRange.end;
    }
    
    // Get the time of the last processed event
    const lastProcessedEvent = this.events[this.currentIndex - 1];
    if (lastProcessedEvent) {
      return new Date(lastProcessedEvent.timestamp);
    }
    
    return this.timeRange.start;
  }

  /**
   * Get current simulation state
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      speed: this.speed,
      currentIndex: this.currentIndex,
      totalEvents: this.events.length,
      progress: this.events.length > 0 ? (this.currentIndex / this.events.length) * 100 : 0
    };
  }
}

