import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const KanbanCard = ({ cardKey, card, column, listId }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card._id,
    data: { 
      card: card,
      listId: listId || column // listId identifies which list this card belongs to
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const dueDate = card.dueDate
    ? new Date(card.dueDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      })
    : null;

  const firstUser = card.assignedUsers?.[0] || null;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-grab active:cursor-grabbing ${
        isDragging ? 'ring-2 ring-[#e95e19] ring-opacity-50' : ''
      }`}
    >
      
      {/* Card Title with subtle gradient on hover */}
      <h3 className="text-gray-800 text-sm font-semibold mb-2 leading-snug group-hover:text-[#e95e19] transition-colors">
        {card.title || "Untitled"}
      </h3>

      {/* Description */}
      {card.description && (
        <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed">
          {card.description}
        </p>
      )}

      {/* Labels - moved above footer for better hierarchy */}
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {card.labels.map((label, i) => (
            <span
              key={i}
              className="text-[10px] px-2.5 py-1 rounded-md bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 font-medium border border-orange-200"
            >
              {label}
            </span>
          ))}
        </div>
      )}

    </div>
  );
};

export default KanbanCard;