import React, { useState, useRef, useEffect } from 'react';
import { type Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NewChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14m-7-7h14" />
  </svg>
);

const MessageIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const PencilIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);


const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  isOpen,
  onClose,
}) => {
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (renamingId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [renamingId]);

    const handleStartRename = (e: React.MouseEvent, convo: Conversation) => {
        e.stopPropagation();
        setRenamingId(convo.id);
        setTitle(convo.title);
    };

    const handleConfirmRename = () => {
        if (renamingId && title.trim()) {
            onRenameConversation(renamingId, title.trim());
        }
        setRenamingId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleConfirmRename();
        } else if (e.key === 'Escape') {
            setRenamingId(null);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this conversation?')) {
            onDeleteConversation(id);
        }
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            />
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-full max-w-[280px] transform bg-slate-900/70 p-4 flex flex-col border-r border-slate-700/50 transition-transform duration-300 ease-in-out md:relative md:w-64 md:translate-x-0 md:max-w-none ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between">
                    <button
                        onClick={onNewConversation}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
                    >
                        <span>New Chat</span>
                        <NewChatIcon />
                    </button>
                    <button
                        onClick={onClose}
                        className="md:hidden ml-2 p-1.5 text-slate-500 hover:text-white"
                        aria-label="Close menu"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <nav className="mt-6 flex-1 overflow-y-auto pr-1 -mr-2 space-y-1">
                    <h2 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">History</h2>
                    {conversations.map((convo) => (
                        <div
                            key={convo.id}
                            onClick={() => renamingId !== convo.id && onSelectConversation(convo.id)}
                            className={`group flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                                activeConversationId === convo.id && renamingId !== convo.id
                                    ? 'bg-slate-700/50 text-white'
                                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-3 truncate">
                                <MessageIcon />
                                {renamingId === convo.id ? (
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        onBlur={handleConfirmRename}
                                        onKeyDown={handleKeyDown}
                                        className="bg-transparent border border-slate-600 rounded-md px-1 py-0 w-full text-sm -my-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <span className="truncate">{convo.title}</span>
                                )}
                            </div>
                            {renamingId !== convo.id && (
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <button
                                        onClick={(e) => handleStartRename(e, convo)}
                                        className="p-1 text-slate-500 hover:text-white"
                                        aria-label="Rename conversation"
                                    >
                                        <PencilIcon />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(e, convo.id)}
                                        className="p-1 text-slate-500 hover:text-red-400"
                                        aria-label="Delete conversation"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;