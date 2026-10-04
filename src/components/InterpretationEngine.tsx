import React, { useState, useRef, useEffect } from "react";
import { 
  BookOpen, 
  ChevronDown, 
  X, 
  Check, 
  Sparkles
} from "lucide-react";
import { InterpretationResponse } from "../types";
import { generateLocalInterpretation } from "../utils/astrologyEngine";
import { motion, AnimatePresence } from "motion/react";

interface SelectedPlanet {
  planetId: number;
  retrograde: boolean;
}

const HOUSE_DROPDOWN_OPTIONS = [
  { id: 1, label: "1. लग्न", title: "प्रथम भाव (Lagna)", signification: "शरीर, स्वास्थ्य, स्वभाव, व्यक्तित्व, प्रारम्भिक जीवन", category: "केन्द्र र त्रिकोण" },
  { id: 2, label: "2. धन", title: "द्वितीय भाव (Dhana)", signification: "धन, सम्पत्ति, वाणी, परिवार, प्राथमिक शिक्षा, मुख", category: "पणफर भाव" },
  { id: 3, label: "3. सहज", title: "तृतीय भाव (Sahaja)", signification: "साहस, पराक्रम, भाइ-बहिनी, सञ्चार, छोटो यात्रा", category: "अपोक्लिम भाव" },
  { id: 4, label: "4. बन्धु", title: "चतुर्थ भाव (Bandhu)", signification: "सुख, आमा, वाहन, घर, जग्गा-जमिन, मानसिक शान्ति", category: "केन्द्र भाव" },
  { id: 5, label: "5. पुत्र", title: "पञ्चम भाव (Putra)", signification: "सन्तान, बुद्धि, सिर्जनशीलता, पूर्वपुण्य, मन्त्र साधना", category: "त्रिकोण भाव" },
  { id: 6, label: "6. शत्रु", title: "षष्ठ भाव (Shatru)", signification: "शत्रु, रोग, ऋण, प्रतिस्पर्धा, बाधा, जागिर", category: "दुस्थान भाव" },
  { id: 7, label: "7. युवति", title: "सप्तम भाव (Yuvati)", signification: "जीवनसाथी, वैवाहिक जीवन, साझेदारी, व्यापार, लोक छवि", category: "केन्द्र भाव" },
  { id: 8, label: "8. आयु", title: "अष्टम भाव (Ayur)", signification: "आयु, अचानक आउने परिवर्तन, रहस्य, संकट, गुप्त धन", category: "दुस्थान भाव" },
  { id: 9, label: "9. धर्म", title: "नवम भाव (Dharma)", signification: "भाग्य, धर्म, गुरु, पिता, उच्च शिक्षा, लामो यात्रा", category: "त्रिकोण भाव" },
  { id: 10, label: "10. कर्म", title: "दशम भाव (Karma)", signification: "कर्म, पेशा, प्रतिष्ठा, पदोन्नति, सामाजिक स्थिति", category: "केन्द्र भाव" },
  { id: 11, label: "11. लाभ", title: "एकादश भाव (Labha)", signification: "आय, लाभ, इच्छापूर्ति, दाजुभाइ, सामाजिक सञ्जाल", category: "पणफर भाव" },
  { id: 12, label: "12. व्यय", title: "द्वादश भाव (Vyaya)", signification: "खर्च, हानि, मोक्ष, विदेश यात्रा, अस्पताल, शयन सुख", category: "दुस्थान भाव" }
];

const RASHI_DROPDOWN_OPTIONS = [
  { id: 1, label: "1. मेष", name: "मेष (Aries)", lord: "मंगल", element: "अग्नि", nature: "चर", symbol: "भेडा" },
  { id: 2, label: "2. वृष", name: "वृष (Taurus)", lord: "शुक्र", element: "पृथ्वी", nature: "स्थिर", symbol: "बहर" },
  { id: 3, label: "3. मिथुन", name: "मिथुन (Gemini)", lord: "बुध", element: "वायु", nature: "द्विस्वभाव", symbol: "दम्पती" },
  { id: 4, label: "4. कर्कट", name: "कर्कट (Cancer)", lord: "चन्द्र", element: "जल", nature: "चर", symbol: "गँगटो" },
  { id: 5, label: "5. सिंह", name: "सिंह (Leo)", lord: "सूर्य", element: "अग्नि", nature: "स्थिर", symbol: "सिंह" },
  { id: 6, label: "6. कन्या", name: "कन्या (Virgo)", lord: "बुध", element: "पृथ्वी", nature: "द्विस्वभाव", symbol: "कुमारी" },
  { id: 7, label: "7. तुला", name: "तुला (Libra)", lord: "शुक्र", element: "वायु", nature: "चर", symbol: "तराजु" },
  { id: 8, label: "8. वृश्चिक", name: "वृश्चिक (Scorpio)", lord: "मंगल", element: "जल", nature: "स्थिर", symbol: "बिच्छी" },
  { id: 9, label: "9. धनु", name: "धनु (Sagittarius)", lord: "बृहस्पति", element: "अग्नि", nature: "द्विस्वभाव", symbol: "धनुर्धारी" },
  { id: 10, label: "10. मकर", name: "मकर (Capricorn)", lord: "शनि", element: "पृथ्वी", nature: "चर", symbol: "मकर" },
  { id: 11, label: "11. कुम्भ", name: "कुम्भ (Aquarius)", lord: "शनि", element: "वायु", nature: "स्थिर", symbol: "घैला" },
  { id: 12, label: "12. मीन", name: "मीन (Pisces)", lord: "बृहस्पति", element: "जल", nature: "द्विस्वभाव", symbol: "माछा" }
];

