import React, { useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// PieChart component
const PieChart = ({ data, theme = "light" }) => {
  const chartRef = useRef(null);

  const isDark = theme === "dark";

  const pieData = Array.isArray(data)
    ? data.map((item) => ({
      name: item.name,
      y: Math.abs(item.percentage),
      color: item.color,
      visible: item.percentage > 0.0, // Only show in chart if > 0.00
      showInLegend: true, // Always show in legend
    }))
    : [];

  const options = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      height: "60%",
      style: {
        color: isDark ? "#fff" : "#2B2B2B",
      },
    },
    title: {
      text: null,
    },
    tooltip: {
      style: {
        color: isDark ? "#fff" : "#2B2B2B",
        fontSize: "16px",
        fontWeight: "500",
      },
      backgroundColor: isDark ? "#222" : "#fff",
      pointFormat: "<b>{point.percentage:.2f}%</b>",
    },
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    legend: {
      itemMarginTop: 5,
      itemMarginBottom: 5,
      itemStyle: {
        fontSize: "14px",
        fontWeight: "500",
        color: isDark ? "#fff" : "#2B2B2B",
      },
      itemHoverStyle: {
        color: isDark ? "#fff" : "#2B2B2B",
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        innerSize: "70%",
        dataLabels: {
          enabled: true,
          format: "{point.name}",
          distance: 1, // Negative = inside chart
          style: {
            fontSize: "15px",
            fontWeight: "500",
            textOutline: "none",
            color: isDark ? "#fff" : "#2B2B2B",
          },
        },
        showInLegend: true,
        borderWidth: 0,
      },
    },
    series: [
      {
        name: "Services",
        colorByPoint: true,
        data: pieData,
      },
    ],
  };

  return (
    <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
  );
};

export default PieChart;
