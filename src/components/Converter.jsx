import { useEffect, useState } from "react";
import { FaExchangeAlt } from "react-icons/fa";

import CurrencyDropdown from "./CurrencyDropdown";
import api from "../services/api";

function Converter({ from, to, setFrom, setTo }) {
  const [currencies, setCurrencies] = useState([]);
  const [amount, setAmount] = useState(100);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [travelMode, setTravelMode] = useState(false);
  const [travelData, setTravelData] = useState(null);

  // Fetch recent conversions
  const fetchHistory = async () => {
    try {
      const res = await api.get("/history");
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  // Fetch favorites
  const fetchFavorites = async () => {
    try {
      const res = await api.get("/favorites");
      setFavorites(res.data);
    } catch (err) {
      console.error("Failed to load favorites", err);
    }
  };

  // Save favorite
  const saveFavorite = async () => {
    try {
      await api.post("/favorites", null, {
        params: {
          from_currency: from,
          to_currency: to,
        },
      });

      fetchFavorites();
    } catch (err) {
      console.error("Failed to save favorite", err);
    }
  };

  // Delete favorite
  const removeFavorite = async (id) => {
    try {
      await api.delete(`/favorites/${id}`);
      fetchFavorites();
    } catch (err) {
      console.error("Failed to delete favorite", err);
    }
  };

  // Load currencies, history and favorites once
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await api.get("/currencies");
        setCurrencies(res.data.supported_codes);
      } catch {
        setError("Unable to load currencies.");
      }
    };

    fetchCurrencies();
    fetchHistory();
    fetchFavorites();
  }, []);

  // Normal conversion
  const convert = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/convert", {
        params: {
          from_currency: from,
          to_currency: to,
          amount,
        },
      });

      setResult(res.data.conversion_result);
      fetchHistory();
    } catch {
      setError("Conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  // Travel Budget Mode
  const fetchTravelBudget = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/travel-budget", {
        params: {
          base_currency: from,
          amount,
        },
      });

      setTravelData(res.data);
    } catch {
      setError("Unable to calculate travel budget.");
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Travel Budget Toggle */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4 bg-gray-50">
        <div>
          <h3 className="font-semibold">Travel Budget Mode</h3>
          <p className="text-sm text-gray-500">
            Compare your budget across 5 major currencies.
          </p>
        </div>

        <button
          onClick={() => {
            setTravelMode(!travelMode);
            setTravelData(null);
            setError("");
          }}
          className={`w-14 h-8 rounded-full transition relative ${
            travelMode ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-1 w-6 h-6 bg-white rounded-full transition ${
              travelMode ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>

      {/* Currency Selection */}
      <div className="flex items-end gap-3">
        <CurrencyDropdown
          label={travelMode ? "Base Currency" : "From"}
          value={from}
          onChange={setFrom}
          currencies={currencies}
        />

        {!travelMode && (
          <>
            <button
              onClick={swapCurrencies}
              className="p-3 rounded-full border border-gray-200 hover:bg-gray-100 hover:rotate-180 transition duration-300"
              aria-label="Swap currencies"
            >
              <FaExchangeAlt />
            </button>

            <button
              onClick={saveFavorite}
              className="p-3 rounded-full border border-gray-200 hover:bg-yellow-50 hover:border-yellow-300 transition"
              title="Save Favorite"
            >
              ⭐
            </button>

            <CurrencyDropdown
              label="To"
              value={to}
              onChange={setTo}
              currencies={currencies}
            />
          </>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label className="text-sm text-gray-500 font-medium">
          {travelMode ? "Travel Budget" : "Amount"}
        </label>

        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Action Button */}
      <button
        onClick={travelMode ? fetchTravelBudget : convert}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
      >
        {loading
          ? "Calculating..."
          : travelMode
            ? "Calculate Budget"
            : "Convert"}
      </button>

      {/* Normal Conversion Result */}
      {!travelMode && (
        <div className="border-t pt-5 min-h-[72px]">
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : result !== null ? (
            <>
              <p className="text-gray-500 text-sm">Converted Amount</p>

              <h2 className="text-3xl font-bold text-gray-900">
                {result.toFixed(2)} {to}
              </h2>

              <p className="text-gray-500 mt-1">
                {amount} {from}
              </p>
            </>
          ) : (
            <p className="text-gray-400 text-sm">
              Click Convert to see the result.
            </p>
          )}
        </div>
      )}

      {/* Travel Budget Comparison */}
      {travelMode && (
        <div className="border-t pt-5 space-y-4">
          <div>
            <h3 className="text-xl font-semibold">Travel Budget Comparison</h3>

            <p className="text-gray-500 text-sm">
              {amount} {from} across major currencies
            </p>
          </div>

          {error ? (
            <p className="text-red-500">{error}</p>
          ) : travelData ? (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3">Currency</th>
                    <th className="text-right p-3">Equivalent Value</th>
                  </tr>
                </thead>

                <tbody>
                  {travelData.results.map((item) => (
                    <tr
                      key={item.currency}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-3 font-medium">{item.currency}</td>
                      <td className="p-3 text-right">
                        {item.value.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              Click Calculate Budget to compare across five currencies.
            </p>
          )}
        </div>
      )}

      {/* Favorites */}
      {!travelMode && (
        <div className="border-t pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Favorites</h3>

            <span className="text-xs text-gray-500">
              {favorites.length} saved
            </span>
          </div>

          {favorites.length === 0 ? (
            <p className="text-gray-500 text-sm">No favorites saved yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {favorites.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-2 transition"
                >
                  <button
                    onClick={() => {
                      setFrom(item.from_currency);
                      setTo(item.to_currency);
                    }}
                    className="text-sm font-medium"
                  >
                    ⭐ {item.from_currency} → {item.to_currency}
                  </button>

                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="text-gray-500 hover:text-red-500 text-xs"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent Conversions */}
      {!travelMode && (
        <div className="border-t pt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Recent Conversions</h3>

            <span className="text-xs text-gray-500">
              Last {history.length} of 10
            </span>
          </div>

          {history.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent conversions yet.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.amount} {item.from_currency} → {item.to_currency}
                    </p>

                    <p className="text-xs text-gray-500">
                      Rate: {item.rate.toFixed(4)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {item.converted_amount.toFixed(2)}
                    </p>

                    <p className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Converter;
