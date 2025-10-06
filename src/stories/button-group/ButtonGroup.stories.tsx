import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ButtonGroup, ButtonGroupItem, PolaroidIcon } from "./ButtonGroup";
import React from "react";

const meta = {
  title: "ABC/ButtonGroup",
  component: ButtonGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The Button Group is composed of multiple Button components arranged together to represent related actions. They inherit the standard states from the Button component: Default, Hover, Disabled, and Selected, and support up to 7 buttons in a single group.
Each button can optionally include:
- A StartIcon (icon before the text)
- A Label (text)
- Or both
## States Support
- **Default**: Normal state
- **Hover**: Hover interaction state  
- **Disabled**: Disabled state with reduced opacity
- **Selected**: Selected/active state with distinct styling
## Appearances
- **Default**: Neutral gray styling
- **Primary**: Blue primary colors
- **Secondary**: Cyan accent colors
- **Transparency**: Transparent background
- **Outline**: Outlined border style
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md"],
      description: "Size of the button group",
    },

    appearance: {
      control: { type: "select" },
      options: ["default", "primary", "secondary", "transparency", "outline"],
      description: "Visual style of the button group",
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default story

export const Default: Story = {
  args: {
    size: "sm",
    appearance: "default",
    items: [
      { label: "Button", hasStartIcon: true, hasLabel: true },
      { label: "Button", hasStartIcon: true, hasLabel: true },
      { label: "Button", hasStartIcon: true, hasLabel: true },
    ],
  },
};

// Size variations

export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          alignItems: "center",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            fontWeight: "500",
            color: "#7b61ff",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Size=XS (24px)
        </p>
        <ButtonGroup
          size="xs"
          items={[
            { label: "Button", hasStartIcon: true, hasLabel: true },
            { label: "Button", hasStartIcon: true, hasLabel: true },
            { label: "Button", hasStartIcon: true, hasLabel: true },
            { label: "Button", hasStartIcon: true, hasLabel: true },
          ]}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          alignItems: "center",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            fontWeight: "500",
            color: "#7b61ff",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Size=SM (32px)
        </p>
        <ButtonGroup
          size="sm"
          items={[
            { label: "Button", hasStartIcon: true, hasLabel: true },
            { label: "Button", hasStartIcon: true, hasLabel: true },
            { label: "Button", hasStartIcon: true, hasLabel: true },
            { label: "Button", hasStartIcon: true, hasLabel: true },
          ]}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          alignItems: "center",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            fontWeight: "500",
            color: "#7b61ff",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Size=MD (36px)
        </p>
        <ButtonGroup
          size="md"
          items={[
            { label: "Button", hasStartIcon: true, hasLabel: true },
            { label: "Button", hasStartIcon: true, hasLabel: true },
            { label: "Button", hasStartIcon: true, hasLabel: true },
            { label: "Button", hasStartIcon: true, hasLabel: true },
          ]}
        />
      </div>
    </div>
  ),
};

// Interactive States Demo - Real UX Behavior

export const InteractiveStatesDemo: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "60px",
        alignItems: "center",
        padding: "48px",
        backgroundColor: "#f6f8fa",
        borderRadius: "8px",
        position: "relative",
        minWidth: "800px",
      }}
    >
      {/* Column Headers */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "120px",
          alignItems: "center",
        }}
      >
        <div style={{ width: "100px", textAlign: "center" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#7b61ff",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            default
          </p>
          <p style={{ fontSize: "11px", color: "#666", margin: 0 }}>
            (hover to see effect)
          </p>
        </div>
        <div style={{ width: "100px", textAlign: "center" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#7b61ff",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            selected
          </p>
          <p style={{ fontSize: "11px", color: "#666", margin: 0 }}>
            (click to select)
          </p>
        </div>
        <div style={{ width: "100px", textAlign: "center" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#7b61ff",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            disabled
          </p>
          <p style={{ fontSize: "11px", color: "#666", margin: 0 }}>
            (no interaction)
          </p>
        </div>
      </div>

      {/* Default Appearance States */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginTop: "60px",
        }}
      >
        <div style={{ width: "120px", textAlign: "left" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#7b61ff",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              margin: 0,
            }}
          >
            DEFAULT
          </p>
        </div>

        <div style={{ display: "flex", gap: "120px", alignItems: "center" }}>
          <ButtonGroup
            appearance="default"
            items={[{ label: "Button", hasStartIcon: true, hasLabel: true }]}
          />
          <ButtonGroup
            appearance="default"
            defaultSelectedIndex={0}
            items={[{ label: "Button", hasStartIcon: true, hasLabel: true }]}
          />
          <ButtonGroup
            appearance="default"
            items={[
              {
                label: "Button",
                hasStartIcon: true,
                hasLabel: true,
                disabled: true,
              },
            ]}
          />
        </div>
      </div>

      {/* Primary Appearance States */}

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ width: "120px", textAlign: "left" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#7b61ff",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              margin: 0,
            }}
          >
            PRIMARY
          </p>
        </div>
        <div style={{ display: "flex", gap: "120px", alignItems: "center" }}>
          <ButtonGroup
            appearance="primary"
            items={[{ label: "Button", hasStartIcon: true, hasLabel: true }]}
          />
          <ButtonGroup
            appearance="primary"
            defaultSelectedIndex={0}
            items={[{ label: "Button", hasStartIcon: true, hasLabel: true }]}
          />
          <ButtonGroup
            appearance="primary"
            items={[
              {
                label: "Button",
                hasStartIcon: true,
                hasLabel: true,
                disabled: true,
              },
            ]}
          />
        </div>
      </div>

      {/* Secondary Appearance States */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ width: "120px", textAlign: "left" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#7b61ff",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              margin: 0,
            }}
          >
            SECONDARY
          </p>
        </div>

        <div style={{ display: "flex", gap: "120px", alignItems: "center" }}>
          <ButtonGroup
            appearance="secondary"
            items={[{ label: "Button", hasStartIcon: true, hasLabel: true }]}
          />
          <ButtonGroup
            appearance="secondary"
            defaultSelectedIndex={0}
            items={[{ label: "Button", hasStartIcon: true, hasLabel: true }]}
          />
          <ButtonGroup
            appearance="secondary"
            items={[
              {
                label: "Button",
                hasStartIcon: true,
                hasLabel: true,
                disabled: true,
              },
            ]}
          />
        </div>
      </div>

      {/* Outline Appearance States */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ width: "120px", textAlign: "left" }}>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#7b61ff",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              margin: 0,
            }}
          >
            OUTLINE
          </p>
        </div>

        <div style={{ display: "flex", gap: "120px", alignItems: "center" }}>
          <ButtonGroup
            appearance="outline"
            items={[{ label: "Button", hasStartIcon: true, hasLabel: true }]}
          />
          <ButtonGroup
            appearance="outline"
            defaultSelectedIndex={0}
            items={[{ label: "Button", hasStartIcon: true, hasLabel: true }]}
          />
          <ButtonGroup
            appearance="outline"
            items={[
              {
                label: "Button",
                hasStartIcon: true,
                hasLabel: true,
                disabled: true,
              },
            ]}
          />
        </div>
      </div>
    </div>
  ),
};

