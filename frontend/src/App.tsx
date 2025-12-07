import { useState } from "react";
import { RfpGenerator } from "./components/RfpGenerator";
import { VendorList } from "./components/VendorList";
import "./App.css"

interface RfpData {
  id: number;
  subject: string;
  body: string;
}

interface Vendor {
  id: number;
  email: string;
  name: string;
}

function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rfpResponse, setRfpResponse] = useState<RfpData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [rfpId, setRfpId] = useState<number>(0);

  return (
    <>
      <div className="bg-black min-h-screen w-full p-10 flex items-center justify-center">
        <div className="w-full max-w-6xl">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            RFP Generation & Vendor Management
          </h1>

          <div className="flex  gap-10 w-full items-center">
            <div className="flex-1">
              <RfpGenerator
                input={input}
                setInput={setInput}
                rfpId={rfpId}
                setRfpId={setRfpId}
                rfpResponse={rfpResponse}
                setRfpResponse={setRfpResponse}
                error={error}
                setError={setError}
                loading={loading}
                setLoading={setLoading}
              />
            </div>

            <div className="w-full max-w-sm">
              <VendorList
                vendors={vendors}
                setVendors={setVendors}
                rfpResponse={rfpResponse}
                rfpLoading={loading}
                rfpId={rfpId}
              />
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .loader {
          border-top-color: #3498db;
          -webkit-animation: spin 1s linear infinite;
          animation: spin 1s linear infinite;
        }
        @-webkit-keyframes spin {
          0% { -webkit-transform: rotate(0deg); }
          100% { -webkit-transform: rotate(360deg); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default App;
