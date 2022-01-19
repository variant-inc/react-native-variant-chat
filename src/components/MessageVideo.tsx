import React, { ReactElement, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import Video from 'react-native-video';

import { IOpsVideoMessage } from '../types/VideoMessage.interface';

enum VideoStatus {
  NONE = 'NONE',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
}

const CustomMessageVideo = (props: IOpsVideoMessage): ReactElement => {
  const {
    containerStyle,
    videoStyle,
    onDidPresentFullscreen,
    onDidDismissFullscreen,
  } = props;

  const theme = useTheme();
  const styles = localStyleSheet(theme);
  const [status, setStatus] = useState(VideoStatus.NONE);
  const isLoading = status === VideoStatus.LOADING;

  return (
    <View style={[styles.container, containerStyle]}>
      <Video
        style={[styles.video, videoStyle]}
        source={{ uri: props.currentMessage?.video }}
        controls
        paused
        resizeMode="contain"
        onFullscreenPlayerDidPresent={onDidPresentFullscreen}
        onFullscreenPlayerDidDismiss={onDidDismissFullscreen}
        onLoadStart={() => setStatus(VideoStatus.LOADING)}
        onLoad={() => setStatus(VideoStatus.LOADED)}
      />
      {isLoading && (
        <View style={styles.loadingSpinner}>
          <ActivityIndicator animating color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return StyleSheet.create({
    container: {
      width: 250,
      height: 150,
      maxWidth: '100%',
      padding: 8,
      alignSelf: 'center',
    },
    loadingSpinner: {
      position: 'absolute',
      top: 8,
      left: 8,
      right: 8,
      bottom: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    video: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.common.black,
      borderRadius: 10,
    },
  });
}

export default CustomMessageVideo;
