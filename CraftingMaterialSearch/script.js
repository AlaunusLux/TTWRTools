function searchCraftables() {
  saveToStorage();
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
        `Name: ${playerName}<br/>Buying: ` +
        results.map(item => Object.keys(item)[0]).join(", ") +
        `<br/>Sum: ${totalGP}gp`;
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

function saveToStorage() {
  const state = {
    reagents: document.getElementById("reagents").checked,
    wood: document.getElementById("wood").checked,
    magica: document.getElementById("magica").checked,
    leather: document.getElementById("leather").checked,
    cloth: document.getElementById("cloth").checked,
    metal: document.getElementById("metal").checked,
    searchText: document.getElementById("search-keys").value
  };
  sessionStorage.setItem("materialSearch", JSON.stringify(state));
}

// Restore all state from session storage
function restoreFromStorage() {
  const raw = sessionStorage.getItem("materialSearch");
  if (!raw) return false;
  const state = JSON.parse(raw);

  document.getElementById("reagents").checked = state.reagents ?? true;
  document.getElementById("wood").checked = state.wood ?? true;
  document.getElementById("magica").checked = state.magica ?? true;
  document.getElementById("leather").checked = state.leather ?? true;
  document.getElementById("cloth").checked = state.cloth ?? true;
  document.getElementById("metal").checked = state.metal ?? true;
  document.getElementById("search-keys").value = state.searchText ?? "";

  }


document.addEventListener("DOMContentLoaded", function(event) {
    searchCraftables()
});
restoreFromStorage()

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

