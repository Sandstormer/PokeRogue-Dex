// script.js
// Imports: items, fidThreshold, fidToName, fidToDesc, typeColors

const itemList = document.getElementById('itemList');
const searchBox = document.getElementById('searchBox');
const pageTitle = document.getElementById('page-title');
const titleimg = document.getElementById('mag-img');
const headerContainer = document.getElementById("header-container");
const filterContainer = document.getElementById("filter-container");
const suggestions = document.getElementById("suggestions");
const splashScreen = document.getElementById("splashScreen");
const splashContent = document.getElementById("splashContent");
const openMenuButton = document.getElementById("menu-img");
const possibleFID = [...Array(fidThreshold[fidThreshold.length-2]).keys()];
const possibleSID = [...Array(items.length-1).keys()];
let increment = 1; // Number of items to load at a time
let renderLimit = 0; // Start with no items
let showMoveLearn = []; // Filtered moves to show sources
let filterToEnter = null;
let tabSelect = 0;
let lockedFilters = []; // List of all locked filters
let lockedFilterMods = []; // List of filter mods objects
let lockedFilterGroups = [[]]; // Grouped together for OR
let pinnedRows = []; // List of pinned row numbers
let isMobile = false;
let filteredItemIDs = null;
let shinyState = 0;   // Global state of shiny   (0,1,2,3)
let abilityState = 0; // Global state of ability (0,1,2,3)
let offerFamilies = [];

// Set up the header columns
let headerColumns = [];
const headerNames = ['Dex', 'Shiny', 'Species', 'Types', 'Abilities', 'Egg Moves', 'Cost', 'BST', 'HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
const sortAttributes = ['row', 'shiny', 'sp', 't1', 'ab', 'moves', 'co', 'bst', 'hp', 'atk', 'def', 'spa', 'spd', 'spe'];
headerNames.forEach((thisHeaderName, index) => {
  const newColumn = document.createElement('div');
  newColumn.innerHTML = thisHeaderName;
  newColumn.sortattr = sortAttributes[index];
  newColumn.textDef = thisHeaderName;
  newColumn.className = 'header-column';
  newColumn.addEventListener('click', () => {updateHeader(newColumn)} );
  headerColumns.push(newColumn); // Push the column element into the array
});
openMenuButton.addEventListener('mouseover', () => {openMenuButton.src = `ui/menu${(isMobile?18:30)}h.png`;});
openMenuButton.addEventListener('mouseout',  () => {openMenuButton.src = `ui/menu${(isMobile?18:30)}.png`;});       
let sortState = { column: null, ascending: true }; // Track the current sort state
let currentTarget = null; // Track current sorted column

// Display items based on query and locked filters
function refreshAllItems() {
  // console.log('Refreshing all items');
  const query = searchBox.value.toLowerCase().replace(/\s+/g, '');
  // itemList.innerHTML = ""; // Clear existing items
  itemList.querySelectorAll('li').forEach(li => {
    li.replaceWith(li.cloneNode(true)); // Clones without listeners
  });
  while (itemList.firstChild) {
    itemList.firstChild.remove();
  }

  filteredItemIDs = possibleSID;
  // Filter from query ==============
  if (query.length > 0) {
    filteredItemIDs = filteredItemIDs.filter((ID) => 
      speciesNames[items[ID].row].toLowerCase().replace(/\s+/g, '').includes(query) ||
      fidToSearch[items[ID].t1].includes(query) ||
      fidToSearch[items[ID].t2]?.includes(query) ||
      ([0,1].includes(abilityState) && fidToSearch[items[ID].a1].includes(query)) ||
      ([0,1].includes(abilityState) && fidToSearch[items[ID].a2]?.includes(query)) ||
      ([0,2].includes(abilityState) && fidToSearch[items[ID].ha]?.includes(query)) ||
      ([0,3].includes(abilityState) && fidToSearch[items[ID].pa]?.includes(query)) ||
      items[ID].dex.toString().includes(query)
  );}
  // Filter from headers ==============
  if (abilityState == 2) filteredItemIDs = filteredItemIDs.filter(ID => 'ha' in items[ID])
  // Only show items that have that tier of shiny
  if (shinyState > 1)    filteredItemIDs = filteredItemIDs.filter(ID => items[ID].sh >= shinyState);
  
  // Filter from locked filters ==============
  if (lockedFilters.length > 0) {
    filteredItemIDs = filteredItemIDs.filter(ID => // Search for filters with their fid as key
      lockedFilterGroups.every(thisGroup =>      // All groups, but some from each group
        thisGroup.some(thisLockedFID => {
          if (abilityState != 0 && thisLockedFID >= fidThreshold[0] && thisLockedFID < fidThreshold[1]) {
            if (abilityState == 1)      { return items[ID]?.[thisLockedFID] == 309 || items[ID]?.[thisLockedFID] == 310 } 
            else if (abilityState == 2) { return items[ID]?.[thisLockedFID] == 311 }
            else if (abilityState == 3) { return items[ID]?.[thisLockedFID] == 312 }
          }
          if (thisLockedFID  <  fidThreshold[2]) return thisLockedFID in items[ID]; // Type/Ability/Move filters
          if (thisLockedFID  <  fidThreshold[3]) return items[ID].ge === thisLockedFID - fidThreshold[2] + 1; // Gen filters
          if (thisLockedFID  <  fidThreshold[4]) return items[ID].co === thisLockedFID - fidThreshold[3] + 1; // Cost filters
          if (thisLockedFID === fidThreshold[4]) return items[ID].fe === 1; // Gender filter
          if (thisLockedFID === fidThreshold[5]) return true; // Flipped stat filter
          if (thisLockedFID  <  fidThreshold[7]) return items[ID].et === thisLockedFID - fidThreshold[6]; // Egg tier filter
          if (thisLockedFID  <  fidThreshold[8]) return fidToName[thisLockedFID] === speciesNames[items[ID].sr]; // Family filter
          console.warn('Filter error');
          return thisLockedFID in items[ID];
        }))) 
      }
  // Add moves to track in the move column  ==============
  showMoveLearn = [];
  lockedFilters.forEach(thisLockedFID => {
    if (fidToCategory(thisLockedFID) == "Move") showMoveLearn.push(thisLockedFID);
  });
  // Remove the pinned items for now ==============
  if (pinnedRows) filteredItemIDs = filteredItemIDs.filter((thisID) => !pinnedRows.includes(thisID));

  // Show entire evolutionary line ==============
  // offerFamilies = [];
  // if (filteredItems.length < 10) {
  //   filteredItems.forEach((ID) => { // Assemble the list of families
  //     if (!offerFamilies.includes(items[ID].sr)) {offerFamilies.push(items[ID].sr);}
  //   });
  // }
    // if (starterRows.length == 1) { // If there are less than 4 families
    //   offerFamilies = starterRows[0];
      // let allRelatives = items.filter((thisItem) => starterRows.includes(thisItem.sr) && !filteredItems.includes(thisItem));
      // if (lockedFilters.includes(fidThreshold[8]-1)) {
      //   filteredItems.push(...allRelatives); // Add relatives if filter is locked
      // } else if (allRelatives.length > 0) { // Else show the suggestion
      //   offerFamily = 1;
      // }
    // }

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
      } else if (sortState.column == 't1') { // Sort by type combinations
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

  // Render the first few items
  renderLimit = 0;
  renderMoreItems();
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
  helpMessage.addEventListener('click', () => { openMenu(); });
  itemList.appendChild(helpMessage)
  }
}

