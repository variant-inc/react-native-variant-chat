import React, {ReactElement} from 'react';
import {StyleSheet, View} from 'react-native';
import {IMessage, MessageVideoProps} from 'react-native-gifted-chat';
import {useTheme} from 'react-native-paper';
import Video from 'react-native-video';

const CustomMessageVideo = (
  props: MessageVideoProps<IMessage>,
): ReactElement => {
  const theme = useTheme();
  const styles = localStyleSheet(theme);

  return (
    <View style={styles.container}>
      <Video
        source={{uri: props.currentMessage?.video}}
        controls
        paused
        style={styles.video}
      />
    </View>
  );
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return StyleSheet.create({
    container: {
      height: 150,
      width: 250,
      marginLeft: 12,
      paddingHorizontal: 15,
      alignSelf: 'center',
    },
    video: {
      height: 150,
      backgroundColor: theme.colors.common.black,
      borderRadius: 12,
    },
  });
}

export default CustomMessageVideo;
