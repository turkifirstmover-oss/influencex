-- InfluenceX — Supabase Migration
-- شغّل هذا الملف في: Supabase Dashboard → SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ===== المؤثرون =====
CREATE TABLE IF NOT EXISTS influencers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT UNIQUE NOT NULL,
  full_name       TEXT NOT NULL,
  handle          TEXT,
  bio             TEXT,
  avatar_url      TEXT,
  cover_url       TEXT,
  country         TEXT NOT NULL DEFAULT 'SA',
  city            TEXT,
  gender          TEXT CHECK (gender IN ('male','female')),
  niche           TEXT[] DEFAULT '{}',
  languages       TEXT[] DEFAULT '{"ar"}',
  is_active       BOOLEAN DEFAULT true,
  is_verified     BOOLEAN DEFAULT false,
  is_featured     BOOLEAN DEFAULT false,
  profile_views   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ===== حسابات المنصات =====
CREATE TABLE IF NOT EXISTS social_accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id   UUID REFERENCES influencers(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL CHECK (platform IN ('instagram','tiktok','snapchat','youtube','twitter')),
  handle          TEXT NOT NULL,
  profile_url     TEXT,
  followers       INTEGER DEFAULT 0,
  avg_views       INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  reach_rate      DECIMAL(5,2) DEFAULT 0,
  ctr             DECIMAL(5,2) DEFAULT 0,
  is_primary      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ===== وسائط =====
CREATE TABLE IF NOT EXISTS media_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id   UUID REFERENCES influencers(id) ON DELETE CASCADE,
  type            TEXT CHECK (type IN ('image','video','reel')),
  url             TEXT NOT NULL,
  thumbnail_url   TEXT,
  caption         TEXT,
  campaign_name   TEXT,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ===== تعاونات الماضي =====
CREATE TABLE IF NOT EXISTS brand_collaborations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id   UUID REFERENCES influencers(id) ON DELETE CASCADE,
  brand_name      TEXT NOT NULL,
  brand_logo_url  TEXT,
  campaign_type   TEXT,
  year            INTEGER
);

-- ===== أنواع التعاون =====
CREATE TABLE IF NOT EXISTS collaboration_types (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id   UUID REFERENCES influencers(id) ON DELETE CASCADE,
  type_name_ar    TEXT NOT NULL,
  price_from      DECIMAL(10,2),
  price_to        DECIMAL(10,2),
  currency        TEXT DEFAULT 'SAR',
  is_public       BOOLEAN DEFAULT false
);

-- ===== قوائم العملاء =====
CREATE TABLE IF NOT EXISTS client_lists (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token           TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  name            TEXT NOT NULL,
  description     TEXT,
  password_hash   TEXT,
  is_active       BOOLEAN DEFAULT true,
  expires_at      TIMESTAMPTZ,
  view_count      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ===== مؤثرو القوائم =====
CREATE TABLE IF NOT EXISTS client_list_influencers (
  list_id         UUID REFERENCES client_lists(id) ON DELETE CASCADE,
  influencer_id   UUID REFERENCES influencers(id) ON DELETE CASCADE,
  sort_order      INTEGER DEFAULT 0,
  note            TEXT,
  PRIMARY KEY (list_id, influencer_id)
);

-- ===== فهارس =====
CREATE INDEX IF NOT EXISTS idx_inf_slug    ON influencers(slug);
CREATE INDEX IF NOT EXISTS idx_inf_active  ON influencers(is_active, is_featured);
CREATE INDEX IF NOT EXISTS idx_inf_country ON influencers(country);
CREATE INDEX IF NOT EXISTS idx_inf_gender  ON influencers(gender);
CREATE INDEX IF NOT EXISTS idx_inf_niche   ON influencers USING GIN(niche);
CREATE INDEX IF NOT EXISTS idx_inf_search  ON influencers USING GIN(full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_sa_inf      ON social_accounts(influencer_id);
CREATE INDEX IF NOT EXISTS idx_cl_token    ON client_lists(token);

-- ===== View: ملخص إحصائيات =====
CREATE OR REPLACE VIEW influencer_stats_summary AS
SELECT
  i.id, i.slug, i.full_name, i.handle, i.avatar_url,
  i.country, i.city, i.gender, i.niche, i.languages,
  i.is_active, i.is_verified, i.is_featured, i.profile_views,
  i.created_at,
  COALESCE(SUM(sa.followers), 0)::BIGINT      AS total_followers,
  COALESCE(ROUND(AVG(sa.avg_views)), 0)::INT   AS avg_views,
  COALESCE(ROUND(AVG(sa.engagement_rate), 2), 0) AS avg_engagement,
  COUNT(DISTINCT sa.id)::INT                   AS platform_count
FROM influencers i
LEFT JOIN social_accounts sa ON sa.influencer_id = i.id
GROUP BY i.id;

-- ===== Function: زيادة عداد المشاهدات =====
CREATE OR REPLACE FUNCTION increment_profile_views(p_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE influencers SET profile_views = profile_views + 1 WHERE id = p_id;
END;
$$;

-- ===== Trigger: updated_at =====
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_influencers_updated
  BEFORE UPDATE ON influencers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===== Row Level Security =====
ALTER TABLE influencers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_collaborations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_types    ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_lists           ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_list_influencers ENABLE ROW LEVEL SECURITY;

-- القراءة العامة للمؤثرين النشطين
CREATE POLICY "public_read_influencers"
  ON influencers FOR SELECT USING (is_active = true);

CREATE POLICY "public_read_social_accounts"
  ON social_accounts FOR SELECT USING (true);

CREATE POLICY "public_read_media"
  ON media_items FOR SELECT USING (true);

CREATE POLICY "public_read_brands"
  ON brand_collaborations FOR SELECT USING (true);

CREATE POLICY "public_read_collab_types"
  ON collaboration_types FOR SELECT USING (true);

-- قوائم العملاء عبر service role فقط
CREATE POLICY "service_role_lists"
  ON client_lists FOR ALL USING (true);

CREATE POLICY "service_role_list_influencers"
  ON client_list_influencers FOR ALL USING (true);

-- ===== Supabase Storage: إنشاء Bucket =====
-- شغّل في SQL Editor:
INSERT INTO storage.buckets (id, name, public)
VALUES ('influencex-media', 'influencex-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_media_storage"
  ON storage.objects FOR SELECT USING (bucket_id = 'influencex-media');

CREATE POLICY "service_role_upload"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'influencex-media');

-- ===== بيانات تجريبية (اختياري) =====
INSERT INTO influencers (slug, full_name, handle, bio, country, city, gender, niche, is_verified, is_featured)
VALUES
  ('sara-ahm',      'سارة الأحمدي',  '@sara.ahm',     'مؤثرة لايف ستايل وسفر من الرياض', 'السعودية', 'الرياض', 'female', ARRAY['lifestyle','travel','fashion'], true, true),
  ('motech-sa',     'محمد التقني',    '@motech.sa',    'مراجعات تقنية بلغة عربية',         'السعودية', 'جدة',    'male',   ARRAY['tech'],                         true, true),
  ('noura-fashion', 'نورا الفيشن',    '@noura.fashion','ستايليست ومؤثرة أزياء من دبي',     'الإمارات', 'دبي',    'female', ARRAY['fashion','lifestyle'],          true, false),
  ('khalid-biz',    'خالد الأعمال',   '@khalid.biz',   'رائد أعمال ومستشار استراتيجي',     'السعودية', 'الرياض', 'male',   ARRAY['business'],                     true, true)
ON CONFLICT (slug) DO NOTHING;
