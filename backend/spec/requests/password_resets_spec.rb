require 'rails_helper'

RSpec.describe 'Password Resets', type: :request do
  let!(:user) { create(:user) }

  describe 'POST /password/forgot' do
    it 'sends OTP email for existing user and returns 200' do
      allow(UserMailer).to receive_message_chain(:password_reset_email, :deliver_later)
      post '/password/forgot', params: { email: user.email }
      expect(response).to have_http_status(:ok)
    end

    it 'returns 404 for unknown email' do
      post '/password/forgot', params: { email: 'nobody@example.com' }
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST /password/verify_otp' do
    before { user.generate_reset_otp! }

    it 'returns 200 for valid OTP' do
      post '/password/verify_otp', params: { email: user.email, otp_code: user.reset_otp }
      expect(response).to have_http_status(:ok)
    end

    it 'returns 422 for wrong OTP' do
      post '/password/verify_otp', params: { email: user.email, otp_code: '000000' }
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'returns 404 for unknown email' do
      post '/password/verify_otp', params: { email: 'nobody@example.com', otp_code: '123456' }
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'POST /password/reset' do
    before { user.generate_reset_otp! }

    it 'resets the password when OTP and passwords are valid' do
      post '/password/reset', params: {
        email:                 user.email,
        otp_code:              user.reset_otp,
        password:              'NewPass123!',
        password_confirmation: 'NewPass123!'
      }
      expect(response).to have_http_status(:ok)
    end

    it 'returns 422 when passwords do not match' do
      post '/password/reset', params: {
        email:                 user.email,
        otp_code:              user.reset_otp,
        password:              'NewPass123!',
        password_confirmation: 'DifferentPass!'
      }
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'returns 422 for wrong OTP' do
      post '/password/reset', params: {
        email:                 user.email,
        otp_code:              '000000',
        password:              'NewPass123!',
        password_confirmation: 'NewPass123!'
      }
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'returns 422 for password shorter than 6 characters' do
      post '/password/reset', params: {
        email:                 user.email,
        otp_code:              user.reset_otp,
        password:              '12345',
        password_confirmation: '12345'
      }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
