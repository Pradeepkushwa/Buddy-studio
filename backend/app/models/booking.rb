# frozen_string_literal: true

class Booking < ApplicationRecord
  STATUSES = %w[pending confirmed upcoming completed cancelled].freeze

  belongs_to :user
  belongs_to :package
  has_many :reviews, dependent: :nullify

  validates :event_start_date, presence: true
  validates :event_end_date, presence: true
  validates :event_address, presence: true
  validates :phone_number, presence: true, format: { with: /\A[0-9+\-\s()]{7,15}\z/, message: 'is not valid' }
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :alternate_contact_number, format: { with: /\A[0-9+\-\s()]{7,15}\z/, message: 'is not valid' }, allow_blank: true
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validate :end_date_after_start_date

  scope :pending, -> { where(status: 'pending') }
  scope :confirmed, -> { where(status: 'confirmed') }
  scope :upcoming, -> { where(status: 'upcoming') }
  scope :completed, -> { where(status: 'completed') }
  scope :recent, -> { order(created_at: :desc) }

  private

  def end_date_after_start_date
    return if event_start_date.blank? || event_end_date.blank?
    errors.add(:event_end_date, 'must be on or after start date') if event_end_date < event_start_date
  end
end
