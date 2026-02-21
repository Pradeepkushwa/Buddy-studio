# frozen_string_literal: true

class Equipment < ApplicationRecord
  TYPES = %w[
    photography_camera videography_camera drone
    lighting album video other
  ].freeze

  has_many :package_items, dependent: :restrict_with_error

  validates :name, presence: true
  validates :equipment_type, presence: true, inclusion: { in: TYPES }

  scope :active, -> { where(active: true) }
end
