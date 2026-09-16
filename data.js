'use strict';
// x, y: 0–100 % of each category's background image display area.
// Pre-calibrated accurately to the loaded digital map images.

// ── Category → background image mapping ──────────────────────────────────
const CAT_TO_IMAGE = {
  'Kıvrımlı Dağlar':      'images/daglar.jpg',
  'Kırıklı Dağlar':       'images/daglar.jpg',
  'Volkanik Dağlar':      'images/daglar.jpg',
  'Tektonik Göller':      'images/tektonik-goller.jpg',
  'Volkanik Göller':      'images/volkanik-goller.jpg',
  'Volkanik Set Gölleri': 'images/volkanik-set-goller.jpg',
  'Karstik Göller':       'images/karstik-goller.jpg',
  'Buzul Gölleri':        'images/buzul-goller.jpg',
  'Alüvyon Set Gölleri':  'images/aluvyon-set-goller.jpg',
  'Heyelan Set Gölleri':  'images/heyelan-set-goller.jpg',
  'Kıyı Set Gölleri':     'images/kiyi-set-goller.jpg',
  // Ovalar (daglar.jpg fiziki haritası üzerinde)
  'Delta Ovaları':              'images/daglar.jpg',
  'Karstik Ovalar (Polye)':     'images/daglar.jpg',
  'Tektonik Ovalar':            'images/daglar.jpg',
  // Platolar (daglar.jpg fiziki haritası üzerinde)
  'Karstik Platolar':           'images/daglar.jpg',
  'Volkanik Platolar':          'images/daglar.jpg',
  'Aşınım Platoları':           'images/daglar.jpg',
  'Tabaka Düzlüğü Platoları':   'images/daglar.jpg',
  // Akarsular (daglar.jpg fiziki haritası üzerinde)
  'Karadeniz Akarsuları':       'images/daglar.jpg',
  'Akdeniz Akarsuları':         'images/daglar.jpg',
  'Ege ve Marmara Akarsuları':  'images/daglar.jpg',
  'Basra ve Hazar Akarsuları':  'images/daglar.jpg',
  // Geçitler (daglar.jpg fiziki haritası üzerinde)
  'Karadeniz Geçitleri':        'images/daglar.jpg',
  'Akdeniz Geçitleri':          'images/daglar.jpg',
};

const DAGLAR = [
  // ── Kıvrımlı Dağlar (1–37) ──────────────────────────────────────────────
  {id:'dag-01',num:1,  isim:'Yıldız Dağları',       kategori:'Kıvrımlı Dağlar', tip:'dag', x:14.5, y:21.0, not:'Trakya\'nın en yüksek yeri (Istranca). Masif arazi, engebeli ve seyrek nüfusludur.'},
  {id:'dag-02',num:2,  isim:'Kaz Dağları',           kategori:'Kıvrımlı Dağlar', tip:'dag', x:11.2, y:38.5, not:'Biga Yarımadası (Çanakkale-Balıkesir). Alplerden sonra oksijen oranı en yüksek 2. yerdir.'},
  {id:'dag-03',num:3,  isim:'Uludağ',                kategori:'Kıvrımlı Dağlar', tip:'dag', x:19.5, y:32.0, not:'Marmara\'nın en yüksek dağı (2543m, Bursa). Derinlik volkanizması (batolit) ve buzul izleri taşır.'},
  {id:'dag-04',num:4,  isim:'Samanlı Dağları',       kategori:'Kıvrımlı Dağlar', tip:'dag', x:24.0, y:26.5, not:'Kocaeli ile İznik Gölü arasında uzanır (Kocaeli-Yalova-Bursa sınırında).'},
  {id:'dag-05',num:5,  isim:'Bolu Dağları',          kategori:'Kıvrımlı Dağlar', tip:'dag', x:31.5, y:23.5, not:'Batı Karadeniz geçidi; Düzce ve Bolu havzalarını birbirinden ayırır.'},
  {id:'dag-06',num:6,  isim:'Ilgaz Dağı',            kategori:'Kıvrımlı Dağlar', tip:'dag', x:40.5, y:21.0, not:'Batı Karadeniz (Kastamonu-Çankırı). \'Ilgaz Anadolu\'nun sen yüce bir dağısın\', kış turizmi merkezi.'},
  {id:'dag-07',num:7,  isim:'Küre Dağları',          kategori:'Kıvrımlı Dağlar', tip:'dag', x:37.0, y:16.5, not:'Kastamonu-Sinop kıyı kuşağı. Valla ve Horma kanyonları ile zengin bakır yataklarıyla ünlüdür.'},
  {id:'dag-08',num:8,  isim:'Köroğlu Dağları',       kategori:'Kıvrımlı Dağlar', tip:'dag', x:34.5, y:27.5, not:'Bolu-Ankara sınırı. Volkanik kökenli kıvrım kütlesi, Kartalkaya kayak merkezi buradadır.'},
  {id:'dag-09',num:9,  isim:'Sündiken Dağları',      kategori:'Kıvrımlı Dağlar', tip:'dag', x:31.0, y:38.0, not:'Eskişehir kuzeyinde, Sakarya vadisi boyunca uzanan ormanlık kıvrım dağı.'},
  {id:'dag-10',num:10, isim:'Elma Dağı',             kategori:'Kıvrımlı Dağlar', tip:'dag', x:39.5, y:37.5, not:'Ankara\'nın doğusunda plato üzerinde yükselen kış sporları merkezi aşınım dağı.'},
  {id:'dag-11',num:11, isim:'Canik Dağları',         kategori:'Kıvrımlı Dağlar', tip:'dag', x:53.5, y:23.5, not:'Orta Karadeniz (Samsun). Yükseltisi az ve kıyıdan uzaktır; Bafra ve Çarşamba deltalarının oluşmasını sağlamıştır.'},
  {id:'dag-12',num:12, isim:'Giresun Dağları',       kategori:'Kıvrımlı Dağlar', tip:'dag', x:64.0, y:26.0, not:'Doğu Karadeniz kıyı sırası. Dik yamaçlar, fındık bahçeleri ve yaylacılık merkezi.'},
  {id:'dag-13',num:13, isim:'Kaçkar Dağları',        kategori:'Kıvrımlı Dağlar', tip:'dag', x:74.5, y:22.5, not:'Karadeniz\'in en yüksek zirvesi (3932m, Rize/Artvin). Güncel buzullar ve sirk gölleri yer alır.'},
  {id:'dag-14',num:14, isim:'Karçal Dağı',           kategori:'Kıvrımlı Dağlar', tip:'dag', x:79.0, y:20.0, not:'Artvin / Gürcistan sınırı (3428m). Biyoçeşitlilik merkezi ve buzul vadileriyle ünlüdür.'},
  {id:'dag-15',num:15, isim:'Mescit Dağları',        kategori:'Kıvrımlı Dağlar', tip:'dag', x:74.0, y:29.0, not:'Erzurum kuzeyi. Çoruh Nehri\'nin doğduğu yüksek yayla ve kıvrım kütlesi.'},
  {id:'dag-16',num:16, isim:'Yalnızçam Dağları',     kategori:'Kıvrımlı Dağlar', tip:'dag', x:82.0, y:25.0, not:'Ardahan-Artvin arası. Karadeniz ile Doğu Anadolu havzalarını ayıran doğal sınırdır.'},
  {id:'dag-17',num:17, isim:'Allahuekber Dağları',   kategori:'Kıvrımlı Dağlar', tip:'dag', x:85.0, y:29.5, not:'Kars-Erzurum sınırı (Sarıkamış). Tarihi Sarıkamış şehitlerimizin anıldığı kutsal dağ.'},
  {id:'dag-18',num:18, isim:'Aras Güneyi Dağları',   kategori:'Kıvrımlı Dağlar', tip:'dag', x:83.0, y:41.0, not:'Aras Nehri vadisi güneyinde Erzurum-Kars-Ağrı platoları arasında uzanan yüksek dağ sırası.'},
  {id:'dag-19',num:19, isim:'Simav Dağı',            kategori:'Kıvrımlı Dağlar', tip:'dag', x:21.0, y:46.0, not:'Kütahya-Manisa sınırı. Fay hatları, graben kenarı ve zengin termal kaynaklarla çevrilidir.'},
  {id:'dag-20',num:20, isim:'Murat Dağı',            kategori:'Kıvrımlı Dağlar', tip:'dag', x:24.5, y:44.5, not:'Kütahya-Uşak (2312m). Gediz ve Porsuk nehirlerinin doğduğu termal ve kayak dağı.'},
  {id:'dag-21',num:21, isim:'Emir Dağı',             kategori:'Kıvrımlı Dağlar', tip:'dag', x:31.0, y:41.5, not:'Afyonkarahisar platosunda tekil yükselen tepe ve yaylalarıyla meşhur kıvrım dağı.'},
  {id:'dag-22',num:22, isim:'Sultan Dağı',           kategori:'Kıvrımlı Dağlar', tip:'dag', x:30.0, y:57.5, not:'Afyon-Konya-Isparta sınırı. Akşehir/Eber gölleri ile Eğirdir/Beyşehir gölleri arasında doğal settir.'},
  {id:'dag-23',num:23, isim:'Dedegöl Dağı',          kategori:'Kıvrımlı Dağlar', tip:'dag', x:31.5, y:60.0, not:'Batı Toroslar / Isparta-Konya (2998m). Beyşehir Gölü batısında buzul ve karstik mağaralar dağı.'},
  {id:'dag-24',num:24, isim:'Geyik Dağları',         kategori:'Kıvrımlı Dağlar', tip:'dag', x:34.5, y:70.0, not:'Orta Toroslar (Antalya-Karaman). Karstik yaylalar, uvalalar ve çıplak kireçtaşları kütlesi.'},
  {id:'dag-25',num:25, isim:'Bolkar Dağları',        kategori:'Kıvrımlı Dağlar', tip:'dag', x:43.5, y:71.5, not:'Orta Toroslar (Niğde-Mersin, 3524m). Karstik kaynaklar, buzul gölleri ve endemik Toros kurbağası.'},
  {id:'dag-26',num:26, isim:'Aladağlar',             kategori:'Kıvrımlı Dağlar', tip:'dag', x:46.5, y:64.5, not:'Orta Toroslar (Kayseri-Niğde-Adana, Demirkazık 3756m). Dağcılık ve milli park merkezi.'},
  {id:'dag-27',num:27, isim:'Tahtalı Dağları',       kategori:'Kıvrımlı Dağlar', tip:'dag', x:52.5, y:57.0, not:'Orta Toroslar (Adana-Kayseri-Sivas). Seyhan Nehri kollarının yardığı derin kanyonlar.'},
  {id:'dag-28',num:28, isim:'Binboğa Dağları',       kategori:'Kıvrımlı Dağlar', tip:'dag', x:58.5, y:54.5, not:'Kahramanmaraş-Kayseri sınırı. \'Binboğalar Efsanesi\', zengin yaylacılık ve endemik bitki alanı.'},
  {id:'dag-29',num:29, isim:'Akdağlar',              kategori:'Kıvrımlı Dağlar', tip:'dag', x:52.5, y:42.0, not:'İç Anadolu ile Karadeniz geçişinde (Sivas-Yozgat). Kızılırmak havzasını çevreleyen dağ.'},
  {id:'dag-30',num:30, isim:'Çamlıbel Dağları',      kategori:'Kıvrımlı Dağlar', tip:'dag', x:54.0, y:33.5, not:'Tokat-Sivas sınırı. \'Çamlıbel\'den aşırdım yolları\', İç Anadolu\'yu Karadeniz\'e bağlayan geçit.'},
  {id:'dag-31',num:31, isim:'Tecer Dağı',            kategori:'Kıvrımlı Dağlar', tip:'dag', x:62.0, y:45.5, not:'Sivas güneyi. Jips (alçıtaşı) karstı ve zengin linyit havzalarının bulunduğu plato dağı.'},
  {id:'dag-32',num:32, isim:'Güneydoğu Toros Dağları',kategori:'Kıvrımlı Dağlar',tip:'dag', x:71.0, y:55.0, not:'Malatya\'dan Hakkari\'ye uzanır. Fırat ve Dicle nehirlerinin sarp kanyonlarla yardığı Güneydoğu kuşağı.'},
  {id:'dag-33',num:33, isim:'Mardin Dağları',        kategori:'Kıvrımlı Dağlar', tip:'dag', x:79.0, y:60.0, not:'Mardin-Midyat eşiği. Çevresine göre yüksek kalker platosu, güneyinde Suriye düzlükleri başlar.'},
  {id:'dag-34',num:34, isim:'Hakkari (Cilo) Dağları',kategori:'Kıvrımlı Dağlar', tip:'dag', x:90.0, y:56.0, not:'Türkiye\'nin 2. en yüksek zirvesi (Uludoruk/Reşko 4135m). Türkiye\'nin en büyük vadi buzulu buradadır.'},
  {id:'dag-35',num:35, isim:'Nur (Amanos) Dağları',  kategori:'Kıvrımlı Dağlar', tip:'dag', x:53.5, y:70.5, not:'Hatay kıyı kuşağı (Aslen Horst). İskenderun Körfezi ile Amik Ovası\'nı birbirinden ayırır.'},
  {id:'dag-36',num:36, isim:'Akdağ',                 kategori:'Kıvrımlı Dağlar', tip:'dag', x:20.0, y:62.5, not:'Batı Toroslar (Muğla-Antalya sınırı, 3015m). Fethiye ve Kaş yaylaları, derin karstik kanyonlar.'},
  {id:'dag-37',num:37, isim:'Bey Dağları',           kategori:'Kıvrımlı Dağlar', tip:'dag', x:24.0, y:66.5, not:'Antalya batısı (Kızlar Sivrisi 3070m). Olimpos Milli Parkı ve Akdeniz\'e dik inen yamaçlar.'},

  // ── Kırıklı Dağlar (38–42) ──────────────────────────────────────────────
  {id:'dag-38',num:38, isim:'Madra Dağı',            kategori:'Kırıklı Dağlar',  tip:'dag', x:12.5, y:41.0, not:'Balıkesir-İzmir sınırı (Horst). Bakırçay grabeni kuzeyinde yükselen granit horst kütlesi.'},
  {id:'dag-39',num:39, isim:'Yunt Dağı',             kategori:'Kırıklı Dağlar',  tip:'dag', x:14.5, y:46.0, not:'İzmir-Manisa sınırı (Horst). Bakırçay ile Gediz grabenleri arasında yükselen horst.'},
  {id:'dag-40',num:40, isim:'Bozdağ',                kategori:'Kırıklı Dağlar',  tip:'dag', x:14.5, y:50.5, not:'İzmir-Manisa (Horst). Gediz ile Küçük Menderes grabenleri arasında yükselir; kayak merkezi bulunur.'},
  {id:'dag-41',num:41, isim:'Aydın Dağları',         kategori:'Kırıklı Dağlar',  tip:'dag', x:14.5, y:55.5, not:'İzmir-Aydın sınırı (Horst). Küçük Menderes ile Büyük Menderes grabenleri arasında uzanır.'},
  {id:'dag-42',num:42, isim:'Menteşe Dağları',       kategori:'Kırıklı Dağlar',  tip:'dag', x:17.0, y:62.0, not:'Muğla (Horst). Kıyıya paralel uzanır, Ege\'nin en çok yağış alan ve en engebeli yöresidir.'},

  // ── Volkanik Dağlar (43–52) ─────────────────────────────────────────────
  {id:'dag-43',num:43, isim:'Kara Dağ',              kategori:'Volkanik Dağlar', tip:'dag', x:36.0, y:67.0, not:'İç Anadolu (Karaman, 2288m). Andezit-bazalt lavlarından oluşmuş sönmüş volkan kütlesi.'},
  {id:'dag-44',num:44, isim:'Karacadağ',             kategori:'Volkanik Dağlar', tip:'dag', x:39.5, y:68.5, not:'İç Anadolu (Konya-Karapınar). Çevresinde maar patlama çukurları ve volkanik küller bulunur.'},
  {id:'dag-45',num:45, isim:'Hasan Dağı',            kategori:'Volkanik Dağlar', tip:'dag', x:43.5, y:61.5, not:'Aksaray-Niğde sınırı (3268m). Çift kraterli volkan; Çatalhöyük duvar resimlerinde püskürüşü çizilmiştir.'},
  {id:'dag-46',num:46, isim:'Melendiz Dağları',      kategori:'Volkanik Dağlar', tip:'dag', x:45.0, y:61.0, not:'Niğde-Aksaray volkan kütlesi. Ihlara Vadisi\'ni oluşturan volkanik tüflerin ana kaynağıdır.'},
  {id:'dag-47',num:47, isim:'Erciyes Dağı',          kategori:'Volkanik Dağlar', tip:'dag', x:48.5, y:54.0, not:'İç Anadolu\'nun en yüksek dağı (3917m, Kayseri). Zirvesinde buzul izleri ve ünlü kayak merkezi.'},
  {id:'dag-48',num:48, isim:'Karaca Dağ',            kategori:'Volkanik Dağlar', tip:'dag', x:70.0, y:59.0, not:'Diyarbakır-Şanlıurfa sınırı (1957m). Çok akıcı lavların yayılmasıyla oluşan Türkiye\'nin tek Kalkan Volkanı.'},
  {id:'dag-49',num:49, isim:'Nemrut Dağı',           kategori:'Volkanik Dağlar', tip:'dag', x:81.0, y:49.0, not:'Bitlis / Tatvan (2948m). Zirvesindeki dev kaldera içinde sıcak ve soğuk krater gölleri yer alır.'},
  {id:'dag-50',num:50, isim:'Süphan Dağı',           kategori:'Volkanik Dağlar', tip:'dag', x:84.0, y:43.5, not:'Van Gölü kuzeyi (Bitlis-Muş-Ağrı, 4058m). Türkiye\'nin 3. yüksek zirvesi, sönmüş stratovolkan.'},
  {id:'dag-51',num:51, isim:'Tendürek Dağı',         kategori:'Volkanik Dağlar', tip:'dag', x:87.5, y:40.0, not:'Ağrı-Van sınırı (3533m). Zirve kraterinde kükürt gazları ve buhar çıkışları süren genç volkan.'},
  {id:'dag-52',num:52, isim:'Ağrı Dağı',             kategori:'Volkanik Dağlar', tip:'dag', x:90.0, y:36.0, not:'Türkiye\'nin en yüksek zirvesi (Büyük Ağrı 5137m). Zirvesinde kalıcı Takke Buzulu yer alır.'},
];

