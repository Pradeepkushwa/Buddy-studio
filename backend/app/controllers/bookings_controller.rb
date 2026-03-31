# frozen_string_literal: true

class BookingsController < ApplicationController
  before_action :require_active_user!

  def create
    package = Package.active.approved_packages.find(params[:booking][:package_id])
    booking = current_user.bookings.build(booking_params)
    booking.amount = package.offer_price || package.price

    if booking.save
      render json: { booking: booking_json(booking), message: 'Booking created successfully!' }, status: :created
    else
      render json: { errors: booking.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def mine
    bookings = current_user.bookings.includes(:package).recent
    render json: { bookings: bookings.map { |b| booking_json(b) } }
  end

  def create_order
    booking = current_user.bookings.find_by(id: params[:id])
    unless booking
      render json: { error: 'Booking not found' }, status: :not_found
      return
    end
    if booking.payment_id.present?
      render json: { error: 'Payment already completed', booking: booking_json(booking) }, status: :unprocessable_entity
      return
    end
    unless booking.status == 'pending'
      render json: { error: 'Booking is not pending payment' }, status: :unprocessable_entity
      return
    end
    key_id = ENV['RAZORPAY_KEY_ID']
    key_secret = ENV['RAZORPAY_KEY_SECRET']
    if key_id.blank? || key_secret.blank?
      render json: { error: 'Payment gateway not configured' }, status: :service_unavailable
      return
    end
    Razorpay.setup(key_id, key_secret)
    amount_paise = (booking.amount.to_f * 100).to_i
    order = Razorpay::Order.create(
      amount: amount_paise,
      currency: 'INR',
      receipt: "booking_#{booking.id}"
    )
    booking.update!(razorpay_order_id: order.id)
    render json: {
      order_id: order.id,
      key_id: key_id,
      amount: amount_paise,
      currency: 'INR'
    }
  rescue Razorpay::Error => e
    render json: { error: "Payment gateway error: #{e.message}" }, status: :unprocessable_entity
  end

  def verify_payment
    booking = current_user.bookings.find_by(id: params[:id])
    unless booking
      render json: { error: 'Booking not found' }, status: :not_found
      return
    end
    payment_id = params[:razorpay_payment_id]
    order_id = params[:razorpay_order_id]
    signature = params[:razorpay_signature]
    if payment_id.blank? || order_id.blank? || signature.blank?
      render json: { error: 'Missing payment details' }, status: :unprocessable_entity
      return
    end
    unless booking.razorpay_order_id == order_id
      render json: { error: 'Order does not match booking' }, status: :unprocessable_entity
      return
    end
    if ENV['RAZORPAY_KEY_SECRET'].blank?
      render json: { error: 'Payment gateway not configured' }, status: :service_unavailable
      return
    end
    Razorpay.setup(ENV['RAZORPAY_KEY_ID'], ENV['RAZORPAY_KEY_SECRET'])
    Razorpay::Utility.verify_payment_signature(
      razorpay_payment_id: payment_id,
      razorpay_order_id: order_id,
      razorpay_signature: signature
    )
    booking.update!(payment_id: payment_id, status: 'confirmed')
    render json: { message: 'Payment verified', booking: booking_json(booking) }
  rescue SecurityError
    render json: { error: 'Payment verification failed' }, status: :unprocessable_entity
  rescue Razorpay::Error => e
    render json: { error: "Payment error: #{e.message}" }, status: :unprocessable_entity
  end

  private

  def booking_params
    params.require(:booking).permit(
      :package_id, :event_start_date, :event_end_date,
      :event_address, :phone_number, :email,
      :alternate_contact_number, :notes
    )
  end

  def booking_json(b)
    {
      id: b.id,
      package_id: b.package_id,
      package_name: b.package.name,
      package_price: b.package.price.to_f,
      amount: b.amount.to_f,
      event_start_date: b.event_start_date,
      event_end_date: b.event_end_date,
      event_address: b.event_address,
      phone_number: b.phone_number,
      email: b.email,
      alternate_contact_number: b.alternate_contact_number,
      notes: b.notes,
      status: b.status,
      payment_id: b.payment_id,
      created_at: b.created_at
    }
  end
end
