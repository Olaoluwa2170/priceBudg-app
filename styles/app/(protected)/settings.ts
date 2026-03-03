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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fontFamily.ManropeSemiBold,
    color: colors.black,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.gray600,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: fontFamily.ManropeMedium,
    color: colors.black,
  },
});
