"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multiparty_1 = __importDefault(require("multiparty"));
const port = 5000;
const galleryPath = path_1.default.join(process.cwd(), "data.json");
const uploadPath = path_1.default.join(process.cwd(), "uploads");
const myServer = http_1.default.createServer((req, res) => {
    var _a, _b, _c;
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
            fs_1.default.readFile(galleryPath, (err, data) => {
                if (err) {
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.end("Error occurred");
                    return;
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(data);
            });
            return;
        }
        else if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith("/uploads/")) {
            const filePath = path_1.default.join(__dirname, decodeURIComponent(req.url));
            fs_1.default.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.end("Image not found");
                    return;
                }
                const ext = path_1.default.extname(filePath).toLowerCase();
                const mimeTypes = {
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
        const form = new multiparty_1.default.Form({ uploadDir: uploadPath });
        form.parse(req, (err, fields, files) => {
            var _a, _b, _c, _d, _e;
            if (err) {
                res.writeHead(400, { "Content-Type": "text/plain" });
                res.end("Error parsing form");
                return;
            }
            const id = (_a = fields.id) === null || _a === void 0 ? void 0 : _a[0];
            const title = (_b = fields.title) === null || _b === void 0 ? void 0 : _b[0];
            const description = (_c = fields.description) === null || _c === void 0 ? void 0 : _c[0];
            const imageFile = (_d = files.image) === null || _d === void 0 ? void 0 : _d[0];
            const tags = ((_e = fields.tags) === null || _e === void 0 ? void 0 : _e[0]) ? JSON.parse(fields.tags[0]) : [];
            if (!title || !description) {
                res.writeHead(400, { "Content-Type": "text/plain" });
                res.end("Title and description are required");
                return;
            }
            let imagePath = "";
            if (imageFile) {
                const fileName = path_1.default.basename(imageFile.path);
                imagePath = `/uploads/${fileName}`;
            }
            const newEntry = {
                id,
                title,
                description,
                image: `http://localhost:${port}${imagePath}`,
                tags,
            };
            fs_1.default.readFile(galleryPath, "utf8", (err, data) => {
                let entries = [];
                if (!err && data) {
                    try {
                        entries = JSON.parse(data);
                    }
                    catch (parseErr) {
                        console.error("Failed to parse JSON:", parseErr);
                    }
                }
                entries.push(newEntry);
                fs_1.default.writeFile(galleryPath, JSON.stringify(entries, null, 2), (writeErr) => {
                    if (writeErr) {
                        res.writeHead(500, { "Content-Type": "text/plain" });
                        res.end("Failed to save data");
                    }
                    else {
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ message: "Data saved successfully" }));
                    }
                });
            });
        });
        return;
    }
    if (((_b = req.url) === null || _b === void 0 ? void 0 : _b.startsWith("/api/entry/")) && req.method === "DELETE") {
        const id = req.url.split("/").pop();
        fs_1.default.readFile(galleryPath, "utf8", (err, data) => {
            if (err) {
                res.writeHead(500).end("Error reading gallery data");
                return;
            }
            let entries;
            try {
                entries = JSON.parse(data);
            }
            catch (e) {
                entries = [];
            }
            const entry = entries.find((item) => item.id === id);
            if (!entry) {
                res.writeHead(404).end("Entry not found");
                return;
            }
            const imagePath = entry.image.replace(`http://localhost:${port}`, "");
            const fullImagePath = path_1.default.join(__dirname, imagePath);
            fs_1.default.unlink(fullImagePath, () => { });
            const newEntries = entries.filter((item) => item.id !== id);
            fs_1.default.writeFile(galleryPath, JSON.stringify(newEntries, null, 2), (err) => {
                if (err) {
                    res.writeHead(500).end("Failed to write JSON");
                }
                else {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Deleted" }));
                }
            });
        });
        return;
    }
    if (((_c = req.url) === null || _c === void 0 ? void 0 : _c.startsWith("/api/edit/")) && req.method === "PUT") {
        const id = req.url.split("/").pop(); // /api/edit/:id
        const form = new multiparty_1.default.Form({ uploadDir: uploadPath });
        form.parse(req, (err, fields, files) => {
            var _a, _b, _c, _d;
            if (err) {
                res.writeHead(400).end("Error parsing form");
                return;
            }
            const title = ((_a = fields.title) === null || _a === void 0 ? void 0 : _a[0]) || "";
            const description = ((_b = fields.description) === null || _b === void 0 ? void 0 : _b[0]) || "";
            const tags = ((_c = fields.tags) === null || _c === void 0 ? void 0 : _c[0]) ? JSON.parse(fields.tags[0]) : [];
            const imageFile = (_d = files.image) === null || _d === void 0 ? void 0 : _d[0];
            if (!title.trim() || !description.trim()) {
                res.writeHead(400).end("Title and description required");
                return;
            }
            fs_1.default.readFile(galleryPath, "utf8", (readErr, data) => {
                var _a;
                if (readErr) {
                    res.writeHead(500).end("Error loading gallery");
                    return;
                }
                const items = JSON.parse(data || "[]");
                const idx = items.findIndex((img) => img.id === id);
                if (idx === -1) {
                    res.writeHead(404).end("Entry not found");
                    return;
                }
                items[idx].title = title;
                items[idx].description = description;
                items[idx].tags = tags;
                if (imageFile && imageFile.originalFilename) {
                    // delete old file if it exists
                    const oldPath = (_a = items[idx].image) === null || _a === void 0 ? void 0 : _a.replace(`http://localhost:${port}`, "");
                    if (oldPath)
                        fs_1.default.unlink(path_1.default.join(__dirname, oldPath), () => { });
                    const fileName = path_1.default.basename(imageFile.path);
                    items[idx].image = `http://localhost:${port}/uploads/${fileName}`;
                }
                fs_1.default.writeFile(galleryPath, JSON.stringify(items, null, 2), (writeErr) => {
                    if (writeErr) {
                        res.writeHead(500).end("Failed to update entry");
                    }
                    else {
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
