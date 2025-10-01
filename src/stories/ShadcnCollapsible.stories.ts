import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { createElement, useState } from 'react';

const meta: Meta<typeof Collapsible> = {
  title: 'Shadcn UI/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
  args: {
    onOpenChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: false,
    question: 'Can I use this in my project?',
    answer: 'Yes. Free to use for personal and commercial projects. No attribution required.',
  },
  argTypes: {
    question: { control: 'text', description: 'Câu hỏi hiển thị' },
    answer: { control: 'text', description: 'Câu trả lời hiển thị' },
  },
  render: (args) => createElement(Collapsible, { ...args, className: 'w-[350px] space-y-2' },
    createElement(CollapsibleTrigger, { asChild: true },
      createElement(Button, { variant: 'ghost', className: 'flex w-full justify-between p-0' },
        args.question,
        createElement('svg', {
          className: 'h-4 w-4',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M19 9l-7 7-7-7'
          })
        )
      )
    ),
    createElement(CollapsibleContent, { className: 'space-y-2' },
      createElement('div', { className: 'rounded-md border px-4 py-3 font-mono text-sm' },
        args.answer
      )
    )
  ),
};

export const Open: Story = {
  args: {
    open: true,
    question: 'Is it accessible?',
    answer: 'Yes. It adheres to the WAI-ARIA design pattern.',
  },
  argTypes: {
    question: { control: 'text', description: 'Câu hỏi hiển thị' },
    answer: { control: 'text', description: 'Câu trả lời hiển thị' },
  },
  render: (args) => createElement(Collapsible, { ...args, className: 'w-[350px] space-y-2' },
    createElement(CollapsibleTrigger, { asChild: true },
      createElement(Button, { variant: 'ghost', className: 'flex w-full justify-between p-0' },
        args.question,
        createElement('svg', {
          className: 'h-4 w-4',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M5 15l7-7 7 7'
          })
        )
      )
    ),
    createElement(CollapsibleContent, { className: 'space-y-2' },
      createElement('div', { className: 'rounded-md border px-4 py-3 font-mono text-sm' },
        args.answer
      )
    )
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    open: false,
    question: 'Disabled collapsible',
    answer: 'This content is not accessible.',
  },
  argTypes: {
    question: { control: 'text', description: 'Câu hỏi hiển thị' },
    answer: { control: 'text', description: 'Câu trả lời hiển thị' },
  },
  render: (args) => createElement(Collapsible, { ...args, className: 'w-[350px] space-y-2' },
    createElement(CollapsibleTrigger, { asChild: true },
      createElement(Button, { variant: 'ghost', className: 'flex w-full justify-between p-0', disabled: true },
        args.question,
        createElement('svg', {
          className: 'h-4 w-4',
          fill: 'none',
          stroke: 'currentColor',
          viewBox: '0 0 24 24'
        },
          createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M19 9l-7 7-7-7'
          })
        )
      )
    ),
    createElement(CollapsibleContent, { className: 'space-y-2' },
      createElement('div', { className: 'rounded-md border px-4 py-3 font-mono text-sm' },
        args.answer
      )
    )
  ),
};

