import { ExamQuestion } from '../types';

export const PLACEMENT_QUESTIONS: ExamQuestion[] = [
  {
    id: 'pq_1',
    question: 'Âm nào trong các từ sau đây là nguyên âm dài /iː/?',
    options: ['Sit', 'See', 'Ship', 'Bit'],
    correctAnswer: 1,
    explanation: '"See" phát âm là /siː/ với âm /iː/ kéo dài.',
    category: 'pronunciation',
  },
  {
    id: 'pq_2',
    question: 'Khi một người bạn ngoại quốc nói "Hello, how are you today?", câu trả lời tự nhiên nhất là:',
    options: [
      'I am doing great, thank you! How about you?',
      'I am 25 years old.',
      'My name is Robert.',
      'Yes, I do like it.',
    ],
    correctAnswer: 0,
    explanation: 'Đáp lại câu hỏi thăm sức khỏe/tâm trạng: "I am doing great, thank you! How about you?".',
    category: 'situation',
  },
  {
    id: 'pq_3',
    question: 'Điền từ thích hợp: "The laptop is ______ the desk." (Chiếc laptop ở TRÊN bàn làm việc)',
    options: ['in', 'on', 'at', 'into'],
    correctAnswer: 1,
    explanation: 'Dùng giới từ "on" để chỉ vị trí trên bề mặt.',
    category: 'grammar',
  },
  {
    id: 'pq_4',
    question: 'Trong quán cà phê, khi muốn gọi 1 ly latte đá một cách lịch sự, bạn nói:',
    options: [
      'Could I have an iced latte, please?',
      'Give me one iced latte now.',
      'I want drink latte cold.',
      'Bring coffee latte to me.',
    ],
    correctAnswer: 0,
    explanation: '"Could I have..., please?" là mẫu câu lịch sự chuẩn mực của người bản xứ.',
    category: 'situation',
  },
  {
    id: 'pq_5',
    question: 'Hỏi người đi đường cách đến trạm tàu điện ngầm gần nhất:',
    options: [
      'Excuse me, how do I get to the nearest subway station?',
      'Where is subway please now?',
      'You tell me station where?',
      'Subway train road which?',
    ],
    correctAnswer: 0,
    explanation: '"Excuse me, how do I get to...?" là cấu trúc hỏi đường chuẩn.',
    category: 'situation',
  },
  {
    id: 'pq_6',
    question: 'Chọn câu đúng thì Hiện tại đơn: "She usually ______ to work by bus."',
    options: ['goes', 'go', 'going', 'is go'],
    correctAnswer: 0,
    explanation: 'Chủ ngữ ngôi thứ 3 số ít "She", động từ thêm "-es" -> "goes".',
    category: 'grammar',
  },
  {
    id: 'pq_7',
    question: 'Khi muốn mặc thử một chiếc áo trong cửa hàng thời trang:',
    options: [
      'Can I try this on?',
      'Can I wear this now?',
      'Can I test this cloth?',
      'Let me put on it.',
    ],
    correctAnswer: 0,
    explanation: '"Try this on" là cụm động từ chuẩn khi thử trang phục.',
    category: 'vocab',
  },
  {
    id: 'pq_8',
    question: 'Tại quầy lễ tân khách sạn, khi muốn báo bạn đã đặt phòng trước dưới tên David:',
    options: [
      'I have a reservation under the name David.',
      'I am David booking room.',
      'David has hotel here.',
      'Give me room of David.',
    ],
    correctAnswer: 0,
    explanation: '"I have a reservation under the name [Name]" là câu chuẩn.',
    category: 'situation',
  },
  {
    id: 'pq_9',
    question: 'Nói bạn chịu trách nhiệm phụ trách đội ngũ kinh doanh:',
    options: [
      'I am responsible for the sales team.',
      'I am take care sales team.',
      'My duty is sales team doing.',
      'I responsible with sales team.',
    ],
    correctAnswer: 0,
    explanation: 'Cấu trúc "be responsible for + Noun/V-ing".',
    category: 'grammar',
  },
  {
    id: 'pq_10',
    question: 'Cách bày tỏ quan điểm cá nhân một cách học thuật và lịch thiệp:',
    options: [
      'From my perspective, this solution is more sustainable.',
      'I think this is very good only.',
      'My head thinking this is best.',
      'You must agree with my idea.',
    ],
    correctAnswer: 0,
    explanation: '"From my perspective" là cách diễn đạt chuyên nghiệp và tự nhiên.',
    category: 'vocab',
  },
];

export function evaluatePlacementScore(correctCount: number, totalQuestions: number = 10): {
  scorePercent: number;
  assignedLevel: number;
  levelTitle: string;
  feedbackVi: string;
} {
  const percent = Math.round((correctCount / totalQuestions) * 100);

  if (percent <= 20) {
    return {
      scorePercent: percent,
      assignedLevel: 1,
      levelTitle: 'Cấp 1: Xóa Mù IPA & Chào Hỏi Vỡ Lòng',
      feedbackVi: 'Bạn đang ở vạch xuất phát. Đừng lo lắng! Lộ trình Cấp 1 sẽ giúp bạn làm chủ 44 âm chuẩn và tự tin mở lời mà không sợ sai.',
    };
  } else if (percent <= 40) {
    return {
      scorePercent: percent,
      assignedLevel: 2,
      levelTitle: 'Cấp 2: Không Gian Sống & Đồ Vật Quanh Ta',
      feedbackVi: 'Bạn đã có chút cảm nhận cơ bản về tiếng Anh. Cấp 2 sẽ giúp bạn xây dựng nền móng đồ vật và mẫu câu miêu tả vững chắc.',
    };
  } else if (percent <= 60) {
    return {
      scorePercent: percent,
      assignedLevel: 3,
      levelTitle: 'Cấp 3: Ẩm Thực, Cafe & Gọi Món',
      feedbackVi: 'Nền tảng của bạn khá tốt! Bạn có thể bắt đầu ngay từ Cấp 3 để học phản xạ gọi món, giao dịch và thanh toán tự tin.',
    };
  } else if (percent <= 80) {
    return {
      scorePercent: percent,
      assignedLevel: 4,
      levelTitle: 'Cấp 4: Đi Lại & Hỏi Đường Phố',
      feedbackVi: 'Khá ấn tượng! Bạn đã nắm được ngữ pháp căn bản. Cấp 4 sẽ tôi luyện phản xạ giao tiếp nơi công cộng và hỏi đường lưu loát.',
    };
  } else {
    return {
      scorePercent: percent,
      assignedLevel: 5,
      levelTitle: 'Cấp 5: Nhịp Sống Thường Nhật & Sở Thích',
      feedbackVi: 'Xuất sắc! Bạn đã có phản xạ tốt. Hệ thống đã mở khóa thẳng tới Cấp 5 để bạn phát triển năng lực đàm thoại chuyên sâu!',
    };
  }
}
