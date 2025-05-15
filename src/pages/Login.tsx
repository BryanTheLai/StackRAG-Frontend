import { useState, type FormEvent, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDocuments, type Doc } from "@/supabase/documents";
import { Button, TextInput, Paper, Title, Text, Alert, Group, Code, Stack, Loader } from "@mantine/core"; // Using Mantine components

export default function Home() {
  const { session, user, signIn, signOut: authSignOut, isLoading: authIsLoading, authError, clearAuthError } = useAuth();
  
  const [docs, setDocs] = useState<Doc[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [fetchBusy, setFetchBusy] = useState(false);
  
  const [email, setEmail] = useState<string>(import.meta.env.VITE_TEST_EMAIL || "");
  const [pw, setPw] = useState<string>(import.meta.env.VITE_TEST_PASSWORD || "");

  useEffect(() => {
    if (authError) {
      setFeedbackMsg({ text: authError, type: 'error' });
    }
  }, [authError]);

  const fetchUserDocs = async () => {
    if (!session) {
      setFeedbackMsg({ text: "Authentication required to fetch documents.", type: 'error' });
      return;
    }
    setFetchBusy(true);
    setFeedbackMsg(null); 
    clearAuthError();
    try {
      const data: Doc[] = await fetchDocuments(session.access_token);
      setDocs(data);
      setFeedbackMsg({
        text: data.length ? `Found ${data.length} document(s).` : "No documents found for your account.",
        type: 'success',
      });
    } catch (e: unknown) {
      setFeedbackMsg({
        text: `Document fetch error: ${e instanceof Error ? e.message : String(e)}`,
        type: 'error',
      });
    }
    setFetchBusy(false);
  };

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearAuthError();
    setFeedbackMsg(null);
    await signIn(email, pw);
  };

  const handleLogout = async () => {
    clearAuthError();
    setFeedbackMsg(null);
    await authSignOut();
    setDocs([]);
  };
  
  if (authIsLoading && !session) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <Loader size="xl" />
        <Text mt="md">Loading authentication status...</Text>
      </div>
    );
  }

  return (
    <Paper shadow="xs" p="xl" style={{ maxWidth: 600, margin: "auto" }}>
      <Title order={2} ta="center" mb="lg">
        {session ? "Welcome Back!" : "AI CFO Assistant"}
      </Title>

      {feedbackMsg && (
        <Alert 
          title={feedbackMsg.type === 'error' ? "Error" : "Notification"} 
          color={feedbackMsg.type === 'error' ? 'red' : 'blue'} 
          mb="md"
          onClose={() => setFeedbackMsg(null)}
          withCloseButton
        >
          {feedbackMsg.text}
        </Alert>
      )}
      
      {!session ? (
        <form onSubmit={handleLoginSubmit}>
          <Stack>
            <TextInput
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
            />
            <TextInput
              label="Password"
              type="password"
              placeholder="Your password"
              value={pw}
              onChange={(e) => setPw(e.currentTarget.value)}
              required
            />
            <Button type="submit" loading={authIsLoading} fullWidth>
              Login
            </Button>
          </Stack>
        </form>
      ) : (
        <Stack>
          <Text>Logged in as: <Code>{user?.email}</Code></Text>
          
          <Group>
            <Button onClick={fetchUserDocs} loading={fetchBusy || authIsLoading}>
              Fetch My Documents
            </Button>
            <Button variant="outline" onClick={handleLogout} loading={authIsLoading}>
              Logout
            </Button>
          </Group>

          {docs.length > 0 && (
            <>
              <Title order={4} mt="lg">Your Documents:</Title>
              <Stack gap="xs" mt="xs">
                {docs.map((d) => (
                  <Paper key={d.id} p="sm" withBorder>
                    <Text>{d.filename} (ID: {d.id})</Text>
                  </Paper>
                ))}
              </Stack>
            </>
          )}
        </Stack>
      )}
    </Paper>
  );
}