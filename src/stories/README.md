# Storybook Documentation

This directory contains Storybook stories for the admin user management system components.

## Story Structure

```
src/stories/
└── admin/
    ├── UserTable.stories.tsx      # User table component stories
    ├── UserFilters.stories.tsx    # Filter component stories
    ├── BulkOperations.stories.tsx # Bulk operations stories
    └── UserDialog.stories.tsx     # User dialog stories
```

## Available Stories

### UserTable Stories

Interactive table component for displaying users with various states:

- **Default**: Standard table with sample users
- **Loading**: Table in loading state
- **Empty**: Table with no users
- **WithSelection**: Table with selected users
- **SingleUser**: Table with only one user
- **UsersWithoutRoles**: Users without assigned roles
- **InactiveUsers**: All users in inactive state

### UserFilters Stories

Comprehensive filter component with different configurations:

- **Default**: Clean filter state
- **WithSearchTerm**: Pre-filled search
- **WithRoleFilter**: Role filter applied
- **WithStatusFilter**: Status filter applied
- **WithDateRange**: Date range filter
- **WithMultipleFilters**: Multiple filters combined
- **WithCustomSorting**: Custom sort configuration
- **NoRoles**: Filter without available roles

### BulkOperations Stories

Floating action bar for bulk user operations:

- **Hidden**: No users selected (component hidden)
- **SingleUserSelected**: One user selected
- **MultipleUsersSelected**: Multiple users selected
- **ManyUsersSelected**: Large number of users selected
- **NoRoles**: Bulk operations without available roles
- **WithBackgroundContent**: Shows overlay behavior

### UserDialog Stories

Modal dialog for creating and editing users:

- **Closed**: Dialog in closed state
- **CreateUser**: New user creation dialog
- **EditUser**: Edit existing user dialog
- **EditUserWithoutRole**: Edit user without role
- **EditInactiveUser**: Edit inactive user
- **NoRoles**: Dialog without available roles
- **WithBackgroundContent**: Shows modal overlay

## Running Storybook

```bash
# Start Storybook development server
npm run storybook

# Build Storybook for production
npm run build-storybook

# Run Storybook tests
npm run test:storybook
```

## Story Features

### Interactive Controls

All stories include interactive controls (args) that allow you to:

- Modify component props in real-time
- Test different data scenarios
- Trigger callbacks and actions
- Explore component behavior

### Actions Logging

Stories use Storybook actions to log:

- Button clicks
- Form submissions
- Filter changes
- Selection events
- Dialog interactions

### Responsive Design

Stories are configured to test responsive behavior:

- Mobile layouts
- Tablet views
- Desktop displays
- Touch interactions

## Writing New Stories

### Basic Story Structure

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { Component } from "./Component";

const meta: Meta<typeof Component> = {
  title: "Admin/Component",
  component: Component,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Component description here.",
      },
    },
  },
  argTypes: {
    prop: {
      description: "Prop description",
      control: "text",
    },
    onAction: {
      description: "Callback description",
      action: "action",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Default: Story = {
  args: {
    prop: "value",
    onAction: action("action"),
  },
};
```

### Story Variants

Create multiple variants to showcase different states:

```typescript
export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    error: "Something went wrong",
  },
};
```

### Interactive Stories

Use decorators for complex interactions:

```typescript
export const Interactive: Story = {
  args: Default.args,
  decorators: [
    (Story) => {
      const [state, setState] = useState(initialState);
      return (
        <div>
          <Story args={{ ...args, state, onChange: setState }} />
        </div>
      );
    },
  ],
};
```

## Best Practices

### Story Organization

1. **Group Related Stories**: Use consistent naming and grouping
2. **Logical Progression**: Order stories from simple to complex
3. **Clear Naming**: Use descriptive story names
4. **Comprehensive Coverage**: Cover all major component states

### Data Management

1. **Realistic Data**: Use data that resembles real application data
2. **Edge Cases**: Include empty states, error states, and boundary conditions
3. **Consistent Samples**: Reuse sample data across related stories
4. **Proper Types**: Use TypeScript types for all story data

### Documentation

1. **Component Descriptions**: Provide clear component descriptions
2. **Prop Documentation**: Document all props with descriptions
3. **Usage Examples**: Show how components are used in context
4. **Design Guidelines**: Include design system information

### Accessibility

1. **Keyboard Navigation**: Test keyboard interactions
2. **Screen Reader Support**: Verify ARIA labels and descriptions
3. **Color Contrast**: Ensure proper contrast ratios
4. **Focus Management**: Test focus behavior

## Integration with Design System

Stories serve as:

- **Living Documentation**: Up-to-date component examples
- **Design Review Tool**: Visual component testing
- **Development Playground**: Component experimentation
- **QA Testing**: Manual testing interface

## Automated Testing

Storybook stories are integrated with:

- **Visual Regression Testing**: Chromatic integration
- **Accessibility Testing**: a11y addon
- **Interaction Testing**: Play functions
- **Unit Testing**: Vitest integration

## Deployment

Storybook is deployed to:

- **Development**: Local development server
- **Staging**: Automated deployment for review
- **Production**: Public documentation site

Access the deployed Storybook at: [Storybook URL]

## Troubleshooting

### Common Issues

- **Stories not loading**: Check import paths and component exports
- **Controls not working**: Verify argTypes configuration
- **Actions not logging**: Check action setup and imports
- **Styling issues**: Verify CSS imports and theme configuration

### Debug Mode

```bash
# Run Storybook with debug logging
npm run storybook -- --debug

# Build with verbose output
npm run build-storybook -- --debug
```

## Contributing

When adding new components:

1. Create comprehensive stories covering all states
2. Add interactive controls for all props
3. Include documentation and examples
4. Test accessibility and responsive behavior
5. Update this README with new story information
