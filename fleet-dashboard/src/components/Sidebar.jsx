/**
 * Sidebar Component
 * Navigation sidebar matching the design
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Truck, BarChart3, Bell, Settings, Search, X, Info } from 'lucide-react';
import { useFleetStore } from '../store/fleetStore';
import './Sidebar.css';

export default function Sidebar({ activeView }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';
  const { trips } = useFleetStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [comingSoonMessage, setComingSoonMessage] = useState(null);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const comingSoonTimeoutRef = useRef(null);

  // Filter trips based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return trips.filter(trip => {
      const tripId = String(trip.tripId || '').toLowerCase();
      const vehicleId = String(trip.vehicleId || '').toLowerCase();
      return tripId.includes(query) || vehicleId.includes(query);
    }).slice(0, 5); // Limit to 5 results
  }, [searchQuery, trips]);

  // Handle search result click
  const handleResultClick = (trip) => {
    navigate(`/trip/${trip.tripId}`);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  // Handle coming soon feature clicks
  const handleComingSoon = (featureName) => {
    setComingSoonMessage(`"${featureName}" feature coming soon!`);
    
    // Clear any existing timeout
    if (comingSoonTimeoutRef.current) {
      clearTimeout(comingSoonTimeoutRef.current);
    }
    
    // Auto-hide after 3 seconds
    comingSoonTimeoutRef.current = setTimeout(() => {
      setComingSoonMessage(null);
    }, 3000);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (comingSoonTimeoutRef.current) {
        clearTimeout(comingSoonTimeoutRef.current);
      }
    };
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo">FC</div>
          </div>
          <div className="header-text">
            <h1 className="company-name">Fleet Command</h1>
            <p className="user-name">Dashboard</p>
          </div>
        </div>

        <div className="search-container" ref={searchRef}>
          <div className="search-icon-wrapper">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Search vehicle/trip"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery('');
                setIsSearchFocused(false);
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
          
          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery.trim() && (
            <div className="search-results" ref={resultsRef}>
              {searchResults.length > 0 ? (
                <>
                  <div className="search-results-header">
                    <span>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found</span>
                  </div>
                  <div className="search-results-list">
                    {searchResults.map((trip) => (
                      <div
                        key={trip.tripId}
                        className="search-result-item"
                        onClick={() => handleResultClick(trip)}
                      >
                        <div className="search-result-icon">
                          <Truck size={16} />
                        </div>
                        <div className="search-result-info">
                          <div className="search-result-vehicle">{trip.vehicleId}</div>
                          <div className="search-result-trip">Trip #{trip.tripId}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="search-no-results">
                  <span>No trips or vehicles found</span>
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`nav-item ${isDashboard ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <button
            className={`nav-item ${activeView === 'vehicles' ? 'active' : ''}`}
            onClick={() => handleComingSoon('Vehicles')}
          >
            <Truck size={20} />
            <span>Vehicles</span>
          </button>
          <button
            className={`nav-item ${activeView === 'reports' ? 'active' : ''}`}
            onClick={() => handleComingSoon('Reports')}
          >
            <BarChart3 size={20} />
            <span>Reports</span>
          </button>
          <button
            className={`nav-item ${activeView === 'alerts' ? 'active' : ''}`}
            onClick={() => handleComingSoon('Alerts')}
          >
            <Bell size={20} />
            <span>Alerts</span>
          </button>
        </nav>
      </div>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={() => handleComingSoon('Settings')}>
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </div>

      {/* Coming Soon Notification */}
      {comingSoonMessage && (
        <div className="coming-soon-toast">
          <div className="coming-soon-icon">
            <Info size={18} />
          </div>
          <span className="coming-soon-text">{comingSoonMessage}</span>
          <button
            className="coming-soon-close"
            onClick={() => setComingSoonMessage(null)}
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </aside>
  );
}

