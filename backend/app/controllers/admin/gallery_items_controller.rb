# frozen_string_literal: true

module Admin
  class GalleryItemsController < ApplicationController
    before_action :authenticate_staff_or_admin!
    before_action :set_item, only: %i[update destroy]

    def index
      items = GalleryItem.ordered
      render json: { gallery_items: items.map { |g| gallery_json(g) } }
    end

    def create
      item = GalleryItem.new(gallery_params)
      item.uploaded_by = current_user
      if item.save
        render json: { gallery_item: gallery_json(item) }, status: :created
      else
        render json: { errors: item.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      if @item.update(gallery_params)
        render json: { gallery_item: gallery_json(@item) }
      else
        render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      @item.destroy
      render json: { message: 'Gallery item removed' }
    end

    private

    def set_item
      @item = GalleryItem.find(params[:id])
    end

    def gallery_params
      params.require(:gallery_item).permit(:title, :media_url, :media_type, :description, :category, :position, :active)
    end

    def gallery_json(g)
      {
        id: g.id, title: g.title, media_url: g.media_url,
        media_type: g.media_type, description: g.description,
        category: g.category, position: g.position, active: g.active,
        uploaded_by: g.uploaded_by&.name,
        created_at: g.created_at
      }
    end
  end
end
