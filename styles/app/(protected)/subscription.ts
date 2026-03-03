import { StyleSheet } from 'react-native';
import { colors } from '../../colors';
import { fontFamily } from '../../font-family';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    gap: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: fontFamily.ManropeBold,
    color: colors.black,
  },
  currentPlanCard: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  currentPlanTitle: {
    fontSize: 14,
    fontFamily: fontFamily.ManropeSemiBold,
    color: colors.gray600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentPlanName: {
    fontSize: 24,
    fontFamily: fontFamily.ManropeBold,
    color: colors.black,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  premiumText: {
    color: colors.success,
  },
  currentPlanDetails: {
    fontSize: 16,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.gray600,
    marginBottom: 4,
  },
  expirationText: {
    fontSize: 14,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.placeholderGray,
    marginTop: 4,
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: fontFamily.ManropeBold,
    color: colors.black,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.gray600,
    marginBottom: 24,
    lineHeight: 20,
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.gray200,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  premiumCard: {
    borderColor: colors.success,
    borderWidth: 2,
    backgroundColor: colors.successBg,
  },
  activePlanCard: {
    borderColor: colors.success,
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planTitle: {
    fontSize: 24,
    fontFamily: fontFamily.ManropeBold,
    color: colors.black,
    textTransform: 'capitalize',
  },
  premiumTitle: {
    color: colors.success,
  },
  badge: {
    backgroundColor: colors.gray200,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadge: {
    backgroundColor: colors.success,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: fontFamily.ManropeSemiBold,
    color: colors.white,
    textTransform: 'uppercase',
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  priceAmount: {
    fontSize: 36,
    fontFamily: fontFamily.ManropeBold,
    color: colors.black,
  },
  premiumPrice: {
    color: colors.success,
  },
  pricePeriod: {
    fontSize: 16,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.gray600,
    marginLeft: 4,
  },
  planFeatures: {
    gap: 12,
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.gray700,
    flex: 1,
  },
  planAction: {
    marginTop: 8,
  },
  subscribeButton: {
    backgroundColor: colors.black,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.ManropeBold,
  },
  footer: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.placeholderGray,
    textAlign: 'center',
    lineHeight: 18,
  },
});
