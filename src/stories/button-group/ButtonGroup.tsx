import React from "react";
import styles from "./ButtonGroup.module.css";
// SVG Component
const PolaroidIcon: React.FC<{ className?: string; fill?: string }> = ({
  className = "",
  fill = "#787E95",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
       {" "}
    <path
      d="M16.0417 13.9584H3.95833V15L3.96321 15.1034C3.98696 15.3417 4.09267 15.5657 4.26351 15.7365C4.45886 15.9319 4.72373 16.0417 5 16.0417H15C15.2763 16.0417 15.5411 15.9319 15.7365 15.7365C15.9318 15.5412 16.0417 15.2763 16.0417 15V13.9584ZM7.08333 7.56677C6.84223 7.56677 6.55978 7.66856 6.26709 7.95007L3.95833 10.2588V12.7084H16.0417V10.2588L14.5662 8.78341C14.2735 8.50189 13.9911 8.40011 13.75 8.40011C13.5089 8.40011 13.2264 8.50189 12.9338 8.78341L11.7171 10L12.1086 10.3915C12.3526 10.6356 12.3526 11.0312 12.1086 11.2753C11.8645 11.5193 11.4688 11.5193 11.2248 11.2753L7.89958 7.95007C7.60688 7.66856 7.32444 7.56677 7.08333 7.56677ZM11.6748 5.20837C12.02 5.20837 12.2998 5.4882 12.2998 5.83337C12.2998 6.17855 12.02 6.45837 11.6748 6.45837H11.6667C11.3215 6.45837 11.0417 6.17855 11.0417 5.83337C11.0417 5.4882 11.3215 5.20837 11.6667 5.20837H11.6748ZM16.0417 5.00004C16.0417 4.72377 15.9318 4.4589 15.7365 4.26355C15.5656 4.09271 15.3417 3.98701 15.1034 3.96326L15 3.95837H5C4.72373 3.95837 4.45886 4.0682 4.26351 4.26355C4.06816 4.4589 3.95833 4.72377 3.95833 5.00004V8.49125L5.39958 7.05001C5.88009 6.58762 6.4612 6.31677 7.08333 6.31677C7.62764 6.31677 8.14001 6.52418 8.58154 6.88562L8.76709 7.05001L10.8333 9.11625L12.0662 7.88334C12.5468 7.42095 13.1279 7.15011 13.75 7.15011C14.2943 7.15011 14.8067 7.35751 15.2482 7.71895L15.4338 7.88334L16.0417 8.49125V5.00004ZM17.2917 15C17.2917 15.6078 17.05 16.1905 16.6203 16.6203C16.1905 17.0501 15.6078 17.2917 15 17.2917H5C4.39221 17.2917 3.80949 17.0501 3.37972 16.6203C2.94995 16.1905 2.70833 15.6078 2.70833 15V5.00004C2.70833 4.39225 2.94995 3.80953 3.37972 3.37976C3.80949 2.94999 4.39221 2.70837 5 2.70837H15C15.6078 2.70837 16.1905 2.94999 16.6203 3.37976C17.05 3.80953 17.2917 4.39225 17.2917 5.00004V15Z"
      fill={fill}
    />
     {" "}
  </svg>
);
export interface ButtonGroupItemProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  hasLabel?: boolean;
  hasStartIcon?: boolean;
  className?: string;
  appearance?: "default" | "primary" | "secondary" | "transparency" | "outline";
  size?: "xs" | "sm" | "md";
  position?: "first" | "middle" | "last" | "single";
}
export interface ButtonGroupProps {
  children?: React.ReactNode;
  defaultSelectedIndex?: number;
  items?: Array<{
    label?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    hasLabel?: boolean;
    hasStartIcon?: boolean;
    onClick?: () => void;
    position?: "first" | "middle" | "last" | "single";
  }>;
  appearance?: "default" | "primary" | "secondary" | "transparency" | "outline";
  size?: "xs" | "sm" | "md";
  className?: string;
}
const ButtonGroupItem = React.forwardRef<
  HTMLButtonElement,
  ButtonGroupItemProps & {
    appearance?:
      | "default"
      | "primary"
      | "secondary"
      | "transparency"
      | "outline";
    size?: "xs" | "sm" | "md";
    position?: "first" | "middle" | "last" | "single";
  }
