# frozen_string_literal: true

module Admin
  class StaffController < ApplicationController
    before_action :authenticate_admin!

    # GET /admin/staff
    def index
      staff = User.where(role: 'staff').order(created_at: :desc)
      render json: {
        staff: staff.map { |u| member_response(u) }
      }, status: :ok
    end

    # PATCH /admin/staff/:id/approve
    def approve
      user = User.find_by(id: params[:id], role: 'staff')
      unless user
        return render json: { error: 'Staff not found' }, status: :not_found
      end

      user.update!(verification_status: 'approved')
      render json: { message: 'Staff approved', user: member_response(user) }, status: :ok
    end

    # PATCH /admin/staff/:id/reject
    def reject
      user = User.find_by(id: params[:id], role: 'staff')
      unless user
        return render json: { error: 'Staff not found' }, status: :not_found
      end

      user.update!(verification_status: 'pending')
      render json: { message: 'Staff rejected', user: member_response(user) }, status: :ok
    end

    private

    def member_response(u)
      {
        id: u.id,
        email: u.email,
        name: u.name,
        mobile_number: u.mobile_number,
        role: u.role,
        verification_status: u.verification_status,
        email_verified: u.email_verified,
        created_at: u.created_at
      }
    end
  end
end
