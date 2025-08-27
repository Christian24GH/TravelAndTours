import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, StyleSheet, Button, Platform  } from 'react-native'
import {  router } from "expo-router";
import { useLocalSearchParams } from 'expo-router';

import axios from 'axios'
import { logisticsII } from '@/api/logisticsII'
import { useEffect, useState } from "react";

import { Text } from '@/components/ui/text';

const API = logisticsII.backend.api


export default function DetailPage(){
    const { id } = useLocalSearchParams()
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true)
   
    useEffect(()=>{
        setLoading(true)
        axios.get(API.dispatchesToDriver, {
            params: {
                dispatch_id: id
            }
        })
        .then(response=>{
            let data = response.data.dispatch
            console.log(data)
            setData(data)
        })
        .catch(error=>{
            console.log('Failed to fetch dispatch record')
        }).finally(()=>{
            setLoading(false)
        })
    }, []);


    return(
        <ScrollView>
            {loading ? (
                <Text>Loading</Text>
            ) : (
                <>
                <View>
                    <Text className="font-medium">{data.uuid ?? 'No Data'}</Text>
                </View>

                <View>
                    <Text className="font-medium">Status</Text>
                    <Text>{data.status  ?? 'No Data'}</Text>
                </View>

                <View>
                    <Text className="font-medium">Dispatch Information</Text>
                    <View className="flex-col gap-1">
                    <Text>Reserved By: {data.employee_id  ?? 'No Data'}</Text>
                    <Text>Start Date: {data.dispatch_time  ?? 'No Data'}</Text>
                    <Text>End Date: {data.end_date  ?? 'No Data'}</Text>
                    <Text>Pick up: {data.pickup  ?? 'No Data'}</Text>
                    <Text>Drop off: {data.dropoff  ?? 'No Data'}</Text>
                    <Text>Purpose: {data.purpose ?? "Not specified"}</Text>
                    </View>
                </View>

                <View>
                    <Text className="font-medium">Assignment Information</Text>
                    <View className="flex-col gap-1">
                    <Text>Assigned To: {data.name  ?? 'No Data'}</Text>
                    <Text>
                        Reserved Vehicle: {data.vin ?? 'No Data'}, {data.type ?? 'No Data'} ({data.capacity ?? 'No Data'})
                    </Text>
                    </View>
                </View>

                <Button
                    title="Go to Maps"
                    onPress={() => router.push("/(map)/")}
                    />
                </>
            )}
        </ScrollView>
    )
}