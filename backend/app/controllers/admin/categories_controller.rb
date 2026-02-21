# frozen_string_literal: true

module Admin
  class CategoriesController < ApplicationController
    before_action :authenticate_admin!
    before_action :set_category, only: %i[update destroy]

    def index
      categories = Category.ordered
      render json: { categories: categories.map { |c| category_json(c) } }
    end

    def create
      category = Category.new(category_params)
      if category.save
        render json: { category: category_json(category) }, status: :created
      else
        render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      if @category.update(category_params)
        render json: { category: category_json(@category) }
      else
        render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      @category.update!(active: false)
      render json: { message: 'Category deactivated' }
    end

    private

    def set_category
      @category = Category.find(params[:id])
    end

    def category_params
      params.require(:category).permit(:name, :description, :image_url, :active, :position)
    end

    def category_json(c)
      {
        id: c.id, name: c.name, description: c.description,
        image_url: c.image_url, active: c.active, position: c.position,
        packages_count: c.packages.active.count,
        created_at: c.created_at
      }
    end
  end
end
