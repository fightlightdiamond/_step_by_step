import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CardTypeBadge from "./CardTypeBadge";

const meta: Meta<typeof CardTypeBadge> = {
  title: "Game Components/CardTypeBadge",
  component: CardTypeBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "text",
      description: "Type of the card",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: "Warrior",
  },
};

export const Mage: Story = {
  args: {
    type: "Mage",
  },
};

export const Archer: Story = {
  args: {
    type: "Archer",
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex gap-2">
      <CardTypeBadge type="Warrior" />
      <CardTypeBadge type="Mage" />
      <CardTypeBadge type="Archer" />
      <CardTypeBadge type="Assassin" />
    </div>
  ),
};
