import React, {ReactElement} from 'react';
import {StyleSheet, View} from 'react-native';
import {useTheme} from 'react-native-paper';
import Video from 'react-native-video';
import {IOpsVideoMessage} from 'types/VideoMessage.interface';

const CustomMessageVideo = (props: IOpsVideoMessage): ReactElement => {
  const {onDidPresentFullscreen, onDidDismissFullscreen} = props;

  const theme = useTheme();
  const styles = localStyleSheet(theme);

  return (
    <View style={styles.container}>
      <Video
        source={{uri: props.currentMessage?.video}}
        controls
        paused
        style={styles.video}
        onFullscreenPlayerDidPresent={() =>
          onDidPresentFullscreen && onDidPresentFullscreen()
        }
        onFullscreenPlayerDidDismiss={() =>
          onDidDismissFullscreen && onDidDismissFullscreen()
        }
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
