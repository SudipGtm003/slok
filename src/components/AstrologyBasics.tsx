import React, { useState } from "react";
import { 
  BookOpen, 
  Layers, 
  Sparkles, 
  Compass, 
  HelpCircle, 
  Flame, 
  Wind, 
  Waves, 
  Mountain, 
  Sun, 
  Moon, 
  ShieldAlert,
  Star
} from "lucide-react";

// Educational Data (all in beautiful Nepali + English subtitles)
const STUDY_HOUSES = [
  { id: 1, name: "प्रथम भाव (Lagna Bhava / तनु भाव)", english: "1st House", categorization: "Kendra & Trikona (केन्द्र र त्रिकोण)", bodyPart: "टाउको, मस्तिष्क, अनुहार", significance: "व्यक्तित्व, शारीरिक संरचना, स्वास्थ्य, आत्म-विश्वास, प्रारम्भिक जीवन, चरित्र, तेज र दीर्घायु।" },
  { id: 2, name: "द्वितीय भाव (Dhana Bhava / धन भाव)", english: "2nd House", categorization: "Panapharo (पणफर)", bodyPart: "दायाँ आँखा, मुख, जिब्रो, दाँत, घाँटी", significance: "सञ्चित धन, परिवार, वाणी, प्राथमिक शिक्षा, खानपानको बानी, पैतृक सम्पत्ति, कल्पना शक्ति।" },
  { id: 3, name: "तृतीय भाव (Sahaja Bhava / पराक्रम भाव)", english: "3rd House", categorization: "Apoklima & Upachaya (अपोक्लिम र उपचय)", bodyPart: "कान, काँध, पाखुरा, हात, श्वासप्रश्वास", significance: "साहस, पराक्रम, सञ्चार कौशल, साना यात्रा, भाइ-बहिनी, छिमेकी, लेखन कला, रुचि र इच्छाशक्ति।" },
  { id: 4, name: "चतुर्थ भाव (Sukha Bhava / बन्धु भाव)", english: "4th House", categorization: "Kendra (केन्द्र भाव)", bodyPart: "छाती, फोक्सो, मुटु", significance: "मातृसुख, मानसिक शान्ति, घर, वाहन, जग्गा-जमिन, सुख-सुविधा, प्रारम्भिक शिक्षा, घरेलू वातावरण।" },
  { id: 5, name: "पञ्चम भाव (Putra Bhava / विद्या भाव)", english: "5th House", categorization: "Trikona (त्रिकोण भाव)", bodyPart: "पेट, कलेजो, हृदयको माथिल्लो भाग", significance: "सन्तान सुख, बुद्धि, उच्च शिक्षा, सिर्जनशीलता, पूर्वजन्मको पुण्य, प्रेम सम्बन्ध, मन्त्र दीक्षा, सेयर बजार।" },
  { id: 6, name: "षष्ठ भाव (Shatru Bhava / रोग-ऋण भाव)", english: "6th House", categorization: "Dusthana & Upachaya (दुस्थान र उपचय)", bodyPart: "कमर, आन्द्रा, नाभि क्षेत्र", significance: "शत्रु, रोग, ऋण, मुद्दा-मामिला, सङ्घर्ष, जागिर, दैनिक जीवन, मामाघर, पाल्तु जनावर, प्रतिस्पर्धा।" },
  { id: 7, name: "सप्तम भाव (Yuvati Bhava / जाया भाव)", english: "7th House", categorization: "Kendra (केन्द्र भाव)", bodyPart: "मूत-नली, प्रजनन् अङ्ग, कम्मर मुनिको भाग", significance: "जीवनसाथी, वैवाहिक जीवन, व्यावसायिक साझेदारी, व्यापार, दैनिक आम्दानी, सार्वजनिक छवि, यात्रा।" },
  { id: 8, name: "अष्टम भाव (Ayur Bhava / मृत्यु भाव)", english: "8th House", categorization: "Dusthana (दुस्थान भाव)", bodyPart: "गुप्ताङ्ग, उत्सर्जन अङ्ग, मलद्वार", significance: "आयु, अचानक आउने संकट वा लाभ, रहस्यमयी ज्ञान, अनुसन्धान, दुर्घटना, पैतृक धन, अध्यात्मिक साधना।" },
  { id: 9, name: "नवम भाव (Bhagya Bhava / धर्म भाव)", english: "9th House", categorization: "Trikona (त्रिकोण भाव)", bodyPart: "तिघ्रा, कम्मर", significance: "भाग्य, धर्म, गुरु, पिता, लामो धार्मिक यात्रा, उच्च शिक्षा, सत्कर्म, दर्शन, परोपकार।" },
  { id: 10, name: "दशम भाव (Karma Bhava / राज्य भाव)", english: "10th House", categorization: "Kendra & Upachaya (केन्द्र र उपचय)", bodyPart: "घुँडा, जोर्नी", significance: "कर्म, करियर, पेशा, पदोन्नति, सामाजिक प्रतिष्ठा, अधिकार, राज्यबाट सम्मान, पिताको सम्पत्ति।" },
  { id: 11, name: "एकादश भाव (Labha Bhava / आय भाव)", english: "11th House", categorization: "Panapharo & Upachaya (पणफर र उपचय)", bodyPart: "खुट्टाको पिँडौला, देब्रे कान", significance: "आयस्रोत, आर्थिक लाभ, इच्छापूर्ति, दाजुभाइ, सामाजिक सञ्जाल, पुरस्कार, मित्र समूह।" },
  { id: 12, name: "द्वादश भाव (Vyaya Bhava / मोक्ष भाव)", english: "12th House", categorization: "Dusthana (दुस्थान भाव)", bodyPart: "पैताला, देब्रे आँखा, निद्रा", significance: "खर्च, हानि, मोक्ष, विदेश यात्रा, अस्पतालको खर्च, कारागार, शयन सुख, गुप्त शत्रु, लगानी।" }
];

