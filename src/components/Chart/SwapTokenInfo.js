import React, { useEffect, useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import useDimensions from "react-cool-dimensions";
import moment from "moment";
import { CalcFiveDigit } from "../../helpers";

const SwapTokenInfo = ({ inputTokenId, outputTokenId }) => {
  const [chartData, setChartData] = useState([]);
  const [baseTokenId, setBaseTokenId] = useState("");
  const [quoteTokenId, setQuoteTokenId] = useState("");
  const [inputTokenInfo, setInputTokenInfo] = useState(null);
  const [outputTokenInfo, setOutputTokenInfo] = useState(null);
  const [mouseData, setMouseData] = useState(null);
  const [daysToShow, setDaysToShow] = useState(1);

  const { observe, width, height } = useDimensions();

  const handleMouseMove = (coords) => {
    if (coords.activePayload) {
      setMouseData(coords.activePayload[0].payload);
    }
  };

  const handleMouseLeave = () => {
    setMouseData(null);
  };

  const getChartData = async () => {
    const inputResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/${baseTokenId}/ohlc?vs_currency=usd&days=${daysToShow}`
    );
    const outputResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/${quoteTokenId}/ohlc?vs_currency=usd&days=${daysToShow}`
    );
    const inputData = await inputResponse.json();
    const outputData = await outputResponse.json();

    let data = [];
    if (Array.isArray(inputData)) {
      data = data.concat(inputData);
    }
    if (Array.isArray(outputData)) {
      data = data.concat(outputData);
    }

    const formattedData = data.reduce((a, c) => {
      const found = a.find((price) => price.time === c[0]);

      if (found) {
        if (["usd-coin", "tether"].includes(quoteTokenId)) {
          found.price = found.inputPrice / c[4];
        } else {
          found.price = c[4] / found.inputPrice;
        }
      } else {
        a.push({ time: c[0], inputPrice: c[4] });
      }
      return a;
    }, []);
    formattedData[formattedData.length - 1].time = Date.now();
    setChartData(formattedData.filter((d) => d.price));
  };

  useEffect(() => {
    if (!inputTokenId || !outputTokenId) {
      return;
    }
    if (["usd-coin", "tether"].includes(inputTokenId)) {
      setBaseTokenId(outputTokenId);
      setQuoteTokenId(inputTokenId);
    } else {
      setBaseTokenId(inputTokenId);
      setQuoteTokenId(outputTokenId);
    }
  }, [inputTokenId, outputTokenId]);

  const getInputTokenInfo = async () => {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${inputTokenId}?localization=false&tickers=false&developer_data=false&sparkline=false
      `
    );
    const data = await response.json();
    setInputTokenInfo(data);
  };

  const getOutputTokenInfo = async () => {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${outputTokenId}?localization=false&tickers=false&developer_data=false&sparkline=false
      `
    );
    const data = await response.json();
    setOutputTokenInfo(data);
  };

  useMemo(() => {
    if (baseTokenId && quoteTokenId) {
      getChartData();
    }
  }, [daysToShow, baseTokenId, quoteTokenId]);

  useMemo(() => {
    if (baseTokenId) {
      getInputTokenInfo();
    }
    if (quoteTokenId) {
      getOutputTokenInfo();
    }
  }, [baseTokenId, quoteTokenId]);

  const chartChange = chartData.length
    ? ((chartData[chartData.length - 1]["price"] - chartData[0]["price"]) /
        chartData[0]["price"]) *
      100
    : 0;

  return (
    <>
      <div className="container mt-4" ref={observe}>
        <div className="row">
          <div className="col-6">
            {inputTokenInfo && outputTokenInfo ? (
              <div>
                {`${outputTokenInfo?.symbol?.toUpperCase()}/${inputTokenInfo?.symbol?.toUpperCase()}`}
              </div>
            ) : null}
            {mouseData ? (
              <>
                <div>
                  {CalcFiveDigit(mouseData?.price)}
                  <span
                    className="ml-2"
                    style={
                      chartChange >= 0
                        ? { fontSize: "0.8rem", color: "green" }
                        : { fontSize: "0.8rem", color: "red" }
                    }
                  >
                    {chartChange.toFixed(2)}%
                  </span>
                </div>
                <div>{moment(mouseData?.time).format("DD MMM YY, h:mma")}</div>
              </>
            ) : (
              <>
                <div>
                  {CalcFiveDigit(chartData[chartData.length - 1]?.price)}
                  <span
                    className="ml-2"
                    style={
                      chartChange >= 0
                        ? { fontSize: "0.8rem", color: "green" }
                        : { fontSize: "0.8rem", color: "red" }
                    }
                  >
                    {chartChange.toFixed(2)}%
                  </span>
                </div>
                <div>
                  {moment(chartData[chartData.length - 1]?.time).format(
                    "DD MMM YY, h:mma"
                  )}
                </div>
              </>
            )}
          </div>
          <div className="col-6 d-flex justify-content-end">
            <div>
              <button onClick={() => setDaysToShow(1)}>24H</button>
              <button onClick={() => setDaysToShow(7)} className="ml-2">
                7D
              </button>
              <button onClick={() => setDaysToShow(30)} className="ml-2">
                30D
              </button>
              <button onClick={() => setDaysToShow(180)} className="ml-2">
                6M
              </button>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div style={{ width: "100%", height: "200px" }}>
              <AreaChart
                width={width}
                height={height}
                data={chartData}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <Tooltip
                  cursor={{
                    strokeOpacity: 0,
                  }}
                  content={<></>}
                />
                <defs>
                  <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="red" stopOpacity={0.9} />
                    <stop offset="90%" stopColor="red" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  isAnimationActive={true}
                  type="monotone"
                  dataKey="price"
                  stroke="red"
                  fill="url(#gradientArea)"
                />
                <XAxis dataKey="time" />
                <YAxis
                  dataKey="price"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                />
              </AreaChart>
            </div>
          </div>
        </div>

        {/* <div className="row mt-5">
          <div className="col-12">
            <div className="accordion" id="accordionExample">
              <div className="card">
                <div className="card-header" id="headingOne">
                  <h2 className="mb-0">
                    <button
                      className="btn btn-link btn-block text-left"
                      type="button"
                      data-toggle="collapse"
                      data-target="#collapseOne"
                      aria-expanded="true"
                      aria-controls="collapseOne"
                    >
                      Collapsible Group Item #1
                    </button>
                  </h2>
                </div>

                <div
                  id="collapseOne"
                  className="collapse show"
                  aria-labelledby="headingOne"
                  data-parent="#accordionExample"
                >
                  <div className="card-body">
                    Some placeholder content for the first accordion panel. This
                    panel is shown by default, thanks to the <code>.show</code>{" "}
                    class.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default SwapTokenInfo;
