# frozen_string_literal: true

module Admin
  class CustomersController < ApplicationController
    before_action :authenticate_admin!

    # GET /admin/customers
    def index
      customers = User.where(role: 'user').order(created_at: :desc)
      render json: {
        customers: customers.map { |u| customer_response(u) }
      }, status: :ok
    end

    private

    def customer_response(u)
      {
        id: u.id,
        email: u.email,
        name: u.name,
        mobile_number: u.mobile_number,
        verification_status: u.verification_status,
        email_verified: u.email_verified,
        created_at: u.created_at
      }
    end
  end
end