const STUDY_RASHIS = [
  { id: 1, name: "मेष (Aries)", lord: "मंगल (Mars)", element: "अग्नि (Fire)", nature: "चर (Movable)", symbol: "भेडा (Ram)", traits: "ऊर्जावान, साहसी, नेतृत्वदायी, हतार गर्ने स्वभाव, क्रोधी तर मन सफा भएको।" },
  { id: 2, name: "वृष (Taurus)", lord: "शुक्र (Venus)", element: "पृथ्वी (Earth)", nature: "स्थिर (Fixed)", symbol: "बहर (Bull)", traits: "धैर्यवान, कलाप्रेमी, जिद्दी, भौतिकवादी, विश्वसनीय, मीठो खान मन पराउने।" },
  { id: 3, name: "मिथुन (Gemini)", lord: "बुध (Mercury)", element: "वायु (Air)", nature: "द्विस्वभाव (Dual)", symbol: "दम्पती (Twins)", traits: "वाचाल, बौद्धिक, बहुमुखी प्रतिभा, सञ्चारप्रेमी, दोधारे मनस्थिति, जिज्ञासु।" },
  { id: 4, name: "कर्कट (Cancer)", lord: "चन्द्र (Moon)", element: "जल (Water)", nature: "चर (Movable)", symbol: "गँगटो (Crab)", traits: "भावुक, कल्पनाशील, संवेदनशील, गृहप्रेमी, छिट्टै चित्त दुख्ने, सहानुभूति राख्ने।" },
  { id: 5, name: "सिंह (Leo)", lord: "सूर्य (Sun)", element: "अग्नि (Fire)", nature: "स्थिर (Fixed)", symbol: "सिंह (Lion)", traits: "स्वाभिमानी, शाही ठाँट, उदार, नेतृत्वप्रिय, प्रशंसाको भोको, अधिकार जमाउन खोज्ने।" },
  { id: 6, name: "कन्या (Virgo)", lord: "बुध (Mercury)", element: "पृथ्वी (Earth)", nature: "द्विस्वभाव (Dual)", symbol: "कुमारी (Virgin)", traits: "विश्लेषणात्मक, व्यावहारिक, सफाइ मन पराउने, सेवाभावी, पूर्णता खोज्ने (Perfectionist)।" },
  { id: 7, name: "तुला (Libra)", lord: "शुक्र (Venus)", element: "वायु (Air)", nature: "चर (Movable)", symbol: "तराजु (Scales)", traits: "न्यायप्रेमी, सन्तुलित, कुटनीतिज्ञ, कला र सौन्दर्यको पारखी, सामाजिक, निर्णय लिन ढिला गर्ने।" },
  { id: 8, name: "वृश्चिक (Scorpio)", lord: "मंगल (Mars)", element: "जल (Water)", nature: "स्थिर (Fixed)", symbol: "बिच्छी (Scorpion)", traits: "रहस्यमयी, दृढ संकल्पी, भावुक तर लुकाउने, बदलाको भावना राख्न सक्ने, तीव्र अन्तर्दृष्टि।" },
  { id: 9, name: "धनु (Sagittarius)", lord: "बृहस्पति (Jupiter)", element: "अग्नि (Fire)", nature: "द्विस्वभाव (Dual)", symbol: "धनुर्धारी (Archer)", traits: "आशावादी, दार्शनिक, स्वतन्त्रता प्रेमी, ज्ञानको खोजी गर्ने, सिधा बोल्ने, साहसी।" },
  { id: 10, name: "मकर (Capricorn)", lord: "शनि (Saturn)", element: "पृथ्वी (Earth)", nature: "चर (Movable)", symbol: "मकर/गोही (Goat-Capped)", traits: "अनुशासित, कडा परिश्रमी, महत्वाकांक्षी, व्यावहारिक, गम्भीर, ढिलो तर निश्चित सफलता पाउने।" },
  { id: 11, name: "कुम्भ (Aquarius)", lord: "शनि (Saturn)", element: "वायु (Air)", nature: "स्थिर (Fixed)", symbol: "घैला (Water Bearer)", traits: "नवीन सोच भएको, मानवीय हित चिताउने, सामाजिक, क्रान्तिकारी, मित्रता रुचाउने, एक्लो बस्न मन पराउने।" },
  { id: 12, name: "मीन (Pisces)", lord: "बृहस्पति (Jupiter)", element: "जल (Water)", nature: "द्विस्वभाव (Dual)", symbol: "दुई माछा (Fish)", traits: "अध्यात्मिक, दयालु, सपना देख्ने, परोपकारी, संवेदनशील, वास्तविकताबाट भाग्न खोज्ने।" }
];

