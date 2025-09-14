/**
 * TODO: 
 *     1.) Get Start location and end location
 */

import React, { useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as NavigationBar from 'expo-navigation-bar';
import { useLocalSearchParams } from 'expo-router';
import Mapbox from "@rnmapbox/maps";
import Constants from "expo-constants";

Mapbox.setAccessToken(Constants.expoConfig.extra.mapboxPublicToken);

import { formatDate, extractAddress } from '@/components/custom-ui/helpers'

export default function MapPage() {
  const { data } = useLocalSearchParams()
  const object = JSON.parse(data)

  console.log(object)
  useEffect(() => {
    (async () => {
      await Mapbox.requestAndroidLocationPermissions();
    })();
    
    NavigationBar.setVisibilityAsync("leanback");
    return () => {
      NavigationBar.setVisibilityAsync("visible");
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="absolute w-full px-4 pt-5 z-50"
      >
        <View className="bg-white gap-2 rounded-md shadow p-2">
          <View className="rounded-sm shadow bg-white p-1">
            <Text>{extractAddress(object.pickup, "address")}</Text>
          </View>
          <View className="rounded-sm shadow bg-white p-1">
            <Text>{extractAddress(object.dropoff, "address")}</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Fullscreen Map */}
      <Mapbox.MapView style={{ flex: 1 }}>
        <Mapbox.Camera zoomLevel={12} followUserLocation />

        <Mapbox.UserLocation
          visible={true}
          onUpdate={(loc) => {
            console.log("User position:", loc.coords);
          }}
        />
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  map: { flex: 1 }
});