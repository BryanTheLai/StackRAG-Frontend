import { Link } from "wouter";

export default function Home() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">AI CFO Assistant</h1>
          <p className="py-6">
            Your intelligent partner for financial insights and management.
          </p>
          <Link href="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
