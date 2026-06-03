require 'rails_helper'

RSpec.describe Package, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should belong_to(:category) }
  end

  describe 'offer price calculation' do
    it 'calculates offer_price from price and discount_percentage' do
      pkg = create(:package, price: 10_000, discount_percentage: 10)
      expect(pkg.offer_price).to eq(9_000)
    end

    it 'sets offer_price equal to price when discount is 0' do
      pkg = create(:package, price: 5_000, discount_percentage: 0)
      expect(pkg.offer_price).to eq(5_000)
    end
  end

  describe 'scopes' do
    let!(:active_approved)   { create(:package, active: true, approval_status: 'approved') }
    let!(:active_pending)    { create(:package, :pending_approval) }
    let!(:inactive_approved) { create(:package, :inactive) }

    it '.active returns only active packages' do
      expect(Package.active).to include(active_approved)
      expect(Package.active).not_to include(inactive_approved)
    end

    it '.approved_packages returns only approved' do
      expect(Package.approved_packages).to include(active_approved)
      expect(Package.approved_packages).not_to include(active_pending)
    end
  end

  describe 'approval_status' do
    it 'defaults to approved for packages created without staff' do
      pkg = create(:package)
      expect(pkg.approval_status).to eq('approved')
    end

    it 'can be set to pending_approval' do
      pkg = create(:package, :pending_approval)
      expect(pkg.approval_status).to eq('pending_approval')
    end
  end
end
