class UserSession < ApplicationRecord
  belongs_to :user

  MAX_SESSIONS = 2

  scope :active, -> { where('expires_at > ?', Time.current) }
  scope :oldest_first, -> { order(created_at: :asc) }

  def self.create_for(user, jti:, expires_at:)
    # If user already has MAX_SESSIONS active sessions, delete the oldest one(s)
    active_sessions = where(user: user).active.oldest_first.to_a
    if active_sessions.size >= MAX_SESSIONS
      sessions_to_remove = active_sessions.first(active_sessions.size - MAX_SESSIONS + 1)
      where(id: sessions_to_remove.map(&:id)).delete_all
    end

    create!(user: user, jti: jti, expires_at: expires_at)
  end

  def self.valid?(jti)
    exists?(jti: jti, expires_at: Time.current..)
  end
end
