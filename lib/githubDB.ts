const GITHUB_API = "https://api.github.com";
const REPO = "fahrihosting3/database-user";
const TOKEN = "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";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const headers = {
  Authorization: `token ${TOKEN}`,        // atau `Bearer ${TOKEN}` — coba keduanya
  Accept: "application/vnd.github+json",             // tambahkan ini, GitHub suka
};

// Contoh getFile yang lebih baik
export async function getFile(path: string) {
  const url = `${GITHUB_API}/repos/${REPO}/contents/${path}?ref=${BRANCH}`;
  
  const res = await fetch(url, { 
    headers,
    cache: "no-store"   // kalau perlu fresh data
  });

  if (res.status === 401) {
    console.error("401 Bad credentials - token mungkin invalid atau di-block");
    throw new Error("GitHub authentication failed (401)");
  }

  if (res.status === 404) return null;
  
  if (!res.ok) {
    const text = await res.text();
    console.error(`GitHub error ${res.status}:`, text);
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data = await res.json();
  return {
    content: JSON.parse(Buffer.from(data.content, "base64").toString("utf-8")),
    sha: data.sha,
  };
}


// Tulis/update file
export async function writeFile(path: string, data: object, sha?: string) {
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `update: ${path}`,
      content,
      branch: BRANCH,
      ...(sha && { sha }), // sha wajib kalau update file existing
    }),
  });
  
  const text = await res.text();
  if (!text) {
    throw new Error("GitHub API returned empty response");
  }
  
  if (!res.ok) {
    console.error(`GitHub API write error (${res.status}): ${text}`);
    throw new Error(`GitHub API write error: ${res.status}`);
  }
  
  return JSON.parse(text);
}
