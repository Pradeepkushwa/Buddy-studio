class AddResetOtpToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :reset_otp, :string
    add_column :users, :reset_otp_sent_at, :datetime
  end
end
