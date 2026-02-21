# frozen_string_literal: true

module Admin
  class BookingsController < ApplicationController
    before_action :authenticate_admin!

    def index
      bookings = Booking.includes(:user, :package).recent
      bookings = bookings.where(status: params[:status]) if params[:status].present?
      render json: { bookings: bookings.map { |b| booking_json(b) } }
    end

    def update
      booking = Booking.find(params[:id])
      if booking.update(status: params[:status])
        render json: { booking: booking_json(booking), message: "Booking #{params[:status]}" }
      else
        render json: { errors: booking.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def booking_json(b)
      {
        id: b.id,
        user_name: b.user.name,
        user_email: b.user.email,
        package_name: b.package.name,
        package_id: b.package_id,
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
end