function renderMoreItems() {
  // console.log('Rendering more items');
  renderLimit += increment;
  let slicedItemIDs = filteredItemIDs.slice(renderLimit-increment,renderLimit)
  slicedItemIDs.forEach((thisID, index) => { // Generate each list item dynamically
    const li = document.createElement('li'); // Entry of one Pokemon
    const item = items[thisID]; // Grab the actual item from its ID
    // Create each column and set its text
    
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
    pinImg.addEventListener('mouseover', () => {pinImg.src = `ui/pinhover.png`;});
    pinImg.addEventListener('mouseout',  () => {pinImg.src = `ui/pin${(pinnedRows.includes(thisID) ? 'on' : 'off')}.png`;});
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
      femImg.addEventListener('mouseover', () => {femImg.src = `ui/femon.png`;});
      femImg.addEventListener('mouseout',  () => {femImg.src = `ui/fem${(pokeImg.femOverride ? 'on' : 'off')}.png`;});
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
        starImg.addEventListener('mouseover', () => {starImg.src = `ui/shiny${i}.png`;});
        starImg.addEventListener('mouseout',  () => {starImg.src = `ui/shiny${i}${(pokeImg.shinyOverride==i ? '' : 'g')}.png`;});
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
      dexColumn.innerHTML = '<a href="https://wiki.pokerogue.net/pokedex:' + item.dex + '" target="_blank">#' + item.dex + '</a><br>';
      pokeImg.stars.forEach((thisStar) => starColumn.appendChild(thisStar));
      if (item.fe == 1) {
        femImg.className = 'star-img';
        starColumn.appendChild(femImg);
      }
    } else { // Append all to the dex column on desktop
      dexColumn.appendChild(pinImg);
      if (item.fe == 1) {dexColumn.appendChild(femImg);}
      const dexText = document.createElement('div');
      dexText.innerHTML = '<a href="https://wiki.pokerogue.net/pokedex:' + item.dex + '" target="_blank">#' + item.dex + '</a><br>';
      dexColumn.appendChild(dexText);
      pokeImg.stars.forEach((thisStar) => dexColumn.appendChild(thisStar));
    }
    
    const specColumn = document.createElement('div'); // Show species name
    specColumn.className = 'item-column';
    specColumn.innerHTML = speciesNames[item.row];
    
    const typeColumn = document.createElement('div'); // Show both types
    typeColumn.className = 'item-column';
    typeColumn.innerHTML = '<p style="color:' + typeColors[item.t1] + '; margin: 0;">' + fidToName[item.t1] + '</p>';
    if ('t2' in item) { typeColumn.innerHTML += '<p style="color:' + typeColors[item.t2] + '; margin: 0;">' + fidToName[item.t2] + '</p>'; } 
    
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
        if (source == -1) {sourceText = '<span style="color:rgb(251, 173, 124);">Memory';}
        else if (source == 0) {sourceText = '<span style="color:rgb(131, 182, 239);">Evolution';}
        else if (source == 201) {sourceText = '<span style="color:rgb(255, 255, 255);">Egg Move';}
        else if (source == 202) {sourceText = '<span style="color:rgb(240, 230, 140);">Rare Egg Move';}
        else if (source == 203) {sourceText = '<span style="color:rgb(255, 255, 255);">Common TM';}
        else if (source == 204) {sourceText = '<span style="color:rgb(131, 182, 239);">Great TM';}
        else if (source == 205) {sourceText = '<span style="color:rgb(240, 230, 140);">Ultra TM';}
        else {sourceText = `<span style="color:rgb(255, 255, 255);">Lv ${item[thisMove]}`;}
        // Show the move name, with click event for splash screen
        const clickableRow = document.createElement('div');  clickableRow.className = 'clickable-name';
        clickableRow.innerHTML = `<p style="color:rgb(140, 130, 240); margin: 0;"> 
                                 ${fidToName[thisMove]}:<br>${sourceText}</span></p>`;
        clickableRow.addEventListener('click', () => {showMoveSplash(thisMove);});
        moveColumn.appendChild(clickableRow);
      }
    });
    if (showMoveLearn.length == 0) {
      ['e1','e2','e3','e4'].forEach((name) => {
        // Show the move name, with click event for splash screen
        const clickableRow = document.createElement('div');  clickableRow.className = 'clickable-name';
        if (name == 'e4') { clickableRow.style.color = 'rgb(240, 230, 140)'; }
        // clickableRow.style.color = typeColors[fidToDesc[item[name]][2]];
        clickableRow.innerHTML = fidToName[item[name]];
        clickableRow.addEventListener('click', () => {showMoveSplash(item[name]);});
        moveColumn.appendChild(clickableRow);
      });
    }

    const costColumn = document.createElement('div'); // Show the cost, colored by the egg tier
          costColumn.className = 'item-column'; costColor = eggTierColors(item.et);
          costColumn.innerHTML = `Cost<br><span style="color:${costColor};">${item.co}</span>`;  
    let flipped = lockedFilters.includes(fidThreshold[5]);                
    const bstColumn = document.createElement('div');  bstColumn.className = 'item-column'; // Create the stats columns
           bstColumn.innerHTML = 'BST<br>' + item.bst +'';
    const hpColumn = document.createElement('div');   hpColumn.className = 'item-column';  
          hpColumn.innerHTML  = 'HP<br>'  + (flipped ? item.spe : item.hp)  +'';
    const atkColumn = document.createElement('div');  atkColumn.className = 'item-column'; 
          atkColumn.innerHTML = 'Atk<br>' + (flipped ? item.spd : item.atk) +'';    
    const defColumn = document.createElement('div');  defColumn.className = 'item-column'; 
          defColumn.innerHTML = 'Def<br>' + (flipped ? item.spa : item.def) +'';    
    const spaColumn = document.createElement('div');  spaColumn.className = 'item-column'; 
          spaColumn.innerHTML = 'SpA<br>' + (flipped ? item.def : item.spa) +'';    
    const spdColumn = document.createElement('div');  spdColumn.className = 'item-column'; 
          spdColumn.innerHTML = 'SpD<br>' + (flipped ? item.atk : item.spd) +'';    
    const speColumn = document.createElement('div');  speColumn.className = 'item-column'; 
          speColumn.innerHTML = 'Spe<br>' + (flipped ? item.hp : item.spe)  +'';

    const row1 = document.createElement('div'); row1.className = 'row'; let row2 = row1;
    if (isMobile) {
      // row1.style.backgroundColor = (index%2 == 0 ? '#151019' : '#252129');
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
  const thisDesc = fidToDesc[fid];
  splashContent.innerHTML = `<b>${fidToName[fid]}</b><hr>`; // Name header
  if (fid<fidThreshold[1]) { // For abilities
    splashContent.innerHTML = `<b>${fidToName[fid]}</b><hr>${thisDesc[0]}`;
    if (thisDesc[1]) { // If there is a custom description
      splashContent.innerHTML += `<p style="color:rgb(145, 145, 145); margin:0px; margin-top:8px;">${thisDesc[1]}</p>`;
    }
  } else { // For moves
    const splashMoveRow = document.createElement('div');  splashMoveRow.className = 'splash-move-row';
    const splashMoveCol1 = document.createElement('div');
    splashMoveCol1.innerHTML = `<span style="color:${typeColors[thisDesc[2]]};">${fidToName[thisDesc[2]]}</span><br><img src="ui/cat${thisDesc[3]}.png"></img>`;
    splashMoveRow.appendChild(splashMoveCol1);
    ['Pow','Acc','PP'].forEach((attName,index) => {
      const splashMoveCol = document.createElement('div');
      splashMoveCol.innerHTML = `${attName}<br>${(thisDesc[4+index]==-1 ? '-' : thisDesc[4+index])}`;
      splashMoveRow.appendChild(splashMoveCol);
    });
    splashContent.appendChild(splashMoveRow);
    splashContent.innerHTML += `<hr>${thisDesc[0]}`; // Show move description
    if (thisDesc[1]) { // If there is a custom description
      splashContent.innerHTML += `<p style="color:rgb(145, 145, 145); margin:0px; margin-top:8px;">${thisDesc[1]}</p>`;
    }
    // Add all tags for priority, targets, procs, contact, other
    if (thisDesc[7] || thisDesc[8] || thisDesc[9]) {
      const splashMoveTags = document.createElement('div');  splashMoveTags.className = 'splash-move-tags';
      if (thisDesc[7] > 0) {
        {splashMoveTags.innerHTML += `<p style="color:rgb(143, 214, 154);">Priority: +${thisDesc[7]}</p>`;};
      } else if (thisDesc[7] < 0) {
        {splashMoveTags.innerHTML += `<p style="color:rgb(239, 131, 131);">Priority: ${thisDesc[7]}</p>`;};
      }
      if (thisDesc[9].includes(20)) {splashMoveTags.innerHTML += '<p style="color:rgb(216, 143, 205);">Targets: Random Enemy</p>';};
      if (thisDesc[9].includes(21)) {splashMoveTags.innerHTML += '<p style="color:rgb(251, 173, 124);">Targets: All Enemies</p>';};
      if (thisDesc[9].includes(22)) {splashMoveTags.innerHTML += '<p style="color:rgb(239, 131, 131);">Targets: Entire Field</p>';};
      thisDesc[8].forEach((thisProc) => {
        const procChance = ((thisProc[0] == '-1') ? '' : `${thisProc[0]}% `);
        const procStages = ((thisProc[2] == '0') ? '' : ` ${(thisProc[2] > 0 ? '+' : '')}${thisProc[2]} `);
        splashMoveTags.innerHTML += `<p>${procChance}${procToDesc[thisProc[1]]}${procStages}</p>`;
      });
      if (thisDesc[9].includes(60)) {splashMoveTags.innerHTML += "<p>User Atk maxed</p>";};
      if (thisDesc[9].includes(0))  {splashMoveTags.innerHTML += "<p>High Critical Ratio</p>";};
      if (thisDesc[9].includes(1))  {splashMoveTags.innerHTML += "<p>Guaranteed Critical Hit</p>";};
      if (thisDesc[9].includes(2))  {splashMoveTags.innerHTML += "<p>User Critical Rate +1</p>";};
      if (thisDesc[9].includes(35)) {splashMoveTags.innerHTML += "<p>Costs 50% of HP</p>";};
      if (thisDesc[9].includes(59)) {splashMoveTags.innerHTML += "<p>Costs 33% of HP</p>";};
      if (thisDesc[9].includes(34)) {splashMoveTags.innerHTML += "<p>Recoil 50% of HP</p>";};
      if (thisDesc[9].includes(36)) {splashMoveTags.innerHTML += "<p>Recoil 33% of damage</p>";};
      if (thisDesc[9].includes(37)) {splashMoveTags.innerHTML += "<p>Recoil 50% of damage</p>";};
      if (thisDesc[9].includes(53)) {splashMoveTags.innerHTML += "<p>Recoil 25% of damage</p>";};
      if (thisDesc[9].includes(27)) {splashMoveTags.innerHTML += "<p>Heals Status Effects</p>";};
      if (thisDesc[9].includes(28)) {splashMoveTags.innerHTML += "<p>Heals Status Effects</p>";};
      if (thisDesc[9].includes(29)) {splashMoveTags.innerHTML += "<p>Heals Sleep</p>";};
      if (thisDesc[9].includes(30)) {splashMoveTags.innerHTML += "<p>Heals Freeze</p>";};
      if (thisDesc[9].includes(31)) {splashMoveTags.innerHTML += "<p>Heals Paralysis</p>";};
      if (thisDesc[9].includes(32)) {splashMoveTags.innerHTML += "<p>Heals Burn</p>";};
      if (thisDesc[9].includes(39)) {splashMoveTags.innerHTML += "<p>Heals 100% damage dealt</p>";};
      if (thisDesc[9].includes(40)) {splashMoveTags.innerHTML += "<p>Heals 75% damage dealt</p>";};
      if (thisDesc[9].includes(41)) {splashMoveTags.innerHTML += "<p>Heals by target's Atk</p>";};
      if (thisDesc[9].includes(42)) {splashMoveTags.innerHTML += "<p>Heals 50% damage dealt</p>";};
      if (thisDesc[9].includes(13)) {splashMoveTags.innerHTML += "<p>Triage gives +3 priority</p>";};
      if (thisDesc[9].includes(5))  {splashMoveTags.innerHTML += "<p>No effect on Grass/Overcoat</p>";};
      if (thisDesc[9].includes(55)) {splashMoveTags.innerHTML += "<p>No seeding on Grass Types</p>";};
      if (thisDesc[9].includes(7))  {splashMoveTags.innerHTML += "<p>Boosted by Sharpness</p>";};
      if (thisDesc[9].includes(8))  {splashMoveTags.innerHTML += "<p>Boosted by Iron Fist</p>";};
      if (thisDesc[9].includes(9))  {splashMoveTags.innerHTML += "<p>Triggers Dancer ability</p>";};
      if (thisDesc[9].includes(10)) {splashMoveTags.innerHTML += "<p>No effect on Bulletproof</p>";};
      if (thisDesc[9].includes(11)) {splashMoveTags.innerHTML += "<p>Boosted by Mega Launcher</p>";};
      if (thisDesc[9].includes(12)) {splashMoveTags.innerHTML += "<p>Boosted by Strong Jaw</p>";};
      if (thisDesc[9].includes(33)) {splashMoveTags.innerHTML += "<p>Boosted by Reckless</p>";};
      if (thisDesc[9].includes(14)) {splashMoveTags.innerHTML += "<p>Sound based move</p>";};
      if (thisDesc[9].includes(15)) {splashMoveTags.innerHTML += "<p>Prevented by Damp ability</p>";};
      if (thisDesc[9].includes(16)) {splashMoveTags.innerHTML += "<p>Triggers Wind Rider</p>";};
      if (thisDesc[9].includes(54)) {splashMoveTags.innerHTML += "<p>Ignores Abilities</p>";};
      if (thisDesc[9].includes(17)) {splashMoveTags.innerHTML += "<p>Ignores Protect</p>";};
      if (thisDesc[9].includes(18) || thisDesc[9].includes(14)) {splashMoveTags.innerHTML += "<p>Ignores Substitute</p>";};
      if (thisDesc[9].includes(19)) {splashMoveTags.innerHTML += "<p>Switches out target</p>";};
      if (thisDesc[9].includes(52)) {splashMoveTags.innerHTML += "<p>User switches out</p>";};
      if (thisDesc[9].includes(23)) {splashMoveTags.innerHTML += "<p>Hits 2 times</p>";};
      if (thisDesc[9].includes(24)) {splashMoveTags.innerHTML += "<p>Hits 3 times</p>";};
      if (thisDesc[9].includes(25)) {splashMoveTags.innerHTML += "<p>Hits 10 times</p>";};
      if (thisDesc[9].includes(26)) {splashMoveTags.innerHTML += "<p>Hits 2-5 times</p>";};
      if (thisDesc[9].includes(38)) {splashMoveTags.innerHTML += "<p>Repeats for 2-3 turns</p>";};
      if (thisDesc[9].includes(43)) {splashMoveTags.innerHTML += "<p>One Hit KO move</p><p>Modified against Bosses</p>";};
      if (thisDesc[9].includes(44)) {splashMoveTags.innerHTML += "<p>Removes hazards</p>";};
      if (thisDesc[9].includes(45)) {splashMoveTags.innerHTML += "<p>Traps and damages target</p>";};
      if (thisDesc[9].includes(46)) {splashMoveTags.innerHTML += "<p>30% deal 2x damage</p>";};
      // if (thisDesc[9].includes(6)) {splashMoveTags.innerHTML += "<p>Reflectable by magic</p>";};
      if (thisDesc[9].includes(47)) {splashMoveTags.innerHTML += "<p>Can't be redirected</p>";};
      if (thisDesc[9].includes(48)) {splashMoveTags.innerHTML += "<p>Always hits in Rain</p>";};
      if (thisDesc[9].includes(56)) {splashMoveTags.innerHTML += "<p>User can't switch out</p>";};
      if (thisDesc[9].includes(57)) {splashMoveTags.innerHTML += "<p>Target can't switch out</p>";};
      if (thisDesc[9].includes(58)) {splashMoveTags.innerHTML += "<p>User & Target can't switch out</p>";};
      if (thisDesc[9].includes(49)) {splashMoveTags.innerHTML += "<p>No effect on Bosses</p>";};
      if (thisDesc[9].includes(4))  {splashMoveTags.innerHTML += "<p>Makes Contact</p>";};
      if (thisDesc[9].includes(51)) {splashMoveTags.innerHTML += "<p style='color:rgb(240, 230, 140);'>Partially Implemented</p>";};
      if (thisDesc[9].includes(50)) {splashMoveTags.innerHTML += "<p style='color:rgb(239, 131, 131);'>Not Implemented</p>";};
      splashContent.appendChild(splashMoveTags);
    }
  }
  splashScreen.classList.add("show"); // Make it visible
}
function fidToCategory(fid) {
  if (fid < fidThreshold[0]) { return 'Type'; }
  if (fid < fidThreshold[1]) { return 'Ability'; }
  if (fid < fidThreshold[2]) { return 'Move'; }
  if (fid < fidThreshold[3]) { return 'Gen'; }
  if (fid < fidThreshold[4]) { return 'Cost'; }
  if (fid < fidThreshold[5]) { return 'Gender'; }
  if (fid < fidThreshold[6]) { return 'Mode'; }
  if (fid < fidThreshold[7]) { return 'Egg Tier'; }
  else { return 'Related To'; }
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
  else { return ['rgb(255, 255, 255)', 'rgb(140, 130, 240)']; }
}
function abToColor(name) {
  if (name == 'a1') { return (abilityState==0||abilityState==1 ? 'rgb(255, 255, 255)' : 'rgb(145,145,145)') }
  if (name == 'a2') { return (abilityState==0||abilityState==1 ? 'rgb(255, 255, 255)' : 'rgb(145,145,145)') }
  if (name == 'ha') { return (abilityState==0||abilityState==2 ? 'rgb(240, 230, 140)' : 'rgb(105,105,105)') }
  if (name == 'pa') { return (abilityState==0||abilityState==3 ? 'rgb(140, 130, 240)' : 'rgb(145,145,145)') }
}
function eggTierColors(fid) {
  if (fid >= fidThreshold[6]) { fid -= fidThreshold[6]; }
  if (fid == 0) { return 'rgb(255, 255, 255)'; }
  if (fid == 1) { return 'rgb(131, 182, 239)'; }
  if (fid == 2) { return 'rgb(240, 230, 140)'; }
  if (fid == 3) { return 'rgb(239, 131, 131)'; }
  if (fid == 4) { return 'rgb(216, 143, 205)'; }
  else { console.log('Invalid egg tier'); return null; }
}

