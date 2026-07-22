"""Built-in catalog of common houseplants (seeded on startup).

Watering intervals are sensible indoor-average defaults; users can adjust per plant.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import PlantSpecies

# (common_name, scientific_name, interval_days, water_ml, light, difficulty, care_tip)
CATALOG: list[tuple[str, str, int, int, str, str, str]] = [
    ("Snake Plant", "Dracaena trifasciata", 14, 200, "Low to bright", "Very easy",
     "Let the soil dry out completely between waterings; overwatering is the main cause of rot."),
    ("Pothos", "Epipremnum aureum", 7, 250, "Low to bright", "Very easy",
     "Water when the top inch of soil is dry. Trails happily and forgives missed waterings."),
    ("ZZ Plant", "Zamioculcas zamiifolia", 14, 200, "Low to bright", "Very easy",
     "Stores water in its rhizomes, so water sparingly and never let it sit in a soggy pot."),
    ("Spider Plant", "Chlorophytum comosum", 7, 250, "Bright indirect", "Very easy",
     "Keep soil lightly moist. Sends out babies you can pot up once they have roots."),
    ("Peace Lily", "Spathiphyllum wallisii", 5, 300, "Low to medium", "Easy",
     "Droops dramatically when thirsty, then perks up after watering. Enjoys higher humidity."),
    ("Monstera Deliciosa", "Monstera deliciosa", 7, 400, "Bright indirect", "Easy",
     "Water when the top 2 inches are dry. Give it a moss pole to climb for bigger leaves."),
    ("Fiddle Leaf Fig", "Ficus lyrata", 9, 500, "Bright indirect", "Moderate",
     "Hates change and soggy roots. Water on a steady schedule and keep out of cold drafts."),
    ("Rubber Plant", "Ficus elastica", 9, 400, "Bright indirect", "Easy",
     "Let the top inch dry out. Wipe the glossy leaves to keep them dust-free and shining."),
    ("Chinese Money Plant", "Pilea peperomioides", 7, 200, "Bright indirect", "Easy",
     "Water when the leaves start to droop slightly. Rotate often for an even, round shape."),
    ("Aloe Vera", "Aloe barbadensis miller", 14, 200, "Bright direct", "Very easy",
     "A succulent — soak thoroughly, then let it dry fully. Bright light keeps it compact."),
    ("Jade Plant", "Crassula ovata", 14, 150, "Bright direct", "Easy",
     "Water only when the soil is bone dry. Wrinkled leaves mean it is finally thirsty."),
    ("Echeveria", "Echeveria elegans", 12, 100, "Bright direct", "Easy",
     "Water at the base, not the rosette. Loves sun and very well-draining soil."),
    ("String of Pearls", "Curio rowleyanus", 12, 120, "Bright indirect", "Moderate",
     "Water when the pearls look slightly deflated. Shallow pots suit its fine roots."),
    ("Boston Fern", "Nephrolepis exaltata", 4, 300, "Medium indirect", "Moderate",
     "Keep consistently moist and mist often — it turns crispy in dry air."),
    ("Bird's Nest Fern", "Asplenium nidus", 5, 250, "Medium indirect", "Easy",
     "Water the soil around the rosette, never into the center crown. Likes humidity."),
    ("Calathea Orbifolia", "Goeppertia orbifolia", 5, 250, "Medium indirect", "Moderate",
     "Fussy about water quality — use filtered or rainwater and keep soil evenly moist."),
    ("Prayer Plant", "Maranta leuconeura", 5, 200, "Medium indirect", "Moderate",
     "Folds its leaves up at night. Keep soil moist and humidity high for flat, happy leaves."),
    ("Red Prayer Plant", "Maranta leuconeura erythroneura", 5, 150, "Medium indirect", "Moderate",
     "Loves humidity and filtered water. Brown leaf edges signal dry air or tap-water minerals."),
    ("Kentia Palm", "Howea forsteriana", 9, 500, "Bright indirect", "Easy",
     "Let the top inch dry between waterings. Tolerates lower light better than most palms."),
    ("Areca Palm", "Dypsis lutescens", 6, 500, "Bright indirect", "Moderate",
     "Keep lightly moist and never fully dry. Brown tips usually mean the air is too dry."),
    ("Parlor Palm", "Chamaedorea elegans", 8, 300, "Low to medium", "Easy",
     "Water when the surface feels dry. Happy in lower light where other palms sulk."),
    ("Ponytail Palm", "Beaucarnea recurvata", 18, 200, "Bright direct", "Very easy",
     "Stores water in its swollen base — water deeply but rarely, like a succulent."),
    ("Philodendron Heartleaf", "Philodendron hederaceum", 7, 250, "Low to bright", "Very easy",
     "Water when the top inch is dry. Trails or climbs and shrugs off neglect."),
    ("Philodendron Birkin", "Philodendron 'Birkin'", 7, 250, "Bright indirect", "Easy",
     "Keep lightly moist. Its white pinstripes get bolder in brighter indirect light."),
    ("Dracaena Marginata", "Dracaena marginata", 10, 300, "Low to bright", "Easy",
     "Sensitive to fluoride — use filtered water. Let the top half of the soil dry out."),
    ("Dumb Cane", "Dieffenbachia seguine", 7, 300, "Medium indirect", "Easy",
     "Keep evenly moist in the growing season. Sap is irritating, so keep away from pets."),
    ("Croton", "Codiaeum variegatum", 6, 300, "Bright indirect", "Moderate",
     "Keep soil lightly moist and humidity high. More light means more vivid leaf color."),
    ("Anthurium", "Anthurium andraeanum", 6, 250, "Bright indirect", "Moderate",
     "Water when the top inch is dry. Blooms best with bright light and steady humidity."),
    ("Orchid (Phalaenopsis)", "Phalaenopsis spp.", 7, 150, "Bright indirect", "Moderate",
     "Water by soaking the bark weekly, then draining fully. Roots should never stay wet."),
    ("African Violet", "Streptocarpus ionanthus", 6, 100, "Bright indirect", "Moderate",
     "Water from below with room-temperature water; wet leaves spot. Avoid direct sun."),
    ("Begonia Maculata", "Begonia maculata", 6, 200, "Bright indirect", "Moderate",
     "Let the top inch dry slightly. Water at the base to keep the polka-dot leaves dry."),
    ("English Ivy", "Hedera helix", 6, 200, "Medium indirect", "Easy",
     "Keep lightly moist and cool. Mist in dry rooms to discourage spider mites."),
    ("Swiss Cheese Vine", "Monstera adansonii", 6, 250, "Bright indirect", "Easy",
     "Water when the top inch dries. Provide a trellis or let it trail from a shelf."),
    ("Nerve Plant", "Fittonia albivenis", 3, 120, "Medium indirect", "Moderate",
     "Dramatic wilter — keep soil consistently moist and humidity high, and it stays perky."),
    ("Peperomia", "Peperomia obtusifolia", 9, 150, "Medium indirect", "Very easy",
     "Semi-succulent leaves store water, so let the soil dry out well before watering."),
    ("Cast Iron Plant", "Aspidistra elatior", 12, 300, "Low light", "Very easy",
     "Nearly indestructible. Water when the top inch is dry and tolerates deep shade."),
    ("Chinese Evergreen", "Aglaonema commutatum", 8, 250, "Low to medium", "Very easy",
     "Water when the top inch is dry. Handles low light and irregular watering gracefully."),
    ("Dracaena Lemon Lime", "Dracaena fragrans 'Lemon Lime'", 10, 300, "Low to bright", "Easy",
     "Use filtered water to avoid tip burn. Let the top third of the soil dry out."),
    ("Umbrella Tree", "Schefflera arboricola", 8, 350, "Bright indirect", "Easy",
     "Water when the top inch is dry. Leggy growth means it wants more light."),
    ("Norfolk Island Pine", "Araucaria heterophylla", 7, 300, "Bright indirect", "Moderate",
     "Keep evenly moist and humid. Dropping needles usually mean dry air or dry soil."),
    ("Christmas Cactus", "Schlumbergera bridgesii", 10, 150, "Bright indirect", "Easy",
     "Water when the top inch is dry — more than a desert cactus, less than a fern."),
    ("Air Plant", "Tillandsia ionantha", 5, 50, "Bright indirect", "Easy",
     "No soil needed — soak in water for 20 minutes weekly, then dry fully upside down."),
    ("Succulent Mix", "Assorted succulents", 14, 100, "Bright direct", "Very easy",
     "Soak thoroughly, then let the soil dry completely. Bright light prevents stretching."),
    ("Money Tree", "Pachira aquatica", 9, 300, "Bright indirect", "Easy",
     "Water when the top 2 inches are dry. Braided trunks like steady, moderate moisture."),
    ("Hoya", "Hoya carnosa", 12, 200, "Bright indirect", "Easy",
     "Let it dry out between waterings. Do not cut off old bloom spurs — they reflower."),
]


def seed_catalog(db: Session) -> int:
    """Insert any catalog species that are not yet present. Returns count added."""
    existing = {name for (name,) in db.execute(select(PlantSpecies.common_name)).all()}
    added = 0
    for common, sci, interval, ml, light, difficulty, tip in CATALOG:
        if common in existing:
            continue
        db.add(
            PlantSpecies(
                common_name=common,
                scientific_name=sci,
                default_interval_days=interval,
                default_water_amount_ml=ml,
                light=light,
                difficulty=difficulty,
                care_tip=tip,
            )
        )
        added += 1
    if added:
        db.commit()
    return added
