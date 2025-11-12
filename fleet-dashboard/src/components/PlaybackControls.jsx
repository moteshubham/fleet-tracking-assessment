/**
 * Playback Controls Component
 * Controls for play/pause, speed, and simulation progress
 */

import { Play, Pause, FastForward, RotateCcw } from 'lucide-react';
import './PlaybackControls.css';

export default function PlaybackControls({
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onFastForward,
  speed,
  onSpeedChange,
  simulationTime,
  progress
}) {
  return (
    <div className="controls-section">
      <div className="playback-controls">
        <div className="controls-row">
          <div className="playback-buttons">
            <button 
              onClick={isPlaying ? onPause : onPlay} 
              className="btn-primary"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button 
              onClick={onReset} 
              className="btn-secondary"
              title="Reset"
            >
              <RotateCcw size={20} />
            </button>
            <button 
              onClick={onFastForward}
              className="btn-secondary"
              title="Fast Forward (Skip 1 hour)"
            >
              <FastForward size={20} />
            </button>
          </div>

          <div className="speed-controls">
            <select
              className="speed-select"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              title="Playback Speed"
            >
              <option value={1}>1x</option>
              <option value={5}>5x</option>
              <option value={10}>10x</option>
              <option value={50}>50x</option>
              <option value={100}>100x</option>
              <option value={200}>200x</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