const GOLLER = [
  // ── Tektonik Göller ─────────────────────────────────────────────────────
  {id:'gol-sapanca',   isim:'Sapanca',         kategori:'Tektonik Göller',      tip:'gol', x:34.08, y:39.53, not:'Sakarya-Kocaeli - Marmara\'nın tatlı su kaynağı olan tektonik göl.'},
  {id:'gol-iznik',     isim:'İznik',           kategori:'Tektonik Göller',      tip:'gol', x:31.54, y:37.34, not:'Bursa - Marmara\'nın en büyük gölü; tatlı su özellikli tektonik göl.'},
  {id:'gol-ulubat',    isim:'Ulubat',          kategori:'Tektonik Göller',      tip:'gol', x:28.32, y:37.97, not:'Bursa - Ramsar koruma alanı; kereviti bol sığ tektonik göl.'},
  {id:'gol-manyas',    isim:'Manyas',          kategori:'Tektonik Göller',      tip:'gol', x:37.01, y:36.72, not:'Balıkesir - \'Kuş Cenneti Milli Parkı\'; göçmen kuşların durağı sığ tektonik göl.'},
  {id:'gol-eber',      isim:'Eber',            kategori:'Tektonik Göller',      tip:'gol', x:37.40, y:57.03, not:'Afyonkarahisar - Yüzen adacıkları (kopak) ve sazlıklarıyla meşhur sığ tektonik göl.'},
  {id:'gol-aksehir',   isim:'Akşehir',         kategori:'Tektonik Göller',      tip:'gol', x:41.02, y:50.16, not:'Konya-Afyon - Nasreddin Hoca\'nın maya çaldığı tektonik göl.'},
  {id:'gol-ilgin',     isim:'Ilgın',           kategori:'Tektonik Göller',      tip:'gol', x:43.85, y:46.09, not:'Konya - Çavuşçu Gölü olarak da bilinir; sulamada kullanılan tektonik göl.'},
  {id:'gol-tuz',       isim:'Tuz',             kategori:'Tektonik Göller',      tip:'gol', x:50.68, y:47.97, not:'Türkiye\'nin 2. büyük gölü; yazın buharlaşmayla alanı en çok değişen aşırı tuzlu tektonik göl.'},
  {id:'gol-seyfe',     isim:'Seyfe',           kategori:'Tektonik Göller',      tip:'gol', x:39.55, y:46.88, not:'Kırşehir - Ramsar alanı; flamingoların önemli üreme noktası olan tektonik göl.'},
  {id:'gol-acigol',    isim:'Acıgöl',          kategori:'Tektonik Göller',      tip:'gol', x:32.91, y:52.50, not:'Afyon-Denizli - Türkiye\'nin sodyum sülfat üretim merkezi olan acı-tuzlu tektonik göl.'},
  {id:'gol-egirdir',   isim:'Eğirdir',         kategori:'Tektonik Göller',      tip:'gol', x:36.43, y:50.47, not:'Isparta - Türkiye\'nin 2. büyük tatlı su gölü; Kovada Kanalı ile açık havzadır.'},
  {id:'gol-burdur',    isim:'Burdur',          kategori:'Tektonik Göller',      tip:'gol', x:35.06, y:55.16, not:'Burdur - Türkiye\'nin en derin göllerinden; tuzlu ve acı sulu tektonik kapalı havza.'},
  {id:'gol-kovada',    isim:'Kovada',          kategori:'Tektonik Göller',      tip:'gol', x:38.96, y:55.47, not:'Isparta - Eğirdir Gölü\'nün fazla sularıyla beslenen milli park karstik-tektonik gölü.'},
  {id:'gol-beysehir',  isim:'Beyşehir',        kategori:'Tektonik Göller',      tip:'gol', x:37.40, y:57.03, not:'Konya-Isparta - Türkiye\'nin en büyük tatlı su gölü; Çarşamba Çayı ile gideğeni vardır.'},
  {id:'gol-hazar',     isim:'Hazar',           kategori:'Tektonik Göller',      tip:'gol', x:64.55, y:48.28, not:'Elazığ - Dicle Nehri\'nin kaynağını aldığı, içinde batık şehir bulunan derin tektonik göl.'},
  {id:'gol-nazik-tek', isim:'Nazik',           kategori:'Tektonik Göller',      tip:'gol', x:67.38, y:44.22, not:'Bitlis - Ahlat yakınlarında volkanik-tektonik set karma gölü.'},
  {id:'gol-van-tek',   isim:'Van',             kategori:'Tektonik Göller',      tip:'gol', x:70.31, y:43.44, not:'Türkiye\'nin en büyük gölü - Nemrut lavlarının çukuru tıkamasıyla oluşmuş sodalı karma göl (İnci Kefali).'},
  {id:'gol-ercek-tek', isim:'Erçek',           kategori:'Tektonik Göller',      tip:'gol', x:73.34, y:47.66, not:'Van Gölü doğusunda flamingoların konakladığı sodalı karma göl.'},
  {id:'gol-aktas',     isim:'Aktaş Gölü',      kategori:'Tektonik Göller',      tip:'gol', x:70.41, y:35.16, not:'Ardahan - Yarısı Gürcistan topraklarında kalan doğal sınır tektonik gölü.'},

  // ── Volkanik Göller ─────────────────────────────────────────────────────
  {id:'gol-nemrut-v',  isim:'Nemrut Gölü',     kategori:'Volkanik Göller',      tip:'gol', x:68.95, y:62.66},
  {id:'gol-aygir',     isim:'Aygır Gölü',      kategori:'Volkanik Göller',      tip:'gol', x:71.00, y:59.38},
  {id:'gol-meke',      isim:'Meke Gölü',       kategori:'Volkanik Göller',      tip:'gol', x:44.92, y:71.25, not:'Konya / Karapınar - \'Dünyanın Nazar Boncuğu\'; ortasında koni bulunan maar gölü.'},
  {id:'gol-golcuk-isp',isim:'Gölcük (Isparta)',kategori:'Volkanik Göller',      tip:'gol', x:35.25, y:69.69, not:'Isparta - Krater çanağında oluşmuş volkanik göl ve mesire alanı.'},

  // ── Volkanik Set Gölleri ─────────────────────────────────────────────────
  {id:'gol-van-vs',    isim:'Van Gölü',        kategori:'Volkanik Set Gölleri', tip:'gol', x:74.71, y:56.09},
  {id:'gol-nazik-vs',  isim:'Nazik',           kategori:'Volkanik Set Gölleri', tip:'gol', x:71.58, y:47.97},
  {id:'gol-ercek-vs',  isim:'Erçek',           kategori:'Volkanik Set Gölleri', tip:'gol', x:76.17, y:51.41},
  {id:'gol-hacli',     isim:'Haçlı',           kategori:'Volkanik Set Gölleri', tip:'gol', x:70.12, y:51.72, not:'Muş / Bulanık - Lav setiyle oluşmuş sığ volkanik set gölü.'},
  {id:'gol-balik-vs',  isim:'Balık',           kategori:'Volkanik Set Gölleri', tip:'gol', x:74.22, y:45.31},
  {id:'gol-cildir',    isim:'Çıldır',          kategori:'Volkanik Set Gölleri', tip:'gol', x:71.97, y:38.44, not:'Ardahan-Kars - Arpaçay\'ın doğduğu, kışın buz kırılıp Eskimo usulü balık avlanan volkanik set gölü.'},

  // ── Karstik Göller ──────────────────────────────────────────────────────
  {id:'gol-avlan',     isim:'Avlan',           kategori:'Karstik Göller',       tip:'gol', x:31.25, y:62.81, not:'Antalya / Elmalı Polyesi - Karstik aşınım ve çöküntü gölü.'},
  {id:'gol-elmali',    isim:'Elmalı',          kategori:'Karstik Göller',       tip:'gol', x:30.08, y:59.69, not:'Antalya - Karstik polye tabanında oluşan göl.'},
  {id:'gol-mugren',    isim:'Müğren',          kategori:'Karstik Göller',       tip:'gol', x:28.03, y:55.31},
  {id:'gol-karagol-k', isim:'Karagöl',         kategori:'Karstik Göller',       tip:'gol', x:30.76, y:52.19},
  {id:'gol-salda',     isim:'Salda',           kategori:'Karstik Göller',       tip:'gol', x:33.98, y:53.12, not:'Burdur / Yeşilova - \'Türkiye\'nin Maldivleri\'; beyaz magnezyit kumsalları ve Mars benzeri yapısıyla karstik göl.'},
  {id:'gol-kestel',    isim:'Kestel',          kategori:'Karstik Göller',       tip:'gol', x:35.35, y:57.97, not:'Burdur - Sularını düdenlerle boşaltan karstik polye gölü.'},
  {id:'gol-sugla',     isim:'Suğla',           kategori:'Karstik Göller',       tip:'gol', x:40.43, y:57.66},
  {id:'gol-kizoren',   isim:'Kızören Obruğu',  kategori:'Karstik Göller',       tip:'gol', x:40.82, y:49.69},
  {id:'gol-cirali',    isim:'Çıralı',          kategori:'Karstik Göller',       tip:'gol', x:45.61, y:57.66},
  {id:'gol-hamam',     isim:'Hamam',           kategori:'Karstik Göller',       tip:'gol', x:45.90, y:52.81},
  {id:'gol-hafik',     isim:'Hafik',           kategori:'Karstik Göller',       tip:'gol', x:55.10, y:36.80},
  {id:'gol-lota',      isim:'Lota',            kategori:'Karstik Göller',       tip:'gol', x:57.40, y:35.20},
  {id:'gol-todurge',   isim:'Tödürge',         kategori:'Karstik Göller',       tip:'gol', x:59.50, y:37.10},

  // ── Buzul Gölleri ───────────────────────────────────────────────────────
  {id:'gol-akdag-buz',    isim:'Akdağ',           kategori:'Buzul Gölleri', tip:'gol', x:20.1, y:64.1},
  {id:'gol-bey-buz',      isim:'Bey D.',           kategori:'Buzul Gölleri', tip:'gol', x:23.5, y:64.8},
  {id:'gol-dedegol-buz',  isim:'Dedegöl D.',      kategori:'Buzul Gölleri', tip:'gol', x:24.9, y:64.1},
  {id:'gol-bolkar-buz',   isim:'Bolkar D.',        kategori:'Buzul Gölleri', tip:'gol', x:39.9, y:60.6},
  {id:'gol-aladaglarbuz', isim:'Aladağlar',        kategori:'Buzul Gölleri', tip:'gol', x:48.5, y:55.7},
  {id:'gol-nurhak-buz',   isim:'Nurhak D.',        kategori:'Buzul Gölleri', tip:'gol', x:56.5, y:56.5},
  {id:'gol-uludag-buz',   isim:'Uludağ',           kategori:'Buzul Gölleri', tip:'gol', x:24.1, y:41.8},
  {id:'gol-ilgaz-buz',    isim:'Ilgaz D.',         kategori:'Buzul Gölleri', tip:'gol', x:38.2, y:27.5},
  {id:'gol-karagold-buz', isim:'Karagöl D.',       kategori:'Buzul Gölleri', tip:'gol', x:60.1, y:40.2},
  {id:'gol-karadag-buz',  isim:'Karadağ',          kategori:'Buzul Gölleri', tip:'gol', x:62.5, y:38.9},
  {id:'gol-soganli-buz',  isim:'Soğanlı D.',       kategori:'Buzul Gölleri', tip:'gol', x:65.1, y:38.5},
  {id:'gol-esence-buz',   isim:'Esence D.',        kategori:'Buzul Gölleri', tip:'gol', x:77.1, y:55.5},
  {id:'gol-kostan-buz',   isim:'Kostan D.',        kategori:'Buzul Gölleri', tip:'gol', x:67.1, y:43.1},
  {id:'gol-rize-buz',     isim:'Rize D.',          kategori:'Buzul Gölleri', tip:'gol', x:68.1, y:36.8},
  {id:'gol-karcal-buz',   isim:'Karçal D.',        kategori:'Buzul Gölleri', tip:'gol', x:73.5, y:34.2},
  {id:'gol-mercan-buz',   isim:'Mercan D.',        kategori:'Buzul Gölleri', tip:'gol', x:62.8, y:44.9},
  {id:'gol-hel-buz',      isim:'Hel D.',           kategori:'Buzul Gölleri', tip:'gol', x:64.2, y:46.2},
  {id:'gol-mescit-buz',   isim:'Mescit D.',        kategori:'Buzul Gölleri', tip:'gol', x:76.5, y:46.8},
  {id:'gol-yalniz-buz',   isim:'Yalnızçam D.',     kategori:'Buzul Gölleri', tip:'gol', x:75.1, y:37.5},
  {id:'gol-meydan-buz',   isim:'Meydan D.',        kategori:'Buzul Gölleri', tip:'gol', x:68.5, y:49.1},
  {id:'gol-bagirpasa-buz',isim:'Bağırpaşa D.',     kategori:'Buzul Gölleri', tip:'gol', x:76.2, y:33.5},
  {id:'gol-bingol-buz',   isim:'Bingöl D.',        kategori:'Buzul Gölleri', tip:'gol', x:66.1, y:44.5},
  {id:'gol-ihtiyar-buz',  isim:'İhtiyarşahap D.',  kategori:'Buzul Gölleri', tip:'gol', x:81.2, y:57.1},
  {id:'gol-suphan-buz',   isim:'Süphan D.',        kategori:'Buzul Gölleri', tip:'gol', x:77.5, y:50.2},
  {id:'gol-karacadagi-buz',isim:'Karacadağı',      kategori:'Buzul Gölleri', tip:'gol', x:68.5, y:61.2},
  {id:'gol-buzul-buz',    isim:'Buzul D.',         kategori:'Buzul Gölleri', tip:'gol', x:83.5, y:56.8},
  {id:'gol-aruh-buz',     isim:'Aruhdağı',         kategori:'Buzul Gölleri', tip:'gol', x:79.5, y:53.1},
  {id:'gol-mor-buz',      isim:'Mor D.',           kategori:'Buzul Gölleri', tip:'gol', x:85.5, y:54.9},
  {id:'gol-ikiyaka-buz',  isim:'İkiyaka D.',       kategori:'Buzul Gölleri', tip:'gol', x:86.2, y:57.5},

  // ── Alüvyon Set Gölleri ─────────────────────────────────────────────────
  {id:'gol-koyceiz',   isim:'Köyceğiz',        kategori:'Alüvyon Set Gölleri',  tip:'gol', x:28.81, y:58.91},
  {id:'gol-bafa',      isim:'Bafa',            kategori:'Alüvyon Set Gölleri',  tip:'gol', x:23.44, y:56.72, not:'Aydın-Muğla - Büyük Menderes\'in getirdiği alüvyonların deniz körfezini tıkamasıyla oluşmuştur.'},
  {id:'gol-marmara-g', isim:'Marmara Gölü',   kategori:'Alüvyon Set Gölleri',  tip:'gol', x:28.61, y:48.59},
  {id:'gol-akgol-alu', isim:'Akgöl',           kategori:'Alüvyon Set Gölleri',  tip:'gol', x:33.20, y:35.78},
  {id:'gol-eymir',     isim:'Eymir',           kategori:'Alüvyon Set Gölleri',  tip:'gol', x:37.50, y:41.88, not:'Ankara - Mogan Gölü çıkışında alüvyon setiyle oluşmuş ODTÜ ormanı içindeki göl.'},
  {id:'gol-mogan',     isim:'Mogan',           kategori:'Alüvyon Set Gölleri',  tip:'gol', x:44.34, y:40.00, not:'Ankara / Gölbaşı - Çölova Deresi alüvyonlarının vadiyi tıkamasıyla oluşmuş göl.'},
  {id:'gol-uzungol',   isim:'Uzungöl',         kategori:'Alüvyon Set Gölleri',  tip:'gol', x:63.38, y:36.41, not:'Trabzon / Çaykara - Heyelan ve alüvyonların Haldizen Deresi\'ni kapatmasıyla oluşmuş turistik karma göl.'},

  // ── Heyelan Set Gölleri ─────────────────────────────────────────────────
  {id:'gol-yedigol',   isim:'Yedigöller',      kategori:'Heyelan Set Gölleri',  tip:'gol', x:44.73, y:34.38, not:'Bolu - Büyükgöl, Seringöl, Deringöl, Nazlıgöl vb. ardışık heyelan set göllerinden oluşan milli park.'},
  {id:'gol-sunnet',    isim:'Sünnet G.',       kategori:'Heyelan Set Gölleri',  tip:'gol', x:37.79, y:36.25, not:'Bolu / Göynük - Heyelan kütlesinin vadiyi kapatmasıyla oluşmuş doğa harikası göl.'},
  {id:'gol-abant',     isim:'Abant G.',        kategori:'Heyelan Set Gölleri',  tip:'gol', x:43.26, y:37.66, not:'Bolu - Zengin çam ve köknar ormanlarıyla çevrili meşhur heyelan set gölü.'},
  {id:'gol-suluk',     isim:'Sülük G.',        kategori:'Heyelan Set Gölleri',  tip:'gol', x:40.53, y:34.22, not:'Bolu / Mudurnu - Heyelanla sular altında kalan ağaç gövdelerinin korunduğu göl.'},
  {id:'gol-borabay',   isim:'Borabay G.',      kategori:'Heyelan Set Gölleri',  tip:'gol', x:49.80, y:37.03, not:'Amasya / Taşova - Zümrüt yeşili heyelan set gölü ve tabiat parkı.'},
  {id:'gol-zinav',     isim:'Zinav G.',        kategori:'Heyelan Set Gölleri',  tip:'gol', x:53.42, y:40.47, not:'Tokat / Reşadiye - Ormanlık vadi içinde heyelan setiyle oluşan göl.'},
  {id:'gol-sera',      isim:'Sera G.',         kategori:'Heyelan Set Gölleri',  tip:'gol', x:63.87, y:39.06, not:'Trabzon / Akçaabat - 1950\'deki büyük heyelanın dere yatağını tıkamasıyla oluşmuş genç heyelan seti gölü.'},
  {id:'gol-tortum',    isim:'Tortum G.',       kategori:'Heyelan Set Gölleri',  tip:'gol', x:70.51, y:39.06, not:'Erzurum - Heyelan kütlesinin vadiyi tıkamasıyla oluşmuştur; göl çıkışında görkemli Tortum Şelalesi bulunur.'},

  // ── Kıyı Set Gölleri ────────────────────────────────────────────────────
  {id:'gol-terkos',    isim:'Terkos',          kategori:'Kıyı Set Gölleri',    tip:'gol', x:29.00, y:34.00, not:'İstanbul / Çatalca - Karadeniz kıyısındaki koyun kumullarla kapanmasıyla oluşan Lagün (Kıyı set).'},
  {id:'gol-kcekmece',  isim:'K.Çekmece',       kategori:'Kıyı Set Gölleri',    tip:'gol', x:30.27, y:37.66, not:'İstanbul - Marmara kıyısında lagün kökenli kıyı set gölü.'},
  {id:'gol-bcekmece',  isim:'B.Çekmece',       kategori:'Kıyı Set Gölleri',    tip:'gol', x:28.32, y:37.97, not:'İstanbul - Mimar Sinan Köprüsü\'nün yer aldığı kıyı set gölü (lagün).'},
  {id:'gol-karine',    isim:'Karine G. (Dil)', kategori:'Kıyı Set Gölleri',    tip:'gol', x:27.05, y:57.03, not:'Aydın / Büyük Menderes Deltası - Deniz kulağı (lagün / kıyı seti) gölü.'},
  {id:'gol-beymelek',  isim:'Beymelek',        kategori:'Kıyı Set Gölleri',    tip:'gol', x:34.08, y:65.16, not:'Antalya / Demre - Akdeniz kıyısında lagün karakterli kıyı set gölü.'},
  {id:'gol-akgol-kiy', isim:'Akgöl',           kategori:'Kıyı Set Gölleri',    tip:'gol', x:44.24, y:65.78, not:'Mersin / Silifke - Göksu Deltası kıyı set gölü.'},
  {id:'gol-paradeniz', isim:'Paradeniz G.',    kategori:'Kıyı Set Gölleri',    tip:'gol', x:45.30, y:65.20, not:'Mersin / Göksu Deltası - Dalyan ve lagün gölü.'},
  {id:'gol-agyatan',   isim:'Ağyatan G.',      kategori:'Kıyı Set Gölleri',    tip:'gol', x:48.05, y:63.12, not:'Adana / Çukurova Deltası - Seyhan-Ceyhan nehirlerinin Akdeniz kıyısında oluşturduğu lagün.'},
  {id:'gol-akyatan',   isim:'Akyatan G.',      kategori:'Kıyı Set Gölleri',    tip:'gol', x:48.44, y:63.44, not:'Adana - Türkiye\'nin en büyük lagün gölü; kuş göç yolu üzerinde ramsar alanı.'},
  {id:'gol-gici',      isim:'Gıcı G.',         kategori:'Kıyı Set Gölleri',    tip:'gol', x:49.60, y:35.50, not:'Samsun / Kızılırmak Deltası - Kıyı seti gölü.'},
  {id:'gol-balik-kiy', isim:'Balık G.',        kategori:'Kıyı Set Gölleri',    tip:'gol', x:50.78, y:37.81, not:'Samsun / Bafra - Kızılırmak Deltası lagün gölü.'},
  {id:'gol-gernek',    isim:'Gernek G.',       kategori:'Kıyı Set Gölleri',    tip:'gol', x:51.50, y:36.20, not:'Samsun / Bafra - Kızılırmak Deltası kıyı set gölü.'},
  {id:'gol-tatli',     isim:'Tatlı G.',        kategori:'Kıyı Set Gölleri',    tip:'gol', x:52.20, y:37.00, not:'Samsun / Kızılırmak Deltası - Tatlı su lagün gölü.'},
];

