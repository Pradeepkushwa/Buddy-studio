require 'rails_helper'

RSpec.describe 'Admin::Categories', type: :request do
  let!(:admin)   { create(:user, :admin) }
  let!(:regular) { create(:user) }
  let!(:cat)     { create(:category) }

  describe 'GET /admin/categories' do
    it 'returns all categories for admin' do
      get '/admin/categories', headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)['categories'].map { |c| c['id'] }
      expect(ids).to include(cat.id)
    end

    it 'returns 403 for non-admin' do
      get '/admin/categories', headers: auth_headers_for(regular)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'POST /admin/categories' do
    it 'creates a category' do
      post '/admin/categories',
           params:  { category: { name: 'New Cat', description: 'desc', position: 5 } },
           headers: auth_headers_for(admin)
      expect(response).to have_http_status(:created)
    end
  end

  describe 'PATCH /admin/categories/:id' do
    it 'updates a category' do
      patch "/admin/categories/#{cat.id}",
            params:  { category: { name: 'Renamed' } },
            headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(cat.reload.name).to eq('Renamed')
    end
  end

  describe 'DELETE /admin/categories/:id' do
    it 'soft-deactivates a category' do
      delete "/admin/categories/#{cat.id}", headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(cat.reload.active).to be false
    end
  end
end
