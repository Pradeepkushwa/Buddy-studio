# frozen_string_literal: true

class CreatePackageItems < ActiveRecord::Migration[8.1]
  def change
    create_table :package_items do |t|
      t.references :package, null: false, foreign_key: true
      t.references :equipment, null: false, foreign_key: true
      t.integer :quantity, null: false, default: 1
      t.string :notes

      t.timestamps
    end
  end
end