// Label & Icon variations

export const LabelAndIconVariations: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        alignItems: "center",
        padding: "40px",
        backgroundColor: "#f6f8fa",
        borderRadius: "8px",
      }}
    >
      <div style={{ display: "flex", gap: "80px", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#7b61ff",
              textTransform: "uppercase",
            }}
          >
            HASLABEL?=TRUE
          </p>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#7b61ff",
              textTransform: "uppercase",
            }}
          >
            STARTICON?=TRUE
          </p>
          <ButtonGroup
            items={[
              { label: "Button", hasStartIcon: true, hasLabel: true },
              { label: "Button", hasStartIcon: true, hasLabel: true },
              { label: "Button", hasStartIcon: true, hasLabel: true },
              { label: "Button", hasStartIcon: true, hasLabel: true },
            ]}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#7b61ff",
              textTransform: "uppercase",
            }}
          >
            HASLABEL?=TRUE
          </p>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#7b61ff",
              textTransform: "uppercase",
            }}
          >
            STARTICON?=FALSE
          </p>
          <ButtonGroup
            items={[
              { label: "Button", hasStartIcon: false, hasLabel: true },
              { label: "Button", hasStartIcon: false, hasLabel: true },
              { label: "Button", hasStartIcon: false, hasLabel: true },
              { label: "Button", hasStartIcon: false, hasLabel: true },
            ]}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#7b61ff",
              textTransform: "uppercase",
            }}
          >
            HASLABEL?=FALSE
          </p>
          <p
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "#7b61ff",
              textTransform: "uppercase",
            }}
          >
            STARTICON?=TRUE
          </p>
          <ButtonGroup
            items={[
              { hasStartIcon: true, hasLabel: false },
              { hasStartIcon: true, hasLabel: false },
              { hasStartIcon: true, hasLabel: false },
              { hasStartIcon: true, hasLabel: false },
            ]}
          />
        </div>
      </div>
    </div>
  ),
};

// Large group (up to 7 buttons)

export const LargeGroup: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        alignItems: "center",
      }}
    >
      <h3>Large Button Group (7 buttons)</h3>
      <ButtonGroup
        defaultSelectedIndex={0}
        size="sm"
        items={[
          { label: "Mon", hasStartIcon: true, hasLabel: true },
          { label: "Tue", hasStartIcon: true, hasLabel: true },
          { label: "Wed", hasStartIcon: true, hasLabel: true },
          { label: "Thu", hasStartIcon: true, hasLabel: true },
          { label: "Fri", hasStartIcon: true, hasLabel: true },
          { label: "Sat", hasStartIcon: true, hasLabel: true },
          { label: "Sun", hasStartIcon: true, hasLabel: true },
        ]}
      />
    </div>
  ),
};

// All appearances showcase
export const AllAppearances: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        alignItems: "center",
        maxWidth: "800px",
      }}
    >
      {(
        ["default", "primary", "secondary", "transparency", "outline"] as const
      ).map((appearance) => (
        <div
          key={appearance}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: "500",
              color: "#7b61ff",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Appearance={appearance}
          </p>

          <ButtonGroup
            defaultSelectedIndex={0}
            appearance={appearance}
            items={[
              { label: "Button", hasStartIcon: true, hasLabel: true },
              { label: "Button", hasStartIcon: true, hasLabel: true },
              { label: "Button", hasStartIcon: true, hasLabel: true },
            ]}
          />
        </div>
      ))}
    </div>
  ),
};
