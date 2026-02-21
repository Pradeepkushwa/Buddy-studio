# frozen_string_literal: true

class Category < ApplicationRecord
  has_many :packages, dependent: :restrict_with_error

  validates :name, presence: true, uniqueness: true

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(position: :asc, name: :asc) }
end
