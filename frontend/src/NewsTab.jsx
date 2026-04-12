import { useState, useEffect } from 'react';

export default function NewsTab({ showToast }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/v1/news?query=vaccination');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setNews(data.articles || []);
      } catch (err) {
        setError('Could not load vaccination news. Please try again later.');
        showToast('Error fetching news', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [showToast]);

  return (
    <div className="news-tab">
      <div className="news-header">
        <h2><i className="fas fa-newspaper" /> Vaccination News</h2>
        <p>Stay updated with the latest breakthroughs and vaccination drives.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="news-masonry">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="news-card skeleton-card glass-effect">
              <div className="skeleton-image" />
              <div className="skeleton-title" />
              <div className="skeleton-text" />
              <div className="skeleton-text short" />
            </div>
          ))
        ) : news.length > 0 ? (
          news.map((item, i) => (
            <div key={i} className="news-card glass-effect">
              {item.image && (
                <div className="news-image-wrapper">
                  <img src={item.image} alt={item.title} className="news-image" loading="lazy" />
                </div>
              )}
              <div className="news-content">
                <span className="news-date">
                  <i className="far fa-calendar-alt" /> {new Date(item.publishedAt).toLocaleDateString()}
                </span>
                <h3 className="news-title">{item.title}</h3>
                <p className="news-desc">{item.description}</p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="read-more-btn"
                >
                  Read Article <i className="fas fa-arrow-right" />
                </a>
              </div>
            </div>
          ))
        ) : (
          !loading && !error && (
            <div className="empty-state">
              <i className="fas fa-newspaper empty-icon" />
              <p>No vaccination news found at the moment.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
