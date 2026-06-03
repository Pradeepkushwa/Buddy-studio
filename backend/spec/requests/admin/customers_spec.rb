require 'rails_helper'

RSpec.describe 'Admin::Customers', type: :request do
  let!(:admin)    { create(:user, :admin) }
  let!(:customer) { create(:user) }
  let!(:staff)    { create(:user, :staff) }

  describe 'GET /admin/customers' do
    it 'returns only users with role user' do
      get '/admin/customers', headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)['customers'].map { |u| u['id'] }
      expect(ids).to include(customer.id)
      expect(ids).not_to include(staff.id)
      expect(ids).not_to include(admin.id)
    end

    it 'returns 403 for non-admin' do
      get '/admin/customers', headers: auth_headers_for(customer)
      expect(response).to have_http_status(:forbidden)
    end
  end
end
