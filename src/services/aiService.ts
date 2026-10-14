import { RoleplayScenario } from '../types';

export interface AiReplyResult {
  replyEn: string;
  replyVi: string;
  grammarTip?: string;
  suggestedNextReplies?: { en: string; vi: string }[];
}

export class AiService {
  // Generate response either using Gemini API (if key is set) or intelligent contextual engine
  public static async generateResponse(
    userText: string,
    scenario: RoleplayScenario,
    conversationHistory: { role: 'user' | 'model'; text: string }[],
    geminiApiKey?: string
  ): Promise<AiReplyResult> {
    if (geminiApiKey && geminiApiKey.trim()) {
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText,
            scenarioId: scenario.id,
            history: conversationHistory,
            apiKey: geminiApiKey,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.replyEn) {
            return data;
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to smart contextual response:', err);
      }
    }

    // Smart contextual response engine for zero-wait offline-first experience
    return AiService.getSmartContextualReply(userText, scenario);
  }

  // Built-in intelligent conversation engine tailored for Vietnamese beginners
  private static getSmartContextualReply(
    userText: string,
    scenario: RoleplayScenario
  ): AiReplyResult {
    const textLower = userText.toLowerCase().trim();

    // Check for common grammar slips made by Vietnamese learners
    let grammarTip: string | undefined;

    if (textLower.includes('i am want') || textLower.includes('i want')) {
      grammarTip = '💡 Mẹo người bản xứ: Khi gọi món hoặc nhờ vả, thay vì dùng "I want", hãy dùng "I would like..." hoặc "Could I have..." để lịch sự hơn bạn nhé!';
    } else if (textLower.includes('how much money') || textLower.includes('how many money')) {
      grammarTip = '💡 Mẹo người bản xứ: Để hỏi giá tiền, bạn chỉ cần nói "How much is this?" hoặc "How much does it cost?", không cần dùng từ "money" nhé.';
    } else if (textLower.includes('where is go') || textLower.includes('how to go to')) {
      grammarTip = '💡 Mẹo người bản xứ: Hỏi đường hãy dùng "How do I get to [địa điểm]?" hoặc "Could you show me the way to [địa điểm]?" nhé!';
    } else if (textLower.includes('i am come from')) {
      grammarTip = '💡 Mẹo người bản xứ: Chọn 1 trong 2: "I am from Vietnam" HOẶC "I come from Vietnam", đừng kết hợp cả hai thành "am come" nhé.';
    }

    // Scenario specific flows
    if (scenario.id === 'starbucks_ordering') {
      if (textLower.includes('latte') || textLower.includes('coffee') || textLower.includes('cappuccino') || textLower.includes('americano') || textLower.includes('tea')) {
        return {
          replyEn: 'Great choice! What size would you like for that? We offer Small, Medium, and Large.',
          replyVi: 'Lựa chọn tuyệt vời! Bạn muốn chọn size nào? Chúng tôi có Nhỏ, Vừa và Lớn.',
          grammarTip,
          suggestedNextReplies: [
            { en: 'A medium size, please.', vi: 'Cho tôi size vừa nhé.' },
            { en: 'Can I get a large, with less sugar?', vi: 'Cho tôi một ly lớn, ít đường được không?' },
          ],
        };
      }

      if (textLower.includes('medium') || textLower.includes('small') || textLower.includes('large')) {
        return {
          replyEn: 'Awesome! Will that be for here, or to-go? And how would you like to pay today?',
          replyVi: 'Tuyệt vời! Bạn uống tại quán hay mang đi? Và bạn muốn thanh toán bằng hình thức nào?',
          grammarTip,
          suggestedNextReplies: [
            { en: 'To-go, please. I will pay with card.', vi: 'Mang đi nhé. Tôi sẽ quẹt thẻ.' },
            { en: 'For here, please. Do you accept cash?', vi: 'Uống tại đây nhé. Quán có nhận tiền mặt không?' },
          ],
        };
      }

      if (textLower.includes('card') || textLower.includes('cash') || textLower.includes('to-go') || textLower.includes('to go') || textLower.includes('for here')) {
        return {
          replyEn: 'Perfect! That comes to $4.50. Tap your card right here. Your drink will be ready at the pickup counter shortly! Have a wonderful day!',
          replyVi: 'Hoàn tất! Tổng cộng là 4.50 đô. Mời bạn chạm thẻ vào đây. Đồ uống sẽ có tại quầy lấy nước ngay nhé! Chúc bạn một ngày tốt lành!',
          grammarTip,
          suggestedNextReplies: [
            { en: 'Thank you so much! Have a good day too.', vi: 'Cảm ơn bạn rất nhiều! Bạn cũng một ngày vui vẻ nhé.' },
          ],
        };
      }
    }

    if (scenario.id === 'ask_directions_nyc') {
      if (textLower.includes('subway') || textLower.includes('station') || textLower.includes('metro') || textLower.includes('train')) {
        return {
          replyEn: 'Oh, you are very close! Just walk straight down this avenue for two blocks, then turn left at the corner cafe. You will see the green subway sign.',
          replyVi: 'Ồ, bạn ở rất gần rồi! Cứ đi thẳng đại lộ này qua 2 dãy nhà, rồi rẽ trái ở quán cà phê góc đường. Bạn sẽ thấy biển báo màu xanh của ga tàu.',
          grammarTip,
          suggestedNextReplies: [
            { en: 'Thank you! Is it within walking distance?', vi: 'Cảm ơn bạn! Đi bộ tới đó có gần không?' },
            { en: 'Turn left at the cafe? Got it, thank you!', vi: 'Rẽ trái ở quán cà phê đúng không? Tôi hiểu rồi, cảm ơn bạn!' },
          ],
        };
      }

      if (textLower.includes('thank') || textLower.includes('got it') || textLower.includes('walking')) {
        return {
          replyEn: 'You are very welcome! It is only a 3-minute walk. Enjoy your time exploring the city and stay safe!',
          replyVi: 'Không có chi! Chỉ mất 3 phút đi bộ thôi. Chúc bạn có thời gian khám phá thành phố vui vẻ và an toàn nhé!',
          grammarTip,
          suggestedNextReplies: [
            { en: 'Thanks again, have a nice day!', vi: 'Cảm ơn lần nữa nhé, chúc bạn ngày tốt lành!' },
          ],
        };
      }
    }

    if (scenario.id === 'hotel_checkin') {
      if (textLower.includes('reservation') || textLower.includes('check in') || textLower.includes('booking') || textLower.includes('name')) {
        return {
          replyEn: 'Welcome! I have found your reservation. Everything is all set. May I see your passport and could you sign this form right here?',
          replyVi: 'Chào mừng quý khách! Tôi đã tìm thấy đơn đặt phòng của bạn. Mọi thứ đã sẵn sàng. Cho tôi xin xem hộ chiếu và bạn ký vào mẫu đơn này giúp tôi nhé?',
          grammarTip,
          suggestedNextReplies: [
            { en: 'Sure, here is my passport.', vi: 'Được chứ, đây là hộ chiếu của tôi.' },
            { en: 'Here you go! What time is breakfast?', vi: 'Của bạn đây! Mấy giờ thì có bữa sáng vậy?' },
          ],
        };
      }

      if (textLower.includes('passport') || textLower.includes('wifi') || textLower.includes('breakfast') || textLower.includes('key')) {
        return {
          replyEn: 'Thank you! Breakfast is served from 6:30 to 10:00 AM on the 2nd floor. Wi-Fi is free with password "GrandGuest2026". Here is your room key. Enjoy your stay!',
          replyVi: 'Cảm ơn bạn! Bữa sáng phục vụ từ 6:30 đến 10:00 tại tầng 2. Wi-Fi miễn phí mật khẩu là "GrandGuest2026". Đây là thẻ phòng của bạn. Chúc bạn nghỉ dưỡng thoải mái!',
          grammarTip,
          suggestedNextReplies: [
            { en: 'Thank you for your help!', vi: 'Cảm ơn sự giúp đỡ của bạn!' },
          ],
        };
      }
    }

    // Default friendly conversational reply (Free talk & General)
    const friendlyReplies: { en: string; vi: string }[] = [
      {
        en: "That sounds wonderful! I'm really enjoying chatting with you. What do you like to do in your free time?",
        vi: "Nghe tuyệt quá! Mình thực sự rất thích trò chuyện cùng bạn. Bạn thường thích làm gì vào thời gian rảnh rỗi?",
      },
      {
        en: "I totally understand! Learning a new language takes courage, and you're doing really well. Tell me more about your hometown!",
        vi: "Mình hoàn toàn hiểu! Học ngôn ngữ mới cần sự can đảm, và bạn đang làm rất tốt đấy. Kể cho mình nghe thêm về quê hương bạn đi!",
      },
      {
        en: "That's very interesting! English pronunciation can be tricky, but practicing like this every day will make you fluent in no time. How is the weather where you are?",
        vi: "Điều đó rất thú vị! Phát âm tiếng Anh đôi khi hơi mẹo, nhưng luyện tập thế này mỗi ngày bạn sẽ sớm lưu loát thôi. Thời tiết chỗ bạn thế nào?",
      },
    ];

    const randomReply = friendlyReplies[Math.floor(Math.random() * friendlyReplies.length)];

    return {
      replyEn: randomReply.en,
      replyVi: randomReply.vi,
      grammarTip,
      suggestedNextReplies: [
        { en: 'In my free time, I like listening to music and traveling.', vi: 'Vào lúc rảnh, mình thích nghe nhạc và đi du lịch.' },
        { en: 'The weather here is really nice and sunny today.', vi: 'Thời tiết ở đây hôm nay rất đẹp và nắng ráo.' },
      ],
    };
  }
}
