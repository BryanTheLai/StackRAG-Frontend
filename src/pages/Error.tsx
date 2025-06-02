import { AlertCircle } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <AlertCircle className="h-16 w-16 text-error" />
          <h1 className="card-title text-3xl font-bold text-error mt-4">
            {title}
          </h1>
          <p className="py-4 text-base-content">{message}</p>{" "}
          {showGoHomeLink && (
            <div className="card-actions justify-center">
              <button
                onClick={() => window.history.back()}
                className="btn btn-primary"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
