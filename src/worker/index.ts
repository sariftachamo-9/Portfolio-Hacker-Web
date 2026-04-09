import { Hono } from "hono";
import { cors } from "hono/cors";

type Env = {
  Bindings: {
    DB: D1Database;
    R2?: R2Bucket;
    ASSETS: { fetch: typeof fetch };
    JWT_SECRET: string;
  };
};

const app = new Hono<Env>();

// --- SECURITY MIDDLEWARE ---
app.use("/api/*", cors());

// CSRF Protection — require X-Security-Signal header on mutations
app.use("/api/*", async (c, next) => {
  const protectedMethods = ["POST", "PUT", "DELETE"];
  if (
    protectedMethods.includes(c.req.method) &&
    !c.req.header("x-security-signal")
  ) {
    console.warn(
      `[SECURITY_SIGNAL_MISSING] IP: ${c.req.header("cf-connecting-ip")} tried ${c.req.method} on ${c.req.path}`
    );
    return c.json(
      { error: "SECURITY_SIGNAL_REQUIRED: Breach protection active." },
      403
    );
  }
  await next();
});

// Auth middleware — verify JWT from Authorization header
const authenticate = async (c: any, next: () => Promise<void>) => {
  const authHeader = c.req.header("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const payload = await verifyJwt(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: "Invalid or expired token" }, 403);
  }

  c.set("user", payload);
  await next();
};

// Apply auth to protected mutation routes
app.use("/api/projects/* POST", authenticate);
app.use("/api/projects/* PUT", authenticate);
app.use("/api/projects/* DELETE", authenticate);
app.use("/api/skills/* POST", authenticate);
app.use("/api/skills/* PUT", authenticate);
app.use("/api/skills/* DELETE", authenticate);
app.use("/api/experience/* POST", authenticate);
app.use("/api/experience/* PUT", authenticate);
app.use("/api/experience/* DELETE", authenticate);
app.use("/api/education/* POST", authenticate);
app.use("/api/education/* PUT", authenticate);
app.use("/api/education/* DELETE", authenticate);
app.use("/api/certifications/* POST", authenticate);
app.use("/api/certifications/* PUT", authenticate);
app.use("/api/certifications/* DELETE", authenticate);
app.use("/api/posts/* POST", authenticate);
app.use("/api/posts/* PUT", authenticate);
app.use("/api/posts/* DELETE", authenticate);
app.use("/api/messages GET", authenticate);

// --- HONEY-POT ---
app.post("/admin-login", async (c) => {
  console.error(
    `[BREACH_ATTACK_DETECTED] Honey-pot triggered! IP: ${c.req.header("cf-connecting-ip")}`
  );
  await new Promise((r) => setTimeout(r, 2000));
  return c.json({ error: "SYSTEM_LOCKDOWN: Unauthorized access logged." }, 401);
});

// --- AUTH ROUTES ---
app.post("/api/auth/login", async (c) => {
  const { username, password } = await c.req.json();

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE username = ?"
  )
    .bind(username)
    .first();

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const passwordMatch = await verifyPassword(
    password,
    user.password_hash as string
  );
  if (!passwordMatch) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await signJwt(
    { id: user.id, username: user.username },
    c.env.JWT_SECRET
  );
  return c.json({ token, username: user.username });
});

// --- PROJECTS ---
app.get("/api/projects", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM projects ORDER BY created_at DESC"
  ).all();
  return c.json(results);
});

