import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDroppable } from '@dnd-kit/core';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ id, title, cards = [], onCardCreated, onCardDeleted, board }) => {
    const [localCards, setLocalCards] = useState(cards);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCard, setNewCard] = useState({
        title: '',
        description: '',
        labels: []
    });
    const [labelInput, setLabelInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [deletingCardId, setDeletingCardId] = useState(null);

    // Make this column droppable
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { listId: id }
    });

    // Sync cards when parent updates
    useEffect(() => {
        setLocalCards(cards);
    }, [cards]);

    const handleCreateCard = async (e) => {
        e.preventDefault();

        if (!newCard.title.trim()) {
            setError('Title is required');
            return;
        }

        setIsLoading(true);
        setError('');

        console.log('Creating card with data:', {
            listId: id,
            board: board,
            title: newCard.title,
            description: newCard.description,
            labels: newCard.labels
        });

        try {
            const response = await axios.post(
                'http://localhost:5000/api/v1/cards',
                {
                    listId: id,
                    board: board,
                    title: newCard.title,
                    description: newCard.description,
                    labels: newCard.labels
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            // Update local state immediately
            setLocalCards(prev => [...prev, response.data]);

            // Reset form
            setNewCard({
                title: '',
                description: '',
                labels: []
            });
            setLabelInput('');

            setIsAddingCard(false);

            // Notify parent component
            if (onCardCreated) {
                onCardCreated(response.data);
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to create card');
            console.error('Error creating card:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCard = async (cardId) => {
        if (!window.confirm('Are you sure you want to delete this card?')) {
            return;
        }

        setDeletingCardId(cardId);
        setError('');

        try {
            await axios.delete(
                `http://localhost:5000/api/v1/cards/${cardId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    params: {
                        board: JSON.stringify(board)
                    }
                }
            );

            setLocalCards(prev => prev.filter(card => card._id !== cardId));

            if (onCardDeleted) {
                onCardDeleted(cardId);
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to delete card');
            console.error('Error deleting card:', err);
        } finally {
            setDeletingCardId(null);
        }
    };

    const handleAddLabel = (e) => {
        // Handle both Enter key and blur event
        const shouldAdd = (e.key === 'Enter' || e.type === 'blur') && labelInput.trim();
        
        if (shouldAdd) {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
            
            const trimmedLabel = labelInput.trim();
            
            // Avoid duplicate labels
            if (!newCard.labels.includes(trimmedLabel)) {
                setNewCard(prev => ({
                    ...prev,
                    labels: [...prev.labels, trimmedLabel]
                }));
            }
            setLabelInput('');
        }
    };

    const handleLabelInputChange = (e) => {
        setLabelInput(e.target.value);
    };

    const handleAddLabelClick = () => {
        if (labelInput.trim()) {
            const trimmedLabel = labelInput.trim();
            
            // Avoid duplicate labels
            if (!newCard.labels.includes(trimmedLabel)) {
                setNewCard(prev => ({
                    ...prev,
                    labels: [...prev.labels, trimmedLabel]
                }));
            }
            setLabelInput('');
        }
    };

    const handleRemoveLabel = (labelToRemove) => {
        setNewCard(prev => ({
            ...prev,
            labels: prev.labels.filter(label => label !== labelToRemove)
        }));
    };

    const handleCancel = () => {
        setIsAddingCard(false);
        setNewCard({
            title: '',
            description: '',
            labels: []
        });
        setLabelInput('');
        setError('');
    };

    return (
        <div className="flex flex-col h-auto min-w-[350px] max-w-[350px] mt-3 mb-2 me-2">
            <div 
                ref={setNodeRef}
                className={`rounded-2xl bg-white border shadow-xl flex flex-col h-full transition-all duration-200 ${
                    isOver ? 'border-[#e95e19] border-2 bg-orange-50' : 'border-black/5'
                }`}
            >
                {/* Header */}
                <div className="p-3 bg-[#e95e19] text-white border-b border-black/10 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-lg">· {title}</h2>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
                            {localCards.length}
                        </span>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mx-3 mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-xs">{error}</p>
                    </div>
                )}

                {/* Cards */}
                <div
                    className="flex-1 overflow-y-auto p-3 space-y-2
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-neutral-300
            hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400
            [&::-webkit-scrollbar-thumb]:rounded-full"
                >
                    {localCards.map((card, idx) => (
                        <div key={card._id} className="relative group">
                            <KanbanCard cardKey={card._id} card={card} column={id} listId={id} />

                            {/* Delete Button */}
                            <button
                                onClick={() => handleDeleteCard(card._id)}
                                disabled={deletingCardId === card._id}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-md p-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm z-10"
                                title="Delete card"
                            >
                                {deletingCardId === card._id ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                )}
                            </button>

                            {idx !== localCards.length - 1 && <div className="h-px bg-black/5 my-2" />}
                        </div>
                    ))}

                    {/* Add Card Form */}
                    {isAddingCard ? (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                            <form onSubmit={handleCreateCard}>
                                <input
                                    type="text"
                                    placeholder="Card title"
                                    value={newCard.title}
                                    onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-[#e95e19] focus:border-transparent"
                                    autoFocus
                                    disabled={isLoading}
                                />

                                <textarea
                                    placeholder="Description (optional)"
                                    value={newCard.description}
                                    onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#e95e19] focus:border-transparent"
                                    rows="2"
                                    disabled={isLoading}
                                />

                                {/* Labels/Tags Input */}
                                <div className="mb-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add label (press Enter)"
                                            value={labelInput}
                                            onChange={handleLabelInputChange}
                                            onKeyDown={handleAddLabel}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e95e19] focus:border-transparent text-sm"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddLabelClick}
                                            disabled={isLoading || !labelInput.trim()}
                                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    
                                    {/* Display Added Labels */}
                                    {newCard.labels.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {newCard.labels.map((label, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#e95e19] text-white text-xs rounded-full"
                                                >
                                                    {label}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveLabel(label)}
                                                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                                        disabled={isLoading}
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-[#e95e19] text-white px-4 py-2 rounded-md hover:bg-[#d14d0f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                    >
                                        {isLoading ? 'Adding...' : 'Add Card'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingCard(true)}
                            className="w-full px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-left text-sm flex items-center gap-2"
                        >
                            <span className="text-lg">+</span>
                            <span>Add a card</span>
                        </button>
                    )}

                    {!localCards.length && !isAddingCard && (
                        <div className="h-full flex items-center justify-center py-12">
                            <p className="text-gray-400 text-sm">No cards yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KanbanColumn;