// Display the filter suggestions *************************
function displaySuggestions() { // Get search query and clear the list
  const query = searchBox.value.toLowerCase().replace(/\s+/g, '');
  let matchingFID = [];   filterToEnter = null;   suggestions.innerHTML = '';
  // Filter suggestions based on query and exclude already locked filters
  matchingFID = possibleFID.filter((fid) => {
      let searchableName = fidToName[fid]; // Search via category for later categories
      if (fid >= fidThreshold[2]) { searchableName = `${fidToCategory(fid)}${fidToName[fid]}`; }
      // Contains the search query and is not already locked
      if (fid < fidThreshold[7]) {
        return searchableName.toLowerCase().replace(/\s+/g, '').includes(query) 
            && !lockedFilters.some((f) => f == fid);
      } else { // For family filters
        return offerFamilies.some((thisFam) => speciesNames[thisFam] === fidToName[fid])
      }
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
    newSugg.innerHTML = `<span style="color:${fidToColor(fid)[0]};">${fidToCategory(fid)}: 
                         <span style="color:${fidToColor(fid)[1]};">${fidToName[fid]}</span></span>`;
    newSugg.addEventListener("click", () => lockFilter(fid))
    if (filterToEnter == fid && tabSelect != -1) {newSugg.style.borderColor = 'rgb(140, 130, 240)';}
    suggestions.appendChild(newSugg);
  });
}

