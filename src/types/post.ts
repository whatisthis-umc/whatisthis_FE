export interface ItemCardProps {
  id: number;
  category: string; //청소템, 브랜드 꿀템같은 카테고리
  hashtag: string | string[];
  imageUrl: string | string[];
  title: string;
  description: string;
  views: number;
  scraps: number;
  date: Date;
  type: "tips" | "items";
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  authorNickname: string;
  category: '꿀템추천' | '생활꿀팁' | '커뮤니티';
  createdAt: string;
  views: number;
  likes: number;
  comments: number;
  tags?: string[];
  features?: {
    title: string;
    description: string;
  }[];
  targetAudience?: string;
}

export const dummyPosts: Post[] = [
  {
    id: 1,
    title: '학원의 냉장고 전용 밀폐용기 (BPA Free)',
    content: `냉장고 내부 공간을 효율적으로 활용할 수 있는 학원에서 만든 밀폐용기입니다.

BPA Free 제품으로 안전에 유해한 환경호르몬이 검출되지 않아 안심하고 사용할 수 있으며, 투명하여 내 용기에서 서 식기세척기 사용도 가능합니다.`,
    author: 'baduser1',
    authorNickname: '나쁜유저',
    category: '꿀템추천',
    createdAt: '2025.06.22 13:46',
    views: 1234,
    likes: 56,
    comments: 12,
    features: [
      {
        title: '주요 특징',
        description: '공간 효율성이 뛰어 규격화되어 있어 수납 공간 절약이 됩니다.'
      },
      {
        title: '밀폐력 우수',
        description: '실리콘 패킹을 통해 내용물의 냄새와 수분의 증발을 막아 신선도를 지켜줍니다.'
      },
      {
        title: '안전 인증',
        description: '식품의약품안전처(FDA) 기준에 적합하며, 환경부 인증을 받은 소재를 사용하였습니다.'
      }
    ],
    targetAudience: '냉장고 정리를 효율적으로 하고 싶은 분 안전한 식품보관 용기를 원하는 분 오랜시간 음식 신선함 유지를 원하는 분 전자레인지 및 식기 세척기를 주로 사용 하시는 분 1인가구'
  },
  {
    id: 2,
    title: '생활 속 유용한 꿀팁 모음',
    content: '일상생활에서 유용한 팁들을 모아서 공유합니다. 청소, 요리, 정리정돈 등 다양한 영역의 꿀팁들입니다.',
    author: 'spammer1',
    authorNickname: '스팸유저',
    category: '생활꿀팁',
    createdAt: '2025.06.21 14:20',
    views: 890,
    likes: 34,
    comments: 8,
    features: [
      {
        title: '청소 팁',
        description: '베이킹소다와 식초를 이용한 천연 청소법'
      },
      {
        title: '요리 팁',
        description: '음식을 더 맛있게 만드는 간단한 비법들'
      }
    ]
  },
  {
    id: 3,
    title: '자유게시판 이용 관련 문의',
    content: '커뮤니티 이용에 대한 문의사항과 건의사항을 공유하는 공간입니다.',
    author: 'harasser1',
    authorNickname: '괴롭히는유저',
    category: '커뮤니티',
    createdAt: '2025.06.20 09:15',
    views: 567,
    likes: 12,
    comments: 24
  },
  {
    id: 4,
    title: '추천하는 꿀템 리스트',
    content: '생활에 유용한 아이템들을 추천하는 게시글입니다.',
    author: 'violator1',
    authorNickname: '위반유저',
    category: '꿀템추천',
    createdAt: '2025.06.19 16:30',
    views: 2100,
    likes: 89,
    comments: 15
  },
  {
    id: 5,
    title: '효율적인 청소 방법',
    content: '집안 청소를 효율적으로 하는 다양한 방법들을 소개합니다.',
    author: 'commenter1',
    authorNickname: '댓글유저',
    category: '생활꿀팁',
    createdAt: '2025.06.18 11:45',
    views: 1456,
    likes: 67,
    comments: 23
  }
];