const STUDY_PLANETS = [
  { id: 1, name: "सूर्य (Sun)", role: "राजा (The King)", relationship: "चन्द्र, मंगल, गुरुसँग मित्र; शुक्र, शनिसँग शत्रु", color: "तामा जस्तो रातो", energy: "आत्मा, पिता, अधिकार, मान-सम्मान, हड्डी, सरकारी सेवा र नेतृत्व।" },
  { id: 2, name: "चन्द्र (Moon)", role: "रानी (The Queen)", relationship: "सूर्य, बुधसँग मित्र; कुनै ग्रहसँग शत्रुता छैन", color: "सेतो / चाँदी जस्तो", energy: "मन, भावना, आमा, मानसिक शान्ति, जल, यात्रा, फोक्सो, सेतो वस्तु।" },
  { id: 3, name: "मंगल (Mars)", role: "सेनापति (The Commander)", relationship: "सूर्य, चन्द्र, गुरुसँग मित्र; बुधसँग शत्रु", color: "गाढा रातो", energy: "साहस, पराक्रम, ऊर्जा, रिस, दाजुभाइ, रिस, जमिन, रगत, मांसपेशी।" },
  { id: 4, name: "बुध (Mercury)", role: "राजकुमार (The Prince)", relationship: "सूर्य, शुक्रसँग मित्र; चन्द्रसँग शत्रु", color: "हरियो", energy: "बुद्धि, वाणी, व्यापार, तर्कशास्त्र, गणित, सञ्चार माध्यम, छाला, मित्र।" },
  { id: 5, name: "बृहस्पति (Jupiter)", role: "गुरु / मन्त्री (The Priest/Advisor)", relationship: "सूर्य, चन्द्र, मंगलसँग मित्र; बुध, शुक्रसँग शत्रु", color: "पहेंलो", energy: "ज्ञान, धर्म, गुरु, सन्तान, भाग्य, सुख-समृद्धि, बोसो, कलेजो।" },
  { id: 6, name: "शुक्र (Venus)", role: "गुरु / मन्त्री (The Advisor)", relationship: "बुध, शनिसँग मित्र; सूर्य, चन्द्रसँग शत्रु", color: "चम्किलो सेतो", energy: "प्रेम, विवाह, दाम्पत्य सुख, विलासिता, कला, संगीत, वाहन, वीर्य।" },
  { id: 7, name: "शनि (Saturn)", role: "सेवक / न्यायाधीश (The Judge)", relationship: "बुध, शुक्रसँग मित्र; सूर्य, चन्द्र, मंगलसँग शत्रु", color: "कालो / निलो", energy: "न्याय, कर्म, परिश्रम, समय, ढिलाइ, अनुशासन, दीर्घकालीन रोग, वृद्धावस्था।" },
  { id: 8, name: "राहु (Rahu)", role: "छाया ग्रह (North Node)", relationship: "शुक्र, शनिसँग मित्र; सूर्य, चन्द्र, मंगलसँग शत्रु", color: "धुवाँ जस्तो", energy: "भ्रम, अत्यधिक आकांक्षा, प्रविधि, अचानक लाभ, विदेश यात्रा, रहस्यमयी घटना।" },
  { id: 9, name: "केतु (Ketu)", role: "छाया ग्रह (South Node)", relationship: "मंगल, गुरुसँग अनुकूल; सूर्य, चन्द्रसँग शत्रु", color: "चितकब्रो", energy: "मोक्ष, अध्यात्म, वैराग्य, त्याग, गहन अनुसन्धान, मन्त्र साधना, गुप्त रोग।" }
];

