import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CardLevel from "./CardLevel";

const meta: Meta<typeof CardLevel> = {
  title: "Game Components/CardLevel",
  component: CardLevel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    level: {
      control: { type: "number", min: 1, max: 100 },
      description: "Current level",
    },
    maxLevel: {
      control: { type: "number", min: 1, max: 100 },
      description: "Maximum level",
    },
  },
  decorators: [
    (Story) => (
      <div className="relative w-48 h-32 bg-gray-200 rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const LowLevel: Story = {
  args: {
    level: 5,
    maxLevel: 100,
  },
};

export const MidLevel: Story = {
  args: {
    level: 45,
    maxLevel: 100,
  },
};

export const HighLevel: Story = {
  args: {
    level: 85,
    maxLevel: 100,
  },
};

export const MaxLevel: Story = {
  args: {
    level: 100,
    maxLevel: 100,
  },
};

export const DifferentLevels: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="relative w-32 h-24 bg-gray-200 rounded-lg">
        <CardLevel level={5} maxLevel={100} />
      </div>
      <div className="relative w-32 h-24 bg-gray-200 rounded-lg">
        <CardLevel level={45} maxLevel={100} />
      </div>
      <div className="relative w-32 h-24 bg-gray-200 rounded-lg">
        <CardLevel level={85} maxLevel={100} />
      </div>
      <div className="relative w-32 h-24 bg-gray-200 rounded-lg">
        <CardLevel level={100} maxLevel={100} />
      </div>
    </div>
  ),
};
