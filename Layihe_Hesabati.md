# Layihə Hesabatı və SQL İnjeksiyası Analizi

## 1. Layihənin Arxitekturası və İş Prinsipi (Detailed Architecture)

Bu layihə (DIM) müştəri-server (client-server) arxitekturasına əsaslanan tam yığınlı (full-stack) bir veb platformadır və iki əsas hissədən ibarətdir: **Frontend (İstifadəçi İnterfeysi)** və **Backend (Server və Məlumat Bazası)**.

### 1.1. Frontend (Ön Üz)
Frontend hissəsi heç bir framework (React, Vue və s.) istifadə edilmədən, "Vanilla" (təmiz) HTML, CSS və JavaScript ilə yazılmışdır. Bu, layihənin daha yüngül, aydın və brauzerdə sürətli işləməsini təmin edir.
* **Müstəqil Səhifə Strukturu (Pages):**
  * `DIM.html`, `DIM.css`, `ehee.js`: Saytın ana səhifəsidir. Əsas vizual interfeysi, kitabların nümayişini və axtarış sistemini özündə birləşdirir. `ehee.js` faylı `fetch` API vasitəsilə backend ilə əlaqə qurur və məlumatları dinamik olaraq dom-a (ekrana) yazır.
  * `login.html`, `login.css`, `login.js`: İstifadəçi giriş (autentifikasiya) səhifəsi. İstifadəçi məlumatları (email/şifrə) formdan yığılır və JSON formatında serverə göndərilir.
  * `register.html`, `register.css`, `register.js`: Yeni istifadəçi qeydiyyatı səhifəsi. Məlumatların düzgünlüyü (yoxlama/validation) ilkin olaraq burada aparılır.
* **Əlaqə Mexanizmi:** Səhifələrin hamısında JavaScript HTTP asinxron sorğuları (AJAX/Fetch) yaradaraq serverin `/api/...` ünvanlarına (endpoints) müraciət edir və cavabı HTML daxilində lazımi yerlərə yerləşdirir.

### 1.2. Backend (Arxa Üz)
Backend serveri Node.js mühitində Express.js çərçivəsi (framework) əsasında modulyar bir şəkildə (MVC arxitekturasına yaxın) qurulub.
* **Əsas Server Konfiqurasiyası (`server.js`):** API-nin mərkəzi nöqtəsidir (entry point). Burada CORS (Cross-Origin Resource Sharing) tənzimləmələri edilir ki, fərqli hostlardan (məsələn Live Serverin istifadə etdiyi `127.0.0.1:5500`) gələn frontend sorğuları bloklanmasın. Həmçinin, JWT (JSON Web Tokens) və ya sessiyaları yoxlamaq üçün HTTP cookielərini analiz edən `cookie-parser` obyekti burada tətbiq edilir.
* **Məlumat Bazası Əlaqəsi (`db.js`):** PostgreSQL məlumat bazasına asinxron olaraq davamlı (pool) əlaqə açır. Məxfi qoşulma məlumatları (user, password, host, port) təhlükəsizlik məqsədilə birbaşa koda yazılmamaqla, ekoloji dəyişənlərdən (`.env`) oxunur.
* **Marşrutlaşdırma (Routes Modulları):**
  * `routes/auth.js` (`/api/auth` daxilində istehlak olunur): Qeydiyyat (Register) və Giriş (Login) əməliyyatlarını həyata keçirir. Şifrələrin bazada necə yoxlanmasını, istifadəçiyə uyğun tokenlərin/cookielərin təyin edilməsini idarə edir.
  * `routes/books.js` (`/api/books` daxilində istehlak olunur): Kitablarla bağlı data əməliyyatlarına baxır. Ana səhifədəki kitabları gətirmək (`GET`) və axtarış funksionallıqları bu marşrutlar üzərindən icra olunur.
* **Təhlükəsizlik Ara Qatı (`middleware/authMiddleware.js`):** Yalnız icazəli (giriş etmiş) istifadəçilərin müəyyən funksiyalara və ya datalara çıxışını idarə edir. Müştəridən (client) gələn soğun daxilindəki cookie/tokeni yoxlayır, etibarlıdırsa sistemə buraxır, əks halda `401 Unauthorized` xətası qaytarır.

