
# 🎥 Video Streaming App with Comments

Sebuah aplikasi **video streaming** berbasis **Express.js, WebSockets, dan SQLite** dengan fitur **upload video, streaming, serta komentar real-time**.

## 🚀 Fitur
- **Upload & Streaming Video**  
- **Simpan & Tampilkan Komentar untuk Video**  
- **API dengan Drizzle ORM & SQLite**  
- **Frontend menggunakan React & Tanstack Query**

---

## 🛠️ Cara Menjalankan Proyek

### **1. Clone Repository**
```sh
git clone https://github.com/username/video-streaming-app.git
cd video-streaming-app
```

### **2. Instal Dependensi**
```sh
npm install
```

### **3. Konfigurasi **

```sh
npm run build
```

### **4. Jalankan Server**
```sh
npm start
```
mode developer
```
npm run dev
```
Server akan berjalan di `http://localhost:5000/`

---

## 📡 **API Endpoint**
### **1. 🎬 Video**
#### 🔹 **GET /api/videos**
📌 **Ambil semua video yang tersedia**  
##### ✅ **Response:**
```json
[
  { "id": 1, "title": "Video 1", "description": "Deskripsi video", "filename": "file.mp4", "mimeType": "video/mp4", "views": 100, "uploadedAt": "2025-02-08T07:34:26.680Z" }
]
```

#### 🔹 **GET /api/videos/:id**
📌 **Ambil detail video berdasarkan ID**
##### ✅ **Response:**
```json
{
  "id": 1,
  "title": "Video 1",
  "description": "Deskripsi video",
  "filename": "file.mp4",
  "mimeType": "video/mp4",
  "views": 101,
  "uploadedAt": "2025-02-08T07:34:26.680Z"
}
```

#### 🔹 **POST /api/videos**
📌 **Upload video baru**  
##### ✅ **Request Body (Form-Data):**
- `title`: **string** (Wajib)
- `description`: **string** (Opsional)
- `video`: **file** (MP4/WebM/Ogg, max 100MB)

##### ✅ **Response:**
```json
{
  "id": 2,
  "title": "My Video",
  "description": "Video keren",
  "filename": "video123.mp4",
  "mimeType": "video/mp4",
  "uploadedAt": "2025-02-08T07:34:26.680Z"
}
```

---

### **2. 💬 Komentar**
#### 🔹 **GET /api/videos/:id/comments**
📌 **Ambil semua komentar untuk video tertentu**
##### ✅ **Response:**
```json
[
  { "id": 1, "videoId": 2, "content": "Komentar pertama!", "createdAt": "2025-02-08T07:34:26.680Z" }
]
```

#### 🔹 **POST /api/videos/:id/comments**
📌 **Tambahkan komentar ke video tertentu**
##### ✅ **Request Body:**
```json
{
  "content": "Komentar baru",
  "videoId": 2
}
```
##### ✅ **Response:**
```json
{
  "id": 2,
  "videoId": 2,
  "content": "Komentar baru",
  "createdAt": "2025-02-08T07:34:26.680Z"
}
```


## 👨‍💻 **Kontributor**
- **Nama Anda** - Backend & API
- **Nama Lain (Opsional)** - Frontend

Jika ingin berkontribusi, silakan buat **Pull Request** atau diskusi di **Issues**.

---

## 📝 **Lisensi**
Proyek ini menggunakan lisensi **MIT**.

---
