// Main script for handling all functionality
// Some variables are imported from other scripts
// pokedex_data.js: items
// filters_global.js: typeColors, fidThreshold, fidToProc
// lang/en.js: headerNames, altText, catToName, infoText, biomeText, biomeLongText,
//             warningText, procTodesc, tagToDesc, fidToDesc, speciesNames, fidToName, helpMenuText
    
const itemList = document.getElementById('itemList');
const searchBox = document.getElementById('searchBox');
const pageTitle = document.getElementById('page-title');
const headerContainer = document.getElementById("header-container");
const filterContainer = document.getElementById("filter-container");
const suggestions = document.getElementById("suggestions");
const splashScreen = document.getElementById("splashScreen");
const splashContent = document.getElementById("splashContent");
const movesetScreen = document.getElementById("movesetScreen");
const movesetHeader = document.getElementById("movesetHeader");
const movesetContent = document.getElementById("movesetContent");
const movesetScrollable = document.getElementById("movesetScrollable");
const openHelpButton = document.getElementById("help-img");
const openLangButton = document.getElementById("lang-img");
const clearIcon = document.getElementById("clearIcon");
const sortAttributes = ['row','shiny','sp','type','ab','moves','co','bst','hp','atk','def','spa','spd','spe'];
const possibleFID = [...Array(fidThreshold[fidThreshold.length-1]-3).keys()]; // Remove -3 *********
const possibleSID = [...Array(items.length).keys()];
const supportedLangs = ["en","fr","es-ES","it","ko","zh-Hans","ja"];//"pt-BR","de"];
const LanguageNames  = ["English","Français","Español (España)","Italiano","한국어 (Hangugeo)","简体中文 (Jiǎntǐ Zhōngwén)","日本語 (Nihongo)"];//,"Português (Brasil)","Deutsch"];
const col = {pu:'rgb(140, 130, 240)', wh:'rgb(255, 255, 255)', ga:'rgb(145, 145, 145)', dg:'rgb(105, 105, 105)',
             bl:'rgb(131, 182, 239)', ye:'rgb(240, 230, 140)', re:'rgb(239, 131, 131)', pi:'rgb(216, 143, 205)',
             ge:'rgb(143, 214, 154)', or:'rgb(251, 173, 124)', cy:'rgb( 83, 237, 229)', dr:'rgb(247, 82,  49)'};
const tagColors = {0:col.pi, 1:col.re, 2:col.dr, 57:col.ye, 58:col.re, 61:col.ye, 62:col.re};
const moveCatColor = [col.or,col.bl,col.wh];
const tmColors = [col.wh,col.bl,col.ye];
const flipStats = {bst:'bst',hp:'spe',atk:'spd',def:'spa',spa:'def',spd:'atk',spe:'hp'};
const REMchance = [16,12,6,6,3];
let increment = 10;     // Number of items to load at a time
let renderLimit = 0;    // This value is updated when scrolling down (starts at 0)
let showMoveLearn = []; // Filtered moves/biomes to show sources
let filterToEnter = null; // Filter to apply when hitting Enter
let tabSelect = -1;       // Filter that is tab selected
let lockedFilters = [];   // List of all locked filters IDs
let lockedMods = []; // List of filter mod objects
let lockedFilterGroups = [[]]; // Filter IDs grouped together with "OR" condition
let pinnedRows = [];  // List of pinned row numbers
let isMobile = false; // Change display for mobile devices
let filteredItemIDs = null; // List of all displayed row numbers
// State of info screen: species shown, page(moveset,biome,family,zoom), shiny(0,1,2,3), fem(0,1), zoomImageHeight
let splashState = { speciesID: -1, page: 0, shiny: 0, fem: 0, zoomImgh: 300 }
let headerState = { shiny: 0, ability: 0, biome: 0 } // Global state of shiny(0,1,2,3), ability(0,1,2,3), biome(0,1)
let sortState = { sortAttr: 'row', ascending: true, index: 0 }; // Track the current sort state
let persistentState = false; // Whether filters are reloaded upon refresh
const TagToFID = { // List of ability/move FIDs that match specific tag filters
  [fidThreshold[10]]: possibleFID.filter((fid) => fid >= fidThreshold[0] && fid < fidThreshold[1] && (fidToProc[fid-fidThreshold[0]][1].includes(59))), // Lure ability
  [fidThreshold[10]+1]: possibleFID.filter((fid) => fid >= fidThreshold[0] && fid < fidThreshold[1] && (fidToProc[fid-fidThreshold[0]][1].includes(37))), // Ignores abilities
  [fidThreshold[10]+2]: possibleFID.filter((fid) => fid >= fidThreshold[1] && fid < fidThreshold[2] && (fidToProc[fid-fidThreshold[0]][1].includes(37))),
  [fidThreshold[10]+3]: possibleFID.filter((fid) => fid >= fidThreshold[1] && fid < fidThreshold[2] && (fidToProc[fid-fidThreshold[0]][1].includes(40))),
  // [fidThreshold[10]+3]: possibleFID.filter((fid) => fid >= fidThreshold[1] && fid < fidThreshold[2] && fidToProc[fid-fidThreshold[0]][5]>0 && fidToProc[fid-fidThreshold[0]][1]<2),
  [fidThreshold[10]+4]: possibleFID.filter((fid) => fid >= fidThreshold[1] && fid < fidThreshold[2] && fidToProc[fid-fidThreshold[0]][1]<2
    && (fidToProc[fid-fidThreshold[0]][1].includes(1) || fidToProc[fid-fidThreshold[0]][1].includes(2))),
  // Switches out target
  // Spread moves
  // Healing
  // Setup
  // Priority
}
  
// Perform initial display with detected language
let pageLang = detectLanguage();
console.log(pageLang);
loadAndApplyLanguage(pageLang);

