# frozen_string_literal: true

class AppointmentsController < ApplicationController
  def create
    appointment = Appointment.new(appointment_params)
    if appointment.save
      render json: {
        message: 'Appointment request submitted! Our team will contact you soon.',
        appointment: {
          id: appointment.id, name: appointment.name,
          email: appointment.email, status: appointment.status
        }
      }, status: :created
    else
      render json: { errors: appointment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def appointment_params
    params.require(:appointment).permit(
      :name, :email, :mobile_number, :package_id,
      :preferred_date, :event_type, :message
    )
  end
end
