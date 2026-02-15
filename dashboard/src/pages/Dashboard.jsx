import { useEffect, useState } from "react";
import MainLayout from "../layout/MainLayout";
import { supabase } from "../supabase";

export default function Dashboard({ session }) {
  const [asins, setAsins] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [selectedAsin, setSelectedAsin] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH BRANDS ================= */

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    const { data } = await supabase
      .from("amazon_asins")
      .select("brand")
      .eq("is_active", true);

    if (data) {
      const unique = ["ALL", ...new Set(data.map(d => d.brand))];
      setBrands(unique);
    }
  };

  /* ================= FETCH ASINS ================= */

  useEffect(() => {
    fetchAsins(selectedBrand);
  }, [selectedBrand]);

  const fetchAsins = async (brand) => {
    let query = supabase
      .from("amazon_asins")
      .select("asin, product_title, brand")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (brand !== "ALL") {
      query = query.eq("brand", brand);
    }

    const { data } = await query;

    if (data) {
      setAsins(data);
      if (data.length > 0) {
        setSelectedAsin(data[0].asin);
      }
    }
  };

  /* ================= SEARCH AUTOCOMPLETE ================= */

  useEffect(() => {
    if (searchTerm.length >= 3) {
      const filtered = asins.filter(item =>
        item.asin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_title?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }, [searchTerm, asins]);

  const handleSuggestionClick = (asin) => {
    setSelectedAsin(asin);
    setSearchTerm("");
    setShowSuggestions(false);
  };

  /* ================= FETCH LATEST DATA ================= */

  useEffect(() => {
    if (selectedAsin) {
      fetchLatestPrice(selectedAsin);
    }
  }, [selectedAsin]);

  const fetchLatestPrice = async (asin) => {
    setLoading(true);

    const { data } = await supabase
      .from("v_amazon_latest_price")
      .select("*")
      .eq("asin", asin)
      .single();

    setLatestData(data || null);
    setLoading(false);
  };

  /* ================= EXPORT EXCEL ================= */

  const handleExport = async () => {
    let query = supabase
      .from("v_amazon_latest_price")
      .select("*");

    if (selectedBrand !== "ALL") {
      query = query.eq("brand", selectedBrand);
    }

    const { data } = await query;
    if (!data || data.length === 0) return;

    const header = [
      "ASIN",
      "Brand",
      "Product Name",
      "Current Price",
      "Deal Status",
      "Last Checked"
    ];

    const rows = data.map(item => [
      item.asin,
      item.brand,
      item.product_title,
      item.price,
      item.is_limited_time_deal ? "Limited Time Deal" : "No Active Deal",
      new Date(item.checked_at).toLocaleString()
    ]);

    const csvContent =
      [header, ...rows].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "application/vnd.ms-excel"
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ASIN_Report_${selectedBrand}.xls`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const selectedProduct = asins.find(a => a.asin === selectedAsin);



const formatIST = (utcDate) => {
  return new Date(utcDate).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};




  /* ================= UI ================= */

  return (
    <MainLayout user={session.user}>
      <div style={styles.container}>

        <div style={styles.headerRow}>
          <h2 style={styles.heading}>ASIN Overview</h2>

          <div style={styles.filterGroup}>

            {/* Brand Dropdown */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={styles.dropdown}
            >
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search ASIN or Product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.search}
              />

              {showSuggestions && suggestions.length > 0 && (
                <div style={styles.suggestionBox}>
                  {suggestions.map(item => (
                    <div
                      key={item.asin}
                      style={styles.suggestionItem}
                      onClick={() => handleSuggestionClick(item.asin)}
                    >
                      <strong>{item.asin}</strong>
                      <div style={styles.suggestionText}>
                        {item.product_title}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ASIN Dropdown (ALL ASINS ALWAYS) */}
            <select
              value={selectedAsin}
              onChange={(e) => setSelectedAsin(e.target.value)}
              style={styles.dropdown}
            >
              {asins.map(item => (
                <option key={item.asin} value={item.asin}>
                  {item.asin}
                </option>
              ))}
            </select>

            {/* Export Button */}
            <button
              onClick={handleExport}
              style={styles.exportButton}
            >
              Export Excel
            </button>

          </div>
        </div>

        <div style={styles.card}>
          {loading ? (
            <p style={styles.loading}>Loading...</p>
          ) : latestData ? (
            <>
              <h3 style={styles.title}>
                {selectedProduct?.product_title || selectedAsin}
              </h3>

              <p style={styles.brandLabel}>
                Brand: {latestData.brand}
              </p>

              <div style={styles.infoRow}>
                <div>
                  <p style={styles.label}>Current Price</p>
                  <p style={styles.price}>
                    ₹ {latestData.price?.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p style={styles.label}>Deal Status</p>
                  <span
                    style={{
                      ...styles.badge,
                      background:
                        latestData.is_limited_time_deal
                          ? "#16a34a"
                          : "#475569",
                    }}
                  >
                    {latestData.is_limited_time_deal
                      ? "Limited Time Deal"
                      : "No Active Deal"}
                  </span>
                </div>

                <div>
                  <p style={styles.label}>Last Checked</p>
                  <p style={styles.time}>
                   {formatIST(latestData.checked_at)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p style={styles.loading}>No data available</p>
          )}
        </div>

      </div>
    </MainLayout>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: { maxWidth: 1100, margin: "0 auto" },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    flexWrap: "wrap",
    gap: 15,
  },
  filterGroup: { display: "flex", gap: 12, flexWrap: "wrap" },
  heading: { fontSize: 22, color: "#fff" },
  dropdown: {
    padding: 10,
    borderRadius: 8,
    background: "#0f172a",
    color: "#fff",
    border: "1px solid #334155",
  },
  search: {
    padding: 10,
    borderRadius: 8,
    background: "#0f172a",
    color: "#fff",
    border: "1px solid #334155",
    width: 220,
  },
  exportButton: {
    padding: "10px 16px",
    borderRadius: 8,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  suggestionBox: {
    position: "absolute",
    top: "110%",
    left: 0,
    right: 0,
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 8,
    maxHeight: 250,
    overflowY: "auto",
    zIndex: 1000,
  },
  suggestionItem: {
    padding: 10,
    cursor: "pointer",
	color: "#ffffff",
    borderBottom: "1px solid #1e293b",
  },
  suggestionText: { fontSize: 12, color: "#94a3b8" },
  card: {
    background: "linear-gradient(145deg,#0f172a,#111c2d)",
    padding: 30,
    borderRadius: 16,
    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
  },
  title: { color: "#fff", marginBottom: 8 },
  brandLabel: { color: "#94a3b8", marginBottom: 25 },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 30,
  },
  label: { color: "#94a3b8", fontSize: 14, marginBottom: 6 },
  price: { fontSize: 26, fontWeight: "bold", color: "#22c55e" },
  badge: { padding: "6px 12px", borderRadius: 8, color: "#fff", fontSize: 13 },
  time: { color: "#e2e8f0" },
  loading: { color: "#94a3b8" },
};
