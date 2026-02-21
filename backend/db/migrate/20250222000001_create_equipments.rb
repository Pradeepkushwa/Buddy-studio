# frozen_string_literal: true

class CreateEquipments < ActiveRecord::Migration[8.1]
  def change
    create_table :equipment do |t|
      t.string :name, null: false
      t.string :equipment_type, null: false
      t.text :description
      t.boolean :active, default: true, null: false

      t.timestamps
    end

    add_index :equipment, :equipment_type
    add_index :equipment, :active
  end
end
