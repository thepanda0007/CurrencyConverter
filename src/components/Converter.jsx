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

  // Fetch supported currencies once
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
  }, []);

  // Convert whenever values change
  useEffect(() => {
    if (!currencies.length) return;

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
      } catch {
        setError("Conversion failed.");
      } finally {
        setLoading(false);
      }
    };

    convert();
  }, [from, to, amount, currencies]);

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Dropdowns */}
      <div className="flex items-end gap-3">
        <CurrencyDropdown
          label="From"
          value={from}
          onChange={setFrom}
          currencies={currencies}
        />

        <button
          onClick={swapCurrencies}
          className="p-3 rounded-full border border-gray-200 hover:bg-gray-100 transition hover:rotate-180"
        >
          <FaExchangeAlt />
        </button>

        <CurrencyDropdown
          label="To"
          value={to}
          onChange={setTo}
          currencies={currencies}
        />
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <label className="text-sm text-gray-500 font-medium">Amount</label>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Result */}
      <div className="border-t pt-5">
        {loading ? (
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <p className="text-gray-500 text-sm">Converted Amount</p>

            <h2 className="text-3xl font-bold">
              {result?.toFixed(2)} {to}
            </h2>

            <p className="text-gray-500 mt-1">
              {amount} {from}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Converter;
