import { StyleSheet } from 'react-native';
import { colors } from '../colors';
import { fontFamily } from '../font-family';
import { fontSizes } from 'styles/font-sizes';

export const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlayDarkLight,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
    opacity: 0.5,
  },
  content: {
    backgroundColor: colors.overlayWhiteSoft,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 200,
  },
  title: {
    fontSize: fontSizes.base,
    fontFamily: fontFamily.ManropeSemiBold,
    marginTop: 16,
    color: colors.black,
  },
  subtitle: {
    fontSize: fontSizes.small,
    fontFamily: fontFamily.ManropeLight,
    color: colors.gray600,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 250,
  },
});
