import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import * as React from "react"
import { Label } from "@/components/ui/label"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"

const meta: Meta<typeof RadioGroup> = {
  title: 'Shadcn UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: { type: 'text' },
      description: 'Default selected value'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable all radio items'
    },
    orientation: {
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
      description: 'Layout orientation'
    },
    showLabels: {
      control: { type: 'boolean' },
      description: 'Show/hide labels'
    },
    options: {
      control: { type: 'text' },
      description: 'Radio options (comma separated, e.g: "default,comfortable,compact,extra,premium")'
    },
    spacing: {
      control: { type: 'select' },
      options: ['gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6'],
      description: 'Gap between items'
    },
  },
  args: {
    defaultValue: 'comfortable',
    disabled: false,
    orientation: 'vertical',
    showLabels: true,
    options: 'default,comfortable,compact',
    spacing: 'gap-3',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const containerClass = args.orientation === 'horizontal' 
      ? `flex flex-row ${args.spacing}` 
      : `flex flex-col ${args.spacing}`;

    const optionsList = args.options 
      ? args.options.split(',').map(option => option.trim()).filter(option => option.length > 0)
      : ['default', 'comfortable', 'compact'];

    return (
      <RadioGroup defaultValue={args.defaultValue} disabled={args.disabled} className={containerClass}>
        {optionsList.map((option, index) => (
          <div key={option} className="flex items-center gap-3">
            <RadioGroupItem value={option.toLowerCase()} id={`r${index + 1}`} />
            {args.showLabels && <Label htmlFor={`r${index + 1}`}>{option}</Label>}
          </div>
        ))}
      </RadioGroup>
    )
  },
};

export const Form: Story = {
  args: {
    formTitle: 'Notify me about...',
    formOptions: 'All new messages,Direct messages and mentions,Nothing',
    buttonText: 'Submit',
    buttonColor: 'bg-black text-white',
    optionsSeparator: ',',
  },
  argTypes: {
    formTitle: {
      control: { type: 'text' },
      description: 'Form title/label'
    },
    formOptions: {
      control: { type: 'text' },
      description: 'Form options (comma separated, e.g: "Option 1,Option 2,Option 3,Option 4")'
    },
    optionsSeparator: {
      control: { type: 'text' },
      description: 'Separator for options (default: comma)'
    },
    buttonText: {
      control: { type: 'text' },
      description: 'Submit button text'
    },
    buttonColor: {
      control: { type: 'text' },
      description: 'Button CSS classes'
    },
  },
  render: (args) => {
    const [selectedValue, setSelectedValue] = React.useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert(`You selected: ${selectedValue}`);
    };

    const optionsList = args.formOptions 
      ? args.formOptions.split(args.optionsSeparator).map(option => option.trim()).filter(option => option.length > 0)
      : ['All new messages', 'Direct messages and mentions', 'Nothing'];

    return (
      <form onSubmit={handleSubmit} className="w-2/3 space-y-6">
        <div className="space-y-3">
          <Label className="text-sm font-medium">{args.formTitle}</Label>
          <RadioGroup
            value={selectedValue}
            onValueChange={setSelectedValue}
            className="flex flex-col"
          >
            {optionsList.map((option, index) => (
              <div key={option} className="flex items-center gap-3">
                <RadioGroupItem value={option.toLowerCase().replace(/\s+/g, '-')} id={`form-${index}`} />
                <Label htmlFor={`form-${index}`} className="font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <Button className={args.buttonColor} type="submit">{args.buttonText}</Button>
      </form>
    )
  },
};





