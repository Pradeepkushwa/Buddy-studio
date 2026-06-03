require 'rails_helper'

RSpec.describe 'Admin::Packages', type: :request do
  let!(:admin)   { create(:user, :admin) }
  let!(:regular) { create(:user) }
  let!(:cat)     { create(:category) }
  let!(:pkg)     { create(:package, :pending_approval, category: cat) }

  describe 'GET /admin/packages' do
    it 'returns all packages for admin' do
      get '/admin/packages', headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)['packages'].map { |p| p['id'] }
      expect(ids).to include(pkg.id)
    end

    it 'returns 403 for non-admin' do
      get '/admin/packages', headers: auth_headers_for(regular)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'POST /admin/packages' do
    it 'creates an approved package' do
      post '/admin/packages',
           params:  { package: { name: 'Admin Pkg', description: 'desc', price: 15000, discount_percentage: 0, category_id: cat.id } },
           headers: auth_headers_for(admin)
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)['package']['approval_status']).to eq('approved')
    end
  end

  describe 'PATCH /admin/packages/:id' do
    it 'updates a package' do
      patch "/admin/packages/#{pkg.id}",
            params:  { package: { name: 'Updated' } },
            headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(pkg.reload.name).to eq('Updated')
    end
  end

  describe 'PATCH /admin/packages/:id/approve' do
    it 'approves a pending package' do
      patch "/admin/packages/#{pkg.id}/approve", headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(pkg.reload.approval_status).to eq('approved')
    end
  end

  describe 'PATCH /admin/packages/:id/reject' do
    it 'rejects a pending package' do
      patch "/admin/packages/#{pkg.id}/reject", headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(pkg.reload.approval_status).to eq('rejected')
    end
  end

  describe 'DELETE /admin/packages/:id' do
    it 'soft-deactivates a package' do
      delete "/admin/packages/#{pkg.id}", headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(pkg.reload.active).to be false
    end
  end
end
