/** Google Custom Search JSON API — fallback nếu không dùng Gemini grounding */

export function hasGoogleCse() {
  return Boolean(process.env.GOOGLE_API_KEY?.trim() && process.env.GOOGLE_CSE_ID?.trim());
}

export async function searchDrugInfo(query, condition) {
  const key = process.env.GOOGLE_API_KEY?.trim();
  const cx = process.env.GOOGLE_CSE_ID?.trim();
  if (!key || !cx) throw new Error('GOOGLE_API_KEY hoặc GOOGLE_CSE_ID chưa cấu hình');

  const q = encodeURIComponent(
    `${query} thuốc hoạt chất chỉ định chống chỉ định ${condition} site:vn OR site:nhathuoclongchau.com.vn OR "dược thư"`
  );
  const url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${q}&num=5&hl=vi`;

  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Google CSE lỗi');
  }

  return (data.items || []).map((item) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet,
  }));
}
