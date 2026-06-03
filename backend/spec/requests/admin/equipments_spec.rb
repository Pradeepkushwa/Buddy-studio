require 'rails_helper'

RSpec.describe 'Admin::Equipments', type: :request do
  let!(:admin)   { create(:user, :admin) }
  let!(:regular) { create(:user) }
  let!(:equip)   { create(:equipment) }

  describe 'GET /admin/equipments' do
    it 'returns equipment list for admin' do
      get '/admin/equipments', headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)['equipments'].map { |e| e['id'] }
      expect(ids).to include(equip.id)
    end

    it 'returns 403 for regular user' do
      get '/admin/equipments', headers: auth_headers_for(regular)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'POST /admin/equipments' do
    it 'creates equipment' do
      post '/admin/equipments',
           params:  { equipment: { name: 'Drone Pro', equipment_type: 'drone' } },
           headers: auth_headers_for(admin)
      expect(response).to have_http_status(:created)
    end
  end

  describe 'PATCH /admin/equipments/:id' do
    it 'updates equipment' do
      patch "/admin/equipments/#{equip.id}",
            params:  { equipment: { name: 'Updated Cam' } },
            headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(equip.reload.name).to eq('Updated Cam')
    end
  end

  describe 'DELETE /admin/equipments/:id' do
    it 'soft-deactivates equipment' do
      delete "/admin/equipments/#{equip.id}", headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(equip.reload.active).to be false
    end
  end
end
