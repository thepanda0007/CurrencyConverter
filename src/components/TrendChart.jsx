import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import api from "../services/api";

function TrendChart({ from, to }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrend = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/trend", {
          params: {
            from_currency: from,
            to_currency: to,
            days: 30,
          },
        });

        const formatted = res.data.map((item) => ({
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          rate: item.rate,
        }));

        setData(formatted);
      } catch {
        setError("Unable to load 30-day trend.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrend();
  }, [from, to]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
      <div>
        <h2 className="text-xl font-semibold">30-Day Exchange Rate Trend</h2>
        <p className="text-sm text-gray-500">
          {from} → {to}
        </p>
      </div>

      {loading ? (
        <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#2563EB"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default TrendChart;
