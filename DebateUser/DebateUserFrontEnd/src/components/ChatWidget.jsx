/**
 * 채팅 위젯 컴포넌트
 * 플로팅 채팅 아이콘과 채팅창을 렌더링
 * 사용자 액션 메뉴 (차단/신고/쪽지) 지원
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { reportService } from '../services/reportService';
import api from '../services/api';
import { format } from 'date-fns';
import './ChatWidget.css';

const ChatWidget = ({ debateId, debateTitle }) => {
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // 사용자 액션 메뉴 상태
    const [activeMenu, setActiveMenu] = useState(null);

    // 쪽지 팝업 상태
    const [dmPopup, setDmPopup] = useState({ show: false, userId: null, nickname: '' });
    const [dmMessage, setDmMessage] = useState('');
    const [dmSending, setDmSending] = useState(false);

    const menuRef = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // 메시지 목록 스크롤 자동 이동
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 외부 클릭 시 메뉴 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // WebSocket 연결 및 이전 메시지 로드
    useEffect(() => {
        if (isOpen && debateId) {
            setIsLoading(true);

            chatService.getMessages(debateId).then(prevMessages => {
                setMessages(prevMessages);
                setIsLoading(false);
                setTimeout(scrollToBottom, 100);
            });

            chatService.connect(
                debateId,
                (message) => {
                    setMessages(prev => [...prev, message]);
                    if (!isOpen) {
                        setUnreadCount(prev => prev + 1);
                    }
                },
                () => {
                    setIsConnected(true);
                    if (isAuthenticated && user) {
                        chatService.sendMessage(debateId, {
                            debateId,
                            userId: user.id,
                            nickname: user.nickname,
                            type: 'JOIN'
                        });
                    }
                },
                (error) => {
                    console.error('채팅 연결 에러:', error);
                    setIsConnected(false);
                }
            );

            return () => {
                if (isAuthenticated && user && chatService.isConnected()) {
                    chatService.sendMessage(debateId, {
                        debateId,
                        userId: user.id,
                        nickname: user.nickname,
                        type: 'LEAVE'
                    });
                }
                chatService.disconnect();
                setIsConnected(false);
            };
        }
    }, [isOpen, debateId]);

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setUnreadCount(0);
        }
    }, [isOpen]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('로그인이 필요합니다.');
            return;
        }
        if (!inputMessage.trim() || !isConnected) return;

        chatService.sendMessage(debateId, {
            debateId,
            userId: user.id,
            nickname: user.nickname,
            message: inputMessage.trim(),
            type: 'CHAT'
        });
        setInputMessage('');
    };

    const handleToggle = () => {
        setIsOpen(!isOpen);
        setActiveMenu(null);
    };

    const formatTime = (dateTimeStr) => {
        if (!dateTimeStr) return '';
        try {
            return format(new Date(dateTimeStr), 'HH:mm');
        } catch {
            return '';
        }
    };

    const isMyMessage = (msg) => user && msg.userId === user.id;

    const handleNicknameClick = (e, msg, index) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            alert('로그인이 필요합니다.');
            return;
        }
        if (isMyMessage(msg)) return;

        setActiveMenu(activeMenu?.index === index ? null : { userId: msg.userId, nickname: msg.nickname, index });
    };

    // 쪽지 보내기 팝업 열기
    const handleOpenDM = () => {
        if (!activeMenu) return;
        setDmPopup({ show: true, userId: activeMenu.userId, nickname: activeMenu.nickname });
        setDmMessage('');
        setActiveMenu(null);
    };

    // 쪽지 전송
    const handleSendDM = async (e) => {
        e.preventDefault();
        if (!dmMessage.trim() || !dmPopup.nickname) return;

        setDmSending(true);
        try {
            await api.post('/messages', {
                receiverNickname: dmPopup.nickname,
                content: dmMessage.trim()
            });
            alert('쪽지를 보냈습니다.');
            setDmPopup({ show: false, userId: null, nickname: '' });
            setDmMessage('');
        } catch (err) {
            alert('쪽지 전송에 실패했습니다.');
        }
        setDmSending(false);
    };

    // 사용자 신고
    const handleReport = async () => {
        if (!activeMenu) return;
        const reason = prompt(`${activeMenu.nickname}님을 신고하는 사유를 입력해주세요:`);
        if (!reason) return;

        try {
            await reportService.createReport({
                targetType: 'USER',
                targetId: activeMenu.userId,
                reason,
                description: `채팅에서 신고: ${activeMenu.nickname}`
            });
            alert('신고가 접수되었습니다.');
        } catch {
            alert('신고 처리에 실패했습니다.');
        }
        setActiveMenu(null);
    };

    // 사용자 차단
    const handleBlock = () => {
        if (!activeMenu) return;
        if (window.confirm(`${activeMenu.nickname}님을 차단하시겠습니까?\n차단된 사용자의 메시지는 표시되지 않습니다.`)) {
            const blockedUsers = JSON.parse(localStorage.getItem('blockedChatUsers') || '[]');
            if (!blockedUsers.some(u => u.id === activeMenu.userId)) {
                blockedUsers.push({ id: activeMenu.userId, nickname: activeMenu.nickname, blockedAt: new Date().toISOString() });
                localStorage.setItem('blockedChatUsers', JSON.stringify(blockedUsers));
            }
            alert(`${activeMenu.nickname}님이 차단되었습니다.\n차단 해제는 마이페이지 > 차단 관리에서 가능합니다.`);
        }
        setActiveMenu(null);
    };

    const isBlockedUser = (userId) => {
        const blockedUsers = JSON.parse(localStorage.getItem('blockedChatUsers') || '[]');
        return blockedUsers.some(u => u.id === userId);
    };

    // 내 메시지는 항상 보이고, 내가 차단한 사람의 메시지만 필터링
    const filteredMessages = messages.filter(msg => {
        // 내 메시지는 항상 표시
        if (user && msg.userId === user.id) return true;
        // 차단된 사용자의 메시지는 숨김
        return !isBlockedUser(msg.userId);
    });

    return (
        <div className="chat-widget">
            {/* 쪽지 보내기 팝업 */}
            {dmPopup.show && (
                <div className="dm-popup-overlay" onClick={() => setDmPopup({ show: false, userId: null, nickname: '' })}>
                    <div className="dm-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="dm-popup-header">
                            <h3>✉️ {dmPopup.nickname}님에게 쪽지</h3>
                            <button className="dm-popup-close" onClick={() => setDmPopup({ show: false, userId: null, nickname: '' })}>✕</button>
                        </div>
                        <form onSubmit={handleSendDM}>
                            <textarea
                                className="dm-popup-textarea"
                                placeholder="쪽지 내용을 입력하세요..."
                                value={dmMessage}
                                onChange={(e) => setDmMessage(e.target.value)}
                                maxLength={500}
                                rows={4}
                                autoFocus
                            />
                            <div className="dm-popup-actions">
                                <button type="button" className="dm-popup-cancel" onClick={() => setDmPopup({ show: false, userId: null, nickname: '' })}>
                                    취소
                                </button>
                                <button type="submit" className="dm-popup-send" disabled={!dmMessage.trim() || dmSending}>
                                    {dmSending ? '전송 중...' : '보내기'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 채팅창 */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-title">
                            <span className="chat-icon">💬</span>
                            <span className="chat-room-name">실시간 채팅</span>
                            {isConnected && <span className="connection-status connected">●</span>}
                        </div>
                        <button className="chat-close" onClick={handleToggle}>✕</button>
                    </div>

                    <div className="chat-messages">
                        {isLoading ? (
                            <div className="chat-loading">메시지 로딩 중...</div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="chat-empty">첫 번째 메시지를 남겨보세요! 💬</div>
                        ) : (
                            filteredMessages.map((msg, index) => (
                                <div
                                    key={msg.id || index}
                                    className={`chat-message ${msg.type === 'JOIN' || msg.type === 'LEAVE' ? 'system' : isMyMessage(msg) ? 'mine' : 'other'}`}
                                >
                                    {msg.type === 'JOIN' || msg.type === 'LEAVE' ? (
                                        <div className="system-message">{msg.message}</div>
                                    ) : (
                                        <>
                                            {!isMyMessage(msg) && (
                                                <div className="message-header" style={{ position: 'relative' }}>
                                                    <span className="message-nickname" onClick={(e) => handleNicknameClick(e, msg, index)}>
                                                        {msg.nickname}
                                                    </span>
                                                    {activeMenu?.index === index && (
                                                        <div className="user-action-menu" ref={menuRef}>
                                                            <button className="user-action-item" onClick={handleOpenDM}>
                                                                <span className="icon">✉️</span> 쪽지보내기
                                                            </button>
                                                            <button className="user-action-item" onClick={handleReport}>
                                                                <span className="icon">🚨</span> 신고하기
                                                            </button>
                                                            <button className="user-action-item danger" onClick={handleBlock}>
                                                                <span className="icon">🚫</span> 차단하기
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="message-content">
                                                <div className="message-bubble">{msg.message}</div>
                                                <span className="message-time">{formatTime(msg.createdAt)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-form" onSubmit={handleSendMessage}>
                        {!isAuthenticated ? (
                            <div className="login-prompt">로그인 후 채팅에 참여하세요</div>
                        ) : (
                            <>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="chat-input"
                                    placeholder="메시지를 입력하세요..."
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    maxLength={500}
                                    disabled={!isConnected}
                                />
                                <button type="submit" className="chat-send-btn" disabled={!isConnected || !inputMessage.trim()}>
                                    전송
                                </button>
                            </>
                        )}
                    </form>
                </div>
            )}

            {/* 플로팅 채팅 버튼 */}
            <button className={`chat-fab ${isOpen ? 'active' : ''}`} onClick={handleToggle} title="실시간 채팅">
                {isOpen ? '✕' : '💬'}
                {!isOpen && unreadCount > 0 && <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>
        </div>
    );
};

export default ChatWidget;
