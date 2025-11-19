import { useState, useEffect } from 'react';
import './ReviewPage.css';

const ReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 0,
    title: '',
    comment: ''
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(review => review.rating === star).length,
    percentage: reviews.length > 0 ? 
      (reviews.filter(review => review.rating === star).length / reviews.length) * 100 : 0
  }));

  // Load reviews from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem('userReviews');
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    }
  }, []);

  // Save reviews to localStorage
  useEffect(() => {
    localStorage.setItem('userReviews', JSON.stringify(reviews));
  }, [reviews]);

  // Sort reviews based on selection
  const getSortedReviews = () => {
    const sorted = [...reviews];
    switch(sortBy) {
      case 'recent':
        return sorted.sort((a, b) => b.id - a.id);
      case 'helpful':
        return sorted.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newReview.name.trim() && newReview.comment.trim() && newReview.rating > 0) {
      setIsSubmitting(true);
      
      setTimeout(() => {
        const reviewToAdd = { 
          ...newReview, 
          id: Date.now(),
          date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          helpful: 0
        };
        
        setReviews([reviewToAdd, ...reviews]);
        setNewReview({ name: '', rating: 0, title: '', comment: '' });
        setHoverRating(0);
        setIsSubmitting(false);
        setShowReviewForm(false);
      }, 500);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHelpful = (reviewId) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, helpful: (review.helpful || 0) + 1 }
        : review
    ));
  };

  // Star rating component for input
  const StarInput = ({ rating, onRatingChange, hoverRating, onHoverChange }) => {
    return (
      <div className="star-input-container">
        <div className="star-input">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
              onClick={() => onRatingChange(star)}
              onMouseEnter={() => onHoverChange(star)}
              onMouseLeave={() => onHoverChange(0)}
            >
              ★
            </span>
          ))}
        </div>
        <div className="rating-text">
          {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select rating'}
        </div>
      </div>
    );
  };

  // Star display component - FIXED LOGIC
  const StarDisplay = ({ rating }) => {
    return (
      <div className="star-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : 'empty'}`}
          >
            {star <= rating ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const totalReviews = reviews.length;
  const sortedReviews = getSortedReviews();

  return (
    <div className="amazon-reviews-container">
      {/* Main Header */}
      <div className="reviews-header">
        <h2>Customer reviews</h2>
        <div className="header-actions">
          <button 
            className="write-review-btn"
            onClick={() => setShowReviewForm(true)}
          >
            Write a customer review
          </button>
        </div>
      </div>

      <div className="reviews-content">
        {/* Left Sidebar - Rating Summary */}
        <div className="rating-sidebar">
          <div className="rating-overview">
            <div className="average-rating-large">
              <span className="average-number">{averageRating}</span>
              <span className="out-of">out of 5</span>
            </div>
            <div className="stars-large">
              <StarDisplay rating={Math.round(parseFloat(averageRating))} />
            </div>
            <div className="total-reviews">Global ratings</div>
          </div>

          <div className="rating-bars">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="rating-bar-item">
                <span className="star-label">{star} star</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="bar-percentage">{percentage.toFixed(0)}%</span>
              </div>
            ))}
          </div>

          <div className="review-highlights">
            <h3>Review highlights</h3>
            <div className="highlight-tags">
              <span className="highlight-tag">Great quality</span>
              <span className="highlight-tag">Fast delivery</span>
              <span className="highlight-tag">Good value</span>
              <span className="highlight-tag">Easy to use</span>
            </div>
          </div>
        </div>

        {/* Main Reviews Content */}
        <div className="reviews-main">
          {/* Sort Bar */}
          <div className="sort-bar">
            <div className="sort-options">
              <span>Sort by</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="recent">Most recent</option>
                <option value="helpful">Most helpful</option>
                <option value="highest">Highest rated</option>
                <option value="lowest">Lowest rated</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          <div className="reviews-list">
            {sortedReviews.length === 0 ? (
              <div className="no-reviews">
                <h3>No reviews yet</h3>
                <p>Be the first to review this product</p>
                <button 
                  className="cta-review-btn"
                  onClick={() => setShowReviewForm(true)}
                >
                  Write the first review
                </button>
              </div>
            ) : (
              sortedReviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-avatar">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="reviewer-info">
                      <span className="reviewer-name">{review.name}</span>
                      <div className="review-verified">Verified Purchase</div>
                    </div>
                  </div>
                  
                  <div className="review-rating">
                    <StarDisplay rating={review.rating} />
                    <span className="review-date">{review.date}</span>
                  </div>

                  {review.title && (
                    <h4 className="review-title">{review.title}</h4>
                  )}
                  
                  <p className="review-text">{review.comment}</p>
                  
                  <div className="review-actions">
                    <button 
                      className="helpful-btn"
                      onClick={() => handleHelpful(review.id)}
                    >
                      Helpful ({review.helpful || 0})
                    </button>
                    <button className="report-btn">Report</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More */}
          {sortedReviews.length > 0 && (
            <div className="load-more-section">
              <button className="load-more-btn">Load more reviews</button>
            </div>
          )}
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="review-modal-overlay">
          <div className="review-modal">
            <div className="modal-header">
              <h2>Write a review</h2>
              <button 
                className="close-modal"
                onClick={() => setShowReviewForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="review-form">
              <div className="form-section">
                <label>Overall rating *</label>
                <StarInput 
                  rating={newReview.rating}
                  onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                  hoverRating={hoverRating}
                  onHoverChange={setHoverRating}
                />
                {newReview.rating === 0 && (
                  <div className="error-message">Please select a rating</div>
                )}
              </div>

              <div className="form-section">
                <label htmlFor="title">Add a headline</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newReview.title}
                  onChange={handleChange}
                  placeholder="What's most important to know?"
                  className="form-input"
                />
              </div>

              <div className="form-section">
                <label htmlFor="comment">Write your review *</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={newReview.comment}
                  onChange={handleChange}
                  rows="6"
                  placeholder="What did you like or dislike? What did you use this product for?"
                  className="form-textarea"
                  required
                />
              </div>

              <div className="form-section">
                <label htmlFor="name">Your name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newReview.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-review-btn"
                  disabled={!newReview.name.trim() || !newReview.comment.trim() || newReview.rating === 0 || isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;