import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { MapPin } from 'lucide-react-native';
import { colors } from '../styles/colors';
import { styles } from 'styles/overlays/location-overlay';

export function LocationOverlay() {
  return (
    <View style={styles.container}>
      <BlurView intensity={20} style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        <MapPin size={32} color={colors.black} />
        <ActivityIndicator size="large" color={colors.black} style={styles.spinner} />
        <Text style={styles.title}>Getting Location...</Text>
        <Text style={styles.subtitle}>Fetching your location for accurate pricing</Text>
      </View>
    </View>
  );
}
