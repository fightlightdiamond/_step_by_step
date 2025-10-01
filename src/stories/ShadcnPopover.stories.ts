import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createElement } from 'react';

const meta: Meta<typeof Popover> = {
  title: 'Shadcn UI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => createElement(Popover, null,
    createElement(PopoverTrigger, { asChild: true },
      createElement(Button, { variant: 'outline' }, 'Open popover')
    ),
    createElement(PopoverContent, { className: "w-80" },
      createElement('div', { className: "grid gap-4" },
        createElement('div', { className: "space-y-2" },
          createElement('h4', { className: "leading-none font-medium" }, 'Dimensions'),
          createElement('p', { className: "text-muted-foreground text-sm" }, 'Set the dimensions for the layer.')
        ),
        createElement('div', { className: "grid gap-2" },
          createElement('div', { className: "grid grid-cols-3 items-center gap-4" },
            createElement(Label, { htmlFor: "width" }, "Width"),
            createElement(Input, {
              id: "width",
              defaultValue: "100%",
              className: "col-span-2 h-8"
            })
          ),
          createElement('div', { className: "grid grid-cols-3 items-center gap-4" },
            createElement(Label, { htmlFor: "maxWidth" }, "Max. width"),
            createElement(Input, {
              id: "maxWidth",
              defaultValue: "300px",
              className: "col-span-2 h-8"
            })
          ),
          createElement('div', { className: "grid grid-cols-3 items-center gap-4" },
            createElement(Label, { htmlFor: "height" }, "Height"),
            createElement(Input, {
              id: "height",
              defaultValue: "25px",
              className: "col-span-2 h-8"
            })
          ),
          createElement('div', { className: "grid grid-cols-3 items-center gap-4" },
            createElement(Label, { htmlFor: "maxHeight" }, "Max. height"),
            createElement(Input, {
              id: "maxHeight",
              defaultValue: "none",
              className: "col-span-2 h-8"
            })
          )
        )
      )
    )
  ),
};

export const Simple: Story = {
  render: () => createElement(Popover, null,
    createElement(PopoverTrigger, { asChild: true },
      createElement(Button, null, 'Click me')
    ),
    createElement(PopoverContent, null,
      createElement('p', { className: "p-4" }, 'This is a simple popover content.')
    )
  ),
};
