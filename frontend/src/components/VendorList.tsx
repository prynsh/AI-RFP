import { useState } from "react";
import axios from "axios";

interface Vendor {
  id: number;
  email: string;
  name: string;
}
interface RfpData {
  id: number;
  subject: string;
  body: string;
}

export function VendorList({
  vendors,
  setVendors,
  rfpResponse,
  rfpLoading,
  rfpId,
}: {
  vendors: Vendor[];
  setVendors: (vendors: Vendor[]) => void;
  rfpResponse: RfpData | null;
  rfpLoading: boolean;
  rfpId: number;
}) {
  const [vendorLoading, setVendorLoading] = useState(false);
  const [vendorError, setVendorError] = useState<string | null>(null);
  const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([]);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  async function getVendors() {
    setVendorLoading(true);
    setVendorError(null);
    setSendSuccess(null);
    try {
      const response = await axios.get("http://localhost:3000/vendors");
      setVendors(response.data.vendors);
    } catch (err) {
      setVendorError("Failed to fetch vendors.");
      console.error("Error fetching vendors:", err);
    } finally {
      setVendorLoading(false);
    }
  }

  const toggleVendorSelection = (vendorId: number) => {
    setSendSuccess(null);
    setSelectedVendorIds((prevIds) =>
      prevIds.includes(vendorId)
        ? prevIds.filter((id) => id !== vendorId)
        : [...prevIds, vendorId]
    );
  };

  async function sendRfpToVendors() {
    if (!rfpResponse || rfpId <= 0) {
      alert("Please create and save an RFP first (RFP ID is missing).");
      return;
    }
    if (selectedVendorIds.length === 0) {
      alert("Please select at least one vendor.");
      return;
    }

    setVendorLoading(true);
    setVendorError(null);
    setSendSuccess(null);

    const selectedVendors = vendors.filter((v) =>
      selectedVendorIds.includes(v.id)
    );
    const selectedVendorEmails = selectedVendors.map((v) => v.email);

    const data = {
      rfpId: rfpId,
      email: selectedVendorEmails,
    };

    try {
      await axios.post("http://localhost:3000/send-rfp", data);
      setSendSuccess(
        `RFP successfully sent to ${selectedVendorIds.length} vendor(s)!`
      );
      setSelectedVendorIds([]);
    } catch (err) {
      setVendorError("Failed to send RFP. Check server console for details.");
      console.error("Error sending RFP:", err);
    } finally {
      setVendorLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm ml-8">
      <div className="mb-4 flex justify-between items-center">
        <button
          className="text-white border border-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-white hover:text-black transition duration-200"
          onClick={getVendors}
          disabled={vendorLoading || rfpLoading}
        >
          {vendorLoading ? "Loading Vendors..." : "Get Vendors"}
        </button>

        <button
          className="text-white bg-green-600 border border-green-600 px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-green-700 transition duration-200"
          onClick={sendRfpToVendors}
          disabled={
            vendorLoading ||
            rfpLoading ||
            selectedVendorIds.length === 0 ||
            rfpId <= 0
          }
        >
          Send RFP to {selectedVendorIds.length} Vendor
          {selectedVendorIds.length !== 1 ? "s" : ""}
        </button>
      </div>

      {vendorError && (
        <p className="text-red-400 text-center bg-red-900 p-3 rounded mb-4">
          {vendorError}
        </p>
      )}

      {sendSuccess && (
        <p className="text-green-400 text-center bg-green-900 p-3 rounded mb-4">
          {sendSuccess}
        </p>
      )}

      {!vendorLoading && vendors.length > 0 && (
        <ul className="list-none p-0 space-y-3">
          <h2 className="text-xl text-white mb-4 border-b pb-2 border-gray-700">
            Select Vendors
          </h2>
          {vendors.map((vendor) => (
            <li
              key={vendor.id}
              className="bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={`vendor-${vendor.id}`}
                  checked={selectedVendorIds.includes(vendor.id)}
                  onChange={() => toggleVendorSelection(vendor.id)}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded cursor-pointer"
                />
                <div className="text-white">
                  <label
                    htmlFor={`vendor-${vendor.id}`}
                    className="font-bold cursor-pointer block"
                  >
                    {vendor.name}
                  </label>
                  <p className="text-xs text-gray-400">{vendor.email}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!vendorLoading && !vendorError && vendors.length === 0 && (
        <p className="text-gray-400 text-center">
          Click &apos;Get Vendors&apos; to load the list.
        </p>
      )}
    </div>
  );
}
