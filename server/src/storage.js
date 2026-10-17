import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Strict whitelist of permitted file extensions
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.docx', '.xlsx']);

// Explicit blacklist of dangerous extensions
const DANGEROUS_EXTENSIONS = new Set([
  '.svg', '.html', '.htm', '.xhtml', '.xml',
  '.js', '.mjs', '.cjs', '.ts', '.jsx', '.tsx',
  '.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs',
  '.php', '.py', '.rb', '.pl', '.jsp', '.asp', '.aspx',
]);

// Strict whitelist of MIME types
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/ms-excel',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

// Multer disk storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Sanitize extension and base name, neutralize path traversal attempts
    const rawExt = path.extname(file.originalname).toLowerCase();
    const cleanExt = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : '.bin';
    const baseName = path
      .basename(file.originalname, rawExt)
      .replace(/[^a-zA-Z0-9_\u0400-\u04FF-]/g, '_')
      .slice(0, 50); // limit length to 50 chars
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${baseName}-${uniqueSuffix}${cleanExt}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
    files: 1, // Single file upload per request
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // 1. Check dangerous extensions
    if (DANGEROUS_EXTENSIONS.has(ext)) {
      return cb(new Error(`Загрузка файлов с расширением ${ext} строго запрещена политикой безопасности.`));
    }

    // 2. Strict whitelist verification
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error('Недопустимый формат файла. Разрешены только PDF, JPG, PNG, WEBP, DOCX, XLSX.'));
    }

    // 3. Strict MIME type verification (never allow generic image/* or image/svg+xml)
    if (!ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
      return cb(new Error(`Недопустимый MIME-тип: ${file.mimetype}`));
    }

    cb(null, true);
  },
});
