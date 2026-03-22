let bookCount = 0;
const spellbooks = [];

function getNextPersonalBookNumber() {
  const personalBooks = spellbooks.filter(b => b.type === "personal");
  if (personalBooks.length === 0) return 1;
  
  // Find the lowest unused number
  const usedNumbers = personalBooks.map(b => b.personalNumber).sort((a, b) => a - b);
  for (let i = 1; i <= usedNumbers.length + 1; i++) {
    if (!usedNumbers.includes(i)) return i;
  }
  return 1;
}

function createSpellbook(savedState = null) {
  bookCount++;
  const bookId = bookCount;
  const container = document.createElement("div");
  container.className = "spellbook";
  container.id = `spellbook${bookId}`;

  container.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <button class="collapseBtn" style="font-size: 16px; line-height: 1; padding: 4px 8px; background: none; border: none; cursor: pointer; color: var(--text);">▼</button>
      <h3 class="bookHeading" style="margin: 0;">Personal Spellbook ${bookId}</h3>
      <button class="renameBtn" style="font-size: 12px; padding: 4px 8px;">Rename</button>
      <button class="deleteBtn btn-danger" style="font-size: 12px; padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer; color: white;">Delete</button>
    </div>
    <div class="bookBody">
      <input type="text" class="customName" placeholder="Custom name (optional)" style="width: 300px; margin-bottom: 10px; display: none;">
      
      <label>Total Spell Levels (if not adding individually): <input type="number" class="totalLevels" min="0" value="0"></label><br>

      <div style="margin: 10px 0;">
        <strong>Scribing Tool:</strong>
        <label style="margin-left: 10px;"><input type="radio" name="scribingTool${bookId}" value="none" checked class="toolNone"> None</label>
        <div style="display: grid; grid-template-columns: 320px max-content; gap: 4px 12px; margin-left: 30px; margin-top: 4px; align-items: center;">
          <label style="grid-column: 1; margin: 0;"><input type="radio" name="scribingTool${bookId}" value="wand" class="toolWand" style="margin-right: 6px;"> Arcanist's Scribing Wand (halve gp)</label>
          <label class="toolWandBorrowedLabel" style="grid-column: 2; visibility: hidden; font-size: 0.9em; margin: 0;"><input type="checkbox" class="toolWandBorrowed"> Borrowed</label>
          <label style="grid-column: 1; margin: 0;"><input type="radio" name="scribingTool${bookId}" value="quill" class="toolQuill" style="margin-right: 6px;"> Pegasus Quill (halve time)</label>
          <label class="toolQuillBorrowedLabel" style="grid-column: 2; visibility: hidden; font-size: 0.9em; margin: 0;"><input type="checkbox" class="toolQuillBorrowed"> Borrowed</label>
        </div>
      </div>
      
      <div class="badgeContainer"></div>
      
      <div class="savantContainer">
        <label style="display: none;" class="savantLabel">
          <span class="savantText">Legacy Savant:</span>
          <select class="savantSelect" style="margin-left: 5px;">
            <option value="">None</option>
          </select>
        </label>
      </div>
      
      <label><input type="checkbox" class="guild"> Guild Spellbook (school-locked)</label>
      <label><input type="checkbox" class="schoolLock"> <span class="schoolLockLabel">Lock to School (prevents wrong schools)</span></label><br>

      <h4>Add Spells</h4>
      <input type="text" class="spellInput" placeholder="Type a spell name">
      <ul class="spellList" style="list-style: none; padding-left: 0;"></ul>
    </div>
  `;

  document.getElementById("spellbooksContainer").appendChild(container);

  const personalNumber = getNextPersonalBookNumber();
  
  const book = {
    id: bookId,
    spells: [],
    type: "personal",
    personalNumber: personalNumber,  // Track personal book number separately
    school: null,
    schoolNumber: null,
    customName: null,
    schoolLock: false,
    savedSchoolLock: false,
    badges: {},  // Track which schools have badges: { "Evocation": true, "Abjuration": false }
    legacySavant: null,  // Track which school has legacy savant
    badgeStartedAttached: {},  // Track if badge started attached for each school
    badgeStaysAttached: {},  // Track if badge stays attached for each school
    badgeBorrowed: {},  // Track if each school's badge is borrowed
    toolWandBorrowed: false,  // Track if the Arcanist's Scribing Wand is borrowed
    toolQuillBorrowed: false  // Track if the Pegasus Quill is borrowed
  };
  spellbooks.push(book);

  // Apply saved state to book object if restoring from session storage
  if (savedState) {
    // Restore only the user-controlled fields, not structural ids assigned by createSpellbook
    const { type, customName, school, schoolLock, savedSchoolLock,
            badges, legacySavant, badgeStartedAttached, badgeStaysAttached,
            badgeBorrowed, toolWandBorrowed, toolQuillBorrowed, collapsed } = savedState;
    Object.assign(book, { type, customName, school, schoolLock, savedSchoolLock,
                          badges, legacySavant, badgeStartedAttached, badgeStaysAttached,
                          badgeBorrowed, toolWandBorrowed, toolQuillBorrowed, collapsed });
    book.spells = savedState.spells || [];
    // Restore tool radio selection
    if (savedState.tool === "wand") {
      container.querySelector(".toolWand").checked = true;
    } else if (savedState.tool === "quill") {
      container.querySelector(".toolQuill").checked = true;
    }
    container.querySelector(".toolWandBorrowed").checked = book.toolWandBorrowed;
    container.querySelector(".toolQuillBorrowed").checked = book.toolQuillBorrowed;
    updateToolBorrowedVisibility();
    // Restore guild / school lock checkboxes
    container.querySelector(".guild").checked = book.type === "guild";
    container.querySelector(".schoolLock").checked = book.schoolLock;
    // Restore total levels input
    if (book.spells.length === 0 && savedState.manualLevels > 0) {
      const totalLevelsInput = container.querySelector(".totalLevels");
      totalLevelsInput.value = savedState.manualLevels;
    }
    // Hide total levels input if spells exist
    if (book.spells.length > 0) {
      const totalLevelsInput = container.querySelector(".totalLevels");
      totalLevelsInput.disabled = true;
      totalLevelsInput.style.opacity = "0.5";
      totalLevelsInput.parentElement.style.display = "none";
    }
    // Restore collapse state
    if (savedState.collapsed) {
      container.querySelector(".bookBody").style.display = "none";
      container.querySelector(".collapseBtn").textContent = "▶";
    }
  }

  // Collapse button functionality
  const collapseBtn = container.querySelector(".collapseBtn");
  const bookBody = container.querySelector(".bookBody");
  collapseBtn.addEventListener("click", () => {
    const isCollapsed = bookBody.style.display === "none";
    bookBody.style.display = isCollapsed ? "" : "none";
    collapseBtn.textContent = isCollapsed ? "▼" : "▶";
    book.collapsed = !isCollapsed;
    saveToStorage();
  });

  // Update the initial heading with correct number
  updateBookHeading(book, container);

  // Helper: show/hide borrowed checkboxes based on which tool radio is selected
  function updateToolBorrowedVisibility() {
    const toolWand = container.querySelector(".toolWand").checked;
    const toolQuill = container.querySelector(".toolQuill").checked;
    container.querySelector(".toolWandBorrowedLabel").style.visibility = toolWand ? "visible" : "hidden";
    container.querySelector(".toolQuillBorrowedLabel").style.visibility = toolQuill ? "visible" : "hidden";
  }

  // Event listeners for modifiers
  [".toolNone", ".toolWand", ".toolQuill", ".totalLevels"].forEach(sel => {
    const element = container.querySelector(sel);
    if (element) {
      element.addEventListener("input", () => {
        updateToolBorrowedVisibility();
        updateModifierControls(book, container);
        calculateCosts();
      });
    }
  });

  // Borrowed checkboxes for each scribing tool (state persists regardless of which tool is selected)
  container.querySelector(".toolWandBorrowed").addEventListener("change", function() {
    book.toolWandBorrowed = this.checked;
    calculateCosts();
  });

  container.querySelector(".toolQuillBorrowed").addEventListener("change", function() {
    book.toolQuillBorrowed = this.checked;
    calculateCosts();
  });

  container.querySelector(".guild").addEventListener("change", function() {
    book.type = this.checked ? "guild" : "personal";
    
    if (book.type === "personal") {
      // Restore the saved school lock state when unchecking guild
      book.schoolLock = book.savedSchoolLock;
      container.querySelector(".schoolLock").checked = book.schoolLock;
      book.school = null;
      book.schoolNumber = null;
    } else {
      // Save current school lock state before converting to guild
      book.savedSchoolLock = book.schoolLock;
      // Guild books are always school-locked
      book.schoolLock = true;
      // If there are already spells, lock to their school
      if (book.spells.length > 0) {
        const schools = [...new Set(book.spells.map(s => s.school))];
        if (schools.length === 1) {
          book.school = schools[0];
          updateSchoolNumbers();
        }
      }
    }
    updateBookHeading(book, container);
    updateModifierControls(book, container);
    calculateCosts();
  });

  container.querySelector(".schoolLock").addEventListener("change", function() {
    book.schoolLock = this.checked;
    book.savedSchoolLock = this.checked;  // Save the state
    
    if (!this.checked && book.type === "personal") {
      // Unlocking a personal book doesn't clear the school, just allows adding other schools
      book.school = null;
    } else if (this.checked && book.spells.length > 0) {
      // Lock to current school if spells exist
      const schools = [...new Set(book.spells.map(s => s.school))];
      if (schools.length === 1) {
        book.school = schools[0];
      }
    }
    updateModifierControls(book, container);
  });

  // Rename button functionality
  const renameBtn = container.querySelector(".renameBtn");
  const customNameInput = container.querySelector(".customName");
  renameBtn.addEventListener("click", () => {
    if (customNameInput.style.display === "none") {
      customNameInput.style.display = "block";
      customNameInput.value = book.customName || "";
      customNameInput.focus();
    } else {
      customNameInput.style.display = "none";
    }
  });

  customNameInput.addEventListener("blur", () => {
    book.customName = customNameInput.value.trim() || null;
    updateBookHeading(book, container);
    customNameInput.style.display = "none";
  });

  customNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      customNameInput.blur();
    }
  });

  // Delete button functionality
  const deleteBtn = container.querySelector(".deleteBtn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      const bookName = book.customName || 
                       (book.type === "guild" && book.school ? `${book.school} Spellbook ${book.schoolNumber}` : 
                        book.type === "guild" ? "Guild Spellbook" :
                        `Personal Spellbook ${book.personalNumber}`);
      if (confirm(`Are you sure you want to delete ${bookName}?`)) {
        // Remove from spellbooks array
        const index = spellbooks.findIndex(b => b.id === book.id);
        if (index > -1) {
          spellbooks.splice(index, 1);
        }
        
        // Remove the DOM element
        container.remove();
        
        // Recalculate school numbers for remaining guild books
        updateSchoolNumbers();
        
        // Recalculate costs
        calculateCosts();
      }
    });
  } else {
    console.error("Delete button not found for book", book.id);
  }

  const input = container.querySelector(".spellInput");
  setupSpellAutocomplete(input, book, container);
}

function addSpellToBook(spell, book, container) {
  // Don't add duplicates
  if (book.spells.some(s => s.name === spell.name)) return;

  // For guild books or locked personal books, lock to first spell's school
  if ((book.type === "guild" || book.schoolLock) && !book.school) {
    book.school = spell.school;
    if (book.type === "guild") {
      updateSchoolNumbers();
    }
  }

  book.spells.push(spell);
  
  // Hide/disable total levels input when spells are added
  const totalLevelsInput = container.querySelector(".totalLevels");
  totalLevelsInput.disabled = true;
  totalLevelsInput.style.opacity = "0.5";
  totalLevelsInput.parentElement.style.display = "none";
  
  updateBookHeading(book, container);
  updateSpellList(book, container);
  updateModifierControls(book, container);
  calculateCosts();
}

function removeSpellFromBook(spellName, book, container) {
  book.spells = book.spells.filter(s => s.name !== spellName);
  
  // If no spells remain, clear school lock (unless it's a guild book)
  if (book.spells.length === 0) {
    if (book.type === "guild") {
      book.school = null;
      book.schoolNumber = null;
      updateSchoolNumbers();
    } else if (!book.schoolLock) {
      book.school = null;
    }
    
    // Re-enable total levels input
    const totalLevelsInput = container.querySelector(".totalLevels");
    totalLevelsInput.disabled = false;
    totalLevelsInput.style.opacity = "1";
    totalLevelsInput.parentElement.style.display = "block";

  }
  
  updateBookHeading(book, container);
  updateSpellList(book, container);
  updateModifierControls(book, container);
  calculateCosts();
}

function updateBookHeading(book, container) {
  const h3 = container.querySelector(".bookHeading");
  
  if (book.customName) {
    h3.textContent = book.customName;
    return;
  }
  
  if (book.type === "guild") {
    if (book.school && book.schoolNumber) {
      h3.textContent = `${book.school} Spellbook ${book.schoolNumber}`;
    } else {
      h3.textContent = `Guild Spellbook`;
    }
  } else {
    h3.textContent = `Personal Spellbook ${book.personalNumber}`;
  }
}

function updateModifierControls(book, container) {
  const badgeContainer = container.querySelector(".badgeContainer");
  const savantLabel = container.querySelector(".savantLabel");
  const schoolLockLabel = container.querySelector(".schoolLockLabel");
  const guildCheckbox = container.querySelector(".guild");
  const schoolLockCheckbox = container.querySelector(".schoolLock");
  
  // Get unique schools in this book
  const schools = [...new Set(book.spells.map(s => s.school))].sort();
  const primarySchool = book.school || (schools.length === 1 ? schools[0] : null);
  
  // Update school lock label
  if (primarySchool) {
    schoolLockLabel.textContent = `Lock to ${primarySchool} (prevents wrong schools)`;
  } else {
    schoolLockLabel.textContent = "Lock to School (prevents wrong schools)";
  }
  
  // Hide school lock option for guild books (they're always locked)
  if (book.type === "guild") {
    schoolLockCheckbox.parentElement.style.display = "none";
  } else {
    schoolLockCheckbox.parentElement.style.display = "block";
  }
  
  // Show badges and savant for both personal and guild books
  // Create badge checkboxes for each school
  badgeContainer.innerHTML = "";
  
  schools.forEach(school => {
    const badgeDiv = document.createElement("div");
    badgeDiv.style.marginBottom = "10px";
    
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = `badge-${school.replace(/\s+/g, '')}`;
    checkbox.checked = book.badges[school] || false;
    checkbox.addEventListener("change", () => {
      book.badges[school] = checkbox.checked;
      if (checkbox.checked) {
        // Default Started/Stays attached to true for guild books when badge is first enabled
        if (book.badgeStartedAttached[school] === undefined) {
          book.badgeStartedAttached[school] = book.type === "guild";
        }
        if (book.badgeStaysAttached[school] === undefined) {
          book.badgeStaysAttached[school] = book.type === "guild";
        }
      }
      updateModifierControls(book, container);
      calculateCosts();
    });
    
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` Badge of the Savant [${school}] (halve gp & time)`));
    badgeDiv.appendChild(label);
    
    // Add badge state checkboxes directly under this badge if it's being used
    if (book.badges[school]) {
      const stateDiv = document.createElement("div");
      stateDiv.style.marginLeft = "30px";
      stateDiv.style.marginTop = "5px";
      stateDiv.style.fontSize = "0.9em";
      stateDiv.className = "badge-state-row";
      
      const startedLabel = document.createElement("label");
      startedLabel.style.marginRight = "15px";
      startedLabel.style.display = "inline-block";
      const startedCheckbox = document.createElement("input");
      startedCheckbox.type = "checkbox";
      startedCheckbox.checked = book.badgeStartedAttached[school] || false;
      startedCheckbox.addEventListener("change", () => {
        book.badgeStartedAttached[school] = startedCheckbox.checked;
        calculateCosts();
      });
      startedLabel.appendChild(startedCheckbox);
      startedLabel.appendChild(document.createTextNode(` Started attached`));
      
      const staysLabel = document.createElement("label");
      staysLabel.style.marginRight = "15px";
      staysLabel.style.display = "inline-block";
      const staysCheckbox = document.createElement("input");
      staysCheckbox.type = "checkbox";
      staysCheckbox.checked = book.badgeStaysAttached[school] || false;
      staysCheckbox.addEventListener("change", () => {
        book.badgeStaysAttached[school] = staysCheckbox.checked;
        calculateCosts();
      });
      staysLabel.appendChild(staysCheckbox);
      staysLabel.appendChild(document.createTextNode(` Stays attached`));

      // Borrowed checkbox
      const borrowedLabel = document.createElement("label");
      borrowedLabel.style.display = "inline-block";
      const borrowedCheckbox = document.createElement("input");
      borrowedCheckbox.type = "checkbox";
      borrowedCheckbox.checked = book.badgeBorrowed[school] || false;
      borrowedCheckbox.addEventListener("change", () => {
        book.badgeBorrowed[school] = borrowedCheckbox.checked;
        calculateCosts();
      });
      borrowedLabel.appendChild(borrowedCheckbox);
      borrowedLabel.appendChild(document.createTextNode(` Borrowed`));
      
      stateDiv.appendChild(startedLabel);
      stateDiv.appendChild(staysLabel);
      stateDiv.appendChild(borrowedLabel);
      badgeDiv.appendChild(stateDiv);
    }
    
    badgeContainer.appendChild(badgeDiv);
  });
  
  // Update legacy savant dropdown
  const isLegacy = document.getElementById("legacyCharacter").checked;
  if (schools.length > 0 && isLegacy) {
    savantLabel.style.display = "block";
    
    // Store current selection before rebuilding
    const currentSelection = book.legacySavant;
    
    // Rebuild options
    const newSelect = document.createElement("select");
    newSelect.className = "savantSelect";
    newSelect.style.marginLeft = "5px";
    
    const noneOption = document.createElement("option");
    noneOption.value = "";
    noneOption.textContent = "None";
    newSelect.appendChild(noneOption);
    
    schools.forEach(school => {
      const option = document.createElement("option");
      option.value = school;
      option.textContent = `${school} Savant [Legacy]`;
      if (currentSelection === school) {
        option.selected = true;
      }
      newSelect.appendChild(option);
    });
    
    // If current selection is no longer valid (school removed), reset to none
    if (currentSelection && !schools.includes(currentSelection)) {
      book.legacySavant = null;
    }
    
    // Add change listener
    newSelect.addEventListener("change", () => {
      book.legacySavant = newSelect.value || null;
      calculateCosts();
    });
    
    // Replace the old select with the new one
    const oldSelect = container.querySelector(".savantSelect");
    if (oldSelect && oldSelect.parentNode) {
      oldSelect.parentNode.replaceChild(newSelect, oldSelect);
    }
  } else {
    savantLabel.style.display = "none";
    book.legacySavant = null;
  }
  
  // Disable guild checkbox if multiple schools are present
  if (schools.length > 1) {
    guildCheckbox.disabled = true;
    guildCheckbox.checked = false;
    schoolLockCheckbox.disabled = true;
    schoolLockCheckbox.checked = false;
  } else {
    guildCheckbox.disabled = false;
    schoolLockCheckbox.disabled = false;
  }
}

function updateSchoolNumbers() {
  const schoolCounts = {};
  
  spellbooks.forEach(book => {
    if (book.type === "guild" && book.school) {
      if (!schoolCounts[book.school]) {
        schoolCounts[book.school] = 0;
      }
      schoolCounts[book.school]++;
      book.schoolNumber = schoolCounts[book.school];
      
      const container = document.getElementById(`spellbook${book.id}`);
      if (container) {
        updateBookHeading(book, container);
      }
    }
  });
}

function updateSpellList(book, container) {
  const list = container.querySelector(".spellList");
  list.innerHTML = "";

  // Group by level
  const byLevel = {};
  book.spells.forEach(spell => {
    if (!byLevel[spell.level]) byLevel[spell.level] = [];
    byLevel[spell.level].push(spell);
  });

  // Sort and display
  Object.keys(byLevel).sort((a, b) => a - b).forEach(level => {
    byLevel[level].sort((a, b) => a.name.localeCompare(b.name)).forEach(spell => {
      const li = document.createElement("li");
      li.className = "spell-chip";
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";
      li.style.padding = "5px";
      li.style.margin = "3px 0";
      li.style.borderRadius = "4px";
      
      const spellInfo = document.createElement("span");
      spellInfo.textContent = `${spell.name} (Level ${spell.level}, ${spell.school})`;
      
      const delBtn = document.createElement("button");
      delBtn.textContent = "❌";
      delBtn.className = "delete-spell";
      delBtn.addEventListener("click", () => removeSpellFromBook(spell.name, book, container));

      li.appendChild(spellInfo);
      li.appendChild(delBtn);
      list.appendChild(li);
    });
  });
}

function calculateCosts() {
  const baseGP = 50;
  const baseHours = 2;
  const guildBaseGP = 10;  // Already know the spell
  const guildBaseHours = 1;  // Already know the spell
  const scribingFee = 20;
  
  let totalHours = 0;
  let totalGP = 0;
  let totalGuildFee = 0;
  let spellSlotCosts = "Spell Slot Costs:\n";

  spellbooks.forEach(book => {
    const container = document.getElementById(`spellbook${book.id}`);
    if (!container) return;

    // Determine base costs based on book type
    const bookBaseGP = book.type === "guild" ? guildBaseGP : baseGP;
    const bookBaseHours = book.type === "guild" ? guildBaseHours : baseHours;

    // Get scribing tool selection
    const toolWand = container.querySelector(".toolWand").checked;
    const toolQuill = container.querySelector(".toolQuill").checked;

    let gp = 0;
    let hours = 0;

    // If using manual total levels input
    const manualLevels = parseInt(container.querySelector(".totalLevels").value) || 0;
    if (book.spells.length === 0 && manualLevels > 0) {
      gp = manualLevels * bookBaseGP;
      hours = manualLevels * bookBaseHours;
      
      // Apply tool modifiers for manual entry
      if (toolWand) gp /= 2;
      if (toolQuill) hours /= 2;
      
      totalGuildFee += book.type === "personal" ? manualLevels * scribingFee : 0;
    } else {
      // Group spells by school for per-school modifier application
      const spellsBySchool = {};
      book.spells.forEach(spell => {
        if (!spellsBySchool[spell.school]) {
          spellsBySchool[spell.school] = [];
        }
        spellsBySchool[spell.school].push(spell);
      });

      // Calculate costs for each school separately
      Object.keys(spellsBySchool).forEach(school => {
        const schoolSpells = spellsBySchool[school];
        const schoolLevels = schoolSpells.reduce((sum, s) => sum + s.level, 0);
        
        let schoolGP = schoolLevels * bookBaseGP;
        let schoolHours = schoolLevels * bookBaseHours;

        // Apply tool modifiers (affects all spells)
        if (toolWand) schoolGP /= 2;
        if (toolQuill) schoolHours /= 2;

        // Apply badge modifier for this specific school (halves both GP and time)
        if (book.badges && book.badges[school]) {
          schoolGP /= 2;
          schoolHours /= 2;
        }

        // Apply legacy savant modifier for this specific school (halves both GP and time)
        if (book.legacySavant === school) {
          schoolGP /= 2;
          schoolHours /= 2;
        }

        gp += schoolGP;
        hours += schoolHours;
      });

      // Guild fee for personal books only
      const totalLevels = book.spells.reduce((sum, s) => sum + s.level, 0);
      if (book.type === "personal" && totalLevels > 0) {
        totalGuildFee += totalLevels * scribingFee;
      }
    }

    gp = Math.ceil(gp);

    book._calc = { gp, hours };
    totalGP += gp;
    totalHours += hours;
  });

  document.getElementById("output").textContent = 
    `Total GP: ${totalGP}\nTotal Hours: ${totalHours}${totalHours > 18 ? " ⚠️ Warning: Only 18h of scribing allowed in a day." : ""}\nGuild Fee: ${totalGuildFee} gp`;

  // Generate badge movement plan
  const badgePlan = optimizeBadgeMovements();
  let badgePlanHTML = "";
  
  // Only show the plan if spell slots will be used
  const hasSlotCosts = Object.keys(badgePlan.slotCosts).length > 0;
  
  if (badgePlan.movements.length > 0 && hasSlotCosts) {
    const toggleId = 'badgePlanToggle_' + Date.now();
    badgePlanHTML = `<div class="badge-plan-box"><h3 class="badge-plan-heading" onclick="
        const content = document.getElementById('badgePlanContent');
        const toggle = document.getElementById('${toggleId}');
        if (content.style.display === 'none') {
          content.style.display = 'block';
          toggle.textContent = '▼';
        } else {
          content.style.display = 'none';
          toggle.textContent = '▶';
        }
      "><span id="${toggleId}">▶</span> 📋 Badge Movement Plan (click to expand)</h3><div id="badgePlanContent" style="display: none;"><ol style="padding-left: 20px;">`;
    
    badgePlan.movements.forEach(move => {
      if (move.isScribing) {
        badgePlanHTML += `<li class="badge-plan-scribing" style="margin: 8px 0;">${move.action}</li>`;
      } else if (move.slotLevel === 0) {
        badgePlanHTML += `<li class="badge-plan-note" style="margin: 8px 0;">${move.action} ${move.description || ''}</li>`;
      } else {
        badgePlanHTML += `<li style="margin: 8px 0;">${move.action} <span class="badge-plan-cost">${move.description}</span></li>`;
      }
    });
    
    badgePlanHTML += `</ol><div class="badge-plan-slots"><strong>Spell Slot Costs:</strong><br/>`;
    
    const sortedLevels = Object.keys(badgePlan.slotCosts).sort((a, b) => a - b);
    sortedLevels.forEach(level => {
      badgePlanHTML += `<span style="display: inline-block; margin-right: 15px;">${level}${getOrdinal(level)} level: ${badgePlan.slotCosts[level]} slot${badgePlan.slotCosts[level] !== 1 ? 's' : ''}</span>`;
      spellSlotCosts += `${level}${getOrdinal(level)} level: ${badgePlan.slotCosts[level]} slot${badgePlan.slotCosts[level] !== 1 ? 's' : ''}\n`;
    });
    
    badgePlanHTML += `</div></div></div>`;
    document.getElementById("output").innerHTML += badgePlanHTML;
  }

  generateDiscordMessages(totalGP, totalHours, totalGuildFee, spellSlotCosts);
  saveToStorage();
}

