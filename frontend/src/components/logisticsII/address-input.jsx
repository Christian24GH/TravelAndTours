import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { AlertDescription } from "@/components/ui/alert";
import { Label } from '@/components/ui/label'
const ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function AddressInput({ label, name, register, setValue, errors }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [selected, setSelected] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelected(false);

    setValue(name, "");

    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(
      setTimeout(async () => {
        if (!value || value.length < 3) {
          setResults([]);
          return;
        }
        try {
          const res = await axios.get(
            `https://api.mapbox.com/search/geocode/v6/forward`,
            {
              params: {
                q: value,
                access_token: ACCESS_TOKEN,
                autocomplete: true,
                limit: 5,
              },
            }
          );
          console.log(res)
          setResults(res.data.features);
        } catch (err) {
          console.error("Mapbox error", err);
        }
      }, 400)
    );
  };

  const handleSelect = (feature) => {
    setQuery(feature.properties.full_address);
    setResults([]);
    setSelected(true);
    // Save only valid selection to react-hook-form
    setValue(name, JSON.stringify({
        address:        feature.properties.full_address,
        coordinates:    feature.geometry.coordinates
    }));
  };

  return (
    <div className="relative flex flex-col gap-2">
      <Label className="font-normal text-secondary-foreground">{label}</Label>
      <Input
        {...register(name, { required: "Address is required" })}
        placeholder={label}
        value={query}
        onChange={handleChange}
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

      {results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded shadow mt-1">
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
      )}
    </div>
  );
}
