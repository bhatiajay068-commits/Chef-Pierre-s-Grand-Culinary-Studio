/**
 * Pastel Cafe Recipe Rescaler - Interactive Script
 * Fully client-side with sound synthesis, deep voice greeting,
 * scattered floating utensils with household tips, and persistent recipe rescaling.
 */

// =========================================================================
// DATA & CONSTANTS
// =========================================================================
const STORAGE_KEY = 'pastel_cafe_recipe_rescaler_vanilla_v1';

const COMMON_UNITS = [
  'cups',
  'tbsp',
  'tsp',
  'grams',
  'ml',
  'oz',
  'lbs',
  'pieces',
  'cloves',
  'pinches',
];

const PRESET_RECIPES = [
  {
    name: 'Fluffy Strawberry Pancakes',
    emoji: '🥞',
    servings: 4,
    wanted: 8,
    ingredients: [
      { name: 'All-Purpose Flour', amount: '2', unit: 'cups' },
      { name: 'Fresh Milk', amount: '1.5', unit: 'cups' },
      { name: 'Granulated Sugar', amount: '0.25', unit: 'cups' },
    ],
  },
  {
    name: 'Choco-Chip Cafe Cookies',
    emoji: '🍪',
    servings: 12,
    wanted: 24,
    ingredients: [
      { name: 'Semi-Sweet Chocolate Chips', amount: '2', unit: 'cups' },
      { name: 'Unsalted Butter (melted)', amount: '1', unit: 'cups' },
      { name: 'Brown Sugar', amount: '0.75', unit: 'cups' },
    ],
  },
  {
    name: 'Cozy Matcha Latte Pastry',
    emoji: '🍵',
    servings: 2,
    wanted: 6,
    ingredients: [
      { name: 'Culinary Matcha Powder', amount: '3', unit: 'tbsp' },
      { name: 'Heavy Whipping Cream', amount: '1.25', unit: 'cups' },
      { name: 'Sweetened Condensed Milk', amount: '0.5', unit: 'cups' },
    ],
  },
];

// Household tips for scattered kitchen utensils
const UTENSIL_TIPS = {
  spoon: {
    emoji: '🥄',
    title: 'Silver Spoon Household Tip',
    tip: 'Dip a chilled metal spoon into a simmering sauce to check its coating consistency ("nappe") without scorching your tongue! Also, rubbing a stainless steel spoon on your hands under cold tap water neutralizes stubborn garlic and onion odors instantly!',
  },
  barbecue: {
    emoji: '🥩🔥',
    title: 'BBQ Tongs Household Tip',
    tip: 'Always click your BBQ tongs twice to calibrate chef accuracy! For cleaning hot grill grates safely, use your tongs to grip a cut onion half face-down—the natural enzymes and steam vaporize baked-on char with zero wire-bristle hazard!',
  },
  whisk: {
    emoji: '🥣',
    title: 'Balloon Whisk Household Tip',
    tip: 'When whipping cream or egg whites, whisk in an energetic figure-8 pattern instead of simple circular loops. This incorporates 40% more aerated micro-bubbles in half the mixing time!',
  },
  fork: {
    emoji: '🍴',
    title: 'Pastry Fork Household Tip',
    tip: 'Lightly dip fork tines in flour before crimping pie and pastry crusts to prevent dough sticking. You can also use two forks back-to-back to shred hot cooked chicken breast in seconds flat!',
  },
  knife: {
    emoji: '🔪',
    title: 'Santoku Knife Household Tip',
    tip: 'Place a damp paper towel or wet cloth beneath your wooden cutting board to anchor it firmly and eliminate dangerous slips! Hone your blade frequently with a ceramic rod so you never have to force a slice.',
  },
  seasoning: {
    emoji: '🧂',
    title: 'Pepper Mill Household Tip',
    tip: 'Gently toast whole black peppercorns in a dry skillet over low heat for 45 seconds before refilling your pepper mill. This awakens fragrant piperine oils, giving freshly cracked pepper 10x the aroma of stale store-bought powder!',
  },
};

