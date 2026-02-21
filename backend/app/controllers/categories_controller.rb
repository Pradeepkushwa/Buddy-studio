# frozen_string_literal: true

class CategoriesController < ApplicationController
  def index
    categories = Category.active.ordered
    render json: {
      categories: categories.map { |c|
        {
          id: c.id, name: c.name, description: c.description,
          image_url: c.image_url, position: c.position,
          packages_count: c.packages.active.count
        }
      }
    }
  end
end
