import { useState, useEffect } from 'react';
import StarRating from '../../components/StarRating';
import api from '../../api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    api.get('/admin/reviews')
      .then(r => setReviews(r.data.reviews))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleToggle = async (id, currentApproval) => {
    await api.patch(`/admin/reviews/${id}`, { approved: !currentApproval });
    fetchReviews();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    await api.delete(`/admin/reviews/${id}`);
    fetchReviews();
  };

  return (
    <div>
      <h2 className="admin-page-title">Reviews & Feedback</h2>

      {loading ? <p className="empty-state">Loading...</p> : reviews.length === 0 ? (
        <p className="empty-state">No reviews yet</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Feedback</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td><StarRating rating={r.rating} size={16} /></td>
                  <td style={{ maxWidth: 300 }}>{r.feedback}</td>
                  <td>
                    <span className={`status-badge ${r.approved ? 'status-approved' : 'status-pending'}`}>
                      {r.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className={`btn-sm ${r.approved ? 'btn-secondary' : 'btn-approve-light'}`}
                      onClick={() => handleToggle(r.id, r.approved)}>
                      {r.approved ? 'Hide' : 'Approve'}
                    </button>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(r.id)} style={{ marginLeft: 4 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
