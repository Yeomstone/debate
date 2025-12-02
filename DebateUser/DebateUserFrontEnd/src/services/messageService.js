import api from './api';

export const messageService = {
  // 쪽지 보내기
  sendMessage: (receiverNickname, content) => {
    return api.post('/messages', { receiverNickname, content });
  },

  // 받은 쪽지 목록
  getReceivedMessages: (page = 0, size = 10) => {
    return api.get(`/messages/received?page=${page}&size=${size}`);
  },

  // 보낸 쪽지 목록
  getSentMessages: (page = 0, size = 10) => {
    return api.get(`/messages/sent?page=${page}&size=${size}`);
  },

  // 쪽지 상세 조회 (읽음 처리)
  readMessage: (id) => {
    return api.get(`/messages/${id}`);
  },

  // 쪽지 삭제
  deleteMessage: (id) => {
    return api.delete(`/messages/${id}`);
  },

  // 안 읽은 쪽지 개수
  getUnreadCount: () => {
    return api.get('/messages/unread-count');
  }
};
