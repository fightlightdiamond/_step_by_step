import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';
import { createElement } from 'react';

const meta: Meta<typeof ContextMenu> = {
  title: 'Shadcn UI/ContextMenu',
  component: ContextMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    modal: {
      control: { type: 'boolean' },
      description: 'Whether the context menu is modal',
    },
  },
  args: {
    onSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    triggerText: 'Right click here',
    item1: 'Back',
    item2: 'Forward',
    item3: 'Reload',
    item4: 'More Tools',
    shortcut1: '⌘[',
    shortcut2: '⌘]',
    shortcut3: '⌘R',
    shortcut4: '',
  },
  argTypes: {
    triggerText: { control: 'text', description: 'Text hiển thị trong trigger area' },
    item1: { control: 'text', description: 'Menu item 1' },
    item2: { control: 'text', description: 'Menu item 2' },
    item3: { control: 'text', description: 'Menu item 3' },
    item4: { control: 'text', description: 'Menu item 4' },
    shortcut1: { control: 'text', description: 'Shortcut cho item 1' },
    shortcut2: { control: 'text', description: 'Shortcut cho item 2' },
    shortcut3: { control: 'text', description: 'Shortcut cho item 3' },
    shortcut4: { control: 'text', description: 'Shortcut cho item 4' },
  },
  render: (args) => createElement(ContextMenu, null,
    createElement(ContextMenuTrigger, { 
      className: 'flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm' 
    }, args.triggerText),
    createElement(ContextMenuContent, { className: 'w-64' },
      createElement(ContextMenuItem, { inset: true },
        args.item1,
        args.shortcut1 && createElement(ContextMenuShortcut, null, args.shortcut1)
      ),
      createElement(ContextMenuItem, { inset: true },
        args.item2,
        args.shortcut2 && createElement(ContextMenuShortcut, null, args.shortcut2)
      ),
      createElement(ContextMenuItem, { inset: true },
        args.item3,
        args.shortcut3 && createElement(ContextMenuShortcut, null, args.shortcut3)
      ),
      createElement(ContextMenuSeparator),
      createElement(ContextMenuItem, { inset: true },
        args.item4,
        args.shortcut4 && createElement(ContextMenuShortcut, null, args.shortcut4)
      )
    )
  ),
};

export const FileExplorer: Story = {
  args: {
    triggerText: 'Right click on file',
    fileName: 'document.pdf',
    action1: 'Open',
    action2: 'Open with...',
    action3: 'Copy',
    action4: 'Cut',
    action5: 'Paste',
    action6: 'Delete',
    action7: 'Rename',
    action8: 'Properties',
  },
  argTypes: {
    triggerText: { control: 'text', description: 'Trigger area text' },
    fileName: { control: 'text', description: 'File name to display' },
    action1: { control: 'text', description: 'Action 1' },
    action2: { control: 'text', description: 'Action 2' },
    action3: { control: 'text', description: 'Action 3' },
    action4: { control: 'text', description: 'Action 4' },
    action5: { control: 'text', description: 'Action 5' },
    action6: { control: 'text', description: 'Action 6' },
    action7: { control: 'text', description: 'Action 7' },
    action8: { control: 'text', description: 'Action 8' },
  },
  render: (args) => createElement(ContextMenu, null,
    createElement(ContextMenuTrigger, { 
      className: 'flex h-[150px] w-[300px] flex-col items-center justify-center rounded-md border border-dashed text-sm' 
    },
      createElement('div', { className: 'mb-2' }, args.triggerText),
      createElement('div', { className: 'flex items-center gap-2' },
        createElement('svg', {
          className: 'h-6 w-6 text-red-500',
          fill: 'currentColor',
          viewBox: '0 0 24 24'
        },
          createElement('path', {
            d: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z'
          })
        ),
        createElement('span', null, args.fileName)
      )
    ),
    createElement(ContextMenuContent, { className: 'w-64' },
      createElement(ContextMenuItem, null,
        createElement('svg', {
          className: 'mr-2 h-4 w-4',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
          }),
          createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
          })
        ),
        args.action1
      ),
      createElement(ContextMenuItem, null,
        createElement('svg', {
          className: 'mr-2 h-4 w-4',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
          })
        ),
        args.action2
      ),
      createElement(ContextMenuSeparator),
      createElement(ContextMenuItem, null,
        createElement('svg', {
          className: 'mr-2 h-4 w-4',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
          })
        ),
        args.action3,
        createElement(ContextMenuShortcut, null, '⌘C')
      ),
      createElement(ContextMenuItem, null,
        createElement('svg', {
          className: 'mr-2 h-4 w-4',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
          })
        ),
        args.action4,
        createElement(ContextMenuShortcut, null, '⌘X')
      ),
      createElement(ContextMenuItem, null,
        createElement('svg', {
          className: 'mr-2 h-4 w-4',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
          })
        ),
        args.action5,
        createElement(ContextMenuShortcut, null, '⌘V')
      ),
      createElement(ContextMenuSeparator),
      createElement(ContextMenuItem, null,
        createElement('svg', {
          className: 'mr-2 h-4 w-4',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
          })
        ),
        args.action6,
        createElement(ContextMenuShortcut, null, 'Del')
      ),
      createElement(ContextMenuItem, null,
        createElement('svg', {
          className: 'mr-2 h-4 w-4',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
          })
        ),
        args.action7,
        createElement(ContextMenuShortcut, null, 'F2')
      ),
      createElement(ContextMenuSeparator),
      createElement(ContextMenuItem, null,
        createElement('svg', {
          className: 'mr-2 h-4 w-4',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          })
        ),
        args.action8
      )
    )
  ),
};

