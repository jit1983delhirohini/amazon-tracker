import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import EnterpriseLoader from "../components/EnterpriseLoader";

export default function AlertsSection() {
  const [failedAsins, setFailedAsins] = useState([]);
  const [priceDrops, setPriceDrops] = useState([]);
  const [dealAlerts, setDealAlerts] = useState([]);
  const [unavailableAsins, setUnavailableAsins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  /* ================= SAFE DATE FORMATTER ================= */
  function formatDate(date) {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN");
  }

  function formatDateTime(date) {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-IN");
  }

  async function fetchAlerts() {
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];

    /* ================= FAILED ASINS ================= */
    const { data: failedData } = await supabase
      .from("failed_asins")
      .select("*")
      .eq("run_date", today);

    setFailedAsins(failedData || []);

/* ================= UNAVAILABLE ASINS ================= */

const { data: unavailableData } = await supabase
  .from("v_amazon_latest_price")
  .select("*")
  .eq("availability", "unavailable");

if (unavailableData) {
  setUnavailableAsins(unavailableData);
}



/* ================= PRICE DROPS ================= */
const { data: historyData } = await supabase
  .from("amazon_price_history")
  .select("asin, price, checked_at")
  .order("checked_at", { ascending: false });

const grouped = {};

(historyData || []).forEach((row) => {
  if (!grouped[row.asin]) grouped[row.asin] = [];
  grouped[row.asin].push(row);
});

let drops = [];

Object.keys(grouped).forEach((asin) => {
  const records = grouped[asin];
  if (records.length < 2) return;

  // Group by date
  const byDate = {};
  records.forEach((rec) => {
    const dateKey = new Date(rec.checked_at)
      .toISOString()
      .split("T")[0];

    if (!byDate[dateKey]) byDate[dateKey] = [];
    byDate[dateKey].push(rec);
  });

  const uniqueDates = Object.keys(byDate).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  if (uniqueDates.length < 2) return;

  const todayRecord = byDate[uniqueDates[0]][0];
  const yesterdayRecord = byDate[uniqueDates[1]][0];

  if (todayRecord.price < yesterdayRecord.price) {
    const percentDrop =
      ((yesterdayRecord.price - todayRecord.price) /
        yesterdayRecord.price) *
      100;

    drops.push({
      asin,
      today_price: todayRecord.price,
      yesterday_price: yesterdayRecord.price,
      today_date: todayRecord.checked_at,
      yesterday_date: yesterdayRecord.checked_at,
      percentDrop: percentDrop.toFixed(2),
    });
  }
});

/* ===== FETCH BRAND + PRODUCT FROM amazon_asins ===== */

if (drops.length > 0) {
  const asinsList = drops.map((d) => d.asin);

  const { data: asinMeta } = await supabase
    .from("amazon_asins")
    .select("asin, brand, product_title")
    .in("asin", asinsList);

  const metaMap = {};
  (asinMeta || []).forEach((item) => {
    metaMap[item.asin] = item;
  });

  drops = drops.map((item) => ({
    ...item,
    brand: metaMap[item.asin]?.brand || "-",
    product_title: metaMap[item.asin]?.product_title || "-",
  }));
}

drops.sort(
  (a, b) => parseFloat(b.percentDrop) - parseFloat(a.percentDrop)
);

setPriceDrops(drops);



    /* ================= DEAL ALERTS ================= */
    const { data: dealData } = await supabase
      .from("v_amazon_latest_price")
      .select("*")
      .eq("is_limited_time_deal", true);

    setDealAlerts(dealData || []);

    setLoading(false);
  }

  /* ================= EXPORT TO EXCEL ================= */
  function exportToExcel() {
    const rows = [];

    rows.push([
      "ASIN",
      "Brand",
      "Product Title",
      "Yesterday Price",
      "Today Price",
      "% Drop",
    ]);

    priceDrops.forEach((item) => {
      rows.push([
        item.asin,
        item.brand,
        item.product_title,
        item.yesterday_price,
        item.today_price,
        item.percentDrop + "%",
      ]);
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "price_drop_alerts.csv");
    document.body.appendChild(link);
    link.click();
  }

  if (loading) {
    return <EnterpriseLoader text="Loading Alerts..." />;
  }

  return (
    <div style={{ color: "#fff" }}>
      <h2 style={{ marginBottom: 30 }}>🚨 Alerts Center</h2>

      {/* ================= FAILED ASINS ================= */}
      <div style={cardStyle}>
        <h3>🔴 Failed ASINs Today ({failedAsins.length})</h3>

        {failedAsins.length === 0 && <p>No failures today ✅</p>}

        {failedAsins.length > 0 && (
          <table style={tableStyle}>
<thead
  style={{
    position: "sticky",
    top: 0,
    background: "#122944",
    zIndex: 2,
  }}
>
  <tr>

                <th style={thTdStyle}>ASIN</th>
                <th style={thTdStyle}>Error</th>
                <th style={thTdStyle}>Time</th>
              </tr>
            </thead>
            <tbody>
              {failedAsins.map((item) => (
                <tr key={item.id}>
                  <td style={thTdStyle}>{item.asin}</td>
                  <td style={{ ...thTdStyle, color: "#ff6b6b" }}>
                    {item.error_message}
                  </td>
                  <td style={thTdStyle}>
                    {formatDateTime(item.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

{/* UNAVAILABLE ASINS */}
<div style={{ marginTop: "30px" }}>
  <h3>🚫 Currently Unavailable ASINs ({unavailableAsins.length})</h3>

  {unavailableAsins.length === 0 ? (
    <p style={{ color: "#9CA3AF" }}>All ASINs available ✅</p>
  ) : (
    <table style={{ width: "100%", marginTop: "10px" }}>
      <thead>
        <tr>
          <th>ASIN</th>
          <th>Price</th>
          <th>Last Checked</th>
        </tr>
      </thead>
      <tbody>
        {unavailableAsins.map((item) => (
          <tr key={item.asin}>
            <td>{item.asin}</td>
            <td>{item.price ?? "-"}</td>
            <td>{formatDateTime(item.checked_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>



      {/* ================= PRICE DROPS ================= */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3>📉 Price Drop Alerts ({priceDrops.length})</h3>
          <button onClick={exportToExcel} style={exportBtn}>
            Export Excel
          </button>
        </div>

        {priceDrops.length === 0 && <p>No price drops detected</p>}

{priceDrops.length > 0 && (
<div
  style={{
    maxHeight: "400px",
    overflowY: "auto",
    overflowX: "hidden",
  }}
>

    <table style={tableStyle}>

            <thead>
              <tr>
                <th
  style={{
    ...thTdStyle,
    position: "sticky",
    top: 0,
    background: "#122944",
    zIndex: 5,
  }}
>
  ASIN
</th>

                <th
  style={{
    ...thTdStyle,
    position: "sticky",
    top: 0,
    background: "#122944",
    zIndex: 5,
  }}
>
  Brand
</th>

                <th
  style={{
    ...thTdStyle,
    position: "sticky",
    top: 0,
    background: "#122944",
    zIndex: 5,
  }}
>
  Product
</th>

                <th
  style={{
    ...thTdStyle,
    position: "sticky",
    top: 0,
    background: "#122944",
    zIndex: 5,
  }}
>
  Yesterday
</th>

                <th
  style={{
    ...thTdStyle,
    position: "sticky",
    top: 0,
    background: "#122944",
    zIndex: 5,
  }}
>
  Today
</th>

                <th
  style={{
    ...thTdStyle,
    position: "sticky",
    top: 0,
    background: "#122944",
    zIndex: 5,
  }}
>
  % Increase/Decrease
</th>

              </tr>
            </thead>
            <tbody>
              {priceDrops.map((item) => {
                let severityColor = "#00ff9d";
                if (parseFloat(item.percentDrop) > 20)
                  severityColor = "#ff4d4f";
                else if (parseFloat(item.percentDrop) > 10)
                  severityColor = "#ffa940";

                return (
                  <tr key={item.asin}>
                    <td style={thTdStyle}>{item.asin}</td>
                    <td style={thTdStyle}>{item.brand}</td>
                    <td
  style={{
    ...thTdStyle,
    maxWidth: "250px",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    wordBreak: "break-word",
  }}
>
  {item.product_title}
</td>


                    <td style={thTdStyle}>
                      ₹{item.yesterday_price}
                      <br />
                      <small>{formatDate(item.yesterday_date)}</small>
                    </td>

                    <td style={thTdStyle}>
                      ₹{item.today_price}
                      <br />
                      <small>{formatDate(item.today_date)}</small>
                    </td>

                    <td
                      style={{
                        ...thTdStyle,
                        color: severityColor,
                        fontWeight: 700,
                      }}
                    >
                      ↓ {item.percentDrop}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
</table>
</div>

        )}
      </div>

      {/* ================= DEAL ALERTS ================= */}
      <div style={cardStyle}>
        <h3>🔥 Limited Time Deals ({dealAlerts.length})</h3>

        {dealAlerts.length === 0 && <p>No active deals</p>}

        {dealAlerts.length > 0 && (
  <div
    style={{
      maxHeight: "400px",
      overflowY: "auto",
      overflowX: "hidden",
      borderRadius: "8px",
    }}
  >
    <table style={tableStyle}>

            <thead>
              <tr>
                <th
  style={{
    ...thTdStyle,
    position: "sticky",
    top: 0,
    background: "#122944",
    zIndex: 5,
  }}
>
  ASIN
</th>

                <th
  style={{
    ...thTdStyle,
    position: "sticky",
    top: 0,
    background: "#122944",
    zIndex: 5,
  }}
>
  Brand
</th>

                <th
  style={{
    ...thTdStyle,
    position: "sticky",
    top: 0,
    background: "#122944",
    zIndex: 5,
  }}
>
  Product
</th>

                <th
  style={{
    ...thTdStyle,
    position: "sticky",
    top: 0,
    background: "#122944",
    zIndex: 5,
  }}
>
  Deal Price
</th>

                <th
  style={{
    ...thTdStyle,
    position: "sticky",
    top: 0,
    background: "#122944",
    zIndex: 5,
  }}
>
  Checked At
</th>

              </tr>
            </thead>
            <tbody>
              {dealAlerts.map((item) => (
                <tr key={item.asin}>
                  <td style={thTdStyle}>{item.asin}</td>
                  <td style={thTdStyle}>{item.brand}</td>
                  <td style={thTdStyle}>{item.product_title}</td>
                  <td
                    style={{
                      ...thTdStyle,
                      color: "#feca57",
                      fontWeight: 600,
                    }}
                  >
                    ₹{item.price}
                  </td>
                  <td style={thTdStyle}>
                    {formatDateTime(item.checked_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        )}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const cardStyle = {
  background: "linear-gradient(135deg, #0b1e34, #122944)",
  padding: 20,
  borderRadius: 12,
  marginBottom: 25,
  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 15,
  tableLayout: "fixed",
};

const thTdStyle = {
  padding: "10px",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  textAlign: "left",
  background: "transparent",
};


const exportBtn = {
  background: "#1677ff",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer",
};
