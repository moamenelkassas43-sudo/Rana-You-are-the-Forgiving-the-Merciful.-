let hadithsData = [];
let filteredHadiths = [];
let currentIndex = 0;

// عناصر الواجهة (DOM Elements)
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');
const hadithIndex = document.getElementById('hadithIndex');
const hadithCounter = document.getElementById('hadithCounter');
const hadithGrade = document.getElementById('hadithGrade');
const hadithSanad = document.getElementById('hadithSanad');
const hadithMatn = document.getElementById('hadithMatn');
const hadithRawi = document.getElementById('hadithRawi');
const hadithSource = document.getElementById('hadithSource');
const hadithBook = document.getElementById('hadithBook');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const homeBtn = document.getElementById('homeBtn');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const randomBtn = document.getElementById('randomBtn');
const searchInput = document.getElementById('searchInput');
const jumpInput = document.getElementById('jumpInput');
const jumpBtn = document.getElementById('jumpBtn');

// استرجاع الثيم المحفوظ مسبقاً من localStorage عند التحميل
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    if (savedTheme === "light") {
        if (themeIcon) themeIcon.textContent = "🌙";
        if (themeText) themeText.textContent = "الوضع الداكن";
    } else {
        if (themeIcon) themeIcon.textContent = "☀️";
        if (themeText) themeText.textContent = "الوضع النهاري";
    }
}

// دالة تطبيع النصوص لإلغاء تأثير التشكيل والهمزات والتاء المربوطة في البحث
function normalize(text) {
    if (!text) return "";
    return text
        .replace(/[أإآء]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .replace(/[ًٌٍَُِّْ]/g, "")
        .toLowerCase();
}

// جلب الأحاديث من ملف JSON الخارجي
async function loadHadiths() {
    try {
        const response = await fetch('hadiths.json');
        if (!response.ok) throw new Error('فشل في جلب ملف الأحاديث');
        
        hadithsData = await response.json();
        filteredHadiths = [...hadithsData];
        
        // استرجاع آخر حديث تم الوقوف عنده عبر localStorage
        const savedIndex = localStorage.getItem('currentIndex');
        if (savedIndex !== null && savedIndex >= 0 && savedIndex < hadithsData.length) {
            currentIndex = parseInt(savedIndex);
        }
        
        renderHadith(currentIndex);
    } catch (error) {
        console.error('خطأ في تحميل الأحاديث:', error);
        if (hadithSanad) hadithSanad.textContent = "";
        if (hadithGrade) hadithGrade.textContent = "خطأ";
        if (hadithMatn) hadithMatn.textContent = 'تعذر تحميل قاعدة بيانات الأحاديث. تأكد من وجود ملف hadiths.json في نفس المجلد وصحة مساره.';
    }
}

// تبديل الوضع الليلي والنهاري مع حفظ الحالة في localStorage
themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        if (themeIcon) themeIcon.textContent = '🌙';
        if (themeText) themeText.textContent = 'الوضع الداكن';
        localStorage.setItem("theme", "light");
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeIcon) themeIcon.textContent = '☀️';
        if (themeText) themeText.textContent = 'الوضع النهاري';
        localStorage.setItem("theme", "dark");
    }
});

// تحديث حالة تعطيل/تفعيل الأزرار بناءً على وجود نتائج بحث
function updateControlsState() {
    const disabled = filteredHadiths.length === 0;
    if (nextBtn) nextBtn.disabled = disabled;
    if (prevBtn) prevBtn.disabled = disabled;
    if (randomBtn) randomBtn.disabled = disabled;
    if (copyBtn) copyBtn.disabled = disabled;
    if (shareBtn) shareBtn.disabled = disabled;
}

