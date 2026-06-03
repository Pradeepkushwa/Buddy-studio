require 'rails_helper'

RSpec.describe 'Reviews (public)', type: :request do
  describe 'GET /reviews' do
    let!(:approved) { create(:review, :approved, rating: 5) }
    let!(:pending)  { create(:review, rating: 4) }

    it 'returns only approved reviews' do
      get '/reviews'
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      ids = body['reviews'].map { |r| r['id'] }
      expect(ids).to include(approved.id)
      expect(ids).not_to include(pending.id)
    end

    it 'includes average rating and total count' do
      get '/reviews'
      body = JSON.parse(response.body)
      expect(body['average_rating']).to be_present
      expect(body['total_reviews']).to be >= 1
    end
  end

  describe 'POST /reviews' do
    let(:valid_params) do
      { review: { name: 'John', email: 'john@example.com', rating: 5, feedback: 'Great service!' } }
    end

    it 'creates an unapproved review and returns 201' do
      expect {
        post '/reviews', params: valid_params
      }.to change(Review, :count).by(1)
      expect(response).to have_http_status(:created)
      expect(Review.last.approved).to be false
    end

    it 'creates a notification for admins' do
      expect {
        post '/reviews', params: valid_params
      }.to change(Notification, :count).by(1)
    end

    it 'returns 422 for invalid rating' do
      post '/reviews', params: { review: { name: 'Joe', email: 'joe@x.com', rating: 6 } }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
