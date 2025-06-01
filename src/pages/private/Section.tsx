import { useParams } from "wouter";
import Sidebar from "@/components/Sidebar";
import { AlertTriangle } from "lucide-react";

export default function Section() {
  const params = useParams();
  const sectionId = params.id;

  return (
    <div className="flex h-screen bg-base-200">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Section Page</h2>
            {sectionId ? (
              <p className="text-base-content">
                Displaying Section for Section ID:{" "}
                <strong className="font-semibold text-secondary">
                  {sectionId}
                </strong>
              </p>
            ) : (
              <div role="alert" className="alert alert-warning">
                <AlertTriangle className="stroke-current shrink-0 h-6 w-6" />
                <span>Section ID not found in URL.</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
