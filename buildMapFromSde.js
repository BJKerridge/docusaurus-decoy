import fs from 'fs';

const REGIONS_URL = 'https://www.fuzzwork.co.uk/dump/latest/mapRegions.csv';
const SYSTEMS_URL = 'https://www.fuzzwork.co.uk/dump/latest/mapSolarSystems.csv';
const DENORM_URL = 'https://www.fuzzwork.co.uk/dump/latest/mapDenormalize.csv';

const PLANET_GROUP_ID = '7';
const TARGET_TYPE_IDS = new Set([12, 2015]); // 12 = Ice (Superionic), 2015 = Lava (Magmatic)

async function compileUniverse() {
  try {
    // 1. Fetch and Map Regions
    console.log('📥 Step 1/3: Parsing region profiles...');
    const regionsText = await fetch(REGIONS_URL).then(r => r.text());
    const regionLines = regionsText.split('\n');
    const rHeaders = regionLines[0].split(',');
    const rIdxId = rHeaders.indexOf('regionID');
    const rIdxName = rHeaders.indexOf('regionName');
    
    const regionLookup = {};
    for (let i = 1; i < regionLines.length; i++) {
      const fields = regionLines[i].split(',');
      if (fields[rIdxId]) regionLookup[fields[rIdxId].trim()] = fields[rIdxName]?.trim();
    }

    // 2. Fetch and Map Nullsec Solar Systems Only
    console.log('📥 Step 2/3: Parsing solar system metrics...');
    const systemsText = await fetch(SYSTEMS_URL).then(r => r.text());
    const systemLines = systemsText.split('\n');
    const sHeaders = systemLines[0].split(',');
    
    const sIdxSysId = sHeaders.indexOf('solarSystemID');
    const sIdxSysName = sHeaders.indexOf('solarSystemName');
    const sIdxRegId = sHeaders.indexOf('regionID');
    const sIdxSec = sHeaders.indexOf('security');
    const sIdxX = sHeaders.indexOf('x');
    const sIdxY = sHeaders.indexOf('y');
    const sIdxZ = sHeaders.indexOf('z');

    const nullsecSystemLookup = {};
    for (let i = 1; i < systemLines.length; i++) {
      const fields = systemLines[i].split(',');
      const sysId = fields[sIdxSysId]?.trim();
      if (!sysId) continue;

      // Filter: True security value must be below 0.0 to be classified as Nullsec space
      const security = parseFloat(fields[sIdxSec]);
      if (security >= 0.0) continue;

      nullsecSystemLookup[sysId] = {
        name: fields[sIdxSysName]?.trim(),
        region: regionLookup[fields[sIdxRegId]?.trim()] || 'Unknown Region',
        coords: {
          x: parseFloat(fields[sIdxX]),
          y: parseFloat(fields[sIdxY]),
          z: parseFloat(fields[sIdxZ])
        }
      };
    }
    console.log(`📡 Filtering complete: Retaining ${Object.keys(nullsecSystemLookup).length} Nullsec systems.`);

    // 3. Process Denormalize with Double-Gate Filters (Nullsec + Target Planets)
    console.log('📥 Step 3/3: Isolating raidable planetary bodies...');
    const denormText = await fetch(DENORM_URL).then(r => r.text());
    const denormLines = denormText.split('\n');
    const dHeaders = denormLines[0].split(',');
    
    const dIdxItemID = dHeaders.indexOf('itemID');
    const dIdxItemName = dHeaders.indexOf('itemName');
    const dIdxTypeID = dHeaders.indexOf('typeID');
    const dIdxGroupID = dHeaders.indexOf('groupID');
    const dIdxSysId = dHeaders.indexOf('solarSystemID');

    const optimizedUniverse = {};
    let planetCount = 0;

    for (let i = 1; i < denormLines.length; i++) {
      const line = denormLines[i].trim();
      if (!line) continue;

      const fields = line.split(',');
      
      // Filter 1: Must be a planet node
      if (fields[dIdxGroupID] !== PLANET_GROUP_ID) continue;

      // Filter 2: Must be explicitly an Ice or Lava planet type
      const typeId = parseInt(fields[dIdxTypeID]);
      if (!TARGET_TYPE_IDS.has(typeId)) continue;

      // Filter 3: Must belong to a validated Nullsec system entry
      const parentSysId = fields[dIdxSysId]?.trim();
      const sysMeta = nullsecSystemLookup[parentSysId];
      if (!sysMeta) continue; // Instantly drops Empire, Lowsec, or Wormhole matches

      const planetId = fields[dIdxItemID]?.trim();

      optimizedUniverse[planetId] = {
        pn: fields[dIdxItemName]?.trim(),
        pt: typeId,
        sid: parseInt(parentSysId),
        sn: sysMeta.name,
        r: sysMeta.region,
        p: sysMeta.coords
      };
      
      planetCount++;
    }

    fs.writeFileSync('./universeData.json', JSON.stringify(optimizedUniverse));
    console.log(`\n✅ Optimization complete!`);
    console.log(`📦 Saved ${planetCount} total raidable Nullsec planets to universeData.json`);

  } catch (error) {
    console.error('❌ Pipeline compilation failed:', error);
  }
}

compileUniverse();