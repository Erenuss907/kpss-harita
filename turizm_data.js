'use strict';
// turizm_data.js - KPSS Turizm Soru Bankasi
// { s: "soru", o: ["A","B","C","D"], d: dogru_indeks, a: "aciklama" }
const TURIZM_SORULAR = [
  // MARMARA
  { s: "Selimiye Camii hangi ilde bulunur?", o: ["Edirne","Bursa","Kocaeli","Tekirdağ"], d: 0, a: "Selimiye Camii Edirne'dedir. Mimar Sinan'ın baş eseri olup UNESCO Dünya Mirası Listesi'ndedir." },
  { s: "Manyaş Kuş Cenneti Milli Parkı hangi ile bağlıdır?", o: ["Çanakkale","Bursa","Balıkesir","Edirne"], d: 2, a: "Manyaş Kuş Cenneti Balıkesir iline bağlı Manyas ilçesindedir." },
  { s: "Troya Antik Kenti hangi ilde bulunur?", o: ["Bursa","İzmir","Çanakkale","Balıkesir"], d: 2, a: "Troya, Çanakkale iline bağlı Tevfikiye köyünde yer alır. UNESCO Dünya Mirası Listesi'ndedir." },
  { s: "Gelibolu Yarımadası Tarihi Milli Parkı hangi ilde bulunur?", o: ["Edirne","Tekirdağ","İstanbul","Çanakkale"], d: 3, a: "Gelibolu Milli Parkı Çanakkale iline bağlıdır. Çanakkale Savaşları anıtlarını barındırır." },
  { s: "Cumalıkızık Köyü hangi ilde bulunur?", o: ["Balıkesir","Edirne","Bursa","Sakarya"], d: 2, a: "Cumalıkızık, Bursa iline bağlı tarihi bir Osmanlı köyüdür. Bursa ve Cumalıkızık birlikte UNESCO listesindedir." },
  { s: "Uludağ Milli Parkı hangi ilde bulunur?", o: ["Kocaeli","Balıkesir","Çanakkale","Bursa"], d: 3, a: "Uludağ, Bursa iline bağlıdır. Hem kayak turizmi hem ekoturizm açısından önemlidir." },
  { s: "Ulucami (Bursa Ulu Camii) hangi ilde bulunur?", o: ["Edirne","Konya","Bursa","İstanbul"], d: 2, a: "Ulucami (Bursa Ulu Camii), Bursa iline bağlıdır. 1396-1399 yılları arasında Yıldırım Bayezid tarafından yaptırılmıştır." },
  // EGE
  { s: "Efes Antik Kenti hangi ilde bulunur?", o: ["Aydın","Muğla","Denizli","İzmir"], d: 3, a: "Efes, İzmir iline bağlı Selçuk ilçesindedir. UNESCO Dünya Mirası Listesi'ndedir." },
  { s: "Meryem Ana Evi (Meryemana) hangi ilde bulunur?", o: ["Aydın","Muğla","İzmir","Denizli"], d: 2, a: "Meryem Ana Evi, İzmir iline bağlı Selçuk ilçesindedir. Hz. Meryem'in son yıllarını geçirdiğine inanılır." },
  { s: "Bergama (Pergamon) Antik Kenti hangi ilde bulunur?", o: ["Çanakkale","Aydın","Muğla","İzmir"], d: 3, a: "Bergama, İzmir iline bağlıdır. UNESCO Dünya Mirası Listesi'ndedir." },
  { s: "Afrodisias Antik Kenti hangi ilde bulunur?", o: ["İzmir","Muğla","Aydın","Denizli"], d: 2, a: "Afrodisias, Aydın iline bağlı Karacasu ilçesindedir. UNESCO Dünya Mirası Listesi'ndedir." },
  { s: "Milet Antik Kenti hangi ilde bulunur?", o: ["İzmir","Muğla","Denizli","Aydın"], d: 3, a: "Milet, Aydın iline bağlı Didim ilçesindedir." },
  { s: "Pamukkale hangi ilde bulunur?", o: ["Afyonkarahisar","Isparta","Muğla","Denizli"], d: 3, a: "Pamukkale, Denizli iline bağlıdır. Beyaz travertenler ve Hierapolis ile birlikte UNESCO Dünya Mirası'dır." },
  { s: "Hierapolis Antik Kenti hangi ilde bulunur?", o: ["Konya","Afyonkarahisar","İzmir","Denizli"], d: 3, a: "Hierapolis, Denizli iline bağlı Pamukkale ilçesindedir. UNESCO listesindedir." },
  { s: "Xanthos-Letoon arkeolojik alanı hangi ilde bulunur?", o: ["Antalya","Aydın","Muğla","Isparta"], d: 2, a: "Xanthos ve Letoon, Muğla iline bağlı Fethiye ilçesindedir. UNESCO Dünya Mirası Listesi'ndedir." },
  { s: "Bodrum Kalesi hangi ilde bulunur?", o: ["Antalya","Muğla","İzmir","Aydın"], d: 1, a: "Bodrum Kalesi, Muğla iline bağlıdır. 1402-1523 yılları arasında Rodos Şövalyeleri tarafından inşa edilmiştir." },
  // IC ANADOLU
  { s: "Çatalhöyük hangi ilde bulunur?", o: ["Ankara","Aksaray","Konya","Nevşehir"], d: 2, a: "Çatalhöyük, Konya iline bağlıdır. MÖ 7000'e kadar uzanan tarihi ile UNESCO Dünya Mirası'dır." },
  { s: "Göreme Milli Parkı (Kapadokya) hangi ilde bulunur?", o: ["Kayseri","Aksaray","Niğde","Nevşehir"], d: 3, a: "Göreme Milli Parkı ve Kapadokya, Nevşehir iline bağlıdır. UNESCO Dünya Mirası Listesi'ndedir." },
  { s: "Hattüşaş (Boğazköy) hangi ilde bulunur?", o: ["Çankırı","Ankara","Çorum","Yozgat"], d: 2, a: "Hitit başkenti Hattüşaş, Çorum iline bağlı Boğazkale ilçesindedir. UNESCO listesindedir." },
  { s: "Alacahöyük hangi ilde bulunur?", o: ["Ankara","Çankırı","Yozgat","Çorum"], d: 3, a: "Alacahöyük, Çorum iline bağlıdır. Tunç Çağı'na ait önemli bir Hitit yerleşim yeridir." },
  { s: "Gordion Antik Kenti hangi ile bağlıdır?", o: ["Eskişehir","Konya","Afyonkarahisar","Ankara"], d: 3, a: "Gordion, Ankara iline bağlı Polatlı ilçesindedir. Frigyalıların başkentidir ve UNESCO listesine alınmıştır." },
  { s: "Divriği Ulu Camii ve Darüşşifası hangi ilde bulunur?", o: ["Erzincan","Malatya","Sivas","Tokat"], d: 2, a: "Divriği Ulu Camii, Sivas iline bağlı Divriği ilçesindedir. Türkiye'nin UNESCO listesine giren ilk eserleri arasındadır (1985)." },
  { s: "Kültepe (Kaniş) Antik Kenti hangi ilde bulunur?", o: ["Nevşehir","Niğde","Aksaray","Kayseri"], d: 3, a: "Kültepe (Kaniş-Karum), Kayseri iline bağlıdır. Anadolu'nun bilinen ilk yazılı belgelerinin bulunduğu Asur ticaret kolonisidir." },
  // KARADENIZ
  { s: "Sümela Manastırı hangi ilde bulunur?", o: ["Artvin","Ordu","Rize","Trabzon"], d: 3, a: "Sümela Manastırı, Trabzon iline bağlı Maçka ilçesinde Altındere Vadisi'ndedir." },
  { s: "Safranbolu tarihi kenti hangi ilde bulunur?", o: ["Kastamonu","Bolu","Karabük","Zonguldak"], d: 2, a: "Safranbolu, Karabük iline bağlıdır. Osmanlı dönemi mimarisini korumasıyla UNESCO Dünya Mirası'dır." },
  { s: "Hacı Osman Ormanı hangi ilde bulunur?", o: ["Trabzon","Sinop","Ordu","Samsun"], d: 3, a: "Hacı Osman Ormanı, Samsun iline bağlıdır." },
  // AKDENIZ
  { s: "Perge Antik Kenti hangi ilde bulunur?", o: ["Muğla","Mersin","Isparta","Antalya"], d: 3, a: "Perge, Antalya iline bağlı Aksu ilçesindedir. Roma dönemine ait önemli bir antik kenttir." },
  { s: "Aspendos Tiyatrosu hangi ilde bulunur?", o: ["Isparta","Mersin","Burdur","Antalya"], d: 3, a: "Aspendos, Antalya iline bağlıdır. Dünyanın en iyi korunmuş Roma tiyatrolarından biridir." },
  { s: "Kızkalesi hangi ilde bulunur?", o: ["Antalya","Hatay","Adana","Mersin"], d: 3, a: "Kızkalesi, Mersin iline bağlı Erdemli ilçesindedir. Deniz ortasındaki kalesiyle ünlüdür." },
  { s: "Aziz Pavlus'un (St. Paul) doğduğu Tarsus hangi ilde bulunur?", o: ["Adana","Hatay","Osmaniye","Mersin"], d: 3, a: "Tarsus, Mersin iline bağlıdır. Hristiyanlığı yaymak için dünyayı dolaşan Aziz Pavlus burada doğmuştur." },
  { s: "Aziz Pierre Kilisesi hangi ilde bulunur?", o: ["Mersin","Adana","Hatay","Gaziantep"], d: 2, a: "Aziz Pierre Kilisesi, Hatay iline bağlı Antakya'dadır. Hristiyanlığın ilk kiliselerinden biri kabul edilir." },
  // GUNEYDOGU
  { s: "Zeugma Mozaik Müzesi hangi ilde bulunur?", o: ["Şanlıurfa","Adıyaman","Mardin","Gaziantep"], d: 3, a: "Zeugma Mozaik Müzesi, Gaziantep'tedir. Dünyanın en büyük mozaik koleksiyonlarından birini barındırır." },
  { s: "Nemrut Dağı ve dev heykelleri hangi ilde bulunur?", o: ["Şanlıurfa","Malatya","Gaziantep","Adıyaman"], d: 3, a: "Nemrut Dağı, Adıyaman iline bağlıdır. Kommagene Krallığı'na ait anıt mezar ve UNESCO Dünya Mirası'dır." },
  { s: "Diyarbakır Kalesi ve Hevsel Bahçeleri hangi ilde bulunur?", o: ["Mardin","Şanlıurfa","Batman","Diyarbakır"], d: 3, a: "Diyarbakır Kalesi ve Hevsel Bahçeleri, Diyarbakır'dadır. UNESCO Dünya Mirası Listesi'ndedir." },
  { s: "Arslantepe höyüğü hangi ilde bulunur?", o: ["Adıyaman","Elazığ","Kahramanmaraş","Malatya"], d: 3, a: "Arslantepe, Malatya iline bağlıdır. MÖ 4. binyıla uzanan tarihi ile 2021'de UNESCO listesine alınmıştır." },
  { s: "Göbeklitepe hangi ilde bulunur?", o: ["Diyarbakır","Gaziantep","Adıyaman","Şanlıurfa"], d: 3, a: "Göbeklitepe, Şanlıurfa iline bağlıdır. MÖ 10.000'e tarihlenen dünyanın en eski tapınak kompleksidir. UNESCO listesindedir." },
  // DOGU ANADOLU
  { s: "İshak Paşa Sarayı hangi ilde bulunur?", o: ["Iğdır","Kars","Erzurum","Ağrı"], d: 3, a: "İshak Paşa Sarayı, Ağrı iline bağlı Doğubayazıt ilçesindedir. 18. yüzyıl Osmanlı saray kompleksidir." },
  { s: "Akdamar Kilisesi hangi ilde bulunur?", o: ["Bitlis","Muş","Ağrı","Van"], d: 3, a: "Akdamar (Kutsal Haç) Kilisesi, Van Gölü'ndeki Akdamar Adası'ndadır; Van iline bağlıdır." },
  { s: "Ani tarihi kenti hangi ilde bulunur?", o: ["Erzurum","Iğdır","Ardahan","Kars"], d: 3, a: "Ani, Kars iline bağlıdır. Ortaçağ'ın en büyük şehirlerinden biri olup 2016'da UNESCO listesine alınmıştır." },
  { s: "Palandöken kayak merkezi hangi ilde bulunur?", o: ["Kars","Erzincan","Ağrı","Erzurum"], d: 3, a: "Palandöken, Erzurum iline bağlıdır ve Türkiye'nin önde gelen kayak merkezlerinden biridir." },
  // BOLGE SORULARI
  { s: "Sümela Manastırı hangi coğrafi bölgede yer alır?", o: ["Marmara","İç Anadolu","Doğu Anadolu","Karadeniz"], d: 3, a: "Sümela Manastırı Karadeniz Bölgesi'nde, Trabzon ilindedir." },
  { s: "Pamukkale hangi coğrafi bölgede yer alır?", o: ["Akdeniz","İç Anadolu","Ege","Marmara"], d: 2, a: "Pamukkale, Ege Bölgesi'nde Denizli ilindedir." },
  { s: "Nemrut Dağı hangi coğrafi bölgede yer alır?", o: ["Doğu Anadolu","Akdeniz","İç Anadolu","Güneydoğu Anadolu"], d: 3, a: "Nemrut Dağı, Güneydoğu Anadolu Bölgesi'nde Adıyaman ilindedir." },
  { s: "Efes Antik Kenti hangi coğrafi bölgede yer alır?", o: ["Marmara","Akdeniz","İç Anadolu","Ege"], d: 3, a: "Efes, Ege Bölgesi'nde İzmir ilindedir." },
  { s: "Hattüşaş hangi coğrafi bölgede yer alır?", o: ["Marmara","İç Anadolu","Karadeniz","Doğu Anadolu"], d: 1, a: "Hattüşaş, İç Anadolu Bölgesi'nde Çorum ilindedir." },
  { s: "Kapadokya (Göreme) hangi coğrafi bölgede yer alır?", o: ["Doğu Anadolu","Ege","İç Anadolu","Akdeniz"], d: 2, a: "Kapadokya, İç Anadolu Bölgesi'nde yer alır; ağırlıklı olarak Nevşehir iline bağlıdır." },
  { s: "Göbeklitepe hangi coğrafi bölgede yer alır?", o: ["Akdeniz","İç Anadolu","Doğu Anadolu","Güneydoğu Anadolu"], d: 3, a: "Göbeklitepe, Güneydoğu Anadolu Bölgesi'nde Şanlıurfa ilindedir." },
  // UNESCO
  { s: "Türkiye'de ilk UNESCO Dünya Mirası unvanını hangi alan almıştır (1985)?", o: ["Troya","Efes","Göreme Milli Parkı","Selimiye Camii"], d: 2, a: "Göreme Milli Parkı ve Kapadokya, İstanbul Tarihi Alanları ile birlikte 1985'te UNESCO listesine giren ilk Türk alanlarıdır." },
  { s: "Hangisi UNESCO Dünya Mirası Listesi'nde YER ALMAZ?", o: ["Sümela Manastırı","Safranbolu","Troya","Bergama"], d: 0, a: "Sümela Manastırı henüz UNESCO listesinde yer almamaktadır. Diğer üçü (Safranbolu, Troya, Bergama) UNESCO listesindedir." },
  { s: "Bursa ve Cumalıkızık hangi tema ile UNESCO listesine girmiştir?", o: ["Roma dönemi kalıntıları","Erken Cumhuriyet mimarisi","Osmanlı İmparatorluğu'nun doğuşu","Orta Çağ ticaret yolları"], d: 2, a: "Bursa ve Cumalıkızık, 'Osmanlı İmparatorluğu'nun Doğuşu' temasıyla 2014'te UNESCO listesine girmiştir." },
  { s: "Hangi şehir çifti UNESCO listesinde tek alan olarak birlikte yer alır?", o: ["Antalya - Alanya","Denizli - Afyon","İzmir - Aydın","Pamukkale - Hierapolis"], d: 3, a: "Pamukkale-Hierapolis, Denizli'de tek bir UNESCO Dünya Mirası alanı olarak listelenmiştir." },
  // GENEL
  { s: "Türkiye'de en fazla turist çeken bölge hangisidir?", o: ["Ege","Akdeniz","Marmara","İç Anadolu"], d: 2, a: "Marmara Bölgesi (özellikle İstanbul), Türkiye'nin en fazla turist çeken bölgesidir." },
  { s: "Türkiye'de kış turizmi açısından en önemli merkez hangisidir?", o: ["Kapadokya (Nevşehir)","Palandöken (Erzurum)","Kartalkaya (Bolu)","Uludağ (Bursa)"], d: 3, a: "Uludağ, Bursa ilinde yer alır ve Türkiye'nin en ünlü kayak merkezidir." },
  { s: "Dünyanın en büyük açık hava müzesi olarak anılan yer hangisidir?", o: ["Efes","Hattüşaş","Perge","Göreme (Kapadokya)"], d: 3, a: "Göreme (Kapadokya), peri bacaları ve kaya kiliseleriyle dünyanın en büyük açık hava müzesi olarak kabul edilir." },
  { s: "Dünyanın en büyük mozaik koleksiyonuna sahip müze hangisidir?", o: ["Topkapı Sarayı","Anadolu Medeniyetleri Müzesi","Bergama Müzesi","Zeugma Mozaik Müzesi"], d: 3, a: "Zeugma Mozaik Müzesi (Gaziantep), dünyanın en büyük mozaik koleksiyonunu barındırmaktadır." },
  { s: "Aşağıdaki hangi antik kent Aydın iline bağlı DEĞİLDİR?", o: ["Afrodisias","Milet","Efes","Didim"], d: 2, a: "Efes, İzmir iline bağlı Selçuk ilçesindedir. Afrodisias, Milet ve Didim ise Aydın iline bağlıdır." },
  { s: "Türkiye'nin ilk millî parkı hangisidir?", o: ["Yozgat Çamlığı","Uludağ","Göreme","Kovada Gölü"], d: 0, a: "Yozgat Çamlığı, 1958'de Türkiye'nin ilk millî parkı ilan edilmiştir." },
  { s: "Kapadokya'nın en büyük yeraltı şehrine ev sahipliği yapan ilçe hangisidir?", o: ["Ürgüp","Avanos","Uçhisar","Derinkuyu"], d: 3, a: "Derinkuyu, yaklaşık 85 metre derinliğiyle Kapadokya'nın en büyük ve en bilinen yeraltı şehrine ev sahipliği yapar." },
  { s: "Dünyanın bilinen en eski tapınak kompleksi Göbeklitepe hangi ilde bulunur?", o: ["Diyarbakır","Gaziantep","Adıyaman","Şanlıurfa"], d: 3, a: "Göbeklitepe, Şanlıurfa'ya bağlıdır. MÖ 10.000'e tarihlenen bu alan dünyanın en eski tapınak kompleksidir." },
  { s: "Kaçkar Dağları trekking rotaları ağırlıklı olarak hangi ile bağlıdır?", o: ["Trabzon","Artvin","Rize","Ordu"], d: 2, a: "Kaçkar Dağları, ağırlıklı olarak Rize iline bağlıdır ve Türkiye'nin en popüler trekking rotalarını barındırır." },
  { s: "Türkiye'de ilk milli parkın kurulduğu yıl hangisidir?", o: ["1950","1958","1965","1973"], d: 1, a: "Yozgat Çamlığı 1958'de kurulmuş olup Türkiye'nin ilk millî parkıdır." }
];
