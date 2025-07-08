import http from "http";
import path from "path";
import fs from "fs";
import multiparty from "multiparty";

const port = process.env.PORT || 5000;
const galleryPath = path.join(process.cwd(), "data.json");
const uploadPath = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
if (!fs.existsSync(galleryPath)) fs.writeFileSync(galleryPath, "[]", "utf8");

const allowedOrigins = [
  "https://gallery-project-fullstack.vercel.app",
  "http://localhost:5173",
];

function setCorsHeaders(req: http.IncomingMessage, res: http.ServerResponse) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");

  const requestedHeaders = req.headers["access-control-request-headers"];
  res.setHeader(
    "Access-Control-Allow-Headers",
    requestedHeaders ? requestedHeaders : "Content-Type"
  );
}

const myServer = http.createServer((req, res) => {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }

  if (req.method === "GET") {
    if (req.url === "/") {
      fs.readFile(galleryPath, (err, data) => {
        if (err) return res.writeHead(500).end("Could not read data.json");
        res.writeHead(200, { "Content-Type": "application/json" }).end(data);
      });
      return;
    }

    if (req.url?.startsWith("/uploads/")) {
      const filePath = path.join(uploadPath, req.url.replace("/uploads/", ""));
      fs.readFile(filePath, (err, data) => {
        if (err) return res.writeHead(404).end("Image not found");

        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".webp": "image/webp",
          ".gif": "image/gif",
          ".svg": "image/svg+xml",
        };

        res
          .writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" })
          .end(data);
      });
      return;
    }
  }

  if (req.url === "/api/submit" && req.method === "POST") {
    const form = new multiparty.Form({ uploadDir: uploadPath });

    form.parse(req, (err, fields, files) => {
      if (err) return res.writeHead(400).end("Error parsing form");

      const id = fields.id?.[0];
      const title = fields.title?.[0];
      const description = fields.description?.[0];
      const tags = fields.tags?.[0] ? JSON.parse(fields.tags[0]) : [];
      const imageFile = files.image?.[0];

      if (!title || !description) {
        return res.writeHead(400).end("Title & description required");
      }

      const imgSegment = imageFile ? `/uploads/${path.basename(imageFile.path)}` : "";
      const newEntry = {
        id,
        title,
        description,
        image: `https://galleryproject-production.up.railway.app${imgSegment}`,
        tags,
      };

      fs.readFile(galleryPath, "utf8", (err, data) => {
        const entries = err ? [] : JSON.parse(data || "[]");
        entries.push(newEntry);

        fs.writeFile(galleryPath, JSON.stringify(entries, null, 2), writeErr => {
          if (writeErr) return res.writeHead(500).end("Failed to save");
          res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Saved" }));
        });
      });
    });
    return;
  }

  if (req.url?.startsWith("/api/entry/") && req.method === "DELETE") {
    const id = req.url.split("/").pop();

    fs.readFile(galleryPath, "utf8", (err, data) => {
      if (err) return res.writeHead(500).end("Read error");

      const entries = JSON.parse(data || "[]");
      const entry = entries.find((e: any) => e.id === id);
      if (!entry) return res.writeHead(404).end("Not found");

      if (entry.image) {
        const fileName = entry.image.split("/uploads/")[1] || "";
        const fullImage = path.join(uploadPath, fileName);
        fs.unlink(fullImage, () => {});
      }

      const updated = entries.filter((e: any) => e.id !== id);
      fs.writeFile(galleryPath, JSON.stringify(updated, null, 2), wErr => {
        if (wErr) return res.writeHead(500).end("Write error");
        res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Deleted" }));
      });
    });
    return;
  }

  if (req.url?.startsWith("/api/edit/") && req.method === "PUT") {
    const id = req.url.split("/").pop();
    const form = new multiparty.Form({ uploadDir: uploadPath });

    form.parse(req, (err, fields, files) => {
      if (err) return res.writeHead(400).end("Parse error");

      const title = fields.title?.[0] || "";
      const description = fields.description?.[0] || "";
      const tags = fields.tags?.[0] ? JSON.parse(fields.tags[0]) : [];
      const imageFile = files.image?.[0];

      fs.readFile(galleryPath, "utf8", (rErr, data) => {
        if (rErr) return res.writeHead(500).end("Read error");

        const items = JSON.parse(data || "[]");
        const idx = items.findIndex((e: any) => e.id === id);
        if (idx === -1) return res.writeHead(404).end("Not found");

        items[idx] = { ...items[idx], title, description, tags };

        if (imageFile && imageFile.originalFilename) {
          const oldSegment = items[idx].image.split("/uploads/")[1];
          if (oldSegment) fs.unlink(path.join(uploadPath, oldSegment), () => {});
          const newSegment = `/uploads/${path.basename(imageFile.path)}`;
          items[idx].image = `https://galleryproject-production.up.railway.app${newSegment}`;
        }

        fs.writeFile(galleryPath, JSON.stringify(items, null, 2), wErr => {
          if (wErr) return res.writeHead(500).end("Write error");
          res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(items[idx]));
        });
      });
    });
    return;
  }

  res.writeHead(404).end("Page not Found");
});

myServer.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
