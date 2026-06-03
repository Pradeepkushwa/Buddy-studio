require 'rails_helper'

RSpec.describe 'Admin::Appointments', type: :request do
  let!(:admin)   { create(:user, :admin) }
  let!(:regular) { create(:user) }
  let!(:appt)    { create(:appointment) }

  describe 'GET /admin/appointments' do
    it 'returns appointments for admin' do
      get '/admin/appointments', headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)['appointments'].map { |a| a['id'] }
      expect(ids).to include(appt.id)
    end

    it 'returns 403 for regular user' do
      get '/admin/appointments', headers: auth_headers_for(regular)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'PATCH /admin/appointments/:id' do
    it 'updates appointment status' do
      patch "/admin/appointments/#{appt.id}",
            params:  { status: 'contacted' },
            headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(appt.reload.status).to eq('contacted')
    end
  end
end