export const TextEditor: Story = {
  args: {
    triggerText: 'Right click on text',
    selectedText: 'Selected text here',
    showTextActions: true,
  },
  argTypes: {
    triggerText: { control: 'text', description: 'Trigger area description' },
    selectedText: { control: 'text', description: 'Selected text to display' },
    showTextActions: { control: 'boolean', description: 'Show text-specific actions' },
  },
  render: (args) => createElement(ContextMenu, null,
    createElement(ContextMenuTrigger, { 
      className: 'flex h-[150px] w-[300px] flex-col items-center justify-center rounded-md border border-dashed text-sm p-4' 
    },
      createElement('div', { className: 'mb-2 text-center' }, args.triggerText),
      createElement('div', { className: 'bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs' },
        args.selectedText
      )
    ),
    createElement(ContextMenuContent, { className: 'w-64' },
      args.showTextActions && createElement(ContextMenuItem, null,
        'Cut',
        createElement(ContextMenuShortcut, null, '⌘X')
      ),
      args.showTextActions && createElement(ContextMenuItem, null,
        'Copy',
        createElement(ContextMenuShortcut, null, '⌘C')
      ),
      args.showTextActions && createElement(ContextMenuItem, null,
        'Paste',
        createElement(ContextMenuShortcut, null, '⌘V')
      ),
      args.showTextActions && createElement(ContextMenuSeparator),
      createElement(ContextMenuItem, null, 'Select All', createElement(ContextMenuShortcut, null, '⌘A')),
      createElement(ContextMenuSeparator),
      createElement(ContextMenuSub, null,
        createElement(ContextMenuSubTrigger, null, 'Format'),
        createElement(ContextMenuSubContent, { className: 'w-48' },
          createElement(ContextMenuItem, null, 'Bold', createElement(ContextMenuShortcut, null, '⌘B')),
          createElement(ContextMenuItem, null, 'Italic', createElement(ContextMenuShortcut, null, '⌘I')),
          createElement(ContextMenuItem, null, 'Underline', createElement(ContextMenuShortcut, null, '⌘U')),
          createElement(ContextMenuSeparator),
          createElement(ContextMenuItem, null, 'Clear Formatting')
        )
      ),
      createElement(ContextMenuSub, null,
        createElement(ContextMenuSubTrigger, null, 'Insert'),
        createElement(ContextMenuSubContent, { className: 'w-48' },
          createElement(ContextMenuItem, null, 'Link', createElement(ContextMenuShortcut, null, '⌘K')),
          createElement(ContextMenuItem, null, 'Image'),
          createElement(ContextMenuItem, null, 'Table'),
          createElement(ContextMenuSeparator),
          createElement(ContextMenuItem, null, 'Horizontal Rule')
        )
      )
    )
  ),
};