// Lock a filter *************************
function lockFilter(newLockFID) {
  if (!lockedFilters.some( (f) => f == newLockFID)) {
    lockedFilters.push(newLockFID); // Add the filter to the locked filters container
    // console.log(newLockFID); console.log(fidToName[newLockFID]);
    let filterMod = null;
    if (lockedFilters.length > 1) {
      filterMod = document.createElement("span"); filterMod.innerHTML = '&';
      filterMod.className = "filter-mod";         filterMod.toggleOR = 0;
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
    updateFilterGroups();   refreshAllItems();   displaySuggestions();
    if (fidToCategory(newLockFID) === 'Move' && sortState.column === 'row') {
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
  updateFilterGroups();   refreshAllItems();   displaySuggestions();
  // Reset the sorting if there aren't any more locked moves
  if (sortState.column === 'moves' && !lockedFilters.some((f) => fidToCategory(f) == 'Move')) { 
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
  for (let i = 0; i < lockedFilterMods.length; i++) {
    if (lockedFilterMods[i].toggleOR) { // If it is OR
      lockedFilterGroups[group].push(lockedFilters[i+1]);
    } else { // It is AND
      group += 1;
      lockedFilterGroups.push([]);
      lockedFilterGroups[group].push(lockedFilters[i+1]);
    }
  }
}

function toggleOR(filterMod) { // Click a filter to toggle it between AND and OR
  filterMod.toggleOR = 1 - filterMod.toggleOR;
  filterMod.innerHTML = (filterMod.toggleOR ? 'OR' : '&');
  updateFilterGroups();
  refreshAllItems();
  displaySuggestions();
}

// Event function for the header row - Clicking on the header row to sort ***************
function updateHeader(clickTarget = null, ignoreFlip = false) {
  // console.log(clickTarget?.sortattr)
  if (clickTarget == null) {clickTarget = currentTarget; ignoreFlip = true;}
  // Find the new sorting attribute, and update the headers
  const sortAttribute = clickTarget?.sortattr;
  // Set the text of the move column, depending on if a move is filtered
  if (showMoveLearn[0] != null) {
    headerColumns[5].textDef = '<span style="color:rgb(140, 130, 240);">' 
                             + (isMobile ? 'Moves' : 'Filtered Moves') + '</span>';
  } else {
    headerColumns[5].textDef = (isMobile ? 'Egg Moves' : 'Egg Moves');
  }
  if (sortAttribute == 'shiny') { // Toggle the global shiny state
    shinyState = (shinyState == 0 ? 3 : shinyState-1);
    if (shinyState) {
      headerColumns[1].innerHTML = '<span style="color:rgb(140, 130, 240);">Shiny</span>';
      const starImg = document.createElement('img');
      starImg.className = 'star-header';
      starImg.src = `ui/shiny${shinyState}.png`;
      headerColumns[1].appendChild(starImg);
    } else {
      headerColumns[1].innerHTML = 'Shiny';
    }
  } else if (sortAttribute == 'ab') { // Toggle the global ability state
    abilityState = (abilityState == 3 ? 0 : abilityState+1);
    if (abilityState) {
      headerColumns[4].innerHTML = `<span style="color:rgb(140, 130, 240);">Abilities</span>`;
      if (abilityState == 1) {headerColumns[4].innerHTML += `<span style="color:rgb(255, 255, 255); font-size:12px;">(Main Only)</span>`;}
      else if (abilityState == 2) {headerColumns[4].innerHTML += `<span style="color:rgb(240, 230, 140); font-size:12px;">(Hidden Only)</span>`;}
      else if (abilityState == 3) {headerColumns[4].innerHTML += `<span style="color:rgb(140, 130, 240); font-size:12px;">(Passive Only)</span>`;}
    } else {
      headerColumns[4].innerHTML = 'Abilities';
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
        sortState.ascending = (sortState.column == "row")||(sortState.column == "sp")
                            ||(sortState.column == "t1")||(sortState.column == "a1")||(sortState.column == "moves");
        if (currentTarget?.textDef) { // Clear arrow from previous target
          currentTarget.innerHTML = currentTarget?.textDef;
        }
      }
      currentTarget = clickTarget; // Draw arrow on new target
      clickTarget.innerHTML = clickTarget.textDef + '<br><span style="color:rgb(140, 130, 240); font-family: serif;">' + (sortState.ascending ? "&#9650;" : "&#9660;") + '</span>';
    }
  }
  // Update the display
  refreshAllItems();
  displaySuggestions();
}

function adjustLayout(headerTarget = null, forceAdjust = false) {
  if (isMobile != (window.innerWidth <= 768) || forceAdjust) {
    let windowWidth = window.innerWidth;
    isMobile = (windowWidth <= 768);
    // console.log('Adjusting layout');
    // console.log((isMobile ? "Mobile layout" : "Desktop layout"), windowWidth, isMobile);
    titleimg.src = (isMobile ? 'ui/mag18.png' : 'ui/mag30.png' );
    openMenuButton.src = (isMobile ? 'ui/menu18.png' : 'ui/menu30.png' );
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
      for (const thisColumn of headerColumns.slice(6,15)) {row2.appendChild(thisColumn);}  
      headerContainer.appendChild(row2);
    } else {
      for (const thisColumn of headerColumns) {thisRow.appendChild(thisColumn);}  
      headerContainer.appendChild(thisRow);
    }
  increment = (isMobile ? 10 : 30);
  updateHeader(headerTarget);
  }
}

// Initial display of items, and initial sort by Dex
adjustLayout(headerColumns[0],true);
searchBox.focus();

// Run benchmark
function benchmark(func, iterations = 100) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
      func();
  }
  const end = performance.now();
  return end - start;
}
// console.log("Original method time:", benchmark(refreshAllItems), "ms");
// console.log("Optimized method time:", benchmark(refreshAllItems), "ms");

