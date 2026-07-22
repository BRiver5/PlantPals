/**
 * Built-in plant catalog (45 species) bundled with the app.
 *
 * This is static reference data used to pre-fill new plants, so it ships inside
 * the app and works fully offline — no backend request required. It is kept in
 * sync with the server seed in backend/app/seed.py.
 */
import type { PlantSpecies } from '@/types/models';

export const PLANT_CATALOG: PlantSpecies[] = [
  {
    id: 1,
    common_name: "Snake Plant",
    scientific_name: "Dracaena trifasciata",
    default_interval_days: 14,
    default_water_amount_ml: 200,
    light: "Low to bright",
    difficulty: "Very easy",
    care_tip: "Let the soil dry out completely between waterings; overwatering is the main cause of rot."
  },
  {
    id: 2,
    common_name: "Pothos",
    scientific_name: "Epipremnum aureum",
    default_interval_days: 7,
    default_water_amount_ml: 250,
    light: "Low to bright",
    difficulty: "Very easy",
    care_tip: "Water when the top inch of soil is dry. Trails happily and forgives missed waterings."
  },
  {
    id: 3,
    common_name: "ZZ Plant",
    scientific_name: "Zamioculcas zamiifolia",
    default_interval_days: 14,
    default_water_amount_ml: 200,
    light: "Low to bright",
    difficulty: "Very easy",
    care_tip: "Stores water in its rhizomes, so water sparingly and never let it sit in a soggy pot."
  },
  {
    id: 4,
    common_name: "Spider Plant",
    scientific_name: "Chlorophytum comosum",
    default_interval_days: 7,
    default_water_amount_ml: 250,
    light: "Bright indirect",
    difficulty: "Very easy",
    care_tip: "Keep soil lightly moist. Sends out babies you can pot up once they have roots."
  },
  {
    id: 5,
    common_name: "Peace Lily",
    scientific_name: "Spathiphyllum wallisii",
    default_interval_days: 5,
    default_water_amount_ml: 300,
    light: "Low to medium",
    difficulty: "Easy",
    care_tip: "Droops dramatically when thirsty, then perks up after watering. Enjoys higher humidity."
  },
  {
    id: 6,
    common_name: "Monstera Deliciosa",
    scientific_name: "Monstera deliciosa",
    default_interval_days: 7,
    default_water_amount_ml: 400,
    light: "Bright indirect",
    difficulty: "Easy",
    care_tip: "Water when the top 2 inches are dry. Give it a moss pole to climb for bigger leaves."
  },
  {
    id: 7,
    common_name: "Fiddle Leaf Fig",
    scientific_name: "Ficus lyrata",
    default_interval_days: 9,
    default_water_amount_ml: 500,
    light: "Bright indirect",
    difficulty: "Moderate",
    care_tip: "Hates change and soggy roots. Water on a steady schedule and keep out of cold drafts."
  },
  {
    id: 8,
    common_name: "Rubber Plant",
    scientific_name: "Ficus elastica",
    default_interval_days: 9,
    default_water_amount_ml: 400,
    light: "Bright indirect",
    difficulty: "Easy",
    care_tip: "Let the top inch dry out. Wipe the glossy leaves to keep them dust-free and shining."
  },
  {
    id: 9,
    common_name: "Chinese Money Plant",
    scientific_name: "Pilea peperomioides",
    default_interval_days: 7,
    default_water_amount_ml: 200,
    light: "Bright indirect",
    difficulty: "Easy",
    care_tip: "Water when the leaves start to droop slightly. Rotate often for an even, round shape."
  },
  {
    id: 10,
    common_name: "Aloe Vera",
    scientific_name: "Aloe barbadensis miller",
    default_interval_days: 14,
    default_water_amount_ml: 200,
    light: "Bright direct",
    difficulty: "Very easy",
    care_tip: "A succulent � soak thoroughly, then let it dry fully. Bright light keeps it compact."
  },
  {
    id: 11,
    common_name: "Jade Plant",
    scientific_name: "Crassula ovata",
    default_interval_days: 14,
    default_water_amount_ml: 150,
    light: "Bright direct",
    difficulty: "Easy",
    care_tip: "Water only when the soil is bone dry. Wrinkled leaves mean it is finally thirsty."
  },
  {
    id: 12,
    common_name: "Echeveria",
    scientific_name: "Echeveria elegans",
    default_interval_days: 12,
    default_water_amount_ml: 100,
    light: "Bright direct",
    difficulty: "Easy",
    care_tip: "Water at the base, not the rosette. Loves sun and very well-draining soil."
  },
  {
    id: 13,
    common_name: "String of Pearls",
    scientific_name: "Curio rowleyanus",
    default_interval_days: 12,
    default_water_amount_ml: 120,
    light: "Bright indirect",
    difficulty: "Moderate",
    care_tip: "Water when the pearls look slightly deflated. Shallow pots suit its fine roots."
  },
  {
    id: 14,
    common_name: "Boston Fern",
    scientific_name: "Nephrolepis exaltata",
    default_interval_days: 4,
    default_water_amount_ml: 300,
    light: "Medium indirect",
    difficulty: "Moderate",
    care_tip: "Keep consistently moist and mist often � it turns crispy in dry air."
  },
  {
    id: 15,
    common_name: "Bird's Nest Fern",
    scientific_name: "Asplenium nidus",
    default_interval_days: 5,
    default_water_amount_ml: 250,
    light: "Medium indirect",
    difficulty: "Easy",
    care_tip: "Water the soil around the rosette, never into the center crown. Likes humidity."
  },
  {
    id: 16,
    common_name: "Calathea Orbifolia",
    scientific_name: "Goeppertia orbifolia",
    default_interval_days: 5,
    default_water_amount_ml: 250,
    light: "Medium indirect",
    difficulty: "Moderate",
    care_tip: "Fussy about water quality � use filtered or rainwater and keep soil evenly moist."
  },
  {
    id: 17,
    common_name: "Prayer Plant",
    scientific_name: "Maranta leuconeura",
    default_interval_days: 5,
    default_water_amount_ml: 200,
    light: "Medium indirect",
    difficulty: "Moderate",
    care_tip: "Folds its leaves up at night. Keep soil moist and humidity high for flat, happy leaves."
  },
  {
    id: 18,
    common_name: "Red Prayer Plant",
    scientific_name: "Maranta leuconeura erythroneura",
    default_interval_days: 5,
    default_water_amount_ml: 150,
    light: "Medium indirect",
    difficulty: "Moderate",
    care_tip: "Loves humidity and filtered water. Brown leaf edges signal dry air or tap-water minerals."
  },
  {
    id: 19,
    common_name: "Kentia Palm",
    scientific_name: "Howea forsteriana",
    default_interval_days: 9,
    default_water_amount_ml: 500,
    light: "Bright indirect",
    difficulty: "Easy",
    care_tip: "Let the top inch dry between waterings. Tolerates lower light better than most palms."
  },
  {
    id: 20,
    common_name: "Areca Palm",
    scientific_name: "Dypsis lutescens",
    default_interval_days: 6,
    default_water_amount_ml: 500,
    light: "Bright indirect",
    difficulty: "Moderate",
    care_tip: "Keep lightly moist and never fully dry. Brown tips usually mean the air is too dry."
  },
  {
    id: 21,
    common_name: "Parlor Palm",
    scientific_name: "Chamaedorea elegans",
    default_interval_days: 8,
    default_water_amount_ml: 300,
    light: "Low to medium",
    difficulty: "Easy",
    care_tip: "Water when the surface feels dry. Happy in lower light where other palms sulk."
  },
  {
    id: 22,
    common_name: "Ponytail Palm",
    scientific_name: "Beaucarnea recurvata",
    default_interval_days: 18,
    default_water_amount_ml: 200,
    light: "Bright direct",
    difficulty: "Very easy",
    care_tip: "Stores water in its swollen base � water deeply but rarely, like a succulent."
  },
  {
    id: 23,
    common_name: "Philodendron Heartleaf",
    scientific_name: "Philodendron hederaceum",
    default_interval_days: 7,
    default_water_amount_ml: 250,
    light: "Low to bright",
    difficulty: "Very easy",
    care_tip: "Water when the top inch is dry. Trails or climbs and shrugs off neglect."
  },
  {
    id: 24,
    common_name: "Philodendron Birkin",
    scientific_name: "Philodendron 'Birkin'",
    default_interval_days: 7,
    default_water_amount_ml: 250,
    light: "Bright indirect",
    difficulty: "Easy",
    care_tip: "Keep lightly moist. Its white pinstripes get bolder in brighter indirect light."
  },
  {
    id: 25,
    common_name: "Dracaena Marginata",
    scientific_name: "Dracaena marginata",
    default_interval_days: 10,
    default_water_amount_ml: 300,
    light: "Low to bright",
    difficulty: "Easy",
    care_tip: "Sensitive to fluoride � use filtered water. Let the top half of the soil dry out."
  },
  {
    id: 26,
    common_name: "Dumb Cane",
    scientific_name: "Dieffenbachia seguine",
    default_interval_days: 7,
    default_water_amount_ml: 300,
    light: "Medium indirect",
    difficulty: "Easy",
    care_tip: "Keep evenly moist in the growing season. Sap is irritating, so keep away from pets."
  },
  {
    id: 27,
    common_name: "Croton",
    scientific_name: "Codiaeum variegatum",
    default_interval_days: 6,
    default_water_amount_ml: 300,
    light: "Bright indirect",
    difficulty: "Moderate",
    care_tip: "Keep soil lightly moist and humidity high. More light means more vivid leaf color."
  },
  {
    id: 28,
    common_name: "Anthurium",
    scientific_name: "Anthurium andraeanum",
    default_interval_days: 6,
    default_water_amount_ml: 250,
    light: "Bright indirect",
    difficulty: "Moderate",
    care_tip: "Water when the top inch is dry. Blooms best with bright light and steady humidity."
  },
  {
    id: 29,
    common_name: "Orchid (Phalaenopsis)",
    scientific_name: "Phalaenopsis spp.",
    default_interval_days: 7,
    default_water_amount_ml: 150,
    light: "Bright indirect",
    difficulty: "Moderate",
    care_tip: "Water by soaking the bark weekly, then draining fully. Roots should never stay wet."
  },
  {
    id: 30,
    common_name: "African Violet",
    scientific_name: "Streptocarpus ionanthus",
    default_interval_days: 6,
    default_water_amount_ml: 100,
    light: "Bright indirect",
    difficulty: "Moderate",
    care_tip: "Water from below with room-temperature water; wet leaves spot. Avoid direct sun."
  },
  {
    id: 31,
    common_name: "Begonia Maculata",
    scientific_name: "Begonia maculata",
    default_interval_days: 6,
    default_water_amount_ml: 200,
    light: "Bright indirect",
    difficulty: "Moderate",
    care_tip: "Let the top inch dry slightly. Water at the base to keep the polka-dot leaves dry."
  },
  {
    id: 32,
    common_name: "English Ivy",
    scientific_name: "Hedera helix",
    default_interval_days: 6,
    default_water_amount_ml: 200,
    light: "Medium indirect",
    difficulty: "Easy",
    care_tip: "Keep lightly moist and cool. Mist in dry rooms to discourage spider mites."
  },
  {
    id: 33,
    common_name: "Swiss Cheese Vine",
    scientific_name: "Monstera adansonii",
    default_interval_days: 6,
    default_water_amount_ml: 250,
    light: "Bright indirect",
    difficulty: "Easy",
    care_tip: "Water when the top inch dries. Provide a trellis or let it trail from a shelf."
  },
  {
    id: 34,
    common_name: "Nerve Plant",
    scientific_name: "Fittonia albivenis",
    default_interval_days: 3,
    default_water_amount_ml: 120,
    light: "Medium indirect",
    difficulty: "Moderate",
    care_tip: "Dramatic wilter � keep soil consistently moist and humidity high, and it stays perky."
  },
  {
    id: 35,
    common_name: "Peperomia",
    scientific_name: "Peperomia obtusifolia",
    default_interval_days: 9,
    default_water_amount_ml: 150,
    light: "Medium indirect",
    difficulty: "Very easy",
    care_tip: "Semi-succulent leaves store water, so let the soil dry out well before watering."
  },
  {
    id: 36,
    common_name: "Cast Iron Plant",
    scientific_name: "Aspidistra elatior",
    default_interval_days: 12,
    default_water_amount_ml: 300,
    light: "Low light",
    difficulty: "Very easy",
    care_tip: "Nearly indestructible. Water when the top inch is dry and tolerates deep shade."
  },
  {
    id: 37,
    common_name: "Chinese Evergreen",
    scientific_name: "Aglaonema commutatum",
    default_interval_days: 8,
    default_water_amount_ml: 250,
    light: "Low to medium",
    difficulty: "Very easy",
    care_tip: "Water when the top inch is dry. Handles low light and irregular watering gracefully."
  },
  {
    id: 38,
    common_name: "Dracaena Lemon Lime",
    scientific_name: "Dracaena fragrans 'Lemon Lime'",
    default_interval_days: 10,
    default_water_amount_ml: 300,
    light: "Low to bright",
    difficulty: "Easy",
    care_tip: "Use filtered water to avoid tip burn. Let the top third of the soil dry out."
  },
  {
    id: 39,
    common_name: "Umbrella Tree",
    scientific_name: "Schefflera arboricola",
    default_interval_days: 8,
    default_water_amount_ml: 350,
    light: "Bright indirect",
    difficulty: "Easy",
    care_tip: "Water when the top inch is dry. Leggy growth means it wants more light."
  },
  {
    id: 40,
    common_name: "Norfolk Island Pine",
    scientific_name: "Araucaria heterophylla",
    default_interval_days: 7,
    default_water_amount_ml: 300,
    light: "Bright indirect",
    difficulty: "Moderate",
    care_tip: "Keep evenly moist and humid. Dropping needles usually mean dry air or dry soil."
  },
  {
    id: 41,
    common_name: "Christmas Cactus",
    scientific_name: "Schlumbergera bridgesii",
    default_interval_days: 10,
    default_water_amount_ml: 150,
    light: "Bright indirect",
    difficulty: "Easy",
    care_tip: "Water when the top inch is dry � more than a desert cactus, less than a fern."
  },
  {
    id: 42,
    common_name: "Air Plant",
    scientific_name: "Tillandsia ionantha",
    default_interval_days: 5,
    default_water_amount_ml: 50,
    light: "Bright indirect",
    difficulty: "Easy",
    care_tip: "No soil needed � soak in water for 20 minutes weekly, then dry fully upside down."
  },
  {
    id: 43,
    common_name: "Succulent Mix",
    scientific_name: "Assorted succulents",
    default_interval_days: 14,
    default_water_amount_ml: 100,
    light: "Bright direct",
    difficulty: "Very easy",
    care_tip: "Soak thoroughly, then let the soil dry completely. Bright light prevents stretching."
  },
  {
    id: 44,
    common_name: "Money Tree",
    scientific_name: "Pachira aquatica",
    default_interval_days: 9,
    default_water_amount_ml: 300,
    light: "Bright indirect",
    difficulty: "Easy",
    care_tip: "Water when the top 2 inches are dry. Braided trunks like steady, moderate moisture."
  },
  {
    id: 45,
    common_name: "Hoya",
    scientific_name: "Hoya carnosa",
    default_interval_days: 12,
    default_water_amount_ml: 200,
    light: "Bright indirect",
    difficulty: "Easy",
    care_tip: "Let it dry out between waterings. Do not cut off old bloom spurs � they reflower."
  }
];

/** Case-insensitive search over common and scientific names. */
export function searchCatalog(query: string): PlantSpecies[] {
  const q = query.trim().toLowerCase();
  if (!q) return PLANT_CATALOG;
  return PLANT_CATALOG.filter(
    (s) =>
      s.common_name.toLowerCase().includes(q) ||
      (s.scientific_name ?? '').toLowerCase().includes(q),
  );
}
