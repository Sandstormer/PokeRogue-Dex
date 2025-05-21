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
const headerContainer = document.getElementById("header-container");
const filterContainer = document.getElementById("filter-container");
const suggestions = document.getElementById("suggestions");
const splashScreen = document.getElementById("splashScreen");
const splashContent = document.getElementById("splashContent");
const movesetScreen = document.getElementById("movesetScreen");
const movesetHeader = document.getElementById("movesetHeader");
const movesetScrollable = document.getElementById("movesetScrollable");
const openHelpButton = document.getElementById("help-img");
const openLangButton = document.getElementById("lang-img");
const sortAttributes = ['row','shiny','sp','type','ab','moves','co','bst','hp','atk','def','spa','spd','spe'];
const possibleFID = [...Array(fidThreshold[fidThreshold.length-1]).keys()];
const possibleSID = [...Array(items.length).keys()];
const supportedLangs = ["en","fr","ko","zh-CN","ja"];//"it","es-ES","pt-BR","de"];
const LanguageNames  = ["English","Français","한국어 (Hangugeo)","简体中文 (Jiǎntǐ Zhōngwén)","日本語 (Nihongo)"];//"Italiano","Español (España)","Português (Brasil)","Deutsch","繁體中文 (Fántǐ Zhōngwén)"];
const moveCatColor = ['rgb(251, 173, 124)','rgb(131, 182, 239)','rgb(255, 255, 255)'];
const tmColors = ['rgb(255, 255, 255)','rgb(131, 182, 239)','rgb(240, 230, 140)'];
let increment = 10;     // Number of items to load at a time
let renderLimit = 0;    // Start with no items
let showMoveLearn = []; // Filtered moves/biomes to show sources
let filterToEnter = null;  // Filter to apply when hitting Enter
let tabSelect = -1;         // Filter that is tab selected
let lockedFilters = [];    // List of all locked filters
let lockedFilterMods = []; // List of filter mod objects
let lockedFilterGroups = [[]]; // Grouped together for OR
let pinnedRows = [];  // List of pinned row numbers
let isMobile = false; // Change display for mobile devices
let filteredItemIDs = null; // List of all displayed row numbers
let headerState = { shiny: 0, ability: 0, biome: 0 } // Global state of shiny(0,1,2,3), ability(0,1,2,3), biome(0,1)
let sortState = { column: null, ascending: true, target: null, biomeToggle: 0 }; // Track the current sort state
let splashState = { species: -1, page: 0 }
// const spreadMoves = possibleFID.filter((fid) => fid >= fidThreshold[1] && fid < fidThreshold[2]
//   && (fidToProc[fid-fidThreshold[0]][7].includes(21) || fidToProc[fid-fidThreshold[0]][7].includes(22)));
// filteredItemIDs = filteredItemIDs.filter((thisID) => spreadMoves.some((thisMove) => thisMove in items[thisID]));
// const moveTagFID = { // List of move FIDs for spread/healing/setup
//   999:
// }

// biomeText = ['Common','Uncommon','Rare','Super Rare','Ultra Rare','Boss','Com.','UC','Rare','SR','UR','Dawn','Day','Dusk','Night'] 
procToDesc = [
  "User Atk","User Def","User SpAtk","User SpDef","User Speed","User Accuracy","User Evasion",
  "Atk","Def","SpAtk","SpDef","Speed","Accuracy","Evasion",
  "Applies Poison","Applies Toxic","Applies Sleep","Applies Freeze","Applies Paralysis","Applies Burn","Applies Confuse",
  "Flinch","User Atk/Def/SpA/SpD/Spe","Poison/Para/Sleep","Burn/Para/Freeze","Stellar User Atk/SpAtk","Damage"];
  
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
    headerState.shiny = 0; headerState.ability = 0;
    adjustLayout(true, headerColumns[0]); 
  }
  script.onerror = (e) => console.warn(`Failed to load ${lang}.js`, e);
  document.head.appendChild(script);
  console.log(`Attempting to load: ${script.src}`);
}

