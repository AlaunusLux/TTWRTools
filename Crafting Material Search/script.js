function searchCraftables() {
  var rawLines = document.getElementById("search-keys").value
                  .split("\n") 
                  .map(line => line.trim()) 
                  .filter(line => line !== "");
  var gpLookup = {};
  var inputItems = rawLines.map(line => {
    var match = line.match(/^(.*?)\s*-\s*(\d+)\s*gp$/i);

    if (match) {
      return {
        original: match[1].trim(),
        lower: match[1].trim().toLowerCase(),
        gp: parseInt(match[2], 10)
      };
    }

    return {
      original: line,
      lower: line.toLowerCase(),
      gp: null
    };
  });

  // Convenience array for matching
  var searchKeys = inputItems.map(item => item.lower);

  // GP lookup stays useful
  inputItems.forEach(item => {
    if (item.gp) gpLookup[item.lower] = item.gp;
  });



  var activeIds = Array.from(document.querySelectorAll('fieldset input:checked'))
    .map(cb => cb.id);

  // 2. Get materials and normalize them to lowercase for comparison
  var searchMaterials = activeIds.flatMap(id => materialMap[id])
    .map(material => material.toLowerCase());

  var results = craftables.filter(item => {
    // Get the original key (for display) and a lowercase version (for searching)
    var originalKey = Object.keys(item)[0];
    var lowerKey = originalKey.toLowerCase();

    // Check if the itemKey matches any of our searchKeys (both now lowercase)
    var matchesKey = searchKeys.length === 0 || searchKeys.includes(lowerKey);

    // Get the value and normalize to lowercase
    var itemValue = item[originalKey].toLowerCase();

    // Check if the value contains ANY of our target materials (both now lowercase)
    var matchesMaterial = searchMaterials.some(material =>
      itemValue.includes(material)
    );

    return matchesKey && matchesMaterial;
  });

  var displayDiv = document.getElementById('results-display');
  var purchaseLogOutputDiv = document.getElementById('purchase-log-output');

  // 3. Output to the divs (using originalKey to preserve casing)
  if (results.length > 0) {
    let totalGP = 0;

    displayDiv.innerHTML = results.map(item => {
      var originalKey = Object.keys(item)[0];
      var keyLower = originalKey.toLowerCase();

      if (gpLookup[keyLower]) {
        totalGP += gpLookup[keyLower];
      }

      return `<p><strong>${originalKey}:</strong> ${item[originalKey]}</p>`;
    }).join('');
    if (totalGP > 0) {
      purchaseLogOutputDiv.innerHTML =
        "Name: Drotar<br/>Buying: " +
        results.map(item => Object.keys(item)[0]).join(", ") +
        "<br/>Sum: " + totalGP + "gp";
    }
    else { purchaseLogOutputDiv.innerHTML = ""; }
  } else if (searchMaterials.length > 0) {
    displayDiv.innerHTML = "<p>No matches found.</p>";
  }
  else {
    displayDiv.innerHTML = "<p>Please enter search keys or select materials.</p>";
    purchaseLogOutputDiv.innerHTML = "";
  }

  var allRecipeKeys = new Set(
    craftables.map(item => Object.keys(item)[0].toLowerCase())
  );


  // Lowercase set of matched recipe names


  var unmatchedItems = inputItems.filter(
    item => !allRecipeKeys.has(item.lower)
  );



  var unmatchedDiv = document.getElementById('unmatched-items');

  if (unmatchedItems.length > 0) {
    unmatchedDiv.innerHTML =
      "<strong>No known recipe:</strong><br/>" +
      unmatchedItems.map(item => {
        return item.gp
          ? `${item.original} - ${item.gp}gp`
          : item.original;
      }).join("<br/>");
  } else {
    unmatchedDiv.innerHTML = "";
  }



}

document.addEventListener("DOMContentLoaded", function(event) {
    searchCraftables()
});


