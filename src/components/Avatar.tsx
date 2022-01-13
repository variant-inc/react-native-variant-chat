import React, { ReactElement } from 'react';
import { ViewStyle } from 'react-native';
import { Avatar, AvatarProps, LeftRightStyle } from 'react-native-gifted-chat';

import { IOpsMessage } from '../types/Message.interface';

const CustomAvatar = (props: AvatarProps<IOpsMessage>): ReactElement => {
  const styles = localStyleSheet();

  return (
    <Avatar
      {...props}
      containerStyle={styles.container as LeftRightStyle<ViewStyle>}
    />
  );
};

function localStyleSheet() {
  return {
    container: {
      left: {
        marginTop: 5,
      },
      right: {
        marginTop: 5,
      },
    },
  };
}

export default CustomAvatar;
