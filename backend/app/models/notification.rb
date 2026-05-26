# frozen_string_literal: true

class Notification < ApplicationRecord
  TYPES = %w[new_booking new_appointment booking_updated new_review].freeze

  validates :title, presence: true
  validates :notification_type, inclusion: { in: TYPES }

  scope :unread, -> { where(read: false) }
  scope :recent, -> { order(created_at: :desc).limit(20) }

  def self.create_for_new_booking(booking)
    create!(
      title: 'New Booking',
      message: "#{booking.user.name} booked #{booking.package.name} for #{booking.event_start_date}",
      notification_type: 'new_booking',
      link: '/admin/bookings'
    )
  end

  def self.create_for_new_appointment(appointment)
    create!(
      title: 'New Appointment Request',
      message: "#{appointment.name} requested an appointment for #{appointment.event_type || 'an event'}",
      notification_type: 'new_appointment',
      link: '/admin/appointments'
    )
  end

  def self.create_for_booking_update(booking)
    create!(
      title: "Booking #{booking.status.capitalize}",
      message: "#{booking.user.name}'s booking for #{booking.package.name} marked as #{booking.status}",
      notification_type: 'booking_updated',
      link: '/admin/bookings'
    )
  end

  def self.create_for_new_review(review)
    create!(
      title: 'New Review Submitted',
      message: "#{review.name} left a #{review.rating}-star review",
      notification_type: 'new_review',
      link: '/admin/reviews'
    )
  end
end
