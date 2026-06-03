require 'rails_helper'

RSpec.describe 'GET /categories', type: :request do
  let!(:active_cat)   { create(:category, active: true, position: 1) }
  let!(:inactive_cat) { create(:category, :inactive) }

  it 'returns only active categories with 200' do
    get '/categories'
    expect(response).to have_http_status(:ok)
    names = JSON.parse(response.body)['categories'].map { |c| c['name'] }
    expect(names).to include(active_cat.name)
    expect(names).not_to include(inactive_cat.name)
  end

  it 'returns categories in position order' do
    create(:category, active: true, position: 5)
    get '/categories'
    positions = JSON.parse(response.body)['categories'].map { |c| c['position'] }
    expect(positions).to eq(positions.sort)
  end
end