const OVALAR = [
  // ── Delta Ovaları ────────────────────────────────────────────────────────
  {id:'ova-cukurova',   isim:'Çukurova',        kategori:'Delta Ovaları',          tip:'ova', x:52.0, y:73.5, not:'Adana - Seyhan ve Ceyhan nehirlerinin oluşturduğu Türkiye\'nin en büyük delta ovası; alüvyal ve en verimli tarım alanı.'},
  {id:'ova-silifke',    isim:'Silifke Ovası',   kategori:'Delta Ovaları',          tip:'ova', x:44.5, y:75.5, not:'Mersin - Göksu Nehri\'nin Akdeniz\'e döküldüğü yerde oluşturduğu verimli delta ovası.'},
  {id:'ova-bafra',      isim:'Bafra Ovası',     kategori:'Delta Ovaları',          tip:'ova', x:50.0, y:17.5, not:'Samsun - Kızılırmak\'ın Karadeniz\'e döküldüğü yerde oluşturduğu delta ovası; tütün ve pirinç tarımı.'},
  {id:'ova-carsamba',   isim:'Çarşamba Ovası',  kategori:'Delta Ovaları',          tip:'ova', x:55.5, y:20.0, not:'Samsun - Yeşilırmak\'ın Karadeniz\'e döküldüğü yerde oluşturduğu delta ovası; mısır ve fındık alanı.'},
  {id:'ova-dikili',     isim:'Dikili Ovası',    kategori:'Delta Ovaları',          tip:'ova', x:9.8,  y:46.5, not:'İzmir - Bakırçay Nehri\'nin Ege Denizi kıyısında oluşturduğu delta ovası.'},
  {id:'ova-menemen',    isim:'Menemen Ovası',   kategori:'Delta Ovaları',          tip:'ova', x:10.5, y:50.0, not:'İzmir - Gediz Nehri\'nin Ege Denizi kıyısında oluşturduğu verimli delta ovası.'},
  {id:'ova-selcuk',     isim:'Selçuk Ovası',    kategori:'Delta Ovaları',          tip:'ova', x:11.5, y:56.5, not:'İzmir - Küçük Menderes\'in oluşturduğu delta ovası; Efes antik liman kentini doldurarak içeride bırakmıştır.'},
  {id:'ova-balat',      isim:'Balat Ovası',     kategori:'Delta Ovaları',          tip:'ova', x:12.0, y:60.5, not:'Aydın - Büyük Menderes\'in oluşturduğu delta ovası; Milet antik liman kentini doldurup içeride bırakmıştır.'},
  {id:'ova-karasu',     isim:'Karasu Deltası',  kategori:'Delta Ovaları',          tip:'ova', x:27.5, y:22.0, not:'Sakarya - Sakarya Nehri\'nin Karadeniz\'e döküldüğü ağızda oluşturduğu kıyı birikim deltası.'},

  // ── Karstik Ovalar (Polye - TAKKEM) ──────────────────────────────────────
  {id:'ova-tefenni',    isim:'Tefenni Ovası',   kategori:'Karstik Ovalar (Polye)', tip:'ova', x:23.5, y:62.0, not:'Burdur (TAKKEM\'in T\'si) - Kalker çözünmesiyle oluşan karstik polye ovası.'},
  {id:'ova-acipayam',   isim:'Acıpayam Ovası',  kategori:'Karstik Ovalar (Polye)', tip:'ova', x:21.0, y:59.5, not:'Denizli (TAKKEM\'in A\'sı) - Batı Toroslar kuşağında verimli karstik polye ovası.'},
  {id:'ova-korkuteli',  isim:'Korkuteli Ovası', kategori:'Karstik Ovalar (Polye)', tip:'ova', x:25.5, y:65.0, not:'Antalya (TAKKEM\'in K\'si) - Toroslar üzerinde yer alan yüksek karstik polye ovası.'},
  {id:'ova-kestel',     isim:'Kestel Ovası',    kategori:'Karstik Ovalar (Polye)', tip:'ova', x:27.0, y:63.5, not:'Burdur (TAKKEM\'in K\'si) - Göller Yöresi\'nde yer alan karstik ova; düden ve göl çöküntüleri içerir.'},
  {id:'ova-elmali',     isim:'Elmalı Ovası',    kategori:'Karstik Ovalar (Polye)', tip:'ova', x:23.5, y:67.5, not:'Antalya (TAKKEM\'in E\'si) - Bey Dağları eteğinde kireçtaşı çözünmesiyle oluşmuş yüksek karstik polye ovası.'},
  {id:'ova-mugla',      isim:'Muğla Ovası',     kategori:'Karstik Ovalar (Polye)', tip:'ova', x:16.5, y:64.0, not:'Muğla (TAKKEM\'in M\'si) - Menteşe yöresinde kireçtaşları arasında yer alan geniş polye ovası.'},
  {id:'ova-gembos',     isim:'Gembos Ovası',    kategori:'Karstik Ovalar (Polye)', tip:'ova', x:29.5, y:65.0, not:'Antalya-Konya sınırı - Kışın göl haline gelen, yazın kuruyan tipik karstik polye tabanı.'},
  {id:'ova-celtikci',   isim:'Çeltikçi Ovası',  kategori:'Karstik Ovalar (Polye)', tip:'ova', x:26.5, y:61.5, not:'Burdur - Göller Yöresi\'nde kalker çözünmesiyle oluşmuş karstik polye ovası.'},

  // ── Tektonik Ovalar ──────────────────────────────────────────────────────
  {id:'ova-konya',      isim:'Konya Ovası',     kategori:'Tektonik Ovalar',        tip:'ova', x:37.0, y:56.0, not:'Konya - Türkiye\'nin en büyük iç tektonik ovası; eski göl tabanı ve tahıl ambarı (KOP).'},
  {id:'ova-eskisehir',  isim:'Eskişehir Ovası', kategori:'Tektonik Ovalar',        tip:'ova', x:28.5, y:36.5, not:'Eskişehir - Porsuk Çayı havzasında fay hattı kökenli çöküntü ovası.'},
  {id:'ova-bursa',      isim:'Bursa Ovası',     kategori:'Tektonik Ovalar',        tip:'ova', x:19.5, y:29.5, not:'Bursa - KAF güney kolu üzerinde verimli tarım ve sanayi ovası.'},
  {id:'ova-duzce',      isim:'Düzce Ovası',     kategori:'Tektonik Ovalar',        tip:'ova', x:29.5, y:24.5, not:'Düzce - Kuzey Anadolu Fay Hattı (KAF) üzerinde çöküntü ovası.'},
  {id:'ova-bolu',       isim:'Bolu Ovası',      kategori:'Tektonik Ovalar',        tip:'ova', x:32.5, y:26.5, not:'Bolu - KAF kuşağında dağlar arasında uzanan tektonik havza ovası.'},
  {id:'ova-erbaa-niksar',isim:'Erbaa-Niksar Ovası',kategori:'Tektonik Ovalar',     tip:'ova', x:57.5, y:28.5, not:'Tokat - Kelkit Çayı tektonik graben çöküntüsünde yer alan çok verimli KAF ovası.'},
  {id:'ova-malatya',    isim:'Malatya Ovası',   kategori:'Tektonik Ovalar',        tip:'ova', x:62.5, y:51.5, not:'Malatya - DAF kuşağında yer alan, kayısı bahçeleriyle ünlü tektonik ova.'},
  {id:'ova-elazig',     isim:'Elazığ Ovası',    kategori:'Tektonik Ovalar',        tip:'ova', x:67.0, y:49.5, not:'Elazığ - Uluova olarak da bilinen, DAF kuşağındaki verimli tektonik ova.'},
  {id:'ova-erzincan',   isim:'Erzincan Ovası',  kategori:'Tektonik Ovalar',        tip:'ova', x:68.0, y:37.5, not:'Erzincan - KAF hattında Karasu havzasında yüksek tektonik çöküntü ovası.'},
  {id:'ova-erzurum',    isim:'Erzurum Ovası',   kategori:'Tektonik Ovalar',        tip:'ova', x:77.5, y:34.0, not:'Erzurum - ~1900m yükseltide KAF-DAF kesişim kuşağındaki yüksek tektonik ova.'},
  {id:'ova-pasinler',   isim:'Pasinler Ovası',  kategori:'Tektonik Ovalar',        tip:'ova', x:80.5, y:34.5, not:'Erzurum - Aras Nehri havzasında yer alan verimli tektonik ova.'},
  {id:'ova-igdir',      isim:'Iğdır Ovası',     kategori:'Tektonik Ovalar',        tip:'ova', x:91.0, y:35.5, not:'Iğdır - Çevresine göre çukurda kalan tektonik ova; mikroklima ile pamuk yetiştirilir.'},
  {id:'ova-amik',       isim:'Amik Ovası',      kategori:'Tektonik Ovalar',        tip:'ova', x:54.0, y:73.0, not:'Hatay - Asi Nehri grabeninde yer alan çok verimli tektonik çöküntü ovası.'},
];

