class AddRazorpayRefundIdToPayments < ActiveRecord::Migration[8.1]
  def change
    add_column :payments, :razorpay_refund_id, :string
  end
end
