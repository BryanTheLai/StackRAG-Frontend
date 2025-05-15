import { Link } from "wouter";

export default function Home() {
  return (
    <>
      <h1>AI CFO Assistant</h1>
      <p>
        Welcome! Please <Link href="/login">Login</Link> to continue.
      </p>
    </>
  );
}
