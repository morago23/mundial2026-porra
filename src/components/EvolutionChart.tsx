"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface EvolutionDataPoint {
  name: string;
  [playerName: string]: number | string;
}

interface Props {
  data: EvolutionDataPoint[];
  playerNames: string[];
}

const COLORS = [
  "#c9a227", // gold
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#8b5cf6", // purple
  "#f97316", // orange
  "#ec4899", // pink
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#84cc16", // lime
];

export default function EvolutionChart({ data, playerNames }: Props) {
  // If no data, return nothing
  if (!data || data.length === 0 || playerNames.length === 0) {
    return null;
  }

  return (
    <div className="card" style={{ padding: "20px 16px", marginBottom: "24px" }}>
      <h2 style={{ fontSize: "1.1rem", marginBottom: "16px", fontWeight: 700 }}>
        📈 Evolución del Top 5
      </h2>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.3)" 
              fontSize={11} 
              tickMargin={10} 
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)" 
              fontSize={11} 
              tickMargin={10} 
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10, 15, 30, 0.9)",
                border: "1px solid rgba(201,162,39,0.3)",
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                fontSize: "0.85rem",
              }}
              itemStyle={{ fontWeight: 600 }}
              labelStyle={{ color: "var(--text-muted)", marginBottom: "4px" }}
            />
            <Legend 
              wrapperStyle={{ fontSize: "0.8rem", paddingTop: "10px" }} 
              iconType="circle"
              iconSize={8}
            />
            {playerNames.map((name, index) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={3}
                dot={{ r: 3, fill: COLORS[index % COLORS.length], strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                animationDuration={1500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
