import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function Map({ stops, className, geometry }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]); // track markers so we can clean them up

  useEffect(() => {
    if (!mapContainer.current || !geometry) return;

    // cleanup old map before re-init
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    // init map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      //style: "mapbox://styles/mapbox/streets-v12",
      center: stops[0], // must be [lng, lat]
      zoom: 13,
    });

    map.current.on("load", () => {
      // route
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

      // add markers for stops
      stops.forEach((coord, i) => {
        const popup = new mapboxgl.Popup({ offset: 25 }).setText(
          `Stop ${i + 1}`
        );

        const marker = new mapboxgl.Marker()
          .setLngLat(coord)
          .setPopup(popup)
          .addTo(map.current);

        markersRef.current.push(marker);
      });

      // fix bounds for MultiLineString
      const bounds = new mapboxgl.LngLatBounds();
      if (geometry.type === "MultiLineString") {
        geometry.coordinates.forEach((line) => {
          line.forEach((coord) => bounds.extend(coord));
        });
      } else if (geometry.type === "LineString") {
        geometry.coordinates.forEach((coord) => bounds.extend(coord));
      }
      map.current.fitBounds(bounds, { padding: 50 });
    });

    return () => {
      // cleanup markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [geometry, stops]);

  return <div ref={mapContainer} className={className} />;
}

const MemoizedMap = React.memo(Map, (prev, next) => {
  return (
    JSON.stringify(prev.stops) === JSON.stringify(next.stops) &&
    JSON.stringify(prev.geometry) === JSON.stringify(next.geometry)
  );
});

export default MemoizedMap;
