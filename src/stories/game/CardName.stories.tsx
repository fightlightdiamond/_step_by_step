import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CardName from "./CardName";

const meta: Meta<typeof CardName> = {
  title: "Game Components/CardName",
  component: CardName,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: "text",
      description: "Main name of the card",
    },
    subtitle: {
      control: "text",
      description: "Subtitle or description",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleCard: Story = {
  args: {
    name: "Fire Dragon",
  },
};

export const WithSubtitle: Story = {
  args: {
    name: "Lightning Mage",
    subtitle: "Master of Thunder",
  },
};

export const LongName: Story = {
  args: {
    name: "Ancient Guardian of the Sacred Forest",
    subtitle: "Legendary Protector",
  },
};

export const MultipleCards: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardName name="Fire Dragon" />
      </div>
      <div className="p-4 border rounded-lg">
        <CardName name="Lightning Mage" subtitle="Master of Thunder" />
      </div>
      <div className="p-4 border rounded-lg">
        <CardName name="Healing Priest" subtitle="Divine Servant" />
      </div>
    </div>
  ),
};