// Rich collection of proud, funny, diverse French chef punchlines (no single repeated line!)
const CHEF_PUNCHLINES = [
  "Welcome to MY cafe! Look at my magnificent mustache—you have come to the right master for culinary advice!",
  "Look upon these arching eyebrows! They have judged world-champion soufflés and found them wanting!",
  "Rule number one of Pierre's kitchen: Butter is not merely an ingredient, butter is a sacred religion!",
  "You stand before the Cafe itself! Who else possesses such flawless mathematical taste and velvety sauces?",
  "In Paris they call me 'The Emperor of Emulsions'! Bask in my culinary wisdom, mon cher friend!",
  "Look at that dense, curled mustache—it only twitches when a recipe is balanced to divine culinary perfection!",
  "People cross oceans and climb snowy peaks just to ask Chef Pierre how much vanilla extract to add!",
  "Scaling recipes is pure geometry, but under my toque, it becomes a dazzling symphony of flavor!",
  "You need advice? Naturally! Even royalty requests Pierre's presence when scaling chocolate ganache!",
  "A pinch of patience, a mountain of butter, and Pierre's guidance—your feast will go down in cafe history!",
  "You have the good fortune to consult the finest culinary mind in the hemisphere! What is your next command?",
  "Notice how the whole cafe glows when Pierre smiles? That is what 30 years of pastry perfection looks like!",
];

let lastPunchlineIndex = -1;

function getFreshPunchline() {
  let nextIdx;
  do {
    nextIdx = Math.floor(Math.random() * CHEF_PUNCHLINES.length);
  } while (nextIdx === lastPunchlineIndex && CHEF_PUNCHLINES.length > 1);
  lastPunchlineIndex = nextIdx;
  return CHEF_PUNCHLINES[nextIdx];
}

// Convert decimals to culinary fractions
function toCulinaryFraction(val) {
  if (val <= 0) return '0';
  const whole = Math.floor(val);
  const remainder = val - whole;
  const tolerance = 0.04;

  let fraction = '';
  if (Math.abs(remainder - 0.25) <= tolerance) fraction = '¼';
  else if (Math.abs(remainder - 0.333) <= tolerance) fraction = '⅓';
  else if (Math.abs(remainder - 0.5) <= tolerance) fraction = '½';
  else if (Math.abs(remainder - 0.666) <= tolerance) fraction = '⅔';
  else if (Math.abs(remainder - 0.75) <= tolerance) fraction = '¾';
  else if (Math.abs(remainder - 0.125) <= tolerance) fraction = '⅛';
  else if (remainder < 0.05) {
    return whole > 0 ? `${whole}` : '0';
  } else {
    return `${parseFloat(val.toFixed(2))}`;
  }

  return whole > 0 ? `${whole} ${fraction}` : fraction;
}

// =========================================================================
// SOUND & KITCHEN SYNTHESIZER
// =========================================================================
let soundEnabled = true;

// Kitchen & Mascot Synthesized Sound Effects
function playSound(type) {
  if (!soundEnabled) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'spoon') {
      [0, 0.08, 0.2].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1750 + idx * 320, ctx.currentTime + offset);
        gain.gain.setValueAtTime(0.24, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.2);
      });
    } else if (type === 'fork') {
      [0, 0.07].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2400 + idx * 450, ctx.currentTime + offset);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.25);
      });
    } else if (type === 'knife') {
      [0, 0.12, 0.25].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, ctx.currentTime + offset);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + offset + 0.08);
        gain.gain.setValueAtTime(0.35, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.1);
      });
    } else if (type === 'barbecue') {
      // Double click tongs
      [0, 0.09].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(850, ctx.currentTime + offset);
        osc.frequency.exponentialRampToValueAtTime(1450, ctx.currentTime + offset + 0.04);
        gain.gain.setValueAtTime(0.32, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + offset + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.06);
      });

      // Hot sizzle noise
      const bufferSize = ctx.sampleRate * 0.45;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const bFilter = ctx.createBiquadFilter();
      bFilter.type = 'highpass';
      bFilter.frequency.value = 2600;

      const sizzleGain = ctx.createGain();
      sizzleGain.gain.setValueAtTime(0, ctx.currentTime + 0.14);
      sizzleGain.gain.linearRampToValueAtTime(0.24, ctx.currentTime + 0.18);
      sizzleGain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.55);

      noise.connect(bFilter);
      bFilter.connect(sizzleGain);
      sizzleGain.connect(ctx.destination);
      noise.start(ctx.currentTime + 0.14);
    } else if (type === 'whisk') {
      [0, 0.07, 0.14, 0.22].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(360 + idx * 70, ctx.currentTime + offset);
        osc.frequency.linearRampToValueAtTime(560 - idx * 50, ctx.currentTime + offset + 0.07);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + offset);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + offset + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.08);
      });
    } else if (type === 'seasoning') {
      [0, 0.05, 0.11, 0.17].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(650 + Math.random() * 300, ctx.currentTime + offset);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + offset + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.05);
      });
    } else if (type === 'chime') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.07);
        osc.stop(ctx.currentTime + i * 0.07 + 0.4);
      });
    } else if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } else if (type === 'boing') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    }
  } catch {
    // ignore
  }
}

