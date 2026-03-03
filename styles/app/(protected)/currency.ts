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
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 16,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.gray600,
    marginBottom: 24,
    lineHeight: 22,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: colors.gray50,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 70,
  },
  pickerItem: {
    fontSize: 16,
    fontFamily: fontFamily.ManropeRegular,
  },
  saveButton: {
    backgroundColor: colors.primaryBlue,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.ManropeSemiBold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.gray600,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.gray600,
  },
});
