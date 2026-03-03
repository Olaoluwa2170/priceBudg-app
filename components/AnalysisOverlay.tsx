import { StyleSheet, View, Text, ActivityIndicator, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../styles/colors';
import { styles } from 'styles/overlays/analysis-overlay';

interface AnalysisOverlayProps {
  imageUri: string;
}

export function AnalysisOverlay({ imageUri }: AnalysisOverlayProps) {
  return (
    <View style={styles.container}>
      <BlurView intensity={20} style={StyleSheet.absoluteFill}>
        <Image source={{ uri: imageUri }} style={styles.backgroundImage} blurRadius={10} />
      </BlurView>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.black} />
        <Text style={styles.title}>Analyzing...</Text>
        <Text style={styles.subtitle}>Identifying object and searching current prices...</Text>
      </View>
    </View>
  );
}
