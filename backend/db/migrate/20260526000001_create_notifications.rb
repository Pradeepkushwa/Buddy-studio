class CreateNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :notifications do |t|
      t.string  :title,             null: false
      t.text    :message
      t.string  :notification_type, null: false
      t.string  :link
      t.boolean :read,              default: false, null: false
      t.timestamps
    end

    add_index :notifications, :read
    add_index :notifications, :created_at
  end
end
