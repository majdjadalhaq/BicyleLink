import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PropTypes from "prop-types";

const ActivityGraph = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] p-12 rounded-3xl border border-gray-100 dark:border-[#2a2a2a] flex flex-col items-center justify-center min-h-[400px] text-gray-400 dark:text-gray-500 shadow-sm">
        <div className="flex justify-center mb-4 text-emerald-500 opacity-50">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <p className="font-bold tracking-tight">
          No activity data for the last 7 days.
        </p>
      </div>
    );
  }

  // Format data for Recharts (e.g. converting "2026-02-23" to "Feb 23")
  const chartData = data.map((item) => {
    const date = new Date(item._id);
    return {
      name: date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      Listings: item.count,
    };
  });

  return (
    <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-3xl border border-gray-100 dark:border-[#2a2a2a] shadow-sm glass-panel overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
            Platform Pulse
          </h3>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
            New listings — Last 7 days
          </p>
        </div>
      </div>
      <div
        className="h-[350px] w-full mt-4 relative overflow-hidden"
        style={{ minWidth: 0 }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          debounce={100}
          minWidth={0}
          minHeight={350}
        >
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="rgba(156, 163, 175, 0.1)"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#9ca3af",
                fontSize: 11,
                fontWeight: 600,
              }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#9ca3af",
                fontSize: 11,
                fontWeight: 600,
              }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor:
                  "var(--color-tooltip-bg, rgba(255, 255, 255, 0.9))",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                borderRadius: "16px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                padding: "12px 16px",
              }}
              itemStyle={{
                color: "#059669",
                fontWeight: 800,
                fontSize: "14px",
              }}
              labelStyle={{
                color: "#6b7280",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "4px",
              }}
              cursor={{
                stroke: "#10b981",
                strokeWidth: 2,
                strokeDasharray: "6 6",
              }}
            />
            <Area
              type="monotone"
              dataKey="Listings"
              stroke="#10b981"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorListings)"
              animationDuration={2000}
              activeDot={{
                r: 8,
                strokeWidth: 0,
                fill: "#10b981",
                shadow: "0 0 20px rgba(16, 185, 129, 0.5)",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

ActivityGraph.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    }),
  ).isRequired,
};

export default ActivityGraph;
