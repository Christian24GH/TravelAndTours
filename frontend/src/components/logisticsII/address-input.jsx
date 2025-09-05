import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { AlertDescription } from "@/components/ui/alert";
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
const ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function AddressInput({ label, name, register, setValue, errors }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const fetchResults = async (value) => {
    if (!value || value.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.mapbox.com/search/geocode/v6/forward`,
        {
          params: {
            q: value,
            country: "ph",
            access_token: ACCESS_TOKEN,
            autocomplete: true,
            limit: 5,
            types: "address,street,place,neighborhood,locality",
            proximity: "121.0437,14.6760", // lng,lat (e.g., Quezon City)
          },
        }
      );
      setResults(res.data.features);
    } catch (err) {
      console.error("Mapbox error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelected(false);

    setValue(name, "");

    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => fetchResults(value), 400));
  };

  const handleSelect = (feature) => {
    setQuery(feature.properties.full_address);
    setResults([]);
    setSelected(true);

    setValue(
      name,
      JSON.stringify({
        address: feature.properties.full_address,
        coordinates: feature.geometry.coordinates,
      })
    );
  };

  return (
    <div className="relative flex flex-col gap-2">
      <Label className="font-normal text-secondary-foreground">{label}</Label>
      <Input
        {...register(name, { required: "Address is required" })}
        placeholder={label}
        value={query}
        onChange={handleChange}
        onFocus={() => {
          setFocused(true);
          fetchResults(query);
        }}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        autoComplete="off" 
      />

      {!selected && query && (
        <AlertDescription className="text-red-500">
          Please select a valid address from suggestions
        </AlertDescription>
      )}
      {errors[name] && (
        <AlertDescription className="text-red-500">
          {errors[name].message}
        </AlertDescription>
      )}

      
      {focused && (
        <div
          className={`absolute top-full left-0 z-10 w-full rounded mt-1 max-h-56 bg-white overflow-y-auto 
            ${results.length > 0 ? "border shadow" : ""}`}
        >
          {loading ? (
            // Skeleton loader
            <div className="p-2 space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-3/4" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((feature) => (
                <li
                  key={feature.id}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelect(feature)}
                >
                  {feature.properties.full_address}
                </li>
              ))}
            </ul>
          ) : (
            query.length >= 3 && (
              <div className="p-2 text-gray-500">No results found</div>
            )
          )}
        </div>
      )}

    </div>
  );
}
