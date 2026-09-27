function CurrencyDropdown({ label, value, onChange, currencies }) {
  return (
    <div className="flex flex-col gap-2 flex-1">
      <label className="text-sm text-gray-500 font-medium">{label}</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {currencies.map(([code, name]) => (
          <option key={code} value={code}>
            {code} — {name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CurrencyDropdown;
