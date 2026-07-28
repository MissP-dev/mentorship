import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Star, MoreVertical, Pencil, Trash2, Flag } from 'lucide-react';
import { getUserById } from '../../services/auth';
import { getReviewsByMentor, createReview, updateReview, deleteReview } from '../../services/reviews';
import { api } from '../../services/api';
import TopBar from '../shared/TopBar';
import Avatar from '../shared/Avatar';
import Button from '../shared/Button';
import Card from '../shared/Card';

function StarRating({ value, onChange, size = 16 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}>
          <Star size={size} className={`${(hover || value) >= s ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'} transition-colors`} />
        </button>
      ))}
    </div>
  );
}

export default function MentorProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('bio');
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportSending, setReportSending] = useState(false);
  const [reportMsg, setReportMsg] = useState('');
  const isOwnProfile = user?.id === Number(id);

  useEffect(() => {
    const load = async () => {
      try {
        const [mentorData, reviewsData] = await Promise.all([
          getUserById(id).catch(() => null),
          getReviewsByMentor(id).catch(() => []),
        ]);
        if (!mentorData) {
          setError('Mentor not found.');
          return;
        }
        setMentor(mentorData);
        setReviews(reviewsData);
      } catch (e) {
        console.error('MentorProfile load error:', e);
        setError('Failed to load profile.');
      }
    };
    load();
  }, [id]);

  const recalcRating = (reviewsList) => {
    if (reviewsList.length === 0) {
      setMentor((prev) => ({ ...prev, rating: 0 }));
    } else {
      const avg = reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length;
      setMentor((prev) => ({ ...prev, rating: Math.round(avg * 10) / 10 }));
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) return;
    setReviewLoading(true);
    try {
      let updatedReviews;
      if (editingReview) {
        const updated = await updateReview(editingReview.id, { rating: reviewRating, text: reviewText.trim() });
        updatedReviews = reviews.map((r) => r.id === updated.id ? updated : r);
        setReviews(updatedReviews);
      } else {
        const review = await createReview({ mentorId: Number(id), rating: reviewRating, text: reviewText.trim() });
        updatedReviews = [review, ...reviews];
        setReviews(updatedReviews);
      }
      recalcRating(updatedReviews);
      setShowReviewForm(false);
      setEditingReview(null);
      setReviewText('');
      setReviewRating(5);
      setReviewMsg('');
    } catch (e) {
      setReviewMsg(e.message);
    }
    setReviewLoading(false);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Delete this review?')) return;
    try {
      await deleteReview(reviewId);
      const updatedReviews = reviews.filter((r) => r.id !== reviewId);
      setReviews(updatedReviews);
      recalcRating(updatedReviews);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewRating(review.rating);
    setReviewText(review.text);
    setShowReviewForm(true);
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setReviewText('');
    setReviewRating(5);
    setReviewMsg('');
  };

  const handleReport = async () => {
    if (!reportType) return;
    setReportSending(true);
    try {
      await api('/admin/reports', {
        method: 'POST',
        body: JSON.stringify({ type: reportType, targetType: 'user', targetId: Number(id) }),
      });
      setReportMsg('Report submitted. Thank you.');
      setTimeout(() => { setShowReportModal(false); setReportMsg(''); setReportType(''); }, 2000);
    } catch (err) {
      setReportMsg(err.message || 'Failed to submit report');
    }
    setReportSending(false);
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{error}</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-4 border-purple-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tags = mentor.expertiseTags || [];
  const myReview = reviews.find((r) => r.menteeId === user?.id);

  return (
    <div className="pb-24 lg:pb-8">
      <TopBar title="Mentor Profile" showBack />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar src={mentor.avatarUrl} alt={mentor.fullName} size="xl" />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{mentor.fullName}</h1>
              <p className="text-xs text-gray-400 mt-1">Mentor since {new Date(mentor.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{mentor.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-xs text-gray-400 ml-1">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
              </div>
            </div>
            {!isOwnProfile && (
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
              >
                <Flag size={13} />
                Report
              </button>
            )}
          </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {['bio', 'expertise', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-purple-700 text-purple-700 dark:text-purple-400 dark:border-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'bio' && (
            <Card>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{mentor.bio || 'No bio available.'}</p>
            </Card>
          )}
          {activeTab === 'expertise' && (
            <Card>
              <div className="flex flex-wrap gap-2">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-sm rounded-full font-medium">
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No expertise listed.</p>
                )}
              </div>
            </Card>
          )}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {user && !isOwnProfile && !myReview && !showReviewForm && (
                <Button variant="secondary" className="w-full" onClick={() => setShowReviewForm(true)}>
                  Write a Review
                </Button>
              )}

              {showReviewForm && (
                <Card>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{editingReview ? 'Edit your review' : 'Write a review'}</p>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Rating</p>
                      <StarRating value={reviewRating} onChange={setReviewRating} size={24} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Review</label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={3}
                        placeholder="Share your experience with this mentor..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                    {reviewMsg && <p className="text-sm text-red-500">{reviewMsg}</p>}
                    <div className="flex gap-2">
                      <Button onClick={handleSubmitReview} disabled={reviewLoading}>
                        {reviewLoading ? 'Saving...' : editingReview ? 'Update Review' : 'Submit Review'}
                      </Button>
                      <Button variant="ghost" onClick={handleCancelReview}>Cancel</Button>
                    </div>
                  </div>
                </Card>
              )}

              {reviews.length === 0 && !showReviewForm ? (
                <Card>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No reviews yet.</p>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar src={review.mentee?.avatarUrl} alt={review.mentee?.fullName} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{review.mentee?.fullName}</p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={12} className={s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'} />
                              ))}
                              <span className="text-xs text-gray-400 ml-1">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        {user?.id === review.menteeId && !showReviewForm && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEditReview(review)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <Pencil size={14} className="text-gray-400" />
                            </button>
                            <button onClick={() => handleDeleteReview(review.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <Trash2 size={14} className="text-red-400" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{review.text}</p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report User</h3>
            {reportMsg ? (
              <p className={`text-sm ${reportMsg.includes('submitted') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{reportMsg}</p>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400">Why are you reporting <span className="font-medium text-gray-900 dark:text-white">{mentor.fullName}</span>?</p>
                <div className="space-y-2">
                  {['Inappropriate behavior', 'Fake profile', 'Harassment', 'Spam', 'Other'].map((option) => (
                    <label key={option} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${reportType === option ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                      <input type="radio" name="reportType" value={option} checked={reportType === option} onChange={(e) => setReportType(e.target.value)} className="text-purple-700 focus:ring-purple-500" />
                      <span className="text-sm text-gray-900 dark:text-white">{option}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setShowReportModal(false); setReportMsg(''); setReportType(''); }} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                  <button onClick={handleReport} disabled={!reportType || reportSending} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors disabled:opacity-50">{reportSending ? 'Sending...' : 'Submit'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!isOwnProfile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 lg:static lg:border-0 lg:bg-transparent lg:p-0">
          <div className="max-w-2xl mx-auto">
            <Button className="w-full" size="lg" onClick={() => navigate(`/mentors/${id}/request`)}>
              Request Mentorship
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
