import React, {FC} from 'react';
import {StyleSheet, ViewStyle} from 'react-native';
import {Button as PaperButton, useTheme} from 'react-native-paper';
import {IconSource} from 'react-native-paper/lib/typescript/components/Icon';

import {UnknownObject} from 'types/Misc.types';
import Font from '../theme/fonts';

export interface ButtonContainedProps {
  mode?: 'contained' | 'outlined';
  color?: 'primary' | 'accent' | 'secondaryAction';
  palette?: 'light' | 'dark';
  fullWidth?: boolean;
  style?: UnknownObject;
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  loading?: boolean;
  labelStyle?: UnknownObject;
  testID?: string;
  icon?: IconSource;
  contentStyle?: ViewStyle;
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
    {fullWidth, palette, color},
    resolvedColor,
  );

  let container = [styles.root, style];
  let label = [styles.labelText, labelStyle];
  if (mode === 'outlined') {
    container = [...container, styles.outlinedContainer];
    label = [...label, styles.outlinedLabel];
  }

  return (
    <PaperButton
      mode={mode}
      color={resolvedColor}
      style={container}
      labelStyle={label}
      {...restProps}>
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
  {fullWidth, palette, color}: ButtonContainedStyleProps,
  resolvedColor?: string,
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
