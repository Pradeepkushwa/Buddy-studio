# frozen_string_literal: true

if ENV['RAZORPAY_KEY_ID'].present? && ENV['RAZORPAY_KEY_SECRET'].present?
  Razorpay.setup(ENV['RAZORPAY_KEY_ID'], ENV['RAZORPAY_KEY_SECRET'])
end
