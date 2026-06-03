require 'rails_helper'

RSpec.describe 'Admin::Staff', type: :request do
  let!(:admin)        { create(:user, :admin) }
  let!(:regular)      { create(:user) }
  let!(:staff_member) { create(:user, :staff) }

  describe 'GET /admin/staff' do
    it 'returns list of staff for admin' do
      get '/admin/staff', headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)['staff'].map { |s| s['id'] }
      expect(ids).to include(staff_member.id)
      expect(ids).not_to include(admin.id)
    end

    it 'returns 403 for non-admin' do
      get '/admin/staff', headers: auth_headers_for(regular)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'PATCH /admin/staff/:id/approve' do
    it 'sets verification_status to approved' do
      patch "/admin/staff/#{staff_member.id}/approve", headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(staff_member.reload.verification_status).to eq('approved')
    end
  end

  describe 'PATCH /admin/staff/:id/reject' do
    it 'sets verification_status to rejected (or pending)' do
      patch "/admin/staff/#{staff_member.id}/reject", headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(%w[rejected pending]).to include(staff_member.reload.verification_status)
    end
  end
end
