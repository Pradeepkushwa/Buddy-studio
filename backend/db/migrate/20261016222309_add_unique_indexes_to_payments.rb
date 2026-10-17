class AddUniqueIndexesToPayments < ActiveRecord::Migration[8.1]
  def change
    add_index :payments,
              :razorpay_order_id,
              unique: true

    add_index :payments,
              :razorpay_payment_id,
              unique: true

    add_index :payments,
              :razorpay_refund_id,
              unique: true
  end
end
