import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Skill from "./Skill";

const meta: Meta<typeof Skill> = {
  title: "Game Components/Skill",
  component: Skill,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Skill component tối ưu với Tailwind CSS + CSS Module. Tailwind cho layout, colors, typography cơ bản. CSS Module cho rarity glows, unlock effects, progress animations phức tạp.",
      },
    },
  },
  argTypes: {
    name: {
      control: "text",
      description: "Skill name",
    },
    img: {
      control: "text",
      description: "Skill icon URL",
    },
    desc: {
      control: "text",
      description: "Skill description",
    },
    level: {
      control: { type: "number", min: 1, max: 10 },
      description: "Current skill level",
    },
    maxLevel: {
      control: { type: "number", min: 1, max: 10 },
      description: "Maximum skill level",
    },
    rarity: {
      control: "select",
      options: ["common", "rare", "epic", "legendary"],
      description: "Skill rarity",
    },
    unlocked: {
      control: "boolean",
      description: "Whether skill is unlocked",
    },
    animated: {
      control: "boolean",
      description: "Enable animations",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const CommonSkill: Story = {
  args: {
    name: "Fire Bolt",
    img: "https://via.placeholder.com/64x64/ef4444/ffffff?text=🔥",
    desc: "A basic fire spell that deals moderate damage",
    level: 3,
    maxLevel: 5,
    rarity: "common",
    unlocked: true,
    animated: true,
  },
};

export const RareSkill: Story = {
  args: {
    name: "Ice Storm",
    img: "https://via.placeholder.com/64x64/3b82f6/ffffff?text=❄️",
    desc: "Summons a powerful ice storm that freezes enemies",
    level: 2,
    maxLevel: 5,
    rarity: "rare",
    unlocked: true,
    animated: true,
  },
};

export const EpicSkill: Story = {
  args: {
    name: "Lightning Strike",
    img: "https://via.placeholder.com/64x64/8b5cf6/ffffff?text=⚡",
    desc: "Calls down lightning to devastate foes",
    level: 4,
    maxLevel: 5,
    rarity: "epic",
    unlocked: true,
    animated: true,
  },
};

export const LegendarySkill: Story = {
  args: {
    name: "Dragon Breath",
    img: "https://via.placeholder.com/64x64/f59e0b/ffffff?text=🐉",
    desc: "Ultimate dragon magic that burns everything",
    level: 5,
    maxLevel: 5,
    rarity: "legendary",
    unlocked: true,
    animated: true,
  },
};

export const LockedSkill: Story = {
  args: {
    name: "Meteor",
    img: "https://via.placeholder.com/64x64/6b7280/ffffff?text=☄️",
    desc: "Requires level 50 to unlock this devastating spell",
    level: 1,
    maxLevel: 5,
    rarity: "legendary",
    unlocked: false,
    animated: true,
  },
};

export const MaxLevelSkill: Story = {
  args: {
    name: "Heal",
    img: "https://via.placeholder.com/64x64/22c55e/ffffff?text=💚",
    desc: "Restores health to allies",
    level: 5,
    maxLevel: 5,
    rarity: "common",
    unlocked: true,
    animated: true,
  },
};

export const AllRarities: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Skill
        name="Fire Bolt"
        img="https://via.placeholder.com/64x64/6b7280/ffffff?text=🔥"
        desc="Basic fire spell"
        level={2}
        maxLevel={5}
        rarity="common"
        unlocked
        animated
      />
      <Skill
        name="Ice Storm"
        img="https://via.placeholder.com/64x64/3b82f6/ffffff?text=❄️"
        desc="Powerful ice magic"
        level={3}
        maxLevel={5}
        rarity="rare"
        unlocked
        animated
      />
      <Skill
        name="Lightning"
        img="https://via.placeholder.com/64x64/8b5cf6/ffffff?text=⚡"
        desc="Epic lightning spell"
        level={4}
        maxLevel={5}
        rarity="epic"
        unlocked
        animated
      />
      <Skill
        name="Dragon Breath"
        img="https://via.placeholder.com/64x64/f59e0b/ffffff?text=🐉"
        desc="Ultimate dragon magic"
        level={5}
        maxLevel={5}
        rarity="legendary"
        unlocked
        animated
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Showcase tất cả các rarity với effects và animations khác nhau.",
      },
    },
  },
};
