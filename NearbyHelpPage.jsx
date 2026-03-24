import { useMemo, useState } from "react";
import { ExternalLink, MapPin, Search } from "lucide-react";

const supportCategories = [
  "mental health center",
  "hospital",
  "counselor",
  "therapy clinic",
];

export default function NearbyHelpPage() {
  const [locationInput, setLocationInput] = useState("Bengaluru");
  const [activeLocation, setActiveLocation] = useState("Bengaluru");

  const mapUrl = useMemo(() => {
    return `https://maps.google.com/maps?q=${encodeURIComponent(
      `${activeLocation} mental health support`
    )}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  }, [activeLocation]);

  const handleSearch = () => {
    const trimmed = locationInput.trim();
    if (trimmed) {
      setActiveLocation(trimmed);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h1 className="mb-2 text-3xl font-bold text-ink">Nearby Help</h1>
        <p className="text-slate-600">
          Search a city or area to view nearby hospitals, counselors, and mental
          health support options on the map.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card overflow-hidden p-4">
          <div className="mb-4 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                className="soft-input pl-11"
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                placeholder="Search city or area"
              />
            </div>
            <button onClick={handleSearch} className="primary-btn whitespace-nowrap">
              Find Nearby Support
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-sky-100">
            <iframe
              title="Nearby mental health support map"
              src={mapUrl}
              width="100%"
              height="520"
              className="block border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="mb-2 text-xl font-semibold text-ink">Support Search Links</h2>
          <p className="mb-4 text-sm text-slate-500">
            Open a focused Google Maps search for {activeLocation}.
          </p>

          <div className="space-y-3">
            {supportCategories.map((category) => {
              const query = `${category} near ${activeLocation}`;

              return (
                <a
                  key={category}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start justify-between rounded-2xl bg-slate-50 p-4 transition hover:bg-sky-50"
                >
                  <div>
                    <p className="font-semibold capitalize text-ink">{category}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Find {category} options in {activeLocation}
                    </p>
                  </div>
                  <ExternalLink size={18} className="mt-1 text-bloom" />
                </a>
              );
            })}
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `nearest hospital near ${activeLocation}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-calm to-bloom px-5 py-3 font-semibold text-white"
          >
            <MapPin size={18} />
            Navigate To Nearest Hospital
          </a>
        </div>
      </div>
    </div>
  );
}