const PLATOLAR = [
  // ── Karstik Platolar ─────────────────────────────────────────────────────
  {id:'plato-teke',     isim:'Teke Platosu',    kategori:'Karstik Platolar',       tip:'plato', x:22.0, y:71.0, not:'Antalya/Muğla - Kalker kireçtaşı erimesiyle oluşan karstik plato; kurak yüzey, kıl keçisi ve seyrek nüfus.'},
  {id:'plato-taseli',   isim:'Taşeli Platosu',  kategori:'Karstik Platolar',       tip:'plato', x:37.0, y:73.0, not:'Mersin/Karaman - Göksu kanyonlarıyla yarılmış engebeli karstik plato; kıl keçisi ve seyrek nüfus.'},

  // ── Volkanik Platolar ────────────────────────────────────────────────────
  {id:'plato-erzurum-kars',isim:'Erzurum-Kars Platosu',kategori:'Volkanik Platolar',tip:'plato', x:82.5, y:28.5, not:'Erzurum/Kars - Lav örtülü en yüksek plato; çernezyom toprağı, yaz yağışları ve büyükbaş mera hayvancılığı.'},
  {id:'plato-ardahan',  isim:'Ardahan Platosu', kategori:'Volkanik Platolar',       tip:'plato', x:84.0, y:21.0, not:'Ardahan - Kura Nehri havzasında yer alan bazaltik lav örtülü yüksek plato.'},

  // ── Aşınım Platoları ─────────────────────────────────────────────────────
  {id:'plato-catalca-kocaeli',isim:'Çatalca-Kocaeli Platosu',kategori:'Aşınım Platoları',tip:'plato', x:22.5, y:22.0, not:'İstanbul/Kocaeli - Türkiye\'nin en alçak aşınım (peneplen) platosu; sanayi, ticaret ve nüfus yoğunluğu en yüksek olan plato.'},

  // ── Tabaka Düzlüğü Platoları ─────────────────────────────────────────────
  {id:'plato-haymana',  isim:'Haymana Platosu', kategori:'Tabaka Düzlüğü Platoları',tip:'plato', x:34.5, y:38.0, not:'Ankara - Sakarya kollarıyla yarılmış yatay duruşlu plato; tiftik keçisi ve tahıl tarımı.'},
  {id:'plato-cihanbeyli',isim:'Cihanbeyli Platosu',kategori:'Tabaka Düzlüğü Platoları',tip:'plato', x:35.0, y:49.0, not:'Konya - Tuz Gölü batısında uzanan geniş plato; Türkiye\'nin en önemli tahıl alanlarındandır.'},
  {id:'plato-obruk',    isim:'Obruk Platosu',   kategori:'Tabaka Düzlüğü Platoları',tip:'plato', x:38.0, y:55.0, not:'Konya/Aksaray - Tuz Gölü güneyinde derin karstik çöküntü kuyuları (obruklar) içeren plato; koyun yetiştiriciliği.'},
  {id:'plato-bozok',    isim:'Bozok Platosu',   kategori:'Tabaka Düzlüğü Platoları',tip:'plato', x:47.0, y:39.0, not:'Yozgat - Kızılırmak yayı içinde kalan geniş İç Anadolu platosu; tahıl ve küçükbaş hayvancılık.'},
  {id:'plato-uzunyayla',isim:'Uzunyayla Platosu',kategori:'Tabaka Düzlüğü Platoları',tip:'plato', x:58.0, y:44.0, not:'Sivas/Kayseri - Seyhan ve Fırat kolları arasında yüksek plato; at yetiştiriciliği ve Kangal köpeği yöresi.'},
  {id:'plato-yazilikaya',isim:'Yazılıkaya (Bayat) Platosu',kategori:'Tabaka Düzlüğü Platoları',tip:'plato', x:25.5, y:42.0, not:'Eskişehir/Afyon - Frig Vadisi anıtlarını içeren Ege-İç Anadolu geçiş platosu.'},
  {id:'plato-gaziantep',isim:'Gaziantep Platosu',kategori:'Tabaka Düzlüğü Platoları',tip:'plato', x:62.0, y:69.0, not:'Gaziantep - Fırat Nehri batısında uzanan plato; Antep fıstığı, zeytin ve bağcılık.'},
  {id:'plato-sanliurfa',isim:'Şanlıurfa Platosu',kategori:'Tabaka Düzlüğü Platoları',tip:'plato', x:70.0, y:67.0, not:'Şanlıurfa - GAP ile birlikte sulu tarım ve pamuk üretiminin yoğunlaştığı geniş Güneydoğu platosu.'},
  {id:'plato-diyarbakir',isim:'Diyarbakır Platosu',kategori:'Tabaka Düzlüğü Platoları',tip:'plato', x:72.0, y:58.5, not:'Diyarbakır - Dicle Nehri havzasında Karacadağ bazalt lavlarıyla kaplı geniş tabaka düzlüğü platosu.'},
];

