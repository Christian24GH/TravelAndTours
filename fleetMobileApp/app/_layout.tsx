import '@/global.css';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { PortalHost } from '@rn-primitives/portal';

import { AuthProvider } from '@/context/AuthProvider'

import { Stack } from 'expo-router';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  return(
    <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <AuthProvider>
          <Stack>
            <Stack.Screen name='(protected)'
              options={{headerShown:false}}
            />
            <Stack.Screen name='sign-in'
              options={{headerShown:false}}
            />
          </Stack>
        </AuthProvider>
        <PortalHost/>
    </ThemeProvider>
  ) 
}
