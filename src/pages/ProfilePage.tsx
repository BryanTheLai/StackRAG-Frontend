import { useParams } from "wouter";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id; 

  return (
    <div>
      <h2>User Profile Page</h2>
      {userId ? (
        <p>Displaying profile for User ID: <strong>{userId}</strong></p>
      ) : (
        <p>User ID not found in URL.</p>
      )}
      <p>This page demonstrates how wouter uses route parameters.</p>
    </div>
  );
}