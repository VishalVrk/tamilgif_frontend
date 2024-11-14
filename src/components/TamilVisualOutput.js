import React from 'react';
import { 
  Coffee, Home, Car, Book, Sun, Moon, Phone, Music, 
  Heart, Star, User, Users, Award, Baby, Bird, Cat, Dog,
  Apple, Bike, Bus, Camera, Cloud, Fish, Flower, Gift,
  Globe, Mail, Map, Pencil, School, Scissors, 
  Shirt, ShoppingBag, Umbrella, Watch, TreePalm,
  Laptop, Printer, Tv, Bed, Sandwich, Pizza,
  Plane, Train, Utensils, Wifi, 
  LucideHand, SmilePlus, Frown, ThumbsUp, ThumbsDown,
  LucideHeartHandshake, Clock, CalendarDays, Laugh, Eye,
  CheckCircle, XCircle, HelpCircle, BadgeHelp, MessageCircle, Languages, Sparkles
} from 'lucide-react';

const TamilVisualOutput = ({ text }) => {
  // Common Tamil words and their corresponding icons/symbols
  const symbolMap = {
    // Original mappings
    'வீடு': { icon: Home, meaning: 'house' },
    'காபி': { icon: Coffee, meaning: 'coffee' },
    'கார்': { icon: Car, meaning: 'car' },
    'புத்தகம்': { icon: Book, meaning: 'book' },
    'சூரியன்': { icon: Sun, meaning: 'sun' },
    'நிலா': { icon: Moon, meaning: 'moon' },
    'தொலைபேசி': { icon: Phone, meaning: 'phone' },
    'பாடல்': { icon: Music, meaning: 'music' },
    'அன்பு': { icon: Heart, meaning: 'love' },
    'நட்சத்திரம்': { icon: Star, meaning: 'star' },
    'நபர்': { icon: User, meaning: 'person' },
    'மக்கள்': { icon: Users, meaning: 'people' },
    'வெற்றி': { icon: Award, meaning: 'success' },
    'குழந்தை': { icon: Baby, meaning: 'baby' },
    'பறவை': { icon: Bird, meaning: 'bird' },
    'பூனை': { icon: Cat, meaning: 'cat' },
    'நாய்': { icon: Dog, meaning: 'dog' },

    // New mappings
    'ஆப்பிள்': { icon: Apple, meaning: 'apple' },
    'மிதிவண்டி': { icon: Bike, meaning: 'bicycle' },
    'பேருந்து': { icon: Bus, meaning: 'bus' },
    'கேமரா': { icon: Camera, meaning: 'camera' },
    'மேகம்': { icon: Cloud, meaning: 'cloud' },
    'மீன்': { icon: Fish, meaning: 'fish' },
    'பூ': { icon: Flower, meaning: 'flower' },
    'பரிசு': { icon: Gift, meaning: 'gift' },
    'உலகம்': { icon: Globe, meaning: 'world' },
    'கடிதம்': { icon: Mail, meaning: 'mail' },
    'வரைபடம்': { icon: Map, meaning: 'map' },
    'பென்சில்': { icon: Pencil, meaning: 'pencil' },
    'பள்ளி': { icon: School, meaning: 'school' },
    'கத்தரிக்கோல்': { icon: Scissors, meaning: 'scissors' },
    'சட்டை': { icon: Shirt, meaning: 'shirt' },
    'பை': { icon: ShoppingBag, meaning: 'bag' },
    'குடை': { icon: Umbrella, meaning: 'umbrella' },
    'கடிகாரம்': { icon: Watch, meaning: 'watch' },
    'மரம்': { icon: TreePalm, meaning: 'tree' },
    'கணினி': { icon: Laptop, meaning: 'computer' },
    'அச்சுப்பொறி': { icon: Printer, meaning: 'printer' },
    'தொலைக்காட்சி': { icon: Tv, meaning: 'television' },
    'படுக்கை': { icon: Bed, meaning: 'bed' },
    'சாண்ட்விச்': { icon: Sandwich, meaning: 'sandwich' },
    'பிட்சா': { icon: Pizza, meaning: 'pizza' },
    'விமானம்': { icon: Plane, meaning: 'airplane' },
    'ரயில்': { icon: Train, meaning: 'train' },
    'சமையல்': { icon: Utensils, meaning: 'cooking' },
    'வைஃபை': { icon: Wifi, meaning: 'wifi' },

    // Greetings and Common Phrases
    'வணக்கம்': { icon: LucideHand, meaning: 'hello' },
    'நன்றி': { icon: LucideHeartHandshake, meaning: 'thank you' },
    'மன்னிக்கவும்': { icon: LucideHand, meaning: 'excuse me/sorry' },
    'சரி': { icon: CheckCircle, meaning: 'okay' },
    'இல்லை': { icon: XCircle, meaning: 'no' },
    'ஆம்': { icon: ThumbsUp, meaning: 'yes' },
    
    // Questions and Responses
    'என்ன': { icon: HelpCircle, meaning: 'what' },
    'எப்படி': { icon: BadgeHelp, meaning: 'how' },
    'ஏன்': { icon: HelpCircle, meaning: 'why' },
    'எங்கே': { icon: Map, meaning: 'where' },
    'எப்போது': { icon: Clock, meaning: 'when' },
    
    // Time-related
    'இன்று': { icon: CalendarDays, meaning: 'today' },
    'நாளை': { icon: CalendarDays, meaning: 'tomorrow' },
    'நேற்று': { icon: CalendarDays, meaning: 'yesterday' },
    'இப்போது': { icon: Clock, meaning: 'now' },
    
    // Common Expressions
    'சந்தோஷம்': { icon: SmilePlus, meaning: 'happy' },
    'சோகம்': { icon: Frown, meaning: 'sad' },
    'சிரிப்பு': { icon: Laugh, meaning: 'laugh' },
    'பார்': { icon: Eye, meaning: 'look/see' },
    'பேசு': { icon: MessageCircle, meaning: 'speak/talk' },
    
    // Common Adjectives
    'நல்லது': { icon: ThumbsUp, meaning: 'good' },
    'கெட்டது': { icon: ThumbsDown, meaning: 'bad' },
    'பெரிய': { icon: ThumbsUp, meaning: 'big' },
    'சிறிய': { icon: ThumbsDown, meaning: 'small' }
  };

  const getColorForCategory = (meaning) => {
    const categories = {
      // Transport related
      car: 'bg-blue-50 text-blue-600 shadow-blue-100',
      bus: 'bg-blue-50 text-blue-600 shadow-blue-100',
      airplane: 'bg-blue-50 text-blue-600 shadow-blue-100',
      train: 'bg-blue-50 text-blue-600 shadow-blue-100',
      bicycle: 'bg-blue-50 text-blue-600 shadow-blue-100',

      // Nature related
      tree: 'bg-green-50 text-green-600 shadow-green-100',
      flower: 'bg-green-50 text-green-600 shadow-green-100',
      sun: 'bg-yellow-50 text-yellow-600 shadow-yellow-100',
      moon: 'bg-indigo-50 text-indigo-600 shadow-indigo-100',
      cloud: 'bg-gray-50 text-gray-600 shadow-gray-100',
      
      // Technology related
      computer: 'bg-purple-50 text-purple-600 shadow-purple-100',
      phone: 'bg-purple-50 text-purple-600 shadow-purple-100',
      television: 'bg-purple-50 text-purple-600 shadow-purple-100',
      printer: 'bg-purple-50 text-purple-600 shadow-purple-100',
      wifi: 'bg-purple-50 text-purple-600 shadow-purple-100',

      // Food related
      coffee: 'bg-amber-50 text-amber-600 shadow-amber-100',
      apple: 'bg-red-50 text-red-600 shadow-red-100',
      sandwich: 'bg-amber-50 text-amber-600 shadow-amber-100',
      pizza: 'bg-amber-50 text-amber-600 shadow-amber-100',
      cooking: 'bg-amber-50 text-amber-600 shadow-amber-100',

      // Emotions and expressions
      happy: 'bg-pink-50 text-pink-600 shadow-pink-100',
      sad: 'bg-blue-50 text-blue-600 shadow-blue-100',
      love: 'bg-pink-50 text-pink-600 shadow-pink-100',
      hello: 'bg-teal-50 text-teal-600 shadow-teal-100',
      'thank you': 'bg-teal-50 text-teal-600 shadow-teal-100',

      // Default color scheme
      default: 'bg-gray-50 text-gray-600 shadow-gray-100'
    };

    return categories[meaning] || categories.default;
  };

  const renderWord = (word) => {
    const symbolInfo = symbolMap[word.trim()];
    
    if (symbolInfo) {
      const IconComponent = symbolInfo.icon;
      const colorScheme = getColorForCategory(symbolInfo.meaning);
      
      return (
        <div 
          className={`inline-flex flex-col items-center m-2 p-3 rounded-xl shadow-lg
                     transition-all duration-300 hover:scale-110 hover:shadow-xl
                     cursor-pointer ${colorScheme}`}
        >
          <IconComponent className="w-8 h-8" />
          <span className="mt-2 font-medium text-sm">{word}</span>
          <span className="text-xs opacity-75">({symbolInfo.meaning})</span>
        </div>
      );
    }
    
    return (
      <span className="inline-block m-1 px-3 py-2 bg-white rounded-lg text-gray-800
                     border border-gray-200 transition-all duration-300 hover:border-gray-300">
        {word}
      </span>
    );
  };

  const renderText = (text) => {
    if (!text) return null;
    const words = text.split(' ');
    return words.map((word, index) => (
      <React.Fragment key={index}>
        {renderWord(word)}
      </React.Fragment>
    ));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Languages className="w-6 h-6 text-blue-600" />
          <h3 className="text-2xl font-semibold text-gray-800">Visual Representation</h3>
        </div>
        
        {/* Legend for categories */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Categories:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600">Transport</span>
            <span className="px-3 py-1 rounded-full bg-green-50 text-green-600">Nature</span>
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-600">Technology</span>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600">Food</span>
            <span className="px-3 py-1 rounded-full bg-pink-50 text-pink-600">Emotions</span>
            <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-600">Greetings</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-start bg-gray-50 p-4 rounded-xl">
          {renderText(text)}
        </div>
      </div>
    </div>
  );
};

// Add animation keyframes to your CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default TamilVisualOutput;