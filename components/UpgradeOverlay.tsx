import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Crown } from 'lucide-react-native';
import { colors } from '../styles/colors';
import { styles } from 'styles/overlays/upgrade-overlay';

interface UpgradeOverlayProps {
  imageUri: string;
  onUpgrade: () => void;
  onClose: () => void;
}

export function UpgradeOverlay({ imageUri, onUpgrade, onClose }: UpgradeOverlayProps) {
  return (
    <View style={styles.container}>
      <BlurView intensity={20} style={StyleSheet.absoluteFill}>
        <Image source={{ uri: imageUri }} style={styles.backgroundImage} blurRadius={10} />
      </BlurView>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Crown size={48} color={colors.success} fill={colors.success} />
        </View>
        <Text style={styles.title}>You&apos;ve Used All Your Free Scans</Text>
        <Text style={styles.subtitle}>
          Upgrade to Premium to get unlimited scans and unlock all features
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
