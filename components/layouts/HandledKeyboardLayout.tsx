import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import {
  KeyboardAvoidingView,
  type KeyboardAvoidingViewProps,
} from 'react-native-keyboard-controller';

type HandledKeyboardLayoutProps = KeyboardAvoidingViewProps & {
  backgroundColor?: string;
};

const SCREEN_WIDTH = Dimensions.get('screen').width;

const HandledKeyboardLayout = ({
  children,
  backgroundColor,
  ...props
}: HandledKeyboardLayoutProps) => {
  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor }]} {...props}>
      {children}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_WIDTH,
    padding: 0,
  },
});

export default HandledKeyboardLayout;
