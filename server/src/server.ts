import http from "http";
import path from "path";
import fs from "fs";
import multiparty from "multiparty";

const port = 5000;
const galleryPath = path.join(process.cwd(), "data.json");
const uploadPath  = path.join(process.cwd(), "uploads");

const myServer = http.createServer((req, res) => {
  
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT , OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === "GET") {
    if (req.url === "/") {
      fs.readFile(galleryPath, (err, data) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Error occurred");
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(data);
      });
      return;
    } else if (req.url?.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, decodeURIComponent(req.url));

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Image not found");
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: { [key: string]: string } = {
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".webp": "image/webp",
          ".gif": "image/gif",
          ".svg": "image/svg+xml",
        };

        const contentType = mimeTypes[ext] || "application/octet-stream";

        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
      });
      return;
    }
  }
  if (req.url === "/api/submit" && req.method === "POST") {
    const form = new multiparty.Form({ uploadDir: uploadPath });

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Error parsing form");
        return;
      }

      const id = fields.id?.[0];
      const title = fields.title?.[0];
      const description = fields.description?.[0];
      const imageFile = files.image?.[0];
      const tags = fields.tags?.[0] ? JSON.parse(fields.tags[0]) : [];

      if (!title || !description) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Title and description are required");
        return;
      }

      let imagePath = "";
      if (imageFile) {
        const fileName = path.basename(imageFile.path);
        imagePath = `/uploads/${fileName}`;
      }

      const newEntry = {
        id,
        title,
        description,
        image: `http://localhost:${port}${imagePath}`,
        tags,
      };

      fs.readFile(galleryPath, "utf8", (err, data) => {
        let entries = [];

        if (!err && data) {
          try {
            entries = JSON.parse(data);
          } catch (parseErr) {
            console.error("Failed to parse JSON:", parseErr);
          }
        }

        entries.push(newEntry);

        fs.writeFile(
          galleryPath,
          JSON.stringify(entries, null, 2),
          (writeErr) => {
            if (writeErr) {
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Failed to save data");
            } else {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ message: "Data saved successfully" }));
            }
          }
        );
      });
    });

    return;
  }
 if (req.url?.startsWith("/api/entry/") && req.method === "DELETE") {
  const id = req.url.split("/").pop(); 

  fs.readFile(galleryPath, "utf8", (err, data) => {
    if (err) {
      res.writeHead(500).end("Error reading gallery data");
      return;
    }

    let entries;
    try {
      entries = JSON.parse(data);
    } catch (e) {
      entries = [];
    }

    const entry = entries.find((item: any) => item.id === id);
    if (!entry) {
      res.writeHead(404).end("Entry not found");
      return;
    }

    const imagePath = entry.image.replace(`http://localhost:${port}`, "");
    const fullImagePath = path.join(__dirname, imagePath);
    fs.unlink(fullImagePath, () => {});

    const newEntries = entries.filter((item: any) => item.id !== id);
    fs.writeFile(galleryPath, JSON.stringify(newEntries, null, 2), (err) => {
      if (err) {
        res.writeHead(500).end("Failed to write JSON");
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Deleted" }));
      }
    });
  });
  return;
  }
  if (req.url?.startsWith("/api/edit/") && req.method === "PUT") {
  const id = req.url.split("/").pop();                // /api/edit/:id
  const form = new multiparty.Form({ uploadDir: uploadPath });

  form.parse(req, (err, fields, files) => {
    if (err) {
      res.writeHead(400).end("Error parsing form");
      return;
    }

    const title = fields.title?.[0] || "";
    const description = fields.description?.[0] || "";
    const tags = fields.tags?.[0] ? JSON.parse(fields.tags[0]) : [];
    const imageFile = files.image?.[0];

    if (!title.trim() || !description.trim()) {
      res.writeHead(400).end("Title and description required");
      return;
    }

    fs.readFile(galleryPath, "utf8", (readErr, data) => {
      if (readErr) {
        res.writeHead(500).end("Error loading gallery");
        return;
      }

      const items = JSON.parse(data || "[]");
      const idx = items.findIndex((img: any) => img.id === id);

      if (idx === -1) {
        res.writeHead(404).end("Entry not found");
        return;
      }

      items[idx].title = title;
      items[idx].description = description;
      items[idx].tags = tags;

      if (imageFile && imageFile.originalFilename) {
        // delete old file if it exists
        const oldPath = items[idx].image?.replace(`http://localhost:${port}`, "");
        if (oldPath) fs.unlink(path.join(__dirname, oldPath), () => {});

        const fileName = path.basename(imageFile.path);
        items[idx].image = `http://localhost:${port}/uploads/${fileName}`;
      }

      fs.writeFile(galleryPath, JSON.stringify(items, null, 2), (writeErr) => {
        if (writeErr) {
          res.writeHead(500).end("Failed to update entry");
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(items[idx])); // send updated object back
        }
      });
    });
  });
  return;
}



  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Page not Found");
});

myServer.listen(port, () => {
  console.log(` Server running at http://localhost:${port}`);
});

myServer.on("error", (err) => {
  console.log(" Error occurred:", err);
});
