"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { ResultsTable } from "@/components/ResultsTable";

interface HistoryItem {
  id: string;
  question: string;
  sql: string;
  createdAt: string;
}

export default function ChatPage() {
  const [query, setQuery] = useState("");
  const [sql, setSql] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // --- NEW STATE for loading and cold starts ---
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Generating response...");

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error("Failed to fetch history:", e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSql(null);
    setData([]);
    setError(null);
    setIsLoading(true);
    setLoadingMessage("Generating response..."); // Set default message

    // Fallback timer just in case the request hangs indefinitely
    const coldStartTimer = setTimeout(() => {
      setLoadingMessage("Waking up the AI service... This can take a minute on the free tier. Please wait.");
    }, 8000); // 8 seconds

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/chat-with-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      // We got a response, clear the fallback timer!
      clearTimeout(coldStartTimer);

      // --- NEW: Handle specific cold start errors ---
      if (!res.ok) {
        const statusCode = res.status;
        const errorBody = await res.json().catch(() => ({})); // Get error from proxy
        const proxyErrorMessage = errorBody.error || "An unknown error occurred.";

        if (statusCode === 429) {
          setError("The AI service is busy (Too Many Requests). This is a common cold start symptom. Please wait 30 seconds and try again.");
        } else if (statusCode === 504) {
          setError("The AI service timed out (Gateway Timeout). This is a classic cold start symptom. Please wait a minute and try again.");
        } else {
          setError(`An error occurred: ${proxyErrorMessage} (Status: ${statusCode})`);
        }

        setIsLoading(false);
        return; // Stop execution
      }
      // --- End of new error handling ---

      if (!res.body) {
        throw new Error("Response body is empty.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n");

        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (part) {
            try {
              const parsed = JSON.parse(part);
              if (parsed.type === "sql") {
                setSql(parsed.data);
              } else if (parsed.type === "data") {
                setData((prevData) => [...prevData, parsed.data]);
              } else if (parsed.type === "error") {
                setError(parsed.error);
              }
            } catch (e) {
              console.error("Error parsing stream part:", part, e);
            }
          }
        }
        buffer = parts[parts.length - 1] ?? "";
      }

      fetchHistory();

    } catch (err: any) {
      // This will catch *network* errors (e.g., failed to connect)
      console.error(err);
      clearTimeout(coldStartTimer);
      setError("Failed to connect to the server. Please check your network and try again.");
    } finally {
      // This block runs *always*
      clearTimeout(coldStartTimer); // Ensure timer is always cleared
      setIsLoading(false); // Stop loading
    }
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setQuery(item.question);
    setSql(item.sql);
    setData([]);
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    if (!sql) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/export/${format}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      console.error('Export failed');
    }
  };

  return (
      <div className="flex h-screen">
        <div className="w-1/4 bg-gray-50 p-4 border-r border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Chat History</h2>
          <ul>
            {history.map((item) => (
                <li key={item.id} className="mb-2">
                  <button
                      onClick={() => handleHistoryClick(item)}
                      className="text-left w-full p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {item.question}
                  </button>
                </li>
            ))}
          </ul>
        </div>
        <div className="w-3/4 p-8">
          <Card className="border border-zinc-200 rounded-lg shadow-sm">
            <CardHeader className="border-b border-zinc-200 px-6 py-4">
              <CardTitle className="text-lg font-semibold text-gray-800">Chat with Data</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="flex space-x-4">
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a question about your data..."
                    className="flex-grow border border-zinc-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading} // Disable input while loading
                />
                <Button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    disabled={isLoading} // Disable button while loading
                >
                  {isLoading ? "Thinking..." : "Ask"} {/* Change button text */}
                </Button>
              </form>

              {/* --- NEW: Loading UI --- */}
              {isLoading && (
                  <div className="mt-6 p-4 bg-gray-50 border border-zinc-200 rounded-md">
                    <h3 className="text-md font-semibold text-gray-700">Loading...</h3>
                    <p className="p-3 mt-2 bg-gray-100 rounded-sm text-sm text-gray-800">
                      {loadingMessage}
                    </p>
                  </div>
              )}

              {/* Show SQL *only* if not loading */}
              {!isLoading && sql && (
                  <div className="mt-6 p-4 bg-gray-50 border border-zinc-200 rounded-md">
                    <h3 className="text-md font-semibold text-gray-700">Generated SQL:</h3>
                    <p className="p-3 mt-2 bg-gray-100 rounded-sm text-sm text-gray-800 overflow-x-auto">
                  <code>{sql}</code>
                </p>
                  </div>
              )}

              {/* Show data *only* if not loading */}
              {!isLoading && data.length > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-md font-semibold text-gray-700">Result:</h3>
                      <div className="space-x-2">
                        <Button onClick={() => handleExport('csv')} disabled={!sql || data.length === 0} size="sm" variant="outline">
                          Export as CSV
                        </Button>
                        <Button onClick={() => handleExport('excel')} disabled={!sql || data.length === 0} size="sm" variant="outline">
                          Export as Excel
                        </Button>
                      </div>
                    </div>
                    <ResultsTable data={data} />
                  </div>
              )}

              {/* Show error *only* if not loading */}
              {!isLoading && error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <h3 className="text-md font-semibold text-red-700">Error:</h3>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
  );
}