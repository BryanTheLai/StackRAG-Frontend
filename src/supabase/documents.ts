export interface Doc {
  id: string;
  filename: string;
  user_id: string;
}

export async function fetchDocuments(accessToken: string): Promise<Doc[]> {
  const res = await fetch("http://localhost:8000/documents", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}