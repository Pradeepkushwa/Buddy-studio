# frozen_string_literal: true

class Package < ApplicationRecord
  belongs_to :category
  has_many :package_items, dependent: :destroy
  has_many :equipments, through: :package_items
  has_many :appointments, dependent: :nullify

  accepts_nested_attributes_for :package_items, allow_destroy: true

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :discount_percentage, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }, allow_nil: true

  before_save :calculate_offer_price

  scope :active, -> { where(active: true) }
  scope :featured, -> { where(featured: true) }

  private

  def calculate_offer_price
    if discount_percentage.present? && discount_percentage > 0
      self.offer_price = price - (price * discount_percentage / 100.0)
    else
      self.offer_price = price
    end
  end
end
