require 'rails_helper'

RSpec.describe 'Packages (public)', type: :request do
  let!(:cat)            { create(:category) }
  let!(:active_pkg)     { create(:package, category: cat, active: true, approval_status: 'approved') }
  let!(:pending_pkg)    { create(:package, :pending_approval, category: cat) }
  let!(:inactive_pkg)   { create(:package, :inactive, category: cat) }

  describe 'GET /packages' do
    it 'returns active approved packages' do
      get '/packages'
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)['packages'].map { |p| p['id'] }
      expect(ids).to include(active_pkg.id)
      expect(ids).not_to include(pending_pkg.id)
      expect(ids).not_to include(inactive_pkg.id)
    end

    it 'filters by category_id' do
      other_cat = create(:category)
      other_pkg = create(:package, category: other_cat, active: true, approval_status: 'approved')
      get '/packages', params: { category_id: cat.id }
      ids = JSON.parse(response.body)['packages'].map { |p| p['id'] }
      expect(ids).to include(active_pkg.id)
      expect(ids).not_to include(other_pkg.id)
    end
  end

  describe 'GET /packages/:id' do
    it 'returns a single active approved package' do
      get "/packages/#{active_pkg.id}"
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['package']['id']).to eq(active_pkg.id)
    end

    it 'returns 404 for an inactive package' do
      get "/packages/#{inactive_pkg.id}"
      expect(response).to have_http_status(:not_found)
    end
  end
end
