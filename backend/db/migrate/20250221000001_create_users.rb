# frozen_string_literal: true

class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :email, null: false, index: { unique: true }
      t.string :password_digest, null: false
      t.string :name
      t.string :role, null: false, default: 'user' # admin, staff, user
      t.string :verification_status, default: 'pending' # pending, approved (for staff); verified (for user after OTP)
      t.string :otp_code
      t.datetime :otp_sent_at
      t.boolean :email_verified, default: false

      t.timestamps
    end
  end
end
