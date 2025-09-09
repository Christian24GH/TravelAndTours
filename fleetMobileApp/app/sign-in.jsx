import { SignInForm } from '@/components/sign-in-form';
import { View, KeyboardAvoidingView, Platform, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function LoginPage() {
  return (
     <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <View style={{ width: "100%", paddingHorizontal: 16 }}>
          <SignInForm />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function TiledBackground({children}) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/ironpattern.png")} // your small image
        style={StyleSheet.absoluteFill} // fill the screen
        resizeMode="repeat"
      />
      
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});