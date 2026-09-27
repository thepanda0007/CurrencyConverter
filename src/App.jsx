import Converter from "./components/Converter";
import TrendChart from "./components/TrendChart";
import Favorites from "./components/Favorites";
import { useState } from "react";

function App() {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  return (
    <main className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-3xl p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Currency Converter</h1>

          <p className="text-gray-500 mt-2">
            Live exchange rates powered by FastAPI
          </p>
        </div>

        <Converter from={from} to={to} setFrom={setFrom} setTo={setTo} />

        <TrendChart from={from} to={to} />

        <Favorites />
      </div>
    </main>
  );
}

export default App;
