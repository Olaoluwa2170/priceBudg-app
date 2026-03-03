import { StyleSheet } from 'react-native';
import { colors } from '../colors';
import { fontFamily } from '../font-family';

export const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlayDark,
    zIndex: 1000,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
    opacity: 0.3,
  },
  content: {
    backgroundColor: colors.overlayWhite,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    minWidth: 320,
    maxWidth: 380,
    marginHorizontal: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.successBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: fontFamily.ManropeBold,
    color: colors.black,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButton: {
    backgroundColor: colors.success,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.ManropeSemiBold,
  },
  closeButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.transparent,
  },
  closeButtonText: {
    color: colors.gray600,
    fontSize: 15,
    fontFamily: fontFamily.ManropeRegular,
  },
});
