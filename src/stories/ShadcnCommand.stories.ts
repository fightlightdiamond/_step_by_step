import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { createElement, useState } from 'react';

const meta: Meta<typeof Command> = {
  title: 'Shadcn UI/Command',
  component: Command,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: { type: 'text' },
      description: 'CSS class names',
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
    placeholder: 'Type a command or search...',
    emptyText: 'No results found.',
  },
  argTypes: {
    placeholder: { control: 'text', description: 'Placeholder text for input' },
    emptyText: { control: 'text', description: 'Text when no results found' },
  },
  render: (args) => createElement(Command, { className: 'rounded-lg border shadow-md max-w-[450px]' },
    createElement(CommandInput, { placeholder: args.placeholder }),
    createElement(CommandList, null,
      createElement(CommandEmpty, null, args.emptyText),
      createElement(CommandGroup, { heading: 'Suggestions' },
        createElement(CommandItem, null,
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
              d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
            })
          ),
          createElement('span', null, 'Calendar')
        ),
        createElement(CommandItem, null,
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
              d: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            })
          ),
          createElement('span', null, 'Search Emoji')
        ),
        createElement(CommandItem, null,
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
              d: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
            })
          ),
          createElement('span', null, 'Calculator')
        )
      )
    )
  ),
};

export const WithGroups: Story = {
  args: {
    placeholder: 'Search commands...',
    emptyText: 'No commands found.',
    group1Title: 'Suggestions',
    group2Title: 'Settings',
  },
  argTypes: {
    placeholder: { control: 'text', description: 'Placeholder text' },
    emptyText: { control: 'text', description: 'Empty state text' },
    group1Title: { control: 'text', description: 'First group title' },
    group2Title: { control: 'text', description: 'Second group title' },
  },
  render: (args) => createElement(Command, { className: 'rounded-lg border shadow-md max-w-[450px]' },
    createElement(CommandInput, { placeholder: args.placeholder }),
    createElement(CommandList, null,
      createElement(CommandEmpty, null, args.emptyText),
      createElement(CommandGroup, { heading: args.group1Title },
        createElement(CommandItem, null,
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
              d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
            })
          ),
          createElement('span', null, 'Calendar'),
          createElement(CommandShortcut, null, '⌘K')
        ),
        createElement(CommandItem, null,
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
              d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            })
          ),
          createElement('span', null, 'Search Files'),
          createElement(CommandShortcut, null, '⌘F')
        )
      ),
      createElement(CommandSeparator),
      createElement(CommandGroup, { heading: args.group2Title },
        createElement(CommandItem, null,
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
              d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
            })
          ),
          createElement('span', null, 'Profile'),
          createElement(CommandShortcut, null, '⌘P')
        ),
        createElement(CommandItem, null,
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
              d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
            })
          ),
          createElement('span', null, 'Settings'),
          createElement(CommandShortcut, null, '⌘S')
        )
      )
    )
  ),
};

export const Dialog: Story = {
  args: {
    buttonText: 'Open Command Menu',
    placeholder: 'Type a command or search...',
    emptyText: 'No results found.',
  },
  argTypes: {
    buttonText: { control: 'text', description: 'Button text to open dialog' },
    placeholder: { control: 'text', description: 'Placeholder text' },
    emptyText: { control: 'text', description: 'Empty state text' },
  },
  render: (args) => {
    const [open, setOpen] = useState(false);

    return createElement('div', null,
      createElement(Button, { 
        variant: 'outline',
        onClick: () => setOpen(true)
      }, args.buttonText),
      
      createElement(CommandDialog, { 
        open, 
        onOpenChange: setOpen 
      },
        createElement(CommandInput, { placeholder: args.placeholder }),
        createElement(CommandList, null,
          createElement(CommandEmpty, null, args.emptyText),
          createElement(CommandGroup, { heading: 'Suggestions' },
            createElement(CommandItem, { onSelect: () => setOpen(false) },
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
                  d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                })
              ),
              createElement('span', null, 'Calendar')
            ),
            createElement(CommandItem, { onSelect: () => setOpen(false) },
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
                  d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                })
              ),
              createElement('span', null, 'Search Files')
            )
          ),
          createElement(CommandSeparator),
          createElement(CommandGroup, { heading: 'Settings' },
            createElement(CommandItem, { onSelect: () => setOpen(false) },
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
                  d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                })
              ),
              createElement('span', null, 'Profile')
            ),
            createElement(CommandItem, { onSelect: () => setOpen(false) },
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
                  d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                })
              ),
              createElement('span', null, 'Settings')
            )
          )
        )
      )
    );
  },
};

