import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../colors';
import { fontFamily } from '../../../font-family';
import { fontSizes } from 'styles/font-sizes';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    fontSize: fontSizes.extraExtraLarge,
    color: colors.black,
    fontFamily: fontFamily.ManropeBold,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: fontSizes.small,
    color: colors.gray600,
    fontFamily: fontFamily.ManropeRegular,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: fontSizes.base,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.black,
    backgroundColor: colors.gray50,
  },
  searchButton: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: fontSizes.medium,
    fontFamily: fontFamily.ManropeSemiBold,
    color: colors.white,
  },
  searchButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  listContent: {
    paddingBottom: 24,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  resultThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.gray100,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontFamily: fontFamily.ManropeSemiBold,
    color: colors.black,
    marginBottom: 4,
  },
  resultPrice: {
    fontSize: 15,
    fontFamily: fontFamily.ManropeSemiBold,
    color: colors.success,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.medium,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.gray600,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: fontSizes.base,
    fontFamily: fontFamily.ManropeMedium,
    color: colors.gray600,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: fontSizes.medium,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.placeholderGray,
    textAlign: 'center',
  },
  // Premium gate
  premiumGateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  premiumIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.successBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  premiumTitle: {
    fontSize: fontSizes.extraExtraLarge - 2,
    fontFamily: fontFamily.ManropeBold,
    color: colors.black,
    marginBottom: 12,
    textAlign: 'center',
  },
  premiumSubtitle: {
    fontSize: fontSizes.small + 1,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  upgradeButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: colors.success,
  },
  upgradeButtonText: {
    fontSize: fontSizes.medium,
    fontFamily: fontFamily.ManropeSemiBold,
    color: colors.white,
  },
});
