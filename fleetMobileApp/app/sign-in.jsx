import { SignInForm } from '@/components/sign-in-form';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function LoginPage() {
  return (
    <SafeAreaView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
      keyboardDismissMode="interactive"
      style={{
        flex:1,
        justifyContent: "center",
      }}>
      <View>
        <SignInForm />
      </View>
    </SafeAreaView>
  );
}