const PLANET_DROPDOWN_OPTIONS = [
  { id: 1, name: "सूर्य", english: "Sun", role: "आत्मा र पिता", nature: "क्रूर (Mild Malefic)", color: "text-red-600 bg-red-50 border-red-200" },
  { id: 2, name: "चन्द्र", english: "Moon", role: "मन र भावना", nature: "शुभ (Benefic)", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: 3, name: "मंगल", english: "Mars", role: "ऊर्जा र पराक्रम", nature: "पाप (Malefic)", color: "text-orange-600 bg-orange-50 border-orange-200" },
  { id: 4, name: "बुध", english: "Mercury", role: "बुद्धि र वाणी", nature: "शुभ (Benefic)", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { id: 5, name: "बृहस्पति", english: "Jupiter", role: "ज्ञान र भाग्य", nature: "शुभ (Benefic)", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: 6, name: "शुक्र", english: "Venus", role: "दाम्पत्य र सौन्दर्य", nature: "शुभ (Benefic)", color: "text-pink-600 bg-pink-50 border-pink-200" },
  { id: 7, name: "शनि", english: "Saturn", role: "न्याय र कर्म", nature: "पाप (Malefic)", color: "text-slate-700 bg-slate-50 border-slate-200" },
  { id: 8, name: "राहु", english: "Rahu", role: "भ्रम र प्रविधि", nature: "छाया पाप (Shadow)", color: "text-purple-600 bg-purple-50 border-purple-200" },
  { id: 9, name: "केतु", english: "Ketu", role: "मोक्ष र अध्यात्म", nature: "छाया पाप (Shadow)", color: "text-teal-600 bg-teal-50 border-teal-200" }
];

const HOUSE_BENEFIC_MALEFIC_DETAILS: Record<number, { benefic: string; malefic: string }> = {
  1: {
    benefic: "स्वस्थ, दीर्घायु, सुन्दर व्यक्तित्व, मानसिक शान्ति र उच्च आत्मविश्वास।",
    malefic: "स्वास्थ्यमा सामान्य समस्या, शारीरिक कष्ट, क्रोध वा अहंकारमा वृद्धि।"
  },
  2: {
    benefic: "धन सम्पत्तिमा राम्रो वृद्धि, सुमधुर बोली, सुखमय र सहयोगी परिवार।",
    malefic: "आर्थिक संकट, बोलीमा कठोरता, पारिवारिक कलह वा मनमुटाव।"
  },
  3: {
    benefic: "कलात्मक रुचि, भाइ-बहिनीको पूर्ण सुख, लेखन तथा छोटो सुखद यात्रा।",
    malefic: "अदम्य साहस, पराक्रम, शत्रुमाथि विजय (तर भाइ-बहिनीसँग सम्बन्ध चिसो)।"
  },
  4: {
    benefic: "पारिवारिक सुख, सवारी तथा घरजग्गाको लाभ, आमाको न्यानो ममता।",
    malefic: "पारिवारिक सुखमा कमी, आमाको स्वास्थ्यमा चिन्ता, आन्तरिक मानसिक अशान्ति।"
  },
  5: {
    benefic: "प्रखर बुद्धि, मेधावी विचार, सुयोग्य सन्तान सुख र सिर्जनशीलतामा वृद्धि।",
    malefic: "पढाइमा अचानक बाधा, सन्तान सुखमा ढिलाइ वा चिन्ता, पेट सम्बन्धी रोग।"
  },
  6: {
    benefic: "शत्रुताको कमी, ऋणमुक्ति, मामाघरको सुख, शान्त जीवन।",
    malefic: "शत्रु र रोगमाथि पूर्ण विजय, प्रतिस्पर्धामा सफलता, कठोर सङ्घर्षशीलता।"
  },
  7: {
    benefic: "सुयोग्य र सुन्दर जीवनसाथी, सुमधुर दाम्पत्य जीवन, साझेदारीमा ठूलो लाभ।",
    malefic: "वैवाहिक जीवनमा अनावश्यक कलह, ढिलाइ, साझेदारहरूसँग विचार नमिल्ने।"
  },
  8: {
    benefic: "दीर्घायु, अचानक धन लाभ, रहस्यमयी विषय वा गुप्त विद्यामा गहिरो ज्ञान।",
    malefic: "स्वास्थ्यमा अचानक उतारचढाव, दुर्घटनाको जोखिम, कार्यमा आकस्मिक बाधा।"
  },
  9: {
    benefic: "भाग्यको बलियो साथ, सफल धार्मिक यात्रा, गुरु र पिताको आशीर्वाद।",
    malefic: "भाग्यमा ढिलाइ र अवरोध, बुबासँग वैचारिक मतभेद, धार्मिक कार्यमा उदासिनता।"
  },
  10: {
    benefic: "व्यापार वा पेशामा उच्च सफलता, मान-सम्मान, बौद्धिक कर्मबाट ठूलो लाभ।",
    malefic: "कडा परिश्रमद्वारा उच्च पद-प्रतिष्ठा प्राप्ति, प्रशासनिक क्षेत्रमा ठूलो प्रभाव।"
  },
  11: {
    benefic: "नियमित र स्थिर आम्दानी, इच्छापूर्ति, दाजुभाइ तथा मित्रहरूबाट ठूलो लाभ।",
    malefic: "आकस्मिक उतारचढाव सहितको लाभ, भौतिक सुख प्राप्तिका लागि बढी दौडधुप।"
  },
  12: {
    benefic: "सात्विक र धार्मिक काममा खर्च, वैदेशिक यात्राबाट लाभ, राम्रो शयन सुख।",
    malefic: "अनावश्यक वा अत्यधिक खर्च, health issue, कानुनी झमेला वा अस्पताल खर्च।"
  }
};

const getHouseLordTitleNep = (id: number) => {
  const titles = {
    1: "लग्नेश (१ भावको स्वामी)",
    2: "द्वितीयेश (२ भावको स्वामी)",
    3: "तृतीयेश (३ भावको स्वामी)",
    4: "चतुर्थेश (४ भावको स्वामी)",
    5: "पञ्चमेश (५ भावको स्वामी)",
    6: "षष्ठेश (६ भावको स्वामी)",
    7: "सप्तमेश (७ भावको स्वामी)",
    8: "अष्टमेश (८ भावको स्वामी)",
    9: "नवमेश (९ भावको स्वामी)",
    10: "दशमेश (१० भावको स्वामी)",
    11: "एकादशेश (११ भावको स्वामी)",
    12: "द्वादशेश (१२ भावको स्वामी)"
  };
  return titles[id as keyof typeof titles] || `${id} भावको स्वामी`;
};

const getBhaveshLagnaLordPrediction = (targetHouseId: number) => {
  const predictions: Record<number, { shloka: string; shlokaNo: number; meaning: string; commentary: string }> = {
    1: {
      shloka: "तनुपे तनौ गते जातः स्वभुजार्जितवित्तवान् ।\nमनस्वी चञ्चलः शूरः केवलं द्विकलत्रवान् ॥",
      shlokaNo: 1,
      meaning: "लग्नेश प्रथम भाव (लग्न) मै भएमा जातक आफ्नै बाहुबलले धन कमाउने, मनस्वी, साहसी, दृढ निश्चयी र निरोगी हुन्छ।",
      commentary: "शरीर र व्यक्तित्वको मालिक आफ्नै भावमा हुनाले स्वास्थ्य अत्यन्त बलियो रहन्छ, आत्मविश्वास उच्च हुन्छ र आफ्नै प्रयासमा समाजमा ठूलो मान-सम्मान कमाइन्छ।"
    },
    2: {
      shloka: "तनुपे धनगे जातः लाभवान् पण्डितः सुखी ।\nसुशीलः धर्मविद् दाता सर्वसद्गुणसंयुतः ॥",
      shlokaNo: 2,
      meaning: "लग्नेश दोस्रो भाव (धन) मा भएमा जातक धनवान्, विद्वान्, सुखी, सुशील, धर्मको ज्ञाता र दानी हुन्छ।",
      commentary: "आर्थिक स्थिति मजबुत रहन्छ, बोली प्रभावशाली हुन्छ र परिवारको पूर्ण सहयोग प्राप्त हुन्छ। जातकले कुलको मान-सम्मान बढाउँछ।"
    },
    3: {
      shloka: "तनुपे सहजस्थे च सिंहतुल्यपराक्रमी ।\nसर्वसम्पद्युतो मानी द्विभार्यो बुद्धिमान् सुखी ॥",
      shlokaNo: 3,
      meaning: "लग्नेश तेस्रो भाव (पराक्रम) मा भएमा जातक सिंहजस्तै साहसी, पराक्रमी, सबै सम्पत्तिले युक्त र बुद्धिमान् हुन्छ।",
      commentary: "जातक अत्यन्त साहसी, सञ्चार कलामा निपुण र दाजुभाइ तथा मित्रहरूबाट सहयोग पाउने हुन्छ। पुरुषार्थको उदय बलियो हुन्छ।"
    },
    4: {
      shloka: "तनुपे सुखगे जातः मातृपितृसुखैर्युतः ।\nभ्रातृवित्तगृहादीनां भोक्ता गुणसमन्वितः ॥",
      shlokaNo: 4,
      meaning: "लग्नेश चौथो भाव (सुख) मा भएमा जातक आमा-बुबाको सुखले युक्त, घर, वाहन र भूमि आदिको पूर्ण उपभोग गर्ने र गुणवान् हुन्छ।",
      commentary: "पारिवारिक सुख, मातृसुख र भौतिक सुविधाहरू सहजै प्राप्त हुन्छन्, जीवन सुखी, स्थिर र शान्त रहन्छ।"
    },
    5: {
      shloka: "तनुपे सुतगे जातः सुतसौख्यं च मध्यमम् ।\nक्रोधी च चञ्चलः शूरः केवलं राजपूजितः ॥",
      shlokaNo: 5,
      meaning: "लग्नेश पञ्चम भाव (सन्तान/बुद्धि) मा भएमा जातक मेधावी, सन्तान सुख पाउने, समाजमा आदरणीय र राजपूजित हुन्छ।",
      commentary: "प्रखर बुद्धि, सिर्जनशीलता, र पूर्वपुण्यको उदय हुन्छ। मन्त्र साधना, परामर्श र उच्च शिक्षामा राम्रो सफलता मिल्छ।"
    },
    6: {
      shloka: "तनुपे रिपुगे जातः आरोग्यवान् दृढव्रतः ।\nरिपुहन्ता महामानी केवलं वित्तहीनता ॥",
      shlokaNo: 6,
      meaning: "लग्नेश छैटौँ भाव (शत्रु/रोग) मा भएमा जातक निरोगी (सङ्घर्षशील), दृढनिश्चयी, शत्रुलाई परास्त गर्ने र स्वाभिमानी हुन्छ।",
      commentary: "जीवनमा केही संघर्ष र ऋण-शत्रुको सामना गर्नुपरे पनि जातकले आफ्नै कडा परिश्रमले ती सबैमाथि विजय प्राप्त गर्दछ। नोकरीमा ठूलो सफलता मिल्न सक्छ।"
    },
    7: {
      shloka: "तनुपे सप्तमे जातः भार्या तस्य सुशीला ।\nचञ्चलः कीर्तिमान् शूरः केवलं दुःखितः कचित् ॥",
      shlokaNo: 7,
      meaning: "लग्नेश सप्तम भाव (दाम्पत्य/साझेदारी) मा भएमा जातकको जीवनसाथी सुशील, रूपवान् र सहयोगी हुन्छ, जातक यशस्वी र साहसी हुन्छ।",
      commentary: "वैवाहिक सुख उत्तम रहन्छ, साझेदारी व्यापार र सार्वजनिक छविमा राम्रो प्रसिद्धि र लाभ मिल्छ। सामाजिक अन्तरक्रिया फलदायी हुन्छ।"
    },
    8: {
      shloka: "तनुपे चाष्टमे जातः सिद्धविद्याविशारदः ।\nक्रोधी च चञ्चलः शूरः केवलं दीर्घायुः सदा ॥",
      shlokaNo: 8,
      meaning: "लग्नेश आठौँ भाव (आयु/रहस्य) मा भएमा जातक सिद्ध विद्याको ज्ञाता, गम्भीर, दीर्घायु र गुप्त ज्ञानमा रुचि राख्ने हुन्छ।",
      commentary: "रहस्यमयी विषय, अनुसन्धान र अध्यात्ममा गहिरो दख्खल हुन्छ। आकस्मिक लाभ र पैतृक सम्पत्ति मिल्ने योग बन्दछ।"
    },
    9: {
      shloka: "तनुपे भाग्यगे जातः भाग्यवान् जनवल्लभः ।\nविष्णुभक्तः पटुर्वाग्मी सन्ततिसुखसंयुतः ॥",
      shlokaNo: 9,
      meaning: "लग्नेश नवम भाव (भाग्य) मा भएमा जातक महाभाग्यवान्, सबैको प्रिय, धार्मिक, वाकपटु र सन्तति सुखले युक्त हुन्छ।",
      commentary: "भाग्यको सधैँ पूर्ण साथ रहन्छ। गुरु, पिता र धर्मको कृपाले सबै काममा सहज सफलता मिल्छ। तीर्थयात्रा र उच्च शिक्षाको योग बन्दछ।"
    },
    10: {
      shloka: "तनुपे कर्मगे जातः पितृसौख्यसमन्वितः ।\nराजमान्यो यशस्वी च स्वभुजार्जितवित्तवान् ॥",
      shlokaNo: 10,
      meaning: "लग्नेश दशम भाव (कर्म) मा भएमा जातक पिताको सुख पाउने, राज्यबाट सम्मानित, यशस्वी र आफ्नै पौरखले धनी हुन्छ।",
      commentary: "पेशा, व्यापार वा सरकारी सेवामा उच्च प्रतिष्ठा मिल्छ। नेतृत्व क्षमता प्रखर हुन्छ र समाजमा कुलको नाम उज्यालो बनाउने काम हुन्छ।"
    },
    11: {
      shloka: "तनुपे लाभगे जातः सदा लाभसमन्वितः ।\nसुशीलः कीर्तिमान् दानी बहुमित्रसमन्वितः ॥",
      shlokaNo: 11,
      meaning: "लग्नेश एघारौँ भाव (लाभ) मा भएमा जातक सधैँ लाभ पाउने, सुशील, कीर्तिमान्, दानी र धेरै मित्रहरू भएको हुन्छ।",
      commentary: "आयका अनेकौँ स्रोतहरू बन्दछन्, मनोकांक्षा र इच्छाहरू पूर्ण हुन्छन्। दाजुभाइ तथा प्रतिष्ठित साथीहरूको ठूलो सहयोग मिल्दछ।"
    },
    12: {
      shloka: "तनुपे व्ययगे जातः व्ययशीलो महाक्रोधी ।\nपरदेशरतो नित्यं धर्मकर्मबहिष्कृतः ॥",
      shlokaNo: 12,
      meaning: "लग्नेश बाह्रौँ भाव (व्यय/विदेश) मा भएमा जातक विदेश यात्रामा रुचि राख्ने, दानी वा खर्चालु र परोपकारी हुन्छ।",
      commentary: "जन्मभूमि भन्दा टाढा वा विदेशमा बसोबास गर्दा बढी सफलता र उन्नति मिल्छ। आध्यात्मिक चिन्तन र मोक्ष तर्फ झुकाव बढ्छ।"
    }
  };
  return predictions[targetHouseId] || predictions[1];
};

// Yoga Conjunction helper
const getConjunctionDetails = (houseId: number, placements: SelectedPlanet[]) => {
  if (!placements || placements.length < 2) return null;

  const ids = placements.map(p => p.planetId);
  const names = placements.map(p => PLANET_DROPDOWN_OPTIONS.find(pl => pl.id === p.planetId)?.name).join(" + ");
  
  let yogaTitle = `${placements.length} ग्रह युति (Planetary Conjunction)`;
  let yogaShloka = "एकस्मिन् भवने यदा बहवः खेटाः समागताः ।\nविचित्रफलदास्तत्र भवन्ति गुणदोषतः ॥";
  let yogaMeaning = `यस भावमा ${placements.length} वटा ग्रहहरूको संयुक्त ऊर्जा केन्द्रित भएको छ।`;
  let yogaImpact = "ग्रहहरूको प्राकृतिक मित्रता र शत्रुताका आधारमा जीवनमा विविध अनुभव र मिश्रित फलादेश प्राप्त हुन्छ।";

  const has = (...pIds: number[]) => pIds.every(id => ids.includes(id));

  if (has(1, 4)) {
    yogaTitle = "बुधादित्य योग (Budhaditya Yoga)";
    yogaShloka = "भानौ सौम्य समायुक्ते बुधादित्यः प्रकीर्तितः ।\nसर्वशास्त्रार्थतत्त्वज्ञः प्रतापी राजवल्लभः ॥";
    yogaMeaning = "सूर्य र बुधको अत्यन्त शुभ संयोजन, जसले प्रखर बुद्धि र प्रशासनिक नेतृत्व प्रदान गर्छ।";
    yogaImpact = "जातक कुशाग्र बुद्धि, उत्कृष्ट भाषण कला, प्रशासनिक क्षमता, गणितीय निपुणता र समाजमा उच्च प्रतिष्ठा प्राप्त गर्ने हुन्छ।";
  } else if (has(2, 5)) {
    yogaTitle = "गजकेसरी योग (Gajakesari Yoga)";
    yogaShloka = "केन्द्रे देवगुरौ चन्द्रात् पश्यन् वा सहितोऽपि वा ।\nहन्ति दोषाणि सर्वाणि गजकेसरियोगतः ॥";
    yogaMeaning = "चन्द्रमा र देवगुरु बृहस्पतिको दिव्य युतिले सम्पूर्ण दोष नाश गरी महायोग बनाउँछ।";
    yogaImpact = "समाजमा राजा समान आदर, दीर्घायु, उच्च नैतिक चरित्र, विद्वता र सबै क्षेत्रमा विजय प्राप्त हुन्छ।";
  } else if (has(2, 3)) {
    yogaTitle = "चन्द्र-मंगल योग (Chandra-Mangala / Mahalakshmi Yoga)";
    yogaShloka = "चन्द्रमङ्गलसंयोगे जातः स्यात् धनधान्यवान् ।\nशूरः पराक्रमी कामी मातुलस्य हिते रतः ॥";
    yogaMeaning = "चन्द्रमा र मंगलको संयोजनले प्रबल धनयोग र महालक्ष्मी कृपा बनाउँछ।";
    yogaImpact = "आर्थिक दृष्टिले अत्यन्त सफल, अदम्य ऊर्जा, व्यापार र अचल सम्पत्तिमा ठूलो उन्नति हुन्छ।";
  } else if (has(4, 6)) {
    yogaTitle = "लक्ष्मीनारायण योग (Lakshmi-Narayan Yoga)";
    yogaShloka = "बुधशुक्रसमायोगे लक्ष्मीनारायणः स्मृतः ।\nकलाविद्यासु निपुणः सुवक्ता धनवान् सुखी ॥";
    yogaMeaning = "बुध र शुक्रको अत्यन्त सुकुमार, बौद्धिक र कलात्मक संयोजन।";
    yogaImpact = "साहित्य, कला, सञ्चार, व्यापार र सौन्दर्य क्षेत्रमा असाधारण सफलता र विलासी जीवन प्राप्त हुन्छ।";
  } else if (has(1, 3)) {
    yogaTitle = "शौर्य योग (Shaurya Yoga)";
    yogaShloka = "सूर्याङ्गारकसंयोगे जातः शूरः पराक्रमी ।\nतेजस्वी रणधीरश्च शत्रुहन्ता महाबली ॥";
    yogaMeaning = "सूर्य र मंगलको शक्तिशाली अग्नि तत्त्व संयोजन।";
    yogaImpact = "अदम्य साहस, पराक्रम, सुरक्षा वा उच्च प्राविधिक क्षेत्रमा उच्च नेतृत्व र शत्रुमाथि पूर्ण विजय।";
  } else if (has(5, 8)) {
    yogaTitle = "गुरु-चाण्डाल योग (Guru-Chandal Yoga)";
    yogaShloka = "जीवराहुसमायोगे चाण्डाल इति कीर्तितः ।\nअन्वेषणपरो धीमान् परम्पराविरोधी च ॥";
    yogaMeaning = "बृहस्पति र राहुको छाया-ज्ञान संयोजन।";
    yogaImpact = "परम्परागत मान्यता भन्दा भिन्न सोच, अनुसन्धान र आधुनिक प्रविधिमा विशिष्ट सफलता।";
  } else if (has(3, 8)) {
    yogaTitle = "अङ्गारक योग (Angarak Yoga)";
    yogaShloka = "भौमराहुसमायोगे अङ्गारक इति स्मृतः ।\nअतिसाहसकारी च धैर्यं तत्र प्रशस्यते ॥";
    yogaMeaning = "मंगल र राहुको तीव्र ऊर्जा संयोजन।";
    yogaImpact = "अत्यधिक जोश र साहस, तर निर्णय लिँदा धैर्यता र क्रोध नियन्त्रण गर्नुपर्ने हुन्छ।";
  } else if (placements.length >= 4) {
    yogaTitle = "चतुर्ग्रही / महा बहुग्रही योग (Multi-Planet Conjunction)";
    yogaShloka = "चतुर्ग्रहादिसंयोगे जातः स्यात् बहुभाग्यवान् ।\nजीवनपरिवर्तनं तीव्रं ख्यातिश्च विपुला सदा ॥";
    yogaMeaning = "४ वा सोभन्दा बढी ग्रहहरू एउटै भावमा एकत्रित हुनु।";
    yogaImpact = "जीवनमा बहुआयामिक परिवर्तन, आध्यात्मिक र भौतिक उतारचढाव पछि विशिष्ट प्रतिभा र असाधारण ख्याति आर्जन हुन्छ।";
  }

  return { yogaTitle, yogaShloka, names, yogaMeaning, yogaImpact, count: placements.length };
};

export default function InterpretationEngine() {
  // 1. House, Rashi, and Planet Selection states matching image.png exactly
  const [selectedHouse, setSelectedHouse] = useState<number>(1);
  const [selectedRashi, setSelectedRashi] = useState<number>(1);
  
  // Multi-select for planets, initialized with Sun (id: 1) as seen in image.png
  const [selectedPlanets, setSelectedPlanets] = useState<SelectedPlanet[]>([
    { planetId: 1, retrograde: false }
  ]);
  
  // Active planet for detailed individual shloka view
  const [activePlanetId, setActivePlanetId] = useState<number>(1);
  
  // Custom multi-select planet dropdown toggle
  const [isPlanetDropdownOpen, setIsPlanetDropdownOpen] = useState(false);
  const planetDropdownRef = useRef<HTMLDivElement>(null);

  // Interpretation Result State
  const [result, setResult] = useState<InterpretationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (planetDropdownRef.current && !planetDropdownRef.current.contains(event.target as Node)) {
        setIsPlanetDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute interpretation on initial load
  useEffect(() => {
    runInterpretation();
  }, []);

  // Toggle planet in multi-select list
  const handleTogglePlanet = (planetId: number) => {
    const exists = selectedPlanets.some(p => p.planetId === planetId);
    let updated: SelectedPlanet[];
    if (exists) {
      updated = selectedPlanets.filter(p => p.planetId !== planetId);
    } else {
      const isRetroDefault = planetId === 8 || planetId === 9; // Rahu/Ketu
      updated = [...selectedPlanets, { planetId, retrograde: isRetroDefault }];
    }
    setSelectedPlanets(updated);
    if (updated.length > 0) {
      if (!updated.some(p => p.planetId === activePlanetId)) {
        setActivePlanetId(updated[0].planetId);
      }
    } else {
      setActivePlanetId(0);
    }
  };

  // Toggle retrograde
  const handleToggleRetrograde = (planetId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPlanets(prev => 
      prev.map(p => p.planetId === planetId ? { ...p, retrograde: !p.retrograde } : p)
    );
  };

  // Clear all planets (make empty house)
  const handleClearAllPlanets = () => {
    setSelectedPlanets([]);
    setActivePlanetId(0);
  };

  // Run the astrological lookup
  const runInterpretation = () => {
    setLoading(true);
    const targetPlanet = activePlanetId !== 0 
      ? activePlanetId 
      : (selectedPlanets.length > 0 ? selectedPlanets[0].planetId : 1);
      
    const isRetro = selectedPlanets.find(p => p.planetId === targetPlanet)?.retrograde || false;

    setTimeout(() => {
      try {
        const data = generateLocalInterpretation(selectedHouse, selectedRashi, targetPlanet, isRetro);
        setResult(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);
  };

  // Trigger search on "हेर्नुहोस्" button click
  const handleSearch = () => {
    setIsPlanetDropdownOpen(false);
    runInterpretation();
  };

  // Switch planet in detailed shloka view
  const handleSwitchPlanetForAnalysis = (pId: number) => {
    setActivePlanetId(pId);
    const isRetro = selectedPlanets.find(p => p.planetId === pId)?.retrograde || false;
    const data = generateLocalInterpretation(selectedHouse, selectedRashi, pId, isRetro);
    setResult(data);
  };

  // Lookups for current selections
  const currentHouseObj = HOUSE_DROPDOWN_OPTIONS.find(h => h.id === selectedHouse) || HOUSE_DROPDOWN_OPTIONS[0];
  const currentRashiObj = RASHI_DROPDOWN_OPTIONS.find(r => r.id === selectedRashi) || RASHI_DROPDOWN_OPTIONS[0];
  const conjunction = getConjunctionDetails(selectedHouse, selectedPlanets);
  const beneficMalefic = HOUSE_BENEFIC_MALEFIC_DETAILS[selectedHouse] || HOUSE_BENEFIC_MALEFIC_DETAILS[1];
  const bhaveshPrediction = getBhaveshLagnaLordPrediction(selectedHouse);

  // Label text for planet input box
  const getPlanetButtonLabel = () => {
    if (selectedPlanets.length === 0) {
      return "रिक्त भाव (कुनै ग्रह छैन)";
    }
    if (selectedPlanets.length === 1) {
      const p = PLANET_DROPDOWN_OPTIONS.find(pl => pl.id === selectedPlanets[0].planetId);
      return `${p?.name || ""}${selectedPlanets[0].retrograde ? " (वक्री)" : ""}`;
    }
    const names = selectedPlanets
      .map(sp => {
        const p = PLANET_DROPDOWN_OPTIONS.find(pl => pl.id === sp.planetId);
        return `${p?.name}${sp.retrograde ? "(व)" : ""}`;
      })
      .join(", ");
    return names;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* ============================================================== */}
      {/* HERO SEARCH CARD: EXACTLY AS IN USER'S UPLOADED SCREENSHOT     */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-end gap-4">
          
          {/* 1. भाव (House) Dropdown */}
          <div className="space-y-1.5">
            <label htmlFor="house-select" className="text-sm font-bold text-gray-800 block">
              भाव
            </label>
            <div className="relative">
              <select
                id="house-select"
                value={selectedHouse}
                onChange={(e) => setSelectedHouse(Number(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7c1a2d]/25 focus:border-[#7c1a2d] transition-all cursor-pointer h-[44px] appearance-none"
              >
                {HOUSE_DROPDOWN_OPTIONS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-500">
                <ChevronDown size={17} />
              </div>
            </div>
          </div>

          {/* 2. राशि (Rashi) Dropdown */}
          <div className="space-y-1.5">
            <label htmlFor="rashi-select" className="text-sm font-bold text-gray-800 block">
              राशि
            </label>
            <div className="relative">
              <select
                id="rashi-select"
                value={selectedRashi}
                onChange={(e) => setSelectedRashi(Number(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7c1a2d]/25 focus:border-[#7c1a2d] transition-all cursor-pointer h-[44px] appearance-none"
              >
                {RASHI_DROPDOWN_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-500">
                <ChevronDown size={17} />
              </div>
            </div>
          </div>

          {/* 3. ग्रह (Planet) Multi-Select Dropdown */}
          <div className="space-y-1.5 relative" ref={planetDropdownRef}>
            <div className="flex items-center justify-between">
              <label htmlFor="planet-multi-select" className="text-sm font-bold text-gray-800 block">
                ग्रह
              </label>
              {selectedPlanets.length > 1 && (
                <span className="text-[11px] font-extrabold text-[#7c1a2d] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  {selectedPlanets.length} ग्रह युति
                </span>
              )}
            </div>

            {/* Custom Multi-select trigger */}
            <button
              id="planet-multi-select"
              type="button"
              onClick={() => setIsPlanetDropdownOpen(!isPlanetDropdownOpen)}
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7c1a2d]/25 focus:border-[#7c1a2d] transition-all cursor-pointer h-[44px] flex items-center justify-between text-left shadow-2xs hover:bg-gray-50/50"
            >
              <span className="truncate pr-2 font-medium">
                {getPlanetButtonLabel()}
              </span>
              <ChevronDown 
                size={17} 
                className={`text-gray-500 transition-transform duration-200 shrink-0 ${isPlanetDropdownOpen ? "rotate-180" : ""}`} 
              />
            </button>

            {/* Multi-Select Planet Popover */}
            <AnimatePresence>
              {isPlanetDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 left-0 right-0 sm:w-[320px] bg-white border border-gray-200 rounded-2xl shadow-xl p-3 top-[72px] space-y-2.5"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-700">
                      ग्रह बहु-चयन (Multiple Select)
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAllPlanets}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                    >
                      खाली गर्नुहोस्
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {PLANET_DROPDOWN_OPTIONS.map((p) => {
                      const placement = selectedPlanets.find(item => item.planetId === p.id);
                      const isSelected = !!placement;

                      return (
                        <div
                          key={p.id}
                          onClick={() => handleTogglePlanet(p.id)}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                            isSelected 
                              ? "bg-rose-50/70 border border-rose-200 text-rose-950 font-bold" 
                              : "hover:bg-gray-50 text-gray-800 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                              isSelected ? "bg-[#7c1a2d] border-[#7c1a2d] text-white" : "border-gray-300 bg-white"
                            }`}>
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                            <span>{p.name} ({p.english})</span>
                          </div>

                          {isSelected && (
                            <button
                              type="button"
                              onClick={(e) => handleToggleRetrograde(p.id, e)}
                              className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all border ${
                                placement.retrograde 
                                  ? "bg-amber-500 text-white border-amber-600" 
                                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                              }`}
                              title="वक्री (Retrograde) स्थिति परिवर्तन गर्नुहोस्"
                            >
                              {placement.retrograde ? "वक्री (व)" : "मार्गी"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsPlanetDropdownOpen(false)}
                      className="bg-[#7c1a2d] hover:bg-[#681424] text-white text-xs font-bold py-1.5 px-4 rounded-xl shadow-xs cursor-pointer"
                    >
                      सम्पन्न (Done)
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. हेर्नुहोस् (Search) Button */}
          <div>
            <button
              onClick={handleSearch}
              className="w-full bg-[#7c1a2d] hover:bg-[#681424] active:scale-[0.98] text-white py-2.5 px-6 rounded-xl font-bold text-sm md:text-base shadow-sm transition-all flex items-center justify-center cursor-pointer h-[44px]"
            >
              हेर्नुहोस्
            </button>
          </div>

        </div>

        {/* Selected Planet Chips (Quick view & remove) */}
        {selectedPlanets.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 mr-1">चयन गरिएका ग्रहहरू:</span>
            {selectedPlanets.map((sp) => {
              const p = PLANET_DROPDOWN_OPTIONS.find(pl => pl.id === sp.planetId);
              return (
                <span
                  key={sp.planetId}
                  className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-950 px-3 py-1 rounded-xl text-xs font-bold shadow-2xs"
                >
                  <span>{p?.name}</span>
                  {sp.retrograde && (
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-extrabold">
                      वक्री
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleTogglePlanet(sp.planetId)}
                    className="hover:text-red-700 text-gray-400 p-0.5 rounded transition-colors cursor-pointer"
                    title="हटाउनुहोस्"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}

            {/* Quick unselected planet suggestions */}
            <div className="flex flex-wrap items-center gap-1 ml-auto text-xs text-gray-400">
              <span className="text-[11px] font-medium hidden md:inline">थप्नुहोस्:</span>
              {PLANET_DROPDOWN_OPTIONS
                .filter(p => !selectedPlanets.some(sp => sp.planetId === p.id))
                .slice(0, 4)
                .map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleTogglePlanet(p.id)}
                    className="text-[11px] font-semibold text-gray-600 hover:text-[#7c1a2d] bg-gray-50 hover:bg-rose-50 px-2 py-0.5 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                  >
                    + {p.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>


      {/* ============================================================== */}
      {/* ASTROLOGICAL INTERPRETATION RESULTS SECTION: ONLY 2 CARDS     */}
      {/* ============================================================== */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 text-slate-900"
        >
          
          {/* Card 1: शास्त्रीय संस्कृत श्लोक (CLASSICAL SANSKRIT SHLOKA) */}
          <div className="bg-[#fdfcf7] rounded-3xl border-2 border-amber-200/60 p-6 md:p-8 shadow-sm text-center relative overflow-hidden">
            {/* Top gold bar */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300"></div>
            
            {/* Center top badge */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-[1px] w-8 bg-amber-300"></div>
              <span className="text-[11px] font-extrabold text-amber-900 bg-amber-100 border border-amber-300/70 px-4 py-1 rounded-full uppercase tracking-wider font-mono">
                शास्त्रीय संस्कृत श्लोक (CLASSICAL SANSKRIT SHLOKA)
              </span>
              <div className="h-[1px] w-8 bg-amber-300"></div>
            </div>
            
            {/* Planet switcher tabs if multiple planets are selected */}
            {selectedPlanets.length > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
                <span className="text-[10px] font-bold text-gray-500 mr-1">ग्रह श्लोक छान्नुहोस्:</span>
                {selectedPlanets.map((sp) => {
                  const p = PLANET_DROPDOWN_OPTIONS.find(pl => pl.id === sp.planetId);
                  const isCurrent = (activePlanetId || selectedPlanets[0].planetId) === sp.planetId;
                  return (
                    <button
                      key={sp.planetId}
                      type="button"
                      onClick={() => handleSwitchPlanetForAnalysis(sp.planetId)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[#7c1a2d] text-white shadow-xs"
                          : "bg-amber-50 hover:bg-amber-100 text-stone-700 border border-amber-200"
                      }`}
                    >
                      {p?.name} {sp.retrograde ? "(वक्री)" : ""}
                    </button>
                  );
                })}
              </div>
            )}

            {/* The Sanskrit Shloka */}
            <div className="relative py-2">
              <blockquote className="text-lg md:text-xl font-extrabold text-stone-900 font-serif leading-loose whitespace-pre-line text-center my-3">
                {result.shloka}
              </blockquote>
            </div>

            {/* Nepali Translation Inner Box */}
            <div className="bg-[#fefce8]/60 border border-amber-200/80 rounded-2xl p-4 text-left mt-5">
              <div className="flex items-center gap-2 mb-2 text-xs font-extrabold text-amber-900 uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                <span>नेपाली भावार्थ (NEPALI MEANING)</span>
              </div>
              <p className="text-xs md:text-sm text-stone-800 leading-relaxed font-medium">
                {result.shlokaTranslation}
              </p>
            </div>
          </div>


          {/* Card 2: भावेश फल (बृहत्पाराशर होराशास्त्र) */}
          <div className="bg-[#fdfcf9] rounded-3xl border border-gray-200/80 p-6 md:p-8 shadow-sm relative overflow-hidden text-left">
            {/* Thick maroon left accent line */}
            <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-[#7c1a2d]"></div>
            
            <div className="pl-3 md:pl-4 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="bg-[#7c1a2d] text-white p-2.5 rounded-2xl shrink-0 shadow-sm">
                  <BookOpen size={20} />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#7c1a2d]">
                    <span>🔑</span>
                    <span>भावेश फल (बृहत्पाराशर होराशास्त्र)</span>
                  </div>
                  <h3 className="font-extrabold text-stone-900 text-base md:text-lg font-sans">
                    {getHouseLordTitleNep(selectedHouse)} — {currentHouseObj.title}
                  </h3>
                </div>
              </div>

              {/* Block 1: Orange - Shloka */}
              <div className="bg-[#fffbeb] border-l-4 border-amber-500 rounded-r-2xl p-4 space-y-1">
                <span className="text-[11px] font-extrabold text-amber-800 font-mono block">
                  📜 बृ.पा.हो.शा. (भावेशफलाध्याय) — श्लोक {bhaveshPrediction.shlokaNo}
                </span>
                <blockquote className="text-sm md:text-base font-extrabold text-stone-900 font-serif leading-loose whitespace-pre-line">
                  {bhaveshPrediction.shloka}
                </blockquote>
              </div>

              {/* Block 2: Blue - Meaning */}
              <div className="bg-[#eff6ff] border-l-4 border-blue-500 rounded-r-2xl p-4 space-y-1">
                <span className="text-[11px] font-extrabold text-blue-800 block">
                  नेपाली भावार्थ
                </span>
                <p className="text-xs md:text-sm text-blue-950 leading-relaxed font-bold italic">
                  {bhaveshPrediction.meaning}
                </p>
              </div>

              {/* Block 3: Gray - Commentary */}
              <div className="bg-[#f8fafc] border-l-4 border-gray-400 rounded-r-2xl p-4 space-y-1">
                <span className="text-[11px] font-extrabold text-gray-700 block">
                  ज्योतिषीय व्याख्या
                </span>
                <p className="text-xs md:text-sm text-gray-900 leading-relaxed font-medium">
                  {bhaveshPrediction.commentary}
                </p>
              </div>
            </div>
          </div>

        </motion.div>
      )}

    </div>
  );
}
