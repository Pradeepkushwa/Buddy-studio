# frozen_string_literal: true

module Staff
  class EquipmentsController < ApplicationController
    before_action :authenticate_staff_or_admin!
    before_action :set_equipment, only: %i[update]

    def index
      equipments = Equipment.order(:equipment_type, :name)
      render json: { equipments: equipments.map { |e| equipment_json(e) } }
    end

    def create
      equipment = Equipment.new(equipment_params)
      if equipment.save
        render json: { equipment: equipment_json(equipment) }, status: :created
      else
        render json: { errors: equipment.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      if @equipment.update(equipment_params)
        render json: { equipment: equipment_json(@equipment) }
      else
        render json: { errors: @equipment.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def set_equipment
      @equipment = Equipment.find(params[:id])
    end

    def equipment_params
      params.require(:equipment).permit(:name, :equipment_type, :description, :active)
    end

    def equipment_json(e)
      {
        id: e.id, name: e.name, equipment_type: e.equipment_type,
        description: e.description, active: e.active,
        created_at: e.created_at
      }
    end
  end
end
