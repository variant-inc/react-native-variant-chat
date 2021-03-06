import React, { ReactElement } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Lightbox from 'react-native-lightbox';
import { useTheme } from 'react-native-paper';
import Pdf from 'react-native-pdf';

import { IOpsMessage } from '../types/Message.interface';

type MessagePdfProps<IOpsMessage> = {
  currentMessage?: IOpsMessage;
  containerStyle?: StyleProp<ViewStyle>;
  pdfStyle?: StyleProp<ViewStyle>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lightboxProps?: any;
};

const MessagePdf = (
  props: MessagePdfProps<IOpsMessage>
): ReactElement | null => {
  const { containerStyle, lightboxProps, pdfStyle, currentMessage } = props;

  const theme = useTheme();
  const styles = localStyleSheet(theme);

  if (!currentMessage || !currentMessage.pdf) {
    return null;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Lightbox
        {...lightboxProps}
        activeProps={{
          style: styles.pdfActive,
        }}
      >
        <Pdf
          style={[styles.pdf, pdfStyle]}
          source={{ uri: currentMessage.pdf }}
        />
      </Lightbox>
    </View>
  );
};

MessagePdf.defaultProps = {
  currentMessage: {
    pdf: null,
  },
  containerStyle: {},
  pdfStyle: {},
  lightboxProps: {},
};

function localStyleSheet(theme: ReactNativePaper.Theme) {
  return StyleSheet.create({
    container: {
      padding: 8,
      minHeight: 100,
      alignItems: 'center',
    },
    pdf: {
      width: 150,
      height: 100,
      borderRadius: 13,
      backgroundColor: theme.colors.chat.bubbleReceive,
    },
    pdfActive: {
      flex: 1,
      marginTop: 44,
      marginBottom: 10,
      backgroundColor: theme.colors.chat.bubbleReceive,
    },
  });
}

export default MessagePdf;
