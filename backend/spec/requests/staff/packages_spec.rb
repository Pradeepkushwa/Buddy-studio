require 'rails_helper'

RSpec.describe 'Staff::Packages', type: :request do
  let!(:staff)    { create(:user, :staff) }
  let!(:admin)    { create(:user, :admin) }
  let!(:regular)  { create(:user) }
  let!(:category) { create(:category) }
  let!(:equip)    { create(:equipment) }

  let(:valid_params) do
    {
      package: {
        name:               'Wedding Package',
        description:        'Full coverage',
        price:              20_000,
        discount_percentage: 5,
        category_id:        category.id
      }
    }
  end

  describe 'GET /staff/packages' do
    let!(:staff_pkg) { create(:package, category: category, created_by_id: staff.id) }
    let!(:other_pkg) { create(:package, category: category) }

    it 'returns only packages created by the current staff member' do
      get '/staff/packages', headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)['packages'].map { |p| p['id'] }
      expect(ids).to include(staff_pkg.id)
      expect(ids).not_to include(other_pkg.id)
    end
  end

  describe 'POST /staff/packages' do
    it 'creates package with pending_approval status for staff' do
      post '/staff/packages', params: valid_params, headers: auth_headers_for(staff)
      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body['package']['approval_status']).to eq('pending_approval')
    end

    it 'creates package with approved status for admin' do
      post '/staff/packages', params: valid_params, headers: auth_headers_for(admin)
      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body['package']['approval_status']).to eq('approved')
    end

    it 'returns 403 for regular user' do
      post '/staff/packages', params: valid_params, headers: auth_headers_for(regular)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'PATCH /staff/packages/:id' do
    let!(:pkg) { create(:package, category: category, created_by_id: staff.id, approval_status: 'approved') }

    it 'sets package back to pending_approval after staff update' do
      patch "/staff/packages/#{pkg.id}", params: { package: { name: 'Updated' } }, headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
      expect(pkg.reload.approval_status).to eq('pending_approval')
    end
  end

  describe 'DELETE /staff/packages/:id' do
    let!(:pkg) { create(:package, category: category, created_by_id: staff.id) }

    it 'soft deletes (deactivates) the package' do
      delete "/staff/packages/#{pkg.id}", headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
      expect(pkg.reload.active).to be false
    end
  end
end
