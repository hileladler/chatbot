/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Bot, User, Loader2, HelpCircle, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const KNOWLEDGE_BASE = `
מידע על המשרד:
"בעסקאות יוקרה אין פשרות — היכרות עמוקה עם השוק מעניקה ללקוחותינו יתרון אמיתי."

ערכי הליבה:
1. מקצוענות עמוקה: שמאים, כלכלנים, אנשי שיווק ומגשרים. ניתוח נכסים וניהול מו"מ מדויק.
2. שקט וביטחון: שליטה בחוזים, תכניות ותמחור.
3. הובלת תהליך אסטרטגי: תכנון ויישום עד סגירת העסקה במינימום דרמות.
4. דיסקרטיות: אמינות וזהירות לבעלי נכסי יוקרה.
5. חיבור אנושי: הקשבה, גישור וניווט לפי צרכי הלקוח.

השותפים:
- גיא אדלר: שמאי מקרקעין, כלכלן, ניסיון עסקי ויזמי.
- הדר פרבר: אשת שיווק, תוכן ומגשרת מוסמכת.
- אסף בובליל: שמאי מקרקעין וכלכלן.
- מיטל קינן: עו"ד מקרקעין (שיתוף פעולה שוטף).
- אדריכלים ומעצבים שותפים.

פרטי התקשרות:
טלפון: 054-454-0954
כתובת: כרמלי 4, רמת גן, 52223

נכסים למכירה:
רמת חן:
- קוטג' חדיש באלוף דוד: 7,900,000 ש"ח, 180 מ"ר, 4 חדרי שינה, חצר 180 מ"ר.
- דו משפחתי בשיכון על בן צבי: 7,400,000 ש"ח, 5 חדרים, 120 מ"ר, מגרש חצי דונם.
- בית בודד שיכון צנחנים: 10,900,000 ש"ח, 260 מ"ר בנוי, מגרש 309 מ"ר, כולל יחידת דיור במרתף.
- קוטג' טורי בסרן דב: 5,490,000 ש"ח, 5 חדרים, 130 מ"ר, חצר 100 מ"ר.
- קוטג' ייחודי באלוף דוד: 5,790,000 ש"ח, 6 חדרים, חצר פנימית טרופית וחצר 300 מ"ר.
- קוטג' טורי פינתי בעודד: 5,250,000 ש"ח, 6 חדרים, 140 מ"ר בנוי, מגרש 180 מ"ר.
- דופלקס באלוף דוד: 6,800,000 ש"ח, מעלית פרטית, 5 חדרים, מרפסות ענקיות.
- דירת גן ברביעיות: 6,900,000 ש"ח, 6 חדרים, 175 מ"ר + מרתף 70 מ"ר, חצר 300 מ"ר.
- דו משפחתי חדיש עם בריכה: 10,500,000 ש"ח, 3 מפלסים, מיקום מרכזי.
- דו משפחתי משופץ (מגרש ענק): 8,900,000 ש"ח, מגרש 380 מ"ר, 6 חדרים.
- בית קסום על חצי דונם: 10,500,000 ש"ח, 200 מ"ר בנוי, מגרש 500 מ"ר.
- דו משפחתי עם מעלית: 9,700,000 ש"ח, 280 מ"ר בנוי, רחוב שקט.
- דירת 4 חדרים משופצת: 3,590,000 ש"ח, 96 מ"ר, זכויות בנייה.
- דו משפחתי באלוף דוד: 9,000,000 ש"ח, 4 סוויטות למתבגרים + מרתף.
- בית סבתא עם פוטנציאל: 6,190,000 ש"ח, מגרש 250 מ"ר, אפשרות להוספת קומה.
- דו משפחתי חדיש (3 סוויטות): 10,500,000 ש"ח, חדר כושר, יחידת דיור במרתף.

רמת אפעל:
- בית בודד על חצי דונם: 8,800,000 ש"ח, סלון רחב, משרד, גלריה קסומה.

רמת גן:
- דירת 2 חדרים למשקיעים: 2,050,000 ש"ח, רחוב בר כוכבא, כולל ממ"ד וחניה.

גבעתיים:
- דירת גן בשיכון המורים: 3,890,000 ש"ח, 4 חדרים, 103 מ"ר, אווירה קהילתית.
- דירת 3 חדרים בקפלנסקי: 3,180,000 ש"ח, 85 מ"ר, מרפסת של פעם, פוטנציאל פינוי-בינוי.

תל אביב:
- דירת 3 חדרים בנחלת יצחק: 3,850,000 ש"ח, משופצת, בניין חתום לפינוי-בינוי.
`;

const FAQS = [
  "אילו דירות גן יש ברמת חן?",
  "אילו נכסים יש בטווח של 5-7 מיליון ש\"ח?",
  "יש דירות להשקעה ברמת גן?",
  "אילו בתים בודדים יש למכירה?",
];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: 'שלום! אני עוזר הבינה המלאכותית של המשרד. איך אני יכול לעזור לך היום בנושא נדל"ן?',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: FormEvent, customText?: string) => {
    e?.preventDefault();
    const messageText = customText || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })), {
          role: 'user',
          parts: [{ text: messageText }]
        }].slice(-10),
        config: {
          systemInstruction: `ענה רק בעברית. שמך הוא "עוזר בינה מלאכותית". השתמש אך ורק במידע הבא: ${KNOWLEDGE_BASE}. אם שואלים אותך משהו שלא מופיע במידע, ענה בנימוס שאינך יודע והצע ליצור קשר בטלפון 054-454-0954. שמור על תשובות קצרות ותמציתיות. התמקד במידע על נכסים, מחירים ומיקומים.`,
        },
      });

      const modelResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "מצטער, לא הצלחתי לייצר תגובה.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, modelResponse]);
    } catch (error) {
      console.error('Error calling Gemini:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "מצטער, אירעה שגיאה. אנא נסה שוב מאוחר יותר.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4 tracking-tight">נדל"ן יוקרה - עוזר חכם</h1>
        <p className="text-neutral-600 mb-8">
          לחץ על בועת הצ'אט בפינה הימנית התחתונה כדי להתחיל שיחה עם עוזר הבינה המלאכותית שלנו.
        </p>
      </div>

      {/* Chat Toggle Button */}
      <button
        id="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-neutral-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-50"
      >
        {isOpen ? (
          <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
        ) : (
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Chat Window Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-6 w-[90vw] sm:w-[450px] h-[650px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-100 bg-neutral-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-sm">עוזר בינה מלאכותית</h2>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">מחובר</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' ? 'bg-neutral-200' : 'bg-neutral-900'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-neutral-600" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      message.role === 'user' 
                        ? 'bg-neutral-900 text-white rounded-tl-none' 
                        : 'bg-white text-neutral-800 shadow-sm border border-neutral-100 rounded-tr-none'
                    }`}>
                      {message.text}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-end">
                  <div className="flex gap-2 max-w-[85%] flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white p-3 rounded-2xl rounded-tr-none shadow-sm border border-neutral-100">
                      <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* FAQ Section */}
            <div className="px-4 py-2 bg-white border-t border-neutral-100 overflow-x-auto">
              <div className="flex gap-2 whitespace-nowrap pb-1">
                {FAQS.map((faq, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(undefined, faq)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-xs transition-colors border border-neutral-200"
                  >
                    <HelpCircle className="w-3 h-3" />
                    {faq}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSendMessage}
              className="p-4 bg-white border-t border-neutral-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="הקלד הודעה..."
                className="flex-1 bg-neutral-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
