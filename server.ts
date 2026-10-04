import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client lazily
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini API Client:", error);
  }
} else {
  console.log("GEMINI_API_KEY is not defined. Using highly detailed local interpretation engine fallback.");
}

// Data structures for Astrological Mappings
const HOUSES = [
  { id: 1, name: "प्रथम भाव (Lagna)", english: "1st House", signification: "शरीर, स्वास्थ्य, स्वभाव, व्यक्तित्व, प्रारम्भिक जीवन" },
  { id: 2, name: "द्वितीय भाव (Dhana)", english: "2nd House", signification: "धन, सम्पत्ति, वाणी, परिवार, प्राथमिक शिक्षा, मुख" },
  { id: 3, name: "तृतीय भाव (Sahaja)", english: "3rd House", signification: "साहस, पराक्रम, भाइ-बहिनी, सञ्चार, छोटो यात्रा" },
  { id: 4, name: "चतुर्थ भाव (Bandhu)", english: "4th House", signification: "सुख, आमा, वाहन, घर, जग्गा-जमिन, मानसिक शान्ति" },
  { id: 5, name: "पञ्चम भाव (Putra)", english: "5th House", signification: "सन्तान, बुद्धि, सिर्जनशीलता, पूर्वपुण्य, मन्त्र साधना" },
  { id: 6, name: "षष्ठ भाव (Shatru)", english: "6th House", signification: "शत्रु, रोग, ऋण, प्रतिस्पर्धा, बाधा, जागिर" },
  { id: 7, name: "सप्तम भाव (Yuvati)", english: "7th House", signification: "जीवनसाथी, वैवाहिक जीवन, साझेदारी, व्यापार, लोक छवि" },
  { id: 8, name: "अष्टम भाव (Ayur)", english: "8th House", signification: "आयु, अचानक आउने परिवर्तन, रहस्य, संकट, अनुसन्धान" },
  { id: 9, name: "नवम भाव (Dharma)", english: "9th House", signification: "भाग्य, धर्म, गुरु, पिता, उच्च शिक्षा, लामो यात्रा" },
  { id: 10, name: "दशम भाव (Karma)", english: "10th House", signification: "कर्म, पेशा, प्रतिष्ठा, पदोन्नति, सामाजिक स्थिति, पिता" },
  { id: 11, name: "एकादश भाव (Labha)", english: "11th House", signification: "आय, लाभ, इच्छापूर्ति, दाजुभाइ, सामाजिक सञ्जाल" },
  { id: 12, name: "द्वादश भाव (Vyaya)", english: "12th House", signification: "खर्च, हानि, मोक्ष, विदेश यात्रा, अस्पताल, शयन सुख" }
];

const RASHIS = [
  { id: 1, name: "मेष (Aries)", lord: "मंगल", element: "अग्नि", nature: "चर (Chara)", symbol: "भेडा (Ram)" },
  { id: 2, name: "वृष (Taurus)", lord: "शुक्र", element: "पृथ्वी", nature: "स्थिर (Sthira)", symbol: "बहर (Bull)" },
  { id: 3, name: "मिथुन (Gemini)", lord: "बुध", element: "वायु", nature: "द्विस्वभाव (Dvisvabhava)", symbol: "दम्पती (Twins)" },
  { id: 4, name: "कर्कट (Cancer)", lord: "चन्द्र", element: "जल", nature: "चर (Chara)", symbol: "गँगटो (Crab)" },
  { id: 5, name: "सिंह (Leo)", lord: "सूर्य", element: "अग्नि", nature: "स्थिर (Sthira)", symbol: "सिंह (Lion)" },
  { id: 6, name: "कन्या (Virgo)", lord: "बुध", element: "पृथ्वी", nature: "द्विस्वभाव (Dvisvabhava)", symbol: "कुमारी (Virgin)" },
  { id: 7, name: "तुला (Libra)", lord: "शुक्र", element: "वायु", nature: "चर (Chara)", symbol: "तराजु (Scales)" },
  { id: 8, name: "वृश्चिक (Scorpio)", lord: "मंगल", element: "जल", nature: "स्थिर (Sthira)", symbol: "बिच्छी (Scorpion)" },
  { id: 9, name: "धनु (Sagittarius)", lord: "बृहस्पति", element: "अग्नि", nature: "द्विस्वभाव (Dvisvabhava)", symbol: "धनुर्धारी (Archer)" },
  { id: 10, name: "मकर (Capricorn)", lord: "शनि", element: "पृथ्वी", nature: "चर (Chara)", symbol: "गोही जस्तो जीव (Sea Goat)" },
  { id: 11, name: "कुम्भ (Aquarius)", lord: "शनि", element: "वायु", nature: "स्थिर (Sthira)", symbol: "घैला बोकेको मानिस (Water Bearer)" },
  { id: 12, name: "मीन (Pisces)", lord: "बृहस्पति", element: "जल", nature: "द्विस्वभाव (Dvisvabhava)", symbol: "दुईवटा माछा (Fish)" }
];

const PLANETS = [
  { id: 1, name: "सूर्य (Sun)", nature: "क्रूर (Mild Malefic)", signification: "आत्मा, पिता, सरकारी मान-सम्मान, हड्डी, नेतृत्व" },
  { id: 2, name: "चन्द्र (Moon)", nature: "सौम्य (Benefic)", signification: "मन, आमा, भावना, मानसिक शान्ति, जल, यात्रा" },
  { id: 3, name: "मंगल (Mars)", nature: "पाप (Malefic)", signification: "ऊर्जा, पराक्रम, रिस, दाजुभाइ, जमिन, रगत" },
  { id: 4, name: "बुध (Mercury)", nature: "मिश्रित (Neutral/Benefic)", signification: "बुद्धि, वाणी, व्यापार, सञ्चार, गणित, छाला" },
  { id: 5, name: "बृहस्पति (Jupiter)", nature: "शुभ (Benefic)", signification: "ज्ञान, गुरु, सन्तान, धर्म, सम्पत्ति, कलेजो" },
  { id: 6, name: "शुक्र (Venus)", nature: "शुभ (Benefic)", signification: "सौन्दर्य, वाहन, दाम्पत्य सुख, कला, प्रेम, वीर्य" },
  { id: 7, name: "शनि (Saturn)", nature: "पाप (Malefic)", signification: "न्याय, कर्म, दुःख, समय, ढिलाइ, आयु, परिश्रम" },
  { id: 8, name: "राहु (Rahu)", nature: "छाया ग्रह (Shadow/Malefic)", signification: "भ्रम, अचानक धनलाभ, विदेश, तृष्णा, प्रविधि" },
  { id: 9, name: "केतु (Ketu)", nature: "छाया ग्रह (Shadow/Malefic)", signification: "मोक्ष, वैराग्य, अध्यात्म, अनुसन्धान, चोटपटक" }
];

