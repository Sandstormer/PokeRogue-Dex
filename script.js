// script.js
// pokedex_data.js: items
// filters_global.js: typeColors, fidThreshold, fidToProc
// lang/en.js: headerNames, altText, catToName, fidToDesc, speciesNames, fidToName, helpMenuText
  // headerNames = ['Dex','Shiny','Species','Types','Abilities','Egg Moves','Cost','BST','HP','Atk','Def','SpA','SpD','Spe'];
  // altText = ['Moves','(Main Only)','(Hidden Only)','(Passive Only)','Search','Pow','Acc','PP'];
  // catToName = ['Type','Ability','Move','Generation','Cost','Gender','Mode','Egg Tier'];
// TBD: procToDesc, warningText, menuText, tagDesc
    
const itemList = document.getElementById('itemList');
const searchBox = document.getElementById('searchBox');
const pageTitle = document.getElementById('page-title');
const titleimg = document.getElementById('mag-img');
const headerContainer = document.getElementById("header-container");
const filterContainer = document.getElementById("filter-container");
const suggestions = document.getElementById("suggestions");
const splashScreen = document.getElementById("splashScreen");
const splashContent = document.getElementById("splashContent");
const openHelpButton = document.getElementById("help-img");
const openLangButton = document.getElementById("lang-img");
const sortAttributes = ['row','shiny','sp','type','ab','moves','co','bst','hp','atk','def','spa','spd','spe'];
const possibleFID = [...Array(fidThreshold[fidThreshold.length-1]).keys()];
const possibleSID = [...Array(items.length).keys()];
const supportedLangs = ["en","fr","ko"];//"it","es-ES","pt-BR","de","zh-CN","ja"];
const LanguageNames  = ["English","Français","한국어 (Hangugeo)"];//"Italiano","Español (España)","Português (Brasil)","Deutsch","简体中文 (Jiǎntǐ Zhōngwén)","日本語 (Nihongo)"];
let increment = 10;     // Number of items to load at a time
let renderLimit = 0;    // Start with no items
let showMoveLearn = []; // Filtered moves to show sources
let filterToEnter = null;  // Filter to apply when hitting Enter
let tabSelect = 0;         // Filter that is tab selected
let lockedFilters = [];    // List of all locked filters
let lockedFilterMods = []; // List of filter mod objects
let lockedFilterGroups = [[]]; // Grouped together for OR
let pinnedRows = [];  // List of pinned row numbers
let isMobile = false; // Change display for mobile devices
let filteredItemIDs = null; // List of all displayed row numbers
let shinyState = 0;   // Global state of shiny   (0,1,2,3)
let abilityState = 0; // Global state of ability (0,1,2,3)
let sortState = { column: null, ascending: true, target: null }; // Track the current sort state