const NAKSHATRAS = [
  "१. अश्विनी (Ashwini)", "२. भरणी (Bharani)", "३. कृत्तिका (Krittika)", "४. रोहिणी (Rohini)",
  "५. मृगशिरा (Mrigashira)", "६. आर्द्रा (Ardra)", "७. पुनर्वसु (Punarvasu)", "८. पुष्य (Pushya)",
  "९. अश्लेषा (Ashlesha)", "१०. मघा (Magha)", "११. पूर्वाफाल्गुनी (Purva Phalguni)", "१२. उत्तराफाल्गुनी (Uttara Phalguni)",
  "१३. हस्त (Hasta)", "१४. चित्रा (Chitra)", "१५. स्वाती (Swati)", "१६. विशाखा (Vishakha)",
  "१७. अनुराधा (Anuradha)", "१८. ज्येष्ठा (Jyeshtha)", "१९. मूल (Mula)", "२०. पूर्वाषाढा (Purva Ashadha)",
  "२१. उत्तराषाढा (Uttara Ashadha)", "२२. श्रवण (Shravana)", "२३. धनिष्ठा (Dhanishta)", "२४. शतभिषा (Shatabhisha)",
  "२५. पूर्वाभाद्रपद (Purva Bhadrapada)", "२६. उत्तराभाद्रपद (Uttara Bhadrapada)", "२७. रेवती (Revati)"
];

