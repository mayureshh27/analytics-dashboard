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

  const fetchHistory = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/history`);
    const data = await res.json();
    setHistory(data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSql(null);
    setData([]);
    setError(null);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/chat-with-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!res.body) {
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

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
      buffer = parts[parts.length - 1];
    }
    fetchHistory();
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setQuery(item.question);
    setSql(item.sql);
    setData([]); // You might want to re-run the query or store results separately
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
              />
              <Button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Ask
              </Button>
            </form>
            {sql && (
              <div className="mt-6 p-4 bg-gray-50 border border-zinc-200 rounded-md">
                <h3 className="text-md font-semibold text-gray-700">Generated SQL:</h3>
                <pre className="p-3 mt-2 bg-gray-100 rounded-sm text-sm text-gray-800 overflow-x-auto">
                  <code>{sql}</code>
                </pre>
              </div>
            )}
            {data.length > 0 && (
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
            {error && (
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