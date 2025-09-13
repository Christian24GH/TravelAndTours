import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function Map({ stops, className, geometry }) {
  console.log('Map Mounted')
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || !geometry) return;
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: stops[0],
      zoom: 13,
    });

    map.current.on("load", () => {
      map.current.addSource("route", {
        type: "geojson",
        data: { type: "Feature", geometry },
      });
      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#007bff", "line-width": 4 },
      });

      // Stops
      map.current.addSource("stops", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: stops.map((c, i) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: c },
            properties: { label: `Stop ${i + 1}` },
          })),
        },
      });
      map.current.addLayer({
        id: "stops-layer",
        type: "circle",
        source: "stops",
        paint: {
          "circle-radius": 6,
          "circle-color": "#ff0000",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      const bounds = new mapboxgl.LngLatBounds();
      geometry.coordinates.forEach((coord) => bounds.extend(coord));
      map.current.fitBounds(bounds, { padding: 50 });
    });
  }, [geometry, stops]);

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
