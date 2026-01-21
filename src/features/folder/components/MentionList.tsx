// Composant dropdown pour les suggestions de notes (@mention)
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export interface MentionItem {
    id: number;
    title: string;
}

interface MentionListProps {
    items: MentionItem[];
    command: (item: { id: string; label: string }) => void;
}

// Ref exposée à TipTap pour naviguer avec les flèches
export interface MentionListRef {
    onKeyDown: (event: { event: KeyboardEvent }) => boolean;
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>(
    ({ items, command }, ref) => {
        const [selectedIndex, setSelectedIndex] = useState(0);

        // Reset la sélection quand les items changent
        useEffect(() => {
            setSelectedIndex(0);
        }, [items]);

        // Gère les touches clavier (flèches, Enter, Escape)
        useImperativeHandle(ref, () => ({
            onKeyDown: ({ event }) => {
                if (event.key === 'ArrowUp') {
                    setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
                    return true;
                }
                if (event.key === 'ArrowDown') {
                    setSelectedIndex((prev) => (prev + 1) % items.length);
                    return true;
                }
                if (event.key === 'Enter') {
                    if (items[selectedIndex]) {
                        const item = items[selectedIndex];
                        command({ id: String(item.id), label: item.title });
                    }
                    return true;
                }
                return false;
            },
        }));

        if (items.length === 0) {
            return (
                <div className="mention-dropdown">
                    <div className="mention-empty">Aucune note trouvée</div>
                </div>
            );
        }

        return (
            <div className="mention-dropdown">
                <div className="mention-header">Lier une note</div>
                {items.map((item, index) => (
                    <button
                        key={item.id}
                        className={`mention-item ${index === selectedIndex ? 'selected' : ''}`}
                        onClick={() => command({ id: String(item.id), label: item.title })}
                    >
                        <span className="mention-icon">📝</span>
                        <span className="mention-title">{item.title || 'Sans titre'}</span>
                    </button>
                ))}
            </div>
        );
    }
);

MentionList.displayName = 'MentionList';
