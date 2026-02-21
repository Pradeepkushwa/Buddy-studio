# frozen_string_literal: true

class GalleryItemsController < ApplicationController
  def index
    items = GalleryItem.active.ordered
    items = items.where(category: params[:category]) if params[:category].present?
    render json: {
      gallery_items: items.map { |g| gallery_json(g) },
      categories: GalleryItem.active.distinct.pluck(:category).compact
    }
  end

  private

  def gallery_json(g)
    {
      id: g.id, title: g.title, media_url: g.media_url,
      media_type: g.media_type, description: g.description,
      category: g.category, position: g.position
    }
  end
end
