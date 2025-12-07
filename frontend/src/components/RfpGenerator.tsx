import { useState } from "react";
import axios from "axios";

interface RfpData {
  id: number;
  subject: string;
  body: string;
}

export function RfpGenerator({
  input,
  setInput,
  rfpResponse,
  setRfpResponse,
  error,
  setError,
  loading,
  setLoading,
  rfpId,
  setRfpId,
}: {
  input: string;
  setInput: (input: string) => void;
  rfpResponse: RfpData | null;
  setRfpResponse: (data: RfpData | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  rfpId: number;
  setRfpId: (rfpId: number) => void;
}) {
  const [comparisonHtml, setComparisonHtml] = useState<string | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  function structuredResponse() {
    setLoading(true);
    setRfpResponse(null);
    setError(null);
    setComparisonHtml(null);
    setComparisonError(null);

    const data = {
      userText: input,
    };

    axios
      .post("http://localhost:3000/structured-response", data)
      .then((response) => {
        setLoading(false);

        const { rfpId, data: rfpContent } = response.data;

        const fullRfpData: RfpData = {
          id: rfpId,
          subject: rfpContent.subject,
          body: rfpContent.body,
        };

        setRfpResponse(fullRfpData);
        setRfpId(rfpId);

        console.log("Created RFP ID:", rfpId);
        console.log("RFP Created:", fullRfpData);
      })
      .catch((err) => {
        setLoading(false);
        setError("Failed to create RFP. Check server console for details.");
        console.error("Error creating RFP:", err);
      });
  }

  async function compareVendors() {
    if (!rfpId || rfpId <= 0) {
      alert("Please create and save an RFP first.");
      return;
    }

    setComparisonLoading(true);
    setComparisonError(null);
    setComparisonHtml(null);

    try {
      const res = await axios.get(
        `http://localhost:3000/rfp/${rfpId}/comparison`
      );
      setComparisonHtml(res.data.comparison);
    } catch (err) {
      console.error("Error fetching comparison:", err);
      setComparisonError(
        "Failed to generate comparison. Check server console for details."
      );
    } finally {
      setComparisonLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-start items-center space-y-5 w-full">
      <div className="flex flex-col space-y-3 justify-center items-center w-full h-full">
        <textarea
          onChange={(e) => {
            setInput(e.target.value);
          }}
          className="bg-white p-5 border border-gray-300  rounded text-black  w-full h-40 max-h-[400px] resize-none"
          placeholder='Enter details for the RFP (e.g., "Need a website redesign for a small e-commerce store with 5 pages and payment integration").'
          value={input}
        />
        <button
          className="text-white border border-white px-6 py-2 rounded-lg hover:bg-white hover:text-black transition duration-200 disabled:opacity-50 w-full"
          onClick={structuredResponse}
          disabled={loading || input.trim() === ""}
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="loader ease-linear rounded-full border-2 border-t-2 border-gray-200 h-5 w-5"></div>
              <span>Generating RFP...</span>
            </span>
          ) : (
            "Create Structured RFP"
          )}
        </button>
      </div>

      <div className="w-full mt-5">
        {error && (
          <div className="text-red-500 bg-red-100 p-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {rfpResponse && (
          <div className="text-white bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-3 border-b border-gray-700 pb-2">
              Generated RFP Email (ID: {rfpResponse.id})
            </h3>

            <p className="text-lg mb-2">
              <span className="font-semibold">Subject:</span>{" "}
              <span className="font-normal">{rfpResponse.subject}</span>
            </p>

            <div className="whitespace-pre-wrap text-sm border border-gray-700 p-3 rounded bg-gray-900 mb-4">
              {rfpResponse.body}
            </div>

            <button
              className="w-full text-white bg-purple-600 border border-purple-600 px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-purple-700 transition duration-200 text-sm"
              onClick={compareVendors}
              disabled={comparisonLoading || loading || !rfpId || rfpId <= 0}
            >
              {comparisonLoading
                ? "Comparing proposals and finding the best vendor..."
                : "Want me compare proposals and recommend me a vendor?"}
            </button>

            {(comparisonError || comparisonHtml) && (
              <div className="mt-4">
                {comparisonError && (
                  <div className="text-red-400 bg-red-900/60 p-3 rounded mb-3 text-sm">
                    {comparisonError}
                  </div>
                )}

                {comparisonHtml && (
                  <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                    <h4 className="text-lg font-semibold mb-2 border-b border-gray-700 pb-1">
                      Comparison & Recommendation
                    </h4>
                    <div
                      className="prose prose-invert max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: comparisonHtml }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
