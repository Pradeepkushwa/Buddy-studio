# frozen_string_literal: true

class CreatePackages < ActiveRecord::Migration[8.1]
  def change
    create_table :packages do |t|
      t.references :category, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.decimal :price, precision: 10, scale: 2, null: false
      t.decimal :discount_percentage, precision: 5, scale: 2, default: 0
      t.decimal :offer_price, precision: 10, scale: 2
      t.boolean :active, default: true, null: false
      t.boolean :featured, default: false, null: false

      t.timestamps
    end

    add_index :packages, :active
    add_index :packages, :featured
  end
end
