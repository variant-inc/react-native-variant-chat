import React, { ReactElement } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { EventRegister } from 'react-native-event-listeners';
import { ActionsProps } from 'react-native-gifted-chat';
import { SvgXml } from 'react-native-svg';

import { getSvg } from '../theme/Svg';

type CustomActionProps = {
  onOpenCamera?: () => void;
  onOpenAttachment?: () => void;
};

const CustomAction = (
  props: ActionsProps & CustomActionProps
): ReactElement => {
  const { containerStyle, wrapperStyle, onOpenCamera, onOpenAttachment } =
    props;
  const styles = localStyleSheet();

  const handleOpenCamera = () => {
    if (onOpenCamera) {
      onOpenCamera();
    }
    EventRegister.emit('info', {
      type: 'notYetImplemented',
      data: {
        message: 'Take a picture coming soon.',
      },
    });
  };

  const handleOpenAttachment = () => {
    if (onOpenAttachment) {
      onOpenAttachment();
    }
    EventRegister.emit('info', {
      type: 'notYetImplemented',
      data: {
        message: 'Add attachments coming soon.',
      },
    });
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[styles.actionButton, wrapperStyle]}
        activeOpacity={0.8}
        onPress={handleOpenCamera}
      >
        <SvgXml xml={getSvg('iconCamera')} accessibilityLabel="camera" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, wrapperStyle]}
        activeOpacity={0.8}
        onPress={handleOpenAttachment}
      >
        <SvgXml
          xml={getSvg('iconAttachment')}
          accessibilityLabel="attachment"
        />
      </TouchableOpacity>
    </View>
  );
};

function localStyleSheet() {
  return StyleSheet.create({
    container: {
      height: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 12,
    },
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
  });
}

export default CustomAction;
