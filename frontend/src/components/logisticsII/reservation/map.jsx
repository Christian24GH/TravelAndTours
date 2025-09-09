import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function Map({ start_cord, end_cord, className, geometry  }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || !geometry) return;

    // Destroy old map
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    // Create map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: start_cord, // placeholder
      zoom: 13,        // placeholder
    });

    map.current.on("load", () => {
      // === 1. Add route from backend ===
      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry, // directly use backend geometry
        },
      });

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#007bff", "line-width": 4 },
      });

      // === 2. Add pickup/dropoff markers ===
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

      // === 3. Fit map to route bounds ===
      const bounds = new mapboxgl.LngLatBounds();
      geometry.coordinates.forEach((coord) => bounds.extend(coord));
      map.current.fitBounds(bounds, { padding: 50 });
    });
  }, [geometry, start_cord, end_cord]);

  return <div ref={mapContainer} className={className} />;
}

const MemoizedMap = React.memo(Map, (prev, next) => {
  return (
    prev.start_cord?.[0] === next.start_cord?.[0] &&
    prev.start_cord?.[1] === next.start_cord?.[1] &&
    prev.end_cord?.[0] === next.end_cord?.[0] &&
    prev.end_cord?.[1] === next.end_cord?.[1]
  );
});

export default MemoizedMap;