// =========================================================================
// APPLICATION STATE & PERSISTENCE
// =========================================================================
let state = {
  dishName: 'Fluffy Strawberry Pancakes',
  servingsRecipeMakes: '4',
  servingsWanted: '8',
  ingredients: [
    { id: '1', name: 'All-Purpose Flour', amount: '2', unit: 'cups' },
    { id: '2', name: 'Fresh Milk', amount: '1.5', unit: 'cups' },
    { id: '3', name: 'Granulated Sugar', amount: '0.25', unit: 'cups' },
  ],
  isCalculated: true,
  hearts: 0,
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.dishName !== undefined) state.dishName = parsed.dishName;
      if (parsed.servingsRecipeMakes !== undefined) state.servingsRecipeMakes = String(parsed.servingsRecipeMakes);
      if (parsed.servingsWanted !== undefined) state.servingsWanted = String(parsed.servingsWanted);
      if (Array.isArray(parsed.ingredients) && parsed.ingredients.length >= 3) {
        state.ingredients = parsed.ingredients;
      }
      if (parsed.isCalculated !== undefined) {
        // Only keep calculated if servings are valid numbers > 0
        const m = parseFloat(state.servingsRecipeMakes);
        const w = parseFloat(state.servingsWanted);
        state.isCalculated = parsed.isCalculated && m > 0 && w > 0;
      }
    }
  } catch {
    // ignore
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

// =========================================================================
// DOM ELEMENTS
// =========================================================================
const dishNameInput = document.getElementById('dishNameInput');
const recipeMakesInput = document.getElementById('recipeMakesInput');
const servingsWantedInput = document.getElementById('servingsWantedInput');
const ingredientsList = document.getElementById('ingredientsList');
const addIngredientBtn = document.getElementById('addIngredientBtn');
const rescaleBtn = document.getElementById('rescaleBtn');
const errorCard = document.getElementById('errorCard');
const errorMessageText = document.getElementById('errorMessageText');
const resultsCard = document.getElementById('resultsCard');
const resultDishTitle = document.getElementById('resultDishTitle');
const resultServingsSubtitle = document.getElementById('resultServingsSubtitle');
const multiplierValue = document.getElementById('multiplierValue');
const scaledIngredientsGrid = document.getElementById('scaledIngredientsGrid');
const copyRecipeBtn = document.getElementById('copyRecipeBtn');
const copyText = document.getElementById('copyText');
const resetBtn = document.getElementById('resetBtn');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
const soundText = document.getElementById('soundText');
const presetsGrid = document.getElementById('presetsGrid');
const liveCommentaryText = document.getElementById('liveCommentaryText');

// Mascot elements
const mascotInteractive = document.getElementById('mascotInteractive');
const mascotBubble = document.getElementById('mascotBubble');
const mascotDialogueText = document.getElementById('mascotDialogueText');
const heartsCounter = document.getElementById('heartsCounter');
const scrollPercentBadge = document.getElementById('scrollPercentBadge');
const eyebrowIndicator = document.getElementById('eyebrowIndicator');
const chefEyebrows = document.getElementById('chefEyebrows');
const chefMustache = document.getElementById('chefMustache');
const chefHatGroup = document.getElementById('chefHatGroup');
const headerChefIcon = document.getElementById('headerChefIcon');
const closeBubbleBtn = document.getElementById('closeBubbleBtn');
const bubbleOpenPrompt = document.getElementById('bubbleOpenPrompt');
let isBubbleOpen = true; // Speech cloud visibility state

// Utensil Tip Toast
const utensilTipToast = document.getElementById('utensilTipToast');
const tipToastIcon = document.getElementById('tipToastIcon');
const tipToastTitle = document.getElementById('tipToastTitle');
const tipToastBody = document.getElementById('tipToastBody');
const closeTipBtn = document.getElementById('closeTipBtn');
let tipTimeout = null;

// =========================================================================
// RENDERING & UI LOGIC
// =========================================================================

// Render Preset Cards
function renderPresets() {
  presetsGrid.innerHTML = '';
  PRESET_RECIPES.forEach((preset) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preset-card-btn';
    btn.innerHTML = `
      <span class="preset-emoji">${preset.emoji}</span>
      <div style="min-width: 0;">
        <p class="preset-name">${preset.name}</p>
        <p class="preset-sub">Makes ${preset.servings} ➜ Target ${preset.wanted}</p>
      </div>
    `;
    btn.addEventListener('click', () => loadPreset(preset));
    presetsGrid.appendChild(btn);
  });
}

