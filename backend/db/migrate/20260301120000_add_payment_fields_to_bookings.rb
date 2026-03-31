# frozen_string_literal: true

class AddPaymentFieldsToBookings < ActiveRecord::Migration[8.1]
  def change
    add_column :bookings, :payment_id, :string
    add_column :bookings, :razorpay_order_id, :string
  end
end
