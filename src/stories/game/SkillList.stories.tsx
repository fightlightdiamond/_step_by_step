import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SkillList from "./SkillList";

const meta: Meta<typeof SkillList> = {
  title: "Game Components/SkillList",
  component: SkillList,
  parameters: {
    layout: "centered",
    controls: { expanded: true },
    docs: {
      description: {
        component:
          "SkillList component hiển thị danh sách 50 skills với ảnh từ /images/skills/1.png đến 50.png. Hỗ trợ grid, list, masonry layouts với sorting và filtering.",
      },
    },
  },
  argTypes: {
    layout: {
      control: "select",
      options: ["grid", "list", "masonry"],
      description: "Layout type for skill display",
    },
    columns: {
      control: "select",
      options: [2, 3, 4, 5, 6, 7, 8],
      description: "Number of columns for grid layout",
    },
    animated: {
      control: "boolean",
      description: "Enable animations",
    },
    size: {
      control: "select",
      options: ["small", "medium", "large", "xlarge"],
      description: "Size of skill cards and images",
    },
    sortBy: {
      control: "select",
      options: ["name", "rarity", "level"],
      description: "Sort skills by",
    },
    filterBy: {
      control: "select",
      options: ["all", "unlocked", "locked", "maxLevel"],
      description: "Filter skills by status",
    },
    onSkillClick: {
      action: "skillClicked",
      description: "Callback when skill is clicked",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    layout: "grid",
    columns: 3,
    animated: true,
    size: "medium",
  },
};

export const GridLayout: Story = {
  args: {
    layout: "grid",
    columns: 3,
    animated: true,
  },
};

export const ListLayout: Story = {
  args: {
    layout: "list",
    animated: true,
  },
};

export const MasonryLayout: Story = {
  args: {
    layout: "masonry",
    columns: 3,
    animated: true,
  },
};

export const MasonryFourColumns: Story = {
  args: {
    layout: "masonry",
    columns: 4,
    animated: true,
  },
};

export const MasonryFiveColumns: Story = {
  args: {
    layout: "masonry",
    columns: 5,
    animated: true,
  },
};

export const FourColumns: Story = {
  args: {
    layout: "grid",
    columns: 4,
    animated: true,
  },
};

export const FiveColumns: Story = {
  args: {
    layout: "grid",
    columns: 5,
    animated: true,
  },
};

export const SortedByRarity: Story = {
  args: {
    layout: "grid",
    columns: 3,
    animated: true,
    sortBy: "rarity",
  },
};

export const SortedByLevel: Story = {
  args: {
    layout: "grid",
    columns: 4,
    animated: true,
    sortBy: "level",
  },
};

export const UnlockedOnly: Story = {
  args: {
    layout: "grid",
    columns: 3,
    animated: true,
    filterBy: "unlocked",
  },
};

export const LockedOnly: Story = {
  args: {
    layout: "grid",
    columns: 3,
    animated: true,
    filterBy: "locked",
  },
};

export const MaxLevelOnly: Story = {
  args: {
    layout: "grid",
    columns: 3,
    animated: true,
    filterBy: "maxLevel",
  },
};

export const Interactive: Story = {
  args: {
    layout: "grid",
    columns: 3,
    animated: true,
    onSkillClick: (skill) => {
      alert(`Clicked skill: ${skill.name} (Level ${skill.level})`);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive SkillList với click handlers để test skill selection.",
      },
    },
  },
};

export const SixColumns: Story = {
  args: {
    layout: "grid",
    columns: 6,
    animated: true,
  },
};

export const SevenColumns: Story = {
  args: {
    layout: "grid",
    columns: 7,
    animated: true,
  },
};

export const EightColumns: Story = {
  args: {
    layout: "grid",
    columns: 8,
    animated: true,
  },
};

export const SmallSize: Story = {
  args: {
    layout: "grid",
    columns: 6,
    animated: true,
    size: "small",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Small size skills - compact view với nhiều skills trên màn hình.",
      },
    },
  },
};

export const LargeSize: Story = {
  args: {
    layout: "grid",
    columns: 4,
    animated: true,
    size: "large",
  },
  parameters: {
    docs: {
      description: {
        story: "Large size skills - ảnh và text lớn hơn, dễ nhìn hơn.",
      },
    },
  },
};

export const XLargeSize: Story = {
  args: {
    layout: "grid",
    columns: 3,
    animated: true,
    size: "xlarge",
  },
  parameters: {
    docs: {
      description: {
        story: "Extra large size skills - ảnh rất lớn, chi tiết rõ ràng nhất.",
      },
    },
  },
};

export const AllSkills50: Story = {
  args: {
    layout: "grid",
    columns: 8,
    animated: false,
    size: "small",
    sortBy: "name",
    filterBy: "all",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Hiển thị tất cả 50 skills với ảnh từ /images/skills/1.png đến 50.png trong 8 columns, size nhỏ.",
      },
    },
  },
};