const AKARSULAR = [
  // ── Karadeniz Akarsuları ─────────────────────────────────────────────────
  {id:'akar-kizilirmak', isim:'Kızılırmak',      kategori:'Karadeniz Akarsuları',      tip:'akarsu', x:48.0, y:32.0, not:'Sivas Kızıldağ\'dan doğar, Bafra Deltası\'ndan Karadeniz\'e dökülür. 1355 km ile Türkiye sınırları içindeki en uzun nehirdir (Hirfanlı, Kesikköprü, Altınkaya barajları).'},
  {id:'akar-yesilirmak', isim:'Yeşilırmak',      kategori:'Karadeniz Akarsuları',      tip:'akarsu', x:56.0, y:25.0, not:'Sivas-Tokat dağlarından doğar, Çarşamba Deltası\'ndan dökülür. En büyük kolu Kelkit Çayı\'dır; Almus ve Hasan Uğurlu barajları yer alır.'},
  {id:'akar-sakarya',    isim:'Sakarya Nehri',   kategori:'Karadeniz Akarsuları',      tip:'akarsu', x:28.5, y:28.0, not:'Eskişehir Çifteler\'den doğar (Porsuk ve Ankara çaylarını alır), Karasu\'dan dökülür. Türkiye\'de 4 farklı coğrafi bölgeden geçen tek nehirdir.'},
  {id:'akar-coruh',      isim:'Çoruh Nehri',     kategori:'Karadeniz Akarsuları',      tip:'akarsu', x:77.0, y:21.0, not:'Mescit Dağları\'ndan doğar, Gürcistan (Batum)\'dan Karadeniz\'e dökülür. Türkiye\'nin en hızlı akan ve en yüksek hidroelektrik potansiyelli nehirlerindendir (Yusufeli ve Deriner barajları).'},
  {id:'akar-bartin',     isim:'Bartın Çayı',     kategori:'Karadeniz Akarsuları',      tip:'akarsu', x:35.0, y:17.5, not:'Küre Dağları\'ndan doğar, Karadeniz\'e dökülür. Türkiye\'de ağız kısmında akarsu taşımacılığı (yolcu/yük) yapılabilen tek nehirdir.'},
  {id:'akar-filyos',     isim:'Yenice (Filyos) Çayı',kategori:'Karadeniz Akarsuları',  tip:'akarsu', x:34.0, y:20.5, not:'Bolu ve Karabük dağlarından doğar, Karadeniz\'e dökülür. Demir-çelik endüstrisinin su kaynağı ve Karadeniz liman vadisidir.'},

  // ── Akdeniz Akarsuları ───────────────────────────────────────────────────
  {id:'akar-seyhan',     isim:'Seyhan Nehri',    kategori:'Akdeniz Akarsuları',        tip:'akarsu', x:50.0, y:67.0, not:'Aladağlar ve Tahtalı dağlarından doğar (Zamantı ve Göksu kolları), Çukurova\'dan Akdeniz\'e dökülür. Seyhan Barajı Adana Ovası\'nı sular.'},
  {id:'akar-ceyhan',     isim:'Ceyhan Nehri',    kategori:'Akdeniz Akarsuları',        tip:'akarsu', x:55.0, y:66.0, not:'Elbistan havzasından doğar, Çukurova\'nın doğusundan İskenderun Körfezi yakınına dökülür. Menzelet ve Aslantaş barajları bulunur.'},
  {id:'akar-goksu',      isim:'Göksu Nehri',     kategori:'Akdeniz Akarsuları',        tip:'akarsu', x:42.0, y:72.0, not:'Orta Toroslar\'dan doğar, Taşeli Platosu\'nda derin kanyonlar oluşturarak Silifke Deltası\'ndan Akdeniz\'e dökülür (Mavi Tünel ile Konya Ovası\'na su aktarılır - KOP).'},
  {id:'akar-manavgat',   isim:'Manavgat Çayı',   kategori:'Akdeniz Akarsuları',        tip:'akarsu', x:33.0, y:69.0, not:'Batı Toroslar\'ın gür karstik kaynaklarıyla (Dumanlı kaynağı) beslendiği için debisi yıl boyu çok düzenlidir; Oymapınar Barajı üzerindedir.'},
  {id:'akar-duden',      isim:'Düden Çayı',      kategori:'Akdeniz Akarsuları',        tip:'akarsu', x:28.0, y:68.0, not:'Antalya karstik traverten platosundan doğar; yer altından akarak falezlerden görkemli biçimde Akdeniz\'e dökülür.'},
  {id:'akar-aksu',       isim:'Aksu Çayı',       kategori:'Akdeniz Akarsuları',        tip:'akarsu', x:30.5, y:67.5, not:'Eğirdir ve Kovada gölleri çevresinden doğar, Antalya Ovası\'ndan Akdeniz\'e dökülür. Perge antik kenti yakınından geçer.'},
  {id:'akar-dalaman',    isim:'Dalaman Çayı',    kategori:'Akdeniz Akarsuları',        tip:'akarsu', x:20.0, y:67.0, not:'Batı Toroslar ve Göller Yöresi sınırından doğar, Köyceğiz-Fethiye arasında denize dökülür; Türkiye\'nin gözde rafting nehirlerindendir.'},
  {id:'akar-asi',        isim:'Asi Nehri',       kategori:'Akdeniz Akarsuları',        tip:'akarsu', x:53.5, y:77.0, not:'Lübnan Bekaa Vadisi\'nden doğar, Suriye\'den geçerek Hatay Samandağ\'dan Akdeniz\'e dökülür. Güneyden kuzeye akışı sebebiyle \'Ters Akan Nehir\' olarak bilinir.'},

  // ── Ege ve Marmara Akarsuları ────────────────────────────────────────────
  {id:'akar-meric',      isim:'Meriç Nehri',     kategori:'Ege ve Marmara Akarsuları', tip:'akarsu', x:10.0, y:24.0, not:'Bulgaristan Rila Dağları\'ndan doğar, Türkiye-Yunanistan sınırını çizer ve Ege Denizi Saros Körfezi yakınına dökülür. En büyük kolu Ergene Çayı\'dır; taşkınlarıyla ünlüdür.'},
  {id:'akar-bakircay',   isim:'Bakırçay',        kategori:'Ege ve Marmara Akarsuları', tip:'akarsu', x:12.0, y:45.0, not:'Manisa dağlarından doğar, Soma ve Kınık grabeninden geçerek Çandarlı Körfezi (Dikili)\'nden Ege Denizi\'ne dökülür.'},
  {id:'akar-gediz',      isim:'Gediz Nehri',     kategori:'Ege ve Marmara Akarsuları', tip:'akarsu', x:15.0, y:48.0, not:'Murat Dağı\'ndan doğar, Uşak ve Manisa grabenlerini sulayarak İzmir Foça (Menemen Deltası)\'ndan dökülür. Demirköprü Barajı üzerindedir.'},
  {id:'akar-kucukmenderes',isim:'Küçük Menderes',kategori:'Ege ve Marmara Akarsuları', tip:'akarsu', x:14.0, y:53.5, not:'Bozdağlar\'dan doğar, Ödemiş ve Tire ovalarından geçerek Efes limanını dolduran Selçuk Deltası\'ndan denize dökülür.'},
  {id:'akar-buyukmenderes',isim:'Büyük Menderes',kategori:'Ege ve Marmara Akarsuları', tip:'akarsu', x:16.5, y:58.0, not:'Afyon Dinar\'dan doğar. Türkiye\'nin en tipik ve en çok menderes çizen nehridir; Milet limanını dolduran Balat Deltası\'ndan Ege\'ye dökülür.'},
  {id:'akar-susurluk',   isim:'Susurluk Çayı',   kategori:'Ege ve Marmara Akarsuları', tip:'akarsu', x:19.5, y:35.0, not:'İç Batı Anadolu\'dan doğar (Simav Çayı ve Nilüfer Çayı kollarını alır), Marmara Denizi\'ne dökülür. Marmara Denizi havzasının en büyük akarsuyudur.'},

  // ── Basra ve Hazar Akarsuları ────────────────────────────────────────────
  {id:'akar-firat',      isim:'Fırat Nehri',     kategori:'Basra ve Hazar Akarsuları', tip:'akarsu', x:64.0, y:57.0, not:'Karasu ve Murat nehirlerinin birleşmesiyle oluşur; Türkiye\'nin su taşıma ve enerji potansiyeli en yüksek nehridir. Atatürk, Keban ve Karakaya barajları üzerindedir; Basra Körfezi\'ne dökülür.'},
  {id:'akar-dicle',      isim:'Dicle Nehri',     kategori:'Basra ve Hazar Akarsuları', tip:'akarsu', x:72.0, y:56.0, not:'Hazar Gölü yakınlarından doğar, Güneydoğu Torosları aşarak Irak topraklarına geçer; Şattülarap\'ta Fırat ile birleşerek Basra Körfezi\'ne dökülür (Ilısu ve Kralkızı barajları).'},
  {id:'akar-zap',        isim:'Zap Suyu',        kategori:'Basra ve Hazar Akarsuları', tip:'akarsu', x:88.0, y:60.0, not:'Hakkari Cilo Dağları\'ndan doğan, Türkiye\'nin en dik ve en hırçın akan akarsularından biridir; sınır ötesinde Dicle Nehri\'ne katılır.'},
  {id:'akar-aras',       isim:'Aras Nehri',      kategori:'Basra ve Hazar Akarsuları', tip:'akarsu', x:85.0, y:35.0, not:'Bingöl Dağları\'ndan doğar; Ermenistan, Azerbaycan ve İran ile doğal sınır oluşturur. Kura Nehri ile birleşerek Hazar Denizi\'ne dökülür (Kapalı Havza).'},
  {id:'akar-kura',       isim:'Kura Nehri',      kategori:'Basra ve Hazar Akarsuları', tip:'akarsu', x:83.0, y:23.0, not:'Ardahan Allahuekber Dağları\'ndan doğar, Gürcistan ve Azerbaycan\'a geçerek Aras ile birleşip Hazar Denizi\'ne dökülür (Kapalı Havza).'},
];

