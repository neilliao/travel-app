import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection } from "firebase/firestore";
import { 
  MapPin, 
  Calendar, 
  Hotel, 
  Train, 
  MessageCircle, 
  Info, 
  Utensils, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Circle,
  Map,
  Phone,
  DollarSign,
  Sun,
  Settings,
  Download,
  Upload,
  RefreshCw,
  X,
  ShoppingBag,
  Camera,
  ScanLine,
  Receipt,
  Link as LinkIcon,
  ExternalLink,
  Loader2,
  Leaf,
  CloudRain,
  CloudSnow,
  CloudSun,
  Navigation,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  Save,
  Volume2,
  AlertTriangle,
  Languages,
  Image as ImageIcon,
  Shirt,
  Siren,
  Ship,
  Bus,
  Plane,
  HeartPulse,
  Eye,
  Tag,
  Globe,
  Copy,
  RotateCcw,
  Check,
  ExternalLink as ExternalLinkIcon,
  Ticket,
  FileText,
  Cloud,
  FileSpreadsheet,
  QrCode,
  MessageSquare,
  PlayCircle,
  Footprints,
  Coffee,
  Briefcase,
  Backpack,
  Package,
  Umbrella
} from 'lucide-react';

// --- Firebase 初始化設定區 (請修改這裡！) ---
// ⚠️ 請去 Firebase Console -> Project Settings -> General -> Your apps
// 複製 "const firebaseConfig = { ... };" 裡面的內容，並取代下方的內容：

const myFirebaseConfig = {
  apiKey: "AIzaSyA7qhEkLiI6bCSKTcK-F-PlFJXMqmWaowE",
  authDomain: "my-travel-app-2025-f0d7d.firebaseapp.com",
  projectId: "my-travel-app-2025-f0d7d",
  storageBucket: "my-travel-app-2025-f0d7d.firebasestorage.app",
  messagingSenderId: "170088261590",
  appId: "1:170088261590:web:bb4e60240d24f5ec246677"
};

// --- 以下程式碼不用動 ---

// 邏輯判斷：如果是在這個對話視窗預覽，使用預覽專用的變數
// 如果是您下載後執行，則使用上面您填寫的 myFirebaseConfig
const finalConfig = (typeof __firebase_config !== 'undefined' && __firebase_config) 
  ? JSON.parse(__firebase_config) 
  : myFirebaseConfig;

// 防止 Firebase 重複初始化
let app;
let auth;
let db;