function optimizeBadgeMovements() {
  // Collect all books that need badges
  const badgeNeeds = []; // { bookId, bookName, school, startedAttached, staysAttached }
  
  spellbooks.forEach(book => {
    const activeSchools = new Set(book.spells.map(s => s.school));
    if (book.badges) {
      Object.keys(book.badges).forEach(school => {
        if (book.badges[school] && activeSchools.has(school)) {
          badgeNeeds.push({
            book: book,
            bookId: book.id,
            bookName: getBookDisplayName(book),
            school: school,
            startedAttached: book.badgeStartedAttached[school] || false,
            staysAttached: book.badgeStaysAttached[school] || false
          });
        }
      });
    }
  });
  
  if (badgeNeeds.length === 0) {
    return { movements: [], slotCosts: {} };
  }
  
  // Group by book first, then by school
  const byBook = {};
  badgeNeeds.forEach(need => {
    if (!byBook[need.bookId]) byBook[need.bookId] = [];
    byBook[need.bookId].push(need);
  });
  
  const allMovements = [];
  const slotCosts = {};
  
  // Process each book's badges
  Object.keys(byBook).forEach(bookId => {
    const bookNeeds = byBook[bookId];
    
    // Count how many badges start attached on this book
    const startedAttachedCount = bookNeeds.filter(n => n.startedAttached).length;
    let currentBadgeCount = startedAttachedCount;
    
    // Sort: startedAttached first, then by school name for consistency
    bookNeeds.sort((a, b) => {
      if (a.startedAttached && !b.startedAttached) return -1;
      if (!a.startedAttached && b.startedAttached) return 1;
      return a.school.localeCompare(b.school);
    });
    
    bookNeeds.forEach(need => {
      // Attach badge
      if (need.startedAttached) {
        allMovements.push({
          action: `${need.school} Badge already on ${need.bookName}`,
          slotLevel: 0,
          description: `(started attached, no cost)`
        });
      } else {
        const attachCost = 1 + currentBadgeCount;
        allMovements.push({
          action: `Attach ${need.school} Badge to ${need.bookName}`,
          slotLevel: attachCost,
          description: `(${currentBadgeCount} badge${currentBadgeCount !== 1 ? 's' : ''} on book → ${attachCost}${getOrdinal(attachCost)} level slot)`
        });
        slotCosts[attachCost] = (slotCosts[attachCost] || 0) + 1;
        currentBadgeCount++;
      }
      
      // Scribing happens here
      allMovements.push({
        action: `→ Scribe ${need.school} spells with ${need.bookName}`,
        slotLevel: 0,
        isScribing: true
      });
      
      // Detach badge
      if (!need.staysAttached) {
        const detachCost = 1 + currentBadgeCount;
        allMovements.push({
          action: `Detach ${need.school} Badge from ${need.bookName}`,
          slotLevel: detachCost,
          description: `(${currentBadgeCount} badge${currentBadgeCount !== 1 ? 's' : ''} on book → ${detachCost}${getOrdinal(detachCost)} level slot)`
        });
        slotCosts[detachCost] = (slotCosts[detachCost] || 0) + 1;
        currentBadgeCount--;
      }
      // If stays attached, just leave it (implied, no action needed)
    });
  });
  
  return { movements: allMovements, slotCosts };
}

