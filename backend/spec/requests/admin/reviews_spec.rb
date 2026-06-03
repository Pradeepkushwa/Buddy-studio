require 'rails_helper'

RSpec.describe 'Admin::Reviews', type: :request do
  let!(:admin)   { create(:user, :admin) }
  let!(:regular) { create(:user) }
  let!(:review)  { create(:review) }

  describe 'GET /admin/reviews' do
    it 'returns all reviews (approved + pending) for admin' do
      approved = create(:review, :approved)
      get '/admin/reviews', headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)['reviews'].map { |r| r['id'] }
      expect(ids).to include(review.id, approved.id)
    end

    it 'returns 403 for regular user' do
      get '/admin/reviews', headers: auth_headers_for(regular)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'PATCH /admin/reviews/:id' do
    it 'approves a review' do
      patch "/admin/reviews/#{review.id}",
            params:  { approved: true },
            headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(review.reload.approved).to be true
    end
  end

  describe 'DELETE /admin/reviews/:id' do
    it 'deletes a review' do
      delete "/admin/reviews/#{review.id}", headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(Review.find_by(id: review.id)).to be_nil
    end
  end
end
