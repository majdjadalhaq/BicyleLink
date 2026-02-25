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
      <div className="bg-light-surface dark:bg-dark-surface p-8 rounded-2xl border border-light-border dark:border-dark-border flex items-center justify-center min-h-[300px] text-gray-500 dark:text-gray-400">
        <p>No activity data available for the last 7 days.</p>
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
    <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl border border-light-border dark:border-dark-border shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
        Listing Activity (Last 7 Days)
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(156, 163, 175, 0.2)"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#6b7280",
                fontSize: 12,
              }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#6b7280",
                fontSize: 12,
              }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--light-surface, #ffffff)",
                borderColor: "var(--light-border, #e5e7eb)",
                borderRadius: "0.5rem",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                color: "var(--text-dark, #111827)",
              }}
              itemStyle={{
                color: "#10b981",
                fontWeight: 600,
              }}
              cursor={{
                stroke: "rgba(16, 185, 129, 0.4)",
                strokeWidth: 2,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="Listings"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorListings)"
              activeDot={{
                r: 6,
                strokeWidth: 0,
                fill: "#10b981",
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
