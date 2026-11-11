import { StoreLocation, ShopOwnerPromotionConfig } from "../types";

export const DEFAULT_SHOP_PROMOTION: ShopOwnerPromotionConfig = {
  discountPercent: 10,
  promoCode: "VIP10",
  shopNameEn: "",
  shopNameAr: "",
  bonusGiftEn: "Free Comprehensive Optometrist Refraction Exam + Ultrasonic Cleaning",
  bonusGiftAr: "فحص بصر مجاني شامل لدى أخصائي البصريات + تنظيف بالموجات فوق الصوتية",
  voucherValidityDays: 14,
};

export const BOUTIQUE_LOCATIONS: StoreLocation[] = [
  {
    id: "riyadh-olaya",
    nameEn: "Olaya Luxury Optical Flagship",
    nameAr: "فرع العليا الرئيسي - الرياض",
    cityEn: "Riyadh",
    cityAr: "الرياض",
    addressEn: "Olaya Towers, King Fahd Rd, Al Olaya",
    addressAr: "أبراج العليا، طريق الملك فهد، حي العليا",
    phone: "+966 11 456 7890",
    whatsapp: "+966 50 123 4567",
    hoursEn: "Sat - Thu: 9:30 AM – 10:30 PM | Fri: 4:00 PM – 11:00 PM",
    hoursAr: "السبت - الخميس: ٩:٣٠ ص - ١٠:٣٠ م | الجمعة: ٤:٠٠ م - ١١:٠٠ م",
    mapUrl: "https://maps.google.com/?q=Olaya+Towers+Riyadh"
  },
  {
    id: "jeddah-tahlia",
    nameEn: "Tahlia Street Atelier",
    nameAr: "فرع شارع التحلية - جدة",
    cityEn: "Jeddah",
    cityAr: "جدة",
    addressEn: "Prince Mohammed Bin Abdulaziz St, Al Rawdah",
    addressAr: "شارع الأمير محمد بن عبدالعزيز (التحلية)، الروضة",
    phone: "+966 12 654 3210",
    whatsapp: "+966 55 987 6543",
    hoursEn: "Sat - Thu: 10:00 AM – 11:00 PM | Fri: 4:30 PM – 11:30 PM",
    hoursAr: "السبت - الخميس: ١٠:٠٠ ص - ١١:٠٠ م | الجمعة: ٤:٣٠ م - ١١:٣٠ م",
    mapUrl: "https://maps.google.com/?q=Tahlia+Street+Jeddah"
  },
  {
    id: "khobar-corniche",
    nameEn: "Al Khobar Coastal Flagship",
    nameAr: "فرع الكورنيش - الخبر",
    cityEn: "Al Khobar",
    cityAr: "الخبر",
    addressEn: "Corniche Road, Golden Belt District",
    addressAr: "طريق الكورنيش، حي الحزام الذهبي",
    phone: "+966 13 888 9900",
    whatsapp: "+966 54 321 0987",
    hoursEn: "Sat - Thu: 9:30 AM – 10:30 PM | Fri: 4:00 PM – 11:00 PM",
    hoursAr: "السبت - الخميس: ٩:٣٠ ص - ١٠:٣٠ م | الجمعة: ٤:٠٠ م - ١١:٠٠ م",
    mapUrl: "https://maps.google.com/?q=Al+Khobar+Corniche"
  },
  {
    id: "dubai-mall",
    nameEn: "Dubai Mall Fashion Avenue",
    nameAr: "فرع دبي مول - فاشن أفينيو",
    cityEn: "Dubai",
    cityAr: "دبي",
    addressEn: "Level 1, Fashion Avenue, The Dubai Mall",
    addressAr: "الطابق الأول، فاشن أفينيو، دبي مول",
    phone: "+971 4 330 8000",
    whatsapp: "+971 50 888 1234",
    hoursEn: "Daily: 10:00 AM – 12:00 Midnight",
    hoursAr: "يومياً: ١٠:٠٠ ص - ١٢:٠٠ منتصف الليل",
    mapUrl: "https://maps.google.com/?q=The+Dubai+Mall"
  }
];

export const TIME_SLOTS = [
  { id: "10:00", labelEn: "10:00 AM – 11:00 AM (Morning Fitting)", labelAr: "١٠:٠٠ ص - ١١:٠٠ ص (تجربة صباحية)" },
  { id: "11:30", labelEn: "11:30 AM – 12:30 PM (Midday)", labelAr: "١١:٣٠ ص - ١٢:٣٠ م (ظهراً)" },
  { id: "16:30", labelEn: "04:30 PM – 05:30 PM (Afternoon Private Fitting)", labelAr: "٠٤:٣٠ م - ٠٥:٣٠ م (تجربة مسائية هادئة)" },
  { id: "18:00", labelEn: "06:00 PM – 07:00 PM (Optometrist Session)", labelAr: "٠٦:٠٠ م - ٠٧:٠٠ م (جلسة فحص أخصائي)" },
  { id: "19:30", labelEn: "07:30 PM – 08:30 PM (Evening VIP Fitting)", labelAr: "٠٧:٣٠ م - ٠٨:٣٠ م (جلسة مسائية VIP)" },
  { id: "21:00", labelEn: "09:00 PM – 10:00 PM (Late Night Fitting)", labelAr: "٠٩:٠٠ م - ١٠:٠٠ م (موعد ليلي)" }
];