function loadPreset(preset) {
  playSound('pop');
  state.dishName = preset.name;
  state.servingsRecipeMakes = String(preset.servings);
  state.servingsWanted = String(preset.wanted);
  state.ingredients = preset.ingredients.map((ing, i) => ({
    id: String(Date.now() + i),
    name: ing.name,
    amount: ing.amount,
    unit: ing.unit,
  }));
  state.isCalculated = true;

  syncInputsToState();
  renderIngredients();
  renderCalculation();
  updateLiveCommentary();
  saveState();

  triggerChefAnimation();
  setMascotText(`Ohh, you loaded ${preset.name}! It was very delicious by the way! A timeless cafe classic!`);
}

// Render dynamic ingredients form rows
function renderIngredients() {
  ingredientsList.innerHTML = '';
  state.ingredients.forEach((ing, index) => {
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.dataset.id = ing.id;

    // Unit options HTML
    const optionsHtml = COMMON_UNITS.map(
      (u) => `<option value="${u}" ${ing.unit === u ? 'selected' : ''}>${u}</option>`
    ).join('');

    row.innerHTML = `
      <div class="ing-badge-wrap">
        <span class="ing-badge">${index + 1}</span>
      </div>
      <input 
        type="text" 
        class="cartoon-input ing-name-input" 
        placeholder="Ingredient #${index + 1} (e.g. Flour)" 
        value="${ing.name}"
      />
      <input 
        type="number" 
        step="any" 
        min="0" 
        class="cartoon-input ing-amount-input" 
        placeholder="Amount" 
        value="${ing.amount}"
      />
      <select class="cartoon-input ing-unit-select">
        ${optionsHtml}
      </select>
      ${
        state.ingredients.length > 3
          ? `<button type="button" class="ing-remove-btn" title="Remove ingredient">&times;</button>`
          : ''
      }
    `;

    // Event listeners
    const nameInput = row.querySelector('.ing-name-input');
    const amountInput = row.querySelector('.ing-amount-input');
    const unitSelect = row.querySelector('.ing-unit-select');
    const removeBtn = row.querySelector('.ing-remove-btn');

    nameInput.addEventListener('input', (e) => {
      ing.name = e.target.value;
      updateLiveCommentary();
      if (state.isCalculated) renderCalculation();
      saveState();
    });

    amountInput.addEventListener('input', (e) => {
      ing.amount = e.target.value;
      updateLiveCommentary();
      if (state.isCalculated) renderCalculation();
      saveState();
    });

    unitSelect.addEventListener('change', (e) => {
      ing.unit = e.target.value;
      if (state.isCalculated) renderCalculation();
      saveState();
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (state.ingredients.length <= 3) {
          alert('Our cafe standard requires at least 3 core ingredients!');
          return;
        }
        playSound('pop');
        state.ingredients = state.ingredients.filter((item) => item.id !== ing.id);
        renderIngredients();
        if (state.isCalculated) renderCalculation();
        saveState();
      });
    }

    ingredientsList.appendChild(row);
  });
}