app.post("/api/projects", async (c) => {
  const formData = await c.req.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const technologies = formData.get("technologies") as string;
  const github_link = formData.get("github_link") as string;
  const live_link = formData.get("live_link") as string;
  const imageFile = formData.get("image") as File | null;

  let imagePath: string | null = null;
  if (imageFile && imageFile.size > 0 && c.env.R2) {
    const key = `uploads/${Date.now()}-${imageFile.name}`;
    await c.env.R2.put(key, imageFile.stream());
    imagePath = `/${key}`;
  } else if (imageFile && imageFile.size > 0 && !c.env.R2) {
    console.warn("R2_NOT_CONFIGURED: Skipping image upload.");
  }

  const result = await c.env.DB.prepare(
    "INSERT INTO projects (title, description, technologies, github_link, live_link, image) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(title, description, technologies, github_link, live_link, imagePath)
    .run();

  return c.json({ id: result.meta.last_row_id });
});

app.put("/api/projects/:id", async (c) => {
  const { id } = c.req.param();
  const formData = await c.req.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const technologies = formData.get("technologies") as string;
  const github_link = formData.get("github_link") as string;
  const live_link = formData.get("live_link") as string;
  const is_visible = formData.get("is_visible") as string;
  const imageFile = formData.get("image") as File | null;

  let imagePath: string | null = null;
  if (imageFile && imageFile.size > 0 && c.env.R2) {
    const key = `uploads/${Date.now()}-${imageFile.name}`;
    await c.env.R2.put(key, imageFile.stream());
    imagePath = `/${key}`;
  } else if (imageFile && imageFile.size > 0 && !c.env.R2) {
    console.warn("R2_NOT_CONFIGURED: Skipping image upload.");
  }

  if (imagePath) {
    await c.env.DB.prepare(
      "UPDATE projects SET title = ?, description = ?, technologies = ?, github_link = ?, live_link = ?, is_visible = ?, image = ? WHERE id = ?"
    )
      .bind(title, description, technologies, github_link, live_link, is_visible, imagePath, id)
      .run();
  } else {
    await c.env.DB.prepare(
      "UPDATE projects SET title = ?, description = ?, technologies = ?, github_link = ?, live_link = ?, is_visible = ? WHERE id = ?"
    )
      .bind(title, description, technologies, github_link, live_link, is_visible, id)
      .run();
  }

  return c.json({ success: true });
});

app.delete("/api/projects/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM projects WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return c.json({ success: true });
});

// --- SKILLS ---
app.get("/api/skills", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM skills").all();
  return c.json(results);
});

app.post("/api/skills", async (c) => {
  const { category, name, proficiency_level } = await c.req.json();
  const result = await c.env.DB.prepare(
    "INSERT INTO skills (category, name, proficiency_level) VALUES (?, ?, ?)"
  )
    .bind(category, name, proficiency_level)
    .run();
  return c.json({ id: result.meta.last_row_id });
});

app.put("/api/skills/:id", async (c) => {
  const { category, name, proficiency_level } = await c.req.json();
  await c.env.DB.prepare(
    "UPDATE skills SET category = ?, name = ?, proficiency_level = ? WHERE id = ?"
  )
    .bind(category, name, proficiency_level, c.req.param("id"))
    .run();
  return c.json({ success: true });
});

app.delete("/api/skills/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM skills WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return c.json({ success: true });
});

// --- EXPERIENCE ---
app.get("/api/experience", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM experience").all();
  return c.json(results);
});

app.post("/api/experience", async (c) => {
  const { role, organization, duration, description } = await c.req.json();
  const result = await c.env.DB.prepare(
    "INSERT INTO experience (role, organization, duration, description) VALUES (?, ?, ?, ?)"
  )
    .bind(role, organization, duration, description)
    .run();
  return c.json({ id: result.meta.last_row_id });
});

app.put("/api/experience/:id", async (c) => {
  const { role, organization, duration, description } = await c.req.json();
  await c.env.DB.prepare(
    "UPDATE experience SET role = ?, organization = ?, duration = ?, description = ? WHERE id = ?"
  )
    .bind(role, organization, duration, description, c.req.param("id"))
    .run();
  return c.json({ success: true });
});

app.delete("/api/experience/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM experience WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return c.json({ success: true });
});

// --- EDUCATION ---
app.get("/api/education", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM education").all();
  return c.json(results);
});

app.post("/api/education", async (c) => {
  const { degree, institution, duration, focus } = await c.req.json();
  const result = await c.env.DB.prepare(
    "INSERT INTO education (degree, institution, duration, focus) VALUES (?, ?, ?, ?)"
  )
    .bind(degree, institution, duration, focus)
    .run();
  return c.json({ id: result.meta.last_row_id });
});

app.put("/api/education/:id", async (c) => {
  const { degree, institution, duration, focus } = await c.req.json();
  await c.env.DB.prepare(
    "UPDATE education SET degree = ?, institution = ?, duration = ?, focus = ? WHERE id = ?"
  )
    .bind(degree, institution, duration, focus, c.req.param("id"))
    .run();
  return c.json({ success: true });
});

app.delete("/api/education/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM education WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return c.json({ success: true });
});

// --- CERTIFICATIONS ---
app.get("/api/certifications", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM certifications").all();
  return c.json(results);
});

app.post("/api/certifications", async (c) => {
  const { title, issuer, year, credential_link } = await c.req.json();
  const result = await c.env.DB.prepare(
    "INSERT INTO certifications (title, issuer, year, credential_link) VALUES (?, ?, ?, ?)"
  )
    .bind(title, issuer, year, credential_link)
    .run();
  return c.json({ id: result.meta.last_row_id });
});

