import { useParams } from "wouter";

export default function Section() {
  const params = useParams();
  const sectionId = params.id; 

  return (
    <div>
      <h2>Section Page</h2>
      {sectionId ? (
        <p>Displaying Section for Section ID: <strong>{sectionId}</strong></p>
      ) : (
        <p>Section ID not found in URL.</p>
      )}
      <p>This page demonstrates how wouter uses route parameters.</p>
    </div>
  );
}