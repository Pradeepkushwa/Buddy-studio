require 'rails_helper'

RSpec.describe 'Admin::Dashboard', type: :request do
  let(:password) { 'Password123!' }
  let(:admin) { create(:user, :admin, password: password, password_confirmation: password) }
  let(:regular_user) { create(:user, password: password, password_confirmation: password) }

  describe 'GET /admin/dashboard' do
    context 'as an authenticated admin' do
      it 'returns 200' do
        get '/admin/dashboard', headers: auth_headers_for(admin)
        expect(response).to have_http_status(:ok)
      end
    end

    context 'as a regular user' do
      it 'returns 403 forbidden' do
        get '/admin/dashboard', headers: auth_headers_for(regular_user)
        expect(response).to have_http_status(:forbidden)
      end
    end

    context 'without any token' do
      it 'returns 401 unauthorized' do
        get '/admin/dashboard'
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