>(
  (
    {
      children,
      icon,
      appearance = "default",
      size = "sm",
      position = "single",
      disabled,
      selected,
      hasLabel = true,
      hasStartIcon = true,
      className = "",
      onClick,
      ...props
    },
    ref
  ) => {
    // Build className string
    const buttonClasses = [
      styles.buttonBase,
      styles[`button${size.toUpperCase()}`],
      styles[
        `appearance${appearance.charAt(0).toUpperCase() + appearance.slice(1)}`
      ],
      styles[`position${position.charAt(0).toUpperCase() + position.slice(1)}`],
      selected && styles.stateSelected,
      disabled && styles.stateDisabled,
      className,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <button
        ref={ref}
        className={buttonClasses}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
             {" "}
        {hasStartIcon && (
          <span className={`${styles.iconWrapper} ${styles[size]}`}>
                      {icon || <PolaroidIcon />}       {" "}
          </span>
        )}
             {" "}
        {hasLabel && children && (
          <span className={styles.label}>{children}</span>
        )}
           {" "}
      </button>
    );
  }
);
ButtonGroupItem.displayName = "ButtonGroupItem";
const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      children,
      items,
      appearance = "default",
      size = "sm",
      className = "",
      defaultSelectedIndex = null,
      ...props
    },
    ref
  ) => {
    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(
      defaultSelectedIndex
    );
    const isOutlineGroup = appearance === "outline";
    const hasSelectedOutline =
      isOutlineGroup && items?.some((_, i) => i === selectedIndex);
    const groupClasses = [
      styles.buttonGroup,
      styles[`size${size.toUpperCase()}`],
      isOutlineGroup && styles.outlineGroup,
      hasSelectedOutline && styles.hasSelectedOutline,
      className,
      appearance,
    ]
      .filter(Boolean)
      .join(" ");
    if (items && items.length > 0) {
      return (
        <div ref={ref} className={groupClasses} {...props}>
                   {" "}
          {items.map((item, index) => {
            let position: "first" | "middle" | "last" | "single" = "middle";
            if (items.length === 1) position = "single";
            else if (index === 0) position = "first";
            else if (index === items.length - 1) position = "last";
            const handleClick = () => {
              if (selectedIndex === index) {
                setSelectedIndex(null);
              } else {
                setSelectedIndex(index);
              }
              item.onClick?.();
            };
            return (
              <ButtonGroupItem
                key={index}
                appearance={appearance}
                size={size}
                position={position}
                disabled={item.disabled}
                selected={selectedIndex === index}
                hasLabel={item.hasLabel !== false}
                hasStartIcon={item.hasStartIcon !== false}
                onClick={handleClick}
                icon={item.icon}
              >
                                {item.label}             {" "}
              </ButtonGroupItem>
            );
          })}
                 {" "}
        </div>
      );
    }
    const childrenArray = React.Children.toArray(children);
    return (
      <div ref={ref} className={groupClasses} {...props}>
               {" "}
        {childrenArray.map((child, index) => {
          if (React.isValidElement(child)) {
            let position: "first" | "middle" | "last" | "single" = "middle";
            if (childrenArray.length === 1) position = "single";
            else if (index === 0) position = "first";
            else if (index === childrenArray.length - 1) position = "last";
            return React.cloneElement(
              child as React.ReactElement<ButtonGroupItemProps>,
              {
                key: index,
                appearance: appearance,
                size: size,
                position: position,
                selected: selectedIndex === index,
                onClick: () => {
                  setSelectedIndex(index);
                  child.props.onClick?.();
                },
              }
            );
          }
          return child;
        })}
             {" "}
      </div>
    );
  }
);
ButtonGroup.displayName = "ButtonGroup";
export { ButtonGroup, ButtonGroupItem, PolaroidIcon };
