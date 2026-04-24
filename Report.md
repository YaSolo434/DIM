# Layihə Hesabatı və SQL İnjeksiyası Analizi

## 0. Layihənin Məqsədi (Purpose of the Project)
Bu layihənin təməl fəlsəfəsi tələbələr, müəllimlər və təhsil sahəsi ilə maraqlanan hər bir fərd üçün vahid, mərkəzləşdirilmiş rəqəmsal ekosistem yaratmaqdan ibarətdir. Müasir dövrün informasiya bolluğunda vaxtın idarə edilməsinin vacibliyini nəzərə alaraq, platformamız istifadəçilərə üç əsas istiqamətdə kompleks xidmət təklif edir.

---

## Əsas İstiqamətlər

### 1. İnformasiya Mərkəzi
İstifadəçilər həm yerli, həm də qlobal miqyasda baş verən ən son yeniliklərlə tanış ola bilərlər. Platforma xüsusilə aşağıdakı sahələri əhatə edir:
* Təhsil sahəsindəki islahatlar və yeniliklər.
* Texnoloji trendlər və elmi xəbərlər.
* Operativ və dəqiq məlumat axını.

### 2. Akademik Resurs Bazası
Təhsil prosesini daha əlçatan və effektiv etmək məqsədilə zəngin rəqəmsal kitabxana bölməsi fəaliyyət göstərir:
* **Dərsliklər:** Məktəb və universitet dərsliklərinə sürətli çıxış.
* **Elmi Vəsaitlər:** Fənlər üzrə köməkçi materiallar və test topluları.
* **Rəqəmsal Arxiv:** İstənilən vaxt əldə edilə bilən elektron resurslar.

### 3. DİM (Dövlət İmtahan Mərkəzi) İnteqrasiyası
Layihənin ən strateji üstünlüklərindən biri **Dövlət İmtahan Mərkəzi** ilə qurulan birbaşa məlumat bağlantısıdır. Bu bölmə vasitəsilə istifadəçilər digər platformalara keçid etmədən aşağıdakıları icra edə bilərlər:
* İmtahan nəticələrinin anında öyrənilməsi.
* Qəbul qaydaları və rəsmi elanlarla tanışlıq.
* İxtisas seçimi və statistik göstəricilərin təhlili.

---

## Nəticə və Dəyər Təklifi
Bu platforma sadəcə bir məlumat saytı deyil, istifadəçinin təhsil yolunda zaman itkisini minimuma endirən və bütün zəruri alətləri tək bir pəncərədə birəşdirən **universal rəqəmsal bələdçidir.** **Üstünlüklərimiz:**
* **Mərkəzləşdirilmiş idarəetmə:** Bütün təhsil ehtiyacları bir ünvanda.
* **Dəqiqlik:** Rəsmi mənbələrlə birbaşa inteqrasiya.
* **Əlçatanlıq:** İstənilən məkandan bütün təhsil materiallarına çıxış imkanı.

## 1. Layihənin Arxitekturası və İş Prinsipi (Detailed Architecture)

Bu layihə (DIM) müştəri-server (client-server) arxitekturasına əsaslanan tam yığınlı (full-stack) bir veb platformadır və iki əsas hissədən ibarətdir: **Frontend (İstifadəçi İnterfeysi)** və **Backend (Server və Məlumat Bazası)**.

### 1.1. Frontend (Ön Üz)
Frontend hissəsi heç bir framework (React, Vue və s.) istifadə edilmədən, "Vanilla" (təmiz) HTML, CSS və JavaScript ilə yazılmışdır. Bu, layihənin daha yüngül, aydın və brauzerdə sürətli işləməsini təmin edir.
* **Müstəqil Səhifə Strukturu (Pages):**
  * `DIM.html`, `DIM.css`, `ehee.js`: Saytın ana səhifəsidir. Əsas vizual interfeysi, kitabların nümayişini və axtarış sistemini özündə birləşdirir. `ehee.js` faylı `fetch` API vasitəsilə backend ilə əlaqə qurur və məlumatları dinamik olaraq dom-a (ekrana) yazır.
  * `login.html`, `login.css`, `login.js`: İstifadəçi giriş (autentifikasiya) səhifəsi. İstifadəçi məlumatları (email/şifrə) formdan yığılır və JSON formatında serverə göndərilir.
  * `register.html`, `register.css`, `register.js`: Yeni istifadəçi qeydiyyatı səhifəsi. Məlumatların düzgünlüyü (yoxlama/validation) ilkin olaraq burada aparılır.
