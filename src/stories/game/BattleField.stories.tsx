import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import BattleField from "./BattleField";

const sampleHero = {
  id: "1",
  name: "Fire Knight",
  level: 25,
  rarity: "epic" as const,
};

const legendaryHero = {
  id: "2",
  name: "Dragon Lord",
  level: 50,
  rarity: "legendary" as const,
};

const rareHero = {
  id: "3",
  name: "Ice Mage",
  level: 30,
  rarity: "rare" as const,
};

const meta: Meta<typeof BattleField> = {
  title: "Game Components/BattleField",
  component: BattleField,
  parameters: {
    layout: "centered",
    controls: { expanded: true },
    docs: {
      description: {
        component:
          "Battle field component tối ưu với Tailwind CSS + CSS Module. 8 ô battle với hero positioning, selection effects, và rarity-based glows.",
      },
    },
  },
  argTypes: {
    heroPosition: {
      control: { type: "number", min: 0, max: 7 },
      description: "Vị trí hero hiện tại (0-7)",
    },
    selectedCell: {
      control: { type: "number", min: 0, max: 7 },
      description: "Ô đang được chọn (0-7)",
    },
    animated: {
      control: "boolean",
      description: "Bật/tắt animations và effects",
    },
    showBorder: {
      control: "boolean",
      description: "Ẩn/hiện border của các ô",
    },
    showCellNumber: {
      control: "boolean",
      description: "Ẩn/hiện số thứ tự ô",
    },
    showCardBorder: {
      control: "boolean",
      description: "Ẩn/hiện viền card shadcn/ui",
    },
    showCardBackground: {
      control: "boolean",
      description: "Ẩn/hiện background card",
    },
    showEmptyPlaceholder: {
      control: "boolean",
      description: "Ẩn/hiện dấu thập (+) ở ô trống",
    },
    hero: {
      control: "object",
      description: "Hero object với name, level, rarity",
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
      description: "Background theme của battlefield",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyField: Story = {
  args: {
    animated: true,
  },
};

export const HeroAtPosition3: Story = {
  args: {
    heroPosition: 3,
    hero: sampleHero,
    animated: true,
  },
};

export const SelectedCell: Story = {
  args: {
    selectedCell: 5,
    animated: true,
  },
};

export const HeroWithSelection: Story = {
  args: {
    heroPosition: 2,
    hero: legendaryHero,
    selectedCell: 6,
    animated: true,
  },
};

export const LegendaryHero: Story = {
  args: {
    heroPosition: 4,
    hero: legendaryHero,
    animated: true,
  },
};

export const RareHero: Story = {
  args: {
    heroPosition: 1,
    hero: rareHero,
    animated: true,
  },
};

export const Interactive: Story = {
  args: {
    heroPosition: 3,
    hero: sampleHero,
    animated: true,
    onCellClick: (cellIndex: number) => {
      alert(`Clicked cell ${cellIndex}`);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive battle field - click vào các ô để test click handler.",
      },
    },
  },
};

export const WithoutAnimation: Story = {
  args: {
    heroPosition: 4,
    hero: sampleHero,
    selectedCell: 2,
    animated: false,
  },
};

export const AllRarities: Story = {
  render: () => (
    <div className="space-y-4">
      <BattleField
        heroPosition={1}
        hero={{ id: "1", name: "Common Hero", level: 10, rarity: "common" }}
        animated
      />
      <BattleField
        heroPosition={2}
        hero={{ id: "2", name: "Rare Hero", level: 20, rarity: "rare" }}
        animated
      />
      <BattleField
        heroPosition={3}
        hero={{ id: "3", name: "Epic Hero", level: 35, rarity: "epic" }}
        animated
      />
      <BattleField
        heroPosition={4}
        hero={{
          id: "4",
          name: "Legendary Hero",
          level: 50,
          rarity: "legendary",
        }}
        animated
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Showcase tất cả các rarity với glow effects khác nhau.",
      },
    },
  },
};
export const NoBorder: Story = {
  args: {
    heroPosition: 3,
    hero: sampleHero,
    selectedCell: 6,
    showBorder: false,
    animated: true,
  },
};

export const NoBorderComparison: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">With Border</h3>
        <BattleField
          heroPosition={2}
          hero={legendaryHero}
          selectedCell={5}
          showBorder={true}
          animated
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Without Border</h3>
        <BattleField
          heroPosition={2}
          hero={legendaryHero}
          selectedCell={5}
          showBorder={false}
          animated
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "So sánh battle field với và không có border.",
      },
    },
  },
};
export const NoCardBorder: Story = {
  args: {
    heroPosition: 3,
    hero: sampleHero,
    selectedCell: 6,
    showCardBorder: false,
    animated: true,
  },
};

