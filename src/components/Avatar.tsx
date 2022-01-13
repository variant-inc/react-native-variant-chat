import React, { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, AvatarProps } from 'react-native-gifted-chat';

import { IOpsMessage } from '../types/Message.interface';

const CustomAvatar = (props: AvatarProps<IOpsMessage>): ReactElement => {
  const styles = localStyleSheet();

  return (
    <View style={styles.container}>
      <Avatar {...props} />
    </View>
  );
};

function localStyleSheet() {
  return StyleSheet.create({
    container: {
      marginTop: 5,
    },
  });
}

export default CustomAvatar;
