import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import { type Message, type Conversation, Role } from '../types';
import Sidebar from './Sidebar';

// SVG Icon for the Menu (Hamburger)
const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

// SVG Icon for Maverick
const MaverickIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M12 12V22" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
);

// SVG Icon for User
const UserIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white">
        <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// SVG Icon for Export/Download
const ExportIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);


// Component for rendering Code Blocks
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [code]);

    const CopyIcon = () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    );

    const CheckIcon = () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    );

    return (
        <div className="bg-slate-800/70 rounded-lg my-2 overflow-hidden text-sm">
            <div className="flex justify-between items-center px-4 py-1.5 bg-slate-900/50 text-xs text-slate-400">
                <span className="font-sans">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 font-sans text-slate-400 hover:text-white transition-colors"
                    aria-label="Copy code"
                >
                    {copied ? (
                        <>
                            <CheckIcon />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <CopyIcon />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto">
                <code className="font-mono text-slate-200">{code}</code>
            </pre>
        </div>
    );
};

const TypingIndicator: React.FC = () => (
    <div className="flex items-end gap-3 animate-fade-in-up">
        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-indigo-800 flex items-center justify-center shadow-md p-2">
            <MaverickIcon />
        </div>
        <div className="px-4 py-3 rounded-xl bg-slate-700 rounded-bl-none shadow-md">
            <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
            </div>
        </div>
    </div>
);

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === Role.User;
    const parts = message.text.split(/(```(?:[\w-]*)\n[\s\S]*?\n```)/g);

    return (
        <div className={`flex items-end gap-3 animate-fade-in-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
                className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-md p-2 ${
                    isUser ? 'bg-slate-700' : 'bg-indigo-800'
                }`}
            >
                {isUser ? <UserIcon/> : <MaverickIcon/>}
            </div>
            <div
                className={`max-w-md md:max-w-lg lg:max-w-xl px-4 py-3 rounded-xl shadow-md ${
                    isUser
                        ? 'bg-blue-600 rounded-br-none'
                        : 'bg-slate-700 rounded-bl-none'
                }`}
            >
                {parts.map((part, index) => {
                    const codeBlockRegex = /^```([\w-]*)?\n([\s\S]*?)\n```$/;
                    const match = part.match(codeBlockRegex);

                    if (match) {
                        const language = match[1] || 'code';
                        const code = match[2].trim();
                        return <CodeBlock key={index} language={language} code={code} />;
                    } else if (part.trim()) {
                        return <p key={index} className="text-white whitespace-pre-wrap text-sm md:text-base">{part}</p>;
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

// Empty state component for when there are no active chats
const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 animate-fade-in">
        <div className="w-24 h-24 mb-6 p-5 bg-slate-800/50 rounded-full">
            <MaverickIcon />
        </div>
        <h2 className="text-2xl font-bold text-slate-300">Welcome to Maverick</h2>
        <p className="mt-2 max-w-sm">
            Select a conversation or start a new one to begin chatting.
        </p>
    </div>
);

const CHAT_STORAGE_KEY = 'maverick-chat-conversations';
const INITIAL_MESSAGE: Message = {
    role: Role.Model,
    text: "Hello! I'm Maverick. I can help with code, answer questions, or just chat. What's on your mind?",
};

const Chat: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false); // Flag to prevent saving before loading

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    const handleNewConversation = useCallback(() => {
        const newConversation: Conversation = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [INITIAL_MESSAGE],
        };
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(newConversation.id);
        setIsSidebarOpen(false);
    }, []);

    // Load conversations from localStorage on initial render
    useEffect(() => {
        let initialConversations: Conversation[] = [];
        try {
            const storedConversations = localStorage.getItem(CHAT_STORAGE_KEY);
            if (storedConversations) {
                initialConversations = JSON.parse(storedConversations);
            }
        } catch (error) {
            console.error("Failed to parse conversations from localStorage", error);
        }

        if (initialConversations.length > 0) {
            setConversations(initialConversations);
            setActiveConversationId(initialConversations[0].id);
        }
        setIsLoaded(true); // Signal that loading is complete
    }, []);

    // Save conversations to localStorage whenever they change
    useEffect(() => {
        if (!isLoaded) {
            return; // Do not save until initial load is finished
        }
        try {
            if (conversations.length > 0) {
                localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
            } else {
                localStorage.removeItem(CHAT_STORAGE_KEY);
            }
        } catch (error) {
            console.error("Failed to save conversations to localStorage", error);
        }
    }, [conversations, isLoaded]);

    // Auto-scroll to the latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeConversationId, conversations, isLoading]);

    // Handle clicks outside the export menu to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectConversation = useCallback((id: string) => {
        setActiveConversationId(id);
        setIsSidebarOpen(false);
    }, []);

    const handleDeleteConversation = useCallback((id: string) => {
        setConversations(prevConversations => {
            const remaining = prevConversations.filter(c => c.id !== id);
            
            if (activeConversationId === id) {
                 if (remaining.length > 0) {
                     setActiveConversationId(remaining[0].id);
                 } else {
                     setActiveConversationId(null);
                 }
            }
            return remaining;
        });
    }, [activeConversationId]);

    const handleRenameConversation = useCallback((id: string, newTitle: string) => {
        setConversations(prev =>
            prev.map(c => (c.id === id ? { ...c, title: newTitle.trim() } : c))
        );
    }, []);

    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading || !activeConversationId) return;

        const userMessage: Message = { role: Role.User, text: inputMessage };
        const currentInput = inputMessage;
        setInputMessage('');
        setIsLoading(true);
        
        const activeConvoIndex = conversations.findIndex(c => c.id === activeConversationId);
        if (activeConvoIndex === -1) {
            setIsLoading(false);
            return;
        }

        const updatedConversations = [...conversations];
        const activeConvo = { ...updatedConversations[activeConvoIndex] };
        
        if (activeConvo.title === 'New Chat') {
            activeConvo.title = currentInput.substring(0, 30) + (currentInput.length > 30 ? '...' : '');
        }
        
        const conversationHistory = activeConvo.messages;
        activeConvo.messages = [...activeConvo.messages, userMessage];
        updatedConversations[activeConvoIndex] = activeConvo;
        setConversations(updatedConversations);

        try {
            const botResponseText = await sendMessageToGemini(currentInput, conversationHistory);
            const botMessage: Message = { role: Role.Model, text: botResponseText };
            
            setConversations(prev => {
                const convos = [...prev];
                const convoIndex = convos.findIndex(c => c.id === activeConversationId);
                if (convoIndex !== -1) {
                    convos[convoIndex].messages = [...convos[convoIndex].messages, botMessage];
                }
                return convos;
            });

        } catch (error) {
            const errorMessage: Message = {
                role: Role.Model,
                text: 'Sorry, an error occurred. Please try again.',
            };
            setConversations(prev => {
                const convos = [...prev];
                const convoIndex = convos.findIndex(c => c.id === activeConversationId);
                if (convoIndex !== -1) {
                    convos[convoIndex].messages = [...convos[convoIndex].messages, errorMessage];
                }
                return convos;
            });
        } finally {
            setIsLoading(false);
        }
    }, [inputMessage, isLoading, activeConversationId, conversations]);

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    const handleExport = useCallback((format: 'txt' | 'json') => {
        if (!activeConversation) return;

        let content: string;
        let mimeType: string;
        let fileExtension: string;
        const filename = activeConversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'chat';

        if (format === 'txt') {
            content = activeConversation.messages.map(msg => {
                const prefix = msg.role === Role.User ? '[User]' : '[Maverick]';
                return `${prefix}\n${msg.text}\n`;
            }).join('\n---\n\n');
            mimeType = 'text/plain';
            fileExtension = 'txt';
        } else { // JSON format
            content = JSON.stringify(activeConversation.messages, null, 2);
            mimeType = 'application/json';
            fileExtension = 'json';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExportMenuOpen(false); // Close menu after export
    }, [activeConversation]);

    return (
        <div className="flex h-full w-full bg-slate-900/50 backdrop-blur-xl md:max-w-7xl md:mx-auto md:my-4 md:rounded-2xl md:border md:border-slate-700/50 animate-fade-in overflow-hidden">
            <Sidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onNewConversation={handleNewConversation}
                onSelectConversation={handleSelectConversation}
                onDeleteConversation={handleDeleteConversation}
                onRenameConversation={handleRenameConversation}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between p-3 md:p-4 shrink-0 border-b border-slate-700/50">
                    <div className="flex items-center gap-2">
                         <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-1.5 text-slate-400 hover:text-white transition-colors"
                            aria-label="Open conversation history"
                        >
                            <MenuIcon />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full flex items-center justify-center bg-indigo-800 p-2">
                                <MaverickIcon />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">Maverick</h1>
                                <div className="flex items-center gap-1.5">
                                   <span className="h-2 w-2 rounded-full bg-green-400"></span>
                                   <p className="text-xs text-slate-400">Active</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative" ref={exportMenuRef}>
                        <button
                            onClick={() => setIsExportMenuOpen(prev => !prev)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-colors"
                            aria-label="Export conversation"
                            disabled={!activeConversation}
                        >
                            <ExportIcon />
                        </button>
                        {isExportMenuOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-10 animate-fade-in origin-top-right">
                                <ul className="py-1 text-sm text-slate-300">
                                    <li>
                                        <button onClick={() => handleExport('txt')} className="w-full text-left px-4 py-2 hover:bg-slate-700/50">
                                            Export as .txt
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-2 hover:bg-slate-700/50">
                                            Export as .json
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {activeConversation ? (
                        <div className="space-y-4 md:space-y-6">
                            {activeConversation.messages.map((msg, index) => (
                                <MessageBubble key={`${activeConversation.id}-${index}`} message={msg} />
                            ))}
                            {isLoading && <TypingIndicator />}
                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </main>

                <footer className="p-3 md:p-4 border-t border-slate-700/50 shrink-0">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 md:gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full px-5 py-3 pr-12 bg-slate-800/80 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/80 transition-all duration-300"
                                disabled={isLoading || !activeConversation}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !inputMessage.trim() || !activeConversation}
                            className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white w-12 h-12 flex items-center justify-center rounded-full hover:from-indigo-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
                            aria-label="Send message"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default Chat;