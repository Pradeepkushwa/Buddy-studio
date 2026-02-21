# frozen_string_literal: true

class Review < ApplicationRecord
  belongs_to :booking, optional: true

  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :rating, presence: true, inclusion: { in: 1..5 }

  scope :approved, -> { where(approved: true) }
  scope :pending, -> { where(approved: false) }
  scope :recent, -> { order(created_at: :desc) }
end