try {
  app = initializeApp(finalConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase 初始化失敗，請檢查 Config 設定。", e);
}

// App ID 用於區分不同使用者的資料路徑，您可以改成自己喜歡的英文 ID
const appId = typeof __app_id !== 'undefined' ? __app_id : 'my-travel-app';

// --- Icon Mapping ---
const ICON_MAP = {
  'map': Map, 
  'map-pin': MapPin,
  'train': Train,
  'bus': Bus,
  'ship': Ship,
  'plane': Plane,
  'footprints': Footprints,
  'hotel': Hotel,
  'utensils': Utensils,
  'coffee': Coffee,
  'camera': Camera,
  'shopping-bag': ShoppingBag,
  'ticket': Ticket,
  'info': Info,
  'qr-code': QrCode,
  'briefcase': Briefcase,
  'backpack': Backpack,
  'package': Package,
  'umbrella': Umbrella
};

// --- 資料結構 ---
const INITIAL_DATA = {
  appName: "旅伴 Mate", 
  appIcon: "map",       
  tripName: "京都・天橋立・伊根 (2/2-2/5)",
  dateRange: "2025/02/02 - 02/05",
  itinerary: [
    {
      day: 1,
      date: "2/2 (日)",
      location: "京都 (Kyoto)",
      weather: { icon: "CloudRain", temp: "2°C - 8°C", desc: "陰短暫雨" },
      weatherLink: "https://tenki.jp/forecast/6/29/6110/26100/", // Kyoto Weather
      clothing: "洋蔥式穿搭。發熱衣+毛衣+防風保暖外套。建議攜帶折傘，鞋子建議防潑水。",
      events: [
        { id: 'e1-1', time: "13:40", title: "桃園起飛", type: "transport", icon: "plane", note: "17:05 抵達關西機場 T2", mapQuery: "Kansai International Airport Terminal 2", mapLink: "https://maps.app.goo.gl/sample", transportId: 't1', attachment: "" },
        { id: 'e1-2', time: "17:30", title: "入境手續 (VJW)", type: "transport", icon: "qr-code", note: "準備 Visit Japan Web QR Code", mapQuery: "Kansai Airport Station", attachment: "" },
        { id: 'e1-3', time: "18:46", title: "Haruka 特急", type: "transport", icon: "train", note: "18:46 -> 20:04 往京都 (主方案)", mapQuery: "Kyoto Station", transportId: 't2', attachment: "" },
        { id: 'e1-4', time: "20:10", title: "飯店 Check-in", type: "stay", icon: "hotel", note: "ALA HOTEL KYOTO", mapQuery: "ALA HOTEL KYOTO" },
        { id: 'e1-5', time: "21:00", title: "京都生蕎麥 森平", type: "food", icon: "utensils", note: "八條口近鐵名店街內 (晚餐首選)", mapQuery: "Kyoto Nama Soba Morihei", image: "", foodId: 'f8' },
        { id: 'e1-6', time: "21:50", title: "便利商店補給", type: "shopping", icon: "shopping-bag", note: "買明日早餐、天橋立備用午餐、暖暖包", mapQuery: "Kyoto Station convenience store" }
      ]
    },
    {
      day: 2,
      date: "2/3 (一)",
      location: "天橋立・伊根",
      weather: { icon: "CloudSnow", temp: "0°C - 6°C", desc: "多雲時雪" },
      weatherLink: "https://tenki.jp/forecast/6/29/6120/26213/", // Miyazu/Amanohashidate Weather
      clothing: "【極寒對策】海邊風大體感溫度低。發熱衣x2、圍巾、手套、毛帽必備。建議穿防滑防水靴子(可能有積雪)。",
      events: [
        { id: 'e2-1', time: "08:38", title: "前往西舞鶴", type: "transport", icon: "train", note: "京都車站 31 月台發車", mapQuery: "Kyoto Station", transportId: 't3' },
        { id: 'e2-2', time: "10:13", title: "丹後赤松號", type: "sight", icon: "train", note: "8771D (西舞鶴 -> 天橋立)", mapQuery: "Nishi-Maizuru Station", attachment: "" },
        { id: 'e2-3', time: "11:10", title: "智恩寺", type: "sight", icon: "camera", note: "參拜、求籤", mapQuery: "Chionji Temple Amanohashidate" },
        { id: 'e2-4', time: "12:00", title: "天橋立觀光船", type: "transport", icon: "ship", note: "前往一宮 (12分鐘)", mapQuery: "Amanohashidate Sightseeing Boat", transportId: 't_boat_1' },
        { id: 'e2-5', time: "12:25", title: "傘松公園", type: "sight", icon: "camera", note: "纜車上山，停留約 80 分", mapQuery: "Amanohashidate Kasamatsu Park" },
        { id: 'e2-6', time: "14:23", title: "公車往伊根", type: "transport", icon: "bus", note: "元伊勢籠神社發車", mapQuery: "Motoise Kono Shrine", transportId: 't4' },
        { id: 'e2-7', time: "14:51", title: "伊根舟屋", type: "sight", icon: "camera", note: "散策 + 15:30 遊覽船", mapQuery: "Ine no Funaya", transportId: 't_boat_2' },
        { id: 'e2-8', time: "17:20", title: "智惠之湯", type: "sight", icon: "footprints", note: "手足湯 + 買回程票", mapQuery: "Chion-no-Yu" },
        { id: 'e2-9', time: "20:40", title: "KYOTO ENGINE RAMEN", type: "food", icon: "utensils", note: "京都炎神拉麵 (需去五辛)", mapQuery: "Kyoto Engine Ramen", foodId: 'f2' }
      ]
    },
    {
      day: 3,
      date: "2/4 (二)",
      location: "嵐山・金閣寺",
      weather: { icon: "CloudSun", temp: "1°C - 9°C", desc: "晴時多雲" },
      weatherLink: "https://tenki.jp/forecast/6/29/6110/26100/",
      clothing: "走路行程多，請穿舒適好走的鞋。早晚溫差大，建議多層次穿搭方便穿脫。可攜帶輕便圍巾。",
      events: [
        { id: 'e3-1', time: "07:00", title: "Vegetable Dishes OKI", type: "food", icon: "utensils", note: "早餐", mapQuery: "Vegetable Dishes OKI", foodId: 'f3' },
        { id: 'e3-2', time: "08:15", title: "前往嵐山", type: "transport", icon: "train", note: "JR 山陰本線", mapQuery: "Saga-Arashiyama Station", transportId: 't_jr_arashiyama' },
        { id: 'e3-3', time: "09:00", title: "嵐山散策", type: "sight", icon: "footprints", note: "竹林小徑 -> 野宮神社 -> 渡月橋", mapQuery: "Arashiyama Bamboo Grove" },
        { id: 'e3-4', time: "09:50", title: "Snoopy 茶屋", type: "food", icon: "coffee", note: "嵐山店", mapQuery: "Snoopy Chocolat Arashiyama" },
        { id: 'e3-5', time: "11:10", title: "天龍寺庭園", type: "sight", icon: "camera", note: "曹源池", mapQuery: "Tenryu-ji Temple" },
        { id: 'e3-6', time: "12:00", title: "篩月 (Shigetsu)", type: "food", icon: "utensils", note: "精進料理 (已預約)", mapQuery: "Shigetsu Arashiyama", foodId: 'f4' },
        { id: 'e3-7', time: "14:20", title: "金閣寺", type: "sight", icon: "camera", note: "參觀約 30 分", mapQuery: "Kinkaku-ji" },
        { id: 'e3-8', time: "17:00", title: "虹屋 VEGAN IZAKAYA", type: "food", icon: "utensils", note: "晚餐 (需排隊)", mapQuery: "Nijoya Vegan Izakaya", foodId: 'f5' },
        { id: 'e3-9', time: "18:00", title: "四條河原町採買", type: "shopping", icon: "shopping-bag", note: "EDION, SOUSOU, 藥妝", mapQuery: "Shijo Kawaramachi" },
        { id: 'e3-10', time: "20:00", title: "京都站 AEON", type: "shopping", icon: "shopping-bag", note: "3COINS, mont-bell, MUJI", mapQuery: "Aeon Mall Kyoto" }
      ]
    },
    {
      day: 4,
      date: "2/5 (三)",
      location: "清水寺・大阪",
      weather: { icon: "Sun", temp: "3°C - 10°C", desc: "晴朗" },
      weatherLink: "https://tenki.jp/forecast/6/30/6200/27100/", // Osaka Weather
      clothing: "大阪室內/百貨公司暖氣強，建議「內薄外厚」。外套夠保暖，裡面穿薄長袖即可，以免室內太熱。",
      events: [
        { id: 'e4-1', time: "06:00", title: "清水寺", type: "sight", icon: "camera", note: "晨訪 (最安靜時段)", mapQuery: "Kiyomizu-dera" },
        { id: 'e4-2', time: "09:00", title: "Veg Out", type: "food", icon: "coffee", note: "早午餐 (鴨川旁)", mapQuery: "Veg Out Kyoto", foodId: 'f6' },
        { id: 'e4-3', time: "10:20", title: "回飯店退房", type: "stay", icon: "hotel", note: "拿行李", mapQuery: "ALA HOTEL KYOTO" },
        { id: 'e4-4', time: "11:00", title: "前往新大阪", type: "transport", icon: "train", note: "JR", mapQuery: "Shin-Osaka Station", transportId: 't_jr_osaka' },
        { id: 'e4-5', time: "12:00", title: "Vegan & Gluten Free Osaka", type: "food", icon: "utensils", note: "梅田午餐", mapQuery: "Vegan & Gluten Free Osaka", foodId: 'f7' },
        { id: 'e4-6', time: "13:00", title: "梅田最後衝刺", type: "shopping", icon: "shopping-bag", note: "阪急男士館, mont-bell", mapQuery: "Hankyu Men's Osaka" },
        { id: 'e4-7', time: "16:30", title: "前往關西機場", type: "transport", icon: "plane", note: "19:55 起飛", mapQuery: "Kansai International Airport", transportId: 't_kix_back', attachment: "" }
      ]
    }
  ],
  packingList: [
    {
      id: 'p1',
      name: "隨身後背包",
      type: "backpack",
      items: [
        { id: 'pi1', name: "護照", checked: false, subBag: "重要夾層" },
        { id: 'pi2', name: "日幣錢包", checked: false, subBag: "重要夾層" },
        { id: 'pi3', name: "Visit Japan QR 截圖", checked: false, subBag: "手機" },
        { id: 'pi4', name: "行動電源", checked: false, subBag: "3C 包" },
        { id: 'pi5', name: "充電線", checked: false, subBag: "3C 包" },
        { id: 'pi6', name: "環保餐具", checked: false, subBag: "外袋" },
        { id: 'pi7', name: "水壺", checked: false, subBag: "側袋" }
      ]
    },
    {
      id: 'p2',
      name: "29吋 行李箱",
      type: "suitcase",
      items: [
        { id: 'pi8', name: "發熱衣 x 3", checked: false, subBag: "衣物收納袋 A" },
        { id: 'pi9', name: "毛衣 x 2", checked: false, subBag: "衣物收納袋 A" },
        { id: 'pi10', name: "備用長褲", checked: false, subBag: "衣物收納袋 B" },
        { id: 'pi11', name: "免洗內褲", checked: false, subBag: "衣物收納袋 B" },
        { id: 'pi12', name: "牙刷牙膏", checked: false, subBag: "盥洗包" },
        { id: 'pi13', name: "洗面乳 (分裝)", checked: false, subBag: "盥洗包" },
        { id: 'pi14', name: "常用藥品 (止痛/胃藥)", checked: false, subBag: "藥品包" },
        { id: 'pi15', name: "維他命", checked: false, subBag: "藥品包" },
        { id: 'pi16', name: "延長線", checked: false, subBag: "網袋層" }
      ]
    }
  ],
  accommodation: [
    {
      id: 'h1',
      name: "ALA HOTEL KYOTO",
      type: "Hotel",
      dates: "2/2 - 2/5",
      address: "京都市下京区東洞院通七条下る塩小路町518番地",
      checkIn: "15:00",
      checkOut: "11:00",
      bookingId: "ALA-2024",
      price: "¥--",
      mapQuery: "ALA HOTEL KYOTO"
    }
  ],
  transport: [
    { 
      id: 't1', day: 1, mode: "飛機", title: "BR132 去程", detail: "台北 -> 關西機場", code: "T2", 
      from: "Taipei", to: "Kansai International Airport",
      depTime: "13:40", arrTime: "17:05",
      schedule: null,
      attachment: ""
    },
    {
      id: 't2', day: 1, mode: "鐵路", title: "Haruka 特急", detail: "關西機場 -> 京都", code: "自由席/指定席",
      from: "Kansai Airport Station", to: "Kyoto Station",
      depTime: "18:46", arrTime: "20:04",
      schedule: "每 30 分鐘一班",
      attachment: ""
    },
    {
      id: 't3', day: 2, mode: "鐵路", title: "JR 橋立號", detail: "京都 -> 西舞鶴/天橋立", code: "特急",
      from: "Kyoto Station", to: "Amanohashidate Station",
      depTime: "08:38", arrTime: "10:40",
      schedule: null,
      attachment: ""
    },
     {
      id: 't4', day: 2, mode: "公車", title: "丹後海陸巴士", detail: "傘松公園 -> 伊根", code: "5/7/8/9 系統",
      from: "Motoise Kono Shrine", to: "Ine",
      depTime: "14:23", arrTime: "14:51",
      schedule: "約一小時一班",
      attachment: ""
    }
  ],
  coupons: [
    {
      id: 'c1',
      name: "日本旅遊優惠券懶人包",
      type: "Link",
      description: "藥妝、電器、百貨公司優惠券總整理 (Canva)。",
      link: "https://alinchuang.my.canva.site/",
      image: "",
    },
    {
      id: 'c2',
      name: "Bic Camera",
      type: "Coupon",
      description: "最高 17% 折扣 (10% 免稅 + 7% 優惠)，適用於家電、藥妝等。",
      link: "https://www.biccamera.com/bc/c/info/order/coupon.jsp", 
      image: ""
    }
  ],
  phrases: [
    { 
      category: "蛋奶素", 
      list: [
        { local: "私はラクト・ベジタリアンです (Watashi wa rakuto bejitarian desu)", native: "我是蛋奶素食者" },
        { local: "肉、魚、海鮮は食べられません (Niku, sakana, kaisen wa taberaremasen)", native: "我不吃肉、魚、海鮮" },
        { local: "卵と乳製品は大丈夫です (Tamago to nyuseihin wa daijobu desu)", native: "雞蛋和乳製品可以吃" },
        { local: "ネギ、玉ねぎ、ニンニクは抜いてください (Negi, tamanegi, ninniku wa nuite kudasai)", native: "請幫我去掉蔥、洋蔥、大蒜 (五辛)" },
        { local: "出汁に魚が入っていますか？ (Dashi ni sakana ga haitte imasu ka?)", native: "高湯裡有魚/柴魚嗎？" }
      ]
    },
    { category: "基本", list: [
      { local: "こんにちは (Konnichiwa)", native: "你好" },
      { local: "ありがとう (Arigatou)", native: "謝謝" },
      { local: "すみません (Sumimasen)", native: "不好意思/請問" },
      { local: "はい / いいえ (Hai / Iie)", native: "是 / 不是" }
    ]},
    { category: "餐廳", list: [
      { local: "これをください (Kore o kudasai)", native: "請給我這個" },
      { local: "お会計をお願いします (Okaikei o onegaishimasu)", native: "請結帳" },
      { local: "クレジットカードは使えますか？ (Kurejitto kado wa tsukaemasu ka?)", native: "可以刷卡嗎？" }
    ]},
    { category: "交通", list: [
      { local: "~はどこですか？ (~ wa doko desu ka?)", native: "請問~在哪裡？" },
      { local: "この電車は~に行きますか？ (Kono densha wa ~ ni ikimasu ka?)", native: "這班電車會去~嗎？" },
      { local: "切符売り場 (Kippu uriba)", native: "售票處" }
    ]}
  ],
  food: [
    { 
      id: 'f1', 
      name: "NO RAMEN (京都站)", 
      type: "拉麵", 
      checked: false, 
      note: "京都車站 10F 拉麵小路內。全素。", 
      isVegan: true, 
      mapQuery: "Kyoto Station 10F Ramen",
      menuItems: ["素食味噌拉麵", "餃子(素)"],
      image: "https://lh3.googleusercontent.com/p/AF1QipN3y-u_l3y-u_l3y-u_l3y-u_l3y-u_l3y-u_l3y=s680-w680-h510"
    },
    { 
      id: 'f2', 
      name: "KYOTO ENGINE RAMEN", 
      type: "拉麵", 
      checked: false, 
      note: "需排隊。有素食選項 (Zesty Ramen)。需去五辛。", 
      isVegan: true, 
      mapQuery: "Kyoto Engine Ramen",
      menuItems: ["Zesty Ramen (No Garlic/Onion)"],
      mapLink: "https://maps.app.goo.gl/1adc8fC7pV3Z5Zv39"
    },
     { 
      id: 'f3', 
      name: "Vegetable Dishes OKI", 
      type: "家庭料理", 
      checked: false, 
      note: "只有 6 個座位，老闆娘一人作業。需預約。", 
      isVegan: true, 
      mapQuery: "Vegetable Dishes OKI"
    },
    { 
      id: 'f4', 
      name: "篩月 (Shigetsu)", 
      type: "精進料理", 
      checked: false, 
      note: "天龍寺內，米其林推薦。已預約 12:00。", 
      isVegan: true, 
      mapQuery: "Shigetsu Arashiyama"
    },
     { 
      id: 'f5', 
      name: "虹屋 VEGAN IZAKAYA", 
      type: "居酒屋", 
      checked: false, 
      note: "各式日式小菜、唐揚雞(大豆肉)。氣氛佳。", 
      isVegan: true, 
      mapQuery: "Nijoya Vegan Izakaya"
    }
  ],
  sights: [
    { name: "智恩寺", checked: false, note: "文殊菩薩，求智慧。", mapQuery: "Chionji Temple Amanohashidate", type: "Temple" },
    { name: "天橋立沙洲", checked: false, note: "日本三景之一，可散步或騎腳踏車。", mapQuery: "Amanohashidate", type: "Nature" },
    { name: "伊根舟屋", checked: false, note: "日本最美漁村。", mapQuery: "Ine no Funaya", type: "Sight" },
    { name: "清水寺", checked: true, note: "世界遺產，清水舞台。", mapQuery: "Kiyomizu-dera", type: "Temple" },
    { name: "金閣寺", checked: false, note: "金碧輝煌的舍利殿。", mapQuery: "Kinkaku-ji", type: "Temple" }
  ],
  shopping: [
     { 
      id: 's1', 
      name: "SOU・SOU", 
      location: "四條河原町", 
      mapQuery: "SOU・SOU Kyoto",
      checked: false,
      items: [
          { name: "數字十數分趾鞋", checked: false, image: "", link: "", price: "8,900", model: "S-55" },
          { name: "口金包", checked: false, image: "", link: "", price: "3,000", model: "" }
      ]
    },
    { 
      id: 's2', 
      name: "Mont-bell", 
      location: "京都站 / 大阪梅田", 
      mapQuery: "mont-bell Kyoto",
      checked: false,
      items: [
          { name: "羽絨外套 (Light Alpine)", checked: false, image: "", link: "", price: "18,000", model: "1101660" },
          { name: "Gore-Tex 雨衣", checked: false, image: "", link: "", price: "24,000", model: "Storm Cruiser" }
      ]
    },
    { 
      id: 's3', 
      name: "藥妝店 (松本清/大國)", 
      location: "隨處", 
      mapQuery: "Matsumotokiyoshi Kyoto",
      checked: false,
      items: [
          { name: "EVE 止痛藥", checked: false, image: "", link: "", price: "980", model: "Quick DX" },
          { name: "合利他命 EX Plus", checked: false, image: "", link: "", price: "5,500", model: "270錠" }
      ]
    }
  ],
  info: {
    currency: 0.21, 
    emergency: [
      { name: "警察局", number: "110" },
      { name: "火警/救護車", number: "119" },
      { name: "台北駐大阪辦事處", number: "06-6227-8623" }
    ],
    notes: "電壓 100V (台灣插頭可用)。\n無須小費。\n走路靠左。"
  }
};

// --- Helper Component for Navigation ---
const NavButton = ({ active, name, icon: Icon, label, setTab }) => (
  <button 
    onClick={() => setTab(name)} 
    className={`flex flex-col items-center gap-1 min-w-[60px] flex-shrink-0 transition-colors ${
      active === name 
      ? 'text-teal-600 scale-105' 
      : 'text-slate-400 hover:text-slate-500'
    }`}
  >
    <Icon size={24} strokeWidth={active === name ? 2.5 : 2} />
    <span className={`text-[10px] font-bold ${active === name ? 'text-teal-600' : 'text-slate-400'}`}>
      {label}
    </span>
  </button>
);

// --- New Component: Image Preview Modal ---
const ImagePreviewModal = ({ src, onClose }) => {
  if (!src) return null;
  return (
    <div className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="relative max-w-full max-h-full">
        <img src={src} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        <button 
          onClick={onClose} 
          className="absolute -top-12 right-0 text-white p-2 bg-white/10 rounded-full hover:bg-white/20"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

const App = () => {
  // Global State
  const [activeTab, setActiveTab] = useState('home');
  const [showSettings, setShowSettings] = useState(false); 
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });
  const [data, setData] = useState(INITIAL_DATA); // Start with initial data, will sync from Firebase
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 
  const [activeProduct, setActiveProduct] = useState(null);
  
  // New: Attachment Preview
  const [previewAttachment, setPreviewAttachment] = useState(null);
   
  // Local state lifted up to App
  const [expandedMaps, setExpandedMaps] = useState({});
  const [itineraryDay, setItineraryDay] = useState(1);
  const [transportDay, setTransportDay] = useState(1);
  const [phraseCategory, setPhraseCategory] = useState("蛋奶素");
  const [phraseExpanded, setPhraseExpanded] = useState(null);
  const [shoppingScan, setShoppingScan] = useState({ active: false, stage: 'idle' });
   
  // Receipt Check States
  const [receiptModal, setReceiptModal] = useState(false);
  const [receiptImg, setReceiptImg] = useState(null);
  const fileInputRef = useRef(null);

  // --- Firebase Sync Logic ---
  useEffect(() => {
    const initAuth = async () => {
      // 確保至少執行匿名登入，即使是本地開發
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Listen to real-time updates from Firestore
    const unsubscribe = onSnapshot(
        doc(collection(db, 'artifacts', appId, 'users', user.uid, 'data'), 'tripData'),
        (docSnap) => {
            if (docSnap.exists()) {
                // Merge cloud data with structure to ensure fields
                setData(prev => ({ ...prev, ...docSnap.data() }));
            } else {
                // First time user? Save initial data
                saveData(INITIAL_DATA);
            }
            setLoading(false);
        },
        (error) => {
            console.error("Firebase sync error:", error);
            setLoading(false);
        }
    );
    return () => unsubscribe();
  }, [user]);

  // Save to Firestore helper
  const saveData = async (newData) => {
      if (!user) return;
      try {
          await setDoc(doc(collection(db, 'artifacts', appId, 'users', user.uid, 'data'), 'tripData'), newData);
      } catch (e) {
          console.error("Error saving data:", e);
      }
  };

  // Wrapper for setData to also save to cloud
  const setAndSaveData = (newDataOrFn) => {
      setData(prev => {
          const newData = typeof newDataOrFn === 'function' ? newDataOrFn(prev) : newDataOrFn;
          saveData(newData); // Persist to cloud
          return newData;
      });
  };

  // --- Helper to show confirm modal ---
  const requestConfirm = (message, action) => {
    setConfirmModal({ show: true, message, onConfirm: action });
  };

  const handleConfirm = () => {
    if (confirmModal.onConfirm) confirmModal.onConfirm();
    setConfirmModal({ ...confirmModal, show: false });
  };

  // --- Actions ---
  
  const resetData = () => {
    requestConfirm("確定要重置所有資料回到預設值嗎？此動作無法復原。", () => {
      setAndSaveData(INITIAL_DATA);
      alert("資料已重置！");
      window.location.reload();
    });
  };

  const copyShoppingListCSV = () => {
      // Generate CSV string from Shopping List
      const header = "商店,商品,價格,型號,已買\n";
      const rows = data.shopping.flatMap(store => 
          store.items.map(item => 
              `${store.name},${item.name},${item.price},${item.model},${item.checked ? 'Yes' : 'No'}`
          )
      ).join("\n");
      
      navigator.clipboard.writeText(header + rows);
      alert("購物清單已複製！可直接貼上 Google Sheet / Excel。");
  };

  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);

  const handleImportCSV = () => {
      if(!importText.trim()) return;
      
      const lines = importText.split(/\n/);
      const newItems = lines.map(line => {
          const parts = line.split(/[\t,]+/); // Split by tab or comma
          if(parts.length < 1) return null;
          return {
              name: parts[0]?.trim() || "未命名商品",
              price: parts[1]?.trim() || "0",
              model: "",
              checked: false,
              image: ""
          };
      }).filter(i => i);

      if(newItems.length > 0) {
          setAndSaveData(prev => {
              const newData = JSON.parse(JSON.stringify(prev));
              newData.shopping.push({
                  id: `s_import_${Date.now()}`,
                  name: "Excel 匯入清單",
                  location: "",
                  mapQuery: "",
                  checked: false,
                  items: newItems
              });
              return newData;
          });
          setImportText("");
          setShowImport(false);
          alert(`已匯入 ${newItems.length} 個商品！`);
      }
  };

  const toggleMap = (id) => {
    setExpandedMaps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openMapLink = (link) => {
    if (link) window.open(link, '_blank');
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      
      // Try to find a Japanese voice
      const voices = window.speechSynthesis.getVoices();
      const japaneseVoice = voices.find(voice => voice.lang.includes('ja'));
      if (japaneseVoice) utterance.voice = japaneseVoice;

      window.speechSynthesis.speak(utterance);
    } else {
      alert("您的裝置不支援語音播放");
    }
  };

  // --- Receipt Logic ---
  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = (e) => setReceiptImg(e.target.result);
        reader.readAsDataURL(file);
    }
  };

  const handleAddImpulseItem = () => {
      let impulseStoreIdx = data.shopping.findIndex(s => s.name === "失心瘋 (額外戰利品)");
      
      const newItem = { 
          id: `item_impulse_${Date.now()}`,
          name: "新商品", 
          price: "0", 
          model: "", 
          checked: true,
          image: ""
      };

      setAndSaveData(prev => {
          const newData = JSON.parse(JSON.stringify(prev));
          if (impulseStoreIdx === -1) {
              newData.shopping.unshift({
                  id: `s_impulse_${Date.now()}`,
                  name: "失心瘋 (額外戰利品)",
                  location: "未知地點",
                  mapQuery: "",
                  checked: false,
                  items: [newItem]
              });
          } else {
              newData.shopping[impulseStoreIdx].items.push(newItem);
          }
          return newData;
      });
  };

  // --- Day Management ---
  const handleAddDay = () => {
    setAndSaveData(prev => {
      const nextDay = prev.itinerary.length + 1;
      const newDayData = {
        day: nextDay,
        date: `Day ${nextDay}`,
        location: "新地點",
        weather: { icon: "Sun", temp: "--", desc: "晴朗" },
        clothing: "請輸入穿搭建議...",
        events: []
      };
      return { ...prev, itinerary: [...prev.itinerary, newDayData] };
    });
    setItineraryDay(data.itinerary.length + 1);
  };

  const handleDeleteDay = () => {
    if (data.itinerary.length <= 1) {
      alert("至少需要保留一天行程！");
      return;
    }
    
    requestConfirm(`確定要刪除 Day ${itineraryDay} 及其所有行程嗎？`, () => {
        setAndSaveData(prev => {
            const newItinerary = prev.itinerary.filter(d => d.day !== itineraryDay);
            const reindexedItinerary = newItinerary.map((d, index) => ({
            ...d,
            day: index + 1,
            date: d.date.startsWith("Day") ? `Day ${index + 1}` : d.date 
            }));
            return { ...prev, itinerary: reindexedItinerary };
        });
        setItineraryDay(1); 
    });
  };

  const handleDelete = (item = editingItem) => {
    if (!item) return;
    
    requestConfirm("確定要刪除此項目嗎？", () => {
        const { type, dayIndex, eventIndex, itemIndex, storeIndex, globalIndex, bagIndex } = item;
        
        setAndSaveData(prev => {
            const newDataState = JSON.parse(JSON.stringify(prev));
            if (type === 'itinerary') {
                newDataState.itinerary[dayIndex].events.splice(eventIndex, 1);
            } else if (type === 'food') {
                newDataState.food.splice(itemIndex, 1);
            } else if (type === 'sight') {
                newDataState.sights.splice(itemIndex, 1);
            } else if (type === 'shopping_store') {
                newDataState.shopping.splice(storeIndex, 1);
            } else if (type === 'shopping_item') {
                newDataState.shopping[storeIndex].items.splice(itemIndex, 1);
            } else if (type === 'transport') {
                newDataState.transport.splice(globalIndex, 1);
            } else if (type === 'coupon') {
                newDataState.coupons.splice(itemIndex, 1);
            } else if (type === 'packing_bag') {
                newDataState.packingList.splice(bagIndex, 1);
            } else if (type === 'packing_item') {
                newDataState.packingList[bagIndex].items.splice(itemIndex, 1);
            }
            return newDataState;
        });
        
        if (editingItem && editingItem.type === item.type) {
             setEditingItem(null);
        }
    });
  };

  const handleEditSave = (newData) => {
    const { type, dayIndex, eventIndex, itemIndex, storeIndex, globalIndex, bagIndex } = editingItem;
    
    setAndSaveData(prev => {
        const newDataState = JSON.parse(JSON.stringify(prev));

        if (type === 'itinerary') {
           newDataState.itinerary[dayIndex].events[eventIndex] = { ...newDataState.itinerary[dayIndex].events[eventIndex], ...newData };
        } else if (type === 'new_itinerary_event') {
           const newEvent = { ...newData, id: `e_new_${Date.now()}`, type: 'sight' };
           newDataState.itinerary[dayIndex].events.push(newEvent);
        } else if (type === 'food' || type === 'sight') {
           const list = type === 'food' ? newDataState.food : newDataState.sights;
           if (type === 'food' && typeof newData.menuItemsString === 'string') {
               newData.menuItems = newData.menuItemsString.split(',').map(s => s.trim()).filter(s => s);
               delete newData.menuItemsString;
           }
           list[itemIndex] = { ...list[itemIndex], ...newData };
        } else if (type === 'new_food') {
           if (typeof newData.menuItemsString === 'string') {
               newData.menuItems = newData.menuItemsString.split(',').map(s => s.trim()).filter(s => s);
               delete newData.menuItemsString;
           }
           newDataState.food.push({ ...newData, id: `f_new_${Date.now()}`, checked: false });
        } else if (type === 'new_sight') {
           newDataState.sights.push({ ...newData, id: `s_new_${Date.now()}`, checked: false });
        } else if (type === 'shopping_store') {
           newDataState.shopping[storeIndex] = { ...newDataState.shopping[storeIndex], ...newData };
        } else if (type === 'shopping_item') {
           newDataState.shopping[storeIndex].items[itemIndex] = { ...newDataState.shopping[storeIndex].items[itemIndex], ...newData };
        } else if (type === 'new_shopping_item') {
           newDataState.shopping[storeIndex].items.push(newData);
        } else if (type === 'transport') {
           newDataState.transport[globalIndex] = { ...newDataState.transport[globalIndex], ...newData };
        } else if (type === 'new_transport') {
           newDataState.transport.push({ ...newData, id: `t_new_${Date.now()}` });
        } else if (type === 'new_store') {
           newDataState.shopping.push({ ...newData, id: `s_new_${Date.now()}`, checked: false, items: [] });
        } else if (type === 'trip_info') {
           newDataState.tripName = newData.tripName;
           newDataState.dateRange = newData.dateRange;
        } else if (type === 'app_header') {
           newDataState.appName = newData.appName;
           newDataState.appIcon = newData.icon;
        } else if (type === 'coupon') {
           newDataState.coupons[itemIndex] = { ...newDataState.coupons[itemIndex], ...newData };
        } else if (type === 'new_coupon') {
           newDataState.coupons.push({ ...newData, id: `c_new_${Date.now()}` });
        } else if (type === 'packing_bag') {
           newDataState.packingList[bagIndex] = { ...newDataState.packingList[bagIndex], ...newData };
        } else if (type === 'new_packing_bag') {
           newDataState.packingList.push({ ...newData, id: `p_${Date.now()}`, items: [] });
        } else if (type === 'packing_item') {
           newDataState.packingList[bagIndex].items[itemIndex] = { ...newDataState.packingList[bagIndex].items[itemIndex], ...newData };
        } else if (type === 'new_packing_item') {
           newDataState.packingList[bagIndex].items.push({ ...newData, id: `pi_${Date.now()}`, checked: false });
        } else if (type === 'itinerary_weather') {
           newDataState.itinerary[dayIndex].weather = { ...newDataState.itinerary[dayIndex].weather, ...newData.weather };
           newDataState.itinerary[dayIndex].clothing = newData.clothing;
           newDataState.itinerary[dayIndex].weatherLink = newData.weatherLink;
        }

        // --- 自動排序邏輯 ---
        if (type === 'itinerary' || type === 'new_itinerary_event') {
            newDataState.itinerary[dayIndex].events.sort((a, b) => {
                const timeA = a.time || '23:59';
                const timeB = b.time || '23:59';
                return timeA.localeCompare(timeB);
            });
        }

        return newDataState;
    });

    setEditingItem(null);
  };

  // Toggles...
  const toggleStore = (storeIdx) => {
    setAndSaveData(prev => {
      const newShopping = JSON.parse(JSON.stringify(prev.shopping));
      newShopping[storeIdx].checked = !newShopping[storeIdx].checked;
      return { ...prev, shopping: newShopping };
    });
  };

  const toggleItem = (storeIdx, itemIdx) => {
    setAndSaveData(prev => {
      const newShopping = JSON.parse(JSON.stringify(prev.shopping));
      newShopping[storeIdx].items[itemIdx].checked = !newShopping[storeIdx].items[itemIdx].checked;
      return { ...prev, shopping: newShopping };
    });
  };

  const togglePackingItem = (bagIdx, itemIdx) => {
    setAndSaveData(prev => {
      const newPacking = JSON.parse(JSON.stringify(prev.packingList));
      newPacking[bagIdx].items[itemIdx].checked = !newPacking[bagIdx].items[itemIdx].checked;
      return { ...prev, packingList: newPacking };
    });
  };

  const toggleFoodCheck = (index) => {
    setAndSaveData(prev => {
      const newFood = [...prev.food];
      newFood[index] = { ...newFood[index], checked: !newFood[index].checked };
      return { ...prev, food: newFood };
    });
  };

  const toggleSightCheck = (index) => {
    setAndSaveData(prev => {
      const newSights = [...prev.sights];
      newSights[index] = { ...newSights[index], checked: !newSights[index].checked };
      return { ...prev, sights: newSights };
    });
  };

  const renderIcon = (iconName, type) => {
    // If iconName exists in our map, use it
    if (iconName && ICON_MAP[iconName]) {
        const IconComponent = ICON_MAP[iconName];
        return <IconComponent size={18} className="text-slate-600" />;
    }

    // Fallback to type-based defaults
    switch (type) {
      case 'transport': return <Train size={18} className="text-blue-500" />;
      case 'stay': return <Hotel size={18} className="text-indigo-500" />;
      case 'food': return <Utensils size={18} className="text-orange-500" />;
      case 'sight': return <Camera size={18} className="text-emerald-500" />;
      case 'shopping': return <ShoppingBag size={18} className="text-pink-500" />;
      default: return <MapPin size={18} className="text-slate-500" />;
    }
  };

  const EmbeddedMap = ({ query }) => {
    if (!query) return null;
    return (
      <div className="w-full h-48 mt-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative animate-fadeIn">
         <iframe 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            style={{border:0}}
            loading="lazy"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            title="Map"
            className="opacity-90 hover:opacity-100 transition-opacity"
         ></iframe>
      </div>
    );
  };

  const ProductCard = () => {
    if (!activeProduct) return null;
    return (
      <div 
        className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col justify-center items-center p-6 animate-fadeIn"
        onClick={() => setActiveProduct(null)}
      >
        <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
           <div className="bg-slate-100 h-64 flex items-center justify-center overflow-hidden">
             {activeProduct.image ? (
               <img src={activeProduct.image} alt={activeProduct.name} className="w-full h-full object-cover" />
             ) : (
               <ImageIcon size={48} className="text-slate-300"/>
             )}
           </div>
           <div className="p-6">
             <h3 className="text-2xl font-bold">{activeProduct.name}</h3>
             <p className="text-xl font-mono mt-2 text-teal-600 font-bold">¥{activeProduct.price}</p>
             <p className="text-sm text-slate-400 mt-4 font-mono">Model: {activeProduct.model || 'N/A'}</p>
             {activeProduct.link && (
                <a href={activeProduct.link} target="_blank" rel="noreferrer" className="block mt-4 text-blue-600 underline text-sm">
                   商品連結
                </a>
             )}
           </div>
           <button onClick={() => setActiveProduct(null)} className="absolute top-4 right-4 p-2 bg-white/80 rounded-full shadow-sm hover:bg-slate-100"><X size={20}/></button>
        </div>
      </div>
    );
  };

  const ImportModal = () => {
      if(!showImport) return null;
      return (
        <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <FileSpreadsheet size={18}/> 從 Excel / Sheet 匯入
                </h3>
                <p className="text-xs text-slate-500 mb-2">請貼上從 Excel 複製的內容（品名 [Tab] 價格）：</p>
                <textarea 
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    className="w-full h-32 border border-slate-200 rounded-xl p-3 text-sm mb-4"
                    placeholder="例如：
                    合利他命 5500
                    EVE止痛藥 980"
                />
                <div className="flex gap-2">
                    <button onClick={() => setShowImport(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm">取消</button>
                    <button onClick={handleImportCSV} className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm">匯入</button>
                </div>
            </div>
        </div>
      );
  }

  const SettingsModal = () => {
    if (!showSettings) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-6 animate-fadeIn">
         <div className="bg-white w-full max-w-sm rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Settings size={18}/> 資料管理</h3>
            <button onClick={copyShoppingListCSV} className="w-full py-3 bg-slate-100 rounded-xl mb-3 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition">
              <Copy size={16} /> 複製購物清單 (到 Excel/Sheet)
            </button>
            <button onClick={() => setShowImport(true)} className="w-full py-3 bg-slate-100 rounded-xl mb-3 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition">
              <FileSpreadsheet size={16} /> 從 Excel/Sheet 匯入購物清單
            </button>
            <div className="border-t border-slate-100 my-4"></div>
            <button onClick={resetData} className="w-full py-3 bg-red-50 text-red-600 rounded-xl mb-6 text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition">
              <RotateCcw size={16} /> 重置所有資料 (恢復預設)
            </button>
            <div className="text-xs text-green-600 mb-6 px-2 text-center flex items-center justify-center gap-1">
               <Cloud size={12}/> 資料已自動備份至雲端
            </div>
            <button onClick={() => setShowSettings(false)} className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 transition">
              完成
            </button>
         </div>
      </div>
    );
  };
  
  const EditModal = () => {
    if (!editingItem) return null;
    
    const initData = { ...editingItem.data };
    if (editingItem.type === 'food' || editingItem.type === 'new_food') {
        if (initData.menuItems) {
            initData.menuItemsString = initData.menuItems.join(', ');
        }
    }
    
    const [formData, setFormData] = useState(initData);
    const { type } = editingItem;
    const isNewItem = type.startsWith('new_');
    const isTransport = type.includes('transport');
    const isTripInfo = type === 'trip_info';
    const isAppHeader = type === 'app_header';
    const isPackingBag = type === 'packing_bag' || type === 'new_packing_bag';
    const isPackingItem = type === 'packing_item' || type === 'new_packing_item';
    const isItineraryWeather = type === 'itinerary_weather';
    const isFood = type === 'food' || type === 'new_food';
    const isSight = type === 'sight' || type === 'new_sight';
    const isShoppingItem = type === 'shopping_item' || type === 'new_shopping_item';
    const isCoupon = type === 'coupon' || type === 'new_coupon';

    const handleFileUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setFormData({ ...formData, [field]: e.target.result });
            reader.readAsDataURL(file);
        }
    };

    return (
      <div className="fixed inset-0 bg-slate-900/90 z-50 flex items-center justify-center p-6 animate-fadeIn">
        <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Edit2 size={18} /> {isNewItem ? '新增項目' : '編輯項目'}
          </h3>
          <div className="space-y-3">
             {/* Itinerary Weather Editing */}
             {isItineraryWeather && (
                 <>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">天氣圖示</label>
                        <select 
                            value={formData.weather?.icon || 'Sun'}
                            onChange={e => setFormData({...formData, weather: {...formData.weather, icon: e.target.value}})}
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                        >
                            <option value="Sun">晴天</option>
                            <option value="CloudSun">晴時多雲</option>
                            <option value="CloudRain">雨天</option>
                            <option value="CloudSnow">雪天</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">氣溫概況</label>
                        <input 
                            type="text" 
                            value={formData.weather?.temp || ''}
                            onChange={e => setFormData({...formData, weather: {...formData.weather, temp: e.target.value}})}
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">天氣描述</label>
                        <input 
                            type="text" 
                            value={formData.weather?.desc || ''}
                            onChange={e => setFormData({...formData, weather: {...formData.weather, desc: e.target.value}})}
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Tenki.jp 連結 (預報網址)</label>
                        <input 
                            type="text" 
                            value={formData.weatherLink || ''}
                            onChange={e => setFormData({...formData, weatherLink: e.target.value})}
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm text-blue-600"
                            placeholder="https://tenki.jp/..."
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">穿搭建議</label>
                        <textarea 
                            value={formData.clothing || ''}
                            onChange={e => setFormData({...formData, clothing: e.target.value})}
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm h-24"
                        />
                    </div>
                 </>
             )}

             {/* Packing Bag Editing */}
             {isPackingBag && (
                 <>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">包包名稱</label>
                        <input 
                            type="text" 
                            value={formData.name || ''} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                            placeholder="例如：隨身背包、29吋行李箱"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">類型</label>
                        <select 
                            value={formData.type || 'backpack'} 
                            onChange={e => setFormData({...formData, type: e.target.value})}
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                        >
                            <option value="backpack">背包</option>
                            <option value="suitcase">行李箱</option>
                            <option value="briefcase">公事包</option>
                        </select>
                    </div>
                 </>
             )}

             {/* Packing Item Editing */}
             {isPackingItem && (
                 <>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">物品名稱</label>
                        <input 
                            type="text" 
                            value={formData.name || ''} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">放置位置 (袋子/夾層)</label>
                        <input 
                            type="text" 
                            value={formData.subBag || ''} 
                            onChange={e => setFormData({...formData, subBag: e.target.value})}
                            className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                            placeholder="例如：盥洗包、內袋、網袋"
                        />
                    </div>
                 </>
             )}

             {/* Trip Info Editing */}
             {isTripInfo && (
                <>
                  <div>
                      <label className="text-xs text-slate-400 block mb-1">旅程名稱</label>
                      <input 
                        type="text" 
                        value={formData.tripName || ''} 
                        onChange={e => setFormData({...formData, tripName: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                      />
                  </div>
                  <div>
                      <label className="text-xs text-slate-400 block mb-1">日期範圍</label>
                      <input 
                        type="text" 
                        value={formData.dateRange || ''} 
                        onChange={e => setFormData({...formData, dateRange: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                      />
                  </div>
                </>
             )}

             {/* App Header Editing */}
             {isAppHeader && (
                <div>
                    <label className="text-xs text-slate-400 block mb-1">App 名稱</label>
                    <input 
                        type="text" 
                        value={formData.appName || ''} 
                        onChange={e => setFormData({...formData, appName: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                    />
                </div>
             )}

             {/* Icon Selector for Itinerary, Transport & App Header */}
             {(type === 'itinerary' || type === 'new_itinerary_event' || isTransport || type === 'new_transport' || isAppHeader) && (
                 <div>
                     <label className="text-xs text-slate-400 block mb-1">選擇圖示</label>
                     <div className="grid grid-cols-6 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                         {Object.keys(ICON_MAP).map(iconKey => {
                             const IconComp = ICON_MAP[iconKey];
                             return (
                                 <button
                                     key={iconKey}
                                     onClick={() => setFormData({...formData, icon: iconKey})}
                                     className={`p-1.5 rounded flex justify-center items-center transition ${formData.icon === iconKey ? 'bg-teal-500 text-white' : 'text-slate-400 hover:bg-slate-200'}`}
                                 >
                                     <IconComp size={16} />
                                 </button>
                             )
                         })}
                     </div>
                 </div>
             )}

             {/* General Fields: Time */}
             {(type === 'itinerary' || type === 'new_itinerary_event') && (
               <div>
                 <label className="text-xs text-slate-400 block mb-1">時間</label>
                 <input 
                   type="text" 
                   value={formData.time || ''} 
                   onChange={e => setFormData({...formData, time: e.target.value})}
                   className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                   placeholder="00:00"
                 />
               </div>
             )}

             {/* Attachment Upload for Itinerary & Transport */}
             {(type === 'itinerary' || type === 'new_itinerary_event' || isTransport || type === 'new_transport') && (
                 <div>
                     <label className="text-xs text-slate-400 block mb-1">附件 / 憑證 / QR Code</label>
                     {formData.attachment ? (
                         <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200">
                             <img src={formData.attachment} alt="Attachment" className="max-w-full max-h-full object-contain" />
                             <button 
                                onClick={() => setFormData({...formData, attachment: ""})}
                                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                             >
                                 <X size={14} />
                             </button>
                         </div>
                     ) : (
                         <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
                             <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                 <Upload size={24} className="text-slate-400 mb-2" />
                                 <p className="text-xs text-slate-500">點擊上傳圖片</p>
                             </div>
                             <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'attachment')} />
                         </label>
                     )}
                 </div>
             )}

             {/* Transport Specific Fields */}
             {isTransport && (
               <>
                <div className="grid grid-cols-2 gap-2">
                   <div>
                      <label className="text-xs text-slate-400 block mb-1">類型</label>
                      <select 
                        value={formData.mode || '鐵路'} 
                        onChange={e => setFormData({...formData, mode: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                      >
                          <option value="鐵路">鐵路</option>
                          <option value="公車">公車</option>
                          <option value="飛機">飛機</option>
                          <option value="船">船</option>
                          <option value="步行">步行</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-xs text-slate-400 block mb-1">班次/代號</label>
                      <input 
                        type="text" 
                        value={formData.code || ''} 
                        onChange={e => setFormData({...formData, code: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                        placeholder="例: 特急 123號"
                      />
                   </div>
                </div>
                <div>
                   <label className="text-xs text-slate-400 block mb-1">標題 (名稱)</label>
                   <input 
                     type="text" 
                     value={formData.title || ''} 
                     onChange={e => setFormData({...formData, title: e.target.value})}
                     className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                     placeholder="例: Haruka 特急"
                   />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div>
                      <label className="text-xs text-slate-400 block mb-1">出發地</label>
                      <input 
                        type="text" 
                        value={formData.from || ''} 
                        onChange={e => setFormData({...formData, from: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                      />
                   </div>
                   <div>
                      <label className="text-xs text-slate-400 block mb-1">出發時間</label>
                      <input 
                        type="text" 
                        value={formData.depTime || ''} 
                        onChange={e => setFormData({...formData, depTime: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                        placeholder="00:00"
                      />
                   </div>
                   <div>
                      <label className="text-xs text-slate-400 block mb-1">抵達地</label>
                      <input 
                        type="text" 
                        value={formData.to || ''} 
                        onChange={e => setFormData({...formData, to: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                      />
                   </div>
                   <div>
                      <label className="text-xs text-slate-400 block mb-1">抵達時間</label>
                      <input 
                        type="text" 
                        value={formData.arrTime || ''} 
                        onChange={e => setFormData({...formData, arrTime: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                        placeholder="00:00"
                      />
                   </div>
                </div>
               </>
             )}
             
             {/* Title / Name (Non-Transport/Info) */}
             {!isTransport && !isTripInfo && !isAppHeader && !isPackingBag && !isPackingItem && !isItineraryWeather && (formData.title !== undefined || type === 'itinerary' || type === 'new_itinerary_event') && ( 
               <div>
                 <label className="text-xs text-slate-400 block mb-1">標題</label>
                 <input 
                   type="text" 
                   value={formData.title || ''} 
                   onChange={e => setFormData({...formData, title: e.target.value})}
                   className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                 />
               </div>
             )}
             
             {/* Name (Food, Sight, Store, Shopping Item, Coupon) */}
             {!isTransport && !isTripInfo && !isAppHeader && !isPackingBag && !isPackingItem && !isItineraryWeather && (formData.name !== undefined || type === 'new_food' || type === 'new_sight' || type === 'new_store' || type === 'new_coupon') && (
               <div>
                 <label className="text-xs text-slate-400 block mb-1">名稱</label>
                 <input 
                   type="text" 
                   value={formData.name || ''} 
                   onChange={e => setFormData({...formData, name: e.target.value})}
                   className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                 />
               </div>
             )}
             
             {/* Store Location */}
             {(type === 'shopping_store' || type === 'new_store') && (
                <div>
                 <label className="text-xs text-slate-400 block mb-1">位置</label>
                 <input 
                   type="text" 
                   value={formData.location || ''} 
                   onChange={e => setFormData({...formData, location: e.target.value})}
                   className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                 />
               </div>
             )}
             
             {/* Shopping Item Fields */}
             {(type === 'shopping_item' || type === 'new_shopping_item') && (
               <>
                 <div>
                   <label className="text-xs text-slate-400 block mb-1">型號 (Model No.)</label>
                   <input 
                     type="text" 
                     value={formData.model || ''} 
                     onChange={e => setFormData({...formData, model: e.target.value})}
                     className="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono bg-yellow-50"
                   />
                 </div>
                 <div>
                   <label className="text-xs text-slate-400 block mb-1">價格 (Price)</label>
                   <input 
                     type="text" 
                     value={formData.price || ''} 
                     onChange={e => setFormData({...formData, price: e.target.value})}
                     className="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono"
                   />
                 </div>
               </>
             )}

             {/* Food Menu Items */}
             {isFood && (
                <div>
                    <label className="text-xs text-slate-400 block mb-1">推薦菜單 (用逗號分隔)</label>
                    <textarea 
                      value={formData.menuItemsString || ''} 
                      onChange={e => setFormData({...formData, menuItemsString: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg p-2 text-sm h-16"
                      placeholder="例如：拉麵, 餃子, 炒飯"
                    />
                </div>
             )}

             {/* Common Fields: Note/Description */}
             {type !== 'new_store' && !isTripInfo && !isAppHeader && !isPackingBag && !isPackingItem && !isItineraryWeather && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                    {isTransport ? "詳細資訊" : isCoupon ? "優惠內容描述" : "備註/描述"}
                </label>
                <textarea 
                  value={(isTransport ? formData.detail : isCoupon ? formData.description : formData.note) || ''} 
                  onChange={e => {
                      if(isTransport) setFormData({...formData, detail: e.target.value});
                      else if(isCoupon) setFormData({...formData, description: e.target.value});
                      else setFormData({...formData, note: e.target.value});
                  }}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm h-20"
                />
              </div>
             )}
             
             {/* Map Link / Coupon Link */}
             {(type !== 'new_store' && !isTripInfo && !isAppHeader && !isPackingBag && !isPackingItem && !isItineraryWeather) && (
               <div>
                   <label className="text-xs text-slate-400 block mb-1">
                       {isCoupon ? "優惠連結 (URL)" : "Google Map 連結 (URL)"}
                   </label>
                   <input 
                     type="text" 
                     value={(isCoupon ? formData.link : formData.mapLink) || ''} 
                     onChange={e => isCoupon ? setFormData({...formData, link: e.target.value}) : setFormData({...formData, mapLink: e.target.value})}
                     className="w-full border border-slate-200 rounded-lg p-2 text-sm text-blue-600"
                     placeholder="例如：https://..."
                   />
               </div>
             )}

             {/* Map Query (Preview) - Not for coupons */}
             {type !== 'new_store' && !isTransport && !isTripInfo && !isAppHeader && !isCoupon && !isPackingBag && !isPackingItem && !isItineraryWeather && (
               <div>
                   <label className="text-xs text-slate-400 block mb-1">地圖預覽關鍵字 (若空白則不顯示預覽)</label>
                   <input 
                     type="text" 
                     value={formData.mapQuery || ''} 
                     onChange={e => setFormData({...formData, mapQuery: e.target.value})}
                     className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                     placeholder="例如：清水寺"
                   />
               </div>
             )}

             {/* Image URL */}
             {(isFood || isSight || isShoppingItem || isCoupon) && (
               <div>
                   <label className="text-xs text-slate-400 block mb-1">圖片連結 (URL)</label>
                   <input 
                     type="text" 
                     value={formData.image || ''} 
                     onChange={e => setFormData({...formData, image: e.target.value})}
                     className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                     placeholder="例如：https://example.com/image.jpg"
                   />
               </div>
             )}
          </div>
          
          <div className="flex gap-2 mt-6">
            {!isNewItem && !isTripInfo && !isAppHeader && !isItineraryWeather && (
               <button onClick={() => handleDelete(editingItem)} className="bg-red-50 text-red-500 p-2 rounded-xl flex-shrink-0 hover:bg-red-100 transition">
                 <Trash2 size={20} />
               </button>
            )}
            <button onClick={() => setEditingItem(null)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl font-medium">取消</button>
            <button onClick={() => handleEditSave(formData)} className="flex-1 bg-teal-600 text-white py-2 rounded-xl font-medium">儲存</button>
          </div>
        </div>
      </div>
    );
  };

  // --- Confirm Modal Component ---
  const ConfirmModal = () => {
    if (!confirmModal.show) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-6 animate-fadeIn backdrop-blur-sm">
         <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl scale-100">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto">
               <AlertTriangle size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 text-center mb-2">確認刪除</h3>
            <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-3">
               <button onClick={() => setConfirmModal({...confirmModal, show: false})} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition">
                 取消
               </button>
               <button onClick={handleConfirm} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-200 transition">
                 確認刪除
               </button>
            </div>
         </div>
      </div>
    );
  };

  // --- Receipt Modal Component ---
  const ReceiptModal = () => {
      if (!receiptModal) return null;

      // Calculate totals from shopping list (Planned)
      const plannedItems = data.shopping
        .filter(s => s.name !== "失心瘋 (額外戰利品)")
        .flatMap(s => s.items);
      
      const impulseItems = data.shopping.find(s => s.name === "失心瘋 (額外戰利品)")?.items || [];
      
      const totalPlanned = plannedItems.length;
      const boughtPlanned = plannedItems.filter(i => i.checked).length;
      
      const calculateTotal = (items) => {
          return items.reduce((acc, item) => {
              const priceStr = String(item.price || '0'); 
              const price = parseInt(priceStr.replace(/,/g, '').replace(/¥/g, '') || 0); 
              return acc + (isNaN(price) ? 0 : price);
          }, 0);
      }

      const totalPlannedPrice = calculateTotal(plannedItems);
      const boughtPlannedPrice = calculateTotal(plannedItems.filter(i => i.checked));
      const impulsePrice = calculateTotal(impulseItems);

      return (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col animate-fadeIn">
            {/* Header */}
            <div className="bg-slate-800 text-white p-4 flex items-center justify-between shadow-md z-10">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <ScanLine size={20} /> 發票對帳模式
                </h3>
                <button onClick={() => setReceiptModal(false)} className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition">
                    <X size={20} />
                </button>
            </div>

            {/* Split View */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
                
                {/* Left: Receipt Image Area */}
                <div className="flex-1 bg-slate-900 p-4 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-700 min-h-[300px]">
                    {receiptImg ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img src={receiptImg} alt="Receipt" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                            <button 
                                onClick={() => setReceiptImg(null)}
                                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ) : (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-full border-2 border-dashed border-slate-600 rounded-2xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-800 hover:text-slate-300 transition"
                        >
                            <Camera size={48} className="mb-4" />
                            <p className="font-bold text-lg">點擊上傳發票/收據</p>
                            <p className="text-sm opacity-60 mt-1">支援相機拍攝</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleReceiptUpload}
                    />
                </div>

                {/* Right: Checklist & Stats */}
                <div className="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden">
                    {/* Stats Header */}
                    <div className="p-4 bg-white shadow-sm grid grid-cols-2 gap-4 border-b border-slate-100">
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-500 font-bold mb-1">原定計畫 (達成率)</p>
                            <p className="text-xl font-bold text-slate-800">
                                {boughtPlanned} / {totalPlanned} <span className="text-xs text-slate-400 font-normal">項</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-1">¥{boughtPlannedPrice.toLocaleString()}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                            <p className="text-xs text-red-500 font-bold mb-1">失心瘋 (額外花費)</p>
                            <p className="text-xl font-bold text-red-600">
                                ¥{impulsePrice.toLocaleString()}
                            </p>
                            <p className="text-xs text-red-400 mt-1">{impulseItems.length} 項額外商品</p>
                        </div>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Impulse Buys Section */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-red-500 flex items-center gap-2">
                                    <AlertTriangle size={16} /> 額外戰利品 (失心瘋)
                                </h4>
                                <button 
                                    onClick={handleAddImpulseItem}
                                    className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-200 transition"
                                >
                                    + 快速新增
                                </button>
                            </div>
                            <div className="space-y-2">
                                {impulseItems.length > 0 ? impulseItems.map((item, idx) => (
                                    <div key={item.id || idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                                        <div className="flex-1">
                                            <input 
                                                type="text" 
                                                value={item.name}
                                                onChange={(e) => {
                                                    const newData = JSON.parse(JSON.stringify(data));
                                                    const store = newData.shopping.find(s => s.name === "失心瘋 (額外戰利品)");
                                                    if(store && store.items[idx]) {
                                                        store.items[idx].name = e.target.value;
                                                        setAndSaveData(newData);
                                                    }
                                                }}
                                                className="font-bold text-slate-800 w-full bg-transparent focus:outline-none focus:border-b border-red-200"
                                            />
                                            <div className="flex items-center gap-1 mt-1 text-slate-400 text-xs">
                                                ¥ <input 
                                                    type="text" 
                                                    value={item.price}
                                                    onChange={(e) => {
                                                        const newData = JSON.parse(JSON.stringify(data));
                                                        const store = newData.shopping.find(s => s.name === "失心瘋 (額外戰利品)");
                                                        if(store && store.items[idx]) {
                                                            store.items[idx].price = e.target.value;
                                                            setAndSaveData(newData);
                                                        }
                                                    }}
                                                    className="w-20 bg-transparent focus:outline-none focus:border-b border-slate-200"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                const newData = JSON.parse(JSON.stringify(data));
                                                const store = newData.shopping.find(s => s.name === "失心瘋 (額外戰利品)");
                                                if(store) {
                                                    store.items.splice(idx, 1);
                                                    setAndSaveData(newData);
                                                }
                                            }}
                                            className="p-2 text-red-300 hover:text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )) : (
                                    <p className="text-center text-xs text-slate-400 py-4 border border-dashed border-slate-200 rounded-xl">
                                        目前沒有額外消費，太棒了！
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Planned List Section */}
                        <div>
                            <h4 className="font-bold text-slate-600 flex items-center gap-2 mb-2">
                                <CheckCircle2 size={16} /> 原定購物清單
                            </h4>
                            <div className="space-y-3">
                                {data.shopping.filter(s => s.name !== "失心瘋 (額外戰利品)").map((store, sIdx) => (
                                    <div key={sIdx} className="bg-white p-3 rounded-xl border border-slate-200">
                                        <h5 className="font-bold text-sm text-slate-500 mb-2 border-b border-slate-50 pb-1">{store.name}</h5>
                                        <div className="space-y-1">
                                            {store.items.map((item, iIdx) => (
                                                <label key={item.id || iIdx} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.checked ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 bg-white'}`}>
                                                        {item.checked && <Check size={12} strokeWidth={3} />}
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden" 
                                                        checked={item.checked}
                                                        onChange={() => toggleItem(data.shopping.indexOf(store), iIdx)}
                                                    />
                                                    <div className="flex-1">
                                                        <span className={`text-sm ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs font-mono text-slate-400">
                                                        ¥{item.price || '-'}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // --- Views ---

  const renderHomeView = () => {
    return (
      <div className="space-y-6 pb-24 animate-fadeIn">
        {/* Hero Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Map size={120} />
          </div>
          <div className="relative z-10">
             {isEditMode && (
                <button 
                  onClick={() => setEditingItem({ type: 'trip_info', data: { tripName: data.tripName, dateRange: data.dateRange } })}
                  className="absolute top-0 right-0 p-2 text-white/50 hover:text-white"
                >
                  <Edit2 size={18} />
                </button>
             )}
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium mb-4 backdrop-blur-sm">
              <Calendar size={12} /> {data.dateRange}
            </div>
            <h1 className="text-3xl font-bold mb-2 leading-tight">{data.tripName}</h1>
            <p className="text-slate-400 text-sm mb-6">準備好探索古都與海之京都了嗎？</p>
            <button 
              onClick={() => setActiveTab('itinerary')}
              className="bg-teal-500 hover:bg-teal-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20"
            >
              查看行程 <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           <div 
             onClick={() => setActiveTab('itinerary')}
             className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer"
           >
              <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center text-blue-500 mb-3">
                 <MapPin size={20} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.itinerary.length}</p>
              <p className="text-xs text-slate-400 font-medium">天數</p>
           </div>
           <div 
             onClick={() => setActiveTab('shopping')}
             className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition cursor-pointer"
           >
              <div className="bg-pink-50 w-10 h-10 rounded-full flex items-center justify-center text-pink-500 mb-3">
                 <ShoppingBag size={20} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{data.shopping.reduce((acc, s) => acc + s.items.length, 0)}</p>
              <p className="text-xs text-slate-400 font-medium">代購物品</p>
           </div>
        </div>

        {/* Countdown / Weather Summary (Mockup) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="bg-orange-50 p-3 rounded-full text-orange-500">
             <Sun size={24} />
           </div>
           <div>
             <h3 className="font-bold text-slate-800">天氣預報</h3>
             <p className="text-xs text-slate-400 mt-0.5">出發前請再次確認氣溫</p>
           </div>
        </div>
      </div>
    );
  };

  const renderStayView = () => {
    return (
      <div className="pb-24 animate-fadeIn">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">住宿資訊</h2>
        <div className="space-y-4">
          {data.accommodation.map((hotel, idx) => (
             <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-2 py-1 rounded text-xs font-bold">
                     <Hotel size={14} /> {hotel.type}
                   </div>
                   {isEditMode && <Edit2 size={16} className="text-slate-300"/>}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{hotel.name}</h3>
                <p className="text-sm text-slate-500 mb-4 flex items-start gap-1">
                   <MapPin size={14} className="mt-0.5 flex-shrink-0" /> {hotel.address}
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                   <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Check-in</p>
                      <p className="font-mono font-bold text-slate-700">{hotel.checkIn}</p>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-xl">
                      <p className="text-xs text-slate-400 mb-1">Check-out</p>
                      <p className="font-mono font-bold text-slate-700">{hotel.checkOut}</p>
                   </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                   <div className="text-xs">
                      <span className="text-slate-400 block">預約編號</span>
                      <span className="font-mono font-medium">{hotel.bookingId}</span>
                   </div>
                   
                   <div className="flex gap-2">
                       {hotel.mapLink && (
                           <button 
                              onClick={() => openMapLink(hotel.mapLink)}
                              className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                           >
                             <ExternalLinkIcon size={16} /> 開啟地圖
                           </button>
                       )}
                       {hotel.mapQuery && (
                           <button 
                              onClick={() => toggleMap(`hotel-${idx}`)}
                              className="text-sm font-bold text-slate-500 flex items-center gap-1 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition"
                           >
                             <Map size={16} /> 預覽
                           </button>
                       )}
                   </div>
                </div>
                {expandedMaps[`hotel-${idx}`] && <EmbeddedMap query={hotel.mapQuery} />}
             </div>
          ))}
        </div>
      </div>
    );
  };

  const renderShoppingView = () => {
    return (
      <div className="pb-24 animate-fadeIn">
         <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold text-slate-800">購物清單</h2>
           {isEditMode && (
             <button 
                onClick={() => setEditingItem({ type: 'new_store', data: { name: '', location: '', items: [] } })}
                className="text-sm bg-slate-100 px-3 py-1.5 rounded-lg font-bold text-slate-600"
             >
                + 新增商店
             </button>
           )}
         </div>

         {/* Coupons & Links Section - Integrated */}
         <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Ticket size={14} className="text-rose-500" /> 優惠與連結
                </h3>
                {isEditMode && (
                    <button 
                        onClick={() => setEditingItem({ type: 'new_coupon', data: { name: '', description: '', link: '', image: '' } })}
                        className="text-xs text-rose-500 font-bold hover:bg-rose-50 px-2 py-1 rounded transition"
                    >
                        + 新增優惠
                    </button>
                )}
            </div>
            
            <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
                {/* Render Coupons as Horizontal Cards */}
                {data.coupons.map((coupon, idx) => (
                    <div key={idx} className="flex-shrink-0 w-64 bg-white rounded-xl p-3 shadow-sm border border-slate-100 relative group hover:shadow-md transition">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-rose-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                                {coupon.image ? (
                                    <img src={coupon.image} alt={coupon.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Ticket size={20} className="text-rose-400" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-800 text-sm truncate">{coupon.name}</h4>
                                <p className="text-[10px] text-slate-500 truncate mb-1.5">{coupon.description}</p>
                                {coupon.link && (
                                    <button 
                                        onClick={() => openMapLink(coupon.link)}
                                        className="text-[10px] font-bold text-white bg-rose-500 px-2.5 py-1 rounded shadow-sm hover:bg-rose-600 transition flex items-center gap-1 w-fit"
                                    >
                                        <ExternalLinkIcon size={10} /> 開啟連結
                                    </button>
                                )}
                            </div>
                        </div>
                        {isEditMode && (
                            <div className="absolute top-1 right-1 flex gap-1">
                                <button 
                                    onClick={() => handleDelete({ type: 'coupon', itemIndex: idx })}
                                    className="p-1 bg-red-50 rounded-full text-red-400 hover:text-red-600"
                                >
                                    <Trash2 size={10} />
                                </button>
                                <button 
                                    onClick={() => setEditingItem({ type: 'coupon', itemIndex: idx, data: coupon })}
                                    className="p-1 bg-slate-50 rounded-full text-slate-400 hover:text-teal-600"
                                >
                                    <Edit2 size={10} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                {data.coupons.length === 0 && (
                    <div className="w-full text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                        尚無優惠券
                    </div>
                )}
            </div>
         </div>

         {/* Receipt Scan / Check Button */}
         {!shoppingScan.active && (
            <button 
              onClick={() => setReceiptModal(true)}
              className="w-full bg-slate-800 text-white rounded-2xl p-4 flex items-center justify-center gap-2 mb-6 shadow-lg shadow-slate-200 hover:bg-slate-700 transition"
            >
               <ScanLine size={20} /> 掃描發票對帳 / 失心瘋檢查
            </button>
         )}

         <div className="space-y-6">
            {data.shopping.filter(s => s.name !== "失心瘋 (額外戰利品)").map((store, storeIdx) => (
               <div key={storeIdx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${store.checked ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                           <ShoppingBag size={20} />
                        </div>
                        <div>
                           <h3 className={`font-bold ${store.checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{store.name}</h3>
                           <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={10} /> {store.location}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                       {isEditMode && (
                          <>
                            <button onClick={() => handleDelete({ type: 'shopping_store', storeIndex: storeIdx })} className="p-2 bg-red-50 rounded-full text-red-400">
                                <Trash2 size={14} />
                            </button>
                            <button onClick={() => setEditingItem({ type: 'shopping_store', storeIndex: storeIdx, data: store })} className="p-2 bg-slate-50 rounded-full text-slate-400">
                                <Edit2 size={14} />
                            </button>
                          </>
                       )}
                       <button onClick={() => toggleStore(storeIdx)} className={`w-8 h-8 rounded-full flex items-center justify-center transition ${store.checked ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                         <CheckCircle2 size={16} />
                       </button>
                     </div>
                  </div>

                  <div className="space-y-3">
                     {store.items.map((item, itemIdx) => (
                        <div key={itemIdx} onClick={() => !isEditMode && setActiveProduct(item)} className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-xl transition cursor-pointer group">
                           {/* Image Thumbnail */}
                           <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                               {item.image ? (
                                   <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                               ) : (
                                   <ImageIcon size={20} className="text-slate-300" />
                               )}
                           </div>

                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div>
                                    <p className={`text-sm font-medium truncate ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.name}</p>
                                    <div className="flex gap-2 text-[10px] text-slate-400 mt-0.5">
                                        {item.model && <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">{item.model}</span>}
                                        {item.price && <span className="font-mono">¥{item.price}</span>}
                                    </div>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleItem(storeIdx, itemIdx); }}
                                    className={`w-5 h-5 rounded border flex items-center justify-center transition ${item.checked ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-300 bg-white'}`}
                                >
                                    {item.checked && <CheckCircle2 size={12} />}
                                </button>
                              </div>
                           </div>

                           {isEditMode && (
                             <div className="flex gap-1 flex-col justify-center">
                               <button 
                                   onClick={(e) => { e.stopPropagation(); handleDelete({ type: 'shopping_item', storeIndex: storeIdx, itemIndex: itemIdx }); }}
                                   className="p-1.5 bg-red-50 rounded-full text-red-400"
                               >
                                   <Trash2 size={12} />
                               </button>
                               <button 
                                   onClick={(e) => { e.stopPropagation(); setEditingItem({ type: 'shopping_item', storeIndex: storeIdx, itemIndex: itemIdx, data: item }); }}
                                   className="text-slate-300 hover:text-teal-600 p-1.5"
                               >
                                   <Edit2 size={14} />
                               </button>
                             </div>
                           )}
                        </div>
                     ))}
                     
                     {isEditMode && (
                        <button 
                           onClick={() => setEditingItem({ type: 'new_shopping_item', storeIndex: storeIdx, data: { name: '', price: '', model: '', checked: false } })} 
                           className="w-full py-2 border border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50 transition mt-2"
                        >
                           + 新增商品
                        </button>
                     )}
                  </div>
               </div>
            ))}
         </div>
      </div>
    );
  };

  // --- Packing View ---
  const renderPackingView = () => {
    return (
      <div className="pb-24 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold text-slate-800">打包清單</h2>
           {isEditMode && (
             <button 
                onClick={() => setEditingItem({ type: 'new_packing_bag', data: { name: '', type: 'suitcase', items: [] } })}
                className="text-sm bg-slate-100 px-3 py-1.5 rounded-lg font-bold text-slate-600"
             >
                + 新增包包
             </button>
           )}
         </div>

         <div className="space-y-6">
            {data.packingList.map((bag, bagIdx) => {
                // Group items by subBag (category)
                const groupedItems = bag.items.reduce((acc, item) => {
                    const category = item.subBag || "未分類";
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(item);
                    return acc;
                }, {});

                return (
                    <div key={bag.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                                    {renderIcon(bag.type)}
                                </div>
                                <h3 className="font-bold text-slate-800">{bag.name}</h3>
                            </div>
                            {isEditMode && (
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => handleDelete({ type: 'packing_bag', bagIndex: bagIdx })}
                                        className="p-1.5 bg-red-50 rounded-full text-red-400"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => setEditingItem({ type: 'packing_bag', bagIndex: bagIdx, data: bag })}
                                        className="p-1.5 bg-slate-50 rounded-full text-slate-400"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {Object.entries(groupedItems).map(([category, items]) => (
                                <div key={category}>
                                    <h4 className="text-xs font-bold text-slate-400 mb-2 pl-1 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                        {category}
                                    </h4>
                                    <div className="space-y-1">
                                        {items.map((item) => {
                                            // Find original index in bag.items
                                            const itemIdx = bag.items.findIndex(i => i.id === item.id);
                                            return (
                                                <div key={item.id} className="flex items-center group">
                                                    <label className="flex-1 flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.checked ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-300 bg-white'}`}>
                                                            {item.checked && <Check size={12} strokeWidth={3} />}
                                                        </div>
                                                        <input 
                                                            type="checkbox" 
                                                            className="hidden" 
                                                            checked={item.checked}
                                                            onChange={() => togglePackingItem(bagIdx, itemIdx)}
                                                        />
                                                        <span className={`text-sm ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                            {item.name}
                                                        </span>
                                                    </label>
                                                    {isEditMode && (
                                                        <div className="flex gap-1 ml-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => handleDelete({ type: 'packing_item', bagIndex: bagIdx, itemIndex: itemIdx })}
                                                                className="p-1 text-red-300 hover:text-red-500"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                            <button 
                                                                onClick={() => setEditingItem({ type: 'packing_item', bagIndex: bagIdx, itemIndex: itemIdx, data: item })}
                                                                className="p-1 text-slate-300 hover:text-teal-600"
                                                            >
                                                                <Edit2 size={12} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {isEditMode && (
                                <button 
                                   onClick={() => setEditingItem({ type: 'new_packing_item', bagIndex: bagIdx, data: { name: '', subBag: '', checked: false } })} 
                                   className="w-full py-2 border border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-50 transition mt-2"
                                >
                                   + 新增物品
                                </button>
                             )}
                        </div>
                    </div>
                );
            })}
         </div>
      </div>
    );
  };

  const renderTransportView = () => {
    // Dynamically calculate days from itinerary data
    const availableDays = data.itinerary.map(d => d.day);
    // Ensure transportDay is valid
    const currentTransportDay = availableDays.includes(transportDay) ? transportDay : availableDays[0];
    const dayTransport = data.transport.filter(t => t.day === currentTransportDay);

    return (
      <div className="pb-24 animate-fadeIn">
         <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-2xl font-bold text-slate-800">交通票券</h2>
            {isEditMode && <span className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded">編輯模式</span>}
         </div>
         
         {/* Day Selector - Dynamic */}
         <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar mb-2">
            {availableDays.map(day => (
               <button
                  key={day}
                  onClick={() => setTransportDay(day)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  currentTransportDay === day 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-slate-500 border border-slate-200'
                  }`}
               >
                  Day {day}
               </button>
            ))}
         </div>

         <div className="space-y-4">
            {dayTransport.length > 0 ? dayTransport.map((item, idx) => {
               // Find the original index in the main data array for deletion/editing
               const globalIndex = data.transport.findIndex(t => t.id === item.id);
               
               return (
               <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                  
                  {isEditMode && (
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                        <button 
                            onClick={() => handleDelete({ type: 'transport', globalIndex: globalIndex })}
                            className="p-1.5 bg-red-50 rounded-full shadow-sm text-red-400 hover:text-red-600"
                        >
                            <Trash2 size={14} />
                        </button>
                        <button 
                            onClick={() => setEditingItem({ type: 'transport', globalIndex, data: item })}
                            className="p-1.5 bg-white rounded-full shadow-sm text-slate-400 hover:text-teal-600"
                        >
                            <Edit2 size={14} />
                        </button>
                    </div>
                  )}

                  <div className="pl-3">
                     <div className="flex justify-between items-start mb-3">
                        <div>
                           <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">{item.mode}</div>
                           <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                        </div>
                        <div className="text-right">
                           <div className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded font-mono">{item.code}</div>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                           <p className="text-xl font-mono font-bold text-slate-700">{item.depTime}</p>
                           <p className="text-xs text-slate-500 font-medium truncate">{item.from}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center w-8">
                           <ArrowRight size={14} className="text-slate-300" />
                        </div>
                        <div className="flex-1 text-right">
                           <p className="text-xl font-mono font-bold text-slate-700">{item.arrTime}</p>
                           <p className="text-xs text-slate-500 font-medium truncate">{item.to}</p>
                        </div>
                     </div>

                     <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-500 flex justify-between items-center">
                        <span>{item.detail}</span>
                        {item.schedule && <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">{item.schedule}</span>}
                     </div>

                     {/* Attachment Button */}
                     {item.attachment && (
                         <button 
                            onClick={() => setPreviewAttachment(item.attachment)}
                            className="w-full mt-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition"
                         >
                             <QrCode size={16} /> 查看 QR / 憑證
                         </button>
                     )}
                  </div>
               </div>
               );
            }) : (
               <div className="text-center py-10 text-slate-400">
                  <Train size={48} className="mx-auto mb-3 opacity-20" />
                  <p>今日無長途交通安排</p>
               </div>
            )}
            
            {isEditMode && (
               <button 
                 onClick={() => setEditingItem({ type: 'new_transport', data: { day: currentTransportDay, mode: '鐵路', title: '', from: '', to: '', depTime: '', arrTime: '', detail: '', code: '', attachment: '' } })}
                 className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition"
               >
                 <Plus size={18}/> 新增交通行程 (Day {currentTransportDay})
               </button>
            )}
         </div>
      </div>
    );
  };

  const renderPhrasesView = () => {
    const currentList = data.phrases.find(p => p.category === phraseCategory)?.list || [];

    return (
      <div className="pb-24 animate-fadeIn">
         <h2 className="text-2xl font-bold text-slate-800 mb-4">實用日語</h2>
         
         <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar mb-2">
            {data.phrases.map((cat, idx) => (
               <button
                  key={idx}
                  onClick={() => setPhraseCategory(cat.category)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  phraseCategory === cat.category 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-slate-500 border border-slate-200'
                  }`}
               >
                  {cat.category}
               </button>
            ))}
         </div>

         {phraseCategory === '蛋奶素' && (
             <div className="mb-4 bg-green-50 border border-green-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                 <Leaf className="absolute top-[-10px] right-[-10px] text-green-100 w-32 h-32 rotate-12" />
                 <div className="relative z-10">
                     <h3 className="font-bold text-green-800 text-lg mb-1 flex items-center gap-2">
                         <Leaf size={18} /> 素食溝通卡
                     </h3>
                     <p className="text-xs text-green-600 mb-4">出示此卡給店家看，告知您的飲食需求。</p>
                     <div className="bg-white rounded-xl p-4 shadow-sm">
                         <p className="text-xl font-bold text-slate-800 leading-relaxed mb-2">
                             私は<span className="text-green-600">ラクト・ベジタリアン</span>です。<br/>
                             肉、魚、海鮮は食べられません。<br/>
                             <span className="text-sm font-normal text-slate-500 block mt-2">
                                 (我是蛋奶素食者，不吃肉、魚、海鮮。)
                             </span>
                         </p>
                     </div>
                 </div>
             </div>
         )}

         <div className="space-y-3">
            {currentList.map((phrase, idx) => (
               <div 
                 key={idx} 
                 onClick={() => setPhraseExpanded(phraseExpanded === idx ? null : idx)}
                 className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all cursor-pointer hover:border-indigo-100"
               >
                  <p className="text-lg font-bold text-slate-800 mb-1">{phrase.native}</p>
                  <div className="flex items-center justify-between">
                     <p className="text-sm text-slate-500">{phrase.local}</p>
                     <button 
                        onClick={(e) => { e.stopPropagation(); speak(phrase.local.split('(')[0]); }}
                        className="p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 active:scale-95 transition"
                     >
                        <Volume2 size={20} />
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
    );
  };

  const renderInfoView = () => {
    return (
      <div className="pb-24 animate-fadeIn">
         <h2 className="text-2xl font-bold text-slate-800 mb-6">更多資訊</h2>
         
         <div className="space-y-6">
            {/* Direct Link to Phrases */}
            <div 
                onClick={() => setActiveTab('phrases')}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 shadow-lg shadow-indigo-200 text-white flex items-center justify-between cursor-pointer active:scale-95 transition"
            >
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2 mb-1">
                        <MessageSquare size={20} /> 日語對話 & 素食卡
                    </h3>
                    <p className="text-xs text-indigo-100">點擊開啟溝通板、語音播放</p>
                </div>
                <ChevronRight size={24} className="text-white/50" />
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <DollarSign size={18} className="text-yellow-500" /> 匯率計算
               </h3>
               <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between">
                  <div>
                     <p className="text-xs text-slate-400 mb-1">目前匯率 (參考)</p>
                     <p className="text-xl font-bold font-mono text-slate-700">0.21</p>
                  </div>
                  <div className="text-right">
                     <p className="text-xs text-slate-400 mb-1">10,000 JPY</p>
                     <p className="text-xl font-bold font-mono text-slate-700">≈ 2,100 TWD</p>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Siren size={18} className="text-red-500" /> 緊急聯絡
               </h3>
               <div className="space-y-3">
                  {data.info.emergency.map((item, idx) => (
                     <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                        <span className="font-medium text-slate-700">{item.name}</span>
                        <a href={`tel:${item.number}`} className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-lg font-bold text-sm">
                           <Phone size={14} /> {item.number}
                        </a>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Info size={18} className="text-blue-500" /> 貼心提醒
               </h3>
               <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                  {data.info.notes}
               </p>
            </div>
         </div>
      </div>
    );
  };

  const renderItineraryView = () => {
    // Ensure itineraryDay is valid within current data bounds
    const validItineraryDay = data.itinerary.find(d => d.day === itineraryDay) ? itineraryDay : (data.itinerary[0]?.day || 1);
    
    // Update state if we auto-corrected
    if (validItineraryDay !== itineraryDay) {
        setItineraryDay(validItineraryDay);
    }

    const dayIndex = data.itinerary.findIndex(d => d.day === validItineraryDay);
    const dayData = data.itinerary[dayIndex] || data.itinerary[0];

    // Helper to safely get weather icon
    const WeatherIcon = () => {
       const iconName = dayData?.weather?.icon;
       if (iconName === 'CloudRain') return <CloudRain size={24} />;
       if (iconName === 'CloudSnow') return <CloudSnow size={24} />;
       if (iconName === 'Sun') return <Sun size={24} />;
       return <CloudSun size={24} />;
    };

    return (
      <div className="pb-24 h-full flex flex-col">
        {/* Header & Day Selector */}
        <div className="flex justify-between items-center mb-4 px-1">
           <h2 className="text-2xl font-bold text-slate-800">行程規劃</h2>
           {isEditMode && <span className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded">編輯模式</span>}
        </div>
        <div className="flex space-x-3 overflow-x-auto pb-4 no-scrollbar items-center">
          {data.itinerary.map((d) => (
            <button
              key={d.day}
              onClick={() => setItineraryDay(d.day)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                validItineraryDay === d.day 
                ? 'bg-slate-800 text-white shadow-md transform scale-105' 
                : 'bg-white text-slate-500 border border-slate-200'
              }`}
            >
              Day {d.day}
            </button>
          ))}
          {isEditMode && (
            <button onClick={handleAddDay} className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-teal-100 hover:text-teal-600 transition">
              <Plus size={16} />
            </button>
          )}
        </div>
        
        {/* Events List */}
        <div className="flex-1 bg-white rounded-t-3xl shadow-inner border-t border-slate-100 p-6 overflow-y-auto">
           {/* Weather Info */}
           <div className="flex gap-4 mb-8 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 relative group">
              {isEditMode && (
                <div className="absolute top-2 right-2 flex gap-1">
                    <button 
                        className="bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition"
                        title="刪除此天行程"
                        onClick={handleDeleteDay}
                    >
                        <Trash2 size={14} />
                    </button>
                    <button 
                        onClick={() => setEditingItem({ type: 'itinerary_weather', dayIndex, data: { weather: dayData.weather, clothing: dayData.clothing, weatherLink: dayData.weatherLink } })}
                        className="bg-white text-slate-400 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition hover:text-teal-600"
                        title="編輯天氣資訊"
                    >
                        <Edit2 size={14} />
                    </button>
                </div>
              )}
              <div className="text-blue-500 pt-1">
                 <WeatherIcon />
              </div>
              <div className="flex-1">
                 <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-700 flex items-center gap-2">
                        {dayData?.weather?.desc} 
                        <span className="text-xs font-normal text-slate-400 bg-white px-2 py-0.5 rounded-full">{dayData?.weather?.temp}</span>
                    </p>
                    {/* Tenki.jp Button */}
                    <button 
                        onClick={() => {
                            const link = dayData.weatherLink || `https://tenki.jp/search/?keyword=${encodeURIComponent(dayData.location || '')}`;
                            window.open(link, '_blank');
                        }}
                        className="text-[10px] font-bold text-white bg-red-500 px-2 py-1 rounded shadow-sm hover:bg-red-600 transition flex items-center gap-1"
                    >
                        <Sun size={10} /> Tenki.jp 預報
                    </button>
                 </div>
                 <p className="text-xs text-slate-500 mt-2 leading-relaxed">{dayData?.clothing}</p>
              </div>
           </div>

           <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100">
              {dayData?.events.map((event, idx) => (
                 <div key={idx} className="relative flex items-start gap-4 group">
                    <div className="z-10 bg-white p-1 rounded-full border border-slate-100 shadow-sm">
                        {renderIcon(event.icon, event.type)}
                    </div>
                    <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 hover:shadow-md transition duration-200 relative">
                       {isEditMode && (
                        <div className="absolute top-2 right-2 flex gap-1">
                            <button 
                                onClick={() => handleDelete({ type: 'itinerary', dayIndex, eventIndex: idx })}
                                className="p-1.5 bg-red-50 rounded-full shadow-sm text-red-400 hover:text-red-600"
                            >
                                <Trash2 size={14} />
                            </button>
                            <button 
                                onClick={() => setEditingItem({ type: 'itinerary', dayIndex, eventIndex: idx, data: event })}
                                className="p-1.5 bg-white rounded-full shadow-sm text-slate-400 hover:text-teal-600"
                            >
                                <Edit2 size={14} />
                            </button>
                        </div>
                      )}
                       <div className="flex justify-between items-start mb-1 pr-6">
                        <h4 className="font-bold text-slate-700 text-base">{event.title}</h4>
                        <span className="text-xs font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">{event.time}</span>
                      </div>
                      {event.note && (<p className="text-sm text-slate-500 mt-1">{event.note}</p>)}
                      
                      {/* Attachment Button */}
                      {event.attachment && (
                         <button 
                            onClick={() => setPreviewAttachment(event.attachment)}
                            className="w-full mt-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-300 transition"
                         >
                             <QrCode size={14} /> 查看 QR / 憑證
                         </button>
                      )}

                      <div className="flex gap-2 mt-3">
                          {event.mapLink && (
                             <button 
                                onClick={() => openMapLink(event.mapLink)} 
                                className="text-xs flex items-center gap-1 text-blue-600 font-bold bg-white px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-50 transition w-fit"
                             >
                                <ExternalLinkIcon size={12} /> 開啟地圖
                             </button>
                          )}
                          
                          {event.mapQuery && (
                             <button 
                                onClick={() => toggleMap(event.id)} 
                                className="text-xs flex items-center gap-1 text-slate-500 font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition w-fit"
                             >
                                <Map size={12} /> {expandedMaps[event.id] ? "收起預覽" : "地圖預覽"}
                             </button>
                          )}
                      </div>
                      
                      {expandedMaps[event.id] && <EmbeddedMap query={event.mapQuery} />}
                    </div>
                 </div>
              ))}
              
              {/* Add New Event Button */}
              {isEditMode && (
                <div className="relative flex items-center gap-4">
                   <div className="z-10 bg-slate-100 p-1 rounded-full border border-slate-200 text-slate-400"><Plus size={16}/></div>
                   <button 
                     onClick={() => setEditingItem({ type: 'new_itinerary_event', dayIndex, data: { time: '', title: '', note: '', type: 'sight', attachment: '' } })}
                     className="flex-1 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-bold flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition"
                   >
                     新增行程
                   </button>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  };

  const renderListView = (type) => {
    const isFood = type === 'food';
    const items = isFood ? data.food : data.sights;
    const title = isFood ? "美食清單" : "景點清單";
    const toggleCheck = isFood ? toggleFoodCheck : toggleSightCheck;

    return (
      <div className="pb-24 animate-fadeIn">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
          {title}
          {isEditMode && <span className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded font-normal">編輯模式</span>}
        </h2>
        <div className="grid grid-cols-1 gap-4">
           {items.map((item, idx) => (
             <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 relative">
                {isEditMode && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    <button 
                        onClick={() => handleDelete({ type: isFood ? 'food' : 'sight', itemIndex: idx })}
                        className="p-1.5 bg-red-50 rounded-full shadow-sm text-red-400 hover:text-red-600"
                    >
                        <Trash2 size={14} />
                    </button>
                    <button 
                        onClick={() => setEditingItem({ type: isFood ? 'food' : 'sight', itemIndex: idx, data: item })}
                        className="p-1.5 bg-white/80 rounded-full shadow-sm text-slate-400 hover:text-teal-600"
                    >
                        <Edit2 size={14} />
                    </button>
                  </div>
                )}
                {/* Card Content */}
                <div className="flex items-start gap-4">
                   {/* Image Area */}
                   <div className="w-20 h-20 bg-slate-100 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            renderIcon(item.icon, isFood ? 'food' : 'sight')
                        )}
                   </div>

                   <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-lg truncate ${item.checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{item.name}</h3>
                      <div className="flex gap-2 mb-1">
                         {item.isVegan && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">VEGAN</span>}
                         {item.type && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{item.type}</span>}
                      </div>
                      {item.note && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.note}</p>}
                      
                      {isFood && item.menuItems && (
                         <div className="mt-2 pl-2 border-l-2 border-slate-100">
                            {item.menuItems.map((menu, mIdx) => (
                               <p key={mIdx} className="text-xs text-slate-400 truncate">• {menu}</p>
                            ))}
                         </div>
                      )}

                      {/* Map Buttons */}
                      <div className="flex gap-2 mt-3">
                          {item.mapLink && (
                             <button 
                                onClick={() => openMapLink(item.mapLink)} 
                                className="text-xs flex items-center gap-1 text-blue-600 font-bold bg-white px-2 py-1 rounded-lg border border-blue-100 hover:bg-blue-50 transition"
                             >
                                <ExternalLinkIcon size={12} /> 地圖
                             </button>
                          )}
                          {item.mapQuery && (
                             <button 
                                onClick={() => toggleMap(`${type}-${idx}`)} 
                                className="text-xs flex items-center gap-1 text-slate-500 font-bold bg-white px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                             >
                                <Map size={12} /> {expandedMaps[`${type}-${idx}`] ? "收起" : "預覽"}
                             </button>
                          )}
                      </div>
                      
                      {expandedMaps[`${type}-${idx}`] && <EmbeddedMap query={item.mapQuery} />}
                   </div>
                   <button onClick={() => toggleCheck(idx)} className={`w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0 ${item.checked ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-lg' : 'bg-slate-50 text-slate-300'}`}>
                     <CheckCircle2 size={20} />
                   </button>
                </div>
             </div>
           ))}
           
           {/* Add New Item Button */}
           {isEditMode && (
             <button 
               onClick={() => setEditingItem({ type: isFood ? 'new_food' : 'new_sight', data: { name: '', note: '', type: isFood ? '餐廳' : '景點', icon: isFood ? 'utensils' : 'camera' } })}
               className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition"
             >
               <Plus size={18}/> 新增{isFood ? '餐廳' : '景點'}
             </button>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex justify-center">
      <EditModal />
      <SettingsModal />
      <ImportModal />
      <ProductCard />
      <ConfirmModal />
      <ReceiptModal />
      <ImagePreviewModal src={previewAttachment} onClose={() => setPreviewAttachment(null)} />

      <div className="w-full max-w-md bg-slate-50 min-h-screen relative shadow-2xl flex flex-col">
        <header className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200/50">
           {isEditMode ? (
               <button 
                 onClick={() => setEditingItem({ type: 'app_header', data: { appName: data.appName, icon: data.appIcon } })}
                 className="font-black text-xl tracking-tight text-slate-800 flex items-center gap-2 hover:bg-slate-100 p-1 -ml-1 rounded-lg transition border border-dashed border-slate-300"
               >
                 <div className="w-8 h-8 bg-gradient-to-tr from-teal-400 to-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                   {(() => {
                       const HeaderIcon = ICON_MAP[data.appIcon || 'map'];
                       return <HeaderIcon size={18} />;
                   })()}
                 </div>
                 {data.appName} <Edit2 size={14} className="text-slate-400"/>
               </button>
           ) : (
               <div className="font-black text-xl tracking-tight text-slate-800 flex items-center gap-2">
                 <div className="w-8 h-8 bg-gradient-to-tr from-teal-400 to-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                   {(() => {
                       const HeaderIcon = ICON_MAP[data.appIcon || 'map'];
                       return <HeaderIcon size={18} />;
                   })()}
                 </div>
                 {data.appName}
               </div>
           )}
           
           <div className="flex gap-2">
               {/* 編輯模式開關 - 現在與設定選單分開了 */}
               <button 
                 onClick={() => setIsEditMode(!isEditMode)} 
                 className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition ${isEditMode ? 'bg-teal-500 text-white shadow-md shadow-teal-200' : 'bg-white text-slate-500 border border-slate-200'}`}
               >
                 {isEditMode ? <Check size={14} strokeWidth={3} /> : <Edit2 size={14} />}
                 {isEditMode ? '完成' : '編輯'}
               </button>

               {/* 設定選單開關 */}
               <button 
                 onClick={() => setShowSettings(true)} 
                 className="w-8 h-8 rounded-full bg-white text-slate-400 border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:text-slate-600 transition"
               >
                 <Settings size={16} />
               </button>
           </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto no-scrollbar">
          {activeTab === 'home' && renderHomeView()}
          {activeTab === 'itinerary' && renderItineraryView()}
          {activeTab === 'stay' && renderStayView()}
          {activeTab === 'packing' && renderPackingView()}
          {activeTab === 'sight' && renderListView('sight')}
          {activeTab === 'food' && renderListView('food')}
          {activeTab === 'shopping' && renderShoppingView()}
          {activeTab === 'transport' && renderTransportView()}
          {activeTab === 'phrases' && renderPhrasesView()}
          {activeTab === 'info' && renderInfoView()}
        </main>
        <nav className="fixed bottom-0 max-w-md w-full bg-white border-t border-slate-100 z-40 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
           <div className="flex items-center space-x-2 py-2 px-2 overflow-x-auto no-scrollbar scroll-smooth">
             <NavButton active={activeTab} name="home" icon={Map} label="首頁" setTab={setActiveTab} />
             <NavButton active={activeTab} name="itinerary" icon={Calendar} label="行程" setTab={setActiveTab} />
             <NavButton active={activeTab} name="packing" icon={Briefcase} label="打包" setTab={setActiveTab} />
             <NavButton active={activeTab} name="food" icon={Utensils} label="美食" setTab={setActiveTab} />
             <NavButton active={activeTab} name="sight" icon={Camera} label="景點" setTab={setActiveTab} />
             <NavButton active={activeTab} name="shopping" icon={ShoppingBag} label="購物" setTab={setActiveTab} />
             <NavButton active={activeTab} name="transport" icon={Train} label="交通" setTab={setActiveTab} />
             <NavButton active={activeTab} name="info" icon={Info} label="更多" setTab={setActiveTab} />
           </div>
        </nav>
      </div>
    </div>
  );
};

export default App;