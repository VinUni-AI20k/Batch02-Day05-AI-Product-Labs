const API = '/api/drugs';

export async function fetchHealth() {
  const res = await fetch(`${API}/health`);
  if (!res.ok) throw new Error('API không phản hồi');
  return res.json();
}

export async function fetchSuggestions(query) {
  const res = await fetch(`${API}/suggest?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gợi ý thất bại');
  }
  return res.json();
}

export async function lookupDrug({ condition, drugQuery, age, gender, userName, drugId }) {
  const res = await fetch(`${API}/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ condition, drugQuery, age, gender, userName, drugId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Tra cứu thất bại');
  return data;
}
