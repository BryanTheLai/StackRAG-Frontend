import { useParams } from "wouter";
import Sidebar from "@/components/Sidebar";
import { AlertTriangle } from "lucide-react";

export default function Profile() {
  const params = useParams();
  const profileId = params.id;

  return (
    <div className="flex h-screen bg-base-200">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Profile Page</h2>
            {profileId ? (
              <p className="text-base-content">
                Displaying Profile for Profile ID:{" "}
                <strong className="font-semibold text-primary">
                  {profileId}
                </strong>
              </p>
            ) : (
              <div role="alert" className="alert alert-warning">
                <AlertTriangle className="stroke-current shrink-0 h-6 w-6" />
                <span>Profile ID not found in URL.</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
