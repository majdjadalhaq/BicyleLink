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
import "./ActivityGraph.css";

const ActivityGraph = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="activity-graph activity-graph--empty">
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
    <div className="activity-graph">
      <h3 className="activity-graph__title">Listing Activity (Last 7 Days)</h3>
      <div className="activity-graph__container">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary-color, #6b21a8)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--primary-color, #6b21a8)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(0,0,0,0.05)"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--text-light, #6b7280)",
                fontSize: 13,
                fontWeight: 500,
              }}
              dy={15}
              height={50}
              label={{
                value: "Date",
                position: "insideBottom",
                fill: "var(--text-light, #6b7280)",
                fontSize: 13,
                fontWeight: 600,
                offset: -5,
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--text-light, #6b7280)",
                fontSize: 13,
                fontWeight: 500,
              }}
              allowDecimals={false}
              dx={-10}
              width={60}
              label={{
                value: "New Listings",
                angle: -90,
                position: "insideLeft",
                fill: "var(--text-light, #6b7280)",
                fontSize: 13,
                fontWeight: 600,
              }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                fontWeight: 600,
                color: "var(--text-dark, #111827)",
              }}
              cursor={{
                stroke: "rgba(107, 33, 168, 0.2)",
                strokeWidth: 2,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="Listings"
              stroke="var(--primary-color, #6b21a8)"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorListings)"
              activeDot={{
                r: 6,
                strokeWidth: 0,
                fill: "var(--primary-color, #6b21a8)",
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