// Helper: Calculate relationship of planet with rashi
function getRelationshipAndStrength(planetId: number, rashiId: number) {
  // Exaltation (उच्च) and Debilitation (नीच) check
  if (planetId === 1 && rashiId === 1) return { rel: "उच्च (Exalted)", strength: "उत्कृष्ट (Excellent - 100%)" };
  if (planetId === 1 && rashiId === 7) return { rel: "नीच (Debilitated)", strength: "कमजोर (Weak - 20%)" };
  
  if (planetId === 2 && rashiId === 2) return { rel: "उच्च (Exalted)", strength: "उत्कृष्ट (Excellent - 100%)" };
  if (planetId === 2 && rashiId === 8) return { rel: "नीच (Debilitated)", strength: "कमजोर (Weak - 15%)" };
  
  if (planetId === 3 && rashiId === 10) return { rel: "उच्च (Exalted)", strength: "उत्कृष्ट (Excellent - 95%)" };
  if (planetId === 3 && rashiId === 4) return { rel: "नीच (Debilitated)", strength: "कमजोर (Weak - 20%)" };
  
  if (planetId === 4 && rashiId === 6) return { rel: "उच्च (Exalted)", strength: "उत्कृष्ट (Excellent - 100%)" };
  if (planetId === 4 && rashiId === 12) return { rel: "नीच (Debilitated)", strength: "कमजोर (Weak - 25%)" };
  
  if (planetId === 5 && rashiId === 4) return { rel: "उच्च (Exalted)", strength: "उत्कृष्ट (Excellent - 100%)" };
  if (planetId === 5 && rashiId === 10) return { rel: "नीच (Debilitated)", strength: "कमजोर (Weak - 30%)" };

  if (planetId === 6 && rashiId === 12) return { rel: "उच्च (Exalted)", strength: "उत्कृष्ट (Excellent - 100%)" };
  if (planetId === 6 && rashiId === 6) return { rel: "नीच (Debilitated)", strength: "कमजोर (Weak - 25%)" };

  if (planetId === 7 && rashiId === 7) return { rel: "उच्च (Exalted)", strength: "उत्कृष्ट (Excellent - 95%)" };
  if (planetId === 7 && rashiId === 1) return { rel: "नीच (Debilitated)", strength: "कमजोर (Weak - 15%)" };

  if (planetId === 8 && rashiId === 2) return { rel: "उच्च (Exalted)", strength: "उत्कृष्ट (Excellent - 90%)" };
  if (planetId === 8 && rashiId === 8) return { rel: "नीच (Debilitated)", strength: "कमजोर (Weak - 20%)" };

  if (planetId === 9 && rashiId === 8) return { rel: "उच्च (Exalted)", strength: "उत्कृष्ट (Excellent - 90%)" };
  if (planetId === 9 && rashiId === 2) return { rel: "नीच (Debilitated)", strength: "कमजोर (Weak - 20%)" };

  // Own Sign (स्वगृही) check
  const ownSigns: Record<number, number[]> = {
    1: [5], // Sun rules Leo
    2: [4], // Moon rules Cancer
    3: [1, 8], // Mars rules Aries, Scorpio
    4: [3, 6], // Mercury rules Gemini, Virgo
    5: [9, 12], // Jupiter rules Sagittarius, Pisces
    6: [2, 7], // Venus rules Taurus, Libra
    7: [10, 11], // Saturn rules Capricorn, Aquarius
    8: [],
    9: []
  };

  if (ownSigns[planetId]?.includes(rashiId)) {
    return { rel: "स्वगृही (Own Sign)", strength: "धेरै बलियो (Very Strong - 85%)" };
  }

  // Friends / Enemies / Neutral check
  const friends: Record<number, number[]> = {
    1: [4, 1, 8, 9, 12], // Moon, Mars, Jupiter signs
    2: [5, 3, 6], // Sun, Mercury signs
    3: [5, 4, 9, 12], // Sun, Moon, Jupiter signs
    4: [5, 2, 7], // Sun, Venus signs
    5: [5, 4, 1, 8], // Sun, Moon, Mars signs
    6: [3, 6, 10, 11], // Mercury, Saturn signs
    7: [3, 6, 2, 7], // Mercury, Venus signs
    8: [2, 3, 7, 10, 11], // Venus, Mercury, Saturn signs
    9: [1, 8, 9, 12] // Mars, Jupiter signs
  };

  const enemies: Record<number, number[]> = {
    1: [2, 7, 10, 11], // Venus, Saturn signs
    2: [], 
    3: [3, 6], // Mercury signs
    4: [4], // Moon sign
    5: [3, 6, 2, 7], // Mercury, Venus signs
    6: [5, 4], // Sun, Moon signs
    7: [5, 4, 1, 8], // Sun, Moon, Mars signs
    8: [5, 4], // Sun, Moon signs
    9: [5, 4] // Sun, Moon signs
  };

  if (friends[planetId]?.includes(rashiId)) {
    return { rel: "मित्रगृही (Friendly Sign)", strength: "बलियो (Strong - 70%)" };
  }

  if (enemies[planetId]?.includes(rashiId)) {
    return { rel: "शत्रुगृही (Inimical Sign)", strength: "शत्रुभाव (Challenging - 40%)" };
  }

  return { rel: "समगृही (Neutral Sign)", strength: "सामान्य (Neutral - 55%)" };
}

