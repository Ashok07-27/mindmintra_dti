import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MoodChart({ data }) {
  return (
    <div className="glass-card p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-ink">Mood Trend</h3>
        <p className="text-sm text-slate-500">Your recent emotional check-ins</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d8e7ff" />
            <XAxis dataKey="day" stroke="#6b7a90" />
            <YAxis domain={[1, 5]} stroke="#6b7a90" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#7c6cf2"
              strokeWidth={3}
              dot={{ fill: "#60a5fa", r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}