function getBookDisplayName(book) {
  if (book.customName) return book.customName;
  if (book.type === "guild" && book.school) return `${book.school} Spellbook ${book.schoolNumber}`;
  if (book.type === "guild") return `Guild Spellbook`;
  if (book.personalNumber === 1) return "Personal Spellbook";
  return `Personal Spellbook ${book.personalNumber}`;
}

function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return (s[(v - 20) % 10] || s[v] || s[0]);
}

function generateDiscordMessages(totalGP, totalHours, totalGuildFee, spellSlotCosts) {
  const playerName = document.getElementById("playerName").value.trim() || "Drotar";
  const combinedModOutput = document.getElementById("combinedModOutput").checked;

  let notesMsg = "";
  let tradingMsg = "";
  let logMsg = `Name: ${playerName}`;

  // Track if we've seen the first personal spellbook
  let firstPersonalBookSeen = false;

  spellbooks.forEach(book => {
    if (!book._calc || book.spells.length === 0) return;

    const { gp, hours } = book._calc;
    
    // Determine book name for output
    let bookName;
    if (book.customName) {
      bookName = book.customName;
    } else if (book.type === "guild" && book.school) {
      bookName = `${book.school} Spellbook ${book.schoolNumber}`;
    } else if (book.type === "guild") {
      bookName = `Guild Spellbook`;
    } else {
      // For personal spellbooks
      if (!firstPersonalBookSeen && book.personalNumber === 1) {
        bookName = "their personal spellbook from a guild spellbook"; //need to possibly pluralize this if it's multiple spell schools
        firstPersonalBookSeen = true;
      } else {
        bookName = `Personal Spellbook ${book.personalNumber} from a guild spellbook`;
      }
    }

    // Format spell list with "and" before last item
    const spellNames = book.spells.map(s => s.name);
    let spellList;
    if (spellNames.length === 1) {
      spellList = spellNames[0];
    } else if (spellNames.length === 2) {
      spellList = spellNames.join(" and ");
    } else {
      spellList = spellNames.slice(0, -1).join(", ") + ", and " + spellNames[spellNames.length - 1];
    }

    const gpModifiers = [];
    const timeModifiers = [];
    
    const container = document.getElementById(`spellbook${book.id}`);
    if (container) {
      // Tool modifiers
      const toolWand = container.querySelector(".toolWand").checked;
      const toolQuill = container.querySelector(".toolQuill").checked;
      
      if (toolWand) {
        gpModifiers.push("Arcanist's Scribing Wand");
      }
      if (toolQuill) {
        timeModifiers.push("Pegasus Quill");
      }
      
      // Badges - combine all schools into one badge entry (only for schools with active spells)
      if (book.badges) {
        const activeSchools = new Set(book.spells.map(s => s.school));
        const badgeSchools = Object.keys(book.badges).filter(school => book.badges[school] && activeSchools.has(school)).sort();
        if (badgeSchools.length === 1) {
          const badgeText = `Badge of the Savant [${badgeSchools[0]}]`;
          gpModifiers.push(badgeText);
          timeModifiers.push(badgeText);
        } else if (badgeSchools.length > 1) {
          const badgeText = `Badge of the Savant [${badgeSchools.join(", ")}]`;
          gpModifiers.push(badgeText);
          timeModifiers.push(badgeText);
        }
      }
      
      // Legacy Savant - only one school, only if that school has active spells
      if (book.legacySavant && book.spells.some(s => s.school === book.legacySavant)) {
        const savantText = `${book.legacySavant} Savant [Legacy]`;
        gpModifiers.push(savantText);
        timeModifiers.push(savantText);
      }
    }
    
    if (combinedModOutput) {
      // Use the longer list (usually gpModifiers since wand is GP-only)
      const chosenMods = gpModifiers.length >= timeModifiers.length ? gpModifiers : timeModifiers;
      const combinedModText = chosenMods.length ? ` (${chosenMods.join(", ")})` : "";
      notesMsg += `${playerName} spends ${gp} gp and ${hours} hours${combinedModText} scribing ${spellList} into ${bookName}\n`;
    } else {
      const gpModText = gpModifiers.length ? ` (${gpModifiers.join(", ")})` : "";
      const timeModText = timeModifiers.length ? ` (${timeModifiers.join(", ")})` : "";
      notesMsg += `${playerName} spends ${gp} gp${gpModText} and ${hours} hours${timeModText} scribing ${spellList} into ${bookName}\n`;
    }

    logMsg += `\nScribed ${spellList} into ${bookName}.`;
  });

  if(spellSlotCosts != "Spell Slot Costs:\n") {
      notesMsg += spellSlotCosts;
  }

  // Collect schools scribed into personal books (for borrowing line)
  const borrowedBookSchools = new Set();
  const borrowedBadgeSchools = new Set();
  // Collect guild spellbook names that were scribed into (the player borrows the guild book)
  const borrowedGuildBookNames = new Set();
  // Track which schools are already represented by a borrowed guild book, to avoid duplicate entries
  const guildBookSchools = new Set();
  // Collect borrowed scribing tools
  const borrowedTools = new Set();

  spellbooks.forEach(book => {
    if (book.type === "personal" && book.spells.length > 0) {
      const schools = [...new Set(book.spells.map(s => s.school))];
      schools.forEach(s => borrowedBookSchools.add(s));
    }
    // Collect badge schools marked as borrowed (only for schools with active spells)
    if (book.badges) {
      const activeSchools = new Set(book.spells.map(s => s.school));
      Object.keys(book.badges).forEach(school => {
        if (book.badges[school] && activeSchools.has(school) && book.badgeBorrowed && book.badgeBorrowed[school]) {
          borrowedBadgeSchools.add(school);
        }
      });
    }
    // Collect guild books that have spells scribed into them (the player borrows the guild book)
    if (book.type === "guild" && book.spells.length > 0) {
      borrowedGuildBookNames.add(getBookDisplayName(book));
      if (book.school) guildBookSchools.add(book.school);
    }
    // Collect borrowed scribing tools (only if that tool's radio is also selected)
    const container = document.getElementById(`spellbook${book.id}`);
    if (container) {
      if (book.toolWandBorrowed && container.querySelector(".toolWand").checked) {
        borrowedTools.add("Arcanist's Scribing Wand");
      }
      if (book.toolQuillBorrowed && container.querySelector(".toolQuill").checked) {
        borrowedTools.add("Pegasus Quill");
      }
    }
  });

  // Filter out personal-book school entries already covered by a guild book of the same school
  const filteredBookSchools = [...borrowedBookSchools].filter(s => !guildBookSchools.has(s)).sort();
  const sortedBadgeSchools = [...borrowedBadgeSchools].sort();
  const sortedGuildBookNames = [...borrowedGuildBookNames].sort();
  const sortedBorrowedTools = [...borrowedTools].sort();

  let borrowingParts = [];

  if (filteredBookSchools.length > 0) {
    const bookLabel = filteredBookSchools.length === 1
      ? `${filteredBookSchools[0]} spellbook`
      : formatList(filteredBookSchools) + " spellbooks";
    borrowingParts.push(bookLabel);
  }

  // Add guild spellbook names that were scribed into
  if (sortedGuildBookNames.length > 0) {
    borrowingParts.push(formatList(sortedGuildBookNames));
  }

  if (sortedBadgeSchools.length > 0) {
    const badgeLabel = sortedBadgeSchools.length === 1
      ? `Badge of the Savant (${sortedBadgeSchools[0]})`
      : `Badges of the Savant (${formatList(sortedBadgeSchools)})`;
    borrowingParts.push(badgeLabel);
  }

  // Add borrowed scribing tools
  if (sortedBorrowedTools.length > 0) {
    borrowingParts.push(formatList(sortedBorrowedTools));
  }

  const borrowingLine = borrowingParts.length > 0
    ? `Borrowing and returning: ${borrowingParts.join(", ")}\n`
    : "";

  tradingMsg = `Name: ${playerName}\n${borrowingLine}`
  if(totalGuildFee > 0) {
    tradingMsg += `Paying: ${totalGuildFee} gp spell scribing fee\nTo: <@&1467171079981240522>\n`;
  } else {
    tradingMsg += `From: <@&1467171079981240522>\n`;}


logMsg = logMsg.replace(/, $/, '');
logMsg += `\nNotes-and-pings link: [x]\n${totalGuildFee > 0 ? "Trading link: [x]\n" : ""}<@&1454706630934401169>`;

document.getElementById("discordMessages").innerHTML =
  renderCopyBlock("notes-and-pings", `<a href="discord://discord.com/channels/813968500250902538/815444093442326549">#notes-and-pings:</a>`, notesMsg) +
  renderCopyBlock("trading", `<a href="discord://discord.com/channels/813968500250902538/857794594913779742">#trading:</a>`, tradingMsg) +
  renderCopyBlock("scribing-log", `<a href="discord://discord.com/channels/1451869478894964748/1456581480913309718">#scribing-log:</a>`, logMsg);
  }