// Predefined Classical Sanskrit Shlokas & Scholars' Nepali Translations for the 9 Planets
const SHLOKAS: Record<number, { shloka: string; translation: string }> = {
  1: {
    shloka: "भानौ तनुस्थे बलवान् कुलीनः, प्रतापी, धीरः सुभगश्च शूरः ।\nधने धनी कीर्तिमान् सुहृद्वान्, तृतीये पराक्रमी कीर्तिवर्धनः ॥",
    translation: "सूर्य लग्न (प्रथम भाव) मा हुँदा जातक बलवान, कुलीन, प्रतापी, धीर, सुभग र शूरवीर हुन्छ। दोस्रो भावमा भए धनी, कीर्तिमान र असल मित्रयुक्त हुन्छ। तेस्रो भावमा भए पराक्रमी र यश बढाउने हुन्छ।"
  },
  2: {
    shloka: "चन्द्रे तनुगते सुभगो यशस्वी, सुखी प्रतापी च जनप्रियश्च ।\nधने धनी धार्मिको दानशीलः, तृतीये पराक्रमी सुहृद्वान् ॥",
    translation: "चन्द्रमा लग्न भावमा हुँदा जातक सुन्दर, भावुक, र जनमानसमा लोकप्रिय हुन्छ। दोस्रो भावमा यसले सुमधुर वाणी र समृद्धिको योग बनाउँछ भने तेस्रो भावमा दाजुभाइ तथा सञ्चार क्षेत्रबाट उच्च लाभ र साहसी स्वभाव प्रदान गर्दछ।"
  },
  3: {
    shloka: "भौमे तनुस्थे साहसी क्रोधी, रक्तपित्तार्तो च चञ्चलः सदा ।\nतृतीये विक्रमी शत्रुहन्ता, दशमे महाधनी राजपूज्यः ॥",
    translation: "मंगल ग्रह लग्नमा हुँदा जातक ऊर्जावान्, केही क्रोधी तर साहसी हुन्छ। तेस्रो भावमा यसले शत्रुहरूमाथि पूर्ण विजय र पराक्रम दिन्छ भने दशम भावमा मंगलले कुलदीपक योग बनाउँछ, जसले गर्दा जातकले राज्य वा सेना-प्रहरीमा उच्च नेतृत्व पाउँछ।"
  },
  4: {
    shloka: "सौम्ये तनुगते विद्वान् सुवक्ता, दीर्घायुः सुभगः सुखी सदा ।\nपञ्चमे मेधावी कविराजः, दशमे सर्वकर्मसिद्धिः ॥",
    translation: "बुध ग्रह लग्नमा हुँदा जातक बुद्धिमान, हास्यप्रिय, र व्यापारिक कुशाग्रताले युक्त हुन्छ। पञ्चम भावमा यसले प्रखर बुद्धि र लेखन क्षमता दिन्छ भने दशम भावमा भएमा जातक आफ्नो बौद्धिक कर्मद्वारा राज्यस्तरमा सम्मानित हुन्छ।"
  },
  5: {
    shloka: "देवगुरौ लग्नगते दीर्घायुः बुद्धिमान् सुभगो जनवल्लभः ।\nधने धनी सुवक्ता च धार्मिकः धर्मवत्सलः ॥",
    translation: "देवगुरु बृहस्पति लग्नमा हुँदा जातकलाई पञ्चमहापुरुष योगको जस्तै बल मिल्छ। जातक दीर्घायु, उच्च संस्कारी, र सर्वप्रिय हुन्छ। दोस्रो भावमा भएमा जातक अत्यन्त कुशल वक्ता, निष्कलङ्क धन आर्जन गर्ने र धार्मिक स्वभावको हुन्छ।"
  },
  6: {
    shloka: "शुक्रे तनुस्थे रूपवान् सुखी, कामी जनप्रियः कलाविदः ।\nधने धनी वाहनयुक्तः, सप्तमे कलत्रसुखं उत्तमम् ॥",
    translation: "दैत्यगुरु शुक्र लग्नमा बस्दा जातक आकर्षक व्यक्तित्व भएको, कलाप्रेमी, र विलासी जीवन व्यतीत गर्ने हुन्छ। दोस्रो भावमा यसले उच्च वाहन सुख र भौतिक समृद्धि दिन्छ भने सप्तम भावमा उत्तम जीवनसाथी र वैवाहिक सुख प्रदान गर्दछ।"
  },
  7: {
    shloka: "मन्दे तनुस्थे कृशगात्रः रोगी, मन्दबुद्धिः दुखितश्च सदा ।\nदशमे कर्मसिद्धिः राजपूज्यो यशस्वी धीरः ॥",
    translation: "शनिदेव लग्नमा हुँदा जातक गम्भीर, संघर्षशील, तर आफ्नो परिश्रमले उठ्ने दृढ निश्चयी हुन्छ। दशम भावमा शनिदेवले कर्मको विशेष सिद्धि गराउँछन्, जहाँ ढिलो भए पनि जातकले स्थायी कीर्ति, प्रसिद्धि र राजपूज्य स्थान प्राप्त गर्दछ।"
  },
  8: {
    shloka: "राहुस्तनुस्थे साहसी चञ्चलः, भ्रमप्रियः प्रपञ्चकुशलः ।\nषष्ठे शत्रुहन्ता विजयी, एकादशे महालाभयुक्तः ॥",
    translation: "राहु लग्नमा रहँदा जातक साहसी, चतुर, र प्रविधि वा आधुनिक कुरामा चासो राख्ने हुन्छ। छैटौँ भावमा यसले शत्रु र रोगमाथि विजय दिन्छ भने एकादश भावमा राहुले अचानक अनेकौँ गुणा धन लाभ र भौतिक इच्छा पूरा गराउँछ।"
  },
  9: {
    shloka: "केतुस्तनुगते वैराग्यवान्, अध्यात्मरुचिः तीक्ष्णबुद्धिः ।\nअष्टमे गुप्तविद्यारुचिः, द्वादशे मोक्षभागी सुदृढः ॥",
    translation: "केतु लग्नमा बस्दा जातकमा वैराग्य भाव, अन्तर्ज्ञान, र आध्यात्मिक झुकाव बढाउँछ। आठौँ भावमा यसले गुप्त विषयहरू र तन्त्र-मन्त्रमा गहिरो रुचि दिन्छ भने बाह्रौँ भावमा केतुको उपस्थिति शास्त्रीय रूपमा मोक्षको परम मार्ग मानिन्छ।"
  }
};

