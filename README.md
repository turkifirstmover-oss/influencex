# InfluenceX 🚀
## دليل الرفع على Netlify + Supabase

---

## 1️⃣ إعداد Supabase

1. اذهب إلى [supabase.com](https://supabase.com) → New Project
2. سمّ المشروع `influencex`، اختر Region: **Middle East (Bahrain)**
3. بعد الإنشاء → **SQL Editor** → انسخ محتوى `supabase/migrations/001_initial.sql` والصقه واضغط **Run**
4. من **Settings → API** انسخ:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2️⃣ رفع الكود على GitHub

```bash
git init
git add .
git commit -m "Initial commit - InfluenceX"
git remote add origin https://github.com/YOUR_USERNAME/influencex.git
git push -u origin main
```

---

## 3️⃣ ربط Netlify

1. اذهب إلى [netlify.com](https://netlify.com) → **Add new site → Import from GitHub**
2. اختر الـ repo
3. إعدادات البناء (تتملأ تلقائياً من `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
4. **Site configuration → Environment variables** → أضف:

```
NEXT_PUBLIC_SUPABASE_URL       = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJ...
SUPABASE_SERVICE_ROLE_KEY      = eyJ...
NEXT_PUBLIC_APP_URL            = https://your-site.netlify.app
```

5. اضغط **Deploy site** ✅

---

## 4️⃣ ربط دومين مخصص (اختياري)

1. من Netlify → **Domain management → Add domain**
2. أضف الدومين (مثال: `influencex.sa`)
3. عدّل DNS عند المزود:
   - `CNAME www → your-site.netlify.app`
   - `A @ → 75.2.60.5`
4. Netlify يفعّل SSL تلقائياً 🔒

---

## 5️⃣ تشغيل محلي

```bash
cp .env.example .env.local
# عدّل المتغيرات في .env.local

npm install
npm run dev
# الموقع على: http://localhost:3000
```

---

## هيكل الصفحات

| الصفحة | الرابط |
|--------|--------|
| الرئيسية | `/ar` |
| تفاصيل مؤثر | `/ar/influencer/[slug]` |
| لوحة الإدارة | `/ar/admin` |
| قائمة مشاركة عميل | `/ar/share/[token]` |
| الإنجليزية | `/en` |

## API Endpoints

| Method | Route | الوظيفة |
|--------|-------|---------|
| GET | `/api/influencers` | جلب المؤثرين مع فلاتر |
| POST | `/api/influencers` | إضافة مؤثر |
| GET | `/api/influencers/[id]` | تفاصيل مؤثر |
| PUT | `/api/influencers/[id]` | تعديل |
| DELETE | `/api/influencers/[id]` | حذف ناعم |
| POST | `/api/share` | إنشاء قائمة مشاركة |
| GET | `/api/share?token=` | جلب قائمة |
| POST | `/api/upload` | رفع صورة/فيديو |
| POST | `/api/import` | استيراد CSV |
