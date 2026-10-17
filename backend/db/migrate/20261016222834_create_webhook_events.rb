class CreateWebhookEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :webhook_events do |t|
      t.string :provider
      t.string :event_id
      t.string :event_type
      t.datetime :processed_at

      t.timestamps
    end
  end
end
