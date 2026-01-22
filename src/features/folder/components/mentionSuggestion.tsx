import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance } from 'tippy.js';
import { MentionList, type MentionItem, type MentionListRef } from './MentionList';

// TipTap mention suggestion configuration
export function createMentionSuggestion(getNoteseFn: () => MentionItem[]) {
    return {
        char: '@',

        items: ({ query }: { query: string }) => {
            const notes = getNoteseFn();
            return notes
                .filter((note) =>
                    note.title?.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 8);
        },

        render: () => {
            let component: ReactRenderer<MentionListRef> | null = null;
            let popup: Instance[] | null = null;

            return {
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

                onUpdate: (props: any) => {
                    component?.updateProps(props);

                    if (popup && props.clientRect) {
                        popup[0].setProps({
                            getReferenceClientRect: props.clientRect,
                        });
                    }
                },

                onKeyDown: (props: any) => {
                    if (props.event.key === 'Escape') {
                        popup?.[0].hide();
                        return true;
                    }
                    return component?.ref?.onKeyDown(props) ?? false;
                },

                onExit: () => {
                    popup?.[0].destroy();
                    component?.destroy();
                },
            };
        },
    };
}
