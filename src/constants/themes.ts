// Shared theme definitions for card styles
// Used by both AppCard.vue (display) and share-poster.vue (poster generation)

export interface ThemeDef {
  id: string;
  themeId: string;
  name: string;
  emoji?: string;
  bg: string; // CSS gradient string
  textColor: string;
  mutedColor: string;
  accentColor: string;
  borderCSS?: string;
  shadowCSS?: string;
}

export const allThemeStyles: Record<string, ThemeDef> = {
  // 十二生肖 - warm ink-wash style
  "zodiac-rat":    { id: "zodiac-rat",    themeId: "zodiac", name: "灵鼠献瑞", emoji: "🐀", bg: "linear-gradient(145deg, #FDF5EE 0%, #F8E8D4 50%, #FDEBD0 100%)", textColor: "#4A3728", mutedColor: "#8B7355", accentColor: "#C9956B", borderCSS: "2rpx solid rgba(201,149,107,0.2)", shadowCSS: "0 8rpx 24rpx rgba(201,149,107,0.12)" },
  "zodiac-ox":     { id: "zodiac-ox",     themeId: "zodiac", name: "金牛迎福", emoji: "🐂", bg: "linear-gradient(145deg, #FFF8E7 0%, #F5E6C8 50%, #EDD9A3 100%)", textColor: "#5C4A1E", mutedColor: "#9B8455", accentColor: "#D4A843", borderCSS: "2rpx solid rgba(212,168,67,0.2)", shadowCSS: "0 8rpx 24rpx rgba(212,168,67,0.1)" },
  "zodiac-tiger":  { id: "zodiac-tiger",  themeId: "zodiac", name: "福虎生威", emoji: "🐯", bg: "linear-gradient(145deg, #FFF3E0 0%, #FFE0B2 50%, #FFCC80 100%)", textColor: "#5D3A1A", mutedColor: "#A67C52", accentColor: "#E8863A", borderCSS: "2rpx solid rgba(232,134,58,0.18)", shadowCSS: "0 8rpx 24rpx rgba(232,134,58,0.1)" },
  "zodiac-rabbit": { id: "zodiac-rabbit", themeId: "zodiac", name: "玉兔呈祥", emoji: "🐰", bg: "linear-gradient(145deg, #FFF0F5 0%, #F8DDE8 50%, #F0C4D8 100%)", textColor: "#5A2D3E", mutedColor: "#A37085", accentColor: "#D4799A", borderCSS: "2rpx solid rgba(212,121,154,0.18)", shadowCSS: "0 8rpx 24rpx rgba(212,121,154,0.1)" },
  "zodiac-dragon": { id: "zodiac-dragon", themeId: "zodiac", name: "祥龙腾飞", emoji: "🐉", bg: "linear-gradient(145deg, #E8F0FE 0%, #C5D9F2 50%, #A8C8E8 100%)", textColor: "#1A3A5C", mutedColor: "#5A7FA0", accentColor: "#4080B0", borderCSS: "2rpx solid rgba(64,128,176,0.18)", shadowCSS: "0 8rpx 24rpx rgba(64,128,176,0.1)" },
  "zodiac-snake":  { id: "zodiac-snake",  themeId: "zodiac", name: "灵蛇起舞", emoji: "🐍", bg: "linear-gradient(145deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)", textColor: "#1B5E20", mutedColor: "#558B2F", accentColor: "#66BB6A", borderCSS: "2rpx solid rgba(102,187,106,0.18)", shadowCSS: "0 8rpx 24rpx rgba(102,187,106,0.1)" },
  "zodiac-horse":  { id: "zodiac-horse",  themeId: "zodiac", name: "骏马奔腾", emoji: "🐴", bg: "linear-gradient(145deg, #FFF8E1 0%, #FFECB3 50%, #FFE082 100%)", textColor: "#5D4037", mutedColor: "#A1887F", accentColor: "#D4A04A", borderCSS: "2rpx solid rgba(212,160,74,0.18)", shadowCSS: "0 8rpx 24rpx rgba(212,160,74,0.1)" },
  "zodiac-goat":   { id: "zodiac-goat",   themeId: "zodiac", name: "吉羊开泰", emoji: "🐑", bg: "linear-gradient(145deg, #F3E5F5 0%, #E1BEE7 50%, #CE93D8 100%)", textColor: "#4A148C", mutedColor: "#8E6CB0", accentColor: "#AB47BC", borderCSS: "2rpx solid rgba(171,71,188,0.18)", shadowCSS: "0 8rpx 24rpx rgba(171,71,188,0.1)" },
  "zodiac-monkey": { id: "zodiac-monkey", themeId: "zodiac", name: "金猴献寿", emoji: "🐵", bg: "linear-gradient(145deg, #FFF3E0 0%, #FFCCBC 50%, #FFAB91 100%)", textColor: "#4E342E", mutedColor: "#A08272", accentColor: "#E07040", borderCSS: "2rpx solid rgba(224,112,64,0.18)", shadowCSS: "0 8rpx 24rpx rgba(224,112,64,0.1)" },
  "zodiac-rooster":{ id: "zodiac-rooster",themeId: "zodiac", name: "雄鸡报晓", emoji: "🐓", bg: "linear-gradient(145deg, #FFFDE7 0%, #FFF9C4 50%, #FFF176 100%)", textColor: "#5D4037", mutedColor: "#A09860", accentColor: "#F9A825", borderCSS: "2rpx solid rgba(249,168,37,0.18)", shadowCSS: "0 8rpx 24rpx rgba(249,168,37,0.1)" },
  "zodiac-dog":    { id: "zodiac-dog",    themeId: "zodiac", name: "瑞犬守护", emoji: "🐶", bg: "linear-gradient(145deg, #EFEBE9 0%, #D7CCC8 50%, #BCAAA4 100%)", textColor: "#3E2723", mutedColor: "#8D6E63", accentColor: "#A1887F", borderCSS: "2rpx solid rgba(161,136,127,0.18)", shadowCSS: "0 8rpx 24rpx rgba(161,136,127,0.1)" },
  "zodiac-pig":    { id: "zodiac-pig",    themeId: "zodiac", name: "福猪拱门", emoji: "🐷", bg: "linear-gradient(145deg, #FCE4EC 0%, #F8BBD0 50%, #F48FB1 100%)", textColor: "#5C1528", mutedColor: "#B06080", accentColor: "#E91E63", borderCSS: "2rpx solid rgba(233,30,99,0.14)", shadowCSS: "0 8rpx 24rpx rgba(233,30,99,0.08)" },

  // 十二星座 - dreamy cosmic style
  "horoscope-aries":     { id: "horoscope-aries",     themeId: "horoscope", name: "白羊座 ♈", bg: "linear-gradient(145deg, #FFE5E5 0%, #FFB3B3 50%, #FF8A80 100%)", textColor: "#7F1D1D", mutedColor: "#B85555", accentColor: "#EF5350", borderCSS: "2rpx solid rgba(239,83,80,0.15)", shadowCSS: "0 8rpx 24rpx rgba(239,83,80,0.1)" },
  "horoscope-taurus":    { id: "horoscope-taurus",    themeId: "horoscope", name: "金牛座 ♉", bg: "linear-gradient(145deg, #E8F5E9 0%, #A5D6A7 50%, #81C784 100%)", textColor: "#1B5E20", mutedColor: "#4CAF50", accentColor: "#43A047", borderCSS: "2rpx solid rgba(67,160,71,0.15)", shadowCSS: "0 8rpx 24rpx rgba(67,160,71,0.1)" },
  "horoscope-gemini":    { id: "horoscope-gemini",    themeId: "horoscope", name: "双子座 ♊", bg: "linear-gradient(145deg, #FFF8E1 0%, #FFF3C4 50%, #FFEE9C 100%)", textColor: "#5D4037", mutedColor: "#C9A84C", accentColor: "#FFB300", borderCSS: "2rpx solid rgba(255,179,0,0.15)", shadowCSS: "0 8rpx 24rpx rgba(255,179,0,0.1)" },
  "horoscope-cancer":    { id: "horoscope-cancer",    themeId: "horoscope", name: "巨蟹座 ♋", bg: "linear-gradient(145deg, #E0F7FA 0%, #B2EBF2 50%, #80DEEA 100%)", textColor: "#004D40", mutedColor: "#4DB6AC", accentColor: "#00ACC1", borderCSS: "2rpx solid rgba(0,172,193,0.15)", shadowCSS: "0 8rpx 24rpx rgba(0,172,193,0.1)" },
  "horoscope-leo":       { id: "horoscope-leo",       themeId: "horoscope", name: "狮子座 ♌", bg: "linear-gradient(145deg, #FFF3E0 0%, #FFE0B2 50%, #FFCC80 100%)", textColor: "#5D3A1A", mutedColor: "#E8863A", accentColor: "#FB8C00", borderCSS: "2rpx solid rgba(251,140,0,0.15)", shadowCSS: "0 8rpx 24rpx rgba(251,140,0,0.1)" },
  "horoscope-virgo":     { id: "horoscope-virgo",     themeId: "horoscope", name: "处女座 ♍", bg: "linear-gradient(145deg, #F3E5F5 0%, #E1BEE7 50%, #CE93D8 100%)", textColor: "#4A148C", mutedColor: "#9C27B0", accentColor: "#8E24AA", borderCSS: "2rpx solid rgba(142,36,170,0.15)", shadowCSS: "0 8rpx 24rpx rgba(142,36,170,0.1)" },
  "horoscope-libra":     { id: "horoscope-libra",     themeId: "horoscope", name: "天秤座 ♎", bg: "linear-gradient(145deg, #FCE4EC 0%, #F8BBD0 50%, #F48FB1 100%)", textColor: "#5C1528", mutedColor: "#E91E63", accentColor: "#D81B60", borderCSS: "2rpx solid rgba(216,27,96,0.15)", shadowCSS: "0 8rpx 24rpx rgba(216,27,96,0.08)" },
  "horoscope-scorpio":   { id: "horoscope-scorpio",   themeId: "horoscope", name: "天蝎座 ♏", bg: "linear-gradient(145deg, #EDE7F6 0%, #B39DDB 50%, #9575CD 100%)", textColor: "#1A0033", mutedColor: "#7E57C2", accentColor: "#5E35B1", borderCSS: "2rpx solid rgba(94,53,177,0.15)", shadowCSS: "0 8rpx 24rpx rgba(94,53,177,0.1)" },
  "horoscope-sagittarius":{ id: "horoscope-sagittarius",themeId: "horoscope", name: "射手座 ♐", bg: "linear-gradient(145deg, #E8EAF6 0%, #C5CAE9 50%, #9FA8DA 100%)", textColor: "#1A237E", mutedColor: "#5C6BC0", accentColor: "#3F51B5", borderCSS: "2rpx solid rgba(63,81,181,0.15)", shadowCSS: "0 8rpx 24rpx rgba(63,81,181,0.1)" },
  "horoscope-capricorn": { id: "horoscope-capricorn", themeId: "horoscope", name: "摩羯座 ♑", bg: "linear-gradient(145deg, #EFEBE9 0%, #BCAAA4 50%, #A1887F 100%)", textColor: "#3E2723", mutedColor: "#795548", accentColor: "#5D4037", borderCSS: "2rpx solid rgba(93,64,55,0.15)", shadowCSS: "0 8rpx 24rpx rgba(93,64,55,0.1)" },
  "horoscope-aquarius":  { id: "horoscope-aquarius",  themeId: "horoscope", name: "水瓶座 ♒", bg: "linear-gradient(145deg, #E0F7FA 0%, #80DEEA 50%, #4DD0E1 100%)", textColor: "#006064", mutedColor: "#00ACC1", accentColor: "#0097A7", borderCSS: "2rpx solid rgba(0,151,167,0.15)", shadowCSS: "0 8rpx 24rpx rgba(0,151,167,0.1)" },
  "horoscope-pisces":    { id: "horoscope-pisces",    themeId: "horoscope", name: "双鱼座 ♓", bg: "linear-gradient(145deg, #E8EAF6 0%, #B3C6E8 50%, #8EA8D8 100%)", textColor: "#1A3A6C", mutedColor: "#5C7CB0", accentColor: "#3F60A8", borderCSS: "2rpx solid rgba(63,96,168,0.15)", shadowCSS: "0 8rpx 24rpx rgba(63,96,168,0.1)" },

  // 自然风景 - watercolor ink style
  "scenery-forest":  { id: "scenery-forest",  themeId: "scenery", name: "绿野仙踪", emoji: "🌲", bg: "linear-gradient(145deg, #E8F5E9 0%, #C8E6C9 40%, #A5D6A7 100%)", textColor: "#1B5E20", mutedColor: "#558B2F", accentColor: "#4CAF50", borderCSS: "2rpx solid rgba(76,175,80,0.15)", shadowCSS: "0 8rpx 24rpx rgba(76,175,80,0.1)" },
  "scenery-ocean":   { id: "scenery-ocean",   themeId: "scenery", name: "深蓝海岸", emoji: "🌊", bg: "linear-gradient(145deg, #E0F7FA 0%, #B2EBF2 40%, #80DEEA 100%)", textColor: "#004D40", mutedColor: "#00838F", accentColor: "#00ACC1", borderCSS: "2rpx solid rgba(0,172,193,0.15)", shadowCSS: "0 8rpx 24rpx rgba(0,172,193,0.1)" },
  "scenery-snow":    { id: "scenery-snow",    themeId: "scenery", name: "雪国圣殿", emoji: "🏔️", bg: "linear-gradient(145deg, #F5F7FA 0%, #E8EEF4 40%, #D0DAE8 100%)", textColor: "#2C3E50", mutedColor: "#7F8C9A", accentColor: "#5D7B93", borderCSS: "2rpx solid rgba(93,123,147,0.15)", shadowCSS: "0 8rpx 24rpx rgba(93,123,147,0.08)" },
  "scenery-sunset":  { id: "scenery-sunset",  themeId: "scenery", name: "霞光万道", emoji: "🌅", bg: "linear-gradient(145deg, #FFF3E0 0%, #FFCC80 40%, #FFB74D 100%)", textColor: "#5D3A1A", mutedColor: "#C88540", accentColor: "#FB8C00", borderCSS: "2rpx solid rgba(251,140,0,0.15)", shadowCSS: "0 8rpx 24rpx rgba(251,140,0,0.1)" },
  "scenery-starry":  { id: "scenery-starry",  themeId: "scenery", name: "璀璨星河", emoji: "🌃", bg: "linear-gradient(145deg, #1A1A2E 0%, #16213E 40%, #0F3460 100%)", textColor: "#E0E0E0", mutedColor: "#90A4AE", accentColor: "#FFD54F", borderCSS: "2rpx solid rgba(255,213,79,0.2)", shadowCSS: "0 8rpx 24rpx rgba(15,52,96,0.2)" },
  "scenery-desert":  { id: "scenery-desert",  themeId: "scenery", name: "浩瀚大漠", emoji: "🏜️", bg: "linear-gradient(145deg, #FFF8E1 0%, #FFE082 40%, #FFD54F 100%)", textColor: "#5D4037", mutedColor: "#A1887F", accentColor: "#FF8F00", borderCSS: "2rpx solid rgba(255,143,0,0.15)", shadowCSS: "0 8rpx 24rpx rgba(255,143,0,0.1)" },

  // 可爱萌宠 - pastel kawaii style
  "pets-cat":     { id: "pets-cat",     themeId: "pets", name: "慵懒小橘", emoji: "🐱", bg: "linear-gradient(145deg, #FFF3E0 0%, #FFE0B2 40%, #FFCC80 100%)", textColor: "#5D3A1A", mutedColor: "#C88540", accentColor: "#FB8C00", borderCSS: "2rpx solid rgba(251,140,0,0.15)", shadowCSS: "0 8rpx 24rpx rgba(251,140,0,0.1)" },
  "pets-dog":     { id: "pets-dog",     themeId: "pets", name: "治愈萨摩", emoji: "🐕", bg: "linear-gradient(145deg, #F5F5F5 0%, #E0E0E0 40%, #BDBDBD 100%)", textColor: "#37474F", mutedColor: "#78909C", accentColor: "#607D8B", borderCSS: "2rpx solid rgba(96,125,139,0.15)", shadowCSS: "0 8rpx 24rpx rgba(96,125,139,0.08)" },
  "pets-bunny":   { id: "pets-bunny",   themeId: "pets", name: "乖萌垂耳", emoji: "🐰", bg: "linear-gradient(145deg, #FCE4EC 0%, #F8BBD0 40%, #F48FB1 100%)", textColor: "#5C1528", mutedColor: "#C2185B", accentColor: "#E91E63", borderCSS: "2rpx solid rgba(233,30,99,0.12)", shadowCSS: "0 8rpx 24rpx rgba(233,30,99,0.08)" },
  "pets-fox":     { id: "pets-fox",     themeId: "pets", name: "机灵红狐", emoji: "🦊", bg: "linear-gradient(145deg, #FBE9E7 0%, #FFAB91 40%, #FF8A65 100%)", textColor: "#4E342E", mutedColor: "#E64A19", accentColor: "#FF5722", borderCSS: "2rpx solid rgba(255,87,34,0.15)", shadowCSS: "0 8rpx 24rpx rgba(255,87,34,0.1)" },
  "pets-panda":   { id: "pets-panda",   themeId: "pets", name: "胖哒团子", emoji: "🐼", bg: "linear-gradient(145deg, #FAFAFA 0%, #E8E8E8 40%, #D0D0D0 100%)", textColor: "#212121", mutedColor: "#616161", accentColor: "#424242", borderCSS: "2rpx solid rgba(66,66,66,0.15)", shadowCSS: "0 8rpx 24rpx rgba(66,66,66,0.08)" },
  "pets-hamster": { id: "pets-hamster", themeId: "pets", name: "仓鼠团团", emoji: "🐹", bg: "linear-gradient(145deg, #FFF8E1 0%, #FFECB3 40%, #FFE082 100%)", textColor: "#5D4037", mutedColor: "#C9A84C", accentColor: "#FFB300", borderCSS: "2rpx solid rgba(255,179,0,0.15)", shadowCSS: "0 8rpx 24rpx rgba(255,179,0,0.1)" },

  // 治愈系 - 温暖治愈画风
  "healing-garden":    { id: "healing-garden",    themeId: "healing", name: "治愈花园", emoji: "🌸", bg: "linear-gradient(145deg, #FFF5F8 0%, #FFE4EC 40%, #FFC8D6 100%)", textColor: "#6B2D3E", mutedColor: "#B06080", accentColor: "#E8879B", borderCSS: "2rpx solid rgba(232,135,155,0.15)", shadowCSS: "0 8rpx 24rpx rgba(232,135,155,0.08)" },
  "healing-sunshine":  { id: "healing-sunshine",  themeId: "healing", name: "温暖阳光", emoji: "☀️", bg: "linear-gradient(145deg, #FFFCE0 0%, #FFF3A0 40%, #FFE57F 100%)", textColor: "#5D4A1E", mutedColor: "#B89E40", accentColor: "#F9A825", borderCSS: "2rpx solid rgba(249,168,37,0.15)", shadowCSS: "0 8rpx 24rpx rgba(249,168,37,0.08)" },
  "healing-cloud":     { id: "healing-cloud",     themeId: "healing", name: "云端漫步", emoji: "☁️", bg: "linear-gradient(145deg, #F0F8FF 0%, #D4EAFF 40%, #A8D4F0 100%)", textColor: "#2C4A6E", mutedColor: "#6B8EB0", accentColor: "#5B9BD5", borderCSS: "2rpx solid rgba(91,155,213,0.15)", shadowCSS: "0 8rpx 24rpx rgba(91,155,213,0.08)" },
  "healing-sakura":    { id: "healing-sakura",    themeId: "healing", name: "樱花纷飞", emoji: "🌺", bg: "linear-gradient(145deg, #FFF0F5 0%, #FFD6E0 40%, #FFB6C8 100%)", textColor: "#5C1A2E", mutedColor: "#B06080", accentColor: "#E47A9B", borderCSS: "2rpx solid rgba(228,122,155,0.15)", shadowCSS: "0 8rpx 24rpx rgba(228,122,155,0.08)" },
  "healing-forest":    { id: "healing-forest",    themeId: "healing", name: "森林氧吧", emoji: "🌿", bg: "linear-gradient(145deg, #F0FFF0 0%, #C8F0C8 40%, #A0D8A0 100%)", textColor: "#1A4A1A", mutedColor: "#5A8A5A", accentColor: "#4CAF50", borderCSS: "2rpx solid rgba(76,175,80,0.15)", shadowCSS: "0 8rpx 24rpx rgba(76,175,80,0.08)" },
  "healing-sea":       { id: "healing-sea",       themeId: "healing", name: "海边微风", emoji: "🐚", bg: "linear-gradient(145deg, #F0FFFE 0%, #C8F5F5 40%, #A0E4E4 100%)", textColor: "#1A4A4A", mutedColor: "#5A8A8A", accentColor: "#26A69A", borderCSS: "2rpx solid rgba(38,166,154,0.15)", shadowCSS: "0 8rpx 24rpx rgba(38,166,154,0.08)" },
  "healing-dusk":      { id: "healing-dusk",      themeId: "healing", name: "暮色温柔", emoji: "🌇", bg: "linear-gradient(145deg, #FFF0F0 0%, #FFD8D0 40%, #FFB8A8 100%)", textColor: "#5C2A2A", mutedColor: "#B07060", accentColor: "#E08070", borderCSS: "2rpx solid rgba(224,128,112,0.15)", shadowCSS: "0 8rpx 24rpx rgba(224,128,112,0.08)" },
  "healing-tea":       { id: "healing-tea",       themeId: "healing", name: "茶香袅袅", emoji: "🍵", bg: "linear-gradient(145deg, #FAF5E8 0%, #F0E4C8 40%, #E0D0A8 100%)", textColor: "#4A3A1A", mutedColor: "#9A8A5A", accentColor: "#8D7B4A", borderCSS: "2rpx solid rgba(141,123,74,0.15)", shadowCSS: "0 8rpx 24rpx rgba(141,123,74,0.08)" },
  "healing-lavender":  { id: "healing-lavender",  themeId: "healing", name: "薰衣草田", emoji: "💜", bg: "linear-gradient(145deg, #F8F0FF 0%, #E8D0FF 40%, #D0B0F0 100%)", textColor: "#3A1A5C", mutedColor: "#8A60B0", accentColor: "#9C70D0", borderCSS: "2rpx solid rgba(156,112,208,0.15)", shadowCSS: "0 8rpx 24rpx rgba(156,112,208,0.08)" },
  "healing-rain":      { id: "healing-rain",      themeId: "healing", name: "雨后彩虹", emoji: "🌈", bg: "linear-gradient(145deg, #F0F4FF 0%, #D0E0FF 40%, #B0D0F8 100%)", textColor: "#1A2A5C", mutedColor: "#6080B0", accentColor: "#5070C0", borderCSS: "2rpx solid rgba(80,112,192,0.15)", shadowCSS: "0 8rpx 24rpx rgba(80,112,192,0.08)" },
  "healing-coffee":    { id: "healing-coffee",    themeId: "healing", name: "午后咖啡", emoji: "☕", bg: "linear-gradient(145deg, #FFF8F0 0%, #FFE8D0 40%, #FFD0B0 100%)", textColor: "#4A2A1A", mutedColor: "#A07050", accentColor: "#C08050", borderCSS: "2rpx solid rgba(192,128,80,0.15)", shadowCSS: "0 8rpx 24rpx rgba(192,128,80,0.08)" },
  "healing-meadow":    { id: "healing-meadow",    themeId: "healing", name: "青草原野", emoji: "🌻", bg: "linear-gradient(145deg, #FFFFF0 0%, #F8F8C8 40%, #E8E898 100%)", textColor: "#3A3A1A", mutedColor: "#8A8A4A", accentColor: "#A0A040", borderCSS: "2rpx solid rgba(160,160,64,0.15)", shadowCSS: "0 8rpx 24rpx rgba(160,160,64,0.08)" },

  // 普通卡片 - 多样化基础样式（40种独特配色）
  // 中性色系
  "default-minimal":    { id: "default-minimal",    themeId: "default", name: "简约白", bg: "linear-gradient(145deg, #FFFFFF 0%, #F8F9FA 100%)", textColor: "#212529", mutedColor: "#6C757D", accentColor: "#007BFF", borderCSS: "1rpx solid #E9ECEF", shadowCSS: "0 4rpx 12rpx rgba(0,0,0,0.05)" },
  "default-elegant":    { id: "default-elegant",    themeId: "default", name: "优雅灰", bg: "linear-gradient(145deg, #F8F9FA 0%, #E9ECEF 100%)", textColor: "#343A40", mutedColor: "#6C757D", accentColor: "#495057", borderCSS: "1rpx solid #DEE2E6", shadowCSS: "0 4rpx 12rpx rgba(0,0,0,0.08)" },
  "default-slate":     { id: "default-slate",     themeId: "default", name: "石板灰", bg: "linear-gradient(145deg, #ECEFF1 0%, #CFD8DC 100%)", textColor: "#263238", mutedColor: "#546E7A", accentColor: "#37474F", borderCSS: "1rpx solid rgba(55,71,79,0.1)", shadowCSS: "0 4rpx 12rpx rgba(55,71,79,0.08)" },
  "default-graphite":  { id: "default-graphite",  themeId: "default", name: "石墨黑", bg: "linear-gradient(145deg, #37474F 0%, #263238 100%)", textColor: "#FFFFFF", mutedColor: "#90A4AE", accentColor: "#607D8B", borderCSS: "1rpx solid rgba(96,125,139,0.2)", shadowCSS: "0 4rpx 12rpx rgba(38,50,56,0.2)" },

  // 暖色系
  "default-warm":      { id: "default-warm",      themeId: "default", name: "暖米", bg: "linear-gradient(145deg, #FFF8E1 0%, #FFECB3 100%)", textColor: "#5D4037", mutedColor: "#8D6E63", accentColor: "#FF8F00", borderCSS: "1rpx solid rgba(255,143,0,0.1)", shadowCSS: "0 4rpx 12rpx rgba(255,143,0,0.08)" },
  "default-peach":     { id: "default-peach",     themeId: "default", name: "蜜桃", bg: "linear-gradient(145deg, #FFF3E0 0%, #FFE0B2 100%)", textColor: "#E65100", mutedColor: "#FF8F00", accentColor: "#FF6F00", borderCSS: "1rpx solid rgba(255,111,0,0.1)", shadowCSS: "0 4rpx 12rpx rgba(255,111,0,0.08)" },
  "default-coral":    { id: "default-coral",    themeId: "default", name: "珊瑚", bg: "linear-gradient(145deg, #FBE9E7 0%, #FFCCBC 100%)", textColor: "#BF360C", mutedColor: "#FF7043", accentColor: "#FF5722", borderCSS: "1rpx solid rgba(255,87,34,0.1)", shadowCSS: "0 4rpx 12rpx rgba(255,87,34,0.08)" },
  "default-rose":     { id: "default-rose",     themeId: "default", name: "玫瑰", bg: "linear-gradient(145deg, #FCE4EC 0%, #F8BBD0 100%)", textColor: "#880E4F", mutedColor: "#E91E63", accentColor: "#C2185B", borderCSS: "1rpx solid rgba(193,24,91,0.1)", shadowCSS: "0 4rpx 12rpx rgba(193,24,91,0.08)" },
  "default-cherry":   { id: "default-cherry",   themeId: "default", name: "樱桃", bg: "linear-gradient(145deg, #FFEBEE 0%, #FFCDD2 100%)", textColor: "#B71C1C", mutedColor: "#EF5350", accentColor: "#E53935", borderCSS: "1rpx solid rgba(229,57,53,0.1)", shadowCSS: "0 4rpx 12rpx rgba(229,57,53,0.08)" },
  "default-sunset":   { id: "default-sunset",   themeId: "default", name: "日落", bg: "linear-gradient(145deg, #FF6F00 0%, #FF8F00 100%)", textColor: "#FFFFFF", mutedColor: "#FFE082", accentColor: "#FFC107", borderCSS: "1rpx solid rgba(255,193,7,0.2)", shadowCSS: "0 4rpx 12rpx rgba(255,111,0,0.2)" },

  // 冷色系
  "default-sky":      { id: "default-sky",      themeId: "default", name: "天空", bg: "linear-gradient(145deg, #E1F5FE 0%, #B3E5FC 100%)", textColor: "#01579B", mutedColor: "#29B6F6", accentColor: "#0288D1", borderCSS: "1rpx solid rgba(2,136,209,0.1)", shadowCSS: "0 4rpx 12rpx rgba(2,136,209,0.08)" },
  "default-ocean":    { id: "default-ocean",    themeId: "default", name: "海洋", bg: "linear-gradient(145deg, #E0F7FA 0%, #B2EBF2 100%)", textColor: "#006064", mutedColor: "#00ACC1", accentColor: "#0097A7", borderCSS: "1rpx solid rgba(0,151,167,0.1)", shadowCSS: "0 4rpx 12rpx rgba(0,151,167,0.08)" },
  "default-deep-sea": { id: "default-deep-sea", themeId: "default", name: "深海", bg: "linear-gradient(145deg, #0D47A1 0%, #1565C0 100%)", textColor: "#FFFFFF", mutedColor: "#90CAF9", accentColor: "#42A5F5", borderCSS: "1rpx solid rgba(66,165,245,0.2)", shadowCSS: "0 4rpx 12rpx rgba(13,71,161,0.2)" },
  "default-indigo":   { id: "default-indigo",   themeId: "default", name: "靛蓝", bg: "linear-gradient(145deg, #E8EAF6 0%, #C5CAE9 100%)", textColor: "#1A237E", mutedColor: "#3F51B5", accentColor: "#303F9F", borderCSS: "1rpx solid rgba(48,63,159,0.1)", shadowCSS: "0 4rpx 12rpx rgba(48,63,159,0.08)" },
  "default-night":    { id: "default-night",    themeId: "default", name: "夜空", bg: "linear-gradient(145deg, #0D47A1 0%, #1A237E 100%)", textColor: "#FFFFFF", mutedColor: "#90CAF9", accentColor: "#3F51B5", borderCSS: "1rpx solid rgba(63,81,181,0.2)", shadowCSS: "0 4rpx 12rpx rgba(13,71,161,0.2)" },

  // 自然色系
  "default-leaf":     { id: "default-leaf",     themeId: "default", name: "新叶", bg: "linear-gradient(145deg, #E8F5E9 0%, #C8E6C9 100%)", textColor: "#2E7D32", mutedColor: "#66BB6A", accentColor: "#4CAF50", borderCSS: "1rpx solid rgba(76,175,80,0.1)", shadowCSS: "0 4rpx 12rpx rgba(76,175,80,0.08)" },
  "default-forest":   { id: "default-forest",   themeId: "default", name: "森林", bg: "linear-gradient(145deg, #1B5E20 0%, #2E7D32 100%)", textColor: "#FFFFFF", mutedColor: "#81C784", accentColor: "#4CAF50", borderCSS: "1rpx solid rgba(76,175,80,0.2)", shadowCSS: "0 4rpx 12rpx rgba(27,94,32,0.2)" },
  "default-mint":     { id: "default-mint",     themeId: "default", name: "薄荷", bg: "linear-gradient(145deg, #E0F2F1 0%, #B2DFDB 100%)", textColor: "#004D40", mutedColor: "#26A69A", accentColor: "#00897B", borderCSS: "1rpx solid rgba(0,137,123,0.1)", shadowCSS: "0 4rpx 12rpx rgba(0,137,123,0.08)" },
  "default-olive":    { id: "default-olive",    themeId: "default", name: "橄榄", bg: "linear-gradient(145deg, #F1F8E9 0%, #DCEDC8 100%)", textColor: "#33691E", mutedColor: "#8BC34A", accentColor: "#689F38", borderCSS: "1rpx solid rgba(104,159,56,0.1)", shadowCSS: "0 4rpx 12rpx rgba(104,159,56,0.08)" },
  "default-cinnamon": { id: "default-cinnamon", themeId: "default", name: "肉桂", bg: "linear-gradient(145deg, #EFEBE9 0%, #D7CCC8 100%)", textColor: "#3E2723", mutedColor: "#8D6E63", accentColor: "#5D4037", borderCSS: "1rpx solid rgba(93,64,55,0.1)", shadowCSS: "0 4rpx 12rpx rgba(93,64,55,0.08)" },

  // 梦幻色系
  "default-lavender": { id: "default-lavender", themeId: "default", name: "薰衣草", bg: "linear-gradient(145deg, #F3E5F5 0%, #E1BEE7 100%)", textColor: "#4A148C", mutedColor: "#AB47BC", accentColor: "#9C27B0", borderCSS: "1rpx solid rgba(156,39,176,0.1)", shadowCSS: "0 4rpx 12rpx rgba(156,39,176,0.08)" },
  "default-orchid":   { id: "default-orchid",   themeId: "default", name: "兰花", bg: "linear-gradient(145deg, #F8BBD0 0%, #F48FB1 100%)", textColor: "#880E4F", mutedColor: "#EC407A", accentColor: "#D81B60", borderCSS: "1rpx solid rgba(216,27,96,0.1)", shadowCSS: "0 4rpx 12rpx rgba(216,27,96,0.08)" },
  "default-berry":    { id: "default-berry",    themeId: "default", name: "浆果", bg: "linear-gradient(145deg, #7B1FA2 0%, #9C27B0 100%)", textColor: "#FFFFFF", mutedColor: "#CE93D8", accentColor: "#AB47BC", borderCSS: "1rpx solid rgba(171,71,188,0.2)", shadowCSS: "0 4rpx 12rpx rgba(123,31,162,0.2)" },
  "default-grape":    { id: "default-grape",    themeId: "default", name: "葡萄", bg: "linear-gradient(145deg, #4A148C 0%, #6A1B9A 100%)", textColor: "#FFFFFF", mutedColor: "#BA68C8", accentColor: "#9C27B0", borderCSS: "1rpx solid rgba(156,39,176,0.2)", shadowCSS: "0 4rpx 12rpx rgba(74,20,140,0.2)" },

  // 大地色系
  "default-sand":     { id: "default-sand",     themeId: "default", name: "沙滩", bg: "linear-gradient(145deg, #FFF8E1 0%, #FFE082 100%)", textColor: "#5D4037", mutedColor: "#FFB300", accentColor: "#FF8F00", borderCSS: "1rpx solid rgba(255,143,0,0.1)", shadowCSS: "0 4rpx 12rpx rgba(255,143,0,0.08)" },
  "default-coffee":   { id: "default-coffee",   themeId: "default", name: "咖啡", bg: "linear-gradient(145deg, #EFEBE9 0%, #BCAAA4 100%)", textColor: "#3E2723", mutedColor: "#795548", accentColor: "#5D4037", borderCSS: "1rpx solid rgba(93,64,55,0.1)", shadowCSS: "0 4rpx 12rpx rgba(93,64,55,0.08)" },
  "default-chocolate":{ id: "default-chocolate",themeId: "default", name: "巧克力", bg: "linear-gradient(145deg, #4E342E 0%, #5D4037 100%)", textColor: "#FFFFFF", mutedColor: "#A1887F", accentColor: "#8D6E63", borderCSS: "1rpx solid rgba(141,110,99,0.2)", shadowCSS: "0 4rpx 12rpx rgba(78,52,46,0.2)" },
  "default-caramel":  { id: "default-caramel",  themeId: "default", name: "焦糖", bg: "linear-gradient(145deg, #FFF3E0 0%, #FFCC80 100%)", textColor: "#E65100", mutedColor: "#FF8F00", accentColor: "#FF6F00", borderCSS: "1rpx solid rgba(255,111,0,0.1)", shadowCSS: "0 4rpx 12rpx rgba(255,111,0,0.08)" },

  // 清新色系
  "default-melon":    { id: "default-melon",    themeId: "default", name: "蜜瓜", bg: "linear-gradient(145deg, #F1F8E9 0%, #C5E1A5 100%)", textColor: "#33691E", mutedColor: "#8BC34A", accentColor: "#689F38", borderCSS: "1rpx solid rgba(104,159,56,0.1)", shadowCSS: "0 4rpx 12rpx rgba(104,159,56,0.08)" },
  "default-matcha":   { id: "default-matcha",   themeId: "default", name: "抹茶", bg: "linear-gradient(145deg, #E8F5E9 0%, #A5D6A7 100%)", textColor: "#1B5E20", mutedColor: "#4CAF50", accentColor: "#2E7D32", borderCSS: "1rpx solid rgba(46,125,50,0.1)", shadowCSS: "0 4rpx 12rpx rgba(46,125,50,0.08)" },
  "default-ice-blue": { id: "default-ice-blue", themeId: "default", name: "冰蓝", bg: "linear-gradient(145deg, #E1F5FE 0%, #81D4FA 100%)", textColor: "#01579B", mutedColor: "#29B6F6", accentColor: "#0288D1", borderCSS: "1rpx solid rgba(2,136,209,0.1)", shadowCSS: "0 4rpx 12rpx rgba(2,136,209,0.08)" },
  "default-frost":    { id: "default-frost",    themeId: "default", name: "霜白", bg: "linear-gradient(145deg, #F5F7FA 0%, #E8EEF4 100%)", textColor: "#2C3E50", mutedColor: "#7F8C9A", accentColor: "#5D7B93", borderCSS: "1rpx solid rgba(93,123,147,0.1)", shadowCSS: "0 4rpx 12rpx rgba(93,123,147,0.08)" },

  // 季节色系
  "default-spring":   { id: "default-spring",   themeId: "default", name: "春晓", bg: "linear-gradient(145deg, #FCE4EC 0%, #F8BBD0 100%)", textColor: "#880E4F", mutedColor: "#E91E63", accentColor: "#C2185B", borderCSS: "1rpx solid rgba(193,24,91,0.1)", shadowCSS: "0 4rpx 12rpx rgba(193,24,91,0.08)" },
  "default-summer":   { id: "default-summer",   themeId: "default", name: "夏阳", bg: "linear-gradient(145deg, #FFF3E0 0%, #FFB74D 100%)", textColor: "#E65100", mutedColor: "#FF8F00", accentColor: "#FF6F00", borderCSS: "1rpx solid rgba(255,111,0,0.1)", shadowCSS: "0 4rpx 12rpx rgba(255,111,0,0.08)" },
  "default-autumn":   { id: "default-autumn",   themeId: "default", name: "秋韵", bg: "linear-gradient(145deg, #FFF8E1 0%, #FFD54F 100%)", textColor: "#5D4037", mutedColor: "#FF8F00", accentColor: "#FF6F00", borderCSS: "1rpx solid rgba(255,111,0,0.1)", shadowCSS: "0 4rpx 12rpx rgba(255,111,0,0.08)" },
  "default-winter":   { id: "default-winter",   themeId: "default", name: "冬雪", bg: "linear-gradient(145deg, #E3F2FD 0%, #90CAF9 100%)", textColor: "#1565C0", mutedColor: "#42A5F5", accentColor: "#2196F3", borderCSS: "1rpx solid rgba(33,150,243,0.1)", shadowCSS: "0 4rpx 12rpx rgba(33,150,243,0.08)" },

  // 特殊色系
  "default-gold":     { id: "default-gold",     themeId: "default", name: "流光金", bg: "linear-gradient(145deg, #FFF8E1 0%, #FFD700 100%)", textColor: "#5D4037", mutedColor: "#B8860B", accentColor: "#FF8F00", borderCSS: "1rpx solid rgba(255,143,0,0.1)", shadowCSS: "0 4rpx 12rpx rgba(255,143,0,0.08)" },
  "default-silver":   { id: "default-silver",   themeId: "default", name: "月光银", bg: "linear-gradient(145deg, #F5F5F5 0%, #E0E0E0 100%)", textColor: "#424242", mutedColor: "#757575", accentColor: "#616161", borderCSS: "1rpx solid rgba(97,97,97,0.1)", shadowCSS: "0 4rpx 12rpx rgba(97,97,97,0.08)" },
  "default-copper":   { id: "default-copper",   themeId: "default", name: "古铜", bg: "linear-gradient(145deg, #FBE9E7 0%, #D7CCC8 100%)", textColor: "#4E342E", mutedColor: "#8D6E63", accentColor: "#6D4C41", borderCSS: "1rpx solid rgba(109,76,65,0.1)", shadowCSS: "0 4rpx 12rpx rgba(109,76,65,0.08)" },
  "default-rose-gold":{ id: "default-rose-gold",themeId: "default", name: "玫瑰金", bg: "linear-gradient(145deg, #F8BBD0 0%, #F06292 100%)", textColor: "#880E4F", mutedColor: "#EC407A", accentColor: "#D81B60", borderCSS: "1rpx solid rgba(216,27,96,0.1)", shadowCSS: "0 4rpx 12rpx rgba(216,27,96,0.08)" },
};

// Helper: Extract colors from a theme's gradient background for canvas use
export function getThemeCanvasColors(themeId: string) {
  const theme = allThemeStyles[themeId];
  if (!theme) return null;

  // Parse the gradient to extract start/mid/end colors
  const bg = theme.bg;
  const colorMatches = bg.match(/#[0-9A-Fa-f]{6}/g);
  if (!colorMatches || colorMatches.length < 2) return null;

  return {
    startColor: colorMatches[0],
    midColor: colorMatches[1],
    endColor: colorMatches[colorMatches.length - 1],
    textColor: theme.textColor,
    mutedColor: theme.mutedColor,
    accentColor: theme.accentColor,
    name: theme.name,
    emoji: theme.emoji,
  };
}
