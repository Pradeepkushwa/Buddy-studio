require 'rails_helper'

RSpec.describe 'Staff::Equipments', type: :request do
  let!(:staff)   { create(:user, :staff) }
  let!(:admin)   { create(:user, :admin) }
  let!(:regular) { create(:user) }

  describe 'GET /staff/equipments' do
    let!(:equip) { create(:equipment) }

    it 'allows staff to list equipment' do
      get '/staff/equipments', headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
    end

    it 'allows admin to list equipment' do
      get '/staff/equipments', headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
    end

    it 'returns 403 for regular user' do
      get '/staff/equipments', headers: auth_headers_for(regular)
      expect(response).to have_http_status(:forbidden)
    end

    it 'returns 403 for unauthenticated request' do
      get '/staff/equipments'
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'POST /staff/equipments' do
    let(:valid_params) { { equipment: { name: 'Canon EOS', equipment_type: 'photography_camera' } } }

    it 'allows staff to create equipment' do
      post '/staff/equipments', params: valid_params, headers: auth_headers_for(staff)
      expect(response).to have_http_status(:created)
    end

    it 'returns 422 for invalid equipment type' do
      post '/staff/equipments', params: { equipment: { name: 'X', equipment_type: 'invalid_type' } },
           headers: auth_headers_for(staff)
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'PATCH /staff/equipments/:id' do
    let!(:equip) { create(:equipment) }

    it 'allows staff to update equipment' do
      patch "/staff/equipments/#{equip.id}", params: { equipment: { name: 'Updated Name' } },
            headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
      expect(equip.reload.name).to eq('Updated Name')
    end
  end
end