function syncInputsToState() {
  dishNameInput.value = state.dishName;
  recipeMakesInput.value = state.servingsRecipeMakes;
  servingsWantedInput.value = state.servingsWanted;
}

// Live Chef Pierre Commentary on Ingredients
function updateLiveCommentary() {
  const dish = state.dishName.trim() || 'this delicacy';
  const flour = state.ingredients.find((i) => i.name.toLowerCase().includes('flour'));
  const sugar = state.ingredients.find(
    (i) => i.name.toLowerCase().includes('sugar') || i.name.toLowerCase().includes('honey')
  );
  const milk = state.ingredients.find(
    (i) => i.name.toLowerCase().includes('milk') || i.name.toLowerCase().includes('cream')
  );

  const flourAmt = flour ? parseFloat(flour.amount) : 0;
  const sugarAmt = sugar ? parseFloat(sugar.amount) : 0;
  const milkAmt = milk ? parseFloat(milk.amount) : 0;
  const makesNum = parseFloat(state.servingsRecipeMakes);
  const wantedNum = parseFloat(state.servingsWanted);

  let comment = `Ohh, you want to make ${dish}? It was very delicious by the way! A culinary choice of pure distinction!`;

  if (sugarAmt >= 1.5) {
    comment = `Ohh, you want to make ${dish}? It was remarkably delicious by the way! But look at that sweet ${sugarAmt} ${sugar?.unit || 'cups'} of sugar—my sweet tooth is doing a pirouette!`;
  } else if (flourAmt >= 3) {
    comment = `Ohh, making ${dish}? It was very delicious by the way! With ${flourAmt} ${flour?.unit || 'cups'} of flour, you are building an edible cathedral!`;
  } else if (milkAmt >= 2) {
    comment = `Ohh, ${dish}! Rich and creamy! A full ${milkAmt} ${milk?.unit || 'cups'} of dairy—Chef Pierre salutes your lavish good taste!`;
  } else if (!isNaN(wantedNum) && !isNaN(makesNum) && wantedNum > makesNum * 2) {
    comment = `Ohh, you want to make ${dish}? It was very delicious by the way! Scaling up to ${wantedNum} servings? You are throwing a grand party worthy of the cafe!`;
  }

  liveCommentaryText.textContent = `"${comment}"`;
}

