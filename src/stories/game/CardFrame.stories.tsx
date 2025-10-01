import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CardFrame from "./CardFrame";

const meta: Meta<typeof CardFrame> = {
  title: "Game Components/CardFrame",
  component: CardFrame,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Card frame component tối ưu với Tailwind CSS + CSS Module. Tailwind cho layout, colors, gradients cơ bản. CSS Module cho glow effects, animations, sparkle effects phức tạp.",
      },
    },
  },
  argTypes: {
    rarity: {
      control: "select",
      options: ["common", "rare", "epic", "legendary"],
      description: "Độ hiếm của card, ảnh hưởng đến màu sắc và effects",
    },
    glowing: {
      control: "boolean",
      description: "Bật/tắt glow effect xung quanh frame",
    },
    animated: {
      control: "boolean",
      description: "Bật/tắt animations (float, sparkle)",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Common: Story = {
  args: {
    rarity: "common",
    children: (
      <div className="p-6 text-center">
        <h3 className="text-lg font-bold mb-2">Common Card</h3>
        <p className="text-sm text-gray-600">Basic card content</p>
      </div>
    ),
  },
};

export const Rare: Story = {
  args: {
    rarity: "rare",
    glowing: true,
    children: (
      <div className="p-6 text-center">
        <h3 className="text-lg font-bold mb-2 text-blue-700">Rare Card</h3>
        <p className="text-sm text-gray-600">Enhanced with blue glow</p>
      </div>
    ),
  },
};

export const Epic: Story = {
  args: {
    rarity: "epic",
    glowing: true,
    animated: true,
    children: (
      <div className="p-6 text-center">
        <h3 className="text-lg font-bold mb-2 text-purple-700">Epic Card</h3>
        <p className="text-sm text-gray-600">
          Purple glow with floating animation
        </p>
      </div>
    ),
  },
};

export const Legendary: Story = {
  args: {
    rarity: "legendary",
    glowing: true,
    animated: true,
    children: (
      <div className="p-6 text-center">
        <h3 className="text-lg font-bold mb-2 text-yellow-700">
          Legendary Card
        </h3>
        <p className="text-sm text-gray-600">
          Golden glow with sparkle effects
        </p>
      </div>
    ),
  },
};

export const AllRarities: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <CardFrame rarity="common">
        <div className="p-4 text-center">
          <h4 className="font-bold">Common</h4>
        </div>
      </CardFrame>
      <CardFrame rarity="rare" glowing>
        <div className="p-4 text-center">
          <h4 className="font-bold text-blue-700">Rare</h4>
        </div>
      </CardFrame>
      <CardFrame rarity="epic" glowing animated>
        <div className="p-4 text-center">
          <h4 className="font-bold text-purple-700">Epic</h4>
        </div>
      </CardFrame>
      <CardFrame rarity="legendary" glowing animated>
        <div className="p-4 text-center">
          <h4 className="font-bold text-yellow-700">Legendary</h4>
        </div>
      </CardFrame>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Showcase tất cả các rarity với effects tương ứng. Legendary có sparkle animation đặc biệt.",
      },
    },
  },
};
