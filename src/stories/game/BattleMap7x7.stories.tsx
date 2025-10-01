import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import BattleMap7x7 from "./BattleMap7x7";

const meta: Meta<typeof BattleMap7x7> = {
  title: "Game Components/BattleMap7x7",
  component: BattleMap7x7,
  parameters: {
    layout: "centered",
    controls: { expanded: true },
    docs: {
      description: {
        component:
          "7x7 Grid Battle Map với customizable borders, backgrounds, và monster spawning system.",
      },
    },
  },
  argTypes: {
    heroCell: {
      control: "object",
      description: "Hero position {row, col}",
    },
    monsters: {
      control: "object",
      description: "Array of monsters with positions",
    },
    highlightRange: {
      control: "object",
      description: "Array of cells to highlight for attack/move range",
    },
    showRandomizeButton: {
      control: "boolean",
      description: "Show randomize monsters button",
    },
    showBorder: {
      control: "boolean",
      description: "Show/hide cell borders",
    },
    showCellNumber: {
      control: "boolean",
      description: "Show/hide cell coordinates (row,col)",
    },
    showCardBorder: {
      control: "boolean",
      description: "Show/hide shadcn/ui Card borders",
    },
    showCardBackground: {
      control: "boolean",
      description: "Show/hide Card background colors",
    },
    backgroundTheme: {
      control: "select",
      options: [
        "default",
        "grass",
        "snow",
        "desert",
        "water",
        "lava",
        "forest",
        "mountain",
        "swamp",
        "crystal",
        "void",
        "heaven",
      ],
      description: "Background theme for the map",
    },
    onCellClick: {
      action: "cellClicked",
      description: "Callback when cell is clicked",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showRandomizeButton: true,
  },
};

export const CenterHero: Story = {
  args: {
    heroCell: { row: 3, col: 3 },
    showRandomizeButton: true,
  },
};

export const WithHighlightRange: Story = {
  args: {
    heroCell: { row: 3, col: 3 },
    highlightRange: [
      { row: 2, col: 2 },
      { row: 2, col: 3 },
      { row: 2, col: 4 },
      { row: 3, col: 2 },
      { row: 3, col: 4 },
      { row: 4, col: 2 },
      { row: 4, col: 3 },
      { row: 4, col: 4 },
    ],
    showRandomizeButton: true,
  },
};

export const CustomMonsters: Story = {
  args: {
    heroCell: { row: 1, col: 1 },
    monsters: [
      { id: "1", position: { row: 3, col: 3 }, type: "dragon", level: 50 },
      { id: "2", position: { row: 5, col: 5 }, type: "orc", level: 25 },
      { id: "3", position: { row: 0, col: 6 }, type: "goblin", level: 15 },
      { id: "4", position: { row: 6, col: 0 }, type: "skeleton", level: 20 },
    ],
    showRandomizeButton: false,
  },
};

export const Interactive: Story = {
  args: {
    heroCell: { row: 3, col: 3 },
    showRandomizeButton: true,
    onCellClick: (position) => {
      alert(`Clicked cell at [${position.row}, ${position.col}]`);
    },
  },
};

export const NoBorders: Story = {
  args: {
    heroCell: { row: 3, col: 3 },
    showBorder: false,
    showCardBorder: false,
    showRandomizeButton: true,
  },
};

export const NoNumbers: Story = {
  args: {
    heroCell: { row: 3, col: 3 },
    showCellNumber: false,
    showRandomizeButton: true,
  },
};

export const GrassTheme: Story = {
  args: {
    heroCell: { row: 3, col: 3 },
    backgroundTheme: "grass",
    showRandomizeButton: true,
  },
};

export const DesertTheme: Story = {
  args: {
    heroCell: { row: 3, col: 3 },
    backgroundTheme: "desert",
    showRandomizeButton: true,
  },
};

export const LavaTheme: Story = {
  args: {
    heroCell: { row: 3, col: 3 },
    backgroundTheme: "lava",
    showRandomizeButton: true,
  },
};

export const VoidTheme: Story = {
  args: {
    heroCell: { row: 3, col: 3 },
    backgroundTheme: "void",
    showRandomizeButton: true,
  },
};

export const MinimalClean: Story = {
  args: {
    heroCell: { row: 3, col: 3 },
    showBorder: false,
    showCellNumber: false,
    showCardBorder: false,
    backgroundTheme: "crystal",
    showRandomizeButton: false,
  },
};

export const AllMonsterTypes: Story = {
  args: {
    heroCell: { row: 6, col: 3 },
    monsters: [
      { id: "1", position: { row: 0, col: 0 }, type: "goblin", level: 15 },
      { id: "2", position: { row: 0, col: 2 }, type: "orc", level: 25 },
      { id: "3", position: { row: 0, col: 4 }, type: "skeleton", level: 20 },
      { id: "4", position: { row: 0, col: 6 }, type: "dragon", level: 50 },
    ],
    showRandomizeButton: false,
  },
};
