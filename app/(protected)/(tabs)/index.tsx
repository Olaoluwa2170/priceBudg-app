import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { Flashlight, HelpCircle, ImageIcon, X, Menu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { AnalysisOverlay } from '../../../components/AnalysisOverlay';
import { LocationOverlay } from '../../../components/LocationOverlay';
import { ResultsModal } from '../../../components/ResultsModal';
import { UpgradeOverlay } from '../../../components/UpgradeOverlay';
import { saveLocationData, getLocationData } from '../../../utils/storage/location';
import { ReverseGeocodeResult, ScanItem } from '../../../types';
import { processScanWithCreditCheck } from '../../../utils/scan';
import { styles } from 'styles/app/(protected)/(tabs)';
import * as Location from 'expo-location';
import { useAction, useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from 'convex/_generated/api';
import { useRouter } from 'expo-router';
import { FREE_PLAN } from 'constants/plans';
import { colors } from '../../../styles/colors';
import { fontFamily } from '../../../styles/font-family';

export default function ScanScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanItem | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showUpgradeOverlay, setShowUpgradeOverlay] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ country?: string; city?: string } | null>(
    null
  );

  const reverseGeocode = useAction(api.miscellaneous.reverseGeocode);
  const { isAuthenticated } = useConvexAuth();
  const requestCount = useQuery(api.requestCount.getUserRequestCount);
  const activeSubscription = useQuery(api.subscriptions.getActiveSubscription);
  const plans = useQuery(api.subscriptions.getPlans);
  const increaseRequestCount = useMutation(api.requestCount.increaseRequestCountForUser);

  const currentPlan = activeSubscription?.plan
    ? plans?.find((plan) => plan.slug === activeSubscription.plan?.slug)
    : FREE_PLAN;

  const isPremium = currentPlan?.slug === 'premium';
  const requestAllocations = currentPlan?.requestAllocations || FREE_PLAN.requestAllocations;

  const getCurrentLocation = useCallback(async () => {
    try {
      setGettingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisions to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      // Check if we have cached location data first
      const cachedResult = await getLocationData(
        location.coords.latitude,
        location.coords.longitude
      );

      let reverseGeocodeRes;
      if (cachedResult) {
        reverseGeocodeRes = cachedResult;
      } else {
        reverseGeocodeRes = await reverseGeocode({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // Save the result for future use
        await saveLocationData(
          location.coords.latitude,
          location.coords.longitude,
          reverseGeocodeRes
        );

        return reverseGeocodeRes as ReverseGeocodeResult;
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setGettingLocation(false);
    }
  }, [reverseGeocode]);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }

    const loadLocation = async () => {
      const userCurrentLocation = await getLocationData();

      if (userCurrentLocation) {
        setUserLocation({
          city: userCurrentLocation.address?.city,
          country: userCurrentLocation.address?.country,
        });
      } else {
        const locationResult = await getCurrentLocation();

        if (locationResult) {
          setUserLocation({
            city: locationResult.address?.city,
            country: locationResult.address?.country,
          });
        } else {
          Alert.alert('Something went wrong', 'Could not get your current location.', [
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]);
        }
      }
    };

    loadLocation();
  }, [getCurrentLocation, permission, requestPermission]);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo?.uri) {
        setCapturedImage(photo.uri);
        setIsAnalyzing(true);

        // Process scan with credit check (includes delay simulation if credits used up)
        const result = await processScanWithCreditCheck({
          imageUri: photo.uri,
          location: {
            city: userLocation?.city,
            country: userLocation?.country,
          },
          requestCount,
          isPremium,
          requestAllocations,
        });

        setIsAnalyzing(false);

        if (result === 'no-credit') {
          // Credits used up - show upgrade overlay
          setShowUpgradeOverlay(true);
          return;
        }

        // Increment request count after successful scan
        if (isAuthenticated) {
          try {
            await increaseRequestCount();
          } catch (error) {
            console.error('Error incrementing request count:', error);
          }
        }

        setResult(result.scanItem);
        setCapturedImage(result.processedImageUri);

        setShowResult(true);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      setIsAnalyzing(false);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const originalFileName = result.assets[0].fileName || undefined;
        setCapturedImage(imageUri);
        setIsAnalyzing(true);

        // Process scan with credit check (includes delay simulation if credits used up)
        const scanResult = await processScanWithCreditCheck({
          imageUri,
          originalFileName,
          requestCount,
          isPremium,
          requestAllocations,
        });

        setIsAnalyzing(false);

        if (scanResult === 'no-credit') {
          // Credits used up - show upgrade overlay
          setShowUpgradeOverlay(true);
          return;
        }

        // Increment request count after successful scan
        if (isAuthenticated) {
          try {
            await increaseRequestCount();
          } catch (error) {
            console.error('Error incrementing request count:', error);
          }
        }

        setResult(scanResult.scanItem);
        setCapturedImage(scanResult.processedImageUri);

        setShowResult(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setIsAnalyzing(false);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleScanAnother = () => {
    setShowResult(false);
    setShowUpgradeOverlay(false);
    setResult(null);
    setCapturedImage(null);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsAnalyzing(false);
    setResult(null);
    setShowResult(false);
    setShowUpgradeOverlay(false);
  };

  const handleUpgrade = () => {
    setShowUpgradeOverlay(false);
    router.push('/(protected)/subscription');
  };

  const handleCloseUpgrade = () => {
    setShowUpgradeOverlay(false);
    setResult(null);
    setCapturedImage(null);
  };

  const toggleFlash = () => {
    setFlash(flash === 'off' ? 'on' : 'off');
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={{ fontFamily: fontFamily.ManropeRegular }}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {gettingLocation && <LocationOverlay />}
      {!capturedImage ? (
        <View style={styles.cameraViewContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing={facing} flash={flash} />
          <View style={styles.overlay}>
            <View style={styles.topControls}>
              {/* Open Drawer */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => {
                  // @ts-ignore - drawer navigation type
                  navigation.openDrawer();
                }}>
                <Menu size={24} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() =>
                  Alert.alert(
                    'Help',
                    "Point your camera at a product to scan and get it's price estimate."
                  )
                }>
                <HelpCircle size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.framingBox} />

            <View style={styles.bottomControls}>
              {/* Image Picker */}
              <TouchableOpacity style={styles.controlButton} onPress={pickImage}>
                <ImageIcon size={24} color={colors.white} />
              </TouchableOpacity>

              {/* Shutter button */}
              <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>

              {/*  */}
              <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
                <Flashlight
                  size={24}
                  color={colors.white}
                  fill={flash === 'on' ? colors.white : 'none'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          {isAnalyzing && <AnalysisOverlay imageUri={capturedImage} />}
          {!isAnalyzing && (
            <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
              <X size={24} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {showResult && result && !showUpgradeOverlay && (
        <ResultsModal
          item={result}
          visible={showResult}
          onClose={() => setShowResult(false)}
          onScanAnother={handleScanAnother}
          setShowModal={setShowResult}
        />
      )}

      {showUpgradeOverlay && capturedImage && (
        <UpgradeOverlay
          imageUri={capturedImage}
          onUpgrade={handleUpgrade}
          onClose={handleCloseUpgrade}
        />
      )}
    </View>
  );
}