app.put("/api/certifications/:id", async (c) => {
  const { title, issuer, year, credential_link } = await c.req.json();
  await c.env.DB.prepare(
    "UPDATE certifications SET title = ?, issuer = ?, year = ?, credential_link = ? WHERE id = ?"
  )
    .bind(title, issuer, year, credential_link, c.req.param("id"))
    .run();
  return c.json({ success: true });
});

app.delete("/api/certifications/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM certifications WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return c.json({ success: true });
});

// --- BLOG POSTS ---
app.get("/api/posts", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM posts ORDER BY created_at DESC"
  ).all();
  return c.json(results);
});

app.post("/api/posts", async (c) => {
  const formData = await c.req.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const category = formData.get("category") as string;
  const imageFile = formData.get("image") as File | null;

  let imagePath: string | null = null;
  if (imageFile && imageFile.size > 0 && c.env.R2) {
    const key = `uploads/${Date.now()}-${imageFile.name}`;
    await c.env.R2.put(key, imageFile.stream());
    imagePath = `/${key}`;
  } else if (imageFile && imageFile.size > 0 && !c.env.R2) {
    console.warn("R2_NOT_CONFIGURED: Skipping image upload.");
  }

  const result = await c.env.DB.prepare(
    "INSERT INTO posts (title, content, excerpt, category, image) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(title, content, excerpt, category, imagePath)
    .run();

  return c.json({ id: result.meta.last_row_id });
});

app.put("/api/posts/:id", async (c) => {
  const { id } = c.req.param();
  const formData = await c.req.formData();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const category = formData.get("category") as string;
  const is_visible = formData.get("is_visible") as string;
  const imageFile = formData.get("image") as File | null;

  let imagePath: string | null = null;
  if (imageFile && imageFile.size > 0 && c.env.R2) {
    const key = `uploads/${Date.now()}-${imageFile.name}`;
    await c.env.R2.put(key, imageFile.stream());
    imagePath = `/${key}`;
  } else if (imageFile && imageFile.size > 0 && !c.env.R2) {
    console.warn("R2_NOT_CONFIGURED: Skipping image upload.");
  }

  if (imagePath) {
    await c.env.DB.prepare(
      "UPDATE posts SET title = ?, content = ?, excerpt = ?, category = ?, is_visible = ?, image = ? WHERE id = ?"
    )
      .bind(title, content, excerpt, category, is_visible, imagePath, id)
      .run();
  } else {
    await c.env.DB.prepare(
      "UPDATE posts SET title = ?, content = ?, excerpt = ?, category = ?, is_visible = ? WHERE id = ?"
    )
      .bind(title, content, excerpt, category, is_visible, id)
      .run();
  }

  return c.json({ success: true });
});

app.delete("/api/posts/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM posts WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return c.json({ success: true });
});

// --- CONTACT MESSAGES ---
app.post("/api/contact", async (c) => {
  const { name, email, subject, message } = await c.req.json();
  await c.env.DB.prepare(
    "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)"
  )
    .bind(name, email, subject, message)
    .run();
  return c.json({ success: true });
});

app.get("/api/messages", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM contact_messages ORDER BY timestamp DESC"
  ).all();
  return c.json(results);
});

// --- UPLOAD PROXY (serve R2 files) ---
app.get("/uploads/:key", async (c) => {
  if (!c.env.R2) {
    return c.json({ error: "R2_NOT_CONFIGURED" }, 503);
  }
  const key = `uploads/${c.req.param("key")}`;
  const object = await c.env.R2.get(key);
  if (!object) {
    return c.json({ error: "File not found" }, 404);
  }
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  return new Response(object.body, { headers });
});

// --- JWT HELPERS (Web Crypto based, Workers-compatible) ---
async function signJwt(
  payload: Record<string, unknown>,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + 86400 };

  const headerB64 = btoa(JSON.stringify(header))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(fullPayload))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = await crypto.subtle.sign("HMAC", key, data);
  const signatureB64 = btoa(
    String.fromCharCode(...new Uint8Array(signature))
  )
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

async function verifyJwt(
  token: string,
  secret: string
): Promise<Record<string, unknown> | null> {
  try {
    const encoder = new TextEncoder();
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = encoder.encode(`${parts[0]}.${parts[1]}`);
    const signature = Uint8Array.from(
      atob(parts[2].replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify("HMAC", key, signature, data);
    if (!valid) return null;

    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  if (!hash.startsWith("$2")) {
    return false;
  }
  const { compare } = await import("bcryptjs");
  return compare(password, hash);
}

// --- SPA FALLBACK ---
// Proxy all non-API requests to the Cloudflare Assets handler
app.get("*", async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
