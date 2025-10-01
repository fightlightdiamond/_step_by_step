import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Calendar } from '@/components/ui/calendar';
import { createElement, useState } from 'react';

type CalendarStoryArgs = {
  mode: 'single' | 'multiple' | 'range';
  showOutsideDays: boolean;
  showWeekNumber: boolean;
  disabled: boolean;
  fixedWeeks: boolean;
  numberOfMonths: number;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

const meta: Meta<CalendarStoryArgs> = {
  title: 'Shadcn UI/Calendar',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['single', 'multiple', 'range'],
      description: 'Selection mode',
    },
    showOutsideDays: {
      control: { type: 'boolean' },
      description: 'Show days outside current month',
    },
    showWeekNumber: {
      control: { type: 'boolean' },
      description: 'Show week numbers',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable the calendar',
    },
    fixedWeeks: {
      control: { type: 'boolean' },
      description: 'Always show 6 weeks',
    },
    numberOfMonths: {
      control: { type: 'number', min: 1, max: 3, step: 1 },
      description: 'Number of months to display',
    },
    weekStartsOn: {
      control: { type: 'select' },
      options: [0, 1, 2, 3, 4, 5, 6],
      description: 'First day of week (0=Sunday, 1=Monday)',
    },
  },
  args: {
    mode: 'single',
    showOutsideDays: true,
    showWeekNumber: false,
    disabled: false,
    fixedWeeks: false,
    numberOfMonths: 1,
    weekStartsOn: 1,
  },
};

export default meta;
type Story = StoryObj<CalendarStoryArgs>;

const renderCalendar = (args: CalendarStoryArgs) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dates, setDates] = useState<Date[] | undefined>([]);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to?: Date | undefined }>({
    from: new Date(),
    to: undefined,
  });

  const handleSelect = (selectedDate: Date | Date[] | { from: Date | undefined; to?: Date | undefined } | undefined) => {
    if (args.mode === 'single') {
      setDate(selectedDate as Date | undefined);
    } else if (args.mode === 'multiple') {
      setDates(selectedDate as Date[] | undefined);
    } else if (args.mode === 'range') {
      setDateRange(selectedDate as { from: Date | undefined; to?: Date | undefined });
    }
  };

  const getSelected = (): Date | Date[] | { from: Date | undefined; to?: Date | undefined } | undefined => {
    if (args.mode === 'single') return date;
    if (args.mode === 'multiple') return dates;
    if (args.mode === 'range') return dateRange;
    return undefined;
  };

  return createElement(Calendar, {
    mode: args.mode,
    selected: getSelected(),
    onSelect: handleSelect,
    showOutsideDays: args.showOutsideDays,
    showWeekNumber: args.showWeekNumber,
    disabled: args.disabled,
    fixedWeeks: args.fixedWeeks,
    numberOfMonths: args.numberOfMonths,
    weekStartsOn: args.weekStartsOn,
    className: 'rounded-md border',
  });
};

export const Default: Story = {
  render: renderCalendar,
};

export const SingleSelection: Story = {
  render: renderCalendar,
  args: {
    mode: 'single',
    showOutsideDays: true,
    showWeekNumber: false,
    disabled: false,
    fixedWeeks: false,
    numberOfMonths: 1,
    weekStartsOn: 1,
  },
};

export const MultipleSelection: Story = {
  render: renderCalendar,
  args: {
    mode: 'multiple',
    showOutsideDays: true,
    showWeekNumber: false,
    disabled: false,
    fixedWeeks: false,
    numberOfMonths: 1,
    weekStartsOn: 1,
  },
};

export const RangeSelection: Story = {
  render: renderCalendar,
  args: {
    mode: 'range',
    showOutsideDays: true,
    showWeekNumber: false,
    disabled: false,
    fixedWeeks: false,
    numberOfMonths: 2,
    weekStartsOn: 1,
  },
};

export const WithWeekNumbers: Story = {
  render: renderCalendar,
  args: {
    mode: 'single',
    showOutsideDays: true,
    showWeekNumber: true,
    disabled: false,
    fixedWeeks: false,
    numberOfMonths: 1,
    weekStartsOn: 1,
  },
};

export const FixedWeeks: Story = {
  render: renderCalendar,
  args: {
    mode: 'single',
    showOutsideDays: true,
    showWeekNumber: false,
    disabled: false,
    fixedWeeks: true,
    numberOfMonths: 1,
    weekStartsOn: 1,
  },
};

export const MultipleMonths: Story = {
  render: renderCalendar,
  args: {
    mode: 'single',
    showOutsideDays: true,
    showWeekNumber: false,
    disabled: false,
    fixedWeeks: false,
    numberOfMonths: 2,
    weekStartsOn: 1,
  },
};

export const WeekStartsSunday: Story = {
  render: renderCalendar,
  args: {
    mode: 'single',
    showOutsideDays: true,
    showWeekNumber: false,
    disabled: false,
    fixedWeeks: false,
    numberOfMonths: 1,
    weekStartsOn: 0,
  },
};

export const Disabled: Story = {
  render: renderCalendar,
  args: {
    mode: 'single',
    showOutsideDays: true,
    showWeekNumber: false,
    disabled: true,
    fixedWeeks: false,
    numberOfMonths: 1,
    weekStartsOn: 1,
  },
};

export const HideOutsideDays: Story = {
  render: renderCalendar,
  args: {
    mode: 'single',
    showOutsideDays: false,
    showWeekNumber: false,
    disabled: false,
    fixedWeeks: false,
    numberOfMonths: 1,
    weekStartsOn: 1,
  },
};

export const WithDisabledDates: Story = {
  render: (args: CalendarStoryArgs) => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    const disabledDays = [
      new Date(2024, 11, 25), // Christmas
      new Date(2024, 0, 1),   // New Year
      { before: new Date() }, // Past dates
    ];

    return createElement(Calendar, {
      mode: 'single',
      selected: date,
      onSelect: setDate,
      disabled: disabledDays,
      showOutsideDays: args.showOutsideDays,
      showWeekNumber: args.showWeekNumber,
      fixedWeeks: args.fixedWeeks,
      numberOfMonths: args.numberOfMonths,
      weekStartsOn: args.weekStartsOn,
      className: 'rounded-md border',
    });
  },
  args: {
    mode: 'single',
    showOutsideDays: true,
    showWeekNumber: false,
    disabled: false,
    fixedWeeks: false,
    numberOfMonths: 1,
    weekStartsOn: 1,
  },
};