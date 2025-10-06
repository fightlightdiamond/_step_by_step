import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ElementalModifiers from "./ElementalModifiers";
import { ElementType } from "../../weather-engine/types";

const meta: Meta<typeof ElementalModifiers> = {
  title: "Game Components/Weather/ElementalModifiers",
  component: ElementalModifiers,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Elemental Modifiers component displays the current elemental damage modifiers with visual indicators, animations, and interactive features.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the modifier display",
    },
    layout: {
      control: "select",
      options: ["horizontal", "vertical", "grid"],
      description: "Layout arrangement of the modifiers",
    },
    showLabels: {
      control: "boolean",
      description: "Show element labels",
    },
    showValues: {
      control: "boolean",
      description: "Show modifier values",
    },
    animated: {
      control: "boolean",
      description: "Enable animations and effects",
    },
    interactive: {
      control: "boolean",
      description: "Enable click interactions",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const balancedModifiers: Record<ElementType, number> = {
  Fire: 15,
  Ice: -10,
  Lightning: 5,
};

const extremeModifiers: Record<ElementType, number> = {
  Fire: 40,
  Ice: -35,
  Lightning: 30,
};

const neutralModifiers: Record<ElementType, number> = {
  Fire: 0,
  Ice: 0,
  Lightning: 0,
};

export const Default: Story = {
  args: {
    modifiers: balancedModifiers,
    size: "md",
    layout: "grid",
    showLabels: true,
    showValues: true,
    animated: true,
    interactive: false,
  },
};

export const ExtremeValues: Story = {
  args: {
    modifiers: extremeModifiers,
    size: "md",
    layout: "grid",
    showLabels: true,
    showValues: true,
    animated: true,
    interactive: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Elemental modifiers with extreme positive and negative values.",
      },
    },
  },
};

export const NeutralState: Story = {
  args: {
    modifiers: neutralModifiers,
    size: "md",
    layout: "grid",
    showLabels: true,
    showValues: true,
    animated: true,
    interactive: false,
  },
  parameters: {
    docs: {
      description: {
        story: "All elemental modifiers at neutral (0) values.",
      },
    },
  },
};

export const HorizontalLayout: Story = {
  args: {
    modifiers: balancedModifiers,
    size: "md",
    layout: "horizontal",
    showLabels: true,
    showValues: true,
    animated: true,
    interactive: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Horizontal layout arrangement of elemental modifiers.",
      },
    },
  },
};

export const VerticalLayout: Story = {
  args: {
    modifiers: balancedModifiers,
    size: "md",
    layout: "vertical",
    showLabels: true,
    showValues: true,
    animated: true,
    interactive: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Vertical layout arrangement of elemental modifiers.",
      },
    },
  },
};

export const SmallSize: Story = {
  args: {
    modifiers: balancedModifiers,
    size: "sm",
    layout: "grid",
    showLabels: true,
    showValues: true,
    animated: true,
    interactive: false,
  },
};

export const LargeSize: Story = {
  args: {
    modifiers: balancedModifiers,
    size: "lg",
    layout: "grid",
    showLabels: true,
    showValues: true,
    animated: true,
    interactive: false,
  },
};

export const MinimalDisplay: Story = {
  args: {
    modifiers: balancedModifiers,
    size: "sm",
    layout: "horizontal",
    showLabels: false,
    showValues: true,
    animated: true,
    interactive: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Minimal display showing only values without labels.",
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    modifiers: balancedModifiers,
    size: "md",
    layout: "grid",
    showLabels: true,
    showValues: true,
    animated: true,
    interactive: true,
    onElementClick: (element: ElementType) => {
      alert(`Clicked on ${element} element!`);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive modifiers that respond to clicks with hover effects.",
      },
    },
  },
};

export const WithoutAnimation: Story = {
  args: {
    modifiers: balancedModifiers,
    size: "md",
    layout: "grid",
    showLabels: true,
    showValues: true,
    animated: false,
    interactive: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Static display without animations for performance-sensitive scenarios.",
      },
    },
  },
};

// Showcase different modifier scenarios
export const ModifierScenarios: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Fire Dominance</h3>
        <ElementalModifiers
          modifiers={{ Fire: 35, Ice: -20, Lightning: 5 }}
          size="sm"
          layout="horizontal"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Ice Storm</h3>
        <ElementalModifiers
          modifiers={{ Fire: -25, Ice: 30, Lightning: -10 }}
          size="sm"
          layout="horizontal"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Lightning Surge</h3>
        <ElementalModifiers
          modifiers={{ Fire: -5, Ice: 10, Lightning: 40 }}
          size="sm"
          layout="horizontal"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Balanced Weather</h3>
        <ElementalModifiers
          modifiers={{ Fire: 10, Ice: 10, Lightning: 10 }}
          size="sm"
          layout="horizontal"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Different weather scenarios showing various elemental modifier patterns.",
      },
    },
  },
};

// Showcase all layouts
export const AllLayouts: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-3">Grid Layout</h3>
        <ElementalModifiers
          modifiers={balancedModifiers}
          layout="grid"
          size="md"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3">Horizontal Layout</h3>
        <ElementalModifiers
          modifiers={balancedModifiers}
          layout="horizontal"
          size="md"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3">Vertical Layout</h3>
        <div className="flex justify-center">
          <ElementalModifiers
            modifiers={balancedModifiers}
            layout="vertical"
            size="md"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Comparison of all available layout options.",
      },
    },
  },
};
