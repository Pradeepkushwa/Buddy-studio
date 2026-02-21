# frozen_string_literal: true

class Appointment < ApplicationRecord
  STATUSES = %w[new contacted completed cancelled].freeze

  belongs_to :package, optional: true

  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :mobile_number, format: { with: /\A[0-9+\-\s()]{7,15}\z/ }, allow_blank: true
  validates :status, presence: true, inclusion: { in: STATUSES }

  scope :recent, -> { order(created_at: :desc) }
end