export const FAQ: Story = {
  args: {
    title: 'Frequently Asked Questions',
    question1: 'What is Shadcn UI?',
    answer1_1: 'Shadcn UI is a collection of reusable components built using Radix UI and Tailwind CSS.',
    answer1_2: 'It provides copy-paste components that you can customize and use in your projects.',
    answer1_3: 'All components are fully accessible and follow modern design patterns.',
    answer1_4: '',
    answer1_5: '',
    question2: 'How do I install it?',
    answer2_1: 'Run "npx shadcn@latest init" to get started with the setup wizard.',
    answer2_2: 'Then add components individually with "npx shadcn@latest add [component]".',
    answer2_3: '',
    answer2_4: '',
    question3: 'Is it free to use?',
    answer3_1: 'Yes! Shadcn UI is completely free and open source.',
    answer3_2: 'You can use it for personal and commercial projects without any restrictions.',
    answer3_3: '',
    answer3_4: '',
    question4: '',
    answer4_1: '',
    answer4_2: '',
    question5: '',
    answer5_1: '',
    answer5_2: '',
  },
  argTypes: {
    title: { control: 'text', description: 'Tiêu đề chính của FAQ' },
    question1: { control: 'text', description: 'Câu hỏi 1' },
    answer1_1: { control: 'text', description: 'Câu trả lời 1.1' },
    answer1_2: { control: 'text', description: 'Câu trả lời 1.2' },
    answer1_3: { control: 'text', description: 'Câu trả lời 1.3' },
    answer1_4: { control: 'text', description: 'Câu trả lời 1.4 (để trống nếu không dùng)' },
    answer1_5: { control: 'text', description: 'Câu trả lời 1.5 (để trống nếu không dùng)' },
    question2: { control: 'text', description: 'Câu hỏi 2' },
    answer2_1: { control: 'text', description: 'Câu trả lời 2.1' },
    answer2_2: { control: 'text', description: 'Câu trả lời 2.2' },
    answer2_3: { control: 'text', description: 'Câu trả lời 2.3 (để trống nếu không dùng)' },
    answer2_4: { control: 'text', description: 'Câu trả lời 2.4 (để trống nếu không dùng)' },
    question3: { control: 'text', description: 'Câu hỏi 3' },
    answer3_1: { control: 'text', description: 'Câu trả lời 3.1' },
    answer3_2: { control: 'text', description: 'Câu trả lời 3.2' },
    answer3_3: { control: 'text', description: 'Câu trả lời 3.3 (để trống nếu không dùng)' },
    answer3_4: { control: 'text', description: 'Câu trả lời 3.4 (để trống nếu không dùng)' },
    question4: { control: 'text', description: 'Câu hỏi 4 (để trống nếu không dùng)' },
    answer4_1: { control: 'text', description: 'Câu trả lời 4.1' },
    answer4_2: { control: 'text', description: 'Câu trả lời 4.2' },
    question5: { control: 'text', description: 'Câu hỏi 5 (để trống nếu không dùng)' },
    answer5_1: { control: 'text', description: 'Câu trả lời 5.1' },
    answer5_2: { control: 'text', description: 'Câu trả lời 5.2' },
  },
  render: (args) => {
    const renderAnswers = (answers) => {
      return answers
        .filter(answer => answer && answer.trim() !== '')
        .map((answer, index) => 
          createElement('div', { 
            key: index,
            className: 'rounded-md border px-4 py-3 text-sm' 
          }, answer)
        );
    };

    const renderQuestion = (question, answers) => {
      if (!question || question.trim() === '') return null;
      
      return createElement(Collapsible, { className: 'space-y-2' },
        createElement(CollapsibleTrigger, { asChild: true },
          createElement(Button, { variant: 'ghost', className: 'flex w-full justify-between p-0 text-left' },
            question,
            createElement('span', { className: 'text-lg' }, '+')
          )
        ),
        createElement(CollapsibleContent, { className: 'space-y-2' },
          ...renderAnswers(answers)
        )
      );
    };

    return createElement('div', { className: 'w-[450px] space-y-4' },
      createElement('h3', { className: 'text-lg font-semibold' }, args.title),
      
      renderQuestion(args.question1, [args.answer1_1, args.answer1_2, args.answer1_3, args.answer1_4, args.answer1_5]),
      renderQuestion(args.question2, [args.answer2_1, args.answer2_2, args.answer2_3, args.answer2_4]),
      renderQuestion(args.question3, [args.answer3_1, args.answer3_2, args.answer3_3, args.answer3_4]),
      renderQuestion(args.question4, [args.answer4_1, args.answer4_2]),
      renderQuestion(args.question5, [args.answer5_1, args.answer5_2])
    );
  },
};

export const Interactive: Story = {
  args: {
    toggleText: 'Toggle Content',
    content: 'This content can be toggled open and closed. The state is controlled by React.',
  },
  argTypes: {
    toggleText: { control: 'text', description: 'Text hiển thị trên button' },
    content: { control: 'text', description: 'Nội dung bên trong collapsible' },
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return createElement('div', { className: 'w-[350px] space-y-4' },
      createElement('p', { className: 'text-sm text-muted-foreground' },
        `Status: ${isOpen ? 'Open' : 'Closed'}`
      ),
      
      createElement(Collapsible, { 
        open: isOpen, 
        onOpenChange: setIsOpen,
        className: 'space-y-2'
      },
        createElement(CollapsibleTrigger, { asChild: true },
          createElement(Button, { variant: 'outline', className: 'flex w-full justify-between' },
            args.toggleText,
            createElement('svg', {
              className: `h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`,
              fill: 'none',
              stroke: 'currentColor',
              viewBox: '0 0 24 24'
            },
              createElement('path', {
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                strokeWidth: 2,
                d: 'M19 9l-7 7-7-7'
              })
            )
          )
        ),
        createElement(CollapsibleContent, { className: 'space-y-2' },
          createElement('div', { className: 'rounded-md border px-4 py-3 text-sm' },
            args.content
          )
        )
      )
    );
  },
};

