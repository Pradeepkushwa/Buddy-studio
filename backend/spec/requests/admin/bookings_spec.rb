require 'rails_helper'

RSpec.describe 'Admin::Bookings', type: :request do
  let!(:admin)   { create(:user, :admin) }
  let!(:regular) { create(:user) }
  let!(:pkg)     { create(:package) }
  let!(:booking) { create(:booking, package: pkg) }

  describe 'GET /admin/bookings' do
    it 'returns all bookings for admin' do
      get '/admin/bookings', headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)['bookings'].map { |b| b['id'] }
      expect(ids).to include(booking.id)
    end

    it 'filters by status' do
      confirmed = create(:booking, :confirmed, package: pkg)
      get '/admin/bookings', params: { status: 'pending' }, headers: auth_headers_for(admin)
      ids = JSON.parse(response.body)['bookings'].map { |b| b['id'] }
      expect(ids).to include(booking.id)
      expect(ids).not_to include(confirmed.id)
    end

    it 'returns 403 for non-admin' do
      get '/admin/bookings', headers: auth_headers_for(regular)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'PATCH /admin/bookings/:id' do
    it 'updates booking status and creates a notification' do
      expect {
        patch "/admin/bookings/#{booking.id}",
              params:  { status: 'confirmed' },
              headers: auth_headers_for(admin)
      }.to change(Notification, :count).by(1)
      expect(response).to have_http_status(:ok)
      expect(booking.reload.status).to eq('confirmed')
    end
  end
end
