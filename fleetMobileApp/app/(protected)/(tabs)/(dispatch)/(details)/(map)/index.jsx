/**
 * TODO: 
 *     1.) Get Start location and end location
 */

import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Mapbox from "@rnmapbox/maps";
import Constants from "expo-constants";

Mapbox.setAccessToken(Constants.expoConfig.extra.mapboxPublicToken);

export default function MapPage() {
  useEffect(() => {
    (async () => {
      await Mapbox.requestAndroidLocationPermissions();
    })();
  }, []);

  return (
    <View style={styles.page}>
      <Mapbox.MapView style={styles.map}>
        
        <Mapbox.Camera
          zoomLevel={12}
          followUserLocation
        />
        
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