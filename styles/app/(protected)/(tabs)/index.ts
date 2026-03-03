import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../../colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  cameraViewContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    height: '100%',
    position: 'absolute',
    width: '100%',
    flex: 1,
    backgroundColor: colors.transparent,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  framingBox: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.overlayWhiteMuted,
    borderRadius: 12,
    margin: 40,
    marginVertical: 100,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.black,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: colors.black,
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  retakeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.black,
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