// Detailed positive effect templates for the 9 planets
const POSITIVES_TEMPLATES: Record<number, string[]> = {
  1: [
    "**प्रभावशाली व्यक्तित्व र तेज:** जातकमा सूर्यको तेज प्रकट भई आकर्षक, प्रतिष्ठित र प्रभावशाली व्यक्तित्व विकास हुनेछ।",
    "**नेतृत्व र प्रशासनिक सफलता:** सरकारी सेवा, राजनीति वा प्रशासनिक क्षेत्रमा उच्च पद र समाजमा ठूलो आदर-सम्मान मिल्ने सम्भावना रहन्छ।",
    "**दृढ संकल्प र आत्मविश्वास:** कुनै पनि कठिन कार्यलाई आफ्नो दृढ इच्छाशक्ति र संकल्पको बलमा सफलतापूर्वक सम्पन्न गर्न सक्ने क्षमता मिल्छ।",
    "**पितृपक्ष र कुलको सहयोग:** बुबा वा पितृपक्षको तर्फबाट विशेष सहयोग, मार्गदर्शन र पैतृक सम्पत्ति प्राप्त हुने बलियो योग बन्दछ।"
  ],
  2: [
    "**सुमधुर बोली र मानसिक शान्ति:** जातकमा चन्द्रमाको सौम्यता देखा पर्नेछ, जसले सुमधुर बोली, कल्पनाशिलता र शान्त मन प्रदान गर्दछ।",
    "**माता र स्त्रीपक्षको सुख:** आमाको विशेष माया, आशीर्वाद र जीवनमा स्त्रीवर्गको सहयोगबाट उन्नति हुनेछ।",
    "**लोकप्रियता र सामाजिक स्वीकार्यता:** समाजमा र कार्यक्षेत्रमा मानिसहरू जातकप्रति छिट्टै आकर्षित हुनेछन् र लोकप्रिय बन्न सहज हुनेछ।",
    "**कलात्मक र रचनात्मक झुकाव:** साहित्य, कला, संगीत, वा जल तथा सेतो वस्तुसँग सम्बन्धित व्यवसायमा विशेष रुचि र सफलता मिल्छ।"
  ],
  3: [
    "**असीम ऊर्जा र साहस:** जातकमा मंगलको अग्नि ऊर्जा रहनेछ, जसले असाधारण साहस, पराक्रम, र चुनौतीहरूसँग लड्ने शक्ति दिन्छ।",
    "**प्रतिस्पर्धा र शत्रुमाथि विजय:** खेलकुद, सेना, प्रहरी, वा कानुनी प्रतिस्पर्धामा शत्रुहरू स्वतः परास्त हुनेछन् र जातक विजयी बन्नेछ।",
    "**जग्गा-जमिन र सम्पत्ति लाभ:** घर-जग्गा, भूमि, भवन निर्माण वा प्राविधिक क्षेत्रको कामबाट राम्रो आर्थिक लाभ र सफलता मिल्नेछ।",
    "**नेतृत्व र अग्रसरता:** कुनै पनि नयाँ कार्यको सुरुवात गर्न र टोलीलाई मार्गदर्शन गर्न जातक सधैँ अगाडि रहनेछ।"
  ],
  4: [
    "**तीक्ष्ण बुद्धि र वाकपटुता:** जातकमा गजबको बौद्धिक क्षमता, निर्णय शक्ति, र आफ्नो बोलीको प्रभावले अरूलाई मनाउन सक्ने वाकपटुता हुनेछ।",
    "**व्यापार र सञ्चार क्षेत्रमा लाभ:** व्यापार-व्यवसाय, सेयर बजार, सञ्चार, पत्रकारिता, वा सफ्टवेयर सम्बन्धी कार्यमा ठूलो सफलता मिल्छ।",
    "**लेखन र गणितीय निपुणता:** गणित, लेखापरीक्षण, लेखन, वा परामर्श सम्बन्धी काममा जातक अत्यन्तै अब्बल सावित हुनेछ।",
    "**युवा ऊर्जा र हास्यव्यङ्ग्य:** जातकको स्वभावमा सधैँ ताजगी, नयाँ कुरा सिक्ने चाहना, र रमाइलो हास्यप्रिय व्यक्तित्व रहनेछ।"
  ],
  5: [
    "**ज्ञान, विवेक र गुरुत्व:** जातकमा देवगुरुको सात्विक ऊर्जा रहनेछ, जसले उच्च ज्ञान, विवेक, र समाजलाई सही दिशा देखाउने क्षमता दिन्छ।",
    "**भाग्य र धार्मिक झुकाव:** भाग्यले सधैँ साथ दिनेछ, धार्मिक र परोपकारी कार्यमा मन जानेछ र तीर्थयात्राको अवसर मिल्नेछ।",
    "**सन्तान र दाम्पत्य सुख:** सुयोग्य र आज्ञाकारी सन्तानको प्राप्ति हुनेछ, र पारिवारिक जीवनमा सुख, शान्ति र स्थिरता छाउनेछ।",
    "**आर्थिक समृद्धि र प्रतिष्ठा:** इमान्दारितापूर्वक धन आर्जन हुनेछ, र जातक समाजमा एक प्रतिष्ठित सल्लाहकार वा बौद्धिक व्यक्तित्व बन्नेछ।"
  ],
  6: [
    "**भौतिक सुख र ऐश्वर्य:** जातकलाई जीवनमा शुक्रको कृपाले विलासी वाहन, सुन्दर घर, र समस्त भौतिक सुख-सुविधाहरू सहजै प्राप्त हुनेछन्।",
    "**आकर्षक व्यक्तित्व र सौन्दर्य:** जातकको रूप-रङ्ग र हाउभाउ आकर्षक हुनेछ, जसले गर्दा समाजमा सबैको प्रिय बन्न सहज हुनेछ।",
    "**कला, संगीत र अभिनयमा सफलता:** कला, फेसन डिजाइनिङ, मिडिया, सौन्दर्य प्रसाधन, वा ललितकलाको क्षेत्रमा असाधारण प्रसिद्धि मिल्नेछ।",
    "**सुखद वैवाहिक र प्रेम जीवन:** जीवनसाथी अत्यन्तै माया गर्ने, सुन्दर र सहयोगी मिल्नेछ, जसले जीवनमा रोमान्स र खुसी कायम राख्नेछ।"
  ],
  7: [
    "**परिश्रमी र अनुशासित जीवन:** जातकमा शनिदेवको अनुशासन, गम्भीरता, र कडा परिश्रम गरेर आफ्नो भाग्य आफैँ कोर्ने क्षमता मिल्नेछ।",
    "**स्थायी सफलता र कीर्ति:** ढिलो भए पनि जातकले प्राप्त गर्ने सफलता अत्यन्तै स्थायी र दीर्घकालीन प्रकृतिको हुनेछ।",
    "**न्यायप्रियता र जनविश्वास:** जातक सधैँ न्यायको पक्षमा उभिनेछ, जसले गर्दा मजदुर, गरिब र आम जनताको ठूरो विश्वास र साथ मिल्नेछ।",
    "**दीर्घायु र आध्यात्मिक परिपक्वता:** कठिन परिस्थितिहरूको सामना गर्दै जातकमा उच्च आध्यात्मिक वैराग्य र परिपक्वता आउनेछ र आयु लामो हुनेछ।"
  ],
  8: [
    "**तीव्र प्रविधि र नवीन सोच:** जातकमा आधुनिक प्रविधि, सफ्टवेयर, विदेश सम्बन्धी कार्य, वा नवीन अनुसन्धानमा गहिरो दख्खल हुनेछ।",
    "**अचानक धन र प्रसिद्धि लाभ:** सेयर बजार, अचानक मिल्ने पैतृक सम्पत्ति, वा अनपेक्षित अवसरहरूबाट तीव्र आर्थिक लाभ मिल्नेछ।",
    "**राजनीतिक र कुटनीतिक चतुरता:** परिस्थिति अनुसार कुटनीतिक रूपमा काम निकाल्न र विपक्षीहरूलाई चकित पार्न जातक अत्यन्तै सिपालु हुनेछ।",
    "**विदेशी भूमि वा यात्राबाट लाभ:** वैदेशिक यात्रा वा विदेशी भूमिमा बसोबास गर्ने राम्रा अवसरहरू सिर्जना हुनेछन् र स्थिरता प्राप्त हुनेछ।"
  ],
  9: [
    "**अध्यात्म र वैराग्य:** भौतिक सुख भन्दा आध्यात्मिक ज्ञान, ध्यान र साधना तिर बढी रुचि जागृत हुनेछ।",
    "**असाधारण अन्तर्ज्ञान:** भविष्यमा हुने घटनाहरूको पहिल्यै अनुमान गर्न सक्ने तीव्र अन्तर्ज्ञान (Intuition) प्राप्त हुनेछ।",
    "**अनुसन्धान र गुप्त ज्ञान:** रहस्यमय र अन्वेषणात्मक विषयहरू जस्तै ज्योतिष, दर्शन, वा विज्ञानमा गहिरो दख्खल हुनेछ।",
    "**साहसी र स्वतन्त्र स्वभाव:** सामाजिक बन्धन वा कसैको नियन्त्रण नरुचाउने, सधैँ स्वतन्त्रतापूर्वक कार्य गर्ने स्वभाव हुनेछ।"
  ]
};

