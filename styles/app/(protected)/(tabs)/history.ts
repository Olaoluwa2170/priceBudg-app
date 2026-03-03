import { StyleSheet } from 'react-native';
import { colors } from '../../../colors';
import { fontFamily } from '../../../font-family';
import { fontSizes } from 'styles/font-sizes';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    fontSize: 24,
    color: colors.black,
    fontFamily: fontFamily.ManropeBold,
  },
  clearButton: {
    fontSize: fontSizes.medium,
    color: colors.danger,
    fontFamily: fontFamily.ManropeSemiBold,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontFamily: fontFamily.ManropeSemiBold,
    color: colors.black,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: colors.success,
    fontFamily: fontFamily.ManropeSemiBold,
  },
  deleteIcon: {
    padding: 8,
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
  },
  emptySubtext: {
    fontSize: fontSizes.medium,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.placeholderGray,
    textAlign: 'center',
  },
});
