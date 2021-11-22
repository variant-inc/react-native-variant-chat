import React, { FC } from 'react';
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Button as PaperButton, useTheme } from 'react-native-paper';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';

import Font from '../theme/fonts';

export interface ButtonContainedProps {
  mode?: 'contained' | 'outlined';
  color?: 'primary' | 'accent' | 'secondaryAction';
  palette?: 'light' | 'dark';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  loading?: boolean;
  labelStyle?: StyleProp<ViewStyle>;
  testID?: string;
  icon?: IconSource;
  contentStyle?: StyleProp<TextStyle>;
}

export const Button: FC<ButtonContainedProps> = ({
  mode = 'contained',
  color = 'primary',
  palette = 'light',
  children,
  style,
  fullWidth,
  labelStyle,
  ...restProps
}) => {
  const theme = useTheme();
  const resolvedColor =
    theme.colors[palette === 'light' ? 'bright' : 'brand'][color];
  const styles = localStyleSheet(
    theme,
    { fullWidth, palette, color },
    resolvedColor
  );

  let container = [styles.root, style];
  let labelStyles: any = [styles.labelText, labelStyle];
  if (mode === 'outlined') {
    container = [...container, styles.outlinedContainer];
    labelStyles = [...labelStyles, styles.outlinedLabel];
  }

  return (
    <PaperButton
      mode={mode}
      color={resolvedColor}
      style={container}
      labelStyle={labelStyles}
      {...restProps}
    >
      {children}
    </PaperButton>
  );
};

interface ButtonContainedStyleProps {
  fullWidth?: boolean;
  palette?: 'light' | 'dark';
  color?: 'primary' | 'accent' | 'secondaryAction';
}

function localStyleSheet(
  theme: ReactNativePaper.Theme,
  { fullWidth, palette, color }: ButtonContainedStyleProps,
  resolvedColor?: string
) {
  return StyleSheet.create({
    root: {
      padding: 6,
      width: fullWidth ? '100%' : undefined,
    },
    labelText: {
      fontSize: Font.Size.large,
      fontWeight: Font.Weight.bold,
      textTransform: 'none',
      color:
        palette === 'dark' || color === 'secondaryAction'
          ? theme.colors.typography.dark
          : theme.colors.typography.light,
    },
    outlinedLabel: {
      color: resolvedColor,
      fontSize: Font.Size.small,
    },
    outlinedContainer: {
      borderWidth: 1,
      borderColor: resolvedColor,
      paddingVertical: 0,
    },
  });
}
