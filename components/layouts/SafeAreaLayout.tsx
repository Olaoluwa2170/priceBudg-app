import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, ViewStyle } from 'react-native';

interface SafeAreaLayoutProps {
  children: React.ReactNode;
  bgColor?: ViewStyle['backgroundColor'];
  paddingTop?: number;
  paddingBottom?: ViewStyle['paddingBottom'];
  paddingLeft?: number;
  paddingRight?: number;
}

const SafeAreaLayout = ({
  children,
  bgColor,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
}: SafeAreaLayoutProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: bgColor ?? 'white',
        paddingTop: paddingTop ?? insets.top,
        paddingLeft: paddingLeft ?? insets.left,
        paddingRight: paddingRight ?? insets.right,
        paddingBottom: paddingBottom ?? insets.bottom,
      }}>
      {children}
    </View>
  );
};

export default SafeAreaLayout;
