class CreatePayments < ActiveRecord::Migration[8.1]
  def change
    create_table :payments do |t|
      t.references :booking, null: false, foreign_key: true
      t.string :razorpay_order_id
      t.string :razorpay_payment_id
      t.decimal :amount, precision: 12, scale: 2, null: false
      t.string :currency
      t.string :status
      t.string :payment_method
      t.boolean :signature_verified
      t.decimal :amount_refunded, precision: 12, scale: 2, default: 0
      t.string :refund_status
      t.datetime :captured_at
      t.datetime :refunded_at

      t.timestamps
    end
  end
end
