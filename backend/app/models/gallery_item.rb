# frozen_string_literal: true

class GalleryItem < ApplicationRecord
  MEDIA_TYPES = %w[photo video].freeze
  CATEGORIES = ['Love Moments', 'Happy Clients', 'Wedding', 'Birthday', 'Events', 'Behind the Scenes'].freeze

  belongs_to :uploaded_by, class_name: 'User', optional: true

  validates :title, presence: true
  validates :media_url, presence: true
  validates :media_type, presence: true, inclusion: { in: MEDIA_TYPES }

  scope :active, -> { where(active: true) }
  scope :ordered, -> { order(position: :asc, created_at: :desc) }
end