function addTestEvents() {
  item = items[0];
  // Show image of the pokemon
  const pokeImg = document.createElement('img');  pokeImg.className = 'item-image';  pokeImg.stars = [];
  pokeImg.shinyOverride = shinyState;  pokeImg.femOverride = lockedFilters.some((f) => f == fidThreshold[4]);
  pokeImg.src = `images/${item.img}_${pokeImg.shinyOverride}${(pokeImg.femOverride ? 'f' : '')}.png`; 
  // Create the dex column, with stars and pin only on desktop
  const dexColumn = document.createElement('div');  dexColumn.className = 'item-column';
  // const pinImg = document.createElement('img');     pinImg.className = 'pin-img';   pinImg.src = 'ui/pin.png';
  const femImg = document.createElement('img');     femImg.className = 'pin-img';   femImg.src = `ui/fem${(pokeImg.femOverride ? 'on' : 'off')}.png`;
  // if (item.fe == 1) {
  //   femImg.addEventListener('click', () => { // Add click event to the fem button
  //     pokeImg.femOverride = 1-pokeImg.femOverride; // Flip the fem state
  //     pokeImg.src = `images/${item.img}_${pokeImg.shinyOverride}${(pokeImg.femOverride ? 'f' : '')}.png`; 
  //     femImg.src = `ui/fem${(pokeImg.femOverride ? 'on' : 'off')}.png`;
  //   });
  //   femImg.addEventListener('mouseover', () => {femImg.src = `ui/femon.png`;});
  //   femImg.addEventListener('mouseout',  () => {femImg.src = `ui/fem${(pokeImg.femOverride ? 'on' : 'off')}.png`;});
  // }
  dexColumn.appendChild(pokeImg);
  dexColumn.appendChild(femImg);
  headerContainer.appendChild(dexColumn);
}