function refreshAllItems() { // Display items based on query and locked filters **************************
  const query = searchBox.value.toLowerCase().replace(/[.’'\s-]/g,'');

  itemList.querySelectorAll('li').forEach(li => li.replaceWith(li.cloneNode(true))); // Clones without listeners
  while (itemList.firstChild) itemList.firstChild.remove();

  filteredItemIDs = possibleSID;
  // Filter from query ==============
  if (query.length > 0) {
    if (/^\d+$/.test(query)) { // If query is only digits
      filteredItemIDs = filteredItemIDs.filter((specID) => items[specID].dex >= parseInt(query,10));
    } else { // For a standard query
      filteredItemIDs = filteredItemIDs.filter((specID) => 
        speciesNames[specID].toLowerCase().replace(/[.’'\s-]/g,'').includes(query) ||
        fidToSearch[items[specID].t1]?.includes(query) ||
        fidToSearch[items[specID].t2]?.includes(query) ||
        ([0,1].includes(headerState.ability) && fidToSearch[items[specID].a1]?.includes(query)) ||
        ([0,1].includes(headerState.ability) && fidToSearch[items[specID].a2]?.includes(query)) ||
        ([0,2].includes(headerState.ability) && fidToSearch[items[specID].ha]?.includes(query)) ||
        ([0,3].includes(headerState.ability) && fidToSearch[items[specID].pa]?.includes(query)) )
    }
  } 
  // Filter from headers ==============
  if (headerState.ability == 2) filteredItemIDs = filteredItemIDs.filter(fid => 'ha' in items[fid]);
  // Only show items that have that tier of shiny
  if (headerState.shiny > 1)    filteredItemIDs = filteredItemIDs.filter(fid => items[fid].sh >= headerState.shiny);
  // Filter from locked filters ==============
  if (lockedFilters.length > 0) {
    filteredItemIDs = filteredItemIDs.filter(specID => // Search for filters with their fid as key
      lockedFilterGroups.every(thisGroup => // Match at least one filter from each group
        thisGroup.some(fid => {
          if (headerState.ability != 0 && fid >= fidThreshold[0] && fid < fidThreshold[1])
            return items[specID]?.[fid] == 309+headerState.ability || (headerState.ability == 1 && items[specID]?.[fid] == 309)
          if (fid  <  fidThreshold[2]) return fid in items[specID]; // Type/Ability/Move filters
          if (fid  <  fidThreshold[3]) return items[specID].ge === fid - fidThreshold[2] + 1; // Gen filters
          if (fid  <  fidThreshold[4]) return items[specID].co === fid - fidThreshold[3] + 1; // Cost filters
          if (fid === fidThreshold[4]) return 'fe' in items[specID]; // Gender filter
          if (fid === fidThreshold[5]) return 'st' in items[specID]; // Starter select filter
          if (fid === fidThreshold[5]+1) return 'fs' in items[specID]; // Fresh start filter
          if (fid === fidThreshold[5]+2) return true; // Flipped stats filter
          if (fid  <  fidThreshold[7]-1) return items[specID].et === fid - fidThreshold[6]; // Egg tier filter
          if (fid === fidThreshold[7]-1) return [1,2,3].includes(items[specID]?.ee); // Egg exclusive
          if (fid === fidThreshold[7]) return 'nv' in items[specID]; // New variants
          if (fid  <  fidThreshold[9]) return fid in items[specID]; // Biome filter
          if (fid  <  fidThreshold[10]) return items[specID]?.fa === fid; // Family filter
          console.warn('Filter error');return fid in items[specID];
        }))) 
      }
  // Add moves to track in the move column  ==============
  showMoveLearn = lockedFilters.filter(fid => (fid >= fidThreshold[1] && fid < fidThreshold[2])
                                           || (fid >= fidThreshold[8] && fid < fidThreshold[9]));
  // Remove the pinned items for now ==============
  if (pinnedRows) filteredItemIDs = filteredItemIDs.filter((thisID) => !pinnedRows.includes(thisID));

  // Sort items if a column is specified ==============
  if (sortState.column) {
    filteredItemIDs.sort((a, b) => {
      let aValue = a; let bValue = b; // Set default attribute of row number
      if (sortState.column == 'moves') { // Sort by source of moves
        const getLearnLevel = (ID) => 
          showMoveLearn.reduce((total, move) => total + (move in items[ID] ? 
            (move >= fidThreshold[8] ? (items[ID][move][1] ? ~~(items[ID][move][0]/20)*0.9+~~(items[ID][move][1]/20)/10 
                : ~~(items[ID][move][0]/20)) : items[ID][move]) : 500), 0);
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
      } else if (sortState.column != 'row') { // If anything OTHER than row number
        let effectiveSort = sortState.column;
        if (lockedFilters.some((f) => f == fidThreshold[5]+2)) { // If flipped mode
          if (sortState.column == 'hp')  effectiveSort = 'spe';
          if (sortState.column == 'atk') effectiveSort = 'spd';
          if (sortState.column == 'def') effectiveSort = 'spa';
          if (sortState.column == 'spa') effectiveSort = 'def';
          if (sortState.column == 'spd') effectiveSort = 'atk';
          if (sortState.column == 'spe') effectiveSort = 'hp' ;
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
    if (headerState.shiny > 1) helpMessage.innerHTML += '<b><span style="color:rgb(140, 130, 240);">Restricted to Pokemon that have shiny variants.</b><br><br></span>';
    if (headerState.ability > 0) helpMessage.innerHTML += '<b><span style="color:rgb(140, 130, 240);">Abilities are restricted to only ' + (headerState.ability == 1 ? 'Main' : (headerState.ability == 2 ? 'Hidden' : 'Passive'))+ ' Abilities.</b><br><br></span>';
    if (suggestions.innerHTML === '') { // No suggestions
      if (lockedFilters.length == 0) { // No locked filters
        helpMessage.innerHTML += '<b>There are no Pokemon or filters' + (isMobile ? '<br>' : ' ') + 'that match the search term' + (headerState.shiny > 1 ? ' and have shiny variants.</b>' : '.</b><br>Please check your spelling and try again.');
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
    pokeImg.shinyOverride = (item.sh >= headerState.shiny ? headerState.shiny : (headerState.shiny > 0)*1);  
    pokeImg.femOverride = (item?.fe == 1 ? lockedFilters.some((f) => f == fidThreshold[4]) : 0);
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
    if (item?.fe == 1) {
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
        starImg.src = `ui/shiny${(pokeImg.shinyOverride==i?i:'g')}.png`;
        starImg.addEventListener('mouseover', () => starImg.src = `ui/shiny${i}.png`);
        starImg.addEventListener('mouseout',  () => starImg.src = `ui/shiny${(pokeImg.shinyOverride==i?i:'g')}.png`);
        starImg.addEventListener('click', () => { // Add click events to all the stars, changing the poke image
          pokeImg.stars.forEach((thisStar) => thisStar.src = 'ui/shinyg.png');
          pokeImg.shinyOverride = (pokeImg.shinyOverride==i ? 0 : i);
          pokeImg.src = `images/${item.img}_${pokeImg.shinyOverride}${(pokeImg.femOverride ? 'f' : '')}.png`;  
          starImg.src = `ui/shiny${(pokeImg.shinyOverride==i?i:'g')}.png`;
        });
        pokeImg.stars.push(starImg);
      }
    }
    if (isMobile) { // Append to three different columns on mobile
      pinColumn.appendChild(pinImg);
      dexColumn.innerHTML = `<a href="https://wiki.pokerogue.net/pokedex:${item.dex}" target="_blank">#${item.dex}</a><br>`;
      pokeImg.stars.forEach((thisStar) => starColumn.appendChild(thisStar));
      if (item?.fe == 1) {
        femImg.className = 'star-img';
        starColumn.appendChild(femImg);
      }
    } else { // Append all to the dex column on desktop
      dexColumn.appendChild(pinImg);
      if (item?.fe == 1) dexColumn.appendChild(femImg);
      const dexText = document.createElement('div');
      dexText.innerHTML = `<a href="https://wiki.pokerogue.net/pokedex:${item.dex}" target="_blank">#${item.dex}</a><br>`;
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
    
    // Show the column of egg moves, or filtered moves and their sources
    const moveColumn = document.createElement('div');  moveColumn.className = 'item-column';  moveColumn.innerHTML = '';
    let numMovesShown = 0;
    showMoveLearn.forEach((thisFID) => {
      if (thisFID in item && numMovesShown < 2) { 
        numMovesShown += 1;
        let source = item[thisFID];  let sourceText = '<span style="color:';
        const clickableRow = document.createElement('div');  clickableRow.className = 'clickable-name';
        if (thisFID >= fidThreshold[8]) { // For biomes
          const rarityN = ~~(source[0]/20);  const rarityB = ~~(source[1]/20);
          if (rarityN && rarityB && [3,5,7,9].includes(rarityB)) { // Show both, with short labels
            sourceText += `${makeBiomeDesc(rarityN,'small')}</span><span style="color:rgb(255, 255, 255);"> / </span><span style="color:${makeBiomeDesc(rarityB,'small')}`;
          } else { // Show the only rarity
            sourceText += makeBiomeDesc(rarityN, 'full');
          }
          clickableRow.addEventListener('click', () => showInfoSplash(thisID, 1));
          // biomeText = ['Common','Uncommon','Rare','Super Rare','Ultra Rare','Boss','Com','Unc','Rare','SR','UR','Dawn','Day','Dusk','Night']
        } else { // For moves
          if (source == -1) sourceText += `rgb(251, 173, 124);">${altText[9]}`;
          else if (source == 0) sourceText += `rgb(131, 182, 239);">${altText[10]}`;
          else if (source == 201) sourceText += `rgb(255, 255, 255);">${altText[19]} / ${altText[16]}`;
          else if (source == 202) sourceText += `rgb(255, 255, 255);">${altText[19]} / </span><span style="color:rgb(131, 182, 239);">${altText[16]}`;
          else if (source == 203) sourceText += `rgb(255, 255, 255);">${altText[19]} / </span><span style="color:rgb(240, 230, 140);">${altText[16]}`;
          else if (source == 204) sourceText += `rgb(255, 255, 255);">${altText[11]}`;
          else if (source == 205) sourceText += `rgb(240, 230, 140);">${altText[19]}</span><span style="color:rgb(255, 255, 255);"> / ${altText[16]}`;
          else if (source == 206) sourceText += `rgb(240, 230, 140);">${altText[19]}</span><span style="color:rgb(255, 255, 255);"> / </span><span style="color:rgb(131, 182, 239);">${altText[16]}`;
          else if (source == 207) sourceText += `rgb(240, 230, 140);">${altText[19]}<span style="color:rgb(255, 255, 255);"> / </span>${altText[16]}`;
          else if (source == 208) sourceText += `rgb(240, 230, 140);">${altText[12]}`;
          else if (source == 209) sourceText += `rgb(255, 255, 255);">${altText[13]} ${altText[16]}`;
          else if (source == 210) sourceText += `rgb(131, 182, 239);">${altText[14]} ${altText[16]}`;
          else if (source == 211) sourceText += `rgb(240, 230, 140);">${altText[15]} ${altText[16]}`;
          else sourceText += `rgb(255, 255, 255);">${altText[17]} ${item[thisFID]}`;
          clickableRow.addEventListener('click', () => showDescSplash(thisFID));
        };
        // Show the move name, with click event for splash screen
        clickableRow.innerHTML = `<p style="color:rgb(140, 130, 240); margin: 0;">${fidToName[thisFID]}:<br>${sourceText}</span></p>`;
        moveColumn.appendChild(clickableRow);
      }
    });
    if (showMoveLearn.length == 0) {
      ['e1','e2','e3','e4'].forEach((name) => {
        // Show the move name, with click event for splash screen
        const clickableRow = document.createElement('div');  clickableRow.className = 'clickable-name';
        if (name == 'e4') clickableRow.style.color = 'rgb(240, 230, 140)';
        // clickableRow.style.color = typeColors[fidToProc[item[name]-fidThreshold[0]][0]];
        clickableRow.innerHTML = fidToName[item[name]];
        clickableRow.addEventListener('click', () => showDescSplash(item[name]));
        moveColumn.appendChild(clickableRow);
      });
    }

    // Show the cost, colored by the egg tier
    const costColumn = document.createElement('div'); costColumn.className = 'clickable-name';
          costColumn.innerHTML = `${headerNames[6]}<br><span style="color:${eggTierColors(item.et)};">${item.co}</span>`;  
          costColumn.addEventListener('click', () => showInfoSplash(thisID, 1));
    let flipped = lockedFilters.includes(fidThreshold[5]+2);                
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
      row1.appendChild(dexColumn);      row1.appendChild(pokeImg);         row1.appendChild(specColumn);    
      row1.appendChild(typeColumn);     row1.appendChild(abilityColumn);   row1.appendChild(moveColumn); 
      row1.appendChild(costColumn);     row1.appendChild(bstColumn);
      row1.appendChild(hpColumn);       row1.appendChild(atkColumn);       row1.appendChild(defColumn);
      row1.appendChild(spaColumn);      row1.appendChild(spdColumn);       row1.appendChild(speColumn);    
      li.appendChild(row1); // Append the only row
    }
    itemList.appendChild(li); // Append the current entry to the list of Pokemon
  });
}
function makeBiomeDesc(source, style) {
  if (style == 'full') {
    if      (source == 1) return `rgb(255, 255, 255);">${biomeText[0]}`;
    else if (source == 2) return `rgb(131, 182, 239);">${biomeText[1]}`;
    else if (source == 3) return `rgb(131, 182, 239);">${biomeText[5]} ${biomeText[1]}`;
    else if (source == 4) return `rgb(240, 230, 140);">${biomeText[2]}`;
    else if (source == 5) return `rgb(240, 230, 140);">${biomeText[5]} ${biomeText[2]}`;
    else if (source == 6) return `rgb(239, 131, 131);">${biomeText[3]}`;
    else if (source == 7) return `rgb(239, 131, 131);">${biomeText[5]} ${biomeText[3]}`;
    else if (source == 8) return `rgb(216, 143, 205);">${biomeText[4]}`;
    else if (source == 9) return `rgb(216, 143, 205);">${biomeText[5]} ${biomeText[4]}`;
  } else if (style == 'small') {
    if      (source == 1) return `rgb(255, 255, 255);">${biomeText[6]}`;
    else if (source == 2) return `rgb(131, 182, 239);">${biomeText[7]}`;
    else if (source == 3) return `rgb(131, 182, 239);">${biomeText[5]} ${biomeText[7]}`;
    else if (source == 4) return `rgb(240, 230, 140);">${biomeText[8]}`;
    else if (source == 5) return `rgb(240, 230, 140);">${biomeText[5]} ${biomeText[8]}`;
    else if (source == 6) return `rgb(239, 131, 131);">${biomeText[9]}`;
    else if (source == 7) return `rgb(239, 131, 131);">${biomeText[5]} ${biomeText[9]}`;
    else if (source == 8) return `rgb(216, 143, 205);">${biomeText[10]}`;
    else if (source == 9) return `rgb(216, 143, 205);">${biomeText[5]} ${biomeText[10]}`;
  }
}

function makeMovesetHeader(specID) {
  movesetHeader.innerHTML = '';
  const item = items[specID]; splashState.species = specID;
  
  const headerRow = document.createElement('div'); headerRow.className = 'moveset-big-header';
  const arrowL = createArrow(false);  const arrowR = createArrow(true);
  const msImg = document.createElement('img'); msImg.src = `images/${item.img}_0.png`; msImg.className = 'moveset-image';
  headerRow.appendChild(arrowL); headerRow.appendChild(msImg); 
  const nameAndType = document.createElement('div'); nameAndType.style.maxHeight = '46px';
  const typeTwoText = ('t2' in item ? ` / <span style="color:${typeColors[item.t2]}; display:inline">${fidToName[item.t2]}</span>` : '')
  nameAndType.innerHTML = `${speciesNames[specID]}<br><span style="color:${typeColors[item.t1]}; display:inline">${fidToName[item.t1]}</span>${typeTwoText}`;
  headerRow.appendChild(nameAndType); headerRow.appendChild(arrowR);
  movesetHeader.appendChild(headerRow); 
  movesetHeader.appendChild(document.createElement('hr'));
  
  // const splashButton = document.createElement('div'); splashButton.className = 'splash-button'; 
  // splashButton.innerHTML = 'eeeeeeee'; splashButton.style.margin = '-10px auto -10px auto';
  // splashButton.addEventListener("click", () => mode = 3 );
  // movesetHeader.appendChild(splashButton);
  // movesetHeader.appendChild(document.createElement('hr'));
}
function createArrow(isRight) {
  const arrow = document.createElement('img');  arrow.src = 'ui/arrow.png';  arrow.className = 'moveset-arrow';
  if (isRight) arrow.style.transform = 'scaleX(-1)';
  arrow.addEventListener('mouseover', () => arrow.src = 'ui/arrowh.png');
  arrow.addEventListener('mouseout',  () => arrow.src = 'ui/arrow.png');
  arrow.addEventListener('click', () => changeMoveset(isRight ? 1 : -1));
  return arrow;
}
function showInfoSplash(specID, overridePage=null) {
  if (overridePage != null) splashState.page = overridePage;
  const item = items[specID];
  makeMovesetHeader(specID);
  movesetScrollable.innerHTML = '';
  if (splashState.page) { // Show biomes
    if ('ee' in item) {
      if (item.ee == 1) movesetScrollable.innerHTML += '<b>This Pokemon is <span style="color:rgb(143, 214, 154);">Egg Exclusive</span>.</b><br>It does not appear in any biomes, and can only be obtained from eggs.'
      if (item.ee == 2) movesetScrollable.innerHTML += '<b>This is a <span style="color:rgb(216, 143, 205);">Baby Pokemon</span>.</b><br>It does not appear in any biomes, but can be unlocked by encountering its evolution.'
      if (item.ee == 3) movesetScrollable.innerHTML += '<b>This <span style="color:rgb(239, 131, 131);">Paradox Pokemon</span> is <span style="color:rgb(143, 214, 154);">Egg Exclusive</span>.</b><br>It can only be obtained from eggs, but can afterward be caught in Classic mode.'
      if (item.ee == 4) movesetScrollable.innerHTML += '<b>This Pokemon is <span style="color:rgb(131, 182, 239);">Form Exclusive</span>.</b><br>It does not appear in any biomes, and can only be obtained via form change.'
      if (item.ee == 5) movesetScrollable.innerHTML += 'This Pokemon can only be caught after obtaining <b><span style="color:rgb(239, 131, 131);">All Other Pokemon</span></b>.<br>It does not appear in standard eggs.'
    }
      possibleFID.slice(fidThreshold[8],fidThreshold[9]).forEach((fid) => {
        if (fid in item) {
          const biomeRow = document.createElement('div');  biomeRow.className = 'biome-row';
          if (!movesetScrollable.innerHTML) biomeRow.style.marginTop = '4px';
          biomeRow.innerHTML = `<b>${fidToName[fid]}:</b>`;
          item[fid].forEach(src => {
            biomeRow.innerHTML += `<br><span style="font-weight:bold; color:${makeBiomeDesc(~~(src/20),'full')}</span>`;
            if (src%20) {
              let timeText = '';
              [1,2,4,8].forEach((i,index) => timeText += ((src%20)%(2*i)>=i ? `${timeText?', ':''}${biomeText[11+index]}`:''));
              biomeRow.innerHTML += `<span style="font-size:16px;"> (${timeText})</span>`;
            }
          });
          movesetScrollable.appendChild(biomeRow);
        }
      });
    // movesetScrollable.appendChild(document.createElement('hr'));
    // const splashCostInfo = document.createElement('div');  splashCostInfo.className = 'splash-move-tags';
    // [`<p>Friendship per candy: ${upgradeCosts[item.co-1][4]}<img src="ui/candy.png"></p>`,
    //  `<p>Passive: ${upgradeCosts[item.co-1][0]}</p>`,
    //  `<p>Cost Reduction: ${upgradeCosts[item.co-1][1]} & ${upgradeCosts[item.co-1][2]}</p>`,
    //  `<p>Species Egg: ${upgradeCosts[item.co-1][3]}</p>`].forEach((costLine) => splashCostInfo.innerHTML += costLine );
    // movesetScrollable.appendChild(splashCostInfo);
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
    // Sort the moves
    moveList[0].sort((a, b) => item[a] > item[b] ? 1 : (item[a] < item[b]) ? -1 : 
      (fidToName[a] > fidToName[b] ? 1 : (fidToName[a] < fidToName[b] ? -1 : 0 )));
    moveList[1].sort((a, b) => item[a]%4 > item[b]%4 ? 1 : (item[a]%4 < item[b]%4) ? -1 : 
      (fidToName[a] > fidToName[b] ? 1 : (fidToName[a] < fidToName[b] ? -1 : 0 )));
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
  const thisProcs = fidToProc[fid-fidThreshold[0]];
  moveRow.innerHTML = `<div style="color:${moveSrcText(item[fid],table)}</div>
    <div style="color:${typeColors[thisProcs[0]]};">${fidToName[fid]}</div>
    <div style="color:${moveCatColor[thisProcs[1]]}">${(thisProcs[2]==-1?'-':thisProcs[2])}</div>
    <div style="color:${thisProcs[7].includes(21)?'rgb(239, 131, 131)'
      :(thisProcs[7].includes(22)?'rgb(247, 82, 49)':(thisProcs[7].includes(20)?'rgb(216, 143, 205)'
      :'rgb(255, 255, 255)'))};">${(thisProcs[3]==-1?'-':thisProcs[3])}</div>
    <div>${thisProcs[4]}</div>`;
  moveRow.addEventListener('click', () => showDescSplash(fid));
  movesetScrollable.appendChild(moveRow);
}
function moveSrcText(src, table) {
  // src = -1:mushroom, 0:evo, 1-200:level, 201-203:egg/TM, 204:egg, 205-207:rare/TM, 208:rare, 209-211:TM
  if (table == 0) {
    if (src == -1 ) return `rgb(251, 173, 124);"><img src="ui/mem.png"></img>`;
    if (src ==  0 ) return `rgb(131, 182, 239);">${altText[18]}`;
    else return `rgb(255, 255, 255);">${src}`;
  } else if (table == 1) {
    return `${src < 205 ? 'rgb(255, 255, 255)':'rgb(240, 230, 140)'};">${altText[19]}`
  } else {
    return `${tmColors[src%4-1]};">${(altText[16].length > 2 ? 'TM' : altText[16])}`
  }
}
function changeMoveset(indexChange) {
  const index = filteredItemIDs.findIndex(ID => ID == splashState.species) + indexChange;
    if (index >= 0 && index < filteredItemIDs.length) {
      window.scrollTo({top:(89+68*isMobile)*(index-2*!isMobile)});
      showInfoSplash(filteredItemIDs[index]);
    }
}

function showDescSplash(fid) {
  splashContent.style.width = '300px';
  const thisDesc = fidToDesc[fid-fidThreshold[0]];
  splashContent.innerHTML = `<b>${fidToName[fid]}</b><hr>`; // Name header
  const thisProcs = fidToProc[fid-fidThreshold[0]];
  if (fid<fidThreshold[1]) { // For abilities
    splashContent.innerHTML = `<b>${fidToName[fid]}</b><hr>${thisDesc}<br>`;
    // if (thisDesc[1]) { // If there is a custom description
    //   splashContent.innerHTML += `<p style="color:rgb(145, 145, 145); margin:0px; margin-top:8px;">${thisDesc[1]}</p>`;
    // }
    if (thisProcs[0] || thisProcs[1]) {
      const splashMoveTags = document.createElement('div');  splashMoveTags.className = 'splash-move-tags';
      thisProcs[0].forEach((thisProc) => { // Procs for stat boosts etc.
        if ([1,-1].includes(thisProc[1])) {
          splashMoveTags.innerHTML += `<p>${procToDesc[thisProc[0]]} ${thisProc[1]==1?'+':''}${thisProc[1]}</p>`;
        } else {
          splashMoveTags.innerHTML += `<p>${procToDesc[thisProc[0]]} × ${thisProc[1]}</p>`;
        }
      });
      if (thisProcs[1].includes(0)) splashMoveTags.innerHTML += "<p style='color:rgb(239, 131, 131);'>Not Implemented</p>";
      if (thisProcs[1].includes(1)) splashMoveTags.innerHTML += "<p style='color:rgb(240, 230, 140);'>Partially Implemented</p>";
      if (thisProcs[1].includes(2)) splashMoveTags.innerHTML += "<p>Can't be suppressed</p>";
      if (thisProcs[1].includes(3)) splashMoveTags.innerHTML += "<p>Can't be replaced</p>";
      if (thisProcs[1].includes(4)) splashMoveTags.innerHTML += "<p>Can't be ignored</p>";
      splashContent.appendChild(splashMoveTags);
    }
  } else { // For moves
    const splashMoveRow = document.createElement('div');  splashMoveRow.className = 'splash-move-row';
    altText.slice(4,8).forEach((attName,index) => { // Show type and damage category, then Power, Accuracy, PP
      const splashMoveCol = document.createElement('div');
      if (!index) splashMoveCol.innerHTML = `<span style="color:${typeColors[thisProcs[0]]};">${fidToName[thisProcs[0]]}</span><br><img src="ui/cat${thisProcs[1]}.png"></img>`;
      else splashMoveCol.innerHTML = `${attName}<br>${(thisProcs[1+index]==-1 ? '-' : thisProcs[1+index])}`;
      splashMoveRow.appendChild(splashMoveCol);
    });
    splashContent.appendChild(splashMoveRow);
    splashContent.innerHTML += `<hr>${thisDesc}`; // Show move description
    // if (thisDesc[1]) { // If there is a custom description
    //   splashContent.innerHTML += `<p style="color:rgb(145, 145, 145); margin:0px; margin-top:8px;">${thisDesc[1]}</p>`;
    // }
    // Add all descriptions for priority, targets, procs, tags
    if (thisProcs[5] || thisProcs[6] || thisProcs[7]) {
      const splashMoveTags = document.createElement('div');  splashMoveTags.className = 'splash-move-tags';
      if (thisProcs[5] > 0) { // If non-zero priority
        splashMoveTags.innerHTML += `<p style="color:rgb(143, 214, 154);">Priority: +${thisProcs[5]}</p>`;
      } else if (thisProcs[5] < 0) {
        splashMoveTags.innerHTML += `<p style="color:rgb(239, 131, 131);">Priority: ${thisProcs[5]}</p>`;
      }
      if (thisProcs[7].includes(20)) {splashMoveTags.innerHTML += '<p style="color:rgb(216, 143, 205);">Targets: Random Enemy</p>';};
      if (thisProcs[7].includes(21)) {splashMoveTags.innerHTML += '<p style="color:rgb(239, 131, 131);">Targets: All Enemies</p>';};
      if (thisProcs[7].includes(22)) {splashMoveTags.innerHTML += '<p style="color:rgb(247, 82, 49);">Targets: Entire Field</p>';};
      thisProcs[6].forEach((thisProc) => { // Procs for stats, status, flinch, etc.
        const procChance = ((thisProc[0] == '-1') ? '' : `${thisProc[0]}% `);
        const procStages = ((thisProc[2] == '0') ? '' : ` ${(thisProc[2] > 0 ? '+' : '')}${thisProc[2]}`);
        splashMoveTags.innerHTML += `<p>${procChance}${procToDesc[thisProc[1]]}${procStages}</p>`;
      });
      if (thisProcs[7].includes(60)) {splashMoveTags.innerHTML += "<p>User Atk maxed</p>";};
      if (thisProcs[7].includes(0))  {splashMoveTags.innerHTML += "<p>High Critical Ratio</p>";};
      if (thisProcs[7].includes(1))  {splashMoveTags.innerHTML += "<p>Guaranteed Critical Hit</p>";};
      if (thisProcs[7].includes(2))  {splashMoveTags.innerHTML += "<p>User Critical Rate +1</p>";};
      if (thisProcs[7].includes(35)) {splashMoveTags.innerHTML += "<p>Costs 50% of HP</p>";};
      if (thisProcs[7].includes(59)) {splashMoveTags.innerHTML += "<p>Costs 33% of HP</p>";};
      if (thisProcs[7].includes(34)) {splashMoveTags.innerHTML += "<p>Recoil 50% of HP</p>";};
      if (thisProcs[7].includes(36)) {splashMoveTags.innerHTML += "<p>Recoil 33% of damage</p>";};
      if (thisProcs[7].includes(37)) {splashMoveTags.innerHTML += "<p>Recoil 50% of damage</p>";};
      if (thisProcs[7].includes(53)) {splashMoveTags.innerHTML += "<p>Recoil 25% of damage</p>";};
      if (thisProcs[7].includes(46)) {splashMoveTags.innerHTML += "<p>30% deal 2x damage</p>";};
      if (thisProcs[7].includes(27)) {splashMoveTags.innerHTML += "<p>Heals Status Effects</p>";};
      if (thisProcs[7].includes(28)) {splashMoveTags.innerHTML += "<p>Heals Status Effects</p>";};
      if (thisProcs[7].includes(29)) {splashMoveTags.innerHTML += "<p>Heals Sleep</p>";};
      if (thisProcs[7].includes(30)) {splashMoveTags.innerHTML += "<p>Heals Freeze</p>";};
      if (thisProcs[7].includes(31)) {splashMoveTags.innerHTML += "<p>Heals Paralysis</p>";};
      if (thisProcs[7].includes(32)) {splashMoveTags.innerHTML += "<p>Heals Burn</p>";};
      if (thisProcs[7].includes(39)) {splashMoveTags.innerHTML += "<p>Heals 100% damage dealt</p>";};
      if (thisProcs[7].includes(40)) {splashMoveTags.innerHTML += "<p>Heals 75% damage dealt</p>";};
      if (thisProcs[7].includes(41)) {splashMoveTags.innerHTML += "<p>Heals by target's Atk</p>";};
      if (thisProcs[7].includes(42)) {splashMoveTags.innerHTML += "<p>Heals 50% damage dealt</p>";};
      if (thisProcs[7].includes(13)) {splashMoveTags.innerHTML += "<p>Triage gives priority</p>";};
      if (thisProcs[7].includes(5))  {splashMoveTags.innerHTML += "<p>No effect on Grass/Overcoat</p>";};
      if (thisProcs[7].includes(55)) {splashMoveTags.innerHTML += "<p>No seeding on Grass Types</p>";};
      if (thisProcs[7].includes(7))  {splashMoveTags.innerHTML += "<p>Boosted by Sharpness</p>";};
      if (thisProcs[7].includes(8))  {splashMoveTags.innerHTML += "<p>Boosted by Iron Fist</p>";};
      if (thisProcs[7].includes(9))  {splashMoveTags.innerHTML += "<p>Triggers Dancer ability</p>";};
      if (thisProcs[7].includes(10)) {splashMoveTags.innerHTML += "<p>No effect on Bulletproof</p>";};
      if (thisProcs[7].includes(11)) {splashMoveTags.innerHTML += "<p>Boosted by Mega Launcher</p>";};
      if (thisProcs[7].includes(12)) {splashMoveTags.innerHTML += "<p>Boosted by Strong Jaw</p>";};
      if (thisProcs[7].includes(33)) {splashMoveTags.innerHTML += "<p>Boosted by Reckless</p>";};
      if (thisProcs[7].includes(14)) {splashMoveTags.innerHTML += "<p>Sound based move</p><p>Ignores Substitute</p>";};
      if (thisProcs[7].includes(15)) {splashMoveTags.innerHTML += "<p>Prevented by Damp ability</p>";};
      if (thisProcs[7].includes(16)) {splashMoveTags.innerHTML += "<p>Triggers Wind Rider</p>";};
      if (thisProcs[7].includes(54)) {splashMoveTags.innerHTML += "<p>Ignores Abilities</p>";};
      if (thisProcs[7].includes(17)) {splashMoveTags.innerHTML += "<p>Ignores Protect</p>";};
      if (thisProcs[7].includes(18)) {splashMoveTags.innerHTML += "<p>Ignores Substitute</p>";};
      if (thisProcs[7].includes(19)) {splashMoveTags.innerHTML += "<p>Target switches out</p>";};
      if (thisProcs[7].includes(52)) {splashMoveTags.innerHTML += "<p>User switches out</p>";};
      if (thisProcs[7].includes(23)) {splashMoveTags.innerHTML += "<p>Hits 2 times</p>";};
      if (thisProcs[7].includes(24)) {splashMoveTags.innerHTML += "<p>Hits 3 times</p>";};
      if (thisProcs[7].includes(25)) {splashMoveTags.innerHTML += "<p>Hits 10 times</p>";};
      if (thisProcs[7].includes(26)) {splashMoveTags.innerHTML += "<p>Hits 2-5 times</p>";};
      if (thisProcs[7].includes(38)) {splashMoveTags.innerHTML += "<p>Repeats for 2-3 turns</p>";};
      if (thisProcs[7].includes(43)) {splashMoveTags.innerHTML += "<p>One Hit KO move</p><p>Modified against Bosses</p>";};
      if (thisProcs[7].includes(44)) {splashMoveTags.innerHTML += "<p>Removes hazards</p>";};
      if (thisProcs[7].includes(45)) {splashMoveTags.innerHTML += "<p>Traps and damages target</p>";};
      // if (thisProcLine[7].includes(6)) {splashMoveTags.innerHTML += "<p>Reflectable by magic</p>";};
      if (thisProcs[7].includes(47)) {splashMoveTags.innerHTML += "<p>Can't be redirected</p>";};
      if (thisProcs[7].includes(48)) {splashMoveTags.innerHTML += "<p>Always hits in Rain</p>";};
      if (thisProcs[7].includes(56)) {splashMoveTags.innerHTML += "<p>User can't switch out</p>";};
      if (thisProcs[7].includes(57)) {splashMoveTags.innerHTML += "<p>Target can't switch out</p>";};
      if (thisProcs[7].includes(58)) {splashMoveTags.innerHTML += "<p>User & Target can't switch out</p>";};
      if (thisProcs[7].includes(49)) {splashMoveTags.innerHTML += "<p>No effect on Bosses</p>";};
      if (thisProcs[7].includes(4))  {splashMoveTags.innerHTML += "<p>Makes Contact</p>";};
      if (thisProcs[7].includes(51)) {splashMoveTags.innerHTML += "<p style='color:rgb(240, 230, 140);'>Partially Implemented</p>";};
      if (thisProcs[7].includes(50)) {splashMoveTags.innerHTML += "<p style='color:rgb(239, 131, 131);'>Not Implemented</p>";};
      splashContent.appendChild(splashMoveTags);
    }
  }
  if (!lockedFilters.includes(fid)) { // Button to add ability/move directly to filters
    const splashButton = document.createElement('div'); splashButton.className = 'splash-button'; 
    splashButton.innerHTML = altText[8];  
    splashButton.addEventListener("click", () => { lockFilter(fid); 
      splashScreen.classList.remove("show"); movesetScreen.classList.remove("show"); });
    splashContent.appendChild(splashButton);
  }
  splashScreen.classList.add("show");
}
function fidToCategory(fid) {
  for (let index = 0; index < catToName.length; index++) {
    if (fid < fidThreshold[index]) return catToName[index]
  }
}
function fidToColor(fid) {
  if (fid < fidThreshold[0]) return ['rgb(255, 255, 255)', typeColors[fid]];
  if (fid < fidThreshold[1]) return ['rgb(140, 130, 240)', 'rgb(255, 255, 255)'];
  if (fid < fidThreshold[2]) return ['rgb(145, 145, 145)', 'rgb(255, 255, 255)'];
  if (fid < fidThreshold[3]) return ['rgb(131, 182, 239)', 'rgb(255, 255, 255)'];
  if (fid < fidThreshold[4]) return ['rgb(240, 230, 140)', 'rgb(255, 255, 255)'];
  if (fid < fidThreshold[5]) return ['rgb(216, 143, 205)', 'rgb(255, 255, 255)'];
  if (fid < fidThreshold[6]) return ['rgb(255, 255, 255)', 'rgb(239, 131, 131)'];
  if (fid < fidThreshold[7]) return ['rgb(255, 255, 255)', eggTierColors(fid)]
  if (fid < fidThreshold[8]) return ['rgb( 83, 237, 229)', 'rgb(229, 80, 120)'];
  if (fid < fidThreshold[9]) return ['rgb(143, 214, 154)', 'rgb(255, 255, 255)'];
  else return ['rgb(255, 255, 255)', 'rgb(140, 130, 240)']; 
}
function abToColor(name) {
  if (name == 'a1') return (headerState.ability==0||headerState.ability==1 ? 'rgb(255, 255, 255)' : 'rgb(145,145,145)')
  if (name == 'a2') return (headerState.ability==0||headerState.ability==1 ? 'rgb(255, 255, 255)' : 'rgb(145,145,145)')
  if (name == 'ha') return (headerState.ability==0||headerState.ability==2 ? 'rgb(240, 230, 140)' : 'rgb(105,105,105)')
  if (name == 'pa') return (headerState.ability==0||headerState.ability==3 ? 'rgb(140, 130, 240)' : 'rgb(145,145,145)')
}
function eggTierColors(fid) {
  if (fid >= fidThreshold[6]) fid -= fidThreshold[6];
  if (fid == 0) return 'rgb(255, 255, 255)';
  if (fid == 1) return 'rgb(131, 182, 239)';
  if (fid == 2) return 'rgb(240, 230, 140)';
  if (fid == 3) return 'rgb(239, 131, 131)';
  if (fid == 4) return 'rgb(216, 143, 205)';
  if (fid == 5) return 'rgb(143, 214, 154)';
  else { console.log('Invalid egg tier'); return null; }
}

// Display the filter suggestions *************************
function displaySuggestions() { // Get search query and clear the list
  filterToEnter = null;   suggestions.innerHTML = '';
  const query = searchBox.value.toLowerCase().replace(/[.’'\s-]/g,'');
  if (query.length) {
    // Filter by species name, to suggest families
    let filteredSID = possibleSID.filter((ID) => items[ID].dex.toString().includes(query) || 
      speciesNames[ID].toLowerCase().replace(/[.’'\s-]/g,'').includes(query));
    if (filteredSID.length > 20) filteredSID = [];
    let offerFamilies = [...new Set(filteredSID.map(ID => items[ID].fa))];
    if (offerFamilies.length > 4) offerFamilies = [];

    let matchingFID = [];   
    // Filter suggestions based on query and exclude already locked filters
    matchingFID = possibleFID.filter((fid) => {
        let searchableName = fidToSearch[fid];
        if (fid >= fidThreshold[2] && fid < fidThreshold[8]) { // Search via category for later categories
          searchableName = `${fidToCategory(fid).toLowerCase().replace(/[.’'\s-]/g,'')}${searchableName}`;  
        } else if (fid >= fidThreshold[8] && offerFamilies.includes(fid)) {
          return !lockedFilters.some((f) => f == fid);
        }
        // Suggest if it contains the search query and is not already locked
        return searchableName.includes(query) && !lockedFilters.some((f) => f == fid);
    });
    if (matchingFID.length > 22) matchingFID = []; // Erase the list of suggestions if it is too large
    
    if (lockedFilters.length > 0) { // If there is at least one locked filter, re-sort the list
      // (If there are no locked filters, the list is already presorted)
      // Count how many hits each suggestion has

      // Sort the list of suggestions based on hits in the item list (but still by type/ability/move)
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
  if (!lockedFilters.some((f) => f == newLockFID)) {
    lockedFilters.push(newLockFID); // Add the filter to the locked filters container
    let filterMod = null;
    if (lockedFilters.length > 1) {
      const familyOR = (newLockFID >= fidThreshold[8] && lockedFilters[lockedFilters.length-2] >= fidThreshold[8]);
      filterMod = document.createElement("span"); filterMod.toggleOR = familyOR;
      filterMod.className = "filter-mod";         filterMod.innerHTML = (familyOR?'OR':'&');
      filterMod.addEventListener("click", () => toggleOR(filterMod));
      lockedFilterMods.push(filterMod); filterContainer.appendChild(filterMod);
    }
    const filterTag = document.createElement("span"); filterTag.className = "filter-tag";
    const img = document.createElement('img');        img.src = 'ui/lock.png';    filterTag.appendChild(img);
    filterTag.innerHTML += `${fidToCategory(newLockFID)}: ${fidToName[newLockFID]}`;
    filterTag.addEventListener("click", () => removeFilter(newLockFID, filterTag, filterMod));
    filterContainer.appendChild(filterTag);
    // Clear the search bar after locking
    searchBox.value = ""; 
    updateFilterGroups();   
    if (newLockFID === fidThreshold[7] && headerState.shiny == 0) updateHeader(headerColumns[1]);
    if (sortState.column === 'row' && ((newLockFID >= fidThreshold[1] && newLockFID < fidThreshold[2]) || (newLockFID >= fidThreshold[8] && newLockFID < fidThreshold[9]))) {
      updateHeader(headerColumns[5]);
    } else {
      updateHeader(null, true); // Update header, then refresh items and suggestions
    }
  }
}

// Remove a filter **************************
function removeFilter(fidToRemove, filterTag, filterModToRemove) {
  // If removing first filter, also remove mod attached to second filter
  if (lockedFilters.length > 1 && fidToRemove == lockedFilters[0]) filterModToRemove = lockedFilterMods[0];
  // Remove the filter from the filter list, and remove the actual filter tag
  lockedFilters = lockedFilters.filter( (f) => f != fidToRemove );  filterTag.remove();
  lockedFilterMods = lockedFilterMods.filter( (f) => f != filterModToRemove ); // Remove from the mod list
  if (filterModToRemove) filterModToRemove.remove(); // Remove the actual mod element
  updateFilterGroups();  
  if (fidToRemove == fidThreshold[7] && headerState.shiny == 3) { headerState.shiny = 0;  headerColumns[1].innerHTML = headerNames[1]; }
  // Reset the sorting if there aren't any more locked moves
  if (sortState.column === 'moves' && !lockedFilters.some((f) => (f >= (fidThreshold[1] && f < fidThreshold[2]) || (f >= fidThreshold[8] && f < fidThreshold[9])))) { 
    updateHeader(headerColumns[0]); 
  } else { 
    updateHeader(null, true); // Update header, then refresh items and suggestions
  }
  if (lockedFilters.length == 0) { // Reset the animation of the page title
    pageTitle.classList.remove('colorful-text');  void pageTitle.offsetWidth;
    pageTitle.classList.add('colorful-text');
  }
  if (!isMobile) searchBox.focus();
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
  if (clickTarget == null) {clickTarget = sortState.target; ignoreFlip = true;}
  // Set the text of the move column, depending on if a move is filtered
  if (lockedFilters.some(f => (f >= fidThreshold[1] && f < fidThreshold[2]) || (f >= fidThreshold[8] && f < fidThreshold[9]))) {
    headerColumns[5].textDef = `<span style="color:rgb(140, 130, 240);">${altText[0]}</span>`;
  } else {
    headerColumns[5].textDef = headerNames[5];
    if (clickTarget == headerColumns[5]) clickTarget = null;
  }
  // Find the new sorting attribute, and update the headers
  const sortAttribute = clickTarget?.sortattr;
  if (sortAttribute == 'shiny') { // Toggle the global shiny state
    headerState.shiny = (headerState.shiny+3)%4;
    if (headerState.shiny) {
      headerColumns[1].innerHTML = `<span style="color:rgb(140, 130, 240);">${headerNames[1]}</span>`;
      const starImg = document.createElement('img');  starImg.className = 'star-header';
      starImg.src = `ui/shiny${headerState.shiny}.png`;
      headerColumns[1].appendChild(starImg);
    } else {
      headerColumns[1].innerHTML = headerNames[1];
    }
  } else if (sortAttribute == 'ab') { // Toggle the global ability state
    headerState.ability = (headerState.ability+1)%4;
    if (headerState.ability) {
      headerColumns[4].innerHTML = `<span style="color:rgb(140, 130, 240);">${headerNames[4]}</span>`;
      if      (headerState.ability == 1) headerColumns[4].innerHTML += `<span style="color:rgb(255, 255, 255); font-size:12px;">(${altText[1]})</span>`;
      else if (headerState.ability == 2) headerColumns[4].innerHTML += `<span style="color:rgb(240, 230, 140); font-size:12px;">(${altText[2]})</span>`;
      else if (headerState.ability == 3) headerColumns[4].innerHTML += `<span style="color:rgb(140, 130, 240); font-size:12px;">(${altText[3]})</span>`;
    } else headerColumns[4].innerHTML = headerNames[4];
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
      for (const thisColumn of headerColumns.slice(6,15)) row2.appendChild(thisColumn);  
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
window.addEventListener("scroll", () => { // Load more items on scroll
  if (window.scrollY + window.innerHeight >= document.body.scrollHeight * 0.8 - 1000) renderMoreItems();
});
window.addEventListener("resize", () => adjustLayout()); // Run on page load and when resizing the window
searchBox.addEventListener('input', (event) => { // Typing in search box
  tabSelect = -1;
  refreshAllItems();
});
document.addEventListener('keydown', (event) => { 
  const ignoredKeys = ["Escape", "Tab", "Shift", "PageDown", "PageUp", "Control", "Alt", "Meta", "CapsLock", 
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (!ignoredKeys.includes(event.key)) { // Ignore certain key presses
    // Ignore all key presses if 'Ctrl' is held, except when pasting
    if (!event.ctrlKey || event.code == "KeyV") {
      if (movesetScreen.classList.contains("show") && !splashScreen.classList.contains("show")) movesetScreen.classList.remove("show");
      if (splashScreen.classList.contains("show")) splashScreen.classList.remove("show");
      searchBox.focus(); // Focus the search box on any key press
    }
  }
  // Hit left/right to cycle moveset splash
  if (movesetScreen.classList.contains('show') && !splashScreen.classList.contains("show")) {
    if (event.key == "ArrowLeft" || event.key == "ArrowRight") changeMoveset(event.key == "ArrowRight" ? 1 : -1);
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
    } else if (searchBox.value.length > 0) { // Clear text from the search box
      searchBox.value = '';
      refreshAllItems();
    } else if (lockedFilters.length > 0) { // If there is locked filter
      const lastFilter = lockedFilters[lockedFilters.length - 1];
      const filterTags = document.querySelectorAll(".filter-tag");
      const lastTag = filterTags[filterTags.length - 1];
      const lastMod = lockedFilterMods[lockedFilterMods.length - 1];
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
// Close splash screen when clicking outside the content box
splashScreen.addEventListener("click", (event) => {
  if (event.target === splashScreen) {
    splashScreen.classList.remove("show");
  }
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
function openHelpMenu() { // Show the instructions
  splashContent.style.width = '382px';
  splashContent.innerHTML = helpMenuText;
  splashScreen.classList.add("show"); // Make it visible
}