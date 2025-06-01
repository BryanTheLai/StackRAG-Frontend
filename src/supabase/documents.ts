export interface Doc {
  id: string;
  filename: string;
  user_id: string;
}

export async function fetchDocuments(accessToken: string): Promise<Doc[]> {
  const res = await fetch("http://127.0.0.1:8000/documents", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}