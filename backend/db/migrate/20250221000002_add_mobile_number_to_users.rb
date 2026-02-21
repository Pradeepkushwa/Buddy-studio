# frozen_string_literal: true

class AddMobileNumberToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :mobile_number, :string
  end
end