// Helper: render a labelled message block with a Discord-style copy button
function renderCopyBlock(id, labelHTML, text) {
  const escapedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<div style="margin-bottom: 20px;"><div style="margin-bottom: 4px;">${labelHTML}</div><div style="position: relative;"><button onclick="navigator.clipboard.writeText(document.getElementById('copyText_${id}').innerText);const btn=this;btn.textContent='✓ Copied';btn.style.backgroundColor='#28a745';setTimeout(()=>{btn.textContent='⎘ Copy';btn.style.backgroundColor='';},2000);" style="position: absolute; top: 6px; right: 6px; padding: 3px 10px; font-size: 12px; background-color: var(--btn-neutral); color: white; border: none; border-radius: 4px; cursor: pointer;">⎘ Copy</button><pre id="copyText_${id}" style="background: #f4f4f4; border: 1px solid #ddd; border-radius: 6px; padding: 10px 70px 10px 10px; white-space: pre-wrap; word-break: break-word; font-family: monospace; margin: 0;">${escapedText}</pre></div></div>`;
}

// Helper: format a list with "and" before the last item
function formatList(items) {
  if (items.length === 1) return items[0];
  if (items.length === 2) return items[0] + " and " + items[1];
  return items.slice(0, -1).join(", ") + ", and " + items[items.length - 1];
}

function setupSpellAutocomplete(input, book, container) {
  let currentFocus = -1;
  const dropdown = document.createElement("div");
  const cs = () => getComputedStyle(document.documentElement);
  dropdown.className = "autocomplete-items";
  dropdown.style.position = "absolute";
  dropdown.style.border = `1px solid ${cs().getPropertyValue("--border").trim()}`;
  dropdown.style.backgroundColor = cs().getPropertyValue("--surface").trim();
  dropdown.style.zIndex = "1000";
  dropdown.style.maxHeight = "200px";
  dropdown.style.overflowY = "auto";
  dropdown.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
  dropdown.style.display = "none";
  document.body.appendChild(dropdown);

  function closeDropdown() {
    dropdown.innerHTML = "";
    dropdown.style.display = "none";
  }

  function updatePosition() {
    const rect = input.getBoundingClientRect();
    dropdown.style.left = `${rect.left + window.scrollX}px`;
    dropdown.style.top = `${rect.bottom + window.scrollY}px`;
    dropdown.style.width = `${rect.width}px`;
  }

  function renderMatches(matches) {
    dropdown.innerHTML = "";
    if (!matches.length) {
      dropdown.style.display = "none";
      return;
    }
    
    currentFocus = 0;
    matches.forEach((spell, idx) => {
      const item = document.createElement("div");
      item.innerHTML = `<strong>${spell.name}</strong> (Level ${spell.level}, ${spell.school})`;
      
      item.addEventListener("mouseenter", () => {
        currentFocus = idx;
        highlightItem();
      });
      
      item.addEventListener("click", () => {
        addSpellToBook(spell, book, container);
        input.value = "";
        closeDropdown();
        input.focus();
      });
      
      dropdown.appendChild(item);
    });
    dropdown.style.display = "block";
    highlightItem();
  }

  function highlightItem() {
    const items = dropdown.querySelectorAll("div");
    const highlight = getComputedStyle(document.body).getPropertyValue("--highlight").trim();
    items.forEach((item, idx) => {
      item.style.backgroundColor = idx === currentFocus ? highlight : "";
    });
  }

  input.addEventListener("input", function() {
    const val = this.value.toLowerCase();
    updatePosition();
    
    if (!val) {
      closeDropdown();
      return;
    }

    // Filter spells
    let matches = ALL_SPELLS.filter(s => 
      s.name.toLowerCase().includes(val) &&
      !book.spells.some(existing => existing.name === s.name)
    );

    // For guild books or locked personal books with a school, only show that school
    if ((book.type === "guild" || book.schoolLock) && book.school) {
      matches = matches.filter(s => s.school === book.school);
    }

    // Sort: starts-with first, then contains
    const startsWith = matches.filter(s => s.name.toLowerCase().startsWith(val))
      .sort((a, b) => a.name.localeCompare(b.name));
    const contains = matches.filter(s => !s.name.toLowerCase().startsWith(val))
      .sort((a, b) => a.name.localeCompare(b.name));

    renderMatches([...startsWith, ...contains].slice(0, 10));
  });

  input.addEventListener("keydown", function(e) {
    const items = dropdown.querySelectorAll("div");
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      currentFocus = (currentFocus + 1) % items.length;
      highlightItem();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      currentFocus = (currentFocus - 1 + items.length) % items.length;
      highlightItem();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (currentFocus > -1) items[currentFocus].click();
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target !== input) closeDropdown();
  });

  window.addEventListener("resize", updatePosition);
  window.addEventListener("scroll", updatePosition);
}

// Persist scribing calc state to session storage
function saveToStorage() {
  const state = {
    combinedModOutput: document.getElementById("combinedModOutput").checked,
    books: spellbooks.map(book => {
      const container = document.getElementById(`spellbook${book.id}`);
      let tool = "none";
      if (container) {
        if (container.querySelector(".toolWand").checked) tool = "wand";
        else if (container.querySelector(".toolQuill").checked) tool = "quill";
      }
      const manualLevels = container ? parseInt(container.querySelector(".totalLevels").value) || 0 : 0;
      return { ...book, tool, manualLevels };
    })
  };
  localStorage.setItem("scribingCalc", JSON.stringify(state));
}

// Restore all state from session storage
function restoreFromStorage() {
  const raw = localStorage.getItem("scribingCalc");
  if (!raw) return false;
  const state = JSON.parse(raw);

  document.getElementById("combinedModOutput").checked = state.combinedModOutput ?? true;

  state.books.forEach(savedBook => {
    createSpellbook(savedBook);
    // After createSpellbook, the book object is the last one pushed
    const book = spellbooks[spellbooks.length - 1];
    const container = document.getElementById(`spellbook${book.id}`);
    // Re-run modifier controls to rebuild badge UI from restored state
    updateModifierControls(book, container);
    updateSpellList(book, container);
    updateBookHeading(book, container);
  });

  updateSchoolNumbers();
  return true;
}

// Wipe all spells from all books, preserving all other settings
function wipeSpells() {
  if (!confirm("Remove all spells from all books? Badge settings, tools, and book configuration will be kept.")) return;
  spellbooks.forEach(book => {
    book.spells = [];
    if (book.type === "guild") {
      book.school = null;
      book.schoolNumber = null;
    } else if (!book.schoolLock) {
      book.school = null;
    }
    const container = document.getElementById(`spellbook${book.id}`);
    if (container) {
      const totalLevelsInput = container.querySelector(".totalLevels");
      totalLevelsInput.disabled = false;
      totalLevelsInput.style.opacity = "1";
      totalLevelsInput.parentElement.style.display = "block";
      updateSpellList(book, container);
      updateBookHeading(book, container);
      updateModifierControls(book, container);
    }
  });
  updateSchoolNumbers();
  calculateCosts();
}

// Initialize
restorePrefs();
if (!restoreFromStorage()) {
  createSpellbook();
}
document.getElementById("addBook").addEventListener("click", () => createSpellbook());
document.getElementById("wipeSpells").addEventListener("click", wipeSpells);
document.getElementById("legacyCharacter").addEventListener("change", () => {
  // If unchecked, clear any active legacy savant selections
  if (!document.getElementById("legacyCharacter").checked) {
    spellbooks.forEach(book => { book.legacySavant = null; });
  }
  savePrefs();
  // Rebuild modifier controls for all books to show/hide savant dropdowns
  spellbooks.forEach(book => {
    const container = document.getElementById(`spellbook${book.id}`);
    if (container) updateModifierControls(book, container);
  });
  calculateCosts();
});
document.getElementById("playerName").addEventListener("input", () => { savePrefs(); calculateCosts(); });
document.getElementById("combinedModOutput").addEventListener("change", calculateCosts);
calculateCosts();