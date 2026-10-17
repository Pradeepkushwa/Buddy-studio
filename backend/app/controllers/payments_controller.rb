class PaymentsController < ApplicationController
  before_action :require_active_user!

 def refund
  booking = current_user.bookings.find(params[:booking_id])

  payment = booking.payments.find_by!(status: 'captured')

  if payment.razorpay_payment_id.blank?
    return render json: {
      error: 'Razorpay payment ID not found'
    }, status: :unprocessable_entity
  end

  # Idempotency guard for our current full-refund flow
  if payment.refunds.where(status: %w[pending processed]).exists?
    return render json: {
      error: 'Refund has already been initiated for this payment'
    }, status: :unprocessable_entity
  end

  Razorpay.setup(
    ENV.fetch('RAZORPAY_KEY_ID'),
    ENV.fetch('RAZORPAY_KEY_SECRET')
  )

  razorpay_payment =
    Razorpay::Payment.fetch(payment.razorpay_payment_id)

  unless razorpay_payment.status == 'captured'
    return render json: {
      error: 'Only captured payments can be refunded'
    }, status: :unprocessable_entity
  end

  razorpay_refund = razorpay_payment.refund

  refund = payment.refunds.find_or_create_by!(
    razorpay_refund_id: razorpay_refund.id
  ) do |record|
    record.amount = razorpay_refund.amount.to_d / 100
    record.currency = razorpay_refund.currency || 'INR'
    record.status = razorpay_refund.status
    record.processed_at = Time.current if razorpay_refund.status == 'processed'
  end

  render json: {
    message: 'Refund initiated successfully',
    refund_id: refund.razorpay_refund_id,
    refund_status: refund.status
  }

  rescue ActiveRecord::RecordNotFound
  render json: {
    error: 'Booking or captured payment not found'
  }, status: :not_found

  rescue Razorpay::Error => e
  render json: {
    error: "Refund failed: #{e.message}"
  }, status: :unprocessable_entity
 end
end