const GECITLER = [
  // ── Karadeniz Geçitleri ──────────────────────────────────────────────────
  {id:'gecit-zigana',    isim:'Zigana (Kalkanlı) Geçidi',kategori:'Karadeniz Geçitleri',tip:'gecit', x:69.5, y:27.5, not:'Trabzon - Gümüşhane arasında yer alır. Doğu Karadeniz kıyısını İç Anadolu ve Doğu Anadolu\'ya bağlayan tarihi İpek Yolu geçididir.'},
  {id:'gecit-kop',       isim:'Kop Geçidi',             kategori:'Karadeniz Geçitleri',tip:'gecit', x:73.0, y:32.0, not:'Bayburt - Erzurum arasında Kop Dağları üzerinde yer alır. Karadeniz limanlarını Doğu Anadolu ve İran transit yoluna bağlar.'},
  {id:'gecit-ovit',      isim:'Ovit Geçidi',            kategori:'Karadeniz Geçitleri',tip:'gecit', x:76.0, y:26.0, not:'Rize (İkizdere) - Erzurum (İspir) arasında Kaçkar dağları kuşağında yer alır; üzerinde Türkiye\'nin en uzun tünellerinden Ovit Tüneli bulunur.'},
  {id:'gecit-ilgaz',     isim:'Ilgaz Geçidi',           kategori:'Karadeniz Geçitleri',tip:'gecit', x:40.5, y:24.5, not:'Kastamonu - Çankırı arasında Ilgaz Dağları üzerinde uzanır; Batı Karadeniz kıyı kuşağını İç Anadolu\'ya bağlar.'},
  {id:'gecit-ecevit',    isim:'Ecevit Geçidi',          kategori:'Karadeniz Geçitleri',tip:'gecit', x:38.0, y:18.5, not:'İnebolu limanını Kastamonu iç kesimine bağlayan Küre Dağları üzerindeki tarihi İstiklal Yolu geçididir.'},
  {id:'gecit-cankurtaran',isim:'Cankurtaran Geçidi',    kategori:'Karadeniz Geçitleri',tip:'gecit', x:79.5, y:19.5, not:'Artvin Hopa ile Borçka arasında uzanır; Karadeniz sahilini Çoruh vadisine ve Kafkaslara bağlar.'},

  // ── Akdeniz Geçitleri ────────────────────────────────────────────────────
  {id:'gecit-cubuk',     isim:'Çubuk Boğazı',           kategori:'Akdeniz Geçitleri',  tip:'gecit', x:27.5, y:64.0, not:'Antalya\'yı Burdur ve Göller Yöresi\'ne bağlayan, Batı Toroslar üzerindeki doğal boğaz ve geçittir.'},
  {id:'gecit-sertavul',  isim:'Sertavul Geçidi',        kategori:'Akdeniz Geçitleri',  tip:'gecit', x:39.5, y:70.0, not:'Mersin (Silifke) ile Karaman arasında Orta Toroslar üzerinde yer alır; Akdeniz kıyısını İç Anadolu düzlüklerine bağlar.'},
  {id:'gecit-gulek',     isim:'Gülek Boğazı',           kategori:'Akdeniz Geçitleri',  tip:'gecit', x:47.0, y:68.0, not:'Adana (Çukurova)\'yı Pozantı ve Niğde üzerinden İç Anadolu\'ya bağlayan tarihi Kilikya Kapısı; Akdeniz\'in en işlek geçididir.'},
  {id:'gecit-belen',     isim:'Belen Geçidi',           kategori:'Akdeniz Geçitleri',  tip:'gecit', x:54.0, y:71.5, not:'İskenderun Körfezi kıyısını Amanos Dağları üzerinden Antakya ve Amik Ovası\'na (Suriye kapısına) bağlayan stratejik geçittir.'},
];

const ALL_ITEMS = [...DAGLAR, ...GOLLER, ...OVALAR, ...PLATOLAR, ...AKARSULAR, ...GECITLER];

