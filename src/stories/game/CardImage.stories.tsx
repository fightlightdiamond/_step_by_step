import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CardImage from "./CardImage";

const meta: Meta<typeof CardImage> = {
  title: "Game Components/CardImage",
  component: CardImage,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Card image component tối ưu với Tailwind CSS + CSS Module. Tailwind cho layout, states cơ bản. CSS Module cho parallax effects, loading animations, shine effects phức tạp.",
      },
    },
  },
  argTypes: {
    src: {
      control: "text",
      description: "Image URL",
    },
    alt: {
      control: "text",
      description: "Alt text for the image",
    },
    loading: {
      control: "boolean",
      description: "Show loading state",
    },
    error: {
      control: "boolean",
      description: "Show error state",
    },
    parallax: {
      control: "boolean",
      description: "Enable parallax hover effect",
    },
    overlay: {
      control: "boolean",
      description: "Show gradient overlay",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
    alt: "Fantasy warrior",
  },
};

export const WithParallax: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop",
    alt: "Fantasy mage with parallax",
    parallax: true,
  },
};

export const WithOverlay: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
    alt: "Dragon with overlay",
    overlay: true,
  },
};

export const ParallaxWithOverlay: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop",
    alt: "Full effects image",
    parallax: true,
    overlay: true,
  },
};

export const LoadingState: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
    alt: "Loading image",
    loading: true,
  },
};

export const ErrorState: Story = {
  args: {
    src: "invalid-url",
    alt: "Error image",
    error: true,
  },
};

export const MultipleEffects: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-2xl">
      <CardImage
        src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop"
        alt="Basic"
      />
      <CardImage
        src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop"
        alt="Parallax"
        parallax
      />
      <CardImage
        src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop"
        alt="Overlay"
        overlay
      />
      <CardImage
        src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop"
        alt="Full Effects"
        parallax
        overlay
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Showcase các effects khác nhau: basic, parallax, overlay, và full effects.",
      },
    },
  },
};
