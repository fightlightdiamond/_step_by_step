import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CardStat from "./CardStat";

const meta: Meta<typeof CardStat> = {
  title: "Game Components/CardStat",
  component: CardStat,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label for the stat",
    },
    value: {
      control: "text",
      description: "Value of the stat",
    },
    icon: {
      control: "text",
      description: "Icon for the stat",
    },
    color: {
      control: "text",
      description: "Color class for the stat",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Attack: Story = {
  args: {
    label: "Attack",
    value: 150,
    icon: "⚔️",
    color: "text-red-600",
  },
};

export const Defense: Story = {
  args: {
    label: "Defense",
    value: 120,
    icon: "🛡️",
    color: "text-blue-600",
  },
};

export const Health: Story = {
  args: {
    label: "Health",
    value: "850/1000",
    icon: "❤️",
    color: "text-green-600",
  },
};

export const Mana: Story = {
  args: {
    label: "Mana",
    value: "200/300",
    icon: "💙",
    color: "text-blue-500",
  },
};

export const StatGroup: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
      <CardStat label="Attack" value={150} icon="⚔️" color="text-red-600" />
      <CardStat label="Defense" value={120} icon="🛡️" color="text-blue-600" />
      <CardStat
        label="Health"
        value="850/1000"
        icon="❤️"
        color="text-green-600"
      />
      <CardStat label="Mana" value="200/300" icon="💙" color="text-blue-500" />
    </div>
  ),
};
