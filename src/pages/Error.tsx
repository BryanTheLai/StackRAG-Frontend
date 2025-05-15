import { Link } from "wouter";

interface ErrorPageProps {
  title?: string;
  message?: string;
  showGoHomeLink?: boolean;
}

export default function ErrorPage({
  title = "Oops! Something went wrong.",
  message = "We're sorry, but an unexpected error occurred.",
  showGoHomeLink = true,
}: ErrorPageProps) {
    
  return (
    <div>
      <h1>{title}</h1>
      <p>{message}</p>
      {showGoHomeLink && <Link href="/">Go to Homepage</Link>}
    </div>
  );
}