* **Əlaqə Mexanizmi:** Səhifələrin hamısında JavaScript HTTP asinxron sorğuları (AJAX/Fetch) yaradaraq serverin `/api/...` ünvanlarına (endpoints) müraciət edir və cavabı HTML daxilində lazımi yerlərə yerləşdirir. Həmçinin kənar API-lərdən (`NewsAPI`) məlumat çəkmək üçün də `fetch` istifadə olunur.

**Nümunə: Frontend asinxron sorğuları (Giriş/Login)**
Aşağıdakı nümunədə istifadəçinin daxil etdiyi məlumatlar toplanır və serverə JSON kimi göndərilir:
```javascript
// login.js
async function login() {
    const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Tokelərin (Cookie) dəstəklənməsi üçün
        body: JSON.stringify({
            email: email.value,
            password: password.value
        })
    });

    const data = await response.json();

    if (response.ok) {
        window.location.href = 'DIM.html'; // Giriş uğurlu olduqda ana səhifəyə yönləndir
    } else {
        alert(data.message || 'Login failed');
    }
}
```

### 1.2. Backend (Arxa Üz)
Backend serveri Node.js mühitində Express.js çərçivəsi (framework) əsasında modulyar bir şəkildə (MVC arxitekturasına yaxın) qurulub.
* **Əsas Server Konfiqurasiyası (`server.js`):** API-nin mərkəzi nöqtəsidir (entry point). Burada CORS (Cross-Origin Resource Sharing) tənzimləmələri edilir ki, fərqli hostlardan (məsələn Live Serverin istifadə etdiyi `127.0.0.1:5500`) gələn frontend sorğuları bloklanmasın. Həmçinin, JWT (JSON Web Tokens) və ya sessiyaları yoxlamaq üçün HTTP cookielərini analiz edən `cookie-parser` obyekti burada tətbiq edilir.
* **Məlumat Bazası Əlaqəsi (`db.js`):** PostgreSQL məlumat bazasına asinxron olaraq davamlı (pool) əlaqə açır. Məxfi qoşulma məlumatları (user, password, host, port) təhlükəsizlik məqsədilə birbaşa koda yazılmamaqla, ekoloji dəyişənlərdən (`.env`) oxunur.
* **Marşrutlaşdırma (Routes Modulları):**
  * `routes/auth.js`: Qeydiyyat (Register) və Giriş (Login) əməliyyatlarını idarə edir.
  * `routes/books.js`: Kitablarla bağlı data əməliyyatlarına baxır.

**Nümunə: Backend Qeydiyyat İstəyi (Registration Route)**
Bu blok `register` zamanı yeni hesabın məlumat bazasına yazılmasını idarə edir. Eyni `email`-in olub-olmaması da burada yoxlanılır.
```javascript
// routes/auth.js
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    try {
        // İmailin mövcudluğunu yoxlayırıq
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Yeni istifadəçini məlumat bazasına əlavə edirik (qeyd: burada şifrə adi formatda saxlanılır)
        const newUser = await pool.query(
            'INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email',
            [first_name, last_name, email, password]
        );

        res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });

    } catch (err) {
        res.status(500).send('Server Error');
    }
});
```

**Nümunə: Backend Giriş İstəyi (Login Route)**
İstifadəçi məlumatları yoxlanılır və `JWT Token` yaradılaraq istifadəçiyə (cookie formatında) təqdim olunur.
```javascript
// routes/auth.js
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. İstifadəçi yoxlanışı
        const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userQuery.rows[0];

        // 2. Şifrə müqayisəsi (Mövcud şifrə `user.password_hash` ilə uyğun gəlirmi?)
        if (!user || password !== user.password_hash) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 3. JWT Token yaratmaq
        const payload = { id: user.id, first_name: user.first_name };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '14d' });

        // 4. Token-i Cookie kimi brauzerə qaytarmaq (mühafizəli cookie)
        res.cookie('token', token, {
            httpOnly: true, secure: true, sameSite: 'none', maxAge: 14 * 24 * 60 * 60 * 1000
        });

        res.json({ message: 'Logged in successfully', user: { email: user.email } });

    } catch (err) {
        res.status(500).send('Server Error');
    }
});
```

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

**Zəif (Təhlükəli) Kod Nümunəsi (`routes/books.js` faylından):**
```javascript
// SEARCH ROUTE (Vulnerable to SQL Injection)
router.get('/search-books', async (req, res) => {
    // We get the search term from the URL query: /search-books?title=...
    const { title } = req.query;

    try {
        // TƏHLÜKƏLİ: İstifadəçi şərhi təmizlənmədən birbaşa SQL içərisinə concat (birləşdirmə) olunur
        const queryText = `SELECT * FROM books WHERE title LIKE '%${title}%'`;

        console.log("Executing SQL:", queryText);

        const result = await pool.query(queryText);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No books found." });
        }

        return res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send(`Database Error: ${err.message}`);
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
