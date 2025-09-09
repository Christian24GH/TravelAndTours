import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import axios from 'axios'
import { logisticsII } from '@/api/logisticsII'
import { useAuth } from '@/context/AuthProvider'
import { Link } from 'expo-router';

const API = logisticsII.backend.api


export default function DispatchPage() {
  const { session } = useAuth();

  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const handleSearch = (text) => {
    setSearch(text);

    if (!text) {
      setFilteredData(data);
      return;
    }

    const newData = (data || []).filter((item) =>
      item?.batch_number?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredData(newData);
  };

  useEffect(() => {
    const fetchRecord = () => {
      if (!session?.uuid) return;
      axios
        .get(API.dispatchesToDriver, {
          params: { driver_uuid: session.uuid },
        })
        .then((response) => {
          const dispatchData = response.data?.dispatch ?? [];
          setData(dispatchData);
          setFilteredData(dispatchData);
        })
        .catch((error) => {
          console.log("Failed to fetch dispatch record", error);
        });
    };

    fetchRecord(); // fetch immediately
    const polling = setInterval(fetchRecord, 5000);

    return () => clearInterval(polling);
  }, [session?.uuid]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        value={search}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredData}
        keyExtractor={(item) => String(item.dispatch_id)}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No dispatch records found
          </Text>
        }
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: `(details)/[id]`,
              params: { id: item.dispatch_id },
            }}
            asChild
          >
            <TouchableOpacity style={styles.item}>
              <Text style={styles.text}>{item.batch_number}</Text>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  searchBar: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});