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
      created_at: b.created_at
    }
  end
end
