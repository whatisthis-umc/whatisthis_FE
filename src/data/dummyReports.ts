import type { Report } from '../types/report';

export const dummyReports: Report[] = [
    {
        id: 1,
        title: '부적절한 게시글 신고',
        reporter: 'user123',
        reportedUser: 'baduser1',
        reportedUserNickname: '나쁜유저',
        reason: '광고/홍보성 글',
        status: 'unprocessed',
        createdAt: '2025.06.22 13:46',
        content: '해당 게시글에서 다른 사용자를 향한 욕설과 비방 내용이 포함되어 있습니다.',
        category: 'post',
        postCategory: '꿀템추천',
        postTitle: '학원의 냉장고 전용 밀폐용기 (BPA Free)',
        postId: 1,
        reportedContent: '냉장고 내부 공간을 효율적으로 활용할 수 있는 학원에서 만든 밀폐용기입니다.'
    },
    {
        id: 2,
        title: '스팸 게시글 신고',
        reporter: 'user456',
        reportedUser: 'spammer1',
        reportedUserNickname: '스팸유저',
        reason: '광고/홍보성 글',
        status: 'processed',
        createdAt: '2025.06.21 14:20',
        content: '동일한 광고 내용을 반복적으로 게시하고 있습니다.',
        category: 'post',
        postCategory: '생활꿀팁',
        postTitle: '생활 속 유용한 꿀팁 모음',
        postId: 2,
        reportedContent: '일상생활에서 유용한 팁들을 모아서 공유합니다.'
    },
    {
        id: 3,
        title: '괴롭힘 신고',
        reporter: 'user789',
        reportedUser: 'harasser1',
        reportedUserNickname: '나쁜유저',
        reason: '욕설 및 비하표현',
        status: 'unprocessed',
        createdAt: '2025.06.22 13:46',
        content: '여러 게시글에서 특정 사용자를 향한 괴롭힘이 계속되고 있습니다.',
        category: 'comment',
        postCategory: '꿀템추천',
        postTitle: '학원명',
        postId: 3,
        reportedContent: '나쁜 유품인 정말다애나 감사합니다.'
    },
    {
        id: 4,
        title: '기타 위반 신고',
        reporter: 'user101',
        reportedUser: 'violator1',
        reportedUserNickname: '위반유저',
        reason: '기타',
        status: 'processed',
        createdAt: '2025.06.19 16:30',
        content: '커뮤니티 가이드라인을 위반하는 내용이 포함되어 있습니다.',
        category: 'post',
        postCategory: '꿀템추천',
        postTitle: '추천하는 꿀템 리스트',
        postId: 4,
        reportedContent: '생활에 유용한 아이템들을 추천하는 게시글입니다.'
    },
    {
        id: 5,
        title: '부적절한 댓글 신고',
        reporter: 'user202',
        reportedUser: 'commenter1',
        reportedUserNickname: '댓글유저',
        reason: '욕설 및 비하표현',
        status: 'unprocessed',
        createdAt: '2025.06.18 11:45',
        content: '특정 집단을 향한 혐오 발언이 댓글에 포함되어 있습니다.',
        category: 'comment',
        postCategory: '생활꿀팁',
        postTitle: '효율적인 청소 방법',
        postId: 5,
        reportedContent: '이런 제품은 별로네요. 다른 브랜드가 훨씬 좋습니다.'
    }
];

export const reportStatuses = [
    { id: 'all', name: '전체' },
    { id: 'unprocessed', name: '미처리' },
    { id: 'processed', name: '처리완료' }
]; 