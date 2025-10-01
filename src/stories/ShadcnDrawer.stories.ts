import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Minus, Plus } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer } from "recharts";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { createElement, useState } from 'react';

const meta: Meta<typeof Drawer> = {
  title: 'Shadcn UI/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: { type: 'boolean' },
      description: 'Controls the open state of the drawer',
    },
  },
  args: {
    onOpenChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [goal, setGoal] = useState(350);
    
    const data = [
      { goal: 400 },
      { goal: 300 },
      { goal: 200 },
      { goal: 300 },
      { goal: 200 },
      { goal: 278 },
      { goal: 189 },
      { goal: 239 },
      { goal: 300 },
      { goal: 200 },
      { goal: 278 },
      { goal: 189 },
      { goal: 349 },
    ];

    function onClick(adjustment: number) {
      setGoal(Math.max(200, Math.min(400, goal + adjustment)));
    }

    return createElement(Drawer, null,
      createElement(DrawerTrigger, { asChild: true },
        createElement(Button, { variant: 'outline' }, 'Open Drawer')
      ),
      createElement(DrawerContent, null,
        createElement('div', { className: 'mx-auto w-full max-w-sm' },
          createElement(DrawerHeader, null,
            createElement(DrawerTitle, null, 'Move Goal'),
            createElement(DrawerDescription, null, 'Set your daily activity goal.')
          ),
          createElement('div', { className: 'p-4 pb-0' },
            createElement('div', { className: 'flex items-center justify-center space-x-2' },
              createElement(Button, {
                variant: 'outline',
                size: 'icon',
                className: 'h-8 w-8 shrink-0 rounded-full',
                onClick: () => onClick(-10),
                disabled: goal <= 200
              },
                createElement(Minus),
                createElement('span', { className: 'sr-only' }, 'Decrease')
              ),
              createElement('div', { className: 'flex-1 text-center' },
                createElement('div', { className: 'text-7xl font-bold tracking-tighter' }, goal),
                createElement('div', { className: 'text-muted-foreground text-[0.70rem] uppercase' }, 'Calories/day')
              ),
              createElement(Button, {
                variant: 'outline',
                size: 'icon',
                className: 'h-8 w-8 shrink-0 rounded-full',
                onClick: () => onClick(10),
                disabled: goal >= 400
              },
                createElement(Plus),
                createElement('span', { className: 'sr-only' }, 'Increase')
              )
            ),
            createElement('div', { className: 'mt-3 h-[120px]' },
              createElement(ResponsiveContainer, { width: '100%', height: '100%' },
                createElement(BarChart, { data },
                  createElement(Bar, {
                    dataKey: 'goal',
                    style: {
                      fill: 'hsl(var(--foreground))',
                      opacity: 0.9,
                    }
                  })
                )
              )
            )
          ),
          createElement(DrawerFooter, null,
            createElement(Button, { className: 'bg-black border text-white' }, 'Submit'),
            createElement(DrawerClose, { asChild: true },
              createElement(Button, { variant: 'outline' }, 'Cancel')
            )
          )
        )
      )
    );
  },
};

export const Simple: Story = {
  render: () => createElement(Drawer, null,
    createElement(DrawerTrigger, { asChild: true },
      createElement(Button, { variant: 'outline' }, 'Open Simple Drawer')
    ),
    createElement(DrawerContent, null,
      createElement(DrawerHeader, null,
        createElement(DrawerTitle, null, 'Are you absolutely sure?'),
        createElement(DrawerDescription, null, 'This action cannot be undone.')
      ),
      createElement(DrawerFooter, null,
        createElement(Button, { className: 'bg-black border text-white' }, 'Submit'),
        createElement(DrawerClose, { asChild: true },
          createElement(Button, { variant: 'outline' }, 'Cancel')
        )
      )
    )
  ),
};

export const WithForm: Story = {
  render: () => createElement(Drawer, null,
    createElement(DrawerTrigger, { asChild: true },
      createElement(Button, null, 'Edit Profile')
    ),
    createElement(DrawerContent, null,
      createElement('div', { className: 'mx-auto w-full max-w-sm' },
        createElement(DrawerHeader, null,
          createElement(DrawerTitle, null, 'Edit profile'),
          createElement(DrawerDescription, null, 'Make changes to your profile here.')
        ),
        createElement('div', { className: 'p-4 pb-0' },
          createElement('div', { className: 'space-y-4' },
            createElement('div', { className: 'space-y-2' },
              createElement('label', { className: 'text-sm font-medium' }, 'Name'),
              createElement('input', { 
                className: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                defaultValue: 'Pedro Duarte' 
              })
            ),
            createElement('div', { className: 'space-y-2' },
              createElement('label', { className: 'text-sm font-medium' }, 'Username'),
              createElement('input', { 
                className: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                defaultValue: '@peduarte' 
              })
            )
          )
        ),
        createElement(DrawerFooter, null,
          createElement(Button, null, 'Save changes'),
          createElement(DrawerClose, { asChild: true },
            createElement(Button, { variant: 'outline' }, 'Cancel')
          )
        )
      )
    )
  ),
};