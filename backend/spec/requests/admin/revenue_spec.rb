require 'rails_helper'

RSpec.describe 'Admin::Revenue', type: :request do
  let!(:admin)   { create(:user, :admin) }
  let!(:regular) { create(:user) }

  describe 'GET /admin/revenue' do
    it 'returns 200 for admin' do
      get '/admin/revenue', headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
    end

    it 'returns 403 for non-admin user' do
      get '/admin/revenue', headers: auth_headers_for(regular)
      expect(response).to have_http_status(:forbidden)
    end

    it 'accepts period param and returns chart data' do
      %w[day week month 3months 6months year 3years all].each do |period|
        get '/admin/revenue', params: { period: period }, headers: auth_headers_for(admin)
        expect(response).to have_http_status(:ok)
      end
    end

    it 'returns top_packages and status_breakdown keys' do
      get '/admin/revenue', headers: auth_headers_for(admin)
      body = JSON.parse(response.body)
      expect(body.keys).to include('top_packages', 'status_breakdown')
    end
  end
end
