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
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Chat with Data</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your data..."
              className="flex-grow"
            />
            <Button type="submit">Ask</Button>
          </form>
          {result && (
            <div className="mt-4">
              <h3 className="font-semibold">Generated SQL:</h3>
              <pre className="p-2 mt-2 bg-gray-100 rounded">
                <code>{result.sql}</code>
              </pre>
              <h3 className="mt-4 font-semibold">Result:</h3>
              <pre className="p-2 mt-2 bg-gray-100 rounded">
                <code>{JSON.stringify(result.data, null, 2)}</code>
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
