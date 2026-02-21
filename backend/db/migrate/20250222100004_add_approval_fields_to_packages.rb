# frozen_string_literal: true

class AddApprovalFieldsToPackages < ActiveRecord::Migration[8.1]
  def change
    add_column :packages, :approval_status, :string, default: 'approved', null: false
    add_column :packages, :created_by_id, :bigint
    add_index :packages, :approval_status
    add_foreign_key :packages, :users, column: :created_by_id
  end
end