// =========================================================================
// RESCALE ENGINE & STRICT RULE 4 VALIDATION
// =========================================================================
function renderCalculation() {
  const makesTrimmed = state.servingsRecipeMakes.trim();
  const wantedTrimmed = state.servingsWanted.trim();
  const makesNum = parseFloat(makesTrimmed);
  const wantedNum = parseFloat(wantedTrimmed);

  // CORE RULE 4: Show a message, and NO result, if either servings number is empty, zero or negative!
  if (makesTrimmed === '' || isNaN(makesNum) || makesNum <= 0 || wantedTrimmed === '' || isNaN(wantedNum) || wantedNum <= 0) {
    resultsCard.classList.add('hidden');

    let msg = '';
    if (makesTrimmed === '' || isNaN(makesNum)) {
      msg = '⚠️ Please enter how many servings the original recipe makes! It cannot be empty.';
    } else if (makesNum <= 0) {
      msg = `⚠️ Recipe servings must be greater than zero! You entered "${makesTrimmed}".`;
    } else if (wantedTrimmed === '' || isNaN(wantedNum)) {
      msg = '⚠️ Please enter how many servings you want! It cannot be empty.';
    } else if (wantedNum <= 0) {
      msg = `⚠️ Desired servings must be greater than zero! You entered "${wantedTrimmed}".`;
    }

    if (state.isCalculated) {
      errorCard.classList.remove('hidden');
      errorMessageText.textContent = msg;
    } else {
      errorCard.classList.add('hidden');
    }
    return;
  }

  // If servings are valid positive numbers:
  errorCard.classList.add('hidden');

  if (!state.isCalculated) {
    resultsCard.classList.add('hidden');
    return;
  }

  // Formula: original amount * (serving wanted / serving recipe makes)
  const ratio = wantedNum / makesNum;

  resultDishTitle.textContent = `Scaled Recipe for: ${state.dishName || 'Delicious Dish'}`;
  resultServingsSubtitle.textContent = `Recalculated for ${wantedNum} servings (originally made ${makesNum})`;
  multiplierValue.textContent = `${ratio.toFixed(2)}x`;

  scaledIngredientsGrid.innerHTML = '';
  state.ingredients.forEach((ing, idx) => {
    const origAmt = parseFloat(ing.amount.trim());
    const validOrig = !isNaN(origAmt) && origAmt >= 0 ? origAmt : 0;
    const newAmt = validOrig * ratio;
    const formattedAmt = parseFloat(newAmt.toFixed(3));
    const fractionText = toCulinaryFraction(newAmt);

    const card = document.createElement('div');
    card.className = 'scaled-card';
    card.innerHTML = `
      <div class="scaled-card-top">
        <div class="scaled-badge-row">
          <span class="scaled-badge">Ingredient #${idx + 1}</span>
          <span class="scaled-orig-note">${validOrig} ${ing.unit} orig.</span>
        </div>
        <h4 class="scaled-ing-name">${ing.name || `Ingredient ${idx + 1}`}</h4>
      </div>
      <div class="scaled-card-calc">
        <div class="scaled-new-label">New Required Amount:</div>
        <div class="scaled-amount-display">
          <span class="scaled-number">${formattedAmt}</span>
          <span class="scaled-unit">${ing.unit}</span>
        </div>
        ${
          fractionText !== `${formattedAmt}`
            ? `<div class="scaled-fraction-pill">≈ ${fractionText} ${ing.unit} (Kitchen fraction)</div>`
            : ''
        }
        <p class="scaled-formula-line">
          ${validOrig} × (${wantedNum} ÷ ${makesNum}) = ${formattedAmt}
        </p>
      </div>
    `;
    scaledIngredientsGrid.appendChild(card);
  });

  resultsCard.classList.remove('hidden');
}

// Rescale button click
function handleRescaleClick() {
  const makesTrimmed = state.servingsRecipeMakes.trim();
  const wantedTrimmed = state.servingsWanted.trim();
  const makesNum = parseFloat(makesTrimmed);
  const wantedNum = parseFloat(wantedTrimmed);

  if (makesTrimmed === '' || isNaN(makesNum) || makesNum <= 0 || wantedTrimmed === '' || isNaN(wantedNum) || wantedNum <= 0) {
    state.isCalculated = true; // trigger error display
    playSound('boing');
    renderCalculation();
    saveState();
    triggerChefAnimation(true);
    setMascotText("Sacré bleu! Servings must be positive numbers greater than 0! Pierre cannot divide by zero or un-bake a cake!");
    return;
  }

  // Valid!
  state.isCalculated = true;
  playSound('chime');
  renderCalculation();
  saveState();

  triggerChefAnimation(false);
  const punchline = getFreshPunchline();
  setMascotText(
    `Voilà! Pierre has recalculated every gram to perfection! Multiplier factor is ${(wantedNum / makesNum).toFixed(2)}x! ${punchline}`
  );
}

// Copy to Clipboard
function handleCopyRecipe() {
  const makesNum = parseFloat(state.servingsRecipeMakes);
  const wantedNum = parseFloat(state.servingsWanted);
  if (isNaN(makesNum) || isNaN(wantedNum) || makesNum <= 0 || wantedNum <= 0) return;

  const ratio = wantedNum / makesNum;
  playSound('chime');

  const lines = [
    `🍰 Scaled Recipe: ${state.dishName || 'Delicious Dish'}`,
    `Original Servings: ${makesNum} ➜ Target Servings: ${wantedNum} (Factor: ${ratio.toFixed(2)}x)`,
    `---------------------------------------`,
    ...state.ingredients.map((ing, i) => {
      const orig = parseFloat(ing.amount) || 0;
      const scaled = parseFloat((orig * ratio).toFixed(3));
      return `${i + 1}. ${ing.name || 'Ingredient'}: ${scaled} ${ing.unit} (was ${orig} ${ing.unit})`;
    }),
    `---------------------------------------`,
    `Crafted with love at Chef Pierre's Grand Culinary Studio 🥐`,
  ].join('\n');

  navigator.clipboard.writeText(lines).then(() => {
    copyText.textContent = 'Copied!';
    setTimeout(() => {
      copyText.textContent = 'Copy Recipe';
    }, 2500);
  });
}

