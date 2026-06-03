require 'rails_helper'

RSpec.describe 'GET /gallery', type: :request do
  let!(:photo)    { create(:gallery_item, category: 'Wedding', active: true) }
  let!(:video)    { create(:gallery_item, :video, category: 'Events', active: true) }
  let!(:inactive) { create(:gallery_item, :inactive, category: 'Wedding') }

  it 'returns only active items with 200' do
    get '/gallery'
    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    ids = body['gallery_items'].map { |i| i['id'] }
    expect(ids).to include(photo.id, video.id)
    expect(ids).not_to include(inactive.id)
  end

  it 'returns distinct categories list' do
    get '/gallery'
    body = JSON.parse(response.body)
    expect(body['categories']).to include('Wedding', 'Events')
  end

  it 'filters by category' do
    get '/gallery', params: { category: 'Wedding' }
    body = JSON.parse(response.body)
    ids = body['gallery_items'].map { |i| i['id'] }
    expect(ids).to include(photo.id)
    expect(ids).not_to include(video.id)
  end
end