const ALL_KATEGORILER = [
  // Dağlar
  {
    id:'Kıvrımlı Dağlar', tip:'dag', renk:'#e74c3c',
    kodlama: 'Kuzeyde Karadeniz Dağları (Kaçkar, Canik, Küre, Ilgaz), Güneyde Toros Dağları (Bey, Geyik, Bolkar, Aladağlar) ve Hakkari Cilo Dağları.',
  },
  {
    id:'Kırıklı Dağlar', tip:'dag', renk:'#e67e22',
    kodlama: 'Şifre: KAZ MA YUNT BOZ AYDIN MENTEŞE ➔ Kuzeyden güneye Ege horstları: Kaz Dağı, Madra Dağı, Yunt Dağı, Bozdağlar, Aydın Dağları, Menteşe Dağları.',
  },
  {
    id:'Volkanik Dağlar', tip:'dag', renk:'#9b59b6',
    kodlama: 'İç Anadolu: KEK-HM (Karadağ, Karacadağ, Erciyes, Hasandağı, Melendiz) | Doğu Anadolu: SANAT (Süphan, Nemrut, Ağrı, Tendürek) | G.Doğu: Karacadağ (Kalkan volkan).',
  },
  // Göller
  {
    id:'Tektonik Göller', tip:'gol', renk:'#3498db',
    kodlama: 'Şifre: BASİT MUHASEBE / KUTSAL BİSİKLET ➔ Manyas, Ulubat, Sapanca, İznik, Tuz, Eğirdir, Burdur, Beyşehir, Akşehir, Eber, Hazar, Seyfe, Ilgın vb.',
    facts: [
      { s: "Manyas Gölü'nün diğer adı nedir?", c: "Kuş Cenneti (Balıkesir)" },
      { s: "Yıl içinde kapladığı alan en fazla değişen göl hangisidir?", c: "Tuz Gölü" },
      { s: "Beyşehir, Eğirdir ve Kovada göllerinin suyu nasıldır?", c: "Tatlı" },
      { s: "Beyşehir, Eğirdir ve Kovada gölleri neden açık havza özelliği gösterir?", c: "Sularını denize kadar ulaştırdıkları için" },
      { s: "Aktaş Gölü hangi ülkeyle doğal sınır oluşturur?", c: "Gürcistan" },
      { s: "Türkiye'nin en büyük gölü hangisidir?", c: "Van Gölü" },
      { s: "Van Gölü'nün suyu nasıldır?", c: "Sodalı" },
      { s: "Van Gölü üzerinde hangi tarihi yapı bulunur?", c: "Akdamar Kilisesi" },
      { s: "Türkiye'nin en büyük tatlı su rezervi hangi göldedir?", c: "Beyşehir Gölü" },
    ]
  },
  {
    id:'Volkanik Göller', tip:'gol', renk:'#e74c3c',
    kodlama: 'Nemrut (Kaldera - Bitlis), Meke (Dünyanın Nazar Boncuğu, Maar - Konya), Gölcük (Maar - Isparta), Acıgöl (Maar).',
    facts: [
      { s: "Nemrut Gölü hangi dağın üzerinde yer alır?", c: "Nemrut Volkan Dağı" },
      { s: "Nemrut Gölü hangi ilde yer alır?", c: "Bitlis" },
      { s: "Nemrut Gölü ne tip bir göldür?", c: "Kaldera gölü" },
      { s: "Milli park olan Nemrut hangi ildedir?", c: "Adıyaman" },
      { s: "Meke Gölü nasıl bir benzetmeyle anılır?", c: "Dünyanın nazar boncuğu" },
      { s: "Meke Gölü hangi il sınırları içindedir?", c: "Konya" },
      { s: "Meke Gölü ne tip bir göldür?", c: "Maar gölü" },
    ]
  },
  {
    id:'Volkanik Set Gölleri', tip:'gol', renk:'#9b59b6',
    kodlama: 'Şifre: ERÇEK\'Lİ NAZİK VANLI BALIKÇI ÇILDIRDI ➔ Erçek, Nazik, Van, Balık, Çıldır, Haçlı (Lavların vadi önünü tıkamasıyla oluşur - Doğu Anadolu).',
    facts: [
      { s: "Van, Nazik ve Erçek gölleri hangi iki göl tipinin özelliğini birden gösterir?", c: "Volkanik set ve tektonik göl" },
      { s: "Çıldır Gölü'nden çıkan nehrin adı nedir?", c: "Arpaçay" },
      { s: "Arpaçay hangi ülkeyle sınır oluşturur?", c: "Ermenistan" },
    ]
  },
  {
    id:'Karstik Göller', tip:'gol', renk:'#f39c12',
    kodlama: 'Şifre: SAKE / KAKES ➔ Salda, Avlan, Kestel, Elmalı, Kızılören (Kalker/kireçtaşı erimesiyle oluşan göller - Akdeniz/Teke-Taşeli).',
    facts: [
      { s: "Türkiye'nin Maldivleri olarak anılan göl hangisidir?", c: "Salda Gölü" },
      { s: "Salda Gölü'nün yüzey yapısı hangi gezegendeki göle benzetilir?", c: "Mars" },
      { s: "Salda Gölü hangi il sınırları içindedir?", c: "Burdur" },
    ]
  },
  {
    id:'Buzul Gölleri', tip:'gol', renk:'#85c1e9',
    kodlama: 'Yüksek dağ zirvelerindeki sirk çanaklarında: Kaçkar, Cilo (Buzul), Bolkar, Aladağlar, Mercan, Ağrı ve Uludağ (kalıntı iz).',
    facts: []
  },
  {
    id:'Alüvyon Set Gölleri', tip:'gol', renk:'#27ae60',
    kodlama: 'Şifre: BAMYAM ➔ Bafa (Çamiçi), Akgöl, Marmara, Köyceğiz, Eymir, Mogan (Akarsuların taşıdığı alüvyonlarla önünü kapatması).',
    facts: [
      { s: "Bafa Gölü'nün diğer adı nedir?", c: "Çamiçi Gölü" },
      { s: "Marmara Gölü hangi bölgede yer alır?", c: "Ege Bölgesi" },
      { s: "Uzungöl hangi iki göl tipinin özelliğini birden gösterir?", c: "Alüvyon set ve heyelan set" },
    ]
  },
  {
    id:'Heyelan Set Gölleri', tip:'gol', renk:'#795548',
    kodlama: 'Şifre: UYSAL TEYZE B / BAZİST ➔ Uzungöl, Yedigöller, Sünnet, Abant, Zinav, Tortum, Sera, Borabay (En fazla Karadeniz Bölgesi).',
    facts: [
      { s: "Heyelan set gölleri Türkiye'de en çok hangi bölgede görülür?", c: "Karadeniz Bölgesi" },
    ]
  },
  {
    id:'Kıyı Set Gölleri', tip:'gol', renk:'#00bcd4',
    kodlama: 'Şifre: BÜYÜK KÜÇÜK TERKOS\'TA DİL ÇIKARDI ➔ Büyükçekmece, Küçükçekmece, Terkos (Durusu), Karine (Dil), Akyatan, Ağyatan (Lagün / Kıyı oku birikimi).',
    facts: [
      { s: "Terkos (Durusu) Gölü'nün önemi nedir?", c: "İstanbul'un Avrupa yakasının su ihtiyacını karşılar" },
      { s: "Kıyı set göllerinin varlığı neyin kanıtıdır?", c: "O alanda dalga biriktirmesi olduğunun" },
      { s: "Kıyı set gölleri hangi dalga biriktirme şekline örnektir?", c: "Lagün" },
    ]
  },
  // ── Ovalar ─────────────────────────────────────────────────────────────
  {
    id: 'Delta Ovaları', tip: 'ova', renk: '#27ae60',
    kodlama: 'Akarsuların taşıdığı alüvyonları denize döküldüğü kıyıda biriktirmesiyle oluşur. Şartlar: Kıta sahanlığı geniş, kıyıda dalga ve gelgit akıntısı az, akarsu bol alüvyon taşımalı. Karadeniz: Bafra (Kızılırmak), Çarşamba (Yeşilırmak). Akdeniz: Çukurova (Seyhan-Ceyhan - En büyük delta), Silifke (Göksu). Ege: Dikili (Bakırçay), Menemen (Gediz), Selçuk (Küçük Menderes), Balat (Büyük Menderes). Marmara: Karasu Deltası.',
    facts: [
      { s: "Türkiye'nin yüzölçümü en büyük delta ovası hangisidir?", c: "Çukurova (Adana - Seyhan ve Ceyhan nehirleri)" },
      { s: "Silifke Delta Ovası hangi akarsuyun getirdiği alüvyonlarla oluşmuştur?", c: "Göksu Nehri" },
      { s: "Kızılırmak'ın Karadeniz'e döküldüğü yerde oluşan delta ovası hangisidir?", c: "Bafra Ovası (Samsun)" },
      { s: "Yeşilırmak'ın Karadeniz'e döküldüğü yerde oluşan delta ovası hangisidir?", c: "Çarşamba Ovası (Samsun)" },
      { s: "Efes antik liman şehrinin denizle bağlantısını kesen delta ovası hangisidir?", c: "Selçuk Ovası (Küçük Menderes)" },
      { s: "Milet antik liman şehrini doldurarak kıyıdan uzaklaştıran ova hangisidir?", c: "Balat Ovası (Büyük Menderes)" },
      { s: "Karadeniz'de delta oluşumuna olanak sağlayan dağ sırası hangisidir?", c: "Canik Dağları (Yükseltisi az ve kıyı gerisinde uzandığı için)" },
    ]
  },
  {
    id: 'Karstik Ovalar (Polye)', tip: 'ova', renk: '#e67e22',
    kodlama: 'Şifre: TAKKEM (veya TAKKECİM) ➔ Tefenni, Acıpayam, Korkuteli, Kestel, Elmalı, Muğla (ayrıca Çeltikçi, Gembos). Kalker/kireçtaşı ve karstik arazilerin erimesiyle oluşan geniş polye çukurluklarıdır. Kırmızı Akdeniz toprağı (terra-rossa) yaygındır.',
    facts: [
      { s: "Karstik ovaların (polye) en yaygın görüldüğü coğrafi bölge neresidir?", c: "Akdeniz Bölgesi (Teke ve Göller Yöresi)" },
      { s: "TAKKEM şifresindeki karstik ovalar hangileridir?", c: "Tefenni, Acıpayam, Korkuteli, Kestel, Elmalı, Muğla" },
      { s: "Karstik ovalarda yaygın olarak görülen verimli kırmızı toprak türü nedir?", c: "Terra-Rossa (Kırmızı Akdeniz Toprağı)" },
      { s: "Muğla Ovası jeolojik oluşum bakımından ne tür bir ovadır?", c: "Karstik ova (Polye)" },
    ]
  },
  {
    id: 'Tektonik Ovalar', tip: 'ova', renk: '#d35400',
    kodlama: 'Fay hatları ve kırık kuşakları (KAF, DAF, BAF) boyunca meydana gelen tektonik çökmelerle oluşur. Türkiye\'de en fazla bulunan ova türüdür. Önemli tektonik ovalar: Konya, Eskişehir, Bursa, Düzce, Bolu, Erbaa-Niksar, Malatya, Elazığ, Erzincan, Erzurum, Pasinler, Iğdır, Amik.',
    facts: [
      { s: "Türkiye'nin yüzölçümü bakımından en büyük iç tektonik ovası hangisidir?", c: "Konya Ovası" },
      { s: "Doğu Anadolu'da yer almasına rağmen mikroklima özelliğiyle pamuk yetiştirilen tektonik ova hangisidir?", c: "Iğdır Ovası" },
      { s: "Amik Ovası hangi vadi ve graben kırık kuşağında yer alır?", c: "Asi Nehri Vadisi / Rift graben kuşağı (Hatay)" },
      { s: "Türkiye'de sayıca en yaygın görülen ova oluşum türü hangisidir?", c: "Tektonik ovalar (Fay ve deprem kuşakları)" },
    ]
  },
  // ── Platolar ────────────────────────────────────────────────────────────
  {
    id: 'Karstik Platolar', tip: 'plato', renk: '#16a085',
    kodlama: 'Kalker (kireçtaşı) arazilerin akarsular tarafından derin biçimde yarılmasıyla oluşmuştur. Akdeniz kuşağında: Teke Platosu ve Taşeli Platosu. Sular yer altına sızdığı için yüzey suları azdır; tarım zor, nüfus seyrek ve kıl keçisi yetiştiriciliği yaygındır.',
    facts: [
      { s: "Türkiye'nin başlıca karstik platoları hangileridir?", c: "Teke Platosu ve Taşeli Platosu (Akdeniz)" },
      { s: "Teke ve Taşeli platolarında nüfusun seyrek olmasının temel sebebi nedir?", c: "Kalkerli yapının suyu alta sızdırması (yüzey kuraklığı) ve engebeli arazi" },
      { s: "Teke ve Taşeli platolarında yapılan geleneksel hayvancılık faaliyeti nedir?", c: "Kıl keçisi yetiştiriciliği" },
    ]
  },
  {
    id: 'Volkanik Platolar', tip: 'plato', renk: '#8e44ad',
    kodlama: 'Lavların geniş alanlara yayılıp akarsular tarafından yarılmasıyla oluşur: Erzurum-Kars Platosu ve Ardahan Platosu. Türkiye\'nin en yüksek platolarıdır. Yaz yağışları görülür; gür çayırlar altında verimli Çernezyom (kara toprak) bulunur ve büyükbaş mera hayvancılığı yapılır.',
    facts: [
      { s: "Türkiye'nin en yüksek ve en soğuk platosu hangisidir?", c: "Erzurum-Kars Platosu" },
      { s: "Erzurum-Kars platosunda yaz yağışlarına bağlı oluşan en verimli zonal toprak hangisidir?", c: "Çernezyom (Kara Toprak)" },
      { s: "Erzurum-Kars ve Ardahan platolarında gür dağ çayırları sayesinde gelişen ekonomik faaliyet nedir?", c: "Büyükbaş mera hayvancılığı" },
    ]
  },
  {
    id: 'Aşınım Platoları', tip: 'plato', renk: '#2980b9',
    kodlama: 'Eski dağlık kütlelerin dış kuvvetlerce aşındırılarak deniz seviyesine yakın hafif dalgalı düzlük (peneplen) haline gelmesi ve sonradan yükselmesiyle oluşur: Çatalca-Kocaeli Platosu. Türkiye\'nin en alçak platosudur. Sanayi, ticaret, ulaşım ve nüfus yoğunluğu zirvededir.',
    facts: [
      { s: "Türkiye'nin ortalama yükseltisi en az (en alçak) platosu hangisidir?", c: "Çatalca-Kocaeli Platosu" },
      { s: "Türkiye'de nüfus, sanayi, ticaret ve ulaşım yoğunluğunun en fazla olduğu plato hangisidir?", c: "Çatalca-Kocaeli Platosu" },
      { s: "Çatalca-Kocaeli Platosu jeolojik köken olarak ne tip bir platodur?", c: "Aşınım (Peneplen) platosu" },
    ]
  },
  {
    id: 'Tabaka Düzlüğü Platoları', tip: 'plato', renk: '#c0392b',
    kodlama: 'Yatay duruşlu tortul tabakaların derin akarsu vadileri tarafından yarılmasıyla oluşmuştur (Yatay Duruşlu Platolar). İç Anadolu: Haymana (Tiftik keçisi), Cihanbeyli (Tahıl ambarı), Obruk (Karstik obruk kuyuları), Bozok (Yozgat), Uzunyayla (Sivas-Kayseri), Yazılıkaya. Güneydoğu Anadolu: Gaziantep, Şanlıurfa (GAP tarımı), Diyarbakır.',
    facts: [
      { s: "İç Anadolu ve Güneydoğu Anadolu'daki platoların büyük çoğunluğu oluşum bakımından hangi gruba girer?", c: "Tabaka Düzlüğü (Yatay Duruşlu) Platolar" },
      { s: "Ankara çevresinde Tiftik Keçisi (Angora) yetiştiriciliğiyle öne çıkan plato hangisidir?", c: "Haymana Platosu" },
      { s: "Tuz Gölü güneyinde derin çöküntü kuyularıyla ünlü tabaka düzlüğü platosu hangisidir?", c: "Obruk Platosu" },
      { s: "GAP sulama projeleriyle birlikte pamuk ve tarım üretiminin hızla arttığı plato hangisidir?", c: "Şanlıurfa Platosu" },
      { s: "Sivas ve Kayseri arasında yer alan, at yetiştiriciliği ve Kangal köpeğiyle bilinen plato hangisidir?", c: "Uzunyayla Platosu" },
    ]
  },
  // ── Akarsular ───────────────────────────────────────────────────────────
  {
    id: 'Karadeniz Akarsuları', tip: 'akarsu', renk: '#0ea5e9',
    kodlama: 'Kızılırmak (Türkiye sınırları içindeki en uzun nehir - 1355 km), Yeşilırmak (Kelkit kolu), Sakarya (4 bölgeden geçen nehir), Çoruh (En hızlı akan, rafting, Gürcistan\'dan dökülür), Bartın Çayı (Ulaşıma elverişli tek nehir), Yenice/Filyos.',
    facts: [
      { s: "Türkiye sınırları içinde doğup yine Türkiye sınırları içinde denize dökülen en uzun nehir hangisidir?", c: "Kızılırmak (1355 km)" },
      { s: "Türkiye'de üzerinde deniz ulaşımı ve taşımacılığı yapılabilen tek akarsu hangisidir?", c: "Bartın Çayı" },
      { s: "Türkiye'nin akış hızı ve debisi en yüksek rafting nehirlerinden biri olan Çoruh Nehri nereye dökülür?", c: "Gürcistan (Batum) üzerinden Karadeniz'e" },
      { s: "Türkiye'de 4 farklı coğrafi bölgeden geçen tek akarsu hangisidir?", c: "Sakarya Nehri" },
      { s: "Yeşilırmak Nehri'nin en büyük kolu hangisidir?", c: "Kelkit Çayı" },
    ]
  },
  {
    id: 'Akdeniz Akarsuları', tip: 'akarsu', renk: '#0284c7',
    kodlama: 'Seyhan ve Ceyhan (Çukurova\'yı oluşturur), Göksu (Taşeli\'ni yarar, Mavi Tünel), Manavgat (Karstik Dumanlı kaynağıyla yıl boyu en düzenli rejim), Düden, Aksu, Dalaman, Asi (Lübnan\'dan doğar, ters akar).',
    facts: [
      { s: "Gür karstik kaynaklarla beslendiği için Akdeniz iklimine rağmen rejimi en düzenli olan akarsulardan biri hangisidir?", c: "Manavgat Çayı" },
      { s: "Lübnan Bekaa Vadisi'nden doğup güneyden kuzeye akarak Hatay'dan denize dökülen ters akışlı nehir hangisidir?", c: "Asi Nehri" },
      { s: "Mavi Tünel projesi ile suları Konya Ovası'na (KOP) aktarılan Toros nehri hangisidir?", c: "Göksu Nehri" },
      { s: "Türkiye'nin en büyük delta ovası olan Çukurova'yı hangi iki akarsu oluşturmuştur?", c: "Seyhan ve Ceyhan nehirleri" },
    ]
  },
  {
    id: 'Ege ve Marmara Akarsuları', tip: 'akarsu', renk: '#0369a1',
    kodlama: 'Meriç (Bulgaristan\'dan doğar, sınır çizer, taşkın yapar), Bakırçay, Gediz, Küçük Menderes, Büyük Menderes (En fazla menderes çizen ve en uzun Ege nehri), Susurluk (Marmara havzasının en büyüğü).',
    facts: [
      { s: "Bulgaristan'dan doğup Türkiye-Yunanistan sınırının bir kısmını oluşturan nehir hangisidir?", c: "Meriç Nehri" },
      { s: "Ege Bölgesi'nde grabenler içinde kıvrımlar yaparak en fazla menderes çizen nehir hangisidir?", c: "Büyük Menderes" },
      { s: "Marmara Denizi'ne dökülen en büyük akarsu hangisidir?", c: "Susurluk Çayı" },
      { s: "Ege akarsularının hidroelektrik enerji potansiyeli neden düşüktür?", c: "Yatak eğimleri az ve taban seviyesine yakın aktıkları için" },
    ]
  },
  {
    id: 'Basra ve Hazar Akarsuları', tip: 'akarsu', renk: '#075985',
    kodlama: 'Basra\'ya gidenler (Açık Havza): Fırat (En yüksek su miktarı ve enerji - Keban, Atatürk barajları), Dicle (Ilısu Barajı), Zap Suyu. Hazar\'a gidenler (Kapalı Havza): Aras (Sınır çizer), Kura.',
    facts: [
      { s: "Türkiye'nin su taşıma kapasitesi ve hidroelektrik enerji potansiyeli en yüksek nehri hangisidir?", c: "Fırat Nehri" },
      { s: "Fırat ve Dicle nehirleri nerede birleşerek Basra Körfezi'ne dökülür?", c: "Şattülarap bölgesinde" },
      { s: "Türkiye'den doğup Ermenistan, Azerbaycan ve İran ile doğal sınır oluşturan akarsu hangisidir?", c: "Aras Nehri" },
      { s: "Aras ve Kura nehirleri hangi kapalı havzaya dökülür?", c: "Hazar Denizi Kapalı Havzası" },
      { s: "Hakkari Cilo Dağları'ndan doğup sınır ötesinde Dicle'ye katılan hırçın akarsu hangisidir?", c: "Zap Suyu" },
    ]
  },
  // ── Geçitler ────────────────────────────────────────────────────────────
  {
    id: 'Karadeniz Geçitleri', tip: 'gecit', renk: '#f59e0b',
    kodlama: 'Şifre: ZİK-O-E / Karadeniz Kapıları ➔ Zigana (Kalkanlı / Trabzon-Gümüşhane), Kop (Bayburt-Erzurum), Ovit (Rize-Erzurum), Ilgaz (Kastamonu-Çankırı), Ecevit (İnebolu-Kastamonu), Cankurtaran (Hopa-Borçka).',
    facts: [
      { s: "Trabzon limanını Gümüşhane üzerinden İç ve Doğu Anadolu'ya bağlayan tarihi İpek Yolu geçidi hangisidir?", c: "Zigana (Kalkanlı) Geçidi" },
      { s: "Rize ile Erzurum arasında yer alan ve üzerinde Türkiye'nin en uzun tünellerinden birinin bulunduğu geçit hangisidir?", c: "Ovit Geçidi" },
      { s: "Bayburt'u Erzurum'a ve İran transit ticaret yoluna bağlayan Karadeniz geçidi hangisidir?", c: "Kop Geçidi" },
      { s: "Kastamonu'yu Çankırı ve İç Anadolu'ya bağlayan geçit hangisidir?", c: "Ilgaz Geçidi" },
      { s: "Kurtuluş Savaşı'nda silah taşınan tarihi İstiklal Yolu üzerindeki İnebolu-Kastamonu geçidi hangisidir?", c: "Ecevit Geçidi" },
    ]
  },
  {
    id: 'Akdeniz Geçitleri', tip: 'gecit', renk: '#d97706',
    kodlama: 'Şifre: ÇOK SAYIDA GÜLEK BELEN / Ç-S-G-B ➔ Çubuk (Antalya-Burdur), Sertavul (Mersin/Silifke-Karaman), Gülek (Adana-İç Anadolu/Pozantı - En işlek), Belen (İskenderun-Hatay/Amik).',
    facts: [
      { s: "Adana ve Çukurova'yı Pozantı üzerinden İç Anadolu'ya bağlayan en işlek Toros geçidi hangisidir?", c: "Gülek Boğazı (Kilikya Kapısı)" },
      { s: "Antalya'yı Burdur ve Göller Yöresi'ne bağlayan Akdeniz geçidi hangisidir?", c: "Çubuk Boğazı" },
      { s: "Silifke ve Mersin'i Karaman ve Konya düzlüklerine bağlayan geçit hangisidir?", c: "Sertavul Geçidi" },
      { s: "İskenderun Limanı'nı Amanos Dağları üzerinden Antakya ve Suriye kapısına bağlayan geçit hangisidir?", c: "Belen Geçidi" },
    ]
  },
];

const CATEGORIES = ALL_KATEGORILER;