## 2. İstifadə Olunan Texnologiyalar (Technologies Used)
Tətbiq aşağıdakı müasir veb texnologiyalar əsasında qurulmuşdur:
* **Node.js və Express.js (Backend):** Sərfəli, sürətli və asan API xidmətləri (REST API) yaratmaq üçün istifadə edilib.
* **PostgreSQL (`pg` modulu):** Relyasiyalı məlumat bazası kimi istifadə olunaraq məlumatların etibarlı saxlanmasını təmin edir.
* **CORS:** Fərqli portlarda işləyən (məs: `localhost:5500` və `localhost:3000`) frontend və backend arasında məlumat mübadiləsinə icazə vermək üçündür.
* **Cookie-Parser:** Təhlükəsizlik və sessiya idarəsi üçün cookie məlumatlarını oxumağa kömək edir.
* **Dotenv:** Məxfi məlumatların (məlumat bazası şifrələri) `.env` faylında gizli saxlanması üçün.
* **HTML/CSS/Vanilla JS:** Heç bir əlavə framework (React/Vue kimi) istifadə edilmədən birbaşa təməl web texnologiyaları ilə yazılmış və xüsusi dizayn edilmiş ön-interfeys.

---

## 3. Sayt Daxili Axtarış Sistemində SQL İnjeksiyası (SQL Injection Attack)

### SQL İnjeksiyası Nədir?
SQL İnjeksiyası, kibercinayətkarların tətbiqin (saytın) daxil etmə sahələrinə zərərli SQL kodları yerləşdirərək məlumat bazasını manipulyasiya etdiyi bir veb təhlükəsizlik boşluğudur. Əgər istifadəçidən gələn məlumatlar birbaşa SQL sorğusuna yazılırsa, hücumçu məlumatları oxuya, dəyişdirə və ya tamamilə silə bilər.

### Axtarış Sistemində Zəiflik Necə Yaranır?
Saytdakı kitablar (`books.js`) axtarış sistemini nəzərdən keçirək. Əgər istifadəçinin axtarış etdiyi bölməni bir başa, heç bir təhlükəsizlik tədbiri görmədən birbaşa məlumat bazasına göndərəriksə, böyük bir risk yaranır.

**Zəif (Təhlükəli) Kod Nümunəsi:**
```javascript
// ZƏİF VƏ TƏHLÜKƏLİ KOD
app.get('/api/books/search', async (req, res) => {
    const axtarisSozu = req.query.q; 
    
    // İstifadəçi məlumatı birbaşa SQL mətni daxilinə yazılır!
    const query = `SELECT * FROM books WHERE title LIKE '%${axtarisSozu}%'`;
    
    try {
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
    }
});
```

### Hücum Ssenarisi (Examples of Attacks)

**Nümunə 1: Bütün Məlumatların Sızdırılması (Authentication Bypass / Data Extraction)**
Təsəvvür edin ki, istifadəçi axtarış qutusuna bu mətni daxil edir:
`x' OR '1'='1`

Bu zaman arxa planda işə düşən SQL sorğusu belə olur:
```sql
SELECT * FROM books WHERE title LIKE '%x' OR '1'='1%'
```
*Nəticə:* `'1'='1'` həmişə doğru (TRUE) olduğuna görə, sistem bazadakı *bütün* kitabları (hətta bəlkə gizli və ya arxivlənmiş olanları belə) ekrana çıxaracaq.

**Nümunə 2: Cədvəllərin Silinməsi (Destructive Attack)**
Hücumçu daha qəddar davranaraq axtarış qutusuna bu ifadəni yaza bilər:
`'; DROP TABLE users; --`

*Nəticə:* Backend aşağıdakı SQL funksiyasını işə salacaq:
```sql
SELECT * FROM books WHERE title LIKE '%'; DROP TABLE users; --%'
```
1. Birinci sorğu bitir.
2. `DROP TABLE users;` komandası işə düşərək bütün istifadəçi cədvəlini və istifadəçiləri bazadan silir.
3. `--` simvolu SQL-də qalan hissəni şərhə çevirir ki, sintaksis xətası çıxmasın.

### Bu Hücumdan Necə Qorunmalı? (Prevention)
SQL Injection hücumunun qarşısını almağın ən yaxşı yolu **Parametrləşdirilmiş Sorğulardan (Parameterized Queries)** istifadə etməkdir. Bu üsulda məlumat bazası istifadəçidən gələn simvolları heç vaxt komanda kimi qəbul etmir, sadəcə "mətn" (string) kimi tanıyır.

**Təhlükəsiz Kod Nümunəsi:**
```javascript
// TƏHLÜKƏSİZ KOD (PostgreSQL pg modulu ilə parametrli sorğu)
app.get('/api/books/search', async (req, res) => {
    const axtarisSozu = req.query.q;
    
    // $1 placeholder-dən istifadə edilir
    const query = 'SELECT * FROM books WHERE title ILIKE $1';
    
    // Məlumat ayrı bir massiv olaraq göndərilir
    const values = [`%${axtarisSozu}%`]; 
    
    try {
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
    }
});
```
Bu strukturda, kimsə axtarış qutusuna `'; DROP TABLE users; --` yazsa belə, məlumat bazası sadəcə adı tam olaraq `%'; DROP TABLE users; --%` olan bir kitab axtaracaq və təbii ki, heç nə tapmayıb zərərsiz bir şəkildə boş nəticə qaytaracaq.
