import axios from "axios";
import { useEffect, useState } from "react";
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Get the data from the payload
    return (
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          paddingInline: "6px",
          borderRadius: "5px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          fontSize: "14px",
        }}
      >
        <p
          style={{
            color: data.color === "red" ? "red" : "green",
          }}
        >
          <strong>Trend:</strong>{" "}
          {data.color === "red" ? "Decreasing" : "Increasing"}
        </p>
      </div>
    );
  }

  return null;
};

export default function LineGraph() {
  const [min, setMin] = useState(null);
  const [max, setMax] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [hoveredData, setHoveredData] = useState({
    date: chartData[0]?.x,
    open: chartData[0]?.y,
  });

  const fetchData = async (symbol) => {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=60min&outputsize=compactl&apikey=0JL6SUAHTLCI25AS`
    );
    const res = response?.data;
    const xaxis = Object.keys(res["Time Series (60min)"]);

    const xaxisFiltered = xaxis.filter((_, index) => index % 4 === 0);

    const data = xaxisFiltered
      .map((key, index) => {
        const currentOpen = parseFloat(
          res["Time Series (60min)"][key]["1. open"]
        );
        const prevOpen =
          index > 0
            ? parseFloat(
                res["Time Series (60min)"][xaxisFiltered[index - 1]]["1. open"]
              )
            : null;

        return {
          x: key, // Time
          y: currentOpen,
          color: prevOpen !== null && currentOpen < prevOpen ? "red" : "green", // Change to red if open decreases
        };
      })
      .reverse();

    setChartData(data);

    const openValues = data.map((item) => item["1. open"]);
    setMin(Math.min(...openValues));
    setMax(Math.max(...openValues));
  };

  useEffect(() => {
    fetchData("IBM");
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#f4f4f4",
          borderRadius: "5px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        <p>
          <strong>Amount:</strong> ${hoveredData.open}
        </p>
      </div>
      <LineChart
        width={500}
        height={300}
        margin={{
          top: 150,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        data={chartData}
        onMouseMove={(e) => {
          if (e.isTooltipActive) {
            setHoveredData({
              date: e.activeLabel, // Date (time)
              open: e.activePayload && e.activePayload[0].payload.y.toFixed(2), // Open value
            });
          }
        }}
      >
        <XAxis dataKey="x" hide />
        <YAxis domain={[min - 10, max + 10]} hide />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="y"
          stroke="green"
          strokeWidth={2}
          dot={false}
          activeDot={false}
        />
      </LineChart>
    </div>
  );
}
