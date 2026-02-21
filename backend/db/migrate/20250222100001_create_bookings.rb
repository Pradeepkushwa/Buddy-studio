# frozen_string_literal: true

class CreateBookings < ActiveRecord::Migration[8.1]
  def change
    create_table :bookings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :package, null: false, foreign_key: true
      t.date :event_start_date, null: false
      t.date :event_end_date, null: false
      t.text :event_address, null: false
      t.string :phone_number, null: false
      t.string :email, null: false
      t.string :alternate_contact_number
      t.text :notes
      t.string :status, null: false, default: 'pending'
      t.decimal :amount, precision: 10, scale: 2, null: false

      t.timestamps
    end

    add_index :bookings, :status
  end
end
