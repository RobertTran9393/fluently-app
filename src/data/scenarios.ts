import { RoleplayScenario } from '../types';

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'starbucks_ordering',
    title: 'Gọi cà phê tại tiệm Coffee New York',
    titleVi: 'Đặt đồ uống, chọn kích cỡ và thanh toán',
    role: 'Khách hàng',
    aiPersona: 'Alex (Barista thân thiện)',
    aiAvatar: '☕',
    description: 'Bạn vừa bước vào một quán cà phê ở trung tâm New York. Hãy gọi đồ uống yêu thích và thanh toán nhé.',
    situation: 'Bạn đang đứng trước quầy bar, người phục vụ Alex mỉm cười chào bạn.',
    difficulty: 'Cực dễ',
    openingMessage: 'Good morning! Welcome to Central Brew. What can I get started for you today?',
    openingMessageVi: 'Chào buổi sáng! Chào mừng quý khách. Tôi có thể chuẩn bị món gì cho bạn hôm nay?',
    goal: 'Gọi 1 ly Iced Latte size vừa (Medium), ít đường và thanh toán bằng thẻ/tiền mặt.',
    steps: [
      {
        id: 'sb_1',
        aiPrompt: 'Good morning! Welcome to Central Brew. What can I get started for you today?',
        aiPromptVi: 'Chào buổi sáng! Tôi có thể lấy món gì cho bạn hôm nay?',
        suggestedAnswers: [
          {
            en: 'Hi! Could I have an iced latte, please?',
            vi: 'Chào bạn! Cho tôi một ly latte đá nhé?',
            pronunciationTip: 'Nhấn mạnh vào từ "iced" và "latte", cuối câu hạ giọng nhẹ nhàng.',
          },
          {
            en: 'Good morning, I would like an Americano, please.',
            vi: 'Chào buổi sáng, tôi muốn một ly Americano nhé.',
            pronunciationTip: '"Americano" đọc nhấn âm ba: /əˌmerɪˈkɑːnəʊ/.',
          },
          {
            en: 'Just a hot cappuccino for me, thanks!',
            vi: 'Cho tôi một ly cappuccino nóng thôi, cảm ơn!',
            pronunciationTip: '"Cappuccino" nhấn âm ba /ˌkæpəˈtʃiːnəʊ/.',
          },
        ],
      },
      {
        id: 'sb_2',
        aiPrompt: 'Sure thing! What size would you like? We have Small, Medium, and Large.',
        aiPromptVi: 'Dạ được chứ! Bạn muốn size nào ạ? Chúng tôi có Nhỏ, Vừa và Lớn.',
        suggestedAnswers: [
          {
            en: 'A medium size, please.',
            vi: 'Cho tôi size vừa nhé.',
            pronunciationTip: '"Medium" đọc là /ˈmiːdiəm/, âm đầu là /iː/ dài.',
          },
          {
            en: 'Large, please. And can you make it with less sugar?',
            vi: 'Size lớn nhé. Và bạn làm ít đường giúp tôi được không?',
            pronunciationTip: 'Cụm "less sugar" nói liền mạch.',
          },
        ],
      },
      {
        id: 'sb_3',
        aiPrompt: 'Got it! Is that for here or to go? And how would you like to pay?',
        aiPromptVi: 'Đã rõ! Bạn uống ở đây hay mang đi? Và bạn muốn thanh toán bằng gì?',
        suggestedAnswers: [
          {
            en: 'To-go, please. I will pay with credit card.',
            vi: 'Mang đi nhé. Tôi sẽ trả bằng thẻ tín dụng.',
            pronunciationTip: '"To-go" đọc nhanh, nối âm "pay with".',
          },
          {
            en: 'For here, please. Can I pay in cash?',
            vi: 'Uống tại đây nhé. Tôi trả bằng tiền mặt được không?',
            pronunciationTip: '"Cash" đọc âm cuối /ʃ/ xùy gió cong môi.',
          },
        ],
      },
    ],
  },
  {
    id: 'ask_directions_nyc',
    title: 'Hỏi đường đến ga tàu điện ngầm',
    titleVi: 'Tìm đường khi lạc tại thành phố nước ngoài',
    role: 'Khách du lịch',
    aiPersona: 'Sarah (Người dân địa phương nhiệt tình)',
    aiAvatar: '🗺️',
    description: 'Bạn đang đi bộ ở trung tâm Manhattan và không thấy lối vào ga tàu. Hãy hỏi thăm một người qua đường.',
    situation: 'Bạn thấy Sarah đang đứng chờ đèn đỏ, bạn bước tới mở lời lịch sự.',
    difficulty: 'Cơ bản',
    openingMessage: 'Hi there! You look a little lost. Do you need some help?',
    openingMessageVi: 'Chào bạn! Trông bạn có vẻ hơi lạc đường. Bạn có cần giúp gì không?',
    goal: 'Hỏi đường đến trạm tàu điện ngầm gần nhất và cảm ơn người giúp đỡ.',
    steps: [
      {
        id: 'dir_1',
        aiPrompt: 'Hi there! You look a little lost. Do you need some help?',
        aiPromptVi: 'Chào bạn! Trông bạn có vẻ đang tìm gì đó. Bạn có cần giúp không?',
        suggestedAnswers: [
          {
            en: 'Excuse me, could you tell me how to get to the subway station?',
            vi: 'Xin lỗi, bạn có thể chỉ tôi đường đến ga tàu điện ngầm được không?',
            pronunciationTip: 'Bắt đầu bằng giọng nhẹ nhàng lịch sự "Excuse me".',
          },
          {
            en: 'Yes please! Where is the nearest metro station?',
            vi: 'Vâng cảm ơn bạn! Trạm tàu điện gần nhất ở đâu vậy ạ?',
            pronunciationTip: '"Nearest" đọc là /ˈnɪərɪst/.',
          },
        ],
      },
      {
        id: 'dir_2',
        aiPrompt: 'Oh, it is very close! Just walk straight two blocks, then turn left at the bakery. It is right there.',
        aiPromptVi: 'Ồ, gần lắm! Cứ đi thẳng 2 dãy nhà nữa, rồi rẽ trái ở tiệm bánh. Nó nằm ngay đó đấy.',
        suggestedAnswers: [
          {
            en: 'So go straight and turn left at the bakery? Thank you so much!',
            vi: 'Vậy là đi thẳng rồi rẽ trái ở tiệm bánh đúng không? Cảm ơn bạn rất nhiều!',
            pronunciationTip: 'Lặp lại để xác nhận hướng đi, lên giọng ở cuối câu hỏi.',
          },
          {
            en: 'Got it! How long does it take to walk there?',
            vi: 'Tôi hiểu rồi! Đi bộ tới đó mất khoảng bao lâu?',
            pronunciationTip: '"How long does it take" là cụm hỏi thời gian cực kỳ thông dụng.',
          },
        ],
      },
    ],
  },
  {
    id: 'hotel_checkin',
    title: 'Check-in tại khách sạn quốc tế',
    titleVi: 'Làm thủ tục nhận phòng và hỏi dịch vụ',
    role: 'Du khách',
    aiPersona: 'David (Lễ tân khách sạn chuyên nghiệp)',
    aiAvatar: '🏨',
    description: 'Bạn vừa đến khách sạn sau chuyến bay dài. Hãy làm thủ tục nhận phòng và hỏi mật khẩu Wi-Fi.',
    situation: 'Bạn bước tới bàn tiếp tân khách sạn.',
    difficulty: 'Cơ bản',
    openingMessage: 'Welcome to Grand Plaza Hotel! How may I assist you today?',
    openingMessageVi: 'Chào mừng quý khách đến khách sạn Grand Plaza! Tôi có thể giúp gì cho bạn hôm nay?',
    goal: 'Cung cấp tên đặt phòng, nhận chìa khóa phòng và hỏi mật khẩu Wi-Fi.',
    steps: [
      {
        id: 'h_1',
        aiPrompt: 'Welcome to Grand Plaza Hotel! How may I assist you today?',
        aiPromptVi: 'Chào mừng quý khách đến khách sạn! Tôi có thể hỗ trợ gì cho quý khách?',
        suggestedAnswers: [
          {
            en: 'Hello! I would like to check in, please. I have a reservation.',
            vi: 'Xin chào! Tôi muốn làm thủ tục nhận phòng. Tôi có đặt trước rồi.',
            pronunciationTip: '"Check in" nối âm /tʃek ɪn/.',
          },
          {
            en: 'Hi, I have a booking under the name Robert.',
            vi: 'Chào bạn, tôi có đặt phòng dưới tên Robert.',
            pronunciationTip: '"Booking under the name" là cụm chuẩn.',
          },
        ],
      },
      {
        id: 'h_2',
        aiPrompt: 'Perfect! I see your booking for 3 nights. May I see your passport and a credit card for the deposit?',
        aiPromptVi: 'Tuyệt vời! Tôi đã thấy thông tin đặt 3 đêm. Tôi có thể xem hộ chiếu của bạn được không?',
        suggestedAnswers: [
          {
            en: 'Here you go! Here is my passport.',
            vi: 'Của bạn đây! Đây là hộ chiếu của tôi.',
            pronunciationTip: '"Here you go" là câu cực kỳ tự nhiên khi trao đồ vật cho ai.',
          },
        ],
      },
      {
        id: 'h_3',
        aiPrompt: 'Thank you! Your room is 402 on the 4th floor. Here is your key card. Do you have any questions?',
        aiPromptVi: 'Cảm ơn bạn! Phòng của bạn là 402 tầng 4. Đây là thẻ phòng. Bạn có câu hỏi nào không?',
        suggestedAnswers: [
          {
            en: 'Yes, what is the Wi-Fi password and what time is breakfast?',
            vi: 'Vâng, mật khẩu Wi-Fi là gì và mấy giờ có bữa sáng vậy?',
            pronunciationTip: '"Breakfast" đọc là /ˈbrekfəst/, không đọc thành "phát".',
          },
        ],
      },
    ],
  },
  {
    id: 'freetalk_friend',
    title: 'Giao lưu tự do với người bạn Tây (Free Talk)',
    titleVi: 'Nói chuyện phiếm hàng ngày, hỏi thăm sở thích & văn hóa',
    role: 'Bạn bè',
    aiPersona: 'Emma (Bạn du học sinh thân thiện)',
    aiAvatar: '👋',
    description: 'Trò chuyện tự do không giới hạn với Emma. Bạn có thể hỏi bất cứ điều gì về đất nước, sở thích, âm nhạc hay tiếng Anh.',
    situation: 'Emma đang ngồi uống trà và rất vui lòng trò chuyện bằng tiếng Anh với bạn.',
    difficulty: 'Thực tế',
    openingMessage: 'Hey there! Nice to connect with you. How is your day going so far?',
    openingMessageVi: 'Chào bạn nhé! Rất vui được kết nối. Hôm nay của bạn thế nào rồi?',
    goal: 'Thoải mái tâm sự, chia sẻ về bản thân và luyện phản xạ tự nhiên.',
    steps: [
      {
        id: 'ft_1',
        aiPrompt: 'Hey there! Nice to connect with you. How is your day going so far?',
        aiPromptVi: 'Chào bạn! Hôm nay của bạn thế nào rồi?',
        suggestedAnswers: [
          {
            en: 'Hi Emma! My day is pretty good, thanks for asking. How about you?',
            vi: 'Chào Emma! Ngày hôm nay của mình khá ổn, cảm ơn bạn đã hỏi. Còn bạn thì sao?',
            pronunciationTip: '"Pretty good" người Mỹ đọc chữ t mềm như chữ d nhẹ "pri-dee good".',
          },
          {
            en: 'I am a little tired, but excited to practice English with you!',
            vi: 'Mình hơi mệt một chút, nhưng rất hào hứng được luyện tiếng Anh cùng bạn!',
            pronunciationTip: '"Excited to practice" nối âm mượt mà.',
          },
        ],
      },
    ],
  },
];
