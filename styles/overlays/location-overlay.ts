import { StyleSheet } from 'react-native';
import { colors } from '../colors';
import { fontFamily } from '../font-family';

export const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlayDarkLight,
    zIndex: 1000,
  },
  content: {
    backgroundColor: colors.overlayWhiteSoft,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  spinner: {
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamily.ManropeSemiBold,
    marginTop: 16,
    color: colors.black,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fontFamily.ManropeLight,
    color: colors.gray600,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 250,
  },
});
