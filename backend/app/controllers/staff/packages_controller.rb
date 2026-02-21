# frozen_string_literal: true

module Staff
  class PackagesController < ApplicationController
    before_action :authenticate_staff_or_admin!
    before_action :set_package, only: %i[update destroy]

    def index
      packages = current_user.created_packages.includes(:category, package_items: :equipment).order(created_at: :desc)
      render json: { packages: packages.map { |p| package_json(p) } }
    end

    def create
      package = Package.new(package_params)
      package.created_by = current_user
      package.approval_status = current_user.admin? ? 'approved' : 'pending_approval'
      if package.save
        render json: { package: package_json(package.reload), message: staff_message }, status: :created
      else
        render json: { errors: package.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      @package.assign_attributes(package_params)
      @package.approval_status = 'pending_approval' if current_user.staff? && @package.changed?
      if @package.save
        msg = (current_user.staff? && @package.approval_status == 'pending_approval') ? 'Package updated and sent for re-approval' : 'Package updated'
        render json: { package: package_json(@package.reload), message: msg }
      else
        render json: { errors: @package.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      @package.update!(active: false)
      render json: { message: 'Package deactivated' }
    end

    private

    def set_package
      @package = current_user.created_packages.find(params[:id])
    end

    def package_params
      params.require(:package).permit(
        :name, :description, :category_id, :price,
        :discount_percentage, :active, :featured,
        package_items_attributes: %i[id equipment_id quantity notes _destroy]
      )
    end

    def staff_message
      current_user.admin? ? 'Package created' : 'Package created and sent for admin approval'
    end

    def package_json(p)
      {
        id: p.id, name: p.name, description: p.description,
        category_id: p.category_id,
        category_name: p.category.name,
        price: p.price.to_f, discount_percentage: p.discount_percentage.to_f,
        offer_price: p.offer_price.to_f,
        active: p.active, featured: p.featured,
        approval_status: p.approval_status,
        items: p.package_items.map { |i| item_json(i) },
        created_at: p.created_at
      }
    end

    def item_json(i)
      {
        id: i.id, equipment_id: i.equipment_id,
        equipment_name: i.equipment.name,
        equipment_type: i.equipment.equipment_type,
        quantity: i.quantity, notes: i.notes
      }
    end
  end
end
