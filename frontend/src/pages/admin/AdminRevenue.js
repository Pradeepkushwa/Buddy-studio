import { useState, useEffect, useCallback } from 'react';
import api from '../../api';

const PERIODS = [
  { key: 'day',     label: 'Today' },
  { key: 'week',    label: '7 Days' },
  { key: 'month',   label: '1 Month' },
  { key: '3months', label: '3 Months' },
  { key: '6months', label: '6 Months' },
  { key: 'year',    label: '1 Year' },
  { key: '3years',  label: '3 Years' },
  { key: 'all',     label: 'All Time' },
];

const STATUS_COLORS = {
  confirmed: '#3b82f6',
  completed: '#22c55e',
  upcoming:  '#a78bfa',
  pending:   '#fbbf24',
  cancelled: '#f87171',
};

function fmtFull(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
}
function fmtShort(n) {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (n >= 1_000)     return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

/* ── Metric card ── */
function MetricCard({ label, value, sub, icon, gradient, glow }) {
  return (
    <div className="rv-card" style={{ background: gradient, boxShadow: `0 0 32px ${glow}22` }}>
      <div className="rv-card-top">
        <span className="rv-card-icon">{icon}</span>
        {sub && <span className="rv-card-badge">{sub}</span>}
      </div>
      <div className="rv-card-value">{value}</div>
      <div className="rv-card-label">{label}</div>
      <div className="rv-card-glow" style={{ background: glow }} />
    </div>
  );
}

/* ── Bar chart ── */
function BarChart({ data }) {
  if (!data || data.length === 0)
    return <p className="rv-empty">No data for this period.</p>;

  const max = Math.max(...data.map(d => d.revenue), 1);

  return (
    <div className="rv-chart-outer">
      {/* Y-axis labels */}
      <div className="rv-y-axis">
        <span>{fmtShort(max)}</span>
        <span>{fmtShort(max * 0.5)}</span>
        <span>₹0</span>
      </div>

      {/* Bars */}
      <div className="rv-bars-wrap">
        {/* Grid lines */}
        <div className="rv-grid-line" style={{ bottom: '100%' }} />
        <div className="rv-grid-line" style={{ bottom: '50%' }} />
        <div className="rv-grid-line" style={{ bottom: '0%' }} />

        <div className="rv-bars">
          {data.map((d, i) => {
            const pct = Math.max((d.revenue / max) * 100, d.revenue > 0 ? 3 : 0);
            return (
              <div key={i} className="rv-bar-group">
                <div className="rv-bar-tip">{fmtFull(d.revenue)}</div>
                <div
                  className="rv-bar-fill"
                  style={{ height: `${pct}%` }}
                />
                <div className="rv-bar-x">{d.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Status row ── */
function StatusRow({ item, total }) {
  const pct  = total > 0 ? ((item.count / total) * 100).toFixed(0) : 0;
  const color = STATUS_COLORS[item.status] || '#94a3b8';
  return (
    <div className="rv-status-row">
      <div className="rv-status-head">
        <span className="rv-status-dot" style={{ background: color }} />
        <span className="rv-status-name">{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
        <span className="rv-status-pct">{pct}%</span>
        <span className="rv-status-rev">{fmtFull(item.revenue)}</span>
      </div>
      <div className="rv-status-track">
        <div className="rv-status-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="rv-status-meta">{item.count} booking{item.count !== 1 ? 's' : ''}</div>
    </div>
  );
}

export default function AdminRevenue() {
  const [period,  setPeriod]  = useState('month');
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback((p) => {
    setLoading(true);
    api.get(`/admin/revenue?period=${p}`)
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(period); }, [period, load]);

  const totalBookings = data?.status_breakdown?.reduce((s, r) => s + r.count, 0) || 0;
  const up = (data?.change_pct ?? 0) >= 0;

  return (
    <div className="rv-page">

      {/* ── Header ── */}
      <div className="rv-header">
        <div className="rv-header-left">
          <div className="rv-header-eyebrow">Analytics</div>
          <h1 className="rv-header-title">Revenue Dashboard</h1>
          <p className="rv-header-sub">Track your studio earnings in real-time</p>
        </div>
        <div className="rv-alltime-box">
          <div className="rv-alltime-label">All-Time Revenue</div>
          <div className="rv-alltime-value">{data ? fmtFull(data.all_time_revenue) : '—'}</div>
          <div className="rv-alltime-glow" />
        </div>
      </div>

      {/* ── Period filter ── */}
      <div className="rv-period-row">
        {PERIODS.map(p => (
          <button
            key={p.key}
            className={`rv-period-btn${period === p.key ? ' rv-period-active' : ''}`}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="rv-loading">
          <div className="rv-spinner" />
          <span>Loading analytics…</span>
        </div>
      )}

      {/* ── Data ── */}
      {!loading && data && (
        <>
          {/* Metric cards */}
          <div className="rv-cards-grid">
            <MetricCard
              icon="💵"
              label="Period Revenue"
              value={fmtFull(data.current_revenue)}
              sub={data.previous_revenue > 0
                ? <span className={up ? 'rv-up' : 'rv-down'}>{up ? '▲' : '▼'} {Math.abs(data.change_pct)}%</span>
                : null}
              gradient="linear-gradient(135deg,#0d2137 0%,#0a3d2b 100%)"
              glow="#22c55e"
            />
            <MetricCard
              icon="📋"
              label="Total Bookings"
              value={data.booking_count}
              sub={<span style={{ color:'#94a3b8' }}>this period</span>}
              gradient="linear-gradient(135deg,#0d1b37 0%,#0a1f4d 100%)"
              glow="#3b82f6"
            />
            <MetricCard
              icon="📊"
              label="Avg. Booking Value"
              value={fmtFull(data.avg_booking_value)}
              sub={<span style={{ color:'#94a3b8' }}>per booking</span>}
              gradient="linear-gradient(135deg,#1a0d37 0%,#2d1060 100%)"
              glow="#8b5cf6"
            />
            <MetricCard
              icon="✅"
              label="Completed Revenue"
              value={fmtFull(data.completed_revenue)}
              sub={<span style={{ color:'#94a3b8' }}>delivered</span>}
              gradient="linear-gradient(135deg,#1f1400 0%,#3d2800 100%)"
              glow="#f59e0b"
            />
          </div>

          {/* Revenue Timeline */}
          <div className="rv-section">
            <div className="rv-section-title">
              <span className="rv-section-dot blue" />
              Revenue Timeline
            </div>
            <div className="rv-chart-card">
              <BarChart data={data.chart_data} />
            </div>
          </div>

          {/* Bottom two columns */}
          <div className="rv-bottom-grid">

            {/* Top packages */}
            <div className="rv-section">
              <div className="rv-section-title">
                <span className="rv-section-dot yellow" />
                Top Packages by Revenue
              </div>
              <div className="rv-table-card">
                {data.top_packages.length === 0
                  ? <p className="rv-empty">No bookings in this period.</p>
                  : (
                    <table className="rv-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Package</th>
                          <th>Bookings</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.top_packages.map((pkg, i) => (
                          <tr key={i}>
                            <td>
                              <span className="rv-medal">
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                              </span>
                            </td>
                            <td className="rv-pkg-name">{pkg.name}</td>
                            <td className="rv-pkg-cnt">{pkg.count}</td>
                            <td className="rv-pkg-rev">{fmtFull(pkg.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
              </div>
            </div>

            {/* Status breakdown */}
            <div className="rv-section">
              <div className="rv-section-title">
                <span className="rv-section-dot purple" />
                Booking Status Breakdown
              </div>
              <div className="rv-table-card">
                {data.status_breakdown.length === 0
                  ? <p className="rv-empty">No bookings in this period.</p>
                  : (
                    <div className="rv-status-list">
                      {[...data.status_breakdown]
                        .sort((a, b) => b.count - a.count)
                        .map((item, i) => (
                          <StatusRow key={i} item={item} total={totalBookings} />
                        ))}
                    </div>
                  )}
              </div>
            </div>

          </div>
        </>
      )}

      {!loading && !data && (
        <p className="rv-empty" style={{ marginTop: 40 }}>Could not load revenue data.</p>
      )}
    </div>
  );
}
