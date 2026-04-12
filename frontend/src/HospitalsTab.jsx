import { useState } from 'react';

export default function HospitalsTab({ showToast, translations, language }) {
  const [location, setLocation] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHospitals = async (lat, lon, locStr) => {
    setLoading(true);
    setError(null);
    try {
      let query = '';
      if (lat && lon) {
        query = `?lat=${lat}&lon=${lon}`;
      } else if (locStr) {
        query = `?location=${encodeURIComponent(locStr)}`;
      }
      
      const response = await fetch(`/api/v1/hospitals${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch hospitals');
      }
      const data = await response.json();
      setHospitals(data);
    } catch (err) {
      setError('Could not find hospitals in that area. Please try again.');
      showToast('Error fetching hospitals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (location.trim()) {
      fetchHospitals(null, null, location);
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchHospitals(position.coords.latitude, position.coords.longitude, null);
      },
      () => {
        setLoading(false);
        showToast('Unable to retrieve your location', 'error');
      }
    );
  };

  return (
    <div className="hospitals-tab">
      <div className="search-container glass-effect">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="location-input"
            placeholder="Enter location (e.g. New York)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <button type="submit" className="search-btn">
            <i className="fas fa-search" /> Search
          </button>
        </form>
        <button onClick={handleGeolocation} className="geo-btn">
          <i className="fas fa-location-arrow" /> Use Current Location
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="hospitals-grid">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="hospital-card skeleton-card glass-effect">
              <div className="skeleton-title" />
              <div className="skeleton-text" />
              <div className="skeleton-text short" />
            </div>
          ))
        ) : hospitals.length > 0 ? (
          hospitals.map((h, i) => (
            <a
              key={i}
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + ' ' + h.address)}`}
              target="_blank"
              rel="noreferrer"
              className="hospital-card glass-effect"
            >
              <div className="card-top">
                <h3 className="hospital-name">{h.name}</h3>
                <div className="hospital-rating">
                  <i className="fas fa-star" /> {h.rating}
                </div>
              </div>
              <p className="hospital-address">
                <i className="fas fa-map-marker-alt" /> {h.address}
              </p>
            </a>
          ))
        ) : (
          !loading && !error && (
            <div className="empty-state">
              <i className="fas fa-hospital empty-icon" />
              <p>Search for a location or use your current location to find nearby hospitals.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
