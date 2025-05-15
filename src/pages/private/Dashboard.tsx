import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDocuments, type Doc } from "@/supabase/documents";
import {
  Paper, Title, Text, Code, Button, Stack, Group, Alert, Loader,
} from "@mantine/core";

export default function Dashboard() {
  const { session, user, signOut, isLoading: authLoading, clearAuthError } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchUserDocs = async () => {
    if (!session) {
      setMsg({ text: "Sign in required.", type: "error" });
      return;
    }
    setBusy(true);
    setMsg(null);
    clearAuthError();
    try {
      const data = await fetchDocuments(session.access_token);
      setDocs(data);
      setMsg({
        text: data.length ? `Found ${data.length} documents.` : "No documents.",
        type: "success",
      });
    } catch (e) {
      setMsg({
        text: `Fetch error: ${e instanceof Error ? e.message : String(e)}`,
        type: "error",
      });
    }
    setBusy(false);
  };

  const onLogout = async () => {
    clearAuthError();
    setMsg(null);
    await signOut();
    setDocs([]);
  };

  if (authLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Loader size="xl" />
        <Text mt="md">Loading…</Text>
      </div>
    );
  }

  return (
    <Paper shadow="xs" p="xl" style={{ maxWidth: 700, margin: "auto" }}>
      <Title order={2} mb="sm">Dashboard</Title>
      <Text mb="md">Logged in as: <Code>{user?.email}</Code></Text>

      {msg && (
        <Alert
          color={msg.type === "error" ? "red" : "blue"}
          mb="md"
          withCloseButton
          onClose={() => setMsg(null)}
        >
          {msg.text}
        </Alert>
      )}

      <Group mb="lg">
        <Button onClick={fetchUserDocs} loading={busy || authLoading}>
          Fetch My Documents
        </Button>
        <Button variant="outline" onClick={onLogout} loading={authLoading}>
          Logout
        </Button>
      </Group>

      {docs.length > 0 && (
        <>
          <Title order={4} mb="xs">Your Documents</Title>
          <Stack>
            {docs.map(d => (
              <Paper key={d.id} p="sm" withBorder>
                <Text>{d.filename} (ID: {d.id})</Text>
              </Paper>
            ))}
          </Stack>
        </>
      )}
    </Paper>
  );
}