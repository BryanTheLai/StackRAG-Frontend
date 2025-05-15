import { Paper, Title, Text } from "@mantine/core";
import { Link } from "wouter";

export default function Home() {
  return (
    <Paper shadow="xs" p="xl" style={{ maxWidth: 600, margin: "auto" }}>
      <Title order={2} ta="center" mb="md">
        AI CFO Assistant
      </Title>
      <Text ta="center">
        Welcome! Please <Link href="/login">Login</Link> to continue.
      </Text>
    </Paper>
  );
}