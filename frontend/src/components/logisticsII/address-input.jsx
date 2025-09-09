import { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function AddressInput({ label, name, register, setValue, errors }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Generate a session token per input session
  const [sessionToken] = useState(() => uuidv4());

  const fetchSuggestions = async (value) => {
    if (!value || value.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        "https://api.mapbox.com/search/searchbox/v1/suggest",
        {
          params: {
            q: value,
            access_token: ACCESS_TOKEN,
            session_token: sessionToken,
            limit: 5,
            proximity: "121.0437,14.6760", // optional
            country: "ph",
          },
        }
      );
      console.log(res.data.suggestions)
      setResults(res.data.suggestions || []);
      setActiveIndex(-1);
    } catch (err) {
      console.error("Mapbox suggest error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (suggestion) => {
    try {
      const res = await axios.get(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}`,
        {
          params: {
            access_token: ACCESS_TOKEN,
            session_token: sessionToken,
          },
        }
      );
      
      const feature = res.data.features[0];

      if (!feature) return;
      console.log(feature)
      const locName = feature.properties?.name || "";

      let fullAddress = '';
      if (feature.properties?.name && feature.properties?.full_address) {
        fullAddress = `${feature.properties.name}, ${feature.properties.full_address}`;
      } else if (feature.properties?.name) {
        fullAddress = feature.properties.name;
      } else {
        fullAddress = feature.properties?.full_address || '';
      }

      const coordinates = feature.geometry?.coordinates;

      // Update input display
      setQuery(fullAddress);
      setResults([]);
      setSelected(true);

      // Update form value
      setValue(
        name,
        JSON.stringify({ address: fullAddress, coordinates })
      );
    } catch (err) {
      console.error("Mapbox retrieve error:", err);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelected(false);
    setValue(name, "");

    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => fetchSuggestions(value), 300));
  };

  const handleKeyDown = (e) => {
    if (!focused || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    }
  };

  return (
    <div className="relative flex flex-col gap-2">
      <Label className="font-normal text-secondary-foreground">{label}</Label>
      <div className="relative">
        <Input
          {...register(name, { required: "Address is required" })}
          placeholder={label}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setFocused(true);
            fetchSuggestions(query);
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

      {focused && results.length > 0 && (
        <div className={cn(
          "absolute top-full left-0 z-10 w-full rounded-md mt-1 max-h-56 bg-white overflow-y-auto border shadow-sm"
        )}>
          <ul>
            {results.map((suggestion, i) => (
              <li
                key={suggestion.mapbox_id || i}
                className={cn(
                  "p-2 cursor-pointer text-sm hover:bg-gray-100",
                  activeIndex === i && "bg-gray-100 font-medium"
                )}
                onMouseDown={() => handleSelect(suggestion)}
              >
                {suggestion.name && suggestion.full_address ? `${suggestion.name}, ${suggestion.full_address}` : 
                 suggestion.name ? `${suggestion.name}` :  suggestion.full_address
                }
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
