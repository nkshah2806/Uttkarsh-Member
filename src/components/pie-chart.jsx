import React, { useEffect, useState } from "react";
import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
export const description = "A donut chart";

const chartConfig = {
  chrome: {
    label: "10 Bins",
    color: "#88C75B",
  },
  safari: {
    label: "Hire a Mover",
    color: "#8454C8",
  },
  firefox: {
    label: "20 Bins",
    color: "#652259",
  },
  edge: {
    label: "Rent A Trolly",
    color: "#F79759",
  },
  other: {
    label: "Rent A Truck",
    color: "#371C30",
  },
};

export function PieChartComponent({ data, PIE_COLORS }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== "undefined") {
      return (
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark")
      );
    }
    return false;
  });

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const callback = () => {
      setIsDark(
        html.classList.contains("dark") || body.classList.contains("dark")
      );
    };
    const observer = new MutationObserver(callback);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    observer.observe(body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <ChartContainer config={chartConfig} className="max-h-[400px] w-full">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Pie
            data={data}
            dataKey="percentage"
            nameKey="name"
            innerRadius={100}
            labelLine={false}
            label={({ payload, ...props }) => (
              <text
                fontSize={17}
                fontWeight={600}
                cx={props.cx}
                cy={props.cy}
                x={props.x}
                y={props.y}
                textAnchor={props.textAnchor}
                dominantBaseline={props.dominantBaseline}
                fill={isDark ? "#fff" : "#222"}
              >
                {payload.name}
              </text>
            )}
          >
            {data?.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </>
  );
}
