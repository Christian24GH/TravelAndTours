import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
function Map({ start_cord, end_cord }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || !start_cord || !end_cord) return;

    // If map already exists, remove it before creating a new one
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: start_cord,
      zoom: 13,
    });

    map.current.on("load", async () => {
      try {
        // Request directions from Mapbox Directions API
        const res = await axios.get(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${start_cord[0]},${start_cord[1]};${end_cord[0]},${end_cord[1]}`,
          {
            params: {
              geometries: "geojson",
              access_token: mapboxgl.accessToken,
            },
          }
        );

        const route = res.data.routes[0].geometry;

        // Add route to the map
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: route,
          },
        });

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#007bff", "line-width": 4 },
        });

        // Add start/end points
        map.current.addSource("points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: { type: "Point", coordinates: start_cord },
                properties: { color: "#00ff00" }, // green
              },
              {
                type: "Feature",
                geometry: { type: "Point", coordinates: end_cord },
                properties: { color: "#ff0000" }, // red
              },
            ],
          },
        });

        map.current.addLayer({
          id: "points-layer",
          type: "circle",
          source: "points",
          paint: {
            "circle-radius": 8,
            "circle-color": ["get", "color"],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          },
        });

        // Fit map to route bounds
        const bounds = new mapboxgl.LngLatBounds();
        route.coordinates.forEach((coord) => bounds.extend(coord));
        map.current.fitBounds(bounds, { padding: 50 });
      } catch (error) {
        console.error("Error fetching directions:", error);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [start_cord, end_cord]);

  return <div ref={mapContainer} className="w-full h-full rounded-xl" />;
}


const MemoizedMap = React.memo(Map, (prev, next) => {
  return (
    prev.start_cord?.[0] === next.start_cord?.[0] &&
    prev.start_cord?.[1] === next.start_cord?.[1] &&
    prev.end_cord?.[0] === next.end_cord?.[0] &&
    prev.end_cord?.[1] === next.end_cord?.[1]
  )
})

export default MemoizedMap