// Detailed negative effect templates for the 9 planets
const NEGATIVES_TEMPLATES: Record<number, string[]> = {
  1: [
    "**अहंकार र रिस:** स्वभावमा अत्यधिक अहंकार, क्रोध, र जिद्दीपना बढ्न सक्छ, जसले गर्दा आफन्तहरूसँग सम्बन्ध बिग्रने डर हुन्छ।",
    "**सरकारी वा उच्च वर्गसँग विवाद:** सरकारी काममा अवरोध आउने वा वरिष्ठ अधिकारीहरूसँग मतभेद उत्पन्न हुन सक्छ।",
    "**स्वास्थ्य समस्या (पित्त र हड्डी):** हड्डीको कमजोरी, टाउको दुखाइ, वा आँखा सम्बन्धी समस्याहरू देखा पर्न सक्छन्।",
    "**बुबासँग वैचारिक मतभेद:** पिता वा पिता समान व्यक्तिहरूसँग विचार नमिल्नाले मानसिक तनाव उत्पन्न हुन सक्छ।"
  ],
  2: [
    "**अस्थिर मन र अनिर्णय:** मन सधैँ विचलित रहने, चञ्चलता बढ्ने र कुनै पनि महत्त्वपूर्ण निर्णय लिन गाह्रो हुनेछ।",
    "**मानसिक तनाव र उदासीनता:** स-साना कुराहरूमा पनि चिन्ता लिने, डिप्रेसन वा मानसिक बेचैनी महसुस हुनेछ।",
    "**चिसो र छाती सम्बन्धी समस्या:** खोकी, दम, एलर्जी, वा फोक्सो र छाती सम्बन्धी स्वास्थ्य समस्याहरू आउन सक्छन्।",
    "**माताको स्वास्थ्यमा चिन्ता:** आमाको स्वास्थ्य कमजोर हुन सक्छ वा आमासँग सम्बन्धमा केही दूरी आउन सक्छ।"
  ],
  3: [
    "**अत्यधिक क्रोध र आक्रामकता:** बोली र व्यवहारमा अत्यधिक आक्रामकता आउनेछ, जसले वादविवाद र झगडा निम्त्याउन सक्छ।",
    "**चोटपटक र दुर्घटनाको जोखिम:** सवारी चलाउँदा वा हातहतियार चलाउँदा अचानक चोटपटक लाग्ने वा दुर्घटना हुने सम्भावना रहन्छ।",
    "**सम्बन्ध र दाम्पत्यमा तनाव:** विशेषगरी दाजुभाइसँगको सम्बन्ध बिग्रने वा मांगलिक प्रभाव भए वैवाहिक जीवनमा कलह हुन सक्छ।",
    "**रक्तसञ्चार सम्बन्धी समस्या:** उच्च रक्तचाप, रगतको विकार, वा छाला सम्बन्धी एलर्जीको जोखिम रहन्छ।"
  ],
  4: [
    "**निर्णयहीनता र भ्रम:** धेरै सोच्नाले निर्णय लिन ढिलाइ हुने वा गलत सल्लाहकारहरूको कारण नोक्सानी हुन सक्छ।",
    "**स्नायु र छालाको समस्या:** नसा सम्बन्धी कमजोरी, छालाको एलर्जी वा बोलीमा हडबडाहट देखा पर्न सक्छ।",
    "**व्यापारिक घाटा वा धोका:** साझेदारीको काममा धोका हुन सक्छ वा हिसाब-किताबमा त्रुटि हुँदा आर्थिक नोक्सानी हुन सक्छ।",
    "**एकाग्रताको कमी:** विद्यार्थीहरूमा पढाइप्रति एकाग्रता नहुने र ध्यान सजिलै अन्यत्र मोडिने समस्या हुन सक्छ।"
  ],
  5: [
    "**अहंकार र अति-विश्वास:** आफूमा भएको ज्ञानको घमण्ड बढ्ने वा भाग्यमा मात्र भर पर्दा अवसरहरू गुम्ने खतरा रहन्छ।",
    "**मोटोपना र पाचन सम्बन्धी समस्या:** कलेजो, मधुमेह (Diabetes), वा मोटोपना जस्ता स्वास्थ्य समस्याहरू देखा पर्न सक्छन्।",
    "**आर्थिक अपव्यय:** धार्मिक वा देखावटी काममा अत्यधिक खर्च हुनाले आर्थिक सन्तुलन बिग्रन सक्छ।",
    "**सन्तान सम्बन्धी चिन्ता:** सन्तान प्राप्तिमा ढिलाइ वा सन्तानको स्वास्थ्य र व्यवहारलाई लिएर चिन्ता बढ्न सक्छ।"
  ],
  6: [
    "**अत्यधिक विलासिता र ऋण:** भौतिक सुख र विलासिताका साधनहरूमा अत्यधिक खर्च गर्दा ऋण लाग्ने सम्भावना रहन्छ।",
    "**चरित्र वा सम्बन्धमा समस्या:** गलत प्रेम सम्बन्ध वा अनैतिक आकर्षणका कारण समाजमा बद्नामी हुन सक्छ।",
    "**स्वास्थ्य समस्या (मधुमेह/मूत्र):** मूत्रनली सम्बन्धी समस्या, मधुमेह वा प्रजनन सम्बन्धी रोगहरूको जोखिम रहन्छ।",
    "**वैवाहिक जीवनमा कलह:** अनावश्यक शङ्का-उपशङ्का र विलासी चाहनाका कारण दाम्पत्य सुखमा बाधा आउन सक्छ।"
  ],
  7: [
    "**कार्यमा ढिलाइ र निराशा:** प्रत्येक काममा बढी सङ्घर्ष गर्नुपर्ने, ढिलाइ हुने, र कहिलेकाहीँ उदासीनता (Depression) हाबी हुन सक्छ।",
    "**वात रोग र नसाको समस्या:** जोर्नी दुखाइ, बाथ, हड्डी वा नसा सम्बन्धी दीर्घकालीन स्वास्थ्य समस्याहरू देखा पर्न सक्छन्।",
    "**एक्लोपन र कठोर स्वभाव:** मानिसहरूबाट टाढा रहने, एक्लोपन रुचाउने वा बोलीमा अत्यधिक गम्भीरता र कठोरता आउन सक्छ।"
  ],
  8: [
    "**मानसिक भ्रम र बेचैनी:** दिमागमा अनेकौँ अनुत्पादक विचारहरू आउने, अनिद्रा हुने, र भविष्यलाई लिएर सधैँ अज्ञात डर वा भ्रम रहनेछ।",
    "**अचानक नोक्सानी वा धोका:** नजिकका मानिसहरूबाट विश्वासघात हुन सक्छ वा सेयर बजार जस्ता सट्टेबाजीमा ठूलो नोक्सानी हुन सक्छ।",
    "**प्रविधि वा कुलतको जोखिम:** मोबाइल, कम्प्युटरको अत्यधिक लत लाग्ने, वा गलत सङ्गत र कुलतमा फस्ने सम्भावना रहन्छ।"
  ],
  9: [
    "**वैराग्य र उदासीनता:** सांसारिक सुख र परिवारबाट मन टाढा भाग्ने, जसले गर्दा सामाजिक जीवन र जिम्मेवारीहरू अधुरो रहन सक्छन्।",
    "**चोटपटक र शल्यक्रिया:** अचानक चोटपटक लाग्ने, एलर्जी हुने, वा शरीरमा शल्यक्रिया (Operation) गर्नुपर्ने परिस्थिति आउन सक्छ।",
    "**भ्रम र निर्णयहीनता:** के गर्ने के नगर्ने भन्ने दोधारोपन रहिरहने र कतिपय अवस्थामा रहस्यमय रूपमा काम बिग्रने डर हुन्छ।"
  ]
};

