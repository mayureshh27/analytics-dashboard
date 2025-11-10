"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

export default function ChatPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ sql: string; data: any; } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/chat-with-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="p-8">
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
          {result && (
            <div className="mt-6 p-4 bg-gray-50 border border-zinc-200 rounded-md">
              <h3 className="text-md font-semibold text-gray-700">Generated SQL:</h3>
              <pre className="p-3 mt-2 bg-gray-100 rounded-sm text-sm text-gray-800 overflow-x-auto">
                <code>{result.sql}</code>
              </pre>
              <h3 className="mt-4 text-md font-semibold text-gray-700">Result:</h3>
              <pre className="p-3 mt-2 bg-gray-100 rounded-sm text-sm text-gray-800 overflow-x-auto">
                <code>{JSON.stringify(result.data, null, 2)}</code>
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}