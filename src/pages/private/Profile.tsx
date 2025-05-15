import { useParams } from "wouter";

export default function Profile() {
  const params = useParams();
  const profileId = params.id; 

  return (
    <div>
      <h2>Profile Page</h2>
      {profileId ? (
        <p>Displaying Profile for Profile ID: <strong>{profileId}</strong></p>
      ) : (
        <p>Profile ID not found in URL.</p>
      )}
      <p>This page demonstrates how wouter uses route parameters.</p>
    </div>
  );
}