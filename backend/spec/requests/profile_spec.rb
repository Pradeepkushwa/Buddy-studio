require 'rails_helper'

RSpec.describe 'Profile', type: :request do
  let!(:user) { create(:user) }
  let(:headers) { auth_headers_for(user) }

  describe 'GET /profile' do
    it 'returns current user profile' do
      get '/profile', headers: headers
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['user']['email']).to eq(user.email)
    end

    it 'returns 401 without auth token' do
      get '/profile'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PATCH /profile' do
    it 'updates name and mobile_number' do
      patch '/profile',
            params:  { profile: { name: 'New Name', mobile_number: '9999999999' } },
            headers: headers
      expect(response).to have_http_status(:ok)
      expect(user.reload.name).to eq('New Name')
    end

    it 'returns 401 without auth token' do
      patch '/profile', params: { profile: { name: 'New Name' } }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /profile/avatar' do
    let(:upload_dir) { Rails.root.join('public', 'uploads', 'avatars') }

    before { FileUtils.mkdir_p(upload_dir) }

    it 'rejects requests with no file' do
      post '/profile/avatar', headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'rejects non-image file extensions' do
      file = Rack::Test::UploadedFile.new(
        StringIO.new('fake content'), 'application/octet-stream', original_filename: 'malware.exe'
      )
      post '/profile/avatar', params: { avatar: file }, headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'uploads a valid image and returns avatar_url' do
      file = Rack::Test::UploadedFile.new(
        StringIO.new("\xFF\xD8\xFF"), 'image/jpeg', original_filename: 'photo.jpg'
      )
      post '/profile/avatar', params: { avatar: file }, headers: headers
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['avatar_url']).to start_with('/uploads/avatars/')
    end

    it 'returns 401 without auth token' do
      post '/profile/avatar'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /profile/request_email_change' do
    let(:new_email) { 'newemail@example.com' }

    it 'sends OTP to new email and returns 200' do
      allow(UserMailer).to receive_message_chain(:email_change_otp, :deliver_later)
      post '/profile/request_email_change', params: { new_email: new_email }, headers: headers
      expect(response).to have_http_status(:ok)
    end

    it 'returns 422 if new email is already taken' do
      other_user = create(:user)
      post '/profile/request_email_change', params: { new_email: other_user.email }, headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'POST /profile/verify_email_change' do
    before do
      allow(UserMailer).to receive_message_chain(:email_change_otp, :deliver_later)
      post '/profile/request_email_change', params: { new_email: 'changed@example.com' }, headers: headers
      user.reload
    end

    it 'updates email when OTP is valid' do
      post '/profile/verify_email_change', params: { otp_code: user.reset_otp }, headers: headers
      expect(response).to have_http_status(:ok)
      expect(user.reload.email).to eq('changed@example.com')
    end

    it 'returns 422 for wrong OTP' do
      post '/profile/verify_email_change', params: { otp_code: '000000' }, headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
