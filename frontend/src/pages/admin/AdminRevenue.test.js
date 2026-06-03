import { screen, fireEvent, waitFor } from '@testing-library/react';
import AdminRevenue from './AdminRevenue';
import api from '../../api';
import { renderWithRouter } from '../../test-utils';

jest.mock('../../api');

const revenuePayload = {
  period: 'month',
  current_revenue: 50000,
  previous_revenue: 40000,
  change_pct: 25,
  all_time_revenue: 200000,
  booking_count: 12,
  avg_booking_value: 4166,
  completed_revenue: 30000,
  chart_data: [
    { label: 'W1', revenue: 10000 },
    { label: 'W2', revenue: 40000 },
  ],
  top_packages: [{ name: 'Gold', count: 3, revenue: 30000 }],
  status_breakdown: [
    { status: 'confirmed', count: 5, revenue: 20000 },
    { status: 'pending', count: 2, revenue: 5000 },
  ],
};

describe('AdminRevenue', () => {
  beforeEach(() => {
    api.get.mockImplementation((url) => {
      if (url.startsWith('/admin/revenue')) {
        return Promise.resolve({ data: { ...revenuePayload, period: url.split('=')[1] || 'month' } });
      }
      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });
  });

  it('loads revenue dashboard with charts and tables', async () => {
    renderWithRouter(<AdminRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Revenue Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Period Revenue')).toBeInTheDocument();
      expect(screen.getByText('Gold')).toBeInTheDocument();
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
    });
  });

  it('refetches when period changes', async () => {
    renderWithRouter(<AdminRevenue />);
    await waitFor(() => expect(screen.getByText('Revenue Dashboard')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: '7 Days' }));
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/admin/revenue?period=week'));
  });

  it('shows empty chart message when no chart data', async () => {
    api.get.mockResolvedValueOnce({
      data: { ...revenuePayload, chart_data: [], top_packages: [], status_breakdown: [] },
    });
    renderWithRouter(<AdminRevenue />);
    await waitFor(() => {
      expect(screen.getAllByText('No data for this period.').length).toBeGreaterThan(0);
    });
  });

  it('shows error state when API fails', async () => {
    api.get.mockRejectedValueOnce(new Error('fail'));
    renderWithRouter(<AdminRevenue />);
    await waitFor(() => {
      expect(screen.getByText('Could not load revenue data.')).toBeInTheDocument();
    });
  });
});
