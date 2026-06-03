require 'rails_helper'

RSpec.describe UserSession, type: :model do
  describe 'associations' do
    it { should belong_to(:user) }
  end

  describe '.valid?' do
    it 'returns true for an active session' do
      session = create(:user_session, expires_at: 1.hour.from_now)
      expect(UserSession.valid?(session.jti)).to be true
    end

    it 'returns false for an expired session' do
      session = create(:user_session, expires_at: 1.hour.ago)
      expect(UserSession.valid?(session.jti)).to be false
    end

    it 'returns false for an unknown jti' do
      expect(UserSession.valid?('non-existent-jti')).to be false
    end
  end

  describe '.create_for' do
    let(:user) { create(:user) }

    def new_session_attrs
      { jti: SecureRandom.uuid, expires_at: 8.hours.from_now }
    end

    it 'creates a new session for the user' do
      attrs = new_session_attrs
      expect {
        UserSession.create_for(user, **attrs)
      }.to change { UserSession.count }.by(1)
    end

    it 'allows up to MAX_SESSIONS active sessions' do
      UserSession::MAX_SESSIONS.times { UserSession.create_for(user, **new_session_attrs) }
      expect(UserSession.where(user: user).count).to eq(UserSession::MAX_SESSIONS)
    end

    it 'removes the oldest session when MAX_SESSIONS is exceeded' do
      first_session = UserSession.create_for(user, **new_session_attrs)
      UserSession.create_for(user, **new_session_attrs)

      # 3rd login — oldest (first) session should be deleted
      UserSession.create_for(user, **new_session_attrs)

      expect(UserSession.exists?(first_session.id)).to be false
      expect(UserSession.where(user: user).count).to eq(UserSession::MAX_SESSIONS)
    end

    it 'does not affect other users sessions' do
      other_user = create(:user)
      other_session = UserSession.create_for(other_user, **new_session_attrs)

      UserSession::MAX_SESSIONS.times { UserSession.create_for(user, **new_session_attrs) }
      UserSession.create_for(user, **new_session_attrs)

      expect(UserSession.exists?(other_session.id)).to be true
    end
  end
end
