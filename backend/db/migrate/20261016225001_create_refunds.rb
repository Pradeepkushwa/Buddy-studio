class CreateRefunds < ActiveRecord::Migration[8.1]
def change
    create_table :refunds do |t|
      t.references :payment, null: false, foreign_key: true

      t.string :razorpay_refund_id, null: false

      t.decimal :amount,
                precision: 10,
                scale: 2,
                null: false

      t.string :currency,
               null: false,
               default: 'INR'

      t.string :status,
               null: false

      t.datetime :processed_at

      t.timestamps
    end

    add_index :refunds,
              :razorpay_refund_id,
              unique: true
  end
end
