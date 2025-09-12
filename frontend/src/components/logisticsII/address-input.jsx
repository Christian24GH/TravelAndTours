import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function AddressInput({
  label,
  name,
  register,
  setValue,
  errors,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // track keyboard navigation

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
            proximity: "121.0437,14.6760", // lng,lat (Quezon City proximity)
          },
        }
      );
      setResults(res.data.features);
      setActiveIndex(-1);
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

  const handleKeyDown = (e) => {
    if (!focused || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? results.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    }
  };

  return (
    <div className="relative flex flex-col gap-2">
      <Label className="font-normal text-secondary-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          {...register(name, { required: "Address is required" })}
          placeholder={label}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setFocused(true);
            fetchResults(query);
          }}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          autoComplete="off"
          className="pr-8"
        />
        {loading && (
          <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {!selected && query && (
        <AlertDescription className="text-red-500 text-xs">
          Please select a valid address from suggestions
        </AlertDescription>
      )}
      {errors[name] && (
        <AlertDescription className="text-red-500 text-xs">
          {errors[name].message}
        </AlertDescription>
      )}

      {focused && (
        <div
          className={cn(
            "absolute top-full left-0 z-10 w-full rounded-md mt-1 max-h-56 bg-white overflow-y-auto",
            results.length > 0 ? "border shadow-sm" : ""
          )}
        >
          {loading ? (
            <div className="p-2 space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-3/4" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((feature, i) => (
                <li
                  key={feature.id}
                  className={cn(
                    "p-2 cursor-pointer text-sm",
                    "hover:bg-gray-100",
                    activeIndex === i && "bg-gray-100 font-medium"
                  )}
                  onMouseDown={() => handleSelect(feature)} // onMouseDown so blur doesn't fire first
                >
                  {feature.properties.full_address}
                </li>
              ))}
            </ul>
          ) : (
            query.length >= 3 && (
              <div className="p-2 text-gray-500 text-sm">
                No results found
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