// عرض الحديث في البطاقة
function renderHadith(index) {
    updateControlsState();

    if (filteredHadiths.length === 0) {
        if (hadithIndex) hadithIndex.textContent = "لا توجد نتائج";
        if (hadithCounter) hadithCounter.textContent = "(0 من 0)";
        if (hadithGrade) hadithGrade.textContent = "-";
        if (hadithSanad) hadithSanad.textContent = "عذراً، لم يتم العثور على أحاديث تطابق بحثك.";
        if (hadithMatn) hadithMatn.textContent = "يرجى تعديل كلمة البحث والمحاولة مرة أخرى.";
        if (hadithRawi) hadithRawi.textContent = "-";
        if (hadithSource) hadithSource.textContent = "-";
        if (hadithBook) hadithBook.textContent = "-";
        return;
    }

    if (index < 0) index = filteredHadiths.length - 1;
    if (index >= filteredHadiths.length) index = 0;
    currentIndex = index;

    const item = filteredHadiths[currentIndex];
    if (hadithIndex) hadithIndex.textContent = `حديث #${item.id}`;
    if (hadithCounter) {
        hadithCounter.textContent = `(الحديث ${currentIndex + 1} من ${filteredHadiths.length})`;
    }
    
    if (hadithGrade) hadithGrade.textContent = item.grade;
    if (hadithSanad) hadithSanad.textContent = item.sanad;
    if (hadithMatn) hadithMatn.textContent = item.matn;
    if (hadithRawi) hadithRawi.textContent = item.rawi;
    if (hadithSource) hadithSource.textContent = item.source;
    if (hadithBook) hadithBook.textContent = item.book;

    // حفظ التقدم الحالي في localStorage (حسب الفهرس الأصلي للبيانات)
    const originalIndex = hadithsData.findIndex(h => h.id === item.id);
    if (originalIndex !== -1) {
        localStorage.setItem('currentIndex', originalIndex);
    }
}

// أزرار التنقل (التالي والسابق والبداية)
nextBtn.addEventListener('click', () => {
    renderHadith(currentIndex + 1);
});

prevBtn.addEventListener('click', () => {
    renderHadith(currentIndex - 1);
});

if (homeBtn) {
    homeBtn.addEventListener('click', () => {
        renderHadith(0);
    });
}

// حديث عشوائي
randomBtn.addEventListener('click', () => {
    if (filteredHadiths.length <= 1) return;
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * filteredHadiths.length);
    } while (randomIndex === currentIndex);
    renderHadith(randomIndex);
});

// الانتقال برقم الحديث
jumpBtn.addEventListener('click', () => {
    const val = parseInt(jumpInput.value);
    if (!isNaN(val)) {
        const foundIndex = filteredHadiths.findIndex(h => h.id === val);
        if (foundIndex !== -1) {
            renderHadith(foundIndex);
            jumpInput.value = '';
        } else {
            alert('رقم الحديث غير متوفر في النتائج الحالية');
        }
    }
});

jumpInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') jumpBtn.click();
});

// البحث الحي المباشر المدعوم بدالة التطبيع
searchInput.addEventListener('input', (e) => {
    const term = normalize(e.target.value.trim());
    if (term === '') {
        filteredHadiths = [...hadithsData];
    } else {
        filteredHadiths = hadithsData.filter(h => 
            normalize(h.matn).includes(term) || 
            normalize(h.sanad).includes(term) || 
            normalize(h.rawi).includes(term) ||
            normalize(h.source).includes(term) ||
            normalize(h.book).includes(term)
        );
    }
    currentIndex = 0;
    renderHadith(currentIndex);
});

// نسخ الحديث بالصيغة الهيكلية المطورة
copyBtn.addEventListener('click', () => {
    if (filteredHadiths.length === 0) return;
    const item = filteredHadiths[currentIndex];
    
    const textToCopy = `
حديث رقم ${item.id}

${item.sanad}

${item.matn}

الراوي: ${item.rawi}
المصدر: ${item.source}
الكتاب: ${item.book}
الحكم: ${item.grade}

موسوعة الصحيح الثابت
تصميم: مؤمن هشام القصاص
`.trim();
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = "✅ تم النسخ!";
        copyBtn.style.background = "var(--accent-green)";
        copyBtn.style.color = "#000";
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = "linear-gradient(135deg, var(--accent-orange), #e68a00)";
            copyBtn.style.color = "#000";
        }, 2000);
    });
});

// مشاركة الحديث مع دعم الـ Web Share API والـ URL الحالي
shareBtn.addEventListener('click', async () => {
    if (filteredHadiths.length === 0) return;
    const item = filteredHadiths[currentIndex];
    
    const shareText = `حديث رقم ${item.id}\n\n${item.sanad}\n\n${item.matn}\n\nالراوي: ${item.rawi}\nالمصدر: ${item.source}`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'موسوعة الصحيح الثابت',
                text: shareText,
                url: location.href
            });
        } catch (err) {
            console.log('تم إلغاء المشاركة');
        }
    } else {
        navigator.clipboard.writeText(shareText + `\n\n${location.href}`);
        alert('تم نسخ تفاصيل الحديث ورابط الموقع للحافظة بنجاح!');
    }
});

// تشغيل التطبيق عند تحميل الملف
loadHadiths();
