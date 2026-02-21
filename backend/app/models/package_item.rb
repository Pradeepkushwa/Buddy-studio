# frozen_string_literal: true

class PackageItem < ApplicationRecord
  belongs_to :package
  belongs_to :equipment

  validates :quantity, presence: true, numericality: { greater_than: 0 }
end
