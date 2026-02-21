# frozen_string_literal: true

module Admin
  class AppointmentsController < ApplicationController
    before_action :authenticate_admin!

    def index
      appointments = Appointment.includes(:package).recent
      render json: {
        appointments: appointments.map { |a| appointment_json(a) }
      }
    end

    def update
      appointment = Appointment.find(params[:id])
      if appointment.update(status: params[:status])
        render json: { appointment: appointment_json(appointment) }
      else
        render json: { errors: appointment.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def appointment_json(a)
      {
        id: a.id, name: a.name, email: a.email,
        mobile_number: a.mobile_number,
        package_id: a.package_id,
        package_name: a.package&.name,
        preferred_date: a.preferred_date,
        event_type: a.event_type,
        message: a.message, status: a.status,
        created_at: a.created_at
      }
    end
  end
end