const PRINCIPLES = [
  {
    title: "ग्रह दृष्टि (Planetary Aspects)",
    desc: "वैदिक ज्योतिष अनुसार प्रत्येक ग्रहले आफू बसेको स्थानबाट सातौँ (७ औँ) भावलाई पूर्ण दृष्टिले हेर्दछ। यसबाहेक विशेष ग्रहहरूलाई अतिरिक्त दृष्टि दिइएको छ: मंगलले ४ औँ र ८ औँ भाव, बृहस्पतिले ५ औँ र ९ औँ भाव, र शनिले ३ औँ र १० औँ भावमा विशेष पूर्ण दृष्टि राख्दछन्। छाया ग्रह राहु-केतुले पनि ५ औँ र ९ औँ भावमा दृष्टि राख्ने मानिन्छ।"
  },
  {
    title: "उच्च र नीच ग्रह (Exaltation & Debilitation)",
    desc: "जब कुनै ग्रह आफ्नो लागि सबैभन्दा बलियो र सकारात्मक फल दिने राशिमा बस्छ, त्यसलाई 'उच्च ग्रह' भनिन्छ। ठीक विपरित, सबैभन्दा कमजोर फल दिने राशिमा बस्दा त्यसलाई 'नीच ग्रह' भनिन्छ। उदाहरणका लागि सूर्य मेष राशिमा उच्च र तुला राशिमा नीच हुन्छ। नीच ग्रहले शुभ फल दिन असमर्थ हुन्छ।"
  },
  {
    title: "ग्रह युति (Conjunctions)",
    desc: "कुनै एकै भावमा दुई वा सोभन्दा बढी ग्रहहरू एकसाथ बस्नुलाई 'युति' भनिन्छ। यस्तो अवस्थामा ती ग्रहहरूको ऊर्जा एकापसमा मिसिन्छ। यदि मित्र ग्रहहरूको युति छ भने सकारात्मक फल प्राप्त हुन्छ (जस्तै सूर्य + बुध को 'बुधादित्य योग')। यदि शत्रु ग्रहहरूको युति छ भने दोष वा संकट उत्पन्न हुन सक्छ (जस्तै शनि + राहु को 'शापित योग')।"
  },
  {
    title: "वक्री ग्रह (Retrograde)",
    desc: "पृथ्वीबाट हेर्दा आकाशमा ग्रह उल्टो दिशातिर हिँडिरहेको जस्तो देखिने खगोलीय घटनालाई 'वक्री हुनु' भनिन्छ। वक्री ग्रहहरू अत्यधिक बलशाली र चेष्टा बलले युक्त हुन्छन्। यिनीहरूले जातकको जीवनमा असाधारण र ढिलो गरी परिणाम दिन्छन्, जसले जातकलाई विगतका गल्तीहरू सुधार्ने मौका प्रदान गर्दछ।"
  },
  {
    title: "दोष र योग (Yogas & Doshas)",
    desc: "कुण्डलीमा ग्रहहरूको अनुकूल स्थितिले सुख, समृद्धि र कीर्ति दिने 'शुभ योग' निर्माण गर्छ (जस्तै गजलक्ष्मी योग, पञ्चमहापुरुष योग)। विपरित, ग्रहहरूको प्रतिकूल वा पीडित स्थितिले जीवनमा सङ्घर्ष, ढिलाइ र अवरोध ल्याउने 'दोष' निर्माण गर्छ (जस्तै कालसर्प दोष, केमद्रुम दोष, मांगलिक दोष)।"
  }
];

