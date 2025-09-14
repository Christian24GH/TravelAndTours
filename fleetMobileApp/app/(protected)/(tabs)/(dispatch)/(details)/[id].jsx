import { ScrollView, View, ActivityIndicator, Text  } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/custom-ui/button'
import { formatDate, extractAddress } from '@/components/custom-ui/helpers'
import axios from 'axios'
import { logisticsII } from '@/api/logisticsII'
import { useEffect, useState } from "react";
const API = logisticsII.backend.api

export default function DetailPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(API.dispatchesToDriver, {
        params: { dispatch_id: id },
      })
      .then((response) => {
        setData(response.data.dispatch);
      })
      .catch(() => {
        console.log("Failed to fetch dispatch record");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2">Loading...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No data available</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 relative p-4">
        <ScrollView className="flex flex-col flex-1">
            <View className="bg-pink-100 border border-pink-500 p-4 rounded-sm shadow mb-3 ">
                <Text className="text-lg font-bold text-gray-800">
                    Batch: {data.batch_number ?? "N/A"}
                </Text>
                <Text className="text-sm text-gray-500">
                    Dispatch ID: {data.dispatch_uuid}
                </Text>
                <Text className="mt-1 text-sm text-blue-600 font-medium">
                    Status: {data.dispatch_status}
                </Text>
            </View>

            <View className="flex flex-row gap-2">
                <View className="bg-background flex-1 p-4 rounded-sm shadow">
                    <Text className="font-medium">Start Date</Text>
                    <Text className="text-sm mb-3">Start: {formatDate(data.start_time)}</Text>
                    <Text className="font-medium">Pickup Location</Text>
                    <Text className="text-sm ">{extractAddress(data.pickup, 'address')}</Text>
                </View>
                <View className="bg-background flex-1 p-4 rounded-sm shadow">
                    <Text className="font-medium">Start Date</Text>
                    <Text className="text-sm  mb-3">End: {formatDate(data.return_time)}</Text>
                    <Text className="font-medium">Dropoff Location</Text>
                    <Text className="text-sm">{extractAddress(data.dropoff, 'address')}</Text>
                </View>
            </View>

            <View className="p-4 space-y-2 mb-3">
                <Text className="text-base font-semibold text-gray-800">
                Dispatch Information
                </Text>
                <Text className="text-sm mb-3"><Text className="font-medium">Reserved By: </Text> {data.requestor_uuid}</Text>
                <Text className="text-sm"><Text className="font-medium">Purpose: </Text>{data.purpose ?? "Not specified"}</Text>
            </View>
            
            <View className="bg-white p-4 rounded-sm shadow mb-3">
                <Text className="text-base font-semibold text-gray-800">
                Assignment Information
                </Text>
                <Text className="text-sm">Driver: {data.driver_name ?? "No Data"}</Text>
                <Text className="text-sm">
                Vehicle: {data.type ?? "N/A"} - {data.model ?? "N/A"} ({data.capacity ?? "N/A"} Max)
                </Text>
            </View>

        </ScrollView>
        <Button className="rounded-sm shadow bg-indigo-800" label="View Map" 
            onPress={() => router.push({
                pathname: "/(map)/",
                params: { data: JSON.stringify(data) }
            })} />
    </View>
  );
}
