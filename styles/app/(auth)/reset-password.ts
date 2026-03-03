import { StyleSheet } from 'react-native';
import { colors } from '../../colors';
import { fontFamily } from '../../font-family';
import { fontSizes } from '../../font-sizes';

export const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: fontSizes.extraExtraLarge,
    fontFamily: fontFamily.ManropeBold,
    color: colors.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.medium,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  label: {
    fontSize: fontSizes.small,
    fontFamily: fontFamily.ManropeMedium,
    color: colors.gray700,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: colors.gray50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: fontSizes.base,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.black,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  button: {
    backgroundColor: colors.black,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSizes.base,
    fontFamily: fontFamily.ManropeSemiBold,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.small,
    fontFamily: fontFamily.ManropeMedium,
    textAlign: 'center',
    marginBottom: 16,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  linkText: {
    color: colors.black,
    fontFamily: fontFamily.ManropeSemiBold,
    fontSize: fontSizes.medium,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
    marginLeft: -8,
  },
});