export const CustomItems: Story = {
  args: {
    placeholder: 'Search items...',
    emptyText: 'No items found.',
    item1: 'Create new file',
    item2: 'Open recent',
    item3: 'Save as...',
    item4: 'Export',
    item5: 'Import',
    shortcut1: '⌘N',
    shortcut2: '⌘O',
    shortcut3: '⌘⇧S',
    shortcut4: '⌘E',
    shortcut5: '⌘I',
  },
  argTypes: {
    placeholder: { control: 'text', description: 'Placeholder text' },
    emptyText: { control: 'text', description: 'Empty state text' },
    item1: { control: 'text', description: 'First item text' },
    item2: { control: 'text', description: 'Second item text' },
    item3: { control: 'text', description: 'Third item text' },
    item4: { control: 'text', description: 'Fourth item text' },
    item5: { control: 'text', description: 'Fifth item text' },
    shortcut1: { control: 'text', description: 'First shortcut' },
    shortcut2: { control: 'text', description: 'Second shortcut' },
    shortcut3: { control: 'text', description: 'Third shortcut' },
    shortcut4: { control: 'text', description: 'Fourth shortcut' },
    shortcut5: { control: 'text', description: 'Fifth shortcut' },
  },
  render: (args) => createElement(Command, { className: 'rounded-lg border shadow-md max-w-[450px]' },
    createElement(CommandInput, { placeholder: args.placeholder }),
    createElement(CommandList, null,
      createElement(CommandEmpty, null, args.emptyText),
      createElement(CommandGroup, { heading: 'Actions' },
        createElement(CommandItem, null,
          createElement('span', null, args.item1),
          createElement(CommandShortcut, null, args.shortcut1)
        ),
        createElement(CommandItem, null,
          createElement('span', null, args.item2),
          createElement(CommandShortcut, null, args.shortcut2)
        ),
        createElement(CommandItem, null,
          createElement('span', null, args.item3),
          createElement(CommandShortcut, null, args.shortcut3)
        ),
        createElement(CommandItem, null,
          createElement('span', null, args.item4),
          createElement(CommandShortcut, null, args.shortcut4)
        ),
        createElement(CommandItem, null,
          createElement('span', null, args.item5),
          createElement(CommandShortcut, null, args.shortcut5)
        )
      )
    )
  ),
};

export const SearchExample: Story = {
  args: {
    placeholder: 'Search documentation...',
    emptyText: 'No documentation found.',
  },
  argTypes: {
    placeholder: { control: 'text', description: 'Search placeholder' },
    emptyText: { control: 'text', description: 'Empty results text' },
  },
  render: (args) => createElement(Command, { className: 'rounded-lg border shadow-md max-w-[450px]' },
    createElement(CommandInput, { placeholder: args.placeholder }),
    createElement(CommandList, null,
      createElement(CommandEmpty, null, args.emptyText),
      createElement(CommandGroup, { heading: 'Getting Started' },
        createElement(CommandItem, null,
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
              d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
            })
          ),
          createElement('span', null, 'Installation Guide')
        ),
        createElement(CommandItem, null,
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
              d: 'M13 10V3L4 14h7v7l9-11h-7z'
            })
          ),
          createElement('span', null, 'Quick Start')
        )
      ),
      createElement(CommandGroup, { heading: 'Components' },
        createElement(CommandItem, null,
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
              d: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z'
            })
          ),
          createElement('span', null, 'Button Component')
        ),
        createElement(CommandItem, null,
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
              d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            })
          ),
          createElement('span', null, 'Form Components')
        )
      )
    )
  ),
};