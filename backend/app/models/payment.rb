class Payment < ApplicationRecord
  belongs_to :booking
  has_many :refunds, dependent: :destroy
  STATUSES = %w[
    created
    authorized
    captured
    failed
    refunded
    partially_refunded
  ].freeze

  validates :razorpay_order_id,
            presence: true,
            uniqueness: true

  validates :razorpay_payment_id,
            uniqueness: true,
            allow_nil: true

  validates :razorpay_refund_id,
            uniqueness: true,
            allow_nil: true

  validates :amount,
            presence: true,
            numericality: { greater_than: 0 }

  validates :status,
            inclusion: { in: STATUSES }
end