// =========================================================================
// INTERACTIVE CHEF PIERRE & DEEP VOICE GREETING
// =========================================================================
function triggerChefAnimation(raiseEyebrowsOnly = false) {
  if (raiseEyebrowsOnly) {
    chefEyebrows.classList.add('eyebrows-raised');
    eyebrowIndicator.classList.remove('hidden');
    setTimeout(() => {
      chefEyebrows.classList.remove('eyebrows-raised');
      eyebrowIndicator.classList.add('hidden');
    }, 1500);
    return;
  }

  // Full proud reaction
  mascotInteractive.classList.add('proud-shake');
  chefEyebrows.classList.add('eyebrows-raised');
  chefMustache.classList.add('mustache-wiggling');
  eyebrowIndicator.classList.remove('hidden');

  setTimeout(() => {
    mascotInteractive.classList.remove('proud-shake');
    chefMustache.classList.remove('mustache-wiggling');
    setTimeout(() => {
      chefEyebrows.classList.remove('eyebrows-raised');
      eyebrowIndicator.classList.add('hidden');
    }, 800);
  }, 1400);
}

function toggleBubble(forceState) {
  if (typeof forceState === 'boolean') {
    isBubbleOpen = forceState;
  } else {
    isBubbleOpen = !isBubbleOpen;
  }

  if (isBubbleOpen) {
    mascotBubble.classList.remove('bubble-hidden');
    if (bubbleOpenPrompt) bubbleOpenPrompt.classList.add('hidden');
  } else {
    mascotBubble.classList.add('bubble-hidden');
    if (bubbleOpenPrompt) bubbleOpenPrompt.classList.remove('hidden');
  }
}

function setMascotText(text, autoOpen = true) {
  mascotDialogueText.textContent = text;
  if (autoOpen && !isBubbleOpen) {
    toggleBubble(true);
  }
}

// Mascot Click Handler: When clicked it will appear, and when clicked again it will disappear!
function handleMascotClick(e) {
  if (e && e.stopPropagation) e.stopPropagation();

  // If cloud is already open, clicking toggles it off (disappear)
  if (isBubbleOpen) {
    playSound('pop');
    toggleBubble(false);
    return;
  }

  // If cloud is closed, clicking makes it appear with animation and fresh punchline!
  state.hearts += 1;
  heartsCounter.textContent = `❤️ x${state.hearts}`;
  
  triggerChefAnimation();
  playSound('chime');

  const punchline = getFreshPunchline();
  setMascotText(punchline, false);
  toggleBubble(true);
}

// Scroll reaction for toque blanche hat
window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = totalHeight > 0 ? Math.min(Math.max(currentScrollY / totalHeight, 0), 1) : 0;

  scrollPercentBadge.textContent = `Scroll: ${Math.round(progress * 100)}%`;

  // Dynamically tilt chef toque hat as you scroll down
  const hatTilt = Math.sin(progress * Math.PI * 4) * 16;
  chefHatGroup.style.transform = `rotate(${hatTilt}deg)`;

  // Eyebrow arch on scroll
  if (progress > 0.25 && progress < 0.75) {
    chefEyebrows.classList.add('eyebrows-raised');
    eyebrowIndicator.classList.remove('hidden');
  } else {
    chefEyebrows.classList.remove('eyebrows-raised');
    eyebrowIndicator.classList.add('hidden');
  }
}, { passive: true });