procToDesc = [
  "User Atk","User Def","User SpAtk","User SpDef","User Speed","User Accuracy","User Evasion",
  "Atk","Def","SpAtk","SpDef","Speed","Accuracy","Evasion",
  "Applies Poison","Applies Toxic","Applies Sleep","Applies Freeze","Applies Paralysis","Applies Burn","Applies Confuse",
  "Flinch","User Atk/Def/SpA/SpD/Spe","Poison/Para/Sleep","Burn/Para/Freeze"];
  
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
    
    // Initialize some arrays
    fidToSearch = fidToName.map(str => str.toLowerCase().replace(/[.’'\s-]/g,''));
    searchBox.placeholder = `${altText[4]} ${headerNames[2]} / ${headerNames[3]} / ${headerNames[4]} / ${altText[0]} ...`;
    
    // Set up the header columns
    headerColumns = [];
    headerNames.forEach((thisHeaderName, index) => {
      const newColumn = document.createElement('div');
      newColumn.innerHTML = thisHeaderName;  newColumn.textDef = thisHeaderName;
      newColumn.className = 'header-column'; newColumn.sortattr = sortAttributes[index];
      newColumn.addEventListener('click', () => updateHeader(newColumn));
      headerColumns.push(newColumn); // Push the column element into the array
    });      
    
    // Display items, and initial sort by row number
    adjustLayout(headerColumns[0],true); // Should simplify .........
  }
  script.onerror = (e) => console.warn(`Failed to load ${lang}.js`, e);
  document.head.appendChild(script);
  console.log(`Attempting to load: ${script.src}`);
}

function refreshAllItems() { // Display items based on query and locked filters **************************
  // console.log('Refreshing all items');
  const query = searchBox.value.toLowerCase().replace(/[.’'\s-]/g,'');

  // itemList.innerHTML = ""; // Clear existing items
  itemList.querySelectorAll('li').forEach(li => li.replaceWith(li.cloneNode(true))); // Clones without listeners
  while (itemList.firstChild) itemList.firstChild.remove();

  filteredItemIDs = possibleSID;
  // Filter from query ==============
  if (query.length > 0) {
    filteredItemIDs = filteredItemIDs.filter((thisID) => 
      speciesNames[thisID].toLowerCase().replace(/[.’'\s-]/g,'').includes(query) ||
      fidToSearch[items[thisID].t1]?.includes(query) ||
      fidToSearch[items[thisID].t2]?.includes(query) ||
      ([0,1].includes(abilityState) && fidToSearch[items[thisID].a1]?.includes(query)) ||
      ([0,1].includes(abilityState) && fidToSearch[items[thisID].a2]?.includes(query)) ||
      ([0,2].includes(abilityState) && fidToSearch[items[thisID].ha]?.includes(query)) ||
      ([0,3].includes(abilityState) && fidToSearch[items[thisID].pa]?.includes(query)) ||
      items[thisID].dex.toString().includes(query)
  );}
  // Filter from headers ==============
  if (abilityState == 2) filteredItemIDs = filteredItemIDs.filter(thisID => 'ha' in items[thisID]);
  // Only show items that have that tier of shiny
  if (shinyState > 1)    filteredItemIDs = filteredItemIDs.filter(thisID => items[thisID].sh >= shinyState);
  // Filter from locked filters ==============
  if (lockedFilters.length > 0) {
    filteredItemIDs = filteredItemIDs.filter(thisID => // Search for filters with their fid as key
      lockedFilterGroups.every(thisGroup => // Match at least one filter from each group
        thisGroup.some(thisLockedFID => {
          if (abilityState != 0 && thisLockedFID >= fidThreshold[0] && thisLockedFID < fidThreshold[1]) {
            if (abilityState == 1)      return items[thisID]?.[thisLockedFID] == 309 || items[thisID]?.[thisLockedFID] == 310
            else if (abilityState == 2) return items[thisID]?.[thisLockedFID] == 311
            else if (abilityState == 3) return items[thisID]?.[thisLockedFID] == 312
          }
          if (thisLockedFID  <  fidThreshold[2]) return thisLockedFID in items[thisID]; // Type/Ability/Move filters
          if (thisLockedFID  <  fidThreshold[3]) return items[thisID].ge === thisLockedFID - fidThreshold[2] + 1; // Gen filters
          if (thisLockedFID  <  fidThreshold[4]) return items[thisID].co === thisLockedFID - fidThreshold[3] + 1; // Cost filters
          if (thisLockedFID === fidThreshold[4]) return items[thisID].fe === 1; // Gender filter
          if (thisLockedFID === fidThreshold[5]) return true; // Flipped stat filter
          if (thisLockedFID  <  fidThreshold[7]) return items[thisID].et === thisLockedFID - fidThreshold[6]; // Egg tier filter
          if (thisLockedFID  <  fidThreshold[8]) return items[thisID]?.fa === thisLockedFID; // Family filter
          console.warn('Filter error');
          return thisLockedFID in items[thisID];
        }))) 
      }
  // Add moves to track in the move column  ==============
  showMoveLearn = [];
  lockedFilters.forEach(thisLockedFID => {
    if (thisLockedFID >= fidThreshold[1] && thisLockedFID < fidThreshold[2]) showMoveLearn.push(thisLockedFID);
  });
  // Remove the pinned items for now ==============
  if (pinnedRows) filteredItemIDs = filteredItemIDs.filter((thisID) => !pinnedRows.includes(thisID));

  // Sort items if a column is specified ==============
  if (sortState.column) {
    filteredItemIDs.sort((a, b) => {
      // const aValue = a-2000*pinnedRows.includes(a); const bValue = b-2000*pinnedRows.includes(b);
      let aValue = a; let bValue = b; // Set default attribute of row number
      if (sortState.column == 'moves') { // Sort by source of moves
        const getLearnLevel = (ID) => 
          showMoveLearn.reduce((total, move) => total + (move in items[ID] ? items[ID][move] : 500), 0);
        aValue = getLearnLevel(a);
        bValue = getLearnLevel(b);
      } else if (sortState.column == 'type') { // Sort by type combinations
        const typeMult = (lockedFilters.some((fid) => fid < fidThreshold[0]) ? 2 : 36 );
        const aEntry = items[a]; const bEntry = items[b];
        aValue = (aEntry.t1+1)*(typeMult*!lockedFilters.includes(aEntry.t1));
        bValue = (bEntry.t1+1)*(typeMult*!lockedFilters.includes(bEntry.t1));
        if ('t2' in aEntry) {aValue += (aEntry.t2*2+1)*!lockedFilters.includes(aEntry.t2)}
        if ('t2' in bEntry) {bValue += (bEntry.t2*2+1)*!lockedFilters.includes(bEntry.t2)}
      } else if (sortState.column == 'sp') { // Sort by species names alphabetically
        aValue = speciesNames[a]; bValue = speciesNames[b];
      } else if (sortState.column != 'row') { // If anything other than row number
        let effectiveSort = sortState.column;
        if (lockedFilters.some((f) => f == fidThreshold[5])) { // If flipped mode
          if (sortState.column == 'hp')  {effectiveSort = 'spe';}
          if (sortState.column == 'atk') {effectiveSort = 'spd';}
          if (sortState.column == 'def') {effectiveSort = 'spa';}
          if (sortState.column == 'spa') {effectiveSort = 'def';}
          if (sortState.column == 'spd') {effectiveSort = 'atk';}
          if (sortState.column == 'spe') {effectiveSort = 'hp' ;}
        }
        aValue = items[a][effectiveSort]; bValue = items[b][effectiveSort];
      }
      if (aValue < bValue) return sortState.ascending ? -1 : 1;
      if (aValue > bValue) return sortState.ascending ? 1 : -1;
      return 0;
    });
  }

  // Add pinned rows, they are not sorted ==============
  if (pinnedRows) {
    let rowsToAdd = pinnedRows.filter((ID) => (!filteredItemIDs.includes(ID)));
    filteredItemIDs = [...rowsToAdd, ...filteredItemIDs];
  }

  // Render suggestions and the first few items ==============
  displaySuggestions();
  renderLimit = 0;
  renderMoreItems();
  // Show error messages if there are no results
  if (filteredItemIDs.length == 0) { // No pokemon
    const helpMessage = document.createElement('div');  helpMessage.className = 'item-help-message';
    helpMessage.innerHTML = '<hr>';
    if (shinyState > 1) helpMessage.innerHTML += '<b><span style="color:rgb(140, 130, 240);">Restricted to Pokemon that have shiny variants.</b><br><br></span>';
    if (abilityState > 0) helpMessage.innerHTML += '<b><span style="color:rgb(140, 130, 240);">Abilities are restricted to only ' + (abilityState == 1 ? 'Main' : (abilityState == 2 ? 'Hidden' : 'Passive'))+ ' Abilities.</b><br><br></span>';
    if (suggestions.innerHTML === '') { // No suggestions
      if (lockedFilters.length == 0) { // No locked filters
        helpMessage.innerHTML += '<b>There are no Pokemon or filters' + (isMobile ? '<br>' : ' ') + 'that match the search term' + (shinyState > 1 ? ' and have shiny variants.</b>' : '.</b><br>Please check your spelling and try again.');
      } else {
        if (query === '') {
          helpMessage.innerHTML += '<b>There are no Pokemon that match the filters.</b><br>Remove filters, or change the connections to "OR".';
        } else {
          helpMessage.innerHTML += '<b>There are no Pokemon that match' + (isMobile ? '<br>' : ' ') + 'the filters and the search term.</b><br>Try a different combination.';
        }
      }
    } else {
      if (lockedFilters.length == 0) { // No locked filters
        helpMessage.innerHTML += '<b>Click on a suggestion to filter it.</b><br>Filter preview is only for Species/Types/Abilities.';
      } else {
        helpMessage.innerHTML += '<b>There are no Pokemon that match the filters and the search term.</b><br>Adding another filter may change the results.';
      }
    }
  helpMessage.innerHTML += '<br><span style="color:rgb(145, 145, 145);">Click to see the instructions.</span><hr>'
  helpMessage.addEventListener('click', () => openHelpMenu());
  itemList.appendChild(helpMessage)
  }
}

function renderMoreItems() { // Create each list item, with rows and columns of info **************************
  // console.log('Rendering more items');
  renderLimit += increment;
  let slicedItemIDs = filteredItemIDs.slice(renderLimit-increment,renderLimit)
  slicedItemIDs.forEach((thisID) => { // Generate each list item dynamically
    const li = document.createElement('li'); // Entry of one Pokemon
    const item = items[thisID]; // Grab the actual item from its ID
    
    // Show image of the pokemon
    const pokeImg = document.createElement('img');  pokeImg.className = 'item-image';  
    pokeImg.stars = []; // Keep a list of stars that can change the pokemon image
    pokeImg.shinyOverride = (items[thisID].sh >= shinyState ? shinyState : (shinyState > 0)*1);  
    pokeImg.femOverride = (items[thisID].fe ? lockedFilters.some((f) => f == fidThreshold[4]) : 0);
    pokeImg.src = `images/${item.img}_${pokeImg.shinyOverride}${(pokeImg.femOverride ? 'f' : '')}.png`; 
    
    // Create the dex column, with stars and pin only on desktop
    const dexColumn = document.createElement('div');  dexColumn.className = 'item-column';
    const starColumn = document.createElement('div'); starColumn.className = 'item-column';
    const pinColumn = document.createElement('div');  pinColumn.className = 'item-column';
    const pinImg = document.createElement('img');     pinImg.className = 'pin-img';   
    const femImg = document.createElement('img');     femImg.className = 'pin-img';   
    pinImg.src = `ui/pin${pinnedRows.includes(thisID)?'on':'off'}.png`; femImg.src = `ui/fem${(pokeImg.femOverride?'on':'off')}.png`;
    pinImg.addEventListener('mouseover', () => pinImg.src = `ui/pinhover.png`);
    pinImg.addEventListener('mouseout',  () => pinImg.src = `ui/pin${(pinnedRows.includes(thisID)?'on':'off')}.png`);
    pinImg.addEventListener('click', () => { // Add click event to the pin button
      if (pinnedRows.includes(thisID)) { // Remove this pokemon from the pins
        pinnedRows = pinnedRows.filter((thisPin) => (thisPin != thisID));
        pinImg.src = 'ui/pinoff.png';
      } else { // Add this pokemon to the pins
        pinnedRows.push(thisID);
        pinImg.src = 'ui/pinon.png';
      }
    });
    if (item.fe == 1) {
      femImg.addEventListener('mouseover', () => femImg.src = `ui/femon.png`);
      femImg.addEventListener('mouseout',  () => femImg.src = `ui/fem${(pokeImg.femOverride?'on':'off')}.png`);
      femImg.addEventListener('click', () => { // Add click event to the fem button
        pokeImg.femOverride = 1-pokeImg.femOverride; // Flip the fem state
        pokeImg.src = `images/${item.img}_${pokeImg.shinyOverride}${(pokeImg.femOverride ? 'f' : '')}.png`; 
        femImg.src = `ui/fem${(pokeImg.femOverride ? 'on' : 'off')}.png`;
      });
    }
    for (let i = 1; i < 4; i++) { // Create up to 3 shiny stars
      if (item.sh >= i) {
        const starImg = document.createElement('img'); starImg.className = 'star-img';
        starImg.src = `ui/shiny${i}${(pokeImg.shinyOverride==i ? '' : 'g')}.png`;
        starImg.addEventListener('mouseover', () => starImg.src = `ui/shiny${i}.png`);
        starImg.addEventListener('mouseout',  () => starImg.src = `ui/shiny${i}${(pokeImg.shinyOverride==i?'':'g')}.png`);
        starImg.addEventListener('click', () => { // Add click events to all the stars, changing the poke image
          pokeImg.stars.forEach((thisStar) => thisStar.src = 'ui/shiny1g.png');
          pokeImg.shinyOverride = (pokeImg.shinyOverride==i ? 0 : i);
          pokeImg.src = `images/${item.img}_${pokeImg.shinyOverride}${(pokeImg.femOverride ? 'f' : '')}.png`;  
          starImg.src = `ui/shiny${i}${(pokeImg.shinyOverride==i ? '' : 'g')}.png`;
        });
        pokeImg.stars.push(starImg);
      }
    }
    if (isMobile) { // Append to three different columns on mobile
      pinColumn.appendChild(pinImg);
      dexColumn.innerHTML = `<a href="https://wiki.pokerogue.net/pokedex:${item.dex}" target="_blank">#${item.dex}</a><br>`;
      pokeImg.stars.forEach((thisStar) => starColumn.appendChild(thisStar));
      if (item.fe == 1) {
        femImg.className = 'star-img';
        starColumn.appendChild(femImg);
      }
    } else { // Append all to the dex column on desktop
      dexColumn.appendChild(pinImg);
      if (item.fe == 1) dexColumn.appendChild(femImg);
      const dexText = document.createElement('div');
      dexText.innerHTML = `<a href="https://wiki.pokerogue.net/pokedex:${item.dex}" target="_blank">#${item.dex}</a><br>`;
      dexColumn.appendChild(dexText);
      pokeImg.stars.forEach((thisStar) => dexColumn.appendChild(thisStar));
    }
    
    const specColumn = document.createElement('div'); // Show species name
    specColumn.className = 'item-column';
    specColumn.innerHTML = speciesNames[thisID];
    
    const typeColumn = document.createElement('div'); // Show both types
    typeColumn.className = 'item-column';
    typeColumn.innerHTML = `<p style="color:${typeColors[item.t1]}; margin: 0;">${fidToName[item.t1]}</p>`;
    if ('t2' in item) typeColumn.innerHTML += `<p style="color:${typeColors[item.t2]}; margin: 0;">${fidToName[item.t2]}</p>`;
    
    // Show all four abilities
    const abilityColumn = document.createElement('div'); abilityColumn.className = 'item-column';
    ['a1','a2','ha','pa'].forEach((name) => {
      if (name in item) {
        const clickableRow = document.createElement('div');  clickableRow.className = 'clickable-name';
        clickableRow.innerHTML = `<p style="color:${abToColor(name)}; margin: 0;">${fidToName[item[name]]}</p>`;
        clickableRow.addEventListener('click', () => {showMoveSplash(item[name]);});
        abilityColumn.appendChild(clickableRow); 
      }
    });
    
    // Show the column of egg moves, or filtered moves and their sources
    const moveColumn = document.createElement('div');  moveColumn.className = 'item-column';  moveColumn.innerHTML = '';
    let numMovesShown = 0;
    showMoveLearn.forEach((thisMove) => {
      if (thisMove in item && numMovesShown < 2) { 
        numMovesShown += 1;
        let source = item[thisMove];
        if (source == -1) {sourceText = `<span style="color:rgb(251, 173, 124);">${altText[9]}`;}
        else if (source == 0) {sourceText = `<span style="color:rgb(131, 182, 239);">${altText[10]}`;}
        else if (source == 201) {sourceText = `<span style="color:rgb(255, 255, 255);">${altText[11]}`;}
        else if (source == 202) {sourceText = `<span style="color:rgb(240, 230, 140);">${altText[12]}`;}
        else if (source == 203) {sourceText = `<span style="color:rgb(255, 255, 255);">${altText[13]} ${altText[16]}`;}
        else if (source == 204) {sourceText = `<span style="color:rgb(131, 182, 239);">${altText[14]} ${altText[16]}`;}
        else if (source == 205) {sourceText = `<span style="color:rgb(240, 230, 140);">${altText[15]} ${altText[16]}`;}
        else {sourceText = `<span style="color:rgb(255, 255, 255);">${altText[17]} ${item[thisMove]}`;}
        // Show the move name, with click event for splash screen
        const clickableRow = document.createElement('div');  clickableRow.className = 'clickable-name';
        clickableRow.innerHTML = `<p style="color:rgb(140, 130, 240); margin: 0;"> 
                                 ${fidToName[thisMove]}:<br>${sourceText}</span></p>`;
        clickableRow.addEventListener('click', () => showMoveSplash(thisMove));
        moveColumn.appendChild(clickableRow);
      }
    });
    if (showMoveLearn.length == 0) {
      ['e1','e2','e3','e4'].forEach((name) => {
        // Show the move name, with click event for splash screen
        const clickableRow = document.createElement('div');  clickableRow.className = 'clickable-name';
        if (name == 'e4') clickableRow.style.color = 'rgb(240, 230, 140)';
        // clickableRow.style.color = typeColors[fidToProc[item[name]-fidThreshold[1]][0]];
        clickableRow.innerHTML = fidToName[item[name]];
        clickableRow.addEventListener('click', () => showMoveSplash(item[name]));
        moveColumn.appendChild(clickableRow);
      });
    }

    // Show the cost, colored by the egg tier
    const costColumn = document.createElement('div'); costColumn.className = 'item-column';
          costColumn.innerHTML = `${headerNames[6]}<br><span style="color:${eggTierColors(item.et)};">${item.co}</span>`;  
    let flipped = lockedFilters.includes(fidThreshold[5]);                
    const bstColumn = document.createElement('div');  bstColumn.className = 'item-column'; // Create the stats columns
          bstColumn.innerHTML = `${headerNames[ 7]}<br>${item.bst}`;
    const hpColumn = document.createElement('div');   hpColumn.className = 'item-column';  
          hpColumn.innerHTML  = `${headerNames[ 8]}<br>${(flipped ? item.spe : item.hp)}`;
    const atkColumn = document.createElement('div');  atkColumn.className = 'item-column'; 
          atkColumn.innerHTML = `${headerNames[ 9]}<br>${(flipped ? item.spd : item.atk)}`;    
    const defColumn = document.createElement('div');  defColumn.className = 'item-column'; 
          defColumn.innerHTML = `${headerNames[10]}<br>${(flipped ? item.spa : item.def)}`;    
    const spaColumn = document.createElement('div');  spaColumn.className = 'item-column'; 
          spaColumn.innerHTML = `${headerNames[11]}<br>${(flipped ? item.def : item.spa)}`;    
    const spdColumn = document.createElement('div');  spdColumn.className = 'item-column'; 
          spdColumn.innerHTML = `${headerNames[12]}<br>${(flipped ? item.atk : item.spd)}`;    
    const speColumn = document.createElement('div');  speColumn.className = 'item-column'; 
          speColumn.innerHTML = `${headerNames[13]}<br>${(flipped ? item.hp  : item.spe)}`;

    const row1 = document.createElement('div'); row1.className = 'row'; let row2 = row1;
    if (isMobile) {
      row1.appendChild(dexColumn);      row1.appendChild(starColumn); 
      row1.appendChild(specColumn);     row1.appendChild(pinColumn);
      const row2 = document.createElement('div'); row2.className = 'row'; li.appendChild(row1);
      row2.appendChild(pokeImg); row2.appendChild(abilityColumn); row2.appendChild(moveColumn);   
      const row3 = document.createElement('div'); row3.className = 'row'; li.appendChild(row2);
      row3.appendChild(typeColumn);     row3.appendChild(costColumn);      row3.appendChild(bstColumn);
      row3.appendChild(hpColumn);       row3.appendChild(atkColumn);       row3.appendChild(defColumn);
      row3.appendChild(spaColumn);      row3.appendChild(spdColumn);       row3.appendChild(speColumn);    
      li.appendChild(row3); // Append the 3rd row
    } else {
      row1.appendChild(dexColumn);      row1.appendChild(pokeImg);             row1.appendChild(specColumn);    
      row1.appendChild(typeColumn);     row1.appendChild(abilityColumn);   row1.appendChild(moveColumn); 
      row1.appendChild(costColumn);     row1.appendChild(bstColumn);
      row1.appendChild(hpColumn);       row1.appendChild(atkColumn);       row1.appendChild(defColumn);
      row1.appendChild(spaColumn);      row1.appendChild(spdColumn);       row1.appendChild(speColumn);    
      li.appendChild(row1); // Append the only row
    }
    itemList.appendChild(li); // Append the current entry to the list of Pokemon
  });
}

function showMoveSplash(fid) {
  splashContent.style.width = '300px';
  const thisDesc = fidToDesc[fid-fidThreshold[0]];
  splashContent.innerHTML = `<b>${fidToName[fid]}</b><hr>`; // Name header
  if (fid<fidThreshold[1]) { // For abilities
    splashContent.innerHTML = `<b>${fidToName[fid]}</b><hr>${thisDesc}<br>`;
    // if (thisDesc[1]) { // If there is a custom description
    //   splashContent.innerHTML += `<p style="color:rgb(145, 145, 145); margin:0px; margin-top:8px;">${thisDesc[1]}</p>`;
    // }
  } else { // For moves
    const thisProcLine = fidToProc[fid-fidThreshold[1]];
    const splashMoveRow = document.createElement('div');  splashMoveRow.className = 'splash-move-row';
    altText.slice(4,8).forEach((attName,index) => { // Show type and damage category, then Power, Accuracy, PP
      const splashMoveCol = document.createElement('div');
      if (!index) splashMoveCol.innerHTML = `<span style="color:${typeColors[thisProcLine[0]]};">${fidToName[thisProcLine[0]]}</span><br><img src="ui/cat${thisProcLine[1]}.png"></img>`;
      else splashMoveCol.innerHTML = `${attName}<br>${(thisProcLine[1+index]==-1 ? '-' : thisProcLine[1+index])}`;
      splashMoveRow.appendChild(splashMoveCol);
    });
    splashContent.appendChild(splashMoveRow);
    splashContent.innerHTML += `<hr>${thisDesc}`; // Show move description
    // if (thisDesc[1]) { // If there is a custom description
    //   splashContent.innerHTML += `<p style="color:rgb(145, 145, 145); margin:0px; margin-top:8px;">${thisDesc[1]}</p>`;
    // }
    // Add all tags for priority, targets, procs, contact, other
    if (thisProcLine[5] || thisProcLine[6] || thisProcLine[7]||1) {
      const splashMoveTags = document.createElement('div');  splashMoveTags.className = 'splash-move-tags';
      if (thisProcLine[5] > 0) { // If non-zero priority
        {splashMoveTags.innerHTML += `<p style="color:rgb(143, 214, 154);">Priority: +${thisProcLine[5]}</p>`;};
      } else if (thisProcLine[5] < 0) {
        {splashMoveTags.innerHTML += `<p style="color:rgb(239, 131, 131);">Priority: ${thisProcLine[5]}</p>`;};
      }
      if (thisProcLine[7].includes(20)) {splashMoveTags.innerHTML += '<p style="color:rgb(216, 143, 205);">Targets: Random Enemy</p>';};
      if (thisProcLine[7].includes(21)) {splashMoveTags.innerHTML += '<p style="color:rgb(251, 173, 124);">Targets: All Enemies</p>';};
      if (thisProcLine[7].includes(22)) {splashMoveTags.innerHTML += '<p style="color:rgb(239, 131, 131);">Targets: Entire Field</p>';};
      thisProcLine[6].forEach((thisProc) => { // Procs for stats, status, flinch, etc.
        const procChance = ((thisProc[0] == '-1') ? '' : `${thisProc[0]}% `);
        const procStages = ((thisProc[2] == '0') ? '' : ` ${(thisProc[2] > 0 ? '+' : '')}${thisProc[2]}`);
        splashMoveTags.innerHTML += `<p>${procChance}${procToDesc[thisProc[1]]}${procStages}</p>`;
      });
      if (thisProcLine[7].includes(60)) {splashMoveTags.innerHTML += "<p>User Atk maxed</p>";};
      if (thisProcLine[7].includes(0))  {splashMoveTags.innerHTML += "<p>High Critical Ratio</p>";};
      if (thisProcLine[7].includes(1))  {splashMoveTags.innerHTML += "<p>Guaranteed Critical Hit</p>";};
      if (thisProcLine[7].includes(2))  {splashMoveTags.innerHTML += "<p>User Critical Rate +1</p>";};
      if (thisProcLine[7].includes(35)) {splashMoveTags.innerHTML += "<p>Costs 50% of HP</p>";};
      if (thisProcLine[7].includes(59)) {splashMoveTags.innerHTML += "<p>Costs 33% of HP</p>";};
      if (thisProcLine[7].includes(34)) {splashMoveTags.innerHTML += "<p>Recoil 50% of HP</p>";};
      if (thisProcLine[7].includes(36)) {splashMoveTags.innerHTML += "<p>Recoil 33% of damage</p>";};
      if (thisProcLine[7].includes(37)) {splashMoveTags.innerHTML += "<p>Recoil 50% of damage</p>";};
      if (thisProcLine[7].includes(53)) {splashMoveTags.innerHTML += "<p>Recoil 25% of damage</p>";};
      if (thisProcLine[7].includes(27)) {splashMoveTags.innerHTML += "<p>Heals Status Effects</p>";};
      if (thisProcLine[7].includes(28)) {splashMoveTags.innerHTML += "<p>Heals Status Effects</p>";};
      if (thisProcLine[7].includes(29)) {splashMoveTags.innerHTML += "<p>Heals Sleep</p>";};
      if (thisProcLine[7].includes(30)) {splashMoveTags.innerHTML += "<p>Heals Freeze</p>";};
      if (thisProcLine[7].includes(31)) {splashMoveTags.innerHTML += "<p>Heals Paralysis</p>";};
      if (thisProcLine[7].includes(32)) {splashMoveTags.innerHTML += "<p>Heals Burn</p>";};
      if (thisProcLine[7].includes(39)) {splashMoveTags.innerHTML += "<p>Heals 100% damage dealt</p>";};
      if (thisProcLine[7].includes(40)) {splashMoveTags.innerHTML += "<p>Heals 75% damage dealt</p>";};
      if (thisProcLine[7].includes(41)) {splashMoveTags.innerHTML += "<p>Heals by target's Atk</p>";};
      if (thisProcLine[7].includes(42)) {splashMoveTags.innerHTML += "<p>Heals 50% damage dealt</p>";};
      if (thisProcLine[7].includes(13)) {splashMoveTags.innerHTML += "<p>Triage gives +3 priority</p>";};
      if (thisProcLine[7].includes(5))  {splashMoveTags.innerHTML += "<p>No effect on Grass/Overcoat</p>";};
      if (thisProcLine[7].includes(55)) {splashMoveTags.innerHTML += "<p>No seeding on Grass Types</p>";};
      if (thisProcLine[7].includes(7))  {splashMoveTags.innerHTML += "<p>Boosted by Sharpness</p>";};
      if (thisProcLine[7].includes(8))  {splashMoveTags.innerHTML += "<p>Boosted by Iron Fist</p>";};
      if (thisProcLine[7].includes(9))  {splashMoveTags.innerHTML += "<p>Triggers Dancer ability</p>";};
      if (thisProcLine[7].includes(10)) {splashMoveTags.innerHTML += "<p>No effect on Bulletproof</p>";};
      if (thisProcLine[7].includes(11)) {splashMoveTags.innerHTML += "<p>Boosted by Mega Launcher</p>";};
      if (thisProcLine[7].includes(12)) {splashMoveTags.innerHTML += "<p>Boosted by Strong Jaw</p>";};
      if (thisProcLine[7].includes(33)) {splashMoveTags.innerHTML += "<p>Boosted by Reckless</p>";};
      if (thisProcLine[7].includes(14)) {splashMoveTags.innerHTML += "<p>Sound based move</p>";};
      if (thisProcLine[7].includes(15)) {splashMoveTags.innerHTML += "<p>Prevented by Damp ability</p>";};
      if (thisProcLine[7].includes(16)) {splashMoveTags.innerHTML += "<p>Triggers Wind Rider</p>";};
      if (thisProcLine[7].includes(54)) {splashMoveTags.innerHTML += "<p>Ignores Abilities</p>";};
      if (thisProcLine[7].includes(17)) {splashMoveTags.innerHTML += "<p>Ignores Protect</p>";};
      if (thisProcLine[7].includes(18) || thisProcLine[7].includes(14)) {splashMoveTags.innerHTML += "<p>Ignores Substitute</p>";};
      if (thisProcLine[7].includes(19)) {splashMoveTags.innerHTML += "<p>Switches out target</p>";};
      if (thisProcLine[7].includes(52)) {splashMoveTags.innerHTML += "<p>User switches out</p>";};
      if (thisProcLine[7].includes(23)) {splashMoveTags.innerHTML += "<p>Hits 2 times</p>";};
      if (thisProcLine[7].includes(24)) {splashMoveTags.innerHTML += "<p>Hits 3 times</p>";};
      if (thisProcLine[7].includes(25)) {splashMoveTags.innerHTML += "<p>Hits 10 times</p>";};
      if (thisProcLine[7].includes(26)) {splashMoveTags.innerHTML += "<p>Hits 2-5 times</p>";};
      if (thisProcLine[7].includes(38)) {splashMoveTags.innerHTML += "<p>Repeats for 2-3 turns</p>";};
      if (thisProcLine[7].includes(43)) {splashMoveTags.innerHTML += "<p>One Hit KO move</p><p>Modified against Bosses</p>";};
      if (thisProcLine[7].includes(44)) {splashMoveTags.innerHTML += "<p>Removes hazards</p>";};
      if (thisProcLine[7].includes(45)) {splashMoveTags.innerHTML += "<p>Traps and damages target</p>";};
      if (thisProcLine[7].includes(46)) {splashMoveTags.innerHTML += "<p>30% deal 2x damage</p>";};
      // if (thisProcLine[7].includes(6)) {splashMoveTags.innerHTML += "<p>Reflectable by magic</p>";};
      if (thisProcLine[7].includes(47)) {splashMoveTags.innerHTML += "<p>Can't be redirected</p>";};
      if (thisProcLine[7].includes(48)) {splashMoveTags.innerHTML += "<p>Always hits in Rain</p>";};
      if (thisProcLine[7].includes(56)) {splashMoveTags.innerHTML += "<p>User can't switch out</p>";};
      if (thisProcLine[7].includes(57)) {splashMoveTags.innerHTML += "<p>Target can't switch out</p>";};
      if (thisProcLine[7].includes(58)) {splashMoveTags.innerHTML += "<p>User & Target can't switch out</p>";};
      if (thisProcLine[7].includes(49)) {splashMoveTags.innerHTML += "<p>No effect on Bosses</p>";};
      if (thisProcLine[7].includes(4))  {splashMoveTags.innerHTML += "<p>Makes Contact</p>";};
      if (thisProcLine[7].includes(51)) {splashMoveTags.innerHTML += "<p style='color:rgb(240, 230, 140);'>Partially Implemented</p>";};
      if (thisProcLine[7].includes(50)) {splashMoveTags.innerHTML += "<p style='color:rgb(239, 131, 131);'>Not Implemented</p>";};
      splashContent.appendChild(splashMoveTags);
    }
  }
  if (!lockedFilters.includes(fid)) { // Button to add ability/move directly to filters
    const splashButton = document.createElement('div'); splashButton.className = 'splash-button'; 
    splashButton.innerHTML = `<span>${altText[8]}</span>`;  
    splashButton.addEventListener("click", () => { lockFilter(fid); splashScreen.classList.remove("show"); });
    splashContent.appendChild(splashButton);
  }
  splashScreen.classList.add("show"); // Make it visible
}
function fidToCategory(fid) {
  for (let index = 0; index < catToName.length; index++) {
    if (fid < fidThreshold[index]) return catToName[index]
  }
}
function fidToColor(fid) {
  if (fid < fidThreshold[0]) { return ['rgb(255, 255, 255)', typeColors[fid]]; }
  if (fid < fidThreshold[1]) { return ['rgb(140, 130, 240)', 'rgb(255, 255, 255)']; }
  if (fid < fidThreshold[2]) { return ['rgb(145, 145, 145)', 'rgb(255, 255, 255)']; }
  if (fid < fidThreshold[3]) { return ['rgb(131, 182, 239)', 'rgb(255, 255, 255)']; }
  if (fid < fidThreshold[4]) { return ['rgb(240, 230, 140)', 'rgb(255, 255, 255)']; }
  if (fid < fidThreshold[5]) { return ['rgb(216, 143, 205)', 'rgb(255, 255, 255)']; }
  if (fid < fidThreshold[6]) { return ['rgb(255, 255, 255)', 'rgb(239, 131, 131)']; }
  if (fid < fidThreshold[7]) { return ['rgb(255, 255, 255)',    eggTierColors(fid) ]; }
  else return ['rgb(255, 255, 255)', 'rgb(140, 130, 240)']; 
}
function abToColor(name) {
  if (name == 'a1') { return (abilityState==0||abilityState==1 ? 'rgb(255, 255, 255)' : 'rgb(145,145,145)') }
  if (name == 'a2') { return (abilityState==0||abilityState==1 ? 'rgb(255, 255, 255)' : 'rgb(145,145,145)') }
  if (name == 'ha') { return (abilityState==0||abilityState==2 ? 'rgb(240, 230, 140)' : 'rgb(105,105,105)') }
  if (name == 'pa') { return (abilityState==0||abilityState==3 ? 'rgb(140, 130, 240)' : 'rgb(145,145,145)') }
}
function eggTierColors(fid) {
  if (fid >= fidThreshold[6]) fid -= fidThreshold[6];
  if (fid == 0) { return 'rgb(255, 255, 255)'; }
  if (fid == 1) { return 'rgb(131, 182, 239)'; }
  if (fid == 2) { return 'rgb(240, 230, 140)'; }
  if (fid == 3) { return 'rgb(239, 131, 131)'; }
  if (fid == 4) { return 'rgb(216, 143, 205)'; }
  else { console.log('Invalid egg tier'); return null; }
}

// Display the filter suggestions *************************
function displaySuggestions() { // Get search query and clear the list
  filterToEnter = null;   suggestions.innerHTML = '';
  const query = searchBox.value.toLowerCase().replace(/[.’'\s-]/g,'');
  if (query.length) {
    // Decide which family filters to show
    let filteredSID = possibleSID.filter((ID) => speciesNames[ID].toLowerCase().replace(/[.’'\s-]/g,'').includes(query));
    if (filteredSID.length > 20) filteredSID = [];
    let offerFamilies = [...new Set(filteredSID.map(ID => items[ID].fa))];
    if (offerFamilies.length > 4) offerFamilies = [];

    let matchingFID = [];   
    // Filter suggestions based on query and exclude already locked filters
    matchingFID = possibleFID.filter((fid) => {
        let searchableName = fidToSearch[fid];
        if (fid >= fidThreshold[2] && fid < fidThreshold[7]) {
          // Search via category for later categories
          searchableName = `${fidToCategory(fid).toLowerCase().replace(/[.’'\s-]/g,'')}${searchableName}`;  
        } else if (fid >= fidThreshold[7] && offerFamilies.includes(fid)) {
          return true;
        }
        // Suggest if it contains the search query and is not already locked
        return searchableName.includes(query) && !lockedFilters.some((f) => f == fid);
    });
    if (matchingFID.length > 20) matchingFID = []; // Erase the list of suggestions if it is too large
    
    if (lockedFilters.length > 0) { // If there is at least one locked filter, re-sort the list
      // (If there are no locked filters, the list is already presorted)
      // Count how many hits each suggestion has

      // Sort the list of suggestions based on hits in the item list (but still by type/ability/move)

      // Remove suggestions that have no matches?
      // Not implemented yet...
    }

    // Highlight a suggestion if tab is hit
    if (matchingFID.length > 0) {
      if (tabSelect > matchingFID.length-1) {tabSelect -= matchingFID.length;}
      filterToEnter = matchingFID[(tabSelect == -1 ? 0 : tabSelect)];
    } 
    matchingFID.forEach((fid) => { // Create the suggestion tag elements
      let newSugg = document.createElement('div');  newSugg.className = 'suggestion';
      newSugg.innerHTML = `<span style="color:${fidToColor(fid)[0]}; display:inline;">${fidToCategory(fid)}: 
                           <span style="color:${fidToColor(fid)[1]}; display:inline;">${fidToName[fid]}</span></span>`;
      newSugg.addEventListener("click", () => lockFilter(fid));
      if (filterToEnter == fid && tabSelect != -1) newSugg.style.borderColor = 'rgb(140, 130, 240)';
      suggestions.appendChild(newSugg);
    });
  }
}

// Lock a filter *************************
function lockFilter(newLockFID) {
  if (!lockedFilters.some( (f) => f == newLockFID)) {
    lockedFilters.push(newLockFID); // Add the filter to the locked filters container
    // console.log(newLockFID); console.log(fidToName[newLockFID]);
    let filterMod = null;
    if (lockedFilters.length > 1) {
      const famOR = (newLockFID >= fidThreshold[7] && lockedFilters[lockedFilters.length-2] >= fidThreshold[7]);
      filterMod = document.createElement("span"); filterMod.toggleOR = famOR;
      filterMod.className = "filter-mod";         filterMod.innerHTML = (famOR?'OR':'&');
      filterMod.addEventListener("click", () => toggleOR(filterMod));
      lockedFilterMods.push(filterMod); filterContainer.appendChild(filterMod);
    }
    const filterTag = document.createElement("span"); filterTag.className = "filter-tag";
    const img = document.createElement('img');        img.src = 'ui/lock.png';    filterTag.appendChild(img);
    filterTag.innerHTML += `${fidToCategory(newLockFID)}: ${fidToName[newLockFID]}`;
    filterTag.addEventListener("click", () => removeFilter(newLockFID, filterTag, filterMod));
    filterContainer.appendChild(filterTag);
    // Clear the search bar after locking, except with family filter
    searchBox.value = ""; 
    // Refresh suggestions and items
    updateFilterGroups();   refreshAllItems();
    if (newLockFID >= fidThreshold[1] && newLockFID < fidThreshold[2] && sortState.column === 'row') {
      updateHeader(headerColumns[5]);
    } else {
      if (lockedFilters.length == 1 && sortState.column === 'moves') {
        sortState.ascending = true;
      }
      updateHeader(null, true);
    }
  }
}

// Remove a filter **************************
function removeFilter(fidToRemove, filterTag, filterModToRemove) {
  if (lockedFilters.length > 1 && fidToRemove == lockedFilters[0]) {
    filterModToRemove = lockedFilterMods[0]; // If removing first filter, also remove mod attached to second filter
  }
  // Remove the filter from the filter list, and remove the actual filter tag
  lockedFilters = lockedFilters.filter( (f) => f != fidToRemove );  filterTag.remove();
  lockedFilterMods = lockedFilterMods.filter( (f) => f != filterModToRemove ); // Remove from the mod list
  if (filterModToRemove) {filterModToRemove.remove();} // Remove the actual mod element
  // Refresh suggestions and items
  updateFilterGroups();   refreshAllItems();
  // Reset the sorting if there aren't any more locked moves
  if (sortState.column === 'moves' && !lockedFilters.some((f) => (f >= fidThreshold[1] && f < fidThreshold[2]))) { 
    updateHeader(headerColumns[0]); 
  } else { 
    updateHeader(null, true); 
  }
  if (lockedFilters.length == 0) { // Reset the animation of the page title
    pageTitle.classList.remove('colorful-text');  void pageTitle.offsetWidth;
    pageTitle.classList.add('colorful-text');
  }
  if (!isMobile) {searchBox.focus();}
}

function updateFilterGroups() { // Updates the grouping of filters based on AND/OR toggles
  lockedFilterGroups = [[]];
  let group = 0;
  lockedFilterGroups[group].push(lockedFilters[0]);
  for (let i = 0; i < lockedFilterMods.length; i++) { // New group for AND, same group for OR
    if (!lockedFilterMods[i].toggleOR) { group += 1;  lockedFilterGroups.push([]); } 
    lockedFilterGroups[group].push(lockedFilters[i+1]);
  }
}

function toggleOR(filterMod) { // Click a filter to toggle it between AND and OR
  filterMod.toggleOR = 1 - filterMod.toggleOR;
  filterMod.innerHTML = (filterMod.toggleOR ? 'OR' : '&');
  updateFilterGroups();
  refreshAllItems();
}

// Click on the header row to sort/filter by an attribute **************************
function updateHeader(clickTarget = null, ignoreFlip = false) {
  // console.log(clickTarget?.sortattr)
  if (clickTarget == null) {clickTarget = sortState.target; ignoreFlip = true;}
  // Set the text of the move column, depending on if a move is filtered
  if (showMoveLearn.length) {
    headerColumns[5].textDef = `<span style="color:rgb(140, 130, 240);">${altText[0]}</span>`;
  } else {
    headerColumns[5].textDef = headerNames[5];
    if (clickTarget == headerColumns[5]) clickTarget = null;
  }
  // Find the new sorting attribute, and update the headers
  const sortAttribute = clickTarget?.sortattr;
  if (sortAttribute == 'shiny') { // Toggle the global shiny state
    shinyState = (shinyState == 0 ? 3 : shinyState-1);
    if (shinyState) {
      headerColumns[1].innerHTML = `<span style="color:rgb(140, 130, 240);">${headerNames[1]}</span>`;
      const starImg = document.createElement('img');  starImg.className = 'star-header';
      starImg.src = `ui/shiny${shinyState}.png`;
      headerColumns[1].appendChild(starImg);
    } else {
      headerColumns[1].innerHTML = headerNames[1];
    }
  } else if (sortAttribute == 'ab') { // Toggle the global ability state
    abilityState = (abilityState == 3 ? 0 : abilityState+1);
    if (abilityState) {
      headerColumns[4].innerHTML = `<span style="color:rgb(140, 130, 240);">${headerNames[4]}</span>`;
      if      (abilityState == 1) {headerColumns[4].innerHTML += `<span style="color:rgb(255, 255, 255); font-size:12px;">(${altText[1]})</span>`;}
      else if (abilityState == 2) {headerColumns[4].innerHTML += `<span style="color:rgb(240, 230, 140); font-size:12px;">(${altText[2]})</span>`;}
      else if (abilityState == 3) {headerColumns[4].innerHTML += `<span style="color:rgb(140, 130, 240); font-size:12px;">(${altText[3]})</span>`;}
    } else {
      headerColumns[4].innerHTML = headerNames[4];
    }
  } else {
    headerColumns[5].innerHTML = headerColumns[5].textDef;
    if (sortAttribute) { // Clicked on a header that can actually be sorted
      if (sortState.column === sortAttribute) {
        if (!ignoreFlip) {
          sortState.ascending = !sortState.ascending; // Toggle sort direction if sorting by the same column
        }
      } else {
        sortState.column = sortAttribute;
        // Sort ascending on some columns, but descending on others
        sortState.ascending = ['row','sp','type','moves'].includes(sortState.column);
        if (sortState.target?.textDef) { // Clear arrow from previous target
          sortState.target.innerHTML = sortState.target?.textDef;
        }
      }
      sortState.target = clickTarget; // Draw arrow on new target
      clickTarget.innerHTML = `${clickTarget.textDef}<span style="color:rgb(140, 130, 240); font-family: serif;">${(sortState.ascending ? "&#9650;":"&#9660;")}</span>`;
    }
  }
  // Update the display
  refreshAllItems();
}

function adjustLayout(headerTarget = null, forceAdjust = false) {
  if (isMobile != (window.innerWidth <= 768) || forceAdjust) {
    const windowWidth = window.innerWidth;
    isMobile = (windowWidth <= 768);
    // console.log((isMobile ? "Mobile layout" : "Desktop layout"), windowWidth, isMobile);
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
      for (const thisColumn of headerColumns.slice(6,15)) { row2.appendChild(thisColumn); }  
      headerContainer.appendChild(row2);
    } else {
      for (const thisColumn of headerColumns) { thisRow.appendChild(thisColumn); }  
      headerContainer.appendChild(thisRow);
    }
  increment = (isMobile ? 10 : 30);
  updateHeader(headerTarget, true);
  }
}

// All event listeners **************************

// Load more items on scroll
window.addEventListener("scroll", () => {
  if (window.scrollY + window.innerHeight >= document.body.scrollHeight * 0.8 - 1000) renderMoreItems();
});
// Run on page load and when resizing the window
window.addEventListener("resize", () => adjustLayout());
// Typing in search box
searchBox.addEventListener('input', (event) => { 
  tabSelect = -1;
  // for (let index = 0; index < 50; index++) { // Slow down the performance for benchmarking
  refreshAllItems();
  // }
});
document.addEventListener('keydown', (event) => { 
  const ignoredKeys = ["Escape", "Tab", "Shift", "PageDown", "PageUp", "Control", "Alt", "Meta", "CapsLock", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (!ignoredKeys.includes(event.key)) { // Ignore certain keys like Tab, Shift, Control, Alt, etc.
    splashScreen.classList.remove("show");
    searchBox.focus(); // Focus the search box on any key press
  }
  if (event.key == "Enter" && filterToEnter) {
    lockFilter(filterToEnter); // Hit 'Enter' to lock the first filter
  }
  if (event.key == "PageDown" || event.key == "PageUp") {
    searchBox.blur(); // Allow PageUp and PageDown even when in search box
  }
  if (event.key == "Escape") { // Hit escape to clear the search box, or the last filter
    if (splashScreen.classList.contains("show")) { // Close any splash screen
      splashScreen.classList.remove("show");
    } else if (searchBox.value.length > 0) { // Clear any text from the search box
      searchBox.value = ''
      refreshAllItems();
    } else if (lockedFilters.length > 0) { // If there is a locked filter
      const lastFilter = lockedFilters[lockedFilters.length - 1];
      const filterTags = document.querySelectorAll(".filter-tag");
      const lastFilterTag = filterTags[filterTags.length - 1];
      const lastFilterMod = lockedFilterMods[lockedFilterMods.length - 1];
      if (lastFilter && lastFilterTag) {
        removeFilter(lastFilter, lastFilterTag, lastFilterMod); // Remove the last filter
      }
    } else if (shinyState || abilityState) { // Clear all header restrictions
      shinyState = 0;   headerColumns[1].innerHTML = headerNames[1];
      abilityState = 0; headerColumns[4].innerHTML = headerNames[4];
      updateHeader();
    }
  }
  if (event.key == "Tab" && document.activeElement == searchBox) {
    if (tabSelect == -1) {tabSelect = 0;}
    tabSelect += 1;
    displaySuggestions();
    event.preventDefault();
  }
});
// Close splash screen when clicking outside the content box
splashScreen.addEventListener("click", (event) => {
  if (event.target === splashScreen) {
    splashScreen.classList.remove("show");
  }
});
// Open the language selector splash
openLangButton.addEventListener('mouseover', () => openLangButton.src = `ui/globeh.png`);
openLangButton.addEventListener('mouseout',  () => openLangButton.src = `ui/globe.png` ); 
openLangButton.addEventListener("click",     () => openLangMenu());
function openLangMenu() {
  splashContent.style.width = '270px';
  splashContent.innerHTML = '<img src="ui/globe.png" class="lang-head-img"></img>&nbsp<b>Change Language</b><hr style="margin-bottom: 0px;">';
  supportedLangs.forEach((thisLang, index) => {
    const thisLangRow = document.createElement('div'); thisLangRow.className = "splash-button";
    if (pageLang == thisLang) thisLangRow.style.color = "rgb(140, 130, 240)";
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
function openHelpMenu() {
  // Assemble the content for the help splash screen
  splashContent.style.width = '382px';
  splashContent.innerHTML = helpMenuText;
  splashScreen.classList.add("show"); // Make it visible
}