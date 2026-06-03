require 'rails_helper'

RSpec.describe GalleryItem, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:media_url) }
    it { should validate_inclusion_of(:media_type).in_array(%w[photo video]) }
  end

  describe 'scopes' do
    it '.active returns only active items' do
      active   = create(:gallery_item, active: true)
      inactive = create(:gallery_item, :inactive)
      expect(GalleryItem.active).to include(active)
      expect(GalleryItem.active).not_to include(inactive)
    end
  end
end
