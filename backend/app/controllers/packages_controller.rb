# frozen_string_literal: true

class PackagesController < ApplicationController
  def index
    packages = Package.active.approved_packages.includes(:category, package_items: :equipment)
    packages = packages.where(category_id: params[:category_id]) if params[:category_id].present?
    packages = packages.order(featured: :desc, created_at: :desc)

    render json: {
      packages: packages.map { |p| package_summary(p) }
    }
  end

  def show
    package = Package.active.approved_packages.includes(package_items: :equipment).find(params[:id])
    render json: { package: package_detail(package) }
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Package not found' }, status: :not_found
  end

  private

  def package_summary(p)
    {
      id: p.id, name: p.name, description: p.description,
      category_id: p.category_id, category_name: p.category.name,
      price: p.price.to_f, discount_percentage: p.discount_percentage.to_f,
      offer_price: p.offer_price.to_f, featured: p.featured,
      items_count: p.package_items.size
    }
  end

  def package_detail(p)
    {
      id: p.id, name: p.name, description: p.description,
      category_id: p.category_id, category_name: p.category.name,
      price: p.price.to_f, discount_percentage: p.discount_percentage.to_f,
      offer_price: p.offer_price.to_f, featured: p.featured,
      items: p.package_items.map { |i|
        {
          id: i.id, equipment_name: i.equipment.name,
          equipment_type: i.equipment.equipment_type,
          quantity: i.quantity, notes: i.notes
        }
      }
    }
  end
end
