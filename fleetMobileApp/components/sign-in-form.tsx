import { SocialConnections } from '@/components/social-connections';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { Pressable, type TextInput, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/context/AuthProvider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react-native';
import * as Device from "expo-device";
import axios from '@/api/axios';


export function SignInForm() {
  const passwordInputRef = React.useRef<TextInput>(null);
  const { reset, control, handleSubmit, formState:{ errors, isSubmitting }, setError, clearErrors } = useForm()
  const { login } = useAuth()
  
  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  const onSubmit = async (data: any) => {
    data = { ...data, device_name: Device.deviceName || 'react-native-expo' };

    try {
      let response = await axios.post('/api/sanctum/token', data);

      //console.log("Response:", response.data);
      
      clearErrors();

      login(response.data)
      //reset()
    } catch (error: any) {
      if (error.response) {
        console.log("Server error:", error.response.data);

        // If backend returns field-specific errors (like { email: ["Invalid"], password: ["Too short"] })
        if (error.response.data.errors) {
          const fieldErrors = error.response.data.errors;
          for (const [field, messages] of Object.entries(fieldErrors)) {
            setError(field as any, {
              type: "Server error",
              message: Array.isArray(messages) ? messages[0] : (messages as string),
            });
          }
        } else if (error.response.data.message) {
          // Generic error message
          setError("root", {
            type: "Server error",
            message: error.response.data.message,
          });
        }
      } else if (error.request) {
        console.log("No response received:", error.request);
        setError("root", {
          type: "Network error",
          message: "No response from server. Please try again.",
        });
      } else {
        console.log("Axios error:", error.message);
        setError("root", {
          type: "Client error",
          message: error.message,
        });
      }
    }
};


  return (
    <View className="gap-6">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Sign in to Joli Travel and Tours</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Welcome back! Please sign in to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent className="gap-6">
          {errors.root && (
            <View>
              <Alert icon={AlertCircleIcon} variant='destructive'>
                <AlertTitle>{errors.root.type}</AlertTitle>
                <AlertDescription>
                  {errors.root.message as string}
                </AlertDescription>
              </Alert>
            </View>
          )}
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "Email is required!",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Invalid email address",
                  },
                }}
                render={({field: {onChange, onBlur, value}}) => (
                   <Input
                    id="email"
                    placeholder="Enter your email address"
                    keyboardType="email-address"
                    autoComplete="email"
                    autoCapitalize="none"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    onSubmitEditing={onEmailSubmitEditing}
                    returnKeyType="next"
                    submitBehavior="submit"
                  />
                )}
              />
              {errors.email && (
                <Text className="text-red-500 text-sm">{errors.email.message as string}</Text>
              )}
            </View>
            <View className="gap-1.5">
              <View className="flex-row items-center">
                <Label htmlFor="password">Password</Label>
                {/**
                <Button
                  variant="link"
                  size="sm"
                  className="web:h-fit ml-auto h-4 px-1 py-0 sm:h-4"
                  onPress={() => {
                    // TODO: Navigate to forgot password screen
                  }}>
                  <Text className="font-normal leading-4">Forgot your password?</Text>
                </Button>
                 */}
              </View>
              <Controller
                control={control}
                name="password"
                rules={{ required: "Password is required" }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    ref={passwordInputRef}
                    id="password"
                    secureTextEntry
                    returnKeyType="send"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />
              {errors.password && (
                <Text className="text-red-500 text-sm">{errors.password.message as string}</Text>
              )}
            </View>
            <Button className="w-full" onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
              <Text>{isSubmitting ? "Signing in..." : "Continue"}</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
