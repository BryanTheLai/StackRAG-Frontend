import { useState, type FormEvent, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TextInput, Button, Paper, Title, Alert, Stack, Loader, Text } from "@mantine/core";
import { useLocation } from "wouter";

export default function Login() {
  const { signIn, isLoading: authLoading, authError, clearAuthError, session } = useAuth();
  const [email, setEmail] = useState(import.meta.env.VITE_TEST_EMAIL || "");
  const [pw, setPw] = useState(import.meta.env.VITE_TEST_PASSWORD || "");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (authError) {
      setFeedback(authError);
    }
  }, [authError]);

  useEffect(() => {
    if (session) {
      navigate("/private/dashboard", { replace: true });
    }
  }, [session, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setFeedback(null);
    await signIn(email, pw);
  };

  if (authLoading && !session) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Loader size="xl" />
        <Text mt="md">Checking authentication…</Text>
      </div>
    );
  }

  return (
    <Paper shadow="xs" p="xl" style={{ maxWidth: 600, margin: "auto" }}>
      <Title order={2} ta="center" mb="lg">
        Login
      </Title>
      {feedback && <Alert color="red" mb="md" withCloseButton onClose={() => setFeedback(null)}>{feedback}</Alert>}
      <form onSubmit={onSubmit}>
        <Stack>
          <TextInput
            label="Email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.currentTarget.value)}
          />
          <TextInput
            label="Password"
            type="password"
            required
            value={pw}
            onChange={e => setPw(e.currentTarget.value)}
          />
          <Button type="submit" loading={authLoading} fullWidth>
            Login
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}