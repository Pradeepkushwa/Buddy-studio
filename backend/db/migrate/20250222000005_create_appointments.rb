# frozen_string_literal: true

class CreateAppointments < ActiveRecord::Migration[8.1]
  def change
    create_table :appointments do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.string :mobile_number
      t.references :package, foreign_key: true
      t.date :preferred_date
      t.string :event_type
      t.text :message
      t.string :status, null: false, default: 'new'

      t.timestamps
    end

    add_index :appointments, :status
  end
end