// Classical Remedies Templates for the 9 planets
const REMEDIES_TEMPLATES: Record<number, string[]> = {
  1: [
    "**सूर्य नमस्कार र अर्घ्य:** प्रत्येक बिहान तामाको भाँडोमा शुद्ध जल, रातो फूल र अक्षता राखी सूर्यदेवलाई अर्घ्य अर्पण गर्नुहोस् र नमस्कार गर्नुहोस्।",
    "**गायत्री मन्त्र जप:** दैनिक रूपमा १०८ पटक गायत्री मन्त्रको जप गर्नुहोस्, यसले आत्मबल र सकारात्मक ऊर्जा बढाउँछ।",
    "**बुबाको सम्मान:** आफ्नो बुबा वा पिता समान व्यक्तिको दैनिक पाउ छोएर आशीर्वाद लिनुहोस्।",
    "**तामा र गहुँ दान:** आइतबारको दिन तामाको भाँडो, गहुँ वा रातो कपडा असहाय व्यक्तिलाई दान गर्नुहोस्।"
  ],
  2: [
    "**पूर्णिमाको व्रत र चन्द्र दर्शन:** पूर्णिमाको दिन व्रत बस्ने वा चन्द्रमाको किरणमा केही समय बस्नुहोस्।",
    "**आमाको आदर:** आफ्नी आमा वा आमा समान महिलाको दैनिक खुट्टा ढोगेर आशीर्वाद लिनुहोस्।",
    "**शिव उपासना र दुग्ध अर्पण:** प्रत्येक सोमबार भगवान शिवलाई शुद्ध दूध चढाउनुहोस् र 'ॐ नमः शिवाय' जप गर्नुहोस्।",
    "**सेतो वस्तु दान:** सोमबार सेतो चामल, दूध, दही, चिनी वा सेतो कपडा दान गर्नुहोस्।"
  ],
  3: [
    "**हनुमान चालिसा पाठ:** प्रत्येक मङ्गलवार र शनिवार हनुमान चालिसा वा बजरंग बाणको पाठ गर्नुहोस्।",
    "**मङ्गलवार व्रत:** मङ्गलवार नुन नखाई व्रत बस्नुहोस् र रातो मसुरोको दाल, रातो कपडा वा तामाको धातु दान गर्नुहोस्।",
    "**मङ्गल मन्त्र जप:** दैनिक \"ॐ अं अंगारकाय नमः\" मन्त्रको जप गर्नुहोस्।"
  ],
  4: [
    "**गणेश पूजा र दूर्वा चढाउने:** प्रत्येक बुधबार भगवान गणेशको पूजा गरी दुबो (दूर्वा) चढाउनुहोस्।",
    "**हरियो वस्तु र गाईलाई घाँस:** बुधबार हरियो गाईलाई घाँस खुवाउनुहोस् र हरियो कपडा वा मुगीको दाल दान गर्नुहोस्।",
    "**बुध मन्त्र जप:** दैनिक \"ॐ बुं बुधाय नमः\" मन्त्रको जप गर्नुहोस्।",
    "**बोलीमा नियन्त्रण र सल्लाह:** कुनै पनि महत्त्वपूर्ण सम्झौता वा निर्णय गर्नु अघि अनुभवी व्यक्तिको सल्लाह लिनुहोस्।"
  ],
  5: [
    "**विष्णु सहस्रनाम र गुरु सेवा:** प्रत्येक बिहीबार विष्णु सहस्रनामको पाठ गर्नुहोस् र आफ्ना गुरु वा वृद्धहरूको आदर गर्नुहोस्।",
    "**बिहीबार व्रत र पहेंलो दान:** बिहीबार नुन नखाई व्रत बस्नुहोस् र चनाको दाल, केरा, पहेंलो कपडा वा बेसार दान गर्नुहोस्।",
    "**बृहस्पति मन्त्र जप:** दैनिक \"ॐ बृं बृहस्पतये नमः\" मन्त्रको जप गर्नुहोस्।",
    "**केराको बोटको पूजा:** बिहीबार केराको बोटमा जल चढाउने र शुद्ध घिउको दियो बाल्नुहोस्।"
  ],
  6: [
    "**महालक्ष्मी उपासना र श्रीसुक्त पाठ:** प्रत्येक शुक्रबार देवी महालक्ष्मीको पूजा गरी श्रीसुक्तको पाठ गर्नुहोस्।",
    "**शुक्र मन्त्र र सेतो दान:** दैनिक \"ॐ शुं शुक्राय नमः\" मन्त्रको जप गर्नुहोस् र शुक्रबार सेतो चामल, चिनी वा कपुर दान गर्नुहोस्।",
    "**महिलाहरूको सम्मान:** आफ्नी जीवनसाथी, दिदीबहिनी वा सम्पूर्ण स्त्री वर्गको आदर र सम्मान गर्नुहोस्।",
    "**सात्विक जीवनशैली:** सफा र सुगन्धित वस्त्र धारण गर्नुहोस् र चरित्रलाई सधैँ उच्च र सात्विक राख्नुहोस्।"
  ],
  7: [
    "**शनि मन्दिर र पीपल सेवा:** प्रत्येक शनिबार शनि मन्दिर गई पीपलको बोटमा तोरीको तेलको दियो बाल्नुहोस् र हनुमानजीको पूजा गर्नुहोस्।",
    "**कालो वस्तु दान:** शनिबार कालो तिल, फलाम, कालो कपडा वा तोरीको तेल विपन्न वर्गलाई दान गर्नुहोस्।",
    "**शनि मन्त्र जप:** दैनिक \"ॐ शं शनैश्चराय नमः\" मन्त्रको जप गर्नुहोस्।",
    "**कर्मचारी र श्रमिकको सम्मान:** आफ्नो घर वा कार्यक्षेत्रमा रहेका साना कर्मचारी र कामदारहरूको कदर गर्नुहोस् र उनीहरूलाई कहिल्यै दुःख नदिनुहोस्।"
  ],
  8: [
    "**भैरव वा दुर्गा पूजा:** देवी दुर्गा वा भगवान कालभैरवको पूजा गर्नुहोस् र दैनिक दुर्गा चालीसा पाठ गर्नुहोस्।",
    "**राहु मन्त्र र कालो कुकुरको सेवा:** दैनिक \"ॐ रां राहवे नमः\" मन्त्रको जप गर्नुहोस् र कालो कुकुरलाई रोटी वा बिस्कुट खुवाउनुहोस्।",
    "**कपुर र चराचुरुङ्गीलाई चारो:** चराहरूलाई सात प्रकारको अन्न (सप्तधान्य) खुवाउनुहोस्।",
    "**कुलतबाट टाढा रहने:** धुम्रपान, मद्यपान र जुवातास जस्ता तामसिक कार्यहरूबाट पूर्ण रूपमा टाढा रहनुहोस्।"
  ],
  9: [
    "**भगवान गणेश र हनुमान उपासना:** भगवान गणेशको आराधना गर्नुहोस् र \"ॐ गं गणपतये नमः\" मन्त्रको जप गर्नुहोस्।",
    "**केतु मन्त्र र कम्बल दान:** दैनिक \"ॐ कें केतवे नमः\" मन्त्रको जप गर्नुहोस् र जाडोमा गरिबलाई कालो-सेतो कम्बल दान गर्नुहोस्।",
    "**स्ट्रीट डग्सलाई खाना:** सडकका कुकुरहरूलाई नियमित रूपमा खाना खुवाउनुहोस्, यसले केतुको अशुभ प्रभाव तुरुन्त नाश गर्छ।",
    "**अध्यात्म र ध्यान:** प्रत्येक दिन केही समय ध्यान वा प्राणायाम गर्नुहोस्, यसले केतुको अन्तर्ज्ञान शक्ति बढाउँछ।"
  ]
};

