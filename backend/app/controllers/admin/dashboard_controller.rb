# frozen_string_literal: true

module Admin
  class DashboardController < ApplicationController
    before_action :authenticate_admin!

    def index
      render json: {
        customers: User.where(role: 'user').count,
        staff: User.where(role: 'staff').count,
        bookings: {
          pending: Booking.pending.count,
          confirmed: Booking.confirmed.count,
          upcoming: Booking.upcoming.count,
          completed: Booking.completed.count,
          total: Booking.count
        },
        appointments: {
          new: Appointment.where(status: 'new').count,
          contacted: Appointment.where(status: 'contacted').count,
          total: Appointment.count
        },
        packages: {
          active: Package.active.count,
          featured: Package.featured.count,
          pending_approval: Package.where(approval_status: 'pending_approval').count,
          total: Package.count
        },
        reviews: {
          total: Review.count,
          approved: Review.approved.count,
          pending: Review.pending.count,
          average_rating: Review.approved.average(:rating)&.to_f&.round(1) || 0
        },
        gallery_items: GalleryItem.active.count
      }
    end
  end
end
