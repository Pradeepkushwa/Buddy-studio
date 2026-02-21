# frozen_string_literal: true

class CreateReviews < ActiveRecord::Migration[8.1]
  def change
    create_table :reviews do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.integer :rating, null: false
      t.text :feedback
      t.boolean :approved, default: false, null: false
      t.references :booking, foreign_key: true

      t.timestamps
    end

    add_index :reviews, :approved
    add_index :reviews, :rating
  end
end
