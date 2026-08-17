// Lazy-loads the Bangladesh geo tree from static JSON files served by the
// Cloudflare CDN edge (public/geo/*). Static assets are FREE and unlimited on
// the Workers free plan, and each level only loads what the user needs, so the
// onboarding bundle stays small and huge user counts cost nothing.

export type GeoName = { en: string; bn: string };
export type GeoDistrict = GeoName & { id: string; hasCC: boolean };
export type GeoDivision = GeoName & { id: string; districts: GeoDistrict[] };
export type GeoCCSummary = GeoName & { id: string; wardCount: number };
export type GeoUpazila = GeoName & { id: string; unions: GeoName[]; pourashavas: GeoName[] };
export type GeoDistrictData = GeoName & { id: string; cityCorporations: GeoCCSummary[]; upazilas: GeoUpazila[] };
export type GeoCC = GeoName & { id: string; wardCount: number; wards: { n: number; areas: GeoName[] }[] };

const cache = new Map<string, unknown>();

async function get<T>(url: string): Promise<T> {
  if (cache.has(url)) return cache.get(url) as T;
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  const data = (await res.json()) as T;
  cache.set(url, data);
  return data;
}

const slug = (s: string) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const geoIndex = () => get<{ divisions: GeoDivision[] }>("/geo/index.json");
export const loadDistrict = (id: string) => get<GeoDistrictData>(`/geo/district-${id}.json`);
export const loadCC = (id: string) => get<GeoCC>(`/geo/cc-${id}.json`);

export const geoSlug = slug;
