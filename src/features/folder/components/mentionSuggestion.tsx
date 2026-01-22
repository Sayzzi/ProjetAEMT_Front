// Configuration du plugin suggestion pour les @mentions
import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance } from 'tippy.js';
import { MentionList, type MentionItem, type MentionListRef } from './MentionList';

// Crée la config suggestion pour TipTap
// Accepte une fonction getter pour éviter de recréer l'éditeur quand les notes changent
export function createMentionSuggestion(getNoteseFn: () => MentionItem[]) {
    return {
        // Caractère déclencheur
        char: '@',

        // Filtre les notes selon la query tapée
        items: ({ query }: { query: string }) => {
            const notes = getNoteseFn();
            return notes
                .filter((note) =>
                    note.title?.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 8); // Max 8 suggestions
        },

        // Rendu du dropdown
        render: () => {
            let component: ReactRenderer<MentionListRef> | null = null;
            let popup: Instance[] | null = null;

            return {
                // Appelé quand on tape @
                onStart: (props: any) => {
                    component = new ReactRenderer(MentionList, {
                        props,
                        editor: props.editor,
                    });

                    if (!props.clientRect) return;

                    popup = tippy('body', {
                        getReferenceClientRect: props.clientRect,
                        appendTo: () => document.body,
                        content: component.element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: 'manual',
                        placement: 'bottom-start',
                        theme: 'mention',
                    });
                },

                // Appelé à chaque frappe après @
                onUpdate: (props: any) => {
                    component?.updateProps(props);

                    if (popup && props.clientRect) {
                        popup[0].setProps({
                            getReferenceClientRect: props.clientRect,
                        });
                    }
                },

                // Gère les touches clavier
                onKeyDown: (props: any) => {
                    if (props.event.key === 'Escape') {
                        popup?.[0].hide();
                        return true;
                    }
                    return component?.ref?.onKeyDown(props) ?? false;
                },

                // Ferme le dropdown
                onExit: () => {
                    popup?.[0].destroy();
                    component?.destroy();
                },
            };
        },
    };
}