var materialMap = {
  reagents: [
    "Frog Tongue", "Cat Claw", "Wolf Eye",
    "Allosaurus Tooth", "Old Dragon Scale",
  ],
  wood: [
    "Minor Rowan Wood", "Slight Rowan Wood", "Perfect Rowan Wood",
    "Flying Rowan Wood", "Perfect Flying Rowan Wood", "M. Wood", "S. Wood", "Wood"
  ],
  magica: [
    "Vision Dust", "Seer Dust", "Death Dust", "Star's End", "Time Residue", "Dust"
  ],
  leather: [
    "Lesser Hide", "Basic Hide", "Great Hide", "Perfect Hide", "Absolute Hide", "B. Hide", "Hide"
  ],
  cloth: [
    "Far Wool", "Warrior Wool", "Ancient Silk", "Hero Silk", "Lich Silk", "Wool", "Silk"
  ],
  metal: [
    "Greenechite", "Critheite", "Tsavrhotite", "Perbodanite", "Twilasite"
  ]
};

var craftables = [
  { "Revolving Hand Crossbow": "2 Greenechite | 2 M. Wood +" },
  { "Coin of Delving": "4 Greenechite | 1 Seer Dust" },
  { "Ear Horn of Hearing": "4 Greenechite | 1 Cat Claw" },
  { "Eratz Eye": "4 Greenechite | 1 Seer Dust" },
  { "Lock of Trickery": "4 Greenechite | 1 Critheite" },
  { "Mystery Key": "4 Greenechite | 1 Seer Dust" },
  { "Orb of Direction": "4 Greenechite | 1 S. Wood" },
  { "Orb of Gonging": "4 Greenechite | 1 Critheite" },
  { "Orb of Time": "4 Greenechite | 1 Seer Dust" },
  { "Prosthetic Limb": "4 Greenechite | 1 Warrior Wool" },
  { "Vox Seeker": "4 Greenechite | 1 Critheite" },
  { "Armblade": "2 Greenechite | 2 Frog Tongue +" },
  { "Armor of Gleaming": "2 Greenechite | 2 Vision Dust +" },
  { "Chain Blade": "2 Greenechite | 2 Lesser Hide +" },
  { "Dread Helmet": "2 Greenechite | 2 Vision Dust" },
  { "Horn of Silent Alarm": "2 Greenechite | 2 Frog Tongue" },
  { "Pole of Collapsing": "2 Greenechite | 2 M. Wood" },
  { "Smoldering Armor": "2 Greenechite | 2 Far Wool +" },
  { "Veteran's Cane": "2 Greenechite | 2 M. Wood" },
  { "Clockwork Amulet": "4 Greenechite | 1 Seer Dust" },
  { "Moon-Touched Weapon": "4 Greenechite | 1 Seer Dust +" },
  { "Charlatan's Die": "2 M. Rowan Wood | 2 Greenechite" },
  { "Instrument of Illusions": "2 M. Rowan Wood | 2 Vision Dust" },
  { "Instrument of Scribing": "2 M. Rowan Wood | 2 Vision Dust" },
  { "Pipe of Remembrance": "2 M. Rowan Wood | 2 Vision Dust" },
  { "Pole of Angling": "2 M. Rowan Wood | 2 Frog Tongue" },
  { "Recurve Bow": "2 M. Rowan Wood | 2 Lesser Hide +" },
  { "Staff of Adornment": "2 M. Rowan Wood | 2 Far Wool +" },
  { "Staff of Birdcalls": "2 M. Rowan Wood | 2 Frog Tongue +" },
  { "Staff of Flowers": "2 M. Rowan Wood | 2 Vision Dust +" },
  { "Chest of Holding": "4 M. Rowan Wood | 1 Critheite" },
  { "Chest of Preserving": "4 M. Rowan Wood | 1 Seer Dust" },
  { "Imbued Wood Focus": "4 M. Rowan Wood | 1 Seer Dust" },
  { "Walloping Arrow": "4 M. Rowan Wood | 1 P. Wood +" },
  { "Balance of Harmony": "4 Critheite | 2 Seer Dust" },
  { "Earworm": "4 Critheite | 2 Seer Dust" },
  { "Eyes of Charming": "4 Critheite | 2 Seer Dust" },
  { "Eyes of Minute Seeing": "4 Critheite | 2 Seer Dust" },
  { "Eyes of the Eagle": "4 Critheite | 2 Warrior Wool" },
  { "Gem of Brightness": "4 Critheite | 2 Seer Dust" },
  { "Goggles of Object Reading": "4 Critheite | 2 Cat Claw" },
  { "Guardian Emblem": "4 Critheite | 2 B. Hide" },
  { "Infernal Puzzle Box": "3 Critheite | 3 S.R. Wood" },
  { "Inquisitive's Goggles": "4 Critheite | 2 Warrior Wool" },
  { "Mizzium Apparatus": "4 Critheite | 2 Seer Dust" },
  { "Necklace of Adaptation": "4 Critheite | 2 B. Hide" },
  { "Palm Pistol (Exandria; not magical)": "4 Critheite | 2 Seer Dust" },
  { "Pipes of the Sewers": "4 Critheite | 2 Seer Dust" },
  { "Propellor Helm": "4 Critheite | 2 B. Hide" },
  { "Goggles of Night": "4 Critheite | 2 Seer Dust | 1 Tsavrhotite" },
  { "Mechanical Capture Net": "4 Critheite | 2 B. Hide | 1 A. Silk" },
  { "Paper Bird": "4 Critheite | 2 S. Wood | 1 Death Dust" },
  { "Pistol (Exandria; not magical)": "4 Critheite | 2 Seer Dust | 1 Tsavrhotite" },
  { "Pepperbox (Exandria; not magical)": "4 Critheite | 2 Seer Dust | 1 Death Dust" },
  { "Rings of Talent (Active: Int Based)": "4 Critheite | 2 Seer Dust | 1 Death Dust | Int Roll" },
  { "Rings of Talent (Active: Cha Based)": "4 Critheite | 2 Seer Dust | 1 Death Dust | Cha Roll" },
  { "Seeker Dart": "4 Critheite | 2 Seer Dust | 1 Death Dust" },
  { "Shield of the Traveler": "4 Critheite | 2 S. Wood | 1 P. Wood +" },
  { "Spies' Murmur": "4 Critheite | 2 B. Hide | 1 Warrior Eye" },
  { "Circlet of Human Perfection": "4 Critheite | 1 Cat Claw | 1 Warrior Wool" },
  { "Gruul Guild Signet": "4 Critheite | 1 B. Hide | 1 Seer Dust" },
  { "Hellfire Weapon": "4 Critheite | 1 S. Wood | 1 Seer Dust +" },
  { "Helm of Telepathy": "4 Critheite | 1 B. Hide | 1 Warrior Wool" },
  { "Mariner's Armor": "4 Critheite | 1 S. Wood | 1 B. Hide +" },
  { "Periapt of Wound Closure": "4 Critheite | 1 Cat Claw | 1 S. Wood +" },
  { "Ring of Jumping": "4 Critheite | 1 Cat Claw | 1 Seer Dust +" },
  { "Trident of Fish Command": "4 Critheite | 1 S.R. Wood | 1 Warrior Wool" },
  { "Buckler Shield": "4 Critheite | 2 S. Wood | 1 Wolf Eye +" },
  { "Helm of Comprehending Languages": "4 Critheite | 2 B. Hide | 1 Death Dust" },
  { "Insignia of Claws": "4 Critheite | 2 Cat Claw | 1 Death Dust" },
  { "Lightbringer": "4 Critheite | 2 Seer Dust | 1 P. Wood +" },
  { "Mithral Armor": "4 Critheite | 2 Seer Dust | 1 Tsavrhotite +" },
  { "Pearl of Power": "4 Critheite | 2 Seer Dust | 1 Wolf Eye" },
  { "Rings of Talent (Active: Str Based)": "4 Critheite | 2 S. Wood | 1 Death Dust" },
  { "Shatterspike": "4 Critheite | 2 S.R. Wood | 1 A. Silk +" },
  { "Shield +1": "4 Critheite | 2 B. Hide | 1 P. Wood +" },
  { "Swarmer Fang Knife": "4 Critheite | 2 B. Hide | 1 A. Silk +" },
  { "Warning Weapons": "4 Critheite | 2 Seer Dust | 1 Tsavrhotite +" },
  { "Weapon +1 (metal)": "4 Critheite | 2 B. Hide | 1 Death Dust +" },
  { "Blood Spear": "4 S. Wood | 2 Warrior Wool +" },
  { "Figurine of Wondrous Power (Silver Raven)": "4 S. Wood | 2 Cat Claw" },
  { "Ring of Water Walking": "4 S. Wood | 2 B. Hide" },
  { "Rod of Retribution": "4 S. Wood | 2 Seer Dust" },
  { "Skyblinder Staff": "4 S. Wood | 2 Warrior Wool +" },
  { "Storm Boomerang": "4 S. Wood | 2 Seer Dust +" },
  { "Wand of Entangle": "4 S. Wood | 2 Cat Claw" },
  { "Wand of Secrets": "4 S. Wood | 2 Warrior Wool" },
  { "Wand of Silent Image": "4 S. Wood | 2 Seer Dust" },
  { "Wand of the War Mage": "4 S. Wood | 2 Warrior Wool" },
  { "Instrument of the Bards": "3 S. Wood | 3 B. Hide | 1 P. Wood" },
  { "Javelin of Lightning": "3 S. Wood | 3 Seer Dust | 1 Death Dust +" },
  { "Night Caller": "3 S. Wood | 3 Seer Dust | 1 P. Wood" },
  { "Pike of Pan": "4 S. Wood | 2 Critheite | 1 Tsavrhotite +" },
  { "Staff of the Adder": "3 S. Wood | 3 Cat Claw | 1 Death Dust +" },
  { "Staff of the Python": "4 S. Wood | 2 Cat Claw | 1 P. Wood +" },
  { "Wand of Hold Person": "4 S. Wood | 2 B. Hide | 1 Ancient Silk" },
  { "Wand of Magic Missiles": "3 S. Wood | 3 Seer Dust | 1 Death Dust" },
  { "Weapon +1 (wood)": "4 S. Wood | 2 B. Hide | 1 Death Dust +" },

  { "Candle of the Deep": "2 Frog Tongue | 2 Far Wool" },
  { "Everbright Lantern": "2 Frog Tongue | 2 Greenechite" },
  { "Illuminator's Tattoo": "2 Frog Tongue | 2 Vision Dust" },
  { "Lantern of Tracking": "2 Frog Tongue | 2 Greenechite" },
  { "Moodmark Paint": "2 Frog Tongue | 2 M. Wood" },
  { "Pipe of Smoke Monsters": "2 Frog Tongue | 2 M. Wood" },
  { "Tankard of Plenty": "2 Frog Tongue | 2 Greenechite" },
  { "Tankard of Sobriety": "2 Frog Tongue | 2 Greenechite" },
  { "Wand of Pyrotechnics": "2 Frog Tongue | 2 M. Wood" },
  { "Breathing Bubble": "4 Frog Tongue | 1 Warrior Wool" },
  { "Masquerade Tattoo": "4 Frog Tongue | 1 Cat Claw" },
  { "Thermal Cube": "4 Frog Tongue | 1 Critheite" },

  { "Alchemy Jug": "4 Cat Claw | 2 Seer Dust" },
  { "Amulet of the Drunkard": "4 Cat Claw | 2 B. Hide" },
  { "Barrier Tattoo (S)": "4 Cat Claw | 2 Seer Dust" },
  { "Coiling Grasp Tattoo": "4 Cat Claw | 2 Seer Dust" },
  { "Cursed Luckstone": "4 Cat Claw | 2 Critheite" },
  { "Eversmoking Bottle": "4 Cat Claw | 2 S. Wood" },
  { "Helm of Underwater Action": "4 Cat Claw | 2 Critheite" },
  { "Periapt of Health": "4 Cat Claw | 2 Seer Dust" },
  { "Ring of Obscuring": "4 Cat Claw | 2 Warrior Wool" },
  { "Ring of Swimming": "4 Cat Claw | 2 Critheite" },
  { "Ring of Truth Telling": "4 Cat Claw | 2 Seer Dust" },
  { "Ring of Warmth": "4 Cat Claw | 2 Basic Hide" },
  { "Wand of Web": "4 Cat Claw | 2 Warrior Wool" },
  { "Charred Wand of Magic Missile": "4 Cat Claw | 2 S. Rowan Wood | 1 Death Dust" },
  { "Eldritch Claw Tattoo": "4 Cat Claw | 2 Seer Dust | 1 Wolf Eye" },
  { "Emerald Pen": "4 Cat Claw | 2 S. Wood | 1 Tsavrohotite" },
  { "Lantern of Revealing": "4 Cat Claw | 2 Seer Dust | 1 Tsavrohotite" },
  { "Luckstone": "4 Cat Claws | 2 Critheite | 1 Death Dust" },
  { "Smokeborn Mask": "4 Cat Claws | 2 Seer Dust | 1 P. Wood" },
  { "Cleansing Stone": "2 Vision Dust | 2 Greenechite" },
  { "Instrument of Illusions": "2 Vision Dust | 2 M. Rowan Wood" },
  { "Instrument of Scribing": "2 Vision Dust | 2 Far Wool" },
  { "Pole of Angling": "2 Vision Dust | 2 M. Rowan Wood" },
  { "Spellshard": "2 Vision Dust | 2 Greenechite" },
  { "Wand of Conducting": "2 Vision Dust | 2 M. Rowan Wood" },
  { "Wand of Scowls": "2 Vision Dust | 2 M. Rowan Wood" },
  { "Wand of Smiles": "2 Vision Dust | 2 Frog Tongue" },
  { "Adami Crystal": "4 Vision Dust | 1 Seer Dust" },
  { "Dark Shard Amulet": "4 Vision Dust | 1 Seer Dust" },
  { "Masque Charm": "4 Vision Dust | 1 Cat Claw" },
  { "Orb of Shielding": "4 Vision Dust | 1 Critheite" },

  { "Amulet of Proof Against Detection and Location": "3 Seer Dust | 3 S. Wood" },
  { "Azorius Guild Signet": "3 Seer Dust | 3 S. Wood" },
  { "Boros Guild Signet": "3 Seer Dust | 3 Warrior Wool" },
  { "Brooch of Living Essence": "3 Seer Dust | 3 Cat Claw" },
  { "Brooch of Shielding": "3 Seer Dust | 3 Critheite" },
  { "Circlet of Blasting": "3 Seer Dust | 3 Critheite" },
  { "Deck of Illusions": "3 Seer Dust | 3 S. Wood" },
  { "Dimir Guild Signet": "4 Seer Dust | 1 Cat Claw | 1 B. Hide" },
  { "Driftglobe": "3 Seer Dust | 3 Critheite" },
  { "Feywild Shard": "4 Seer Dust | 1 Critheite | 1 S. Wood" },
  { "Golgari Guild Signet": "4 Seer Dust | 1 Cat Claw | 1 S. Wood" },
  { "Medallion of Thoughts": "4 Seer Dust | 1 S. Hide | 1 Critheite" },
  { "Pipes of Haunting": "3 Seer Dust | 3 S. Wood" },
  { "Ring of Enchanted Action": "6 Seer Dust" },
  { "Caster Attunement +1": "4 Seer Dust | 2 Cat Claw | 1 Death Dust" },
  { "Immovable Rod": "4 Seer Dust | 2 Critheite | 1 Tsavrotite" },
  { "Lantern of the Rat Lord": "4 Seer Dust | 2 Cat Claw | 1 Tsachrotite" },
  { "Sending Stones": "4 Seer Dust | 2 Critheite | 1 Wolf Eye" },

  { "Boots of False Tracks": "2 Lesser Hide | 2 Far Wool" },
  { "Cast-off Armor": "2 Lesser Hide | 2 Greenechite +" },
  { "Shield of Expression": "2 Lesser Hide | 2 Greenechite +" },
  { "Strixhaven Pennant": "2 Lesser Hide | 2 Far Wool" },
  { "Talking Doll": "2 Lesser Hide | 2 Frog Tongue" },
  { "Wand Sheath": "2 Lesser Hide | 2 M. Rowan Wood" },
  { "Enduring Spellbook": "4 Lesser Hide | 1 Seer Dust" },
  { "Heward's Handy Spice Pouch": "4 Lesser Hide | 1 Cat Claw" },

  { "Bag of Bounty": "3 Basic Hide | 3 Seer Dust" },
  { "Boots of Striding and Springing": "4 Basic Hide | 2 Critheite +" },
  { "Crown of the Forest": "3 Basic Hide | 3 S. Rowan Wood" },
  { "Decanter of Endless Water": "3 Basic Hide | 3 Seer Dust" },
  { "Elder Cartographer's Glossography": "3 Basic Hide | 3 S. Rowan Wood" },
  { "Gloves of Missile Snaring": "4 Basic Hide | 2 Cat Claw" },
  { "Gloves of Thievery": "3 Basic Hide | 3 Cat Claw" },
  { "Mask of the Beast": "3 Basic Hide | 3 Warrior Wool" },
  { "Boots of Elvenkind": "4 Basic Hide | 2 Warrior Wool | 1 Great Hide" },
  { "Bracers of Archery": "4 Basic Hide | 2 Warrior Wool | 1 Ancient Silk" },
  { "College Primers": "4 Basic Hide | 2 Seer Dust | 1 Great Hide" },
  { "Dragon Hide Belt +1": "4 Basic Hide | 2 Warrior Wool | 1 Ancient Silk" },
  { "Hunter's Vambraces": "4 Basic Hide | 2 Warrior Wool | 1 Critheite" },
  { "Quiver of Ehlonna": "4 Basic Hide | 2 Seer Dust | 1 Ancient Silk" },
  { "Saddle of the Cavalier": "4 Basic Hide | 2 Seer Dust | 1 Great Hide" },
  { "Spellsave Armor": "4 B. Hide | 2 D. Dust | 1 G. Hide +" },
  { "Winged Boots": "4 Basic Hide | 2 Seer Dust | 1 Death Dust" },
  { "Cloak of Many Fashions": "2 Far Wool | 2 Vision Dust" },
  { "Hat of Vermin": "2 Far Wool | 2 Frog Tongue" },
  { "Rope of Mending": "2 Far Wool | 2 Lesser Hide" },
  { "Shiftweave": "2 Far Wool | 2 Vision Dust" },
  { "Button's Button": "4 Far Wool | 1 S. Rowan Wood" },
  { "Cloak of Billowing": "4 Far Wool | 1 Seer Dust" },
  { "Clothes of Mending": "4 Far Wool | 1 Warrior Wool" },
  { "Cuddly Strixhaven Mascot": "4 Far Wool | 1 Basic Hide" },
  { "Hat of Wizardry": "4 Far Wool | 1 Warrior Wool" },
  { "Boots of the Winterlands": "4 Warrior Wool | 2 B. Hide" },
  { "Cap of Water Breathing": "4 Warrior Wool | 2 S. Wood" },
  { "Glamerweave (Uncommon)": "2 Warrior Wool | 2 Cat Claw | 2 Seer Dust" },
  { "Gloves of Swimming and Climbing": "2 Warrior Wool | 2 B. Hide | 2 S. Wood" },
  { "Hat of Disguise": "2 Warrior Wool | 2 B. Hide | 2 Cat Claw" },
  { "Nature's Mantle": "2 Warrior Wool | 2 Seer Dust | 2 S. Wood" },
  { "Rope of Climbing": "2 Warrior Wool | 2 Cat Claw | 2 Critheite" },
  { "Wind Fan": "2 Warrior Wool | 2 B. Hide | 2 Critheite" },
  { "Bag of Holding": "4 Warrior Wool | 2 B. Hide | 1 A. Silk" },
  { "Bag of Tricks": "4 Warrior Wool | 2 B. Hide | 1 W. Eye" },
  { "Cloak of Elvenkind": "4 Warrior Wool | 2 Seer Dust | 1 G. Hide" },
  { "Cloak of the Manta Ray": "4 Warrior Wool | 2 B. Hide | 1 Death Dust" },
  { "Cloak of Protection": "4 Warrior Wool | 2 Critheite | 1 A. Silk" },
  { "Diplomats' Pouch": "4 Warrior Wool | 2 Seer Dust | 1 A. Silk" },
  { "Living Gloves": "4 Warrior Wool | 2 B. Hide | 1 Ancient Silk" },
  { "Serpent Scale Armor": "4 Warrior Wool | 2 Critheite | 1 A. Silk +" },
  { "Slippers of Spider Climbing": "4 Warrior Wool | 2 Cat Claw | 1 A. Silk" }
]

