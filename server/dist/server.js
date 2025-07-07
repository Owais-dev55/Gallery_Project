"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multiparty_1 = __importDefault(require("multiparty"));
// === Config ===
const port = process.env.PORT || 5000;
const galleryPath = path_1.default.join(process.cwd(), "data.json");
const uploadPath = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadPath))
    fs_1.default.mkdirSync(uploadPath);
if (!fs_1.default.existsSync(galleryPath))
    fs_1.default.writeFileSync(galleryPath, "[]", "utf8");
// === CORS Setup ===
const allowedOrigins = [
    "https://gallery-project-fullstack.vercel.app",
    "http://localhost:5173",
];
function setCorsHeaders(req, res) {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS");
    const requestedHeaders = req.headers["access-control-request-headers"];
    res.setHeader("Access-Control-Allow-Headers", requestedHeaders ? requestedHeaders : "Content-Type");
}
// === HTTP Server ===
const myServer = http_1.default.createServer((req, res) => {
    var _a, _b, _c;
    setCorsHeaders(req, res);
    if (req.method === "OPTIONS") {
        res.writeHead(204).end();
        return;
    }
    // === GET all entries ===
    if (req.method === "GET") {
        if (req.url === "/") {
            fs_1.default.readFile(galleryPath, (err, data) => {
                if (err)
                    return res.writeHead(500).end("Could not read data.json");
                res.writeHead(200, { "Content-Type": "application/json" }).end(data);
            });
            return;
        }
        if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith("/uploads/")) {
            const filePath = path_1.default.join(uploadPath, req.url.replace("/uploads/", ""));
            fs_1.default.readFile(filePath, (err, data) => {
                if (err)
                    return res.writeHead(404).end("Image not found");
                const ext = path_1.default.extname(filePath).toLowerCase();
                const mimeTypes = {
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
    // === POST /api/submit ===
    if (req.url === "/api/submit" && req.method === "POST") {
        const form = new multiparty_1.default.Form({ uploadDir: uploadPath });
        form.parse(req, (err, fields, files) => {
            var _a, _b, _c, _d, _e;
            if (err)
                return res.writeHead(400).end("Error parsing form");
            const id = (_a = fields.id) === null || _a === void 0 ? void 0 : _a[0];
            const title = (_b = fields.title) === null || _b === void 0 ? void 0 : _b[0];
            const description = (_c = fields.description) === null || _c === void 0 ? void 0 : _c[0];
            const tags = ((_d = fields.tags) === null || _d === void 0 ? void 0 : _d[0]) ? JSON.parse(fields.tags[0]) : [];
            const imageFile = (_e = files.image) === null || _e === void 0 ? void 0 : _e[0];
            if (!title || !description) {
                return res.writeHead(400).end("Title & description required");
            }
            const imgSegment = imageFile ? `/uploads/${path_1.default.basename(imageFile.path)}` : "";
            const newEntry = {
                id,
                title,
                description,
                image: `https://galleryproject-production.up.railway.app${imgSegment}`,
                tags,
            };
            fs_1.default.readFile(galleryPath, "utf8", (err, data) => {
                const entries = err ? [] : JSON.parse(data || "[]");
                entries.push(newEntry);
                fs_1.default.writeFile(galleryPath, JSON.stringify(entries, null, 2), writeErr => {
                    if (writeErr)
                        return res.writeHead(500).end("Failed to save");
                    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Saved" }));
                });
            });
        });
        return;
    }
    // === DELETE /api/entry/:id ===
    if (((_b = req.url) === null || _b === void 0 ? void 0 : _b.startsWith("/api/entry/")) && req.method === "DELETE") {
        const id = req.url.split("/").pop();
        fs_1.default.readFile(galleryPath, "utf8", (err, data) => {
            if (err)
                return res.writeHead(500).end("Read error");
            const entries = JSON.parse(data || "[]");
            const entry = entries.find((e) => e.id === id);
            if (!entry)
                return res.writeHead(404).end("Not found");
            if (entry.image) {
                const fileName = entry.image.split("/uploads/")[1] || "";
                const fullImage = path_1.default.join(uploadPath, fileName);
                fs_1.default.unlink(fullImage, () => { });
            }
            const updated = entries.filter((e) => e.id !== id);
            fs_1.default.writeFile(galleryPath, JSON.stringify(updated, null, 2), wErr => {
                if (wErr)
                    return res.writeHead(500).end("Write error");
                res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Deleted" }));
            });
        });
        return;
    }
    // === PUT /api/edit/:id ===
    if (((_c = req.url) === null || _c === void 0 ? void 0 : _c.startsWith("/api/edit/")) && req.method === "PUT") {
        const id = req.url.split("/").pop();
        const form = new multiparty_1.default.Form({ uploadDir: uploadPath });
        form.parse(req, (err, fields, files) => {
            var _a, _b, _c, _d;
            if (err)
                return res.writeHead(400).end("Parse error");
            const title = ((_a = fields.title) === null || _a === void 0 ? void 0 : _a[0]) || "";
            const description = ((_b = fields.description) === null || _b === void 0 ? void 0 : _b[0]) || "";
            const tags = ((_c = fields.tags) === null || _c === void 0 ? void 0 : _c[0]) ? JSON.parse(fields.tags[0]) : [];
            const imageFile = (_d = files.image) === null || _d === void 0 ? void 0 : _d[0];
            fs_1.default.readFile(galleryPath, "utf8", (rErr, data) => {
                if (rErr)
                    return res.writeHead(500).end("Read error");
                const items = JSON.parse(data || "[]");
                const idx = items.findIndex((e) => e.id === id);
                if (idx === -1)
                    return res.writeHead(404).end("Not found");
                items[idx] = Object.assign(Object.assign({}, items[idx]), { title, description, tags });
                if (imageFile && imageFile.originalFilename) {
                    const oldSegment = items[idx].image.split("/uploads/")[1];
                    if (oldSegment)
                        fs_1.default.unlink(path_1.default.join(uploadPath, oldSegment), () => { });
                    const newSegment = `/uploads/${path_1.default.basename(imageFile.path)}`;
                    items[idx].image = `https://galleryproject-production.up.railway.app${newSegment}`;
                }
                fs_1.default.writeFile(galleryPath, JSON.stringify(items, null, 2), wErr => {
                    if (wErr)
                        return res.writeHead(500).end("Write error");
                    res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(items[idx]));
                });
            });
        });
        return;
    }
    // === 404 Fallback ===
    res.writeHead(404).end("Page not Found");
});
// === Start Server ===
myServer.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
});
