import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CardEffectIcon from "./CardEffectIcon";

const meta: Meta<typeof CardEffectIcon> = {
  title: "Game Components/CardEffectIcon",
  component: CardEffectIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    effect: {
      control: "text",
      description: "Name of the effect",
    },
    icon: {
      control: "text",
      description: "Icon/emoji to display",
    },
    active: {
      control: "boolean",
      description: "Whether the effect is active",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    effect: "Shield",
    icon: "🛡️",
    active: false,
  },
};

export const Active: Story = {
  args: {
    effect: "Fire",
    icon: "🔥",
    active: true,
  },
};

export const AllEffects: Story = {
  render: () => (
    <div className="flex gap-2">
      <CardEffectIcon effect="Shield" icon="🛡️" active={false} />
      <CardEffectIcon effect="Fire" icon="🔥" active={true} />
      <CardEffectIcon effect="Ice" icon="❄️" active={false} />
      <CardEffectIcon effect="Lightning" icon="⚡" active={true} />
      <CardEffectIcon effect="Poison" icon="☠️" active={false} />
    </div>
  ),
};