export default function AstrologyBasics() {
  const [activeTab, setActiveTab] = useState<"houses" | "rashis" | "planets" | "nakshatras" | "principles">("houses");

  const getElementBadge = (element: string) => {
    if (element.includes("अग्नि")) {
      return (
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-red-100">
          <Flame size={12} className="text-red-500" /> {element}
        </span>
      );
    }
    if (element.includes("वायु")) {
      return (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-blue-100">
          <Wind size={12} className="text-blue-500" /> {element}
        </span>
      );
    }
    if (element.includes("जल")) {
      return (
        <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-sky-100">
          <Waves size={12} className="text-sky-500" /> {element}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-amber-100">
        <Mountain size={12} className="text-amber-500" /> {element}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
      {/* Tab Header Navigation */}
      <div className="bg-orange-50/50 p-4 border-b border-orange-100">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="text-orange-600" size={20} />
          <h2 className="text-lg font-bold text-gray-900 font-sans">ज्योतिष आधारभूत ज्ञान (Astrology Learning Library)</h2>
        </div>
        
        {/* Mobile Tab Select Dropdown */}
        <div className="md:hidden mb-3">
          <label htmlFor="basics-tab-select" className="block text-[11px] font-bold text-orange-950 mb-1">
            विषय चयन गर्नुहोस् (Select Topic):
          </label>
          <select
            id="basics-tab-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="w-full bg-white border border-orange-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs"
          >
            <option value="houses">१२ भावहरू (12 Houses)</option>
            <option value="rashis">१२ राशिहरू (12 Signs)</option>
            <option value="planets">९ ग्रहहरू (9 Planets)</option>
            <option value="nakshatras">२७ नक्षत्रहरू (27 Nakshatras)</option>
            <option value="principles">मुख्य सिद्धान्तहरू (Key Principles)</option>
          </select>
        </div>

        <div className="hidden md:flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("houses")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "houses"
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-700 border border-orange-100"
            }`}
          >
            १२ भावहरू (12 Houses)
          </button>
          <button
            onClick={() => setActiveTab("rashis")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "rashis"
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-700 border border-orange-100"
            }`}
          >
            १२ राशिहरू (12 Signs)
          </button>
          <button
            onClick={() => setActiveTab("planets")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "planets"
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-700 border border-orange-100"
            }`}
          >
            ९ ग्रहहरू (9 Planets)
          </button>
          <button
            onClick={() => setActiveTab("nakshatras")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "nakshatras"
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-700 border border-orange-100"
            }`}
          >
            २७ नक्षत्रहरू (27 Nakshatras)
          </button>
          <button
            onClick={() => setActiveTab("principles")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "principles"
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-700 border border-orange-100"
            }`}
          >
            मुख्य सिद्धान्तहरू (Key Principles)
          </button>
        </div>
      </div>

      {/* Tab Content Panels */}
      <div className="p-6">
        
        {/* Panel 1: Houses */}
        {activeTab === "houses" && (
          <div>
            <p className="text-sm text-gray-600 mb-6 bg-orange-50/50 p-3 rounded-lg border-l-4 border-orange-500">
              कुण्डलीमा १२ वटा भाव (Houses) हुन्छन्। प्रत्येक भावले जातकको जीवनका निश्चित पाटाहरू, जस्तै स्वास्थ्य, धन, पराक्रम, सुख, सन्तान, र करियर आदिको प्रतिनिधित्व गर्दछन्।
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STUDY_HOUSES.map((house) => (
                <div key={house.id} className="p-4 rounded-xl border border-gray-100 hover:border-orange-200 transition-all hover:shadow-sm bg-gradient-to-br from-white to-orange-50/10">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      {house.english}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      वर्ग: {house.categorization}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">{house.name}</h3>
                  <p className="text-xs text-orange-700/80 mb-3 font-medium">अङ्ग: {house.bodyPart}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{house.significance}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel 2: Rashis */}
        {activeTab === "rashis" && (
          <div>
            <p className="text-sm text-gray-600 mb-6 bg-orange-50/50 p-3 rounded-lg border-l-4 border-orange-500">
              राशि चक्रलाई ३६० डिग्रीमा विभाजन गरी १२ बराबर भाग (प्रत्येक ३० डिग्री) मा बाँडिएको छ। प्रत्येक राशिको आफ्नै स्वामी ग्रह, तत्त्व, स्वभाव र विशेष गुण हुन्छन्।
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STUDY_RASHIS.map((rashi) => (
                <div key={rashi.id} className="p-4 rounded-xl border border-gray-100 hover:border-orange-200 transition-all hover:shadow-sm bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-800">{rashi.name}</span>
                    <span className="text-xs text-gray-400">चिह्न: {rashi.symbol}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="bg-orange-50 text-orange-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-orange-100">
                      स्वामी: {rashi.lord}
                    </span>
                    {getElementBadge(rashi.element)}
                    <span className="bg-gray-50 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded border border-gray-100">
                      {rashi.nature}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <strong className="text-gray-700">स्वभाव/विशेषता:</strong> {rashi.traits}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel 3: Planets */}
        {activeTab === "planets" && (
          <div>
            <p className="text-sm text-gray-600 mb-6 bg-orange-50/50 p-3 rounded-lg border-l-4 border-orange-500">
              वैदिक ज्योतिषमा ९ वटा प्रमुख ग्रह (Grahas) हरूको विचार गरिन्छ। यसमा सूर्य र चन्द्र मूल प्रकाश पिण्ड हुन्, राहु र केतु गणितीय छाया विन्दु हुन् भने बाँकी पाँच भौतिक ग्रहहरू हुन्।
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STUDY_PLANETS.map((planet) => (
                <div key={planet.id} className="p-4 rounded-xl border border-gray-100 hover:border-orange-200 transition-all hover:shadow-sm bg-white">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                      {planet.id === 1 && <Sun size={16} className="text-orange-500" />}
                      {planet.id === 2 && <Moon size={16} className="text-slate-400" />}
                      {planet.name}
                    </span>
                    <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded">
                      {planet.role}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="text-gray-500 font-medium">
                      <strong className="text-gray-700">रङ्ग:</strong> {planet.color}
                    </p>
                    <p className="text-gray-500">
                      <strong className="text-gray-700">सम्बन्ध:</strong> {planet.relationship}
                    </p>
                    <p className="text-gray-600 bg-orange-50/30 p-2 rounded border border-orange-50/50 leading-relaxed mt-1">
                      <strong className="text-orange-800">कारकतत्त्व:</strong> {planet.energy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel 4: Nakshatras */}
        {activeTab === "nakshatras" && (
          <div>
            <p className="text-sm text-gray-600 mb-6 bg-orange-50/50 p-3 rounded-lg border-l-4 border-orange-500">
              ३६० डिग्रीको राशि चक्रलाई २७ वटा बराबर भागमा विभाजन गरिएको छ, जसलाई 'नक्षत्र' (Lunar Mansions) भनिन्छ। प्रत्येक नक्षत्र १३ डिग्री २० मिनेटको हुन्छ। वैदिक ज्योतिषको आधार नक्षत्र नै हो।
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {NAKSHATRAS.map((nakshatra, index) => (
                <div key={index} className="p-2.5 rounded-lg border border-gray-100 text-center text-xs font-semibold text-gray-700 hover:bg-orange-50/50 hover:border-orange-100 transition-all bg-white shadow-sm flex items-center justify-center gap-1">
                  <Star size={12} className="text-yellow-500 shrink-0" />
                  <span className="truncate">{nakshatra}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Panel 5: Key Principles */}
        {activeTab === "principles" && (
          <div>
            <p className="text-sm text-gray-600 mb-6 bg-orange-50/50 p-3 rounded-lg border-l-4 border-orange-500">
              ज्योतिष शास्त्रको फलादेश गर्दा केवल भाव, राशि र ग्रहलाई मात्र नहेरी विभिन्न सिद्धान्तहरू जस्तै ग्रहको दृष्टि, युति, वक्री अवस्था र शुभाशुभ योगहरूको गहिरो विश्लेषण गर्नुपर्छ।
            </p>
            <div className="space-y-4">
              {PRINCIPLES.map((principle, index) => (
                <div key={index} className="p-5 rounded-xl border border-gray-100 bg-gradient-to-r from-white to-orange-50/5 hover:border-orange-200 transition-all">
                  <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                    <Sparkles size={16} className="text-orange-500" />
                    {principle.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed md:text-sm">
                    {principle.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
