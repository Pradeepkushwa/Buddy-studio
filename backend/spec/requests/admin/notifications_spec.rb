require 'rails_helper'

RSpec.describe 'Admin::Notifications', type: :request do
  let!(:admin)   { create(:user, :admin) }
  let!(:regular) { create(:user) }
  let!(:notif1)  { create(:notification) }
  let!(:notif2)  { create(:notification) }

  describe 'GET /admin/notifications' do
    it 'returns recent notifications for admin' do
      get '/admin/notifications', headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)['notifications'].map { |n| n['id'] }
      expect(ids).to include(notif1.id, notif2.id)
    end

    it 'returns 403 for non-admin' do
      get '/admin/notifications', headers: auth_headers_for(regular)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'PATCH /admin/notifications/:id/read' do
    it 'marks a single notification as read' do
      patch "/admin/notifications/#{notif1.id}/read", headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(notif1.reload.read).to be true
    end
  end

  describe 'PATCH /admin/notifications/mark_all_read' do
    it 'marks all notifications as read' do
      patch '/admin/notifications/mark_all_read', headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(Notification.where(read: false).count).to eq(0)
    end
  end
end
