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

const ALL_ITEMS = [...DAGLAR, ...GOLLER];

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
];

const CATEGORIES = ALL_KATEGORILER;
