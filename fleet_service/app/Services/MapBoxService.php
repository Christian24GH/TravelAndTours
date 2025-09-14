<?php
namespace App\Services;
use Illuminate\Support\Facades\Http;

class MapboxService
{
    public static function getRoute($startLng, $startLat, $endLng, $endLat)
    {
        $url = "https://api.mapbox.com/directions/v5/mapbox/driving/{$startLng},{$startLat};{$endLng},{$endLat}";

        $response = Http::get($url, [
            'geometries' => 'geojson',
            'overview' => 'full',
            'access_token' => config('services.mapbox.token'),
        ]);

        if ($response->failed()) {
            throw new \Exception("Mapbox API error: " . $response->body());
        }

        $data = $response->json();
        $route = $data['routes'][0] ?? null;

        return [
            'distance' => $route['distance'], // meters
            'duration' => $route['duration'], // seconds
            'geometry' => $route['geometry'], // GeoJSON for frontend
        ];
    }
}