// Load more items on scroll
window.addEventListener("scroll", () => {
  if (window.scrollY + window.innerHeight >= document.body.scrollHeight * 0.8 - 1000) {
    renderMoreItems();
  }
});
// Run on page load and when resizing the window
window.addEventListener("resize", () => { 
  adjustLayout();
});
searchBox.addEventListener('input', (event) => { // Typing in search box ***************
  tabSelect = -1;
  // for (let index = 0; index < 50; index++) { // Slow down the performance for benchmarking
  refreshAllItems();
  displaySuggestions();
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
    // for (let index = 0; index < 50; index++) { // Slow down the performance for benchmarking
    //   addTestEvents();
    // }
    searchBox.blur(); // Allow PageUp and PageDown even when in search box
  }
  if (event.key == "Escape") { // Hit escape to clear the search box, or the last filter
    if (splashScreen.classList.contains("show")) { // If a splash screen is up
      splashScreen.classList.remove("show");
    } else if (searchBox.value.length > 0) { // If there is text in the search box
      searchBox.value = ''
      refreshAllItems();
      displaySuggestions();
    } else if (lockedFilters.length > 0) { // If there is a locked filter
      const lastFilter = lockedFilters[lockedFilters.length - 1];
      const filterTags = document.querySelectorAll(".filter-tag");
      const lastFilterTag = filterTags[filterTags.length - 1];
      const lastFilterMod = lockedFilterMods[lockedFilterMods.length - 1];
      if (lastFilter && lastFilterTag) {
        removeFilter(lastFilter, lastFilterTag, lastFilterMod); // Remove the last filter
      }
    } else if (shinyState || abilityState) { // Clear all header restrictions
      shinyState = 0;
      headerColumns[1].innerHTML = 'Shiny';
      abilityState = 0;
      headerColumns[4].innerHTML = 'Abilities';
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
openMenuButton.addEventListener("click", () => {
  openMenu();
});
function openMenu() {
// Assemble the content for the help splash screen
  splashContent.style.width = '382px';
  splashContent.innerHTML = `
  <b>This is a <span style="color:rgb(140, 130, 240);">fast and powerful search</span> for Pokerogue.</b><hr>

  <p style="margin: 10px; font-weight: bold;">Use the <span style="color:rgb(140, 130, 240); text-decoration: underline;">Search Bar</span> to add filters for:<br></p>
  <p style="margin: 10px; font-weight: bold;"><span style="color:${typeColors[9]};">Types</span>, 
  <span style="color:${fidToColor(fidThreshold[0])[0]};">Abilities</span>, 
  <span style="color:${fidToColor(fidThreshold[1])[0]};">Moves</span>, 
  <span style="color:${fidToColor(fidThreshold[2])[0]};">Generation</span>, 
  <span style="color:${fidToColor(fidThreshold[3])[0]};">Cost</span>,<br>
  <span style="color:${fidToColor(fidThreshold[4])[0]};">Female Sprites</span>,  
  <span style="color:${fidToColor(fidThreshold[5])[1]};">Flipped Stat Mode</span>, or
  <span style="color:${eggTierColors(1)};">Egg Tier</span>.</p>
  Combine multiple filters to get what you want. <br>
  <span style="color:rgb(145, 145, 145);"> You can toggle between "AND" & "OR" connectors.</span><hr>

  <p style="margin: 10px; font-weight: bold;">Click the <span style="color:rgb(140, 130, 240); text-decoration: underline;">Headers</span> to sort the results:</p>
  <p style="margin: 10px;"><b>Dex</b> column links to the <a href="https://wiki.pokerogue.net/start" target="_blank">Official Wiki</a></p>
  <b>Shiny</b> column shows who has shiny variants.
  <p style="margin: 10px;"><b>Ability</b> column shows <b>Main Abilities</b>, 
  <span style="color:rgb(240, 230, 140);"><b>Hidden Ability</b></span>, and 
  <span style="color:rgb(140, 130, 240);"><b>Passive</b></span>. 
  <span style="color:rgb(145, 145, 145);">Click the header to restrict to one of those categories.</span></p>
  <b>Egg Move</b> column shows <b>Normal</b> and <span style="color:rgb(240, 230, 140);"><b>Rare</b></span> egg moves. 
  <span style="color:rgb(145, 145, 145);">After searching for a move, this column will update to show who learns the move first.</span>
  <p style="margin: 10px;"><b>Cost</b> column is colored by <b>Egg Tier</b>:<br> 
  <b>Common</b>, <span style="color:rgb(131, 182, 239);"><b>Rare</b></span>, <span style="color:rgb(240, 230, 140);"><b>Epic</b></span>, <span style="color:rgb(239, 131, 131);"><b>Manaphy</b></span>, <span style="color:rgb(216, 143, 205);"><b>Legendary</b></span></p><hr style="margin-bottom: 10px;">
  
  <span style="color:rgb(145, 145, 145); font-size:11px">This site was created by Sandstorm, through a lot of hard work. I do not store any cookies or collect any personal data. Images and game data are from the Pokerogue Github. All asset rights are retained by their original creators.</span>
  `;
  // ${patchNotes}
  // Show Patch Notes &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp Change Language
  // <span style="color:rgb(145, 145, 145);">Chance of rare egg move is <span style="color:rgb(255, 255, 255);"><b>1</b></span> in <span style="color:rgb(255, 255, 255);"><b>48</b></span>/<span style="color:rgb(131, 182, 239);"><b>24</b></span>/<span style="color:rgb(240, 230, 140);"><b>12</b></span>/<span style="color:rgb(239, 131, 131);"><b>12</b></span>/<span style="color:rgb(216, 143, 205);"><b>6</b></span>.<br>Chance is doubled for candy eggs and move gacha.</span><br><br>
  // <span style="color:rgb(255, 255, 255);"> Using the search bar and headers, you can search for abilities, see when moves are learned, sort by highest stats, see which Pokemon have shiny variants, and much more. </span><br><br>
  splashScreen.classList.add("show"); // Make it visible
}