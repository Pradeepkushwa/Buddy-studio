require 'rails_helper'

RSpec.describe 'Auth API', type: :request do
  let(:password) { 'Password123!' }
  let(:user) { create(:user, password: password, password_confirmation: password) }
  let(:admin) { create(:user, :admin, password: password, password_confirmation: password) }

  describe 'POST /auth/login' do
    context 'with valid credentials' do
      it 'returns 200 with token and user data' do
        post '/auth/login', params: { email: user.email, password: password }, as: :json

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['token']).to be_present
        expect(json['expires_at']).to be_present
        expect(json['user']['email']).to eq(user.email)
        expect(json['user']['role']).to eq('user')
      end

      it 'creates a session record in DB' do
        expect {
          post '/auth/login', params: { email: user.email, password: password }, as: :json
        }.to change { UserSession.count }.by(1)
      end

      it 'stores a unique jti in the session' do
        post '/auth/login', params: { email: user.email, password: password }, as: :json
        session = UserSession.last
        expect(session.jti).to be_present
        expect(session.user).to eq(user)
      end
    end

    context 'with invalid credentials' do
      it 'returns 401 for wrong password' do
        post '/auth/login', params: { email: user.email, password: 'wrongpass' }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end

      it 'returns 401 for non-existent email' do
        post '/auth/login', params: { email: 'nobody@example.com', password: password }, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with unverified user' do
      it 'returns 403' do
        unverified = create(:user, :unverified, password: password, password_confirmation: password)
        post '/auth/login', params: { email: unverified.email, password: password }, as: :json
        expect(response).to have_http_status(:forbidden)
      end
    end

    context 'session limit enforcement (max 2 devices)' do
      it 'removes the oldest session when a 3rd device logs in' do
        # Device 1
        post '/auth/login', params: { email: user.email, password: password }, as: :json
        first_jti = UserSession.order(created_at: :asc).first.jti

        # Device 2
        post '/auth/login', params: { email: user.email, password: password }, as: :json

        # Device 3 — should kick device 1
        post '/auth/login', params: { email: user.email, password: password }, as: :json

        expect(UserSession.where(user: user).count).to eq(2)
        expect(UserSession.exists?(jti: first_jti)).to be false
      end
    end
  end

  describe 'GET /auth/me' do
    context 'with valid token' do
      it 'returns current user info' do
        headers = auth_headers_for(user)
        get '/auth/me', headers: headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['user']['id']).to eq(user.id)
      end
    end

    context 'with expired/invalid token' do
      it 'returns 401' do
        get '/auth/me', headers: { 'Authorization' => 'Bearer invalid.token.here' }
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'after session is deleted (forced logout from another device)' do
      it 'returns 401' do
        headers = auth_headers_for(user)
        UserSession.where(user: user).delete_all

        get '/auth/me', headers: headers
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'DELETE /auth/logout' do
    it 'deletes the session and returns 200' do
      headers = auth_headers_for(user)
      jti = UserSession.last.jti

      expect {
        delete '/auth/logout', headers: headers
      }.to change { UserSession.count }.by(-1)

      expect(response).to have_http_status(:ok)
      expect(UserSession.exists?(jti: jti)).to be false
    end

    it 'returns 200 even with an invalid/missing token' do
      delete '/auth/logout', headers: { 'Authorization' => 'Bearer bad.token' }
      expect(response).to have_http_status(:ok)
    end
  end
end