// =========================================================================
// SCATTERED KITCHEN UTENSILS & HOUSEHOLD TIPS
// =========================================================================
function showUtensilTip(utensilKey) {
  const item = UTENSIL_TIPS[utensilKey];
  if (!item) return;

  playSound(utensilKey);

  // Animate the clicked utensil element
  const elem = document.querySelector(`.scattered-utensil[data-utensil="${utensilKey}"]`);
  if (elem) {
    elem.classList.add('utensil-bounce');
    setTimeout(() => elem.classList.remove('utensil-bounce'), 600);
  }

  // Display Tip Toast
  tipToastIcon.textContent = item.emoji;
  tipToastTitle.textContent = item.title;
  tipToastBody.textContent = item.tip;
  utensilTipToast.classList.remove('hidden');

  // Chef Pierre comments on the utensil
  triggerChefAnimation(true);
  setMascotText(`You clicked the ${item.title}! Notice the tip above—a true chef always knows their tools!`);

  // Auto hide after 8 seconds
  if (tipTimeout) clearTimeout(tipTimeout);
  tipTimeout = setTimeout(() => {
    utensilTipToast.classList.add('hidden');
  }, 8000);
}

// Attach event listeners to all scattered utensils
document.querySelectorAll('.scattered-utensil').forEach((btn) => {
  const utensilKey = btn.dataset.utensil;
  btn.addEventListener('click', () => showUtensilTip(utensilKey));
});

closeTipBtn.addEventListener('click', () => {
  utensilTipToast.classList.add('hidden');
});

// =========================================================================
// EVENT LISTENERS & INITIALIZATION
// =========================================================================
dishNameInput.addEventListener('input', (e) => {
  state.dishName = e.target.value;
  updateLiveCommentary();
  if (state.isCalculated) renderCalculation();
  saveState();
});

recipeMakesInput.addEventListener('input', (e) => {
  state.servingsRecipeMakes = e.target.value;
  updateLiveCommentary();
  renderCalculation();
  saveState();
});

servingsWantedInput.addEventListener('input', (e) => {
  state.servingsWanted = e.target.value;
  updateLiveCommentary();
  renderCalculation();
  saveState();
});

addIngredientBtn.addEventListener('click', () => {
  playSound('pop');
  state.ingredients.push({
    id: String(Date.now()),
    name: '',
    amount: '1',
    unit: 'cups',
  });
  renderIngredients();
  if (state.isCalculated) renderCalculation();
  saveState();
  setMascotText("Ooh! Adding another ingredient? Pierre loves an ambitious recipe with rich layers!");
});

rescaleBtn.addEventListener('click', handleRescaleClick);
copyRecipeBtn.addEventListener('click', handleCopyRecipe);

resetBtn.addEventListener('click', () => {
  playSound('boing');
  state.dishName = 'Berry Vanilla Tart';
  state.servingsRecipeMakes = '4';
  state.servingsWanted = '8';
  state.ingredients = [
    { id: '1', name: 'Fresh Strawberries', amount: '2', unit: 'cups' },
    { id: '2', name: 'Pastry Cream', amount: '1.5', unit: 'cups' },
    { id: '3', name: 'Almond Flour Crust', amount: '1', unit: 'cups' },
  ];
  state.isCalculated = true;
  syncInputsToState();
  renderIngredients();
  renderCalculation();
  updateLiveCommentary();
  saveState();
  setMascotText("A fresh canvas! Let us create another culinary legend together in my cafe!");
});

soundToggleBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    soundIcon.textContent = '🔊';
    soundText.textContent = 'Sound On';
    playSound('pop');
  } else {
    soundIcon.textContent = '🔇';
    soundText.textContent = 'Sound Off';
  }
});

mascotInteractive.addEventListener('click', handleMascotClick);
headerChefIcon.addEventListener('click', handleMascotClick);

// Clicking speech cloud closes it (disappear)
mascotBubble.addEventListener('click', (e) => {
  e.stopPropagation();
  playSound('pop');
  toggleBubble(false);
});

// Close button on speech cloud
if (closeBubbleBtn) {
  closeBubbleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playSound('pop');
    toggleBubble(false);
  });
}

// Mini prompt button when cloud is hidden (click to make it appear)
if (bubbleOpenPrompt) {
  bubbleOpenPrompt.addEventListener('click', (e) => {
    e.stopPropagation();
    handleMascotClick(e);
  });
}

// Keydown access for mascot
mascotInteractive.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleMascotClick();
  }
});

// INITIAL BOOTSTRAP
function init() {
  loadState();
  syncInputsToState();
  renderPresets();
  renderIngredients();
  renderCalculation();
  updateLiveCommentary();
}

init();
