require 'rails_helper'

RSpec.describe 'Auth API', type: :request do
  let(:password) { 'Password123!' }
  let(:user)  { create(:user,  password: password, password_confirmation: password) }
  let(:admin) { create(:user, :admin, password: password, password_confirmation: password) }

  # ─────────────────────────────────────────────────────────────
  # POST /auth/signup
  # ─────────────────────────────────────────────────────────────
  describe 'POST /auth/signup' do
    let(:signup_params) do
      {
        email:                 'newuser@example.com',
        password:              password,
        password_confirmation: password,
        name:                  'New User'
      }
    end

    context 'in non-production (development/test)' do
      it 'creates a user and sends OTP email (201)' do
        allow(UserMailer).to receive_message_chain(:otp_email, :deliver_later)
        expect {
          post '/auth/signup', params: signup_params
        }.to change(User, :count).by(1)
        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body['requires_otp']).to be true
      end

      it 'creates a staff user with pending status' do
        allow(UserMailer).to receive_message_chain(:otp_email, :deliver_later)
        post '/auth/signup', params: signup_params.merge(role: 'staff')
        expect(response).to have_http_status(:created)
        expect(User.find_by(email: 'newuser@example.com').role).to eq('staff')
      end

      it 'returns 422 for invalid role' do
        post '/auth/signup', params: signup_params.merge(role: 'superadmin')
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns 422 when trying to create admin via signup' do
        admin # ensure an admin already exists
        post '/auth/signup', params: signup_params.merge(role: 'admin')
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns 422 for duplicate email' do
        create(:user, email: 'newuser@example.com')
        post '/auth/signup', params: signup_params
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns 422 for mismatched password confirmation' do
        post '/auth/signup', params: signup_params.merge(password_confirmation: 'wrong')
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  # ─────────────────────────────────────────────────────────────
  # POST /auth/verify_otp
  # ─────────────────────────────────────────────────────────────
  describe 'POST /auth/verify_otp' do
    let!(:unverified_user) do
      u = create(:user, :unverified, password: password, password_confirmation: password)
      u.generate_otp!
      u
    end

    it 'verifies OTP and returns token (200)' do
      post '/auth/verify_otp', params: { email: unverified_user.email, otp_code: unverified_user.otp_code }
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['token']).to be_present
    end

    it 'returns 422 for wrong OTP' do
      post '/auth/verify_otp', params: { email: unverified_user.email, otp_code: '000000' }
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'returns 404 for unknown email' do
      post '/auth/verify_otp', params: { email: 'nobody@example.com', otp_code: '123456' }
      expect(response).to have_http_status(:not_found)
    end
  end

  # ─────────────────────────────────────────────────────────────
  # POST /auth/resend_otp
  # ─────────────────────────────────────────────────────────────
  describe 'POST /auth/resend_otp' do
    let!(:unverified_user) { create(:user, :unverified, password: password, password_confirmation: password) }

    it 'resends OTP and returns 200' do
      allow(UserMailer).to receive_message_chain(:otp_email, :deliver_later)
      post '/auth/resend_otp', params: { email: unverified_user.email }
      expect(response).to have_http_status(:ok)
    end

    it 'returns 404 for unknown email' do
      post '/auth/resend_otp', params: { email: 'nobody@example.com' }
      expect(response).to have_http_status(:not_found)
    end
  end

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
