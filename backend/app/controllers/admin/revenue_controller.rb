# frozen_string_literal: true

module Admin
  class RevenueController < ApplicationController
    before_action :authenticate_admin!

    REVENUE_STATUSES = %w[confirmed upcoming completed].freeze

    def index
      period  = params[:period] || 'month'
      current_range, previous_range = period_ranges(period)

      current_bookings  = revenue_scope(current_range)
      previous_bookings = previous_range ? revenue_scope(previous_range) : Booking.none

      current_revenue  = current_bookings.sum(:amount).to_f
      previous_revenue = previous_bookings.sum(:amount).to_f

      change_pct = if previous_revenue > 0
        (((current_revenue - previous_revenue) / previous_revenue) * 100).round(1)
      elsif current_revenue > 0
        100.0
      else
        0.0
      end

      render json: {
        period:              period,
        current_revenue:     current_revenue,
        previous_revenue:    previous_revenue,
        change_pct:          change_pct,
        booking_count:       current_bookings.count,
        avg_booking_value:   avg_value(current_bookings, current_revenue),
        completed_revenue:   current_bookings.where(status: 'completed').sum(:amount).to_f,
        all_time_revenue:    revenue_scope(nil).sum(:amount).to_f,
        chart_data:          chart_data(period),
        top_packages:        top_packages(current_range),
        status_breakdown:    status_breakdown(current_range)
      }
    end

    private

    def revenue_scope(range)
      scope = Booking.where(status: REVENUE_STATUSES)
      range ? scope.where(created_at: range) : scope
    end

    def avg_value(bookings, total)
      return 0.0 if bookings.count.zero?
      (total / bookings.count).round(2)
    end

    def period_ranges(period)
      now = Time.current
      case period
      when 'day'
        [(now - 1.day)..now, (now - 2.days)..(now - 1.day)]
      when 'week'
        [(now - 1.week)..now, (now - 2.weeks)..(now - 1.week)]
      when 'month'
        [(now - 1.month)..now, (now - 2.months)..(now - 1.month)]
      when '3months'
        [(now - 3.months)..now, (now - 6.months)..(now - 3.months)]
      when '6months'
        [(now - 6.months)..now, (now - 12.months)..(now - 6.months)]
      when 'year'
        [(now - 1.year)..now, (now - 2.years)..(now - 1.year)]
      when '3years'
        [(now - 3.years)..now, (now - 6.years)..(now - 3.years)]
      else
        [nil, nil]
      end
    end

    def chart_data(period)
      now = Time.current
      case period
      when 'day'
        (0..23).map do |h|
          t = now.beginning_of_hour - (23 - h).hours
          { label: t.strftime('%H:%M'), revenue: revenue_in(t, t + 1.hour) }
        end
      when 'week'
        7.times.map { |d| now - (6 - d).days }.map do |day|
          { label: day.strftime('%a %d'), revenue: revenue_in(day.beginning_of_day, day.end_of_day) }
        end
      when 'month'
        30.times.map { |d| now - (29 - d).days }.each_slice(5).map.with_index do |days, i|
          { label: days.first.strftime('%d %b'), revenue: days.sum { |d| revenue_in(d.beginning_of_day, d.end_of_day) } }
        end
      when '3months'
        3.times.map { |m| now - (2 - m).months }.map do |month|
          { label: month.strftime('%b %Y'), revenue: revenue_in(month.beginning_of_month, month.end_of_month) }
        end
      when '6months'
        6.times.map { |m| now - (5 - m).months }.map do |month|
          { label: month.strftime('%b %Y'), revenue: revenue_in(month.beginning_of_month, month.end_of_month) }
        end
      when 'year'
        12.times.map { |m| now - (11 - m).months }.map do |month|
          { label: month.strftime('%b'), revenue: revenue_in(month.beginning_of_month, month.end_of_month) }
        end
      when '3years'
        12.times.map { |q| now - (11 - q) * 3.months }.map do |qstart|
          { label: qstart.strftime('%b %y'), revenue: revenue_in(qstart.beginning_of_month, (qstart + 3.months).beginning_of_month) }
        end
      else
        first = Booking.minimum(:created_at)
        return [] unless first
        (first.year..now.year).map do |yr|
          s = Time.new(yr, 1, 1)
          e = Time.new(yr, 12, 31, 23, 59, 59)
          { label: yr.to_s, revenue: revenue_in(s, e) }
        end
      end
    end

    def revenue_in(from, to)
      Booking.where(status: REVENUE_STATUSES, created_at: from..to).sum(:amount).to_f
    end

    def top_packages(range)
      scope = Booking.where(status: REVENUE_STATUSES)
      scope = scope.where(created_at: range) if range
      scope.joins(:package)
           .group('packages.id', 'packages.name')
           .select('packages.id, packages.name, COUNT(bookings.id) AS booking_count, SUM(bookings.amount) AS total_revenue')
           .order('total_revenue DESC')
           .limit(5)
           .map { |r| { name: r.name, count: r.booking_count, revenue: r.total_revenue.to_f } }
    end

    def status_breakdown(range)
      scope = Booking
      scope = scope.where(created_at: range) if range
      scope.group(:status)
           .select('status, COUNT(*) AS cnt, SUM(amount) AS revenue')
           .map { |r| { status: r.status, count: r.cnt, revenue: r.revenue.to_f } }
    end
  end
end