// Highly-sophisticated local Vedic Astrology interpreter engine
function generateLocalInterpretation(houseId: number, rashiId: number, planetId: number, retrograde: boolean) {
  const house = HOUSES.find(h => h.id === houseId) || HOUSES[0];
  const rashi = RASHIS.find(r => r.id === rashiId) || RASHIS[0];
  const planet = PLANETS.find(p => p.id === planetId) || PLANETS[0];
  const status = getRelationshipAndStrength(planetId, rashiId);

  // 1. Resolve Classical Shloka and Translation
  const shlokaInfo = SHLOKAS[planetId] || {
    shloka: `ॐ नमः शिवाय ।\nग्रहस्य भावस्थ फलम् प्रवक्ष्यामि श्रुतम् कुरु ।\nशुभ भावस्थ सङ्केतात् शुभ फलम् प्रदास्यति ॥`,
    translation: `म यस ग्रहको सम्बन्धित भावमा रहने फलको व्याख्या गर्दछु। यदि शुभ ग्रह शुभ भावमा बसेका छन् भने जातकलाई उत्तम र शुभ फल प्राप्त हुनेछ।`
  };

  // 2. Generate detailed 4-paragraph classical Vedic analysis
  const cleanPlanetName = planet.name.split(" ")[0];
  const cleanHouseName = house.name.split(" ")[0];
  const cleanRashiName = rashi.name.split(" ")[0];

  const para1 = `यस कुण्डलीको **${cleanHouseName}** (${house.signification}) मा **${cleanRashiName}** राशि रहेको छ र त्यहाँ **${planet.name}** विराजमान हुनुहुन्छ। वैदिक ज्योतिष शास्त्र अनुसार, ${cleanPlanetName} लाई **${planet.signification.split(",")[0]}** को कारक मानिन्छ। जब यो शक्तिशाली ऊर्जा यस भावको विषयमा प्रवेश गर्छ, जातकको जीवनमा यस भावसँग सम्बन्धित विशेष फलादेशहरू प्रकट हुन थाल्छन्। जातकले आफ्नो आन्तरिक चेतना र कडा परिश्रमलाई यस भावका क्षेत्रहरू जस्तै ${house.signification} सम्बन्धी कामहरूमा विशेष रूपमा केन्द्रित गर्नेछ।`;

  const para2 = `यो ग्रह **${cleanRashiName}** राशिमा अवस्थित छ, जसको स्वामी **${rashi.lord}** हो। राशि र ग्रह बीच **${status.rel}** को सम्बन्ध रहेको छ र यो संयोजन अत्यन्तै विशिष्ट मानिन्छ। ${cleanRashiName} राशिको **${rashi.element}** तत्त्व र यसको **${rashi.nature}** प्रकृतिको प्रभाव ${cleanPlanetName} को कार्यशैली र प्रभावमा प्रत्यक्ष रूपमा समाहित हुन्छ। यसले गर्दा ग्रहको मौलिक ऊर्जामा ${rashi.element} तत्त्वको गहिरो मिश्रण भई जातकको स्वभाव र व्यवहारमा सोही अनुसारको परिवर्तन आउँछ।`;

  // Determine House Category classification
  let houseCategoryText = "";
  if ([1, 4, 7, 10].includes(houseId)) {
    houseCategoryText = `शास्त्रीय दृष्टिकोण अनुसार, यो भाव कुण्डलीको **केन्द्र भाव (Kendra House)** अन्तर्गत पर्दछ। केन्द्रमा बसेका ग्रहहरू जातकको जीवनका बलिया स्तम्भहरू हुन्। यहाँ बसेको ग्रहले जातकलाई समाजमा स्थापित गराउन, मानसिक रूपमा मजबुत बनाउन र जीवनका मुख्य निर्णयहरूमा स्पष्टता प्रदान गर्न ठूलो भूमिका खेल्दछ।`;
  } else if ([5, 9].includes(houseId)) {
    houseCategoryText = `यो भाव कुण्डलीको **त्रिकोण भाव (Trikona - Religion & Fortune House)** अन्तर्गत पर्दछ। त्रिकोणमा बसेको ग्रह अत्यन्तै शुभ र पूर्वपुण्यको प्रतीक मानिन्छ। यसले जातकको भाग्य, बुद्धि, र आध्यात्मिक उन्नतिमा सधैँ सकारात्मकता प्रदान गर्दछ र जीवनका कठिन परिस्थितिहरूमा पनि दैवी कृपा प्राप्त गराउँदछ।`;
  } else if ([6, 8, 12].includes(houseId)) {
    houseCategoryText = `यो भाव कुण्डलीको **दुस्थान भाव (Dusthana - Challenges & Obstacles House)** अन्तर्गत पर्दछ। शास्त्रीय रूपमा यहाँ ग्रहको बसाइले जीवनमा केही चुनौती, सङ्घर्ष, शत्रुबाधा, वा स्वास्थ्य समस्याहरू ल्याउन सक्छ। तर, यसले जातकलाई सङ्घर्षशील, साहसी, र संकटबाट पाठ सिकेर अघि बढ्ने गहिरो आन्तरिक शक्ति पनि प्रदान गर्दछ।`;
  } else {
    houseCategoryText = `यो भाव कुण्डलीको **पणफर वा उपचय भाव (Upachaya / Panaphara House)** अन्तर्गत पर्दछ। उपचय र पणफर भावहरूमा ग्रहको ऊर्जा समयसँगै क्रमशः वृद्धि हुँदै जान्छ। जातकले आफ्नो परिश्रम, बोली, र धैर्यताको बलमा जीवनको उत्तराद्र्धमा ठूलो सफलता र आर्थिक सुदृढता हासिल गर्ने बलियो सम्भावना रहन्छ।`;
  }

  const para3 = `यो संयोजनको फलादेश बल **${status.strength}** रहेको छ। ${houseCategoryText} ${cleanPlanetName} को प्राकृतिक स्वभाव ${planet.nature} भएकाले, यसले यस भाव र राशिको आधारमा आफ्नो फलहरूलाई सन्तुलित रूपमा प्रदान गर्दछ।`;

  const para4 = `यस ग्रहको वर्तमान वक्र स्थिति (Retrograde Status) को विश्लेषण गर्दा, ${
    retrograde
      ? `यो ग्रह वर्तमान कुण्डलीमा **वक्री (Retrograde)** अवस्थामा रहेको छ। वक्री ग्रहले आफ्नो ऊर्जालाई बाह्य रूपमा भन्दा जातकको आन्तरिक चेतना र चिन्तनमा बढी केन्द्रित गर्दछ। यसले गर्दा जातकले सम्बन्धित भावका फलहरू पाउन बढी मन्थन गर्नुपर्ने र ढिलो गरी तर गहिरो आत्मज्ञान र दीर्घकालीन सफलता सहितको फल प्राप्त गर्दछ।`
      : `यो ग्रह वर्तमान कुण्डलीमा **मार्गी (Direct)** अवस्थामा रहेको छ। मार्गी हुनुको अर्थ ग्रहको ऊर्जा सिधा र स्पष्ट रूपमा जातकको बाह्य जीवन, कर्म र व्यवहारमा सजिलैसँग प्रकट हुन्छ। जातकले सामान्य प्रयासमा नै यस भावको प्राकृतिक र सकारात्मक फलहरू सजिलै अनुभव गर्न सक्दछ।`
  }`;

  const analysis = `${para1}\n\n${para2}\n\n${para3}\n\n${para4}`;

  // 3. Populate Positive, Challenging effects & Remedies
  const posList = POSITIVES_TEMPLATES[planetId] || [];
  const positiveEffects = posList.map(item => `${item}`).join("\n");

  const negList = NEGATIVES_TEMPLATES[planetId] || [];
  const negativeEffects = negList.map(item => `${item}`).join("\n");

  const remList = REMEDIES_TEMPLATES[planetId] || [];
  const remedies = remList.map(item => `${item}`).join("\n");

  return {
    shloka: shlokaInfo.shloka,
    shlokaTranslation: shlokaInfo.translation,
    analysis,
    positiveEffects,
    negativeEffects,
    remedies,
    relationship: status.rel,
    strength: status.strength
  };
}

