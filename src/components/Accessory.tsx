import React, {ReactElement} from 'react';
import {Keyboard, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useTheme} from 'react-native-paper';

const Accessory = (): ReactElement => {
  const theme = useTheme();
  const styles = localStyleSheet(theme);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dismissButton}
        activeOpacity={0.8}
        onPress={() => Keyboard.dismiss()}>
        <Text style={styles.textAccessory}>Dismiss Keyboard</Text>
      </TouchableOpacity>
    </View>
  );
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'center',
      borderTopColor: theme.colors.gray.light,
      borderTopWidth: 1,
    },
    dismissButton: {
      marginHorizontal: 10,
    },
    textAccessory: {},
  });
}

export default Accessory;