export const NoCardBackground: Story = {
  args: {
    heroPosition: 3,
    hero: sampleHero,
    selectedCell: 6,
    showCardBackground: false,
    animated: true,
  },
};

export const NoCellNumbers: Story = {
  args: {
    heroPosition: 3,
    hero: sampleHero,
    selectedCell: 6,
    showCellNumber: false,
    animated: true,
  },
};

export const NoEmptyPlaceholder: Story = {
  args: {
    heroPosition: 3,
    hero: sampleHero,
    selectedCell: 6,
    showEmptyPlaceholder: false,
    animated: true,
  },
};

export const MinimalStyle: Story = {
  args: {
    heroPosition: 3,
    hero: legendaryHero,
    selectedCell: 6,
    showBorder: false,
    showCellNumber: false,
    showCardBorder: false,
    showCardBackground: false,
    showEmptyPlaceholder: false,
    animated: true,
  },
};

export const StyleComparison: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Default Style</h3>
        <BattleField
          heroPosition={2}
          hero={legendaryHero}
          selectedCell={5}
          animated
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">No Cell Numbers</h3>
        <BattleField
          heroPosition={2}
          hero={legendaryHero}
          selectedCell={5}
          showCellNumber={false}
          animated
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">No Card Border</h3>
        <BattleField
          heroPosition={2}
          hero={legendaryHero}
          selectedCell={5}
          showCardBorder={false}
          animated
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">No Card Background</h3>
        <BattleField
          heroPosition={2}
          hero={legendaryHero}
          selectedCell={5}
          showCardBackground={false}
          animated
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">No Empty Placeholder</h3>
        <BattleField
          heroPosition={2}
          hero={legendaryHero}
          selectedCell={5}
          showEmptyPlaceholder={false}
          animated
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Minimal Style</h3>
        <BattleField
          heroPosition={2}
          hero={legendaryHero}
          selectedCell={5}
          showBorder={false}
          showCellNumber={false}
          showCardBorder={false}
          showCardBackground={false}
          showEmptyPlaceholder={false}
          animated
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "So sánh các style options khác nhau của battle field.",
      },
    },
  },
};
export const GrassTheme: Story = {
  args: {
    heroPosition: 3,
    hero: sampleHero,
    selectedCell: 6,
    backgroundTheme: "grass",
    animated: true,
  },
};

export const SnowTheme: Story = {
  args: {
    heroPosition: 2,
    hero: rareHero,
    selectedCell: 5,
    backgroundTheme: "snow",
    animated: true,
  },
};

export const DesertTheme: Story = {
  args: {
    heroPosition: 4,
    hero: legendaryHero,
    selectedCell: 1,
    backgroundTheme: "desert",
    animated: true,
  },
};

export const WaterTheme: Story = {
  args: {
    heroPosition: 1,
    hero: sampleHero,
    selectedCell: 7,
    backgroundTheme: "water",
    animated: true,
  },
};

export const LavaTheme: Story = {
  args: {
    heroPosition: 6,
    hero: legendaryHero,
    selectedCell: 2,
    backgroundTheme: "lava",
    animated: true,
  },
};

export const CrystalTheme: Story = {
  args: {
    heroPosition: 5,
    hero: rareHero,
    selectedCell: 0,
    backgroundTheme: "crystal",
    animated: true,
  },
};

export const VoidTheme: Story = {
  args: {
    heroPosition: 0,
    hero: legendaryHero,
    selectedCell: 4,
    backgroundTheme: "void",
    animated: true,
  },
};

export const AllThemes: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Grass Theme</h3>
        <BattleField
          heroPosition={2}
          hero={sampleHero}
          backgroundTheme="grass"
          animated
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Snow Theme</h3>
        <BattleField
          heroPosition={3}
          hero={rareHero}
          backgroundTheme="snow"
          animated
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Desert Theme</h3>
        <BattleField
          heroPosition={4}
          hero={legendaryHero}
          backgroundTheme="desert"
          animated
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Water Theme</h3>
        <BattleField
          heroPosition={1}
          hero={sampleHero}
          backgroundTheme="water"
          animated
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Lava Theme</h3>
        <BattleField
          heroPosition={6}
          hero={legendaryHero}
          backgroundTheme="lava"
          animated
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Crystal Theme</h3>
        <BattleField
          heroPosition={5}
          hero={rareHero}
          backgroundTheme="crystal"
          animated
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Void Theme</h3>
        <BattleField
          heroPosition={0}
          hero={legendaryHero}
          backgroundTheme="void"
          animated
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Heaven Theme</h3>
        <BattleField
          heroPosition={7}
          hero={legendaryHero}
          backgroundTheme="heaven"
          animated
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Showcase tất cả các background themes với effects và animations khác nhau.",
      },
    },
  },
};