// API Route: Interpret combination (Unified robust endpoint with local Vedic Astrology engine & AI backup)
app.post("/api/astrology/interpret", async (req, res) => {
  const { house, rashi, planet, retrograde } = req.body;

  const hNum = parseInt(house);
  const rNum = parseInt(rashi);
  const pNum = parseInt(planet);
  const isRetro = !!retrograde;

  if (isNaN(hNum) || isNaN(rNum) || isNaN(pNum) || hNum < 1 || hNum > 12 || rNum < 1 || rNum > 12 || pNum < 1 || pNum > 9) {
    return res.status(400).json({ error: "Invalid house (1-12), rashi (1-12), or planet (1-9) parameter." });
  }

  const houseObj = HOUSES.find(h => h.id === hNum);
  const rashiObj = RASHIS.find(r => r.id === rNum);
  const planetObj = PLANETS.find(p => p.id === pNum);

  if (!houseObj || !rashiObj || !planetObj) {
    return res.status(400).json({ error: "Astrological parameters mapping failed." });
  }

  const status = getRelationshipAndStrength(pNum, rNum);

  // If AI Client is available, let's use Gemini
  if (ai) {
    try {
      console.log(`Generating interpretation with Gemini for: House ${hNum} (${houseObj.name}), Rashi ${rNum} (${rashiObj.name}), Planet ${pNum} (${planetObj.name}), Retrograde: ${isRetro}`);
      
      const prompt = `You are a professional Vedic Astrologer (ज्योतिषाचार्य). 
Please provide a highly detailed classical Vedic Astrology interpretation (फलादेश) in beautiful, formal Nepali (with Sanskrit Shlokas where applicable) for the following exact combination:
- House (भाव): ${houseObj.name} (${houseObj.signification})
- Rashi (राशि): ${rashiObj.name} (Lord: ${rashiObj.lord}, Element: ${rashiObj.element}, Nature: ${rashiObj.nature})
- Planet (ग्रह): ${planetObj.name} (${planetObj.signification})
- Relationship & Strength of Planet in this Rashi: ${status.rel} with estimated strength ${status.strength}
- Retrograde Status (वक्र स्थिति): ${isRetro ? "वक्री (Retrograde)" : "मार्गी (Direct)"}

Please return the response as a JSON object matching this schema. Write all fields in professional, fluent Nepali/Sanskrit. Keep bullet points starting with '* ' inside strings where appropriate.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert Vedic astrologer specializing in classical Hindu scriptures (Shastras) and Kundali analysis. Provide elegant, grammatically perfect Nepali/Sanskrit responses.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              shloka: { type: Type.STRING, description: "A relevant traditional Sanskrit Shloka in Devanagari script." },
              shlokaTranslation: { type: Type.STRING, description: "Detailed Nepali translation of the Sanskrit Shloka." },
              analysis: { type: Type.STRING, description: "A comprehensive, deep, and detailed astrological analysis of how the planet's significations combine with the selected house and rashi in Nepali (minimum 3 paragraphs)." },
              positiveEffects: { type: Type.STRING, description: "A bulleted list of positive predictions in Nepali, each bullet starting with '* ' and a newline." },
              negativeEffects: { type: Type.STRING, description: "A bulleted list of negative predictions/cautions in Nepali, each bullet starting with '* ' and a newline." },
              remedies: { type: Type.STRING, description: "Practical classical Vedic remedies in Nepali, each bullet starting with '* ' and a newline." }
            },
            required: ["shloka", "shlokaTranslation", "analysis", "positiveEffects", "negativeEffects", "remedies"]
          },
          temperature: 0.7,
        }
      });

      const responseText = response.text ? response.text.trim() : "";
      const aiResult = JSON.parse(responseText);
      
      return res.json({
        ...aiResult,
        relationship: status.rel,
        strength: status.strength,
        source: "AI Engine (Gemini 3.5)"
      });
    } catch (apiError) {
      console.error("Gemini API error, falling back to local engine:", apiError);
      const localResult = generateLocalInterpretation(hNum, rNum, pNum, isRetro);
      return res.json({
        ...localResult,
        source: "Local Vedic Knowledge Base (Fallback)"
      });
    }
  } else {
    // Return local fallback if no AI client
    const localResult = generateLocalInterpretation(hNum, rNum, pNum, isRetro);
    return res.json({
      ...localResult,
      source: "Local Vedic Knowledge Base (Offline Mode)"
    });
  }
});

// Setup Vite Dev Server / Serve Static Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Vedic Astrology Knowledge Platform is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
