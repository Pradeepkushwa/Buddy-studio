# frozen_string_literal: true

module Admin
  class NotificationsController < ApplicationController
    before_action :authenticate_admin!

    def index
      notifications = Notification.recent
      render json: {
        notifications: notifications.map { |n| notification_json(n) },
        unread_count: Notification.unread.count
      }
    end

    def mark_as_read
      notification = Notification.find(params[:id])
      notification.update!(read: true)
      render json: { unread_count: Notification.unread.count }
    end

    def mark_all_read
      Notification.unread.update_all(read: true)
      render json: { message: 'All notifications marked as read', unread_count: 0 }
    end

    private

    def notification_json(n)
      {
        id: n.id,
        title: n.title,
        message: n.message,
        notification_type: n.notification_type,
        link: n.link,
        read: n.read,
        created_at: n.created_at
      }
    end
  end
end
