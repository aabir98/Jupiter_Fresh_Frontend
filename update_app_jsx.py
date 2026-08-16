import sys
import os

filepath = "src/App.jsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add DeliveryRatingWidget
target_delivery_rating = "const TajaCartLoader ="
replacement_delivery_rating = """const DeliveryRatingWidget = ({ order, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (order.delivery_partner_rating) {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#334155' }}>You Rated the Delivery Partner</h4>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <span key={star} style={{ color: star <= order.delivery_partner_rating ? '#eab308' : '#cbd5e1', fontSize: '16px' }}>★</span>
          ))}
        </div>
      </div>
    );
  }

  const submitReview = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      const response = await fetch(`http://192.168.0.112:8000/api/orders/${order.id}/rate-delivery`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
      if (response.ok) {
        onReviewSubmitted(order.id, rating);
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid rgba(234, 88, 12, 0.2)' }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#ea580c' }}>Rate the Delivery Partner</h4>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            style={{
              cursor: 'pointer',
              color: star <= (hoverRating || rating) ? '#eab308' : '#cbd5e1',
              fontSize: '24px',
              transition: 'color 0.2s'
            }}
          >
            ★
          </span>
        ))}
      </div>
      <button
        onClick={submitReview}
        disabled={submitting || !rating}
        style={{ width: '100%', backgroundColor: rating ? '#ea580c' : '#fdba74', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: rating ? 'pointer' : 'not-allowed', fontSize: '13px', boxSizing: 'border-box' }}
      >
        {submitting ? 'Submitting...' : 'Submit Rating'}
      </button>
    </div>
  );
};

const TajaCartLoader ="""

if target_delivery_rating in content:
    content = content.replace(target_delivery_rating, replacement_delivery_rating)
    print("Successfully added DeliveryRatingWidget")
else:
    print("Could not find TajaCartLoader")


# 2. Modify handleReviewSubmitted to also handle delivery rating (by adding handleDeliveryReviewSubmitted)
target_review_submitted = """  const handleReviewSubmitted = (orderId, rating, review) => {
    setPlacedOrders(placedOrders.map(o =>
      o.id === orderId ? { ...o, rating, review } : o
    ));
  };"""

replacement_review_submitted = """  const handleReviewSubmitted = (orderId, rating, review) => {
    setPlacedOrders(placedOrders.map(o =>
      o.id === orderId ? { ...o, rating, review } : o
    ));
  };

  const handleDeliveryReviewSubmitted = (orderId, delivery_partner_rating) => {
    setPlacedOrders(placedOrders.map(o =>
      o.id === orderId ? { ...o, delivery_partner_rating } : o
    ));
  };"""

if target_review_submitted in content:
    content = content.replace(target_review_submitted, replacement_review_submitted)
    print("Successfully added handleDeliveryReviewSubmitted")
else:
    print("Could not find handleReviewSubmitted")


# 3. Update the UI for statuses and Delivery Partner
target_ui = """                          <span style={{
                            backgroundColor: order.status === 'Delivered' ? '#dcfce7' : order.status === 'Picked Up' ? '#fef9c3' : '#f0fdf4',
                            color: order.status === 'Delivered' ? '#16a34a' : order.status === 'Picked Up' ? '#ca8a04' : 'var(--primary-green)',
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {order.status || 'Placed'}
                          </span>
                        </div>

                        {order.status === 'Picked Up' && order.eta && (
                          <div style={{ backgroundColor: '#fef9c3', color: '#854d0e', padding: '10px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                            <Timer size={16} /> ETA: {order.eta} minutes
                          </div>
                        )}
                        {order.status === 'Delivered' && order.eta && (
                          <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '10px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                            <Zap size={16} color="#eab308" /> Whoosh!! the order is delivered in {order.eta} minutes
                          </div>
                        )}"""

replacement_ui = """                          <span style={{
                            backgroundColor: order.status === 'Delivered' ? '#dcfce7' : (order.status === 'Placed' ? '#f1f5f9' : '#e0f2fe'),
                            color: order.status === 'Delivered' ? '#16a34a' : (order.status === 'Placed' ? '#475569' : '#0284c7'),
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {order.status || 'Placed'}
                          </span>
                        </div>

                        {['On the way to Hub', 'Picked Up', 'On the way', 'Arrived'].includes(order.status) && order.eta && (
                          <div style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '10px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                            <Timer size={16} /> ETA: {order.eta}
                          </div>
                        )}
                        {order.status === 'Delivered' && order.eta && (
                          <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '10px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                            <Zap size={16} color="#eab308" /> Whoosh!! the order is delivered in {order.eta}
                          </div>
                        )}
                        {order.dp_name && (
                          <div style={{ backgroundColor: '#f8fafc', color: '#334155', padding: '10px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', border: '1px solid #e2e8f0' }}>
                            <User size={16} color="#64748b" /> Delivery Partner: {order.dp_name} ({order.dp_phone})
                          </div>
                        )}"""

if target_ui in content:
    content = content.replace(target_ui, replacement_ui)
    print("Successfully replaced status UI block")
else:
    print("Could not find status UI block")


# 4. Add DeliveryRatingWidget usage
target_rating_usage = """                          <OrderRatingWidget order={order} onReviewSubmitted={handleReviewSubmitted} />
                        </div>"""

replacement_rating_usage = """                          <OrderRatingWidget order={order} onReviewSubmitted={handleReviewSubmitted} />
                          {order.status === 'Delivered' && (
                             <DeliveryRatingWidget order={order} onReviewSubmitted={handleDeliveryReviewSubmitted} />
                          )}
                        </div>"""

if target_rating_usage in content:
    content = content.replace(target_rating_usage, replacement_rating_usage)
    print("Successfully added DeliveryRatingWidget usage")
else:
    print("Could not find rating usage block")


with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Successfully updated App.jsx")