function detectLanguage() { // Try to load the language from local storage or browser
  const langFromStorage = localStorage.getItem("preferredLang");
  if (langFromStorage && supportedLangs.includes(langFromStorage)) return langFromStorage 
  if (navigator.language) { // Detect language from browser
    const lang = navigator.language; const langOpt = [lang, lang.slice(0,5), lang.slice(0,2), lang.split('-')[0]];
    langOpt.forEach((thisLang) => { if (supportedLangs.includes(thisLang)) return thisLang });
  }
  return "en"; // Use English if no other language can be found
}
function loadAndApplyLanguage(lang) {
  pageLang = lang; // Remember the current language
  
  const oldScript = document.querySelector(`script[src^="lang/"]`);
  if (oldScript) oldScript.remove(); // Remove existing script if it exists

  // Import the language file
  const script = document.createElement("script"); script.src = `lang/${lang}.js`;
  script.onload = () => {
    console.log(`${lang}.js loaded successfully`);
    
    // Initialize the searchable names
    fidToSearch = fidToName.map((thisName, fid) => makeSearchable( // Search via category for later categories
      (fid >= fidThreshold[2] && fid < fidThreshold[8])||(fid >= fidThreshold[10]) ? `${catToName[fidToCategory(fid)]}${thisName}` : thisName
    ));
    specToSearch = speciesNames.map(s => makeSearchable(s));
    searchBox.placeholder = `${altText[4]} ${headerNames[2]} / ${headerNames[3]} / ${headerNames[4]} / ${altText[0]} ...`;
    
    // Set up the header columns
    headerColumns = [];
    headerNames.forEach((thisHeaderName, index) => {
      const newColumn = document.createElement('div');
      newColumn.innerHTML = thisHeaderName;  newColumn.textDef = thisHeaderName;  newColumn.index = index;
      newColumn.className = 'header-column'; newColumn.sortattr = sortAttributes[index];
      newColumn.addEventListener('click', () => updateHeader(newColumn));
      headerColumns.push(newColumn); // Push the column element into the array
    });      
    
    // Load persistent settings if enabled
    persistentState = JSON.parse(localStorage.getItem("persistentState"));
    if (persistentState) { // If persistent filters are enabled
      pinnedRows = loadFromStorage("pinnedRows") ?? [];
      headerState = loadFromStorage("headerState") ?? headerState;
      sortState = loadFromStorage("sortState") ?? sortState;
      const loadedGroups = loadFromStorage("lockedFilterGroups") ?? [[]];
      loadedGroups.forEach(group => group.forEach((fid,i) => lockFilter(fid, true, (i>0))));
    }
    adjustLayout(true, headerColumns[sortState.index ?? 0]); // Do initial display of pokemon
  }
  script.onerror = (e) => console.warn(`Failed to load ${lang}.js`, e);
  document.head.appendChild(script);
  console.log(`Attempting to load: ${script.src}`);
}
function loadFromStorage(key) {
  if (localStorage.getItem(key) !== null) return JSON.parse(localStorage.getItem(key));
}
function makeSearchable(input) { // Remove punctuation, accents, and compound characters
  return input.normalize("NFD").replace(/[\u0300-\u036f\u2019.:'\s-]/g,"").toLowerCase() // Dash must be at end of regex group
    .replace(/ß/g,"ss").replace(/œ/g,"oe").replace(/æ/g,"ae");
}

function refreshAllItems() { // Display items based on query and locked filters **************************
  const query = makeSearchable(searchBox.value);
  clearIcon.style.display = (searchBox.value.length && isMobile ? 'inline' : 'none'); // Show clear button on mobile

  itemList.querySelectorAll('li').forEach(li => li.replaceWith(li.cloneNode(true))); // Clones without listeners
  while (itemList.firstChild) itemList.firstChild.remove();

  filteredItemIDs = possibleSID;
  // Filter from query ==============
  if (query.length) {
    if (/^\d+$/.test(query)) { // If query is only digits
      filteredItemIDs = filteredItemIDs.filter(specID => items[specID].dex >= parseInt(query,10));
    } else { // For a standard query
      filteredItemIDs = filteredItemIDs.filter(specID => 
        specToSearch[specID].includes(query) ||
        fidToSearch[items[specID].t1]?.includes(query) ||
        fidToSearch[items[specID].t2]?.includes(query) ||
        ([0,1].includes(headerState.ability)
          && (fidToSearch[items[specID].a1]?.includes(query)||fidToSearch[items[specID].a2]?.includes(query))) ||
        ([0,2].includes(headerState.ability) && fidToSearch[items[specID].ha]?.includes(query)) ||
        ([0,3].includes(headerState.ability) && fidToSearch[items[specID].pa]?.includes(query)) );
    }
  } 
  // Filter from headers ==============
  if (headerState.ability == 2) filteredItemIDs = filteredItemIDs.filter(fid => 'ha' in items[fid]);
  // Filter from locked filters ==============
  if (lockedFilters.length) {
    filteredItemIDs = filteredItemIDs.filter(specID => // Search for filters with their fid as key
      lockedFilterGroups.every(thisGroup => // Match at least one filter from each group
        thisGroup.some(fid => {
          if (headerState.ability && fid >= fidThreshold[0] && fid < fidThreshold[1]) // Restricted ability filter
            return items[specID]?.[fid] == 309+headerState.ability || (headerState.ability == 1 && items[specID]?.[fid] == 309)
          if (fid  <  fidThreshold[2]) return fid in items[specID]; // Type/Ability/Move filters
          if (fid  <  fidThreshold[3]) return items[specID].ge === fid - fidThreshold[2] + 1; // Gen filters
          if (fid  <  fidThreshold[3]+10) return items[specID].co === fid - fidThreshold[3] + 1; // Cost equal filters
          if (fid  <  fidThreshold[3]+18) return items[specID].co <= fid - fidThreshold[3] - 8; // Cost LEQ filters
          if (fid  <  fidThreshold[4]) return items[specID].co >= fid - fidThreshold[3] - 16;   // Cost GEQ filters
          if (fid === fidThreshold[4]) return 'fe' in items[specID]; // Gender filter
          if (fid === fidThreshold[5]) return 'st' in items[specID]; // Starter select filter
          if (fid === fidThreshold[5]+1) return 'fs' in items[specID]; // Fresh start filter
          if (fid === fidThreshold[5]+2) return true; // Flipped stats filter
          if (fid  <  fidThreshold[7]-1) return items[specID].et === fid - fidThreshold[6]; // Egg tier filter
          if (fid === fidThreshold[7]-1) return [1,2,3].includes(items[specID]?.ex); // Egg exclusive
          if (fid === fidThreshold[7]) return 'nv' in items[specID]; // New variants
          if (fid === fidThreshold[7]+1) return items[specID].sh == 3; // All variants
          if (fid === fidThreshold[7]+2) return items[specID].sh == 1; // No variants
          if (fid  <  fidThreshold[9]) return fid in items[specID]; // Biome filter
          if (fid  <  fidThreshold[10]) return items[specID]?.fa === fid; // Family filter
          if (fid < fidThreshold[10]+2 && headerState.ability) // Restricted ability tag filter
            return TagToFID[fid].some(f => items[specID]?.[f] == 309+headerState.ability 
              || (headerState.ability == 1 && items[specID]?.[f] == 309));
          if (fid  <  fidThreshold[11]) return TagToFID[fid].some(f => f in items[specID]); // Other tag filters
          if (fid  >= fidThreshold[11]) return !(fid-fidThreshold[11] in items[specID]); // Exclusion filters
        }))) 
      }
  // Add moves to track in the move column  ==============
  showMoveLearn = lockedFilters.filter(f => [2,9].includes(fidToCategory(f)));
  lockedFilters.filter(f => f>fidThreshold[10]+1 && f<fidThreshold[11]).forEach(f => // For the move tag filters, add the associated FIDs
    showMoveLearn.push(...TagToFID[f].filter(fid => !showMoveLearn.some(ff => ff == fid))));
    
  // Remove the pinned items for now ==============
  if (pinnedRows) filteredItemIDs = filteredItemIDs.filter((thisID) => !pinnedRows.includes(thisID));

  // Sort items if a column is specified ==============
  if (sortState.sortAttr) {
    let effectiveSort = sortState.sortAttr;
    if (lockedFilters.some((f) => f == fidThreshold[5]+2) && sortState.sortAttr in flipStats) { // If flipped mode
      effectiveSort = flipStats[sortState.sortAttr]
    }
    filteredItemIDs.sort((a, b) => {
      let aValue = a; let bValue = b; // Set default attribute of row number
      if (sortState.sortAttr == 'moves') { // Sort by source of moves
        const getLearnLevel = (ID) => 
          showMoveLearn.reduce((total, move) => total + (move in items[ID] ? 
            (move >= fidThreshold[8] ? (items[ID][move][1] ? ~~(items[ID][move][0]/20)*0.9+~~(items[ID][move][1]/20)/10 
              : ~~(items[ID][move][0]/20)) : items[ID][move]) : 500), 0);
        aValue = getLearnLevel(a);
        bValue = getLearnLevel(b);
      } else if (sortState.sortAttr == 'type') { // Sort by type combinations
        const typeMult = (lockedFilters.some((fid) => fid < fidThreshold[0]) ? 2 : 36 );
        const aEntry = items[a]; const bEntry = items[b];
        aValue = (aEntry.t1+1)*(typeMult*!lockedFilters.includes(aEntry.t1));
        bValue = (bEntry.t1+1)*(typeMult*!lockedFilters.includes(bEntry.t1));
        if ('t2' in aEntry) aValue += (aEntry.t2*2+1)*!lockedFilters.includes(aEntry.t2);
        if ('t2' in bEntry) bValue += (bEntry.t2*2+1)*!lockedFilters.includes(bEntry.t2);
      } else if (sortState.sortAttr == 'sp') { // Sort by species names alphabetically
        aValue = speciesNames[a]; bValue = speciesNames[b];
      } else if (sortState.sortAttr != 'row') { // If anything OTHER than row number
        aValue = items[a][effectiveSort]; bValue = items[b][effectiveSort];
      }
      if (aValue < bValue) return sortState.ascending ? -1 : 1;
      if (aValue > bValue) return sortState.ascending ? 1 : -1;
      return 0;
    });
  }

  // Add pinned rows, they are not sorted ==============
  if (pinnedRows) {
    let rowsToAdd = pinnedRows.filter((ID) => !filteredItemIDs.includes(ID));
    filteredItemIDs = [...rowsToAdd, ...filteredItemIDs];
  }

  // Render suggestions and the first few items ==============
  displaySuggestions();
  renderLimit = 0;
  renderMoreItems();
  
  // Show error messages if there are no results
  if (!filteredItemIDs.length) { // No pokemon
    const helpMessage = document.createElement('div');  helpMessage.className = 'item-help-message';
    helpMessage.innerHTML = '<hr>';
    if (lockedFilters.some(f => f == fidThreshold[7] || f == fidThreshold[7]+1)) helpMessage.innerHTML += 
      `<img src="ui/shiny2.png"> <img src="ui/shiny3.png"> <b><span style="color:${col.pu};">${warningText[0]}</b><br><br></span>`;
    if (headerState.ability) helpMessage.innerHTML += 
      `<b><span style="color:${col.pu};">${warningText[headerState.ability]}</b><br><br></span>`;
    helpMessage.innerHTML += (suggestions.innerHTML 
      ? (lockedFilters.length ? warningText[4] : warningText[5]) 
      : (lockedFilters.length ? (query ? warningText[6] : warningText[7]) : warningText[8]));
    helpMessage.innerHTML += `<br><span style="color:rgb(145, 145, 145);">${warningText[9]}</span><hr>`;
    helpMessage.addEventListener('click', () => openHelpMenu());
    itemList.appendChild(helpMessage)
  }
}

function renderMoreItems() { // Create each list item, with columns of info **************************
  // console.log('Rendering more items');
  renderLimit += increment;
  let slicedItemIDs = filteredItemIDs.slice(renderLimit-increment,renderLimit)
  slicedItemIDs.forEach((thisID) => { // Generate each list item dynamically
    const li = document.createElement('li'); // Entry of one Pokemon
    const item = items[thisID]; // Grab the actual item from its ID
    
    // Show image of the pokemon
    const pokeImg = document.createElement('img');  pokeImg.className = 'item-image';  
    pokeImg.stars = []; // Keep a list of stars that can change the pokemon image 
    pokeImg.shinyOverride = Math.min(item.sh, headerState.shiny);  
    pokeImg.femOverride = (item?.fe == 1 ? +lockedFilters.some((f) => f == fidThreshold[4]) : 0);
    pokeImg.src = `images/${item.img}_${pokeImg.shinyOverride}${(pokeImg.femOverride ? 'f' : '')}.png`; 
    pokeImg.addEventListener('click', () => showInfoSplash(thisID, 3, pokeImg.shinyOverride, pokeImg.femOverride));
    
    // Create the dex column, with stars and pin only on desktop
    const dexColumn = document.createElement('div');  dexColumn.className = 'item-column';
    const starColumn = document.createElement('div'); starColumn.className = 'item-column';
    const pinColumn = document.createElement('div');  pinColumn.className = 'item-column';
    const pinImg = document.createElement('img');     pinImg.className = 'pin-img';   
    const femImg = document.createElement('img');     femImg.className = 'pin-img';   
    pinImg.src = `ui/pin${pinnedRows.includes(thisID)*1}.png`; femImg.src = `ui/fem${pokeImg.femOverride}.png`;
    if (!isMobile) pinImg.addEventListener('mouseover', () => pinImg.src = `ui/pinh.png`);
    if (!isMobile) pinImg.addEventListener('mouseout',  () => pinImg.src = `ui/pin${pinnedRows.includes(thisID)*1}.png`);
    pinImg.addEventListener('click', () => { // Add click event to the pin button
      if (pinnedRows.includes(thisID)) { // Remove this pokemon from the pins
        pinnedRows = pinnedRows.filter((thisPin) => (thisPin != thisID));
        pinImg.src = 'ui/pin0.png';
      } else { // Add this pokemon to the pins
        pinnedRows.push(thisID);
        pinImg.src = 'ui/pin1.png';
      }
      localStorage.setItem("pinnedRows",JSON.stringify(pinnedRows));
    });
    if (item?.fe == 1) {
      if (!isMobile) femImg.addEventListener('mouseover', () => femImg.src = `ui/fem1.png`);
      if (!isMobile) femImg.addEventListener('mouseout',  () => femImg.src = `ui/fem${pokeImg.femOverride}.png`);
      femImg.addEventListener('click', () => { // Add click event to the fem button
        pokeImg.femOverride = 1-pokeImg.femOverride; // Flip the fem state
        pokeImg.src = `images/${item.img}_${pokeImg.shinyOverride}${(pokeImg.femOverride ? 'f' : '')}.png`; 
        femImg.src = `ui/fem${pokeImg.femOverride}.png`;
      });
    }
    for (let i = 1; i < 4; i++) { // Create up to 3 shiny stars
      if (item.sh >= i) {
        const starImg = document.createElement('img'); starImg.className = 'star-img';
        starImg.src = `ui/shiny${(pokeImg.shinyOverride==i?i:0)}.png`;
        if (!isMobile) starImg.addEventListener('mouseover', () => starImg.src = `ui/shiny${i}.png`);
        if (!isMobile) starImg.addEventListener('mouseout',  () => starImg.src = `ui/shiny${(pokeImg.shinyOverride==i?i:0)}.png`);
        starImg.addEventListener('click', () => { // Add click events to all the stars, changing the poke image
          pokeImg.stars.forEach((thisStar) => thisStar.src = 'ui/shiny0.png');
          pokeImg.shinyOverride = (pokeImg.shinyOverride==i?0:i);
          pokeImg.src = `images/${item.img}_${pokeImg.shinyOverride}${(pokeImg.femOverride ? 'f' : '')}.png`;  
          starImg.src = `ui/shiny${(pokeImg.shinyOverride==i?i:0)}.png`;
        });
        pokeImg.stars.push(starImg);
      }
    }
    const wikiLink = `<a href="https://wiki.pokerogue.net/pokedex:${item.dex}" target="_blank">#${item.dex}</a><br>`;
    if (isMobile) { // Append to three different columns on mobile
      pinColumn.appendChild(pinImg);
      dexColumn.innerHTML = wikiLink;
      pokeImg.stars.forEach((thisStar) => starColumn.appendChild(thisStar));
      if (item?.fe == 1) {
        femImg.className = 'star-img';
        starColumn.appendChild(femImg);
      }
    } else { // Append all to the dex column on desktop
      dexColumn.appendChild(pinImg);
      if (item?.fe == 1) dexColumn.appendChild(femImg);
      const dexText = document.createElement('div');
      dexText.innerHTML = wikiLink;
      dexColumn.appendChild(dexText);
      pokeImg.stars.forEach((thisStar) => dexColumn.appendChild(thisStar));
    }
    
    const specColumn = document.createElement('div'); // Show species name
    specColumn.className = 'clickable-name';
    specColumn.innerHTML = speciesNames[thisID];
    specColumn.addEventListener('click', () => showInfoSplash(thisID, 0));
    
    const typeColumn = document.createElement('div'); // Show both types
    typeColumn.className = 'item-column';
    typeColumn.innerHTML = `<p style="color:${typeColors[item.t1]}; margin: 0;">${fidToName[item.t1]}</p>`;
    if ('t2' in item) typeColumn.innerHTML += `<p style="color:${typeColors[item.t2]}; margin: 0;">${fidToName[item.t2]}</p>`;
    
    // Show all four abilities
    const abilityColumn = document.createElement('div'); abilityColumn.className = 'item-column';
    ['a1','a2','ha','pa'].forEach((name) => {
      if (name in item) {
        const clickableRow = document.createElement('div');  clickableRow.className = 'clickable-name';
        clickableRow.style.color = abToColor(name);
        clickableRow.innerHTML = `<p style="margin: 0;">${fidToName[item[name]]}</p>`;
        clickableRow.addEventListener('click', () => showDescSplash(item[name]));
        abilityColumn.appendChild(clickableRow); 
      }
    });
    
    // Show the column of egg moves, biomes, or filtered moves/biomes and their sources
    const moveColumn = document.createElement('div');  moveColumn.className = 'item-column';  moveColumn.innerHTML = '';
    let numMovesShown = 0;
    showMoveLearn.forEach((thisFID) => { // Show filtered moves/biomes
      if (thisFID in item && numMovesShown < 3) {
        numMovesShown += 2;
        let src = item[thisFID];  let srcText = '<span style="color:';
        const clickableRow = document.createElement('div');  clickableRow.className = 'clickable-name';
        if (thisFID >= fidThreshold[8]) { // For biomes
          const rarityN = ~~(src[0]/20);  const rarityB = ~~(src[1]/20);
          if (rarityN && rarityB && [3,5,7,9].includes(rarityB)) { // Show both, with short labels
            srcText += `${makeBiomeDesc(rarityN,1)}</span><span style="color:rgb(255, 255, 255);"> / </span><span style="color:${makeBiomeDesc(rarityB,1)}`;
          } else { // Show the only rarity
            srcText += makeBiomeDesc(rarityN);
          }
          clickableRow.addEventListener('click', () => showInfoSplash(thisID,1));
          // biomeText = ['Common','Uncommon','Rare','Super Rare','Ultra Rare','Boss','Com','Unc','Rare','SR','UR','Dawn','Day','Dusk','Night']
        } else { // For moves
          if (src == -1) srcText += `rgb(251, 173, 124);">${altText[9]}`;
          else if (src == 0) srcText += `rgb(131, 182, 239);">${altText[10]}`;
          else if (src == 201) srcText += `rgb(255, 255, 255);">${altText[19]} / ${altText[16]}`;
          else if (src == 202) srcText += `rgb(255, 255, 255);">${altText[19]} / </span><span style="color:rgb(131, 182, 239);">${altText[16]}`;
          else if (src == 203) srcText += `rgb(255, 255, 255);">${altText[19]} / </span><span style="color:rgb(240, 230, 140);">${altText[16]}`;
          else if (src == 204) srcText += `rgb(255, 255, 255);">${altText[11]}`;
          else if (src == 205) srcText += `rgb(240, 230, 140);">${altText[19]}</span><span style="color:rgb(255, 255, 255);"> / ${altText[16]}`;
          else if (src == 206) srcText += `rgb(240, 230, 140);">${altText[19]}</span><span style="color:rgb(255, 255, 255);"> / </span><span style="color:rgb(131, 182, 239);">${altText[16]}`;
          else if (src == 207) srcText += `rgb(240, 230, 140);">${altText[19]}<span style="color:rgb(255, 255, 255);"> / </span>${altText[16]}`;
          else if (src == 208) srcText += `rgb(240, 230, 140);">${altText[12]}`;
          else if (src == 209) srcText += `rgb(255, 255, 255);">${altText[13]} ${altText[16]}`;
          else if (src == 210) srcText += `rgb(131, 182, 239);">${altText[14]} ${altText[16]}`;
          else if (src == 211) srcText += `rgb(240, 230, 140);">${altText[15]} ${altText[16]}`;
          else srcText += `rgb(255, 255, 255);">${altText[17]} ${item[thisFID]}`;
          clickableRow.addEventListener('click', () => showDescSplash(thisFID));
        };
        // Show the move name, with click event for splash screen
        clickableRow.innerHTML = `<p style="color:${col.pu}; margin: 0;">${fidToName[thisFID]}:<br>${srcText}</span></p>`;
        moveColumn.appendChild(clickableRow);
      }
    });
    // Show biomes if toggled, and if column is empty or if peeking over a move
    if (headerState.biome && (!numMovesShown || (showMoveLearn.every(f => fidToCategory(f)==2) && numMovesShown < 4))) {
      if ([1,2].includes(item?.ex) && !numMovesShown) { // Show egg exclusives only if blank
        const clickableRow = document.createElement('div');  clickableRow.className = 'clickable-name';
        if (item.ex == 1) clickableRow.innerHTML += `<span style="color:rgb(143, 214, 154);">${infoText[5]}</span>`;
        if (item.ex == 2) clickableRow.innerHTML += `<span style="color:rgb(216, 143, 205);">${infoText[6]}</span>`;
        clickableRow.addEventListener('click', () => showInfoSplash(thisID,1));
        moveColumn.appendChild(clickableRow);
      } else {
        possibleFID.slice(fidThreshold[8],fidThreshold[9]).forEach((fid) => { // Show biomes, even if peeking
          if (fid in item) {
            if (numMovesShown < 4) {
              const clickableRow = document.createElement('div');  clickableRow.className = 'clickable-name';
              if (showMoveLearn.length) clickableRow.style.color = col.ga;
              clickableRow.innerHTML = fidToName[fid];
              clickableRow.addEventListener('click', () => showInfoSplash(thisID,1));
              moveColumn.appendChild(clickableRow);
            } else if (numMovesShown == 4) { // Add dots if there is no room
              moveColumn.lastChild.innerHTML += ' ...';
            }
            numMovesShown += 1;
          }
        });
        // Vertically center if only one biome is peeking over a move
        if (numMovesShown == 3 && showMoveLearn.length) moveColumn.lastChild.style.marginTop = '6px'; 
      }
    } else if (!showMoveLearn.length) { // Show egg moves if there are no filtered moves/biomes
      ['e1','e2','e3','e4'].forEach((name) => {
        const clickableRow = document.createElement('div');  clickableRow.className = 'clickable-name';
        if (name == 'e4') clickableRow.style.color = col.ye;
        clickableRow.innerHTML = fidToName[item[name]]; // Show the move name, with click event for splash screen
        clickableRow.addEventListener('click', () => showDescSplash(item[name]));
        moveColumn.appendChild(clickableRow);
      });
    }

    // Show the cost, colored by the egg tier
    const costColumn = document.createElement('div'); costColumn.className = 'clickable-name';
          costColumn.innerHTML = `${headerNames[6]}<br><span style="color:${eggTierColors(item.et)};">${item.co}</span>`;  
          costColumn.addEventListener('click', () => showInfoSplash(thisID,1));
    // Create the stats columns
    const statColumns = [];
    const flipped = lockedFilters.includes(fidThreshold[5]+2);
    sortAttributes.slice(7,14).forEach((thisAtt,index) => {
      const newColumn = document.createElement('div');  newColumn.className = 'item-column';
      newColumn.innerHTML = `${headerNames[index+7]}<br>${item[(flipped?flipStats[thisAtt]:thisAtt)]}`;
      statColumns.push(newColumn);
    });
    // Append all the columns, according to the layout
    const layoutColumns = ( isMobile ?
      [[dexColumn,starColumn,specColumn,pinColumn],[pokeImg,abilityColumn,moveColumn],[typeColumn,costColumn,...statColumns]] :
      [[dexColumn,pokeImg,specColumn,typeColumn,abilityColumn,moveColumn,costColumn,...statColumns]]
    );
    layoutColumns.forEach(thisRow => {
      const newRow = document.createElement('div'); newRow.className = 'row';
      thisRow.forEach(thisColumn => newRow.appendChild(thisColumn));
      li.appendChild(newRow);
    });
    itemList.appendChild(li); // Append the current entry to the list of Pokemon
  });
}

function makeBiomeDesc(src, isSmall=0) {
  const offset = isSmall*6;
  if (src == 1) return `${col.wh};">${biomeText[0+offset]}`;
  if (src == 2) return `${col.bl};">${biomeText[1+offset]}`;
  if (src == 3) return `${col.bl};">${biomeText[5]} ${biomeText[0+offset]}`;
  if (src == 4) return `${col.ye};">${biomeText[2+offset]}`;
  if (src == 5) return `${col.ye};">${biomeText[5]} ${biomeText[2+offset]}`;
  if (src == 6) return `${col.re};">${biomeText[3+offset]}`;
  if (src == 7) return `${col.re};">${biomeText[5]} ${biomeText[3+offset]}`;
  if (src == 8) return `${col.pi};">${biomeText[4+offset]}`;
  if (src == 9) return `${col.pi};">${biomeText[5]} ${biomeText[4+offset]}`;
}

function makeMovesetHeader(specID) { // Create the moveset/info splash **************************
  movesetHeader.innerHTML = '';
  const item = items[specID]; splashState.speciesID = specID;
  
  const headerRow = document.createElement('div'); headerRow.className = 'moveset-banner';
  const arrowL = createArrow(false);  const arrowR = createArrow(true);
  const msImg = document.createElement('img'); msImg.src = `images/${item.img}_0.png`; msImg.className = 'moveset-image';
  const nameAndType = document.createElement('div'); nameAndType.style.maxHeight = '46px';
  const secondTypeText = ('t2' in item ? ` / <span style="color:${typeColors[item.t2]}; display:inline">${fidToName[item.t2]}</span>` : '')
  nameAndType.innerHTML = `${speciesNames[specID]}<br><span style="color:${typeColors[item.t1]}; display:inline">${fidToName[item.t1]}</span>${secondTypeText}`;
  [arrowL, msImg, nameAndType, arrowR].forEach(e => headerRow.appendChild(e));
  movesetHeader.append(headerRow, document.createElement('hr'));
  
  // const splashButton = document.createElement('div'); splashButton.className = 'splash-button'; 
  // splashButton.innerHTML = 'eeeeeeee'; splashButton.style.margin = '-10px auto -10px auto';
  // splashButton.addEventListener("click", () => mode = 3 );
  // movesetHeader.appendChild(splashButton);
  // movesetHeader.appendChild(document.createElement('hr'));
}
function createArrow(isRight) {
  const arrow = document.createElement('img');  arrow.src = 'ui/arrow.png';  arrow.className = 'moveset-arrow';
  if (isRight) arrow.style.transform = 'scaleX(-1)';
  if (!isMobile) arrow.addEventListener('mouseover', () => arrow.src = 'ui/arrowh.png');
  if (!isMobile) arrow.addEventListener('mouseout',  () => arrow.src = 'ui/arrow.png');
  arrow.addEventListener('click', () => changeMoveset(isRight ? 1 : -1));
  return arrow;
}
function showInfoSplash(specID, forcePage=null, forceShiny=null, forceFem=null) {
  if (forcePage != null) splashState.page = forcePage;
  if (splashState.page == 2) return;
  const item = items[specID];
  makeMovesetHeader(specID);
  movesetScrollable.innerHTML = '';
  // movesetScrollable.style.height = 'auto';
  movesetContent.style.width = '330px';
  if (splashState.page == 3) { // Show zoom image
    splashState.speciesID = specID;
    if (forceShiny != null) splashState.shiny = forceShiny;
    if (item.sh < splashState.shiny) splashState.shiny = 1;
    if (forceFem != null) splashState.fem = forceFem;
    if (item?.fe != 1) splashState.fem = 0;
    const zoomImg = document.createElement('img');
    zoomImg.src = `images/${item.img}_${splashState.shiny}${(splashState.fem ? 'f' : '')}.png`; 
    zoomImg.className = "zoom-img";
    // movesetScrollable.style.height = splashState.zoomImgh + "px"; // Use prev height to prevent jumping
    factor = (isMobile ? 3:6);
    zoomImg.onload = () => { // Image needs to load before reading dimensions
      zoomImg.style.width  = zoomImg.naturalWidth*factor + "px";
      zoomImg.style.height = zoomImg.naturalHeight*factor + "px";
      splashState.zoomImgh = zoomImg.naturalHeight*factor + 56;
      // movesetScrollable.style.height = splashState.zoomImgh + "px";
    };
    movesetScrollable.appendChild(zoomImg);
    movesetScrollable.appendChild(document.createElement('br'));
    movesetScrollable.stars = [];
    for (let i = 1; i < 4; i++) { // Create up to 3 shiny stars
      if (item.sh >= i) {
        const starImg = document.createElement('img'); starImg.className = 'zoom-star';
        starImg.src = `ui/shiny${(splashState.shiny==i?i:0)}.png`;
        if (!isMobile) starImg.addEventListener('mouseover', () => starImg.src = `ui/shiny${i}.png`);
        if (!isMobile) starImg.addEventListener('mouseout',  () => starImg.src = `ui/shiny${(splashState.shiny==i?i:0)}.png`);
        starImg.addEventListener('click', () => { // Add click events to all the stars, changing the zoom image
          movesetScrollable.stars.forEach((thisStar) => thisStar.src = 'ui/shiny0.png');
          splashState.shiny = (splashState.shiny==i?0:i);
          zoomImg.src = `images/${items[splashState.speciesID].img}_${splashState.shiny}${(splashState.fem ? 'f' : '')}.png`;  
          starImg.src = `ui/shiny${(splashState.shiny==i?i:0)}.png`;
        });
        movesetScrollable.stars.push(starImg);
        movesetScrollable.appendChild(starImg);
      }
    }
    if (item?.fe == 1) {
      const femImg = document.createElement('img'); femImg.className = 'zoom-star';
      femImg.src = `ui/fem${splashState.fem}.png`;
      if (!isMobile) femImg.addEventListener('mouseover', () => femImg.src = `ui/fem1.png`);
      if (!isMobile) femImg.addEventListener('mouseout',  () => femImg.src = `ui/fem${splashState.fem}.png`);
      femImg.addEventListener('click', () => {
        splashState.fem = 1-splashState.fem;
        zoomImg.src = `images/${item.img}_${splashState.shiny}${(splashState.fem ? 'f' : '')}.png`;
        femImg.src = `ui/fem${splashState.fem}.png`;
      });
      movesetScrollable.appendChild(femImg);
    }
    movesetContent.style.width = (isMobile ? '351px':'auto');
  }
  else if (splashState.page == 1) { // Show biomes
    if (item?.fx) movesetScrollable.innerHTML += biomeLongText[0]; // Description of form exclusivity
    if (item?.fx && item?.ex) movesetScrollable.innerHTML += '<br><br>';
    if (item?.ex) movesetScrollable.innerHTML += biomeLongText[item.ex]; // Description of species exclusivity
    possibleFID.slice(fidThreshold[8],fidThreshold[9]).forEach((fid) => {
      if (fid in item) {
        const biomeRow = document.createElement('div');  biomeRow.className = 'biome-row';
        if (!movesetScrollable.innerHTML) biomeRow.style.marginTop = '4px'; // Add margin if empty
        const biomeLink = document.createElement('a');
        biomeLink.href = `https://wiki.pokerogue.net/biomes:biomes#interactive_map`;  biomeLink.target = '_blank'; // Open in new tab
        const biomeImg = document.createElement('img');  biomeImg.src = `ui/biomes/${fid}.png`;  biomeImg.className = 'biome-img';
        biomeLink.appendChild(biomeImg);
        const biomeDesc = document.createElement('div'); biomeDesc.innerHTML = `<b>${fidToName[fid]}:</b>`;
        item[fid].forEach(src => {
          biomeDesc.innerHTML += `<br><span style="font-weight:bold; color:${makeBiomeDesc(~~(src/20))}</span>`;
          if (src%20) { // If limited to time of day (bitmasked in the 4 lowest bits)
            const timeText = [0,1,2,3].filter(i => 2**i&(src%20)).map(i => biomeText[11+i]).join(', ');
            biomeDesc.innerHTML += `<span style="font-size:16px;"> (${timeText})</span>`;
          }
        });
        if (!lockedFilters.some((f) => f%fidThreshold[11] == fid)) { // Button to add biome directly to filters
          const splashButton = document.createElement('div'); splashButton.className = 'splash-button';
          splashButton.innerHTML = altText[8];  
          splashButton.addEventListener("click", () => { lockFilter(fid); 
            splashScreen.classList.remove("show"); movesetScreen.classList.remove("show"); });
          biomeDesc.appendChild(document.createElement('br'));
          biomeDesc.appendChild(splashButton);
        }
        biomeRow.appendChild(biomeLink);
        biomeRow.appendChild(biomeDesc);
        movesetScrollable.appendChild(biomeRow);
      }
    });
    movesetScrollable.appendChild(document.createElement('hr'));
    const splashCostInfo = document.createElement('div');  splashCostInfo.className = 'splash-move-tags';
    const HAtext = ('ha' in item ? `<br>${infoText[4]}: 1 in 8` : '');
    // Info on friendship and candy
    splashCostInfo.innerHTML = `
      <p>${infoText[0]}: <span style="color:${col.re}";>${upgradeCosts[item.co-1][4]}</span> <img src="ui/fren.png"></p>
      <p>${infoText[1]}: <span style="color:${col.pu}";>${upgradeCosts[item.co-1][0]}</span> <img src="ui/candy.png" style="margin-bottom:-2px;"></p>
      <p>${infoText[2]}: <span style="color:${col.bl}";>${upgradeCosts[item.co-1][1]}</span> &
        <span style="color:${col.ye}";> ${upgradeCosts[item.co-1][2]}<span> <img src="ui/candy.png" style="margin-bottom:-2px;"></p>
      <p>${infoText[3]}: ${upgradeCosts[item.co-1][3]} <img src="ui/candy.png" style="margin-bottom:-2px;">
      <span style="color:${col.ga}; font-size:12px;"><br>${altText[12]}: 1 in ${REMchance[item.et]}${HAtext}
      <br>${headerNames[1]}: 1 in 12</span></p>
      `;
    movesetScrollable.appendChild(splashCostInfo);
  } else { // Show moveset
    const msHeaderText = document.createElement('div'); msHeaderText.className = 'moveset-row-header';
    msHeaderText.innerHTML = `<div>${altText[17]}</div><div>${catToName[2]}</div>
      <div>${altText[5]}</div><div>${altText[6]}</div><div>${altText[7]}</div>`;
    movesetHeader.appendChild(msHeaderText); 
    movesetHeader.appendChild(document.createElement('hr'));
    const moveList = [[],[]]; // Assemble list of moves
    for (const [key, value] of Object.entries(item)) {
      const intKey = Number(key);
      if (Number.isInteger(intKey) && intKey >= fidThreshold[1] && intKey < fidThreshold[2]) {
        if (value < 200) moveList[0].push(intKey);
        else if (value > 200 && value != 204 && value != 208) moveList[1].push(intKey);
      }
    }
    // Sort the moves by rarity, then by name
    moveList[0].sort((a, b) => item[a] > item[b] ? 1 : (item[a] < item[b]) ? -1 : 
      (fidToName[a] > fidToName[b] ? 1 : (fidToName[a] < fidToName[b] ? -1 : 0 ))); // Level moves
    moveList[1].sort((a, b) => item[a]%4 > item[b]%4 ? 1 : (item[a]%4 < item[b]%4) ? -1 : 
      (fidToName[a] > fidToName[b] ? 1 : (fidToName[a] < fidToName[b] ? -1 : 0 ))); // TM rarity is mod 4
    [moveList[0],[item.e1,item.e2,item.e3,item.e4],moveList[1]].forEach((thisList, tableIndex) => {
      if (thisList != moveList[0]) movesetScrollable.appendChild(document.createElement('hr'));
      thisList.forEach(move => makeMovesetRow(move, item, tableIndex));
    });
  }
  if (!movesetScreen.classList.contains('show')) {
    movesetScreen.classList.add("show"); 
    movesetScrollable.scrollTop = 0;
  }
}
function makeMovesetRow(fid, item, table) {
  const moveRow = document.createElement('div');  moveRow.className = 'moveset-row';
  const procs = fidToProc[fid-fidThreshold[0]];
  moveRow.innerHTML = `<div style="color:${moveSrcText(item[fid],table)}</div>
    <div style="color:${typeColors[procs[2]]};">${fidToName[fid]}</div>
    <div style="color:${moveCatColor[procs[3]]}">${(procs[4]==-1?'-':procs[4])}</div>
    <div style="color:${procs[1].includes(1)?col.re:(procs[1].includes(2)?col.dr:(procs[1].includes(0)?col.pi:col.wh))};">
      ${(procs[5]==-1?'-':procs[5])}</div>
    <div>${procs[6]}</div>`;
  moveRow.addEventListener('click', () => showDescSplash(fid));
  movesetScrollable.appendChild(moveRow);
}
function moveSrcText(src, table) {
  // src = -1:mushroom, 0:evo, 1-200:level, 201-203:egg/TM, 204:egg, 205-207:rare/TM, 208:rare, 209-211:TM
  // table must be specified so moves can appear as both Egg & TM
  if (table == 0) { // Level moves
    if (src == -1) return `${col.or};"><img src="ui/mem.png">`;
    if (src ==  0) return `${col.wh};">${altText[18]}`;
    return `${col.wh};">${src}`;
  } else if (table == 1) { // Egg moves
    return `${src < 205 ? col.wh:col.ye};">${altText[19]}`
  } // TM moves
  return `${tmColors[src%4-1]};">${(altText[16].length > 2 ? 'TM' : altText[16])}`
}
function changeMoveset(indexChange) {
  const index = filteredItemIDs.findIndex(ID => ID == splashState.speciesID) + indexChange;
    if (index >= 0 && index < filteredItemIDs.length) {
      window.scrollTo({top:(89+68*isMobile)*(index-2*!isMobile)});
      showInfoSplash(filteredItemIDs[index]);
    }
}

function showDescSplash(fid) { // Create the ability/move splash **************************
  splashContent.style.width = '300px';
  splashContent.innerHTML = `<b>${fidToName[fid]}</b><hr>`; // Name header
  const thisProcs = fidToProc[fid-fidThreshold[0]]; // List of atts, procs, tags
  if (fid>=fidThreshold[1]) { // For moves only
    const splashMoveRow = document.createElement('div');  splashMoveRow.className = 'splash-move-row';
    altText.slice(4,8).forEach((attName,index) => { // Show type and damage category, then Power, Accuracy, PP
      const splashMoveCol = document.createElement('div');
      if (!index) splashMoveCol.innerHTML = `<span style="color:${typeColors[thisProcs[2]]};">${fidToName[thisProcs[2]]}</span><br><img src="ui/cat${thisProcs[3]}.png">`;
      else splashMoveCol.innerHTML = `${attName}<br>${(thisProcs[3+index]==-1 ? '-' : thisProcs[3+index])}`;
      splashMoveRow.appendChild(splashMoveCol);
    });
    splashContent.appendChild(splashMoveRow);  splashContent.appendChild(document.createElement('hr'));
  }
  splashContent.innerHTML += fidToDesc[fid-fidThreshold[0]]; // Description of ability/move
  if (thisProcs[0] || thisProcs[1] || thisProcs[7]) {
    const splashMoveTags = document.createElement('div');  splashMoveTags.className = 'splash-move-tags';
    if (thisProcs[7]) { // If a non-zero priority move
      splashMoveTags.innerHTML += `<p style="color:${thisProcs[7]>0?col.ge:col.re};">${procToDesc[27]}: ${thisProcs[7]>0?'+':''}${thisProcs[7]}</p>`;
    }
    tagToDesc.forEach((thisDesc,index) => { // Check all tags for a match
      const tagColor = (index in tagColors ? ` style="color:${tagColors[index]};"` : '');
      if (index == 44) thisDesc += `<br><span style="color:${col.ga}; font-size:12px;">35% / 35% / 15% / 15%</span>`;
      if (thisProcs[1].includes(index)) splashMoveTags.innerHTML += `<p${tagColor}>${thisDesc}</p>`;
      if (index == 2) { // Show procs after targets
        thisProcs[0].forEach((thisProc) => { // Procs for stat boost, status, flinch, etc.
          const procChance = ((thisProc[0]>0)?`${thisProc[0]}% `:'');
          const procStages = ((thisProc[2]=='0')?'':` ${(thisProc[0]==-2?'× ':(thisProc[2]>0?'+':''))}${thisProc[2]}${thisProc[0]==-3?'%':''}`);
          splashMoveTags.innerHTML += `<p>${procChance}${procToDesc[thisProc[1]]}${procStages}</p>`;
        });
      }
    });
    splashContent.appendChild(splashMoveTags);
  }
  if (!lockedFilters.some((f) => f%fidThreshold[11] == fid)) { // Button to add ability/move directly to filters
    const splashButton = document.createElement('div'); splashButton.className = 'splash-button'; 
    splashButton.innerHTML = altText[8];  
    splashButton.addEventListener("click", () => { lockFilter(fid); 
      splashScreen.classList.remove("show"); movesetScreen.classList.remove("show"); });
    splashContent.appendChild(splashButton);
  }
  splashScreen.classList.add("show");
}

function fidToCategory(fid) {
  for (let i = 0; i < catToName.length; i++) {
    if (fid < fidThreshold[i]) return i;
  }
}
function fidToColor(fid) {
  if (fid < fidThreshold[0]) return [col.wh, typeColors[fid]];
  if (fid < fidThreshold[1]) return [col.pu, col.wh];
  if (fid < fidThreshold[2]) return [col.ga, col.wh];
  if (fid < fidThreshold[3]) return [col.bl, col.wh];
  if (fid < fidThreshold[4]) return [col.ye, col.wh];
  if (fid < fidThreshold[5]) return [col.pi, col.wh];
  if (fid < fidThreshold[6]) return [col.wh, col.re];
  if (fid < fidThreshold[7]) return [col.wh, eggTierColors(fid)]
  if (fid < fidThreshold[8]) return [col.cy, col.wh];
  if (fid < fidThreshold[9]) return [col.ge, col.wh];
  if (fid < fidThreshold[10])return [col.wh, col.pu];
  else return [col.ga, col.or];
}
function abToColor(src) {
  if (src == 'ha') return ([0,2].includes(headerState.ability) ? col.ye:col.dg)
  if (src == 'pa') return ([0,3].includes(headerState.ability) ? col.pu:col.ga)
  return ([0,1].includes(headerState.ability) ? col.wh:col.ga)
}
function eggTierColors(fid) {
  if (fid >= fidThreshold[6]) fid -= fidThreshold[6];
  if (fid == 0) return col.wh;
  if (fid == 1) return col.bl;
  if (fid == 2) return col.ye;
  if (fid == 3) return col.re;
  if (fid == 4) return col.pi;
  if (fid == 5) return col.ge;
  else { console.log('Invalid egg tier'); return null; }
}

// Display the filter suggestions *************************
function displaySuggestions() {
  filterToEnter = null;   suggestions.innerHTML = ''; // Clear the list
  const isExclusion = searchBox.value.startsWith('-');
  const query = makeSearchable(searchBox.value); // Get search query
  if (query.length) {
    // Filter by species name, to suggest families
    let filteredSID = possibleSID.filter((ID) => items[ID].dex.toString().includes(query) || specToSearch[ID].includes(query));
    if (filteredSID.length > 20) filteredSID = [];
    let offerFamilies = [...new Set(filteredSID.map(ID => items[ID].fa))];
    if (offerFamilies.length > 4) offerFamilies = [];
    // Filter suggestions based on query and exclude already locked filters
    let matchingFID = possibleFID.filter((fid) => {
      if (isExclusion && ![0,1,2,9].includes(fidToCategory(fid))) return false; // Only some categories can be exclusion filters
      if (lockedFilters.some((f) => f%fidThreshold[11] == fid)) return false; // Don't suggest if already locked
      if (fid >= fidThreshold[9] && offerFamilies.includes(fid)) return true; // Suggest matching families
      if (fid >= fidThreshold[10] && TagToFID[fid].some(f => fidToSearch[f].includes(query))) return true; // Suggest related tags
      return fidToSearch[fid].includes(query); // Suggest if it contains the search query
    });
    // Erase the list of suggestions if it is too large
    if (matchingFID.length > 22) matchingFID = [];
    // Highlight a suggestion if tab is hit
    if (matchingFID.length) {
      tabSelect %= matchingFID.length
      filterToEnter = matchingFID[(tabSelect == -1 ? 0 : tabSelect)];
    }
    matchingFID.forEach((fid) => { // Create the suggestion tag elements
      let newSugg = document.createElement('div');  newSugg.className = 'suggestion';
      newSugg.innerHTML = `${isExclusion?'<img src="ui/x.png">':''}<span style="color:${fidToColor(fid)[0]}; display:inline;">${catToName[fidToCategory(fid)]}: <span style="color:${fidToColor(fid)[1]}; display:inline;">${fidToName[fid]}</span></span>`;
      newSugg.addEventListener("click", () => lockFilter(fid));
      if (filterToEnter == fid && tabSelect != -1) newSugg.style.borderColor = col.pu;
      suggestions.appendChild(newSugg);
    });
  }
}

// Lock a filter *************************
function lockFilter(newLockFID, clearQuery = true, forceOR = null) {
  if (newLockFID == null) return;
  if (!lockedFilters.some((f) => f == newLockFID)) {
    const isExclusion = searchBox.value.startsWith('-')*fidThreshold[11];
    lockedFilters.push(newLockFID+isExclusion); // Add the filter to the locked filters list
    let filterMod = null;
    if (lockedFilters.length > 1) {
      // Default to "OR" for certain categories if matching previous filter
      const defaultOR = ([3,4,8,9,10].includes(fidToCategory(newLockFID)) 
        && fidToCategory(newLockFID) == fidToCategory(lockedFilters[lockedFilters.length-2]));
      filterMod = document.createElement("span"); filterMod.toggleOR = forceOR ?? defaultOR;
      filterMod.className = "filter-mod";         filterMod.innerHTML = (filterMod.toggleOR?'OR':'&');
      filterMod.addEventListener("click", () => toggleOR(filterMod));
      lockedMods.push(filterMod); filterContainer.appendChild(filterMod);
    }
    const filterTag = document.createElement("span"); filterTag.className = `filter-tag filter-tag-${isExclusion?"exc":"norm"}`;
    filterTag.innerHTML = `<img src="ui/${isExclusion?"x":"lock"}.png">${catToName[fidToCategory(newLockFID)]}: ${fidToName[newLockFID]}`;
    filterTag.addEventListener("click", () => removeFilter(newLockFID+isExclusion, filterTag, filterMod));
    filterContainer.appendChild(filterTag);
    // Clear the search bar after locking
    if (clearQuery) searchBox.value = ""; 
    updateFilterGroups();   
    // Update sorting if required, then refresh items and suggestions
    if ((newLockFID == fidThreshold[7] || newLockFID == fidThreshold[7]+1) && !headerState.shiny) { // Has variants
      updateHeader(headerColumns[1]);
    } else if (newLockFID == fidThreshold[7]+2 && headerState.shiny > 1) { // No variants
      headerState.shiny = 0; updateHeader(headerColumns[1]);
    } else if (sortState.sortAttr === 'row' && [2,9].includes(fidToCategory(newLockFID+isExclusion))) {
      updateHeader(headerColumns[5]); // Sort by Move/Biome for those new filters
    } else {
      updateHeader(null, true);
    }
  }
}

// Remove a filter **************************
function removeFilter(fidToRemove, tagToRemove, modToRemove) {
  if (!lockedMods.includes(modToRemove)) { // Try to find a mod to remove
    // If removing first filter, target the mod to the right
    if (lockedFilters.length > 1 && fidToRemove == lockedFilters[0]) modToRemove = lockedMods[0];
    // For other filters, target the mod to the left
    if (fidToRemove != lockedFilters[0]) modToRemove = lockedMods[lockedFilters.indexOf(fidToRemove)-1];
  }
  if (modToRemove) {
    // Determine which mod is more intuitive to remove (left or right)
    const modIndex = lockedMods.indexOf(modToRemove);
    if (modIndex < lockedMods.length-1 && fidToRemove != lockedFilters[0]) { // If there is another mod to the right
      if (!modToRemove.toggleOR && lockedMods[modIndex+1].toggleOR) { // If current mod is not "OR", but next mod is
        modToRemove = lockedMods[modIndex+1];
      }
    }
    // Remove the mod from the mod list, and remove the actual mod
    lockedMods = lockedMods.filter((f) => f != modToRemove); 
    modToRemove.remove();
  }
  // Remove the fid from the filter list, and remove the actual filter tag 
  lockedFilters = lockedFilters.filter((f) => f != fidToRemove);  tagToRemove.remove();
  updateFilterGroups();  
  if ((fidToRemove == fidThreshold[7] || fidToRemove == fidThreshold[7]+1) && headerState.shiny > 1) { 
    headerState.shiny = 0;  headerColumns[1].innerHTML = headerNames[1]; // Update header if removing shiny filter
  }
  // Reset the sorting if there aren't any more locked moves/biomes
  if (sortState.sortAttr === 'moves' && !lockedFilters.some(f => [2,9].includes(fidToCategory(f)))) { 
    updateHeader(headerColumns[0]); 
  } else { 
    updateHeader(null, true); // Update header, then refresh items and suggestions
  }
  if (!lockedFilters.length) { // Reset the animation of the page title
    pageTitle.classList.remove('colorful-text');  void pageTitle.offsetWidth;
    pageTitle.classList.add('colorful-text');
  }
  if (!isMobile) searchBox.focus();
}

function updateFilterGroups() { // Updates the grouping of filters based on AND/OR toggles
  lockedFilterGroups = [[]];
  let group = 0;
  lockedFilterGroups[group].push(lockedFilters[0]);
  for (let i = 0; i < lockedMods.length; i++) { // New group for AND, same group for OR
    if (!lockedMods[i].toggleOR) { group += 1;  lockedFilterGroups.push([]); } 
    lockedFilterGroups[group].push(lockedFilters[i+1]);
  }
  localStorage.setItem("lockedFilters",JSON.stringify(lockedFilters));
  localStorage.setItem("lockedFilterGroups",JSON.stringify(lockedFilterGroups));
  localStorage.setItem("lockedMods",JSON.stringify(lockedMods));
}

function toggleOR(filterMod) { // Click a filter to toggle it between AND and OR
  filterMod.toggleOR = !filterMod.toggleOR;
  filterMod.innerHTML = (filterMod.toggleOR ? 'OR' : '&');
  updateFilterGroups();
  refreshAllItems();
}

// Click on the header row to sort/filter by an attribute **************************
function updateHeader(clickTarget = null, ignoreFlip = false) {
  if (clickTarget == null) { clickTarget = headerColumns[sortState.index]; ignoreFlip = true; }
  const sortAttribute = clickTarget?.sortattr;
  const hasMovesBiomes = lockedFilters.some(f => [2,9].includes(fidToCategory(f)));
  // If clicking move column, with no moves/biomes filtered, toggle between egg moves and biomes
  if (sortAttribute == 'moves' && !hasMovesBiomes && !ignoreFlip) headerState.biome = !headerState.biome;
  // Set the text of the move column, depending on if a move is filtered
  if (lockedFilters.some(f => [2,9].includes(fidToCategory(f)))) { // If filtered moves/biomes
    headerColumns[5].textDef = `<span style="color:${col.pu};">${lockedFilters.some(f =>fidToCategory(f)==9) ? infoText[10] : altText[0]}</span>`;
  } else {
    headerColumns[5].textDef = headerState.biome ? `<span style="color:${col.pu};">${infoText[9]}</span>` : headerNames[5];
  }
  // Find the new sorting attribute, and update the headers
  if (sortAttribute == 'shiny') { // Toggle the global shiny state
    // Cap the selector to T1 if the "None" filter is selected or if the entire list only has T1
    const shinyCap = lockedFilters.some(f => f == fidThreshold[7]+2) 
      || (!filteredItemIDs.some(specID => items[specID].sh>1) && !!filteredItemIDs.length);
    headerState.shiny = (headerState.shiny+3)%(shinyCap?2:4);
  } else if (sortAttribute == 'ab') { // Toggle the global ability state
    headerState.ability = (headerState.ability+1)%4;
  } else {
    headerColumns[5].innerHTML = headerColumns[5].textDef;
    // If clicked on a header that can actually be sorted
    // (The "Moves" column can only be sorted if there is a filtered move/biome)
    if (sortAttribute && (sortAttribute != 'moves' || hasMovesBiomes)) { 
      if (sortState.sortAttr === sortAttribute) {
        if (!ignoreFlip) {
          sortState.ascending = !sortState.ascending; // Toggle sort direction if sorting by the same column
        }
      } else {
        sortState.sortAttr = sortAttribute;
        // Sort ascending on some columns, but descending on others
        sortState.ascending = ['row','sp','type','moves'].includes(sortState.sortAttr);
        if (headerColumns[sortState.index]?.textDef) { // Clear arrow from previous target
          headerColumns[sortState.index].innerHTML = headerColumns[sortState.index]?.textDef;
        }
      }
      sortState.index = clickTarget.index; // Draw arrow on new target
      clickTarget.innerHTML = `${clickTarget.textDef}<span style="color:${col.pu}; font-family: serif;">${(sortState.ascending?"&#9650;":"&#9660;")}</span>`;
    }
  }
  if (headerState.shiny) {
    headerColumns[1].innerHTML = `<span style="color:${col.pu};">${headerNames[1]}</span>`;
    const starImg = document.createElement('img');  starImg.className = 'star-header';
    starImg.src = `ui/shiny${headerState.shiny}.png`;
    headerColumns[1].appendChild(starImg);
    if (headerState.shiny == 3 && !lockedFilters.some(f => f == fidThreshold[7] || f == fidThreshold[7]+1)) {
      lockFilter(fidThreshold[7]+1,false);
    }
  } else {
    headerColumns[1].innerHTML = headerNames[1];
  }
  if (headerState.ability) {
    headerColumns[4].innerHTML = `<span style="color:${col.pu};">${headerNames[4]}</span>`;
    if      (headerState.ability == 1) headerColumns[4].innerHTML += `<span style="color:${col.wh}; font-size:12px;">(${altText[1]})</span>`;
    else if (headerState.ability == 2) headerColumns[4].innerHTML += `<span style="color:${col.ye}; font-size:12px;">(${altText[2]})</span>`;
    else if (headerState.ability == 3) headerColumns[4].innerHTML += `<span style="color:${col.pu}; font-size:12px;">(${altText[3]})</span>`;
  } else headerColumns[4].innerHTML = headerNames[4];
  localStorage.setItem("headerState",JSON.stringify(headerState));
  localStorage.setItem("sortState",JSON.stringify(sortState));
  refreshAllItems(); // Update the display
}

function adjustLayout(forceAdjust = false, headerClick = null) {
  if (isMobile != (window.innerWidth <= 768) || forceAdjust) {
    isMobile = (window.innerWidth <= 768);
    // Redraw all the header columns into the header container
    headerContainer.innerHTML = '';
    const thisRow = document.createElement('div'); thisRow.className = 'header-row';
    if (isMobile) {
      thisRow.appendChild(headerColumns[0]);  thisRow.appendChild(headerColumns[1]);
      thisRow.appendChild(headerColumns[4]);  thisRow.appendChild(headerColumns[2]);
      thisRow.appendChild(headerColumns[5]);
      headerContainer.appendChild(thisRow);
      const row2 = document.createElement('div'); row2.className = 'header-row';
      row2.appendChild(headerColumns[3]);
      for (const thisColumn of headerColumns.slice(6,14)) row2.appendChild(thisColumn);  
      headerContainer.appendChild(row2);
    } else {
      for (const thisColumn of headerColumns) thisRow.appendChild(thisColumn);  
      headerContainer.appendChild(thisRow);
    }
    increment = (isMobile ? 10 : 30);
    updateHeader(headerClick, true);
  }
}

// All event listeners **************************
window.addEventListener("resize", () => adjustLayout()); // Run on page load and when resizing the window
window.addEventListener("scroll", () => { // Load more items on scroll
  if (window.scrollY + window.innerHeight >= document.body.scrollHeight * 0.8 - 1000) renderMoreItems();
});
searchBox.addEventListener('input', (event) => { // Typing in search box
  tabSelect = -1;
  refreshAllItems();
});
document.addEventListener('keydown', (event) => { // All key press events
  const ignoredKeys = ["Escape", "Tab", "Shift", "PageDown", "PageUp", "Control", "Alt", "Meta", "CapsLock", 
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (!ignoredKeys.includes(event.key)) { // Ignore certain key presses
    // Ignore all key presses if 'Ctrl' is held, except when pasting
    if (!event.ctrlKey || event.code == "KeyV") {
      if (movesetScreen.classList.contains("show")) movesetScreen.classList.remove("show");
      if (splashScreen.classList.contains("show")) splashScreen.classList.remove("show");
      searchBox.focus(); // Focus the search box on any key press
    }
  }
  // Hit left/right to cycle moveset splash
  if (movesetScreen.classList.contains('show') && !splashScreen.classList.contains("show")) {
    if (event.key == "ArrowLeft") changeMoveset(-1);
    if (event.key == "ArrowRight") changeMoveset(1);
  }
  if (event.key == "ArrowUp" || event.key == "ArrowDown") {
    event.preventDefault();
    if (movesetScreen.classList.contains('show') && !splashScreen.classList.contains("show")) {
      movesetScrollable.scrollBy({top:(event.key == "ArrowUp" ? -46 : 46)});
    } else if (!splashScreen.classList.contains("show")) {
      window.scrollBy({top:(event.key == "ArrowUp" ? -89 : 89)});
    }
  }
  // Hit 'Enter' to lock first filter
  if (event.key == "Enter" && filterToEnter != null) lockFilter(filterToEnter);
  // Allow PageUp and PageDown even when in search box
  if (event.key == "PageDown" || event.key == "PageUp") searchBox.blur();
  // Hit escape to clear search box, text, last filter, or headers
  if (event.key == "Escape") {
    if (movesetScreen.classList.contains("show") && !splashScreen.classList.contains("show")) {
      movesetScreen.classList.remove("show");
    } else if (splashScreen.classList.contains("show")) { // Close splash screen
      splashScreen.classList.remove("show");
    } else if (searchBox.value.length) { // Clear text from the search box
      searchBox.value = '';
      refreshAllItems();
    } else if (lockedFilters.length) { // If there is locked filter
      const lastFilter = lockedFilters[lockedFilters.length - 1];
      const filterTags = document.querySelectorAll(".filter-tag");
      const lastTag = filterTags[filterTags.length - 1];
      const lastMod = lockedMods[lockedMods.length - 1];
      removeFilter(lastFilter, lastTag, lastMod); // Remove last filter
    } else if (headerState.shiny || headerState.ability) { // Clear header restrictions
      headerState.shiny = 0;   headerColumns[1].innerHTML = headerNames[1];
      headerState.ability = 0; headerColumns[4].innerHTML = headerNames[4];
      updateHeader();
    }
  }
  if (event.key == "Tab" && document.activeElement == searchBox) {
    tabSelect += 1 + (tabSelect == -1);
    displaySuggestions();
    event.preventDefault();
  }
});
// Clear search box button on mobile
clearIcon.addEventListener("click", () => {
  searchBox.focus();
  searchBox.value = '';
  refreshAllItems();
});
// Close splash screen when clicking outside the content box
splashScreen.addEventListener("click", (event) => {
  if (event.target === splashScreen) splashScreen.classList.remove("show");
});
movesetScreen.addEventListener("click", (event) => {
  if (event.target === movesetScreen) movesetScreen.classList.remove("show");
});
// Open the language selector splash
openLangButton.addEventListener('mouseover', () => openLangButton.src = `ui/globeh.png`);
openLangButton.addEventListener('mouseout',  () => openLangButton.src = `ui/globe.png` ); 
openLangButton.addEventListener("click",     () => openLangMenu());
function openLangMenu() {
  splashContent.style.width = '270px';
  splashContent.innerHTML = '<img src="ui/globe.png" class="lang-head-img">&nbsp<b>Change Language</b><hr style="margin-bottom: 0px;">';
  supportedLangs.forEach((thisLang, index) => {
    const thisLangRow = document.createElement('div'); thisLangRow.className = "splash-button";
    if (pageLang == thisLang) thisLangRow.style.color = col.pu;
    thisLangRow.innerHTML = `${LanguageNames[index]}`;
    thisLangRow.addEventListener("click", () => {
      localStorage.setItem("preferredLang", thisLang);
      loadAndApplyLanguage(thisLang);
      splashScreen.classList.remove("show");
    });
    if (thisLang != 'en') splashContent.appendChild(document.createElement('br'));
    splashContent.appendChild(thisLangRow);
  });
  splashScreen.classList.add("show"); // Make it visible
}
// Open the help menu splash
openHelpButton.addEventListener('mouseover', () => openHelpButton.src = `ui/helph.png`);
openHelpButton.addEventListener('mouseout',  () => openHelpButton.src = `ui/help.png` ); 
openHelpButton.addEventListener("click",     () => openHelpMenu());
function openHelpMenu() { // Show the instructions
  splashContent.style.width = '382px';
  splashContent.innerHTML = helpMenuText;
  const persistentButton = document.createElement('div'); persistentButton.className = 'splash-button'; 
  persistentButton.innerHTML = `Persistent Filters (Experimental) - ${persistentState?"ON":"OFF"}`;  
  persistentButton.style.color = persistentState?col.pu:col.wh;
  persistentButton.style.fontSize = "12px";
  persistentButton.addEventListener("click", () => { 
    persistentState = !persistentState;
    localStorage.setItem("persistentState",persistentState);
    persistentButton.innerHTML = `Persistent Filters (Experimental) - ${persistentState?"ON":"OFF"}`;  
    persistentButton.style.color = persistentState?col.pu:col.wh;
  });
  splashContent.appendChild(persistentButton);
  splashScreen.classList.add("show"); // Make it visible
}