# frozen_string_literal: true

class CreateGalleryItems < ActiveRecord::Migration[8.1]
  def change
    create_table :gallery_items do |t|
      t.string :title, null: false
      t.string :media_url, null: false
      t.string :media_type, null: false, default: 'photo'
      t.text :description
      t.string :category
      t.integer :position, default: 0, null: false
      t.boolean :active, default: true, null: false
      t.references :uploaded_by, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :gallery_items, :media_type
    add_index :gallery_items, :category
    add_index :gallery_items, :active
  end
end
