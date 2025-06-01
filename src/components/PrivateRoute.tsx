import { type ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect, useLocation } from "wouter";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { session, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !session) {
      navigate("/", { replace: true });
    }
  }, [isLoading, session, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh] text-[32px]">
        <span role="status" aria-label="Loading">
          ⏳
        </span>
      </div>
    );
  }

  if (!session) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
