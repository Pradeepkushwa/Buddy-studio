# frozen_string_literal: true
require 'openssl'

class RazorpayWebhooksController < ApplicationController
  def create
    raw_body = request.raw_post

    signature = request.headers['X-Razorpay-Signature']
    event_id = request.headers['X-Razorpay-Event-Id']
    webhook_secret = ENV['RAZORPAY_WEBHOOK_SECRET']

    Rails.logger.info(
      "[RazorpayWebhook] Received event_id=#{event_id.presence || 'missing'}"
    )

    if signature.blank? || event_id.blank? || webhook_secret.blank?
      Rails.logger.warn(
        "[RazorpayWebhook] Invalid request: required headers/config missing"
      )

      return render json: {
        error: 'Invalid webhook request'
      }, status: :bad_request
    end

    expected_signature = OpenSSL::HMAC.hexdigest(
      'SHA256',
      webhook_secret,
      raw_body
    )

    unless secure_signature_match?(expected_signature, signature)
      Rails.logger.warn(
        "[RazorpayWebhook] Signature verification failed event_id=#{event_id}"
      )

      return render json: {
        error: 'Invalid webhook signature'
      }, status: :unauthorized
    end

    Rails.logger.info(
      "[RazorpayWebhook] Signature verified event_id=#{event_id}"
    )

    payload = JSON.parse(raw_body)
    event_type = payload['event']

    Rails.logger.info(
      "[RazorpayWebhook] Processing event_id=#{event_id} type=#{event_type}"
    )

    webhook_event = WebhookEvent.find_or_create_by!(
      provider: 'razorpay',
      event_id: event_id
    ) do |event|
      event.event_type = event_type
    end

    if webhook_event.processed_at.present?
      Rails.logger.info(
        "[RazorpayWebhook] Duplicate ignored event_id=#{event_id}"
      )

      return render json: {
        message: 'Webhook already processed'
      }, status: :ok
    end

    process_event(payload)

    webhook_event.update!(
      processed_at: Time.current
    )

    Rails.logger.info(
      "[RazorpayWebhook] Successfully processed event_id=#{event_id} type=#{event_type}"
    )

    render json: {
      message: 'Webhook processed'
    }, status: :ok

  rescue JSON::ParserError => e
    Rails.logger.error(
      "[RazorpayWebhook] Invalid JSON: #{e.message}"
    )

    render json: {
      error: 'Invalid JSON payload'
    }, status: :bad_request

  rescue ActiveRecord::RecordNotUnique
    Rails.logger.info(
      "[RazorpayWebhook] Duplicate event blocked by DB"
    )

    render json: {
      message: 'Webhook already received'
    }, status: :ok

  rescue StandardError => e
    Rails.logger.error(
      "[RazorpayWebhook] Error #{e.class}: #{e.message}"
    )

    render json: {
      error: 'Webhook processing failed'
    }, status: :internal_server_error
  end

  private

  def secure_signature_match?(expected, received)
    return false unless expected.bytesize == received.bytesize

    ActiveSupport::SecurityUtils.secure_compare(
      expected,
      received
    )
  end

  def process_event(payload)
    case payload['event']
    when 'refund.processed'
      process_refund_processed(payload)

    when 'payment.captured'
      Rails.logger.info(
        '[RazorpayWebhook] payment.captured received'
      )

    when 'payment.failed'
      Rails.logger.info(
        '[RazorpayWebhook] payment.failed received'
      )

    else
      Rails.logger.info(
        "[RazorpayWebhook] Event ignored type=#{payload['event']}"
      )
    end
  end

  def process_refund_processed(payload)
    # Next implementation
  end
end