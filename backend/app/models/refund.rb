class Refund < ApplicationRecord
  belongs_to :payment
  STATUSES = %w[
    pending
    processed
    failed
  ].freeze

  validates :razorpay_refund_id,
            presence: true,
            uniqueness: true

  validates :amount,
            presence: true,
            numericality: { greater_than: 0 }

  validates :currency,
            presence: true

  validates :status,
            presence: true,
            inclusion: { in: STATUSES }
end
