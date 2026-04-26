"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserOption = { id: string; name: string; email: string; role: "ISSUER" | "STUDENT" | "EMPLOYER" };

export function UploadForm({ onUploaded }: { onUploaded?: () => void }) {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [issuedToId, setIssuedToId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const students = useMemo(() => users.filter((u) => u.role === "STUDENT"), [users]);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => setUsers(data.users ?? []))
      .catch(() => setUsers([]));
  }, []);

  async function submit() {
    if (!title || !issuedToId || !file) {
      toast.error("Title, student, and file are required.");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.set("title", title);
      form.set("description", description);
      form.set("issuedToId", issuedToId);
      form.set("file", file);

      const res = await fetch("/api/certificates", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Upload failed");

      toast.success("Certificate uploaded.");
      setTitle("");
      setDescription("");
      setIssuedToId("");
      setFile(null);
      onUploaded?.();
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload certificate</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="B.Tech Degree Certificate" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="desc">Description (optional)</Label>
          <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Major, grade, honors..." />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="student">Issued to (student)</Label>
          <select
            id="student"
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={issuedToId}
            onChange={(e) => setIssuedToId(e.target.value)}
          >
            <option value="">Select a student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="file">File</Label>
          <Input
            id="file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <Button onClick={submit} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </Button>
      </CardContent>
    </Card>
  );
}

