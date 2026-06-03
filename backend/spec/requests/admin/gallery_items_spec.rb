require 'rails_helper'

RSpec.describe 'Admin::GalleryItems', type: :request do
  let!(:admin)   { create(:user, :admin) }
  let!(:staff)   { create(:user, :staff) }
  let!(:regular) { create(:user) }
  let!(:item)    { create(:gallery_item) }

  describe 'GET /admin/gallery_items' do
    it 'returns gallery items for admin' do
      get '/admin/gallery_items', headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      ids = JSON.parse(response.body)['gallery_items'].map { |i| i['id'] }
      expect(ids).to include(item.id)
    end

    it 'also allows staff to access gallery items' do
      get '/admin/gallery_items', headers: auth_headers_for(staff)
      expect(response).to have_http_status(:ok)
    end

    it 'returns 403 for regular user' do
      get '/admin/gallery_items', headers: auth_headers_for(regular)
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe 'POST /admin/gallery_items' do
    let(:valid_params) do
      { gallery_item: { title: 'Sunset Photo', media_url: 'https://cdn.example.com/img.jpg', media_type: 'photo', category: 'Wedding' } }
    end

    it 'creates a gallery item' do
      post '/admin/gallery_items', params: valid_params, headers: auth_headers_for(admin)
      expect(response).to have_http_status(:created)
    end
  end

  describe 'PATCH /admin/gallery_items/:id' do
    it 'updates a gallery item' do
      patch "/admin/gallery_items/#{item.id}",
            params:  { gallery_item: { title: 'Updated Title' } },
            headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(item.reload.title).to eq('Updated Title')
    end
  end

  describe 'DELETE /admin/gallery_items/:id' do
    it 'hard-deletes a gallery item' do
      delete "/admin/gallery_items/#{item.id}", headers: auth_headers_for(admin)
      expect(response).to have_http_status(:ok)
      expect(GalleryItem.find_by(id: item.id)).to be_nil
    end
  end
end
