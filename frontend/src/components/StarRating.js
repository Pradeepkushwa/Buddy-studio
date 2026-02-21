export default function StarRating({ rating, onChange, size = 20 }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="star-rating" style={{ fontSize: size }}>
      {stars.map(star => (
        <span
          key={star}
          className={`star ${star <= rating ? 'star-filled' : 'star-empty'}`}
          onClick={() => onChange && onChange(star)}
          style={{ cursor: onChange ? 'pointer' : 'default' }}
        >
          {star <= rating ? '\u2605' : '\u2606'}
        </span>
      ))}
    </div>
  );
}
