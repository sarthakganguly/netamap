const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require('fs');
const path = require('path');
const db = require('../db/connection');
const { createWorker } = require('tesseract.js');
const { execSync } = require('child_process');
const readline = require('readline');

const DOWNLOAD_PATH = path.resolve(__dirname, '../../downloads');
const TEMP_PATH = path.join(DOWNLOAD_PATH, 'temp_pages');

if (!fs.existsSync(DOWNLOAD_PATH)) fs.mkdirSync(DOWNLOAD_PATH);
if (!fs.existsSync(TEMP_PATH)) fs.mkdirSync(TEMP_PATH);

// Settings
const MAX_OCR_CONCURRENCY = 4; 
let totalScraped = 0;
let totalParsed = 0;

// Queue for OCR tasks
const ocrQueue = [];
let ocrProcessing = false;

// Initialize Tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS eci_candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state TEXT,
    assembly_constituency TEXT,
    party_name_en TEXT,
    party_name_local TEXT,
    application_uploaded_date TEXT,
    current_status TEXT,
    name_en TEXT,
    name_local TEXT,
    relative_name_en TEXT,
    relative_name_local TEXT,
    gender TEXT,
    age INTEGER,
    address TEXT,
    profile_image_url TEXT,
    uploaded_on TEXT,
    download_count INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS eci_affidavits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER,
    date_of_filing TEXT,
    notary_name TEXT,
    notary_reg_no TEXT,
    notary_valid_upto TEXT,
    house_name TEXT,
    constituency_number INTEGER,
    constituency_name TEXT,
    party_affiliation TEXT,
    full_name TEXT,
    relative_type TEXT,
    relative_name TEXT,
    candidate_age INTEGER,
    candidate_address TEXT,
    mobile TEXT,
    email TEXT,
    social_media TEXT,
    electoral_roll_state TEXT,
    electoral_roll_serial INTEGER,
    electoral_roll_part INTEGER,
    pan_number TEXT,
    last_return_filed_year TEXT,
    total_income_shown TEXT,
    pending_criminal_cases BOOLEAN,
    convictions BOOLEAN,
    movable_assets_total REAL,
    immovable_assets_total REAL,
    liabilities_total REAL,
    highest_qualification TEXT,
    year_completed INTEGER,
    institution TEXT,
    board_university TEXT,
    raw_json TEXT,
    FOREIGN KEY(candidate_id) REFERENCES eci_candidates(id)
  )`);
});

async function promptUser(label, options) {
  if (options.length === 0) return 'ALL';
  
  console.log(`\n--- Select ${label} ---`);
  console.log('0) [Process ALL]');
  options.forEach((opt, i) => console.log(`${i + 1}) ${opt.text}`));

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  
  return new Promise(resolve => {
    rl.question(`\nPick an option (0-${options.length}): `, (answer) => {
      rl.close();
      const idx = parseInt(answer);
      if (idx === 0 || isNaN(idx)) resolve('ALL');
      else resolve(options[idx - 1]);
    });
  });
}

async function processOcrQueue() {
  if (ocrProcessing) return;
  ocrProcessing = true;

  while (ocrQueue.length > 0) {
    const { pdfPath, candidateId, candidateName } = ocrQueue.shift();
    
    try {
      const affidavit = await parseForm26(pdfPath);
      
      await new Promise((resolve, reject) => {
        db.run(`INSERT INTO eci_affidavits (candidate_id, date_of_filing, pan_number, pending_criminal_cases, convictions, movable_assets_total, raw_json) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
          candidateId, affidavit.document_metadata?.date_of_filing, affidavit.candidate_details?.tax_details?.pan_number,
          affidavit.legal_records?.pending_criminal_cases ? 1 : 0, affidavit.legal_records?.convictions ? 1 : 0,
          affidavit.financial_declarations?.assets?.movable?.gross_total_value || 0, JSON.stringify(affidavit)
        ], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      totalParsed++;
      console.log(`[OCR-SUCCESS] Parsed & Saved: ${candidateName} (${totalParsed} total parsed)`);
    } catch (err) {
      console.error(`[OCR-ERROR] Failed for ${candidateName}: ${err.message}`);
    }
  }

  ocrProcessing = false;
}

function extractRegex(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

async function parseForm26(pdfPath) {
  const candidateTempDir = path.join(TEMP_PATH, path.basename(pdfPath, '.pdf'));
  if (!fs.existsSync(candidateTempDir)) fs.mkdirSync(candidateTempDir);

  try {
    execSync(`pdftoppm -jpeg -r 300 "${pdfPath}" "${candidateTempDir}/page" 2>/dev/null`);
    const imageFiles = fs.readdirSync(candidateTempDir).filter(f => f.startsWith('page') && f.endsWith('.jpg')).sort();
    
    const worker = await createWorker('eng', 1, { logger: m => {} });
    let fullText = '';
    for (const img of imageFiles) {
      const imgPath = path.join(candidateTempDir, img);
      const { data: { text } } = await worker.recognize(imgPath);
      fullText += text + '\n';
      fs.unlinkSync(imgPath);
    }
    await worker.terminate();
    fs.rmdirSync(candidateTempDir);

    return mapTextToSchema(fullText);
  } catch (err) {
    throw err;
  }
}

function mapTextToSchema(text) {
  return {
    document_metadata: {
      form_type: "Form 26",
      date_of_filing: extractRegex(text, /Date of filing:\s*(\d{2}[/-]\d{2}[/-]\d{4})/i),
      notary_details: {
        name: extractRegex(text, /Notary Name:\s*(.*)/i),
        registration_number: extractRegex(text, /Reg\.?\s*No\.?\s*(.*)/i),
        valid_upto: extractRegex(text, /Valid\s*upto\s*(\d{2}[/-]\d{2}[/-]\d{4})/i)
      }
    },
    election_details: {
      house_name: extractRegex(text, /Election to the\s*(.*)/i),
      constituency_number: parseInt(extractRegex(text, /Constituency\s*No\.?\s*(\d+)/i)),
      constituency_name: extractRegex(text, /Constituency\s*(?:Name)?\s*[:\-\s]+(.*)/i),
      party_affiliation: extractRegex(text, /Party\s*Affiliation\s*[:\-\s]+(.*)/i)
    },
    candidate_details: {
      full_name: extractRegex(text, /I,\s*([^,]*)/i),
      relative_type: text.toLowerCase().includes('son of') ? 'son' : (text.toLowerCase().includes('wife of') ? 'wife' : 'daughter'),
      relative_name: extractRegex(text, /(?:son|daughter|wife)\s*of\s*(.*)/i),
      age: parseInt(extractRegex(text, /aged\s*(\d+)/i)),
      address: {
        village_po: extractRegex(text, /resident of\s*(.*)/i),
        district: extractRegex(text, /District\s*[:\-\s]+(.*)/i),
        state: extractRegex(text, /State\s*[:\-\s]+(.*)/i),
        pincode: extractRegex(text, /Pin\s*Code\s*[:\-\s]+(\d{6})/i)
      },
      contact_info: {
        mobile: extractRegex(text, /Mobile\s*No\.?\s*[:\-\s]+(\d{10})/i),
        email: extractRegex(text, /Email\s*ID\s*[:\-\s]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
      },
      tax_details: {
        pan_number: extractRegex(text, /PAN\s*number\s*is\s*([A-Z0-9]{10})/i),
        last_return_filed_year: extractRegex(text, /last\s*Income-tax\s*return\s*filed\s*for\s*the\s*financial\s*year\s*(\d{4}-\d{2,4})/i),
        total_income_shown: extractRegex(text, /Total\s*income\s*shown\s*in\s*Income-tax\s*return\s*Rs\.?\s*([\d,.]+)/i)
      }
    },
    legal_records: {
      pending_criminal_cases: text.toLowerCase().includes('pending criminal cases') && !text.toLowerCase().includes('not pending'),
      convictions: text.toLowerCase().includes('convicted') && !text.toLowerCase().includes('not convicted')
    },
    financial_declarations: {
      assets: {
        movable: {
          cash_in_hand: parseFloat(extractRegex(text, /Cash\s*in\s*hand\s*Rs\.?\s*([\d,.]+)/i)?.replace(/,/g, '')),
          gross_total_value: parseFloat(extractRegex(text, /Gross\s*Total\s*Value\s*Rs\.?\s*([\d,.]+)/i)?.replace(/,/g, ''))
        },
        immovable: {
          total_value: parseFloat(extractRegex(text, /Current\s*market\s*value\s*of\s*immovable\s*property\s*Rs\.?\s*([\d,.]+)/i)?.replace(/,/g, ''))
        }
      },
      liabilities: {
        bank_dues: parseFloat(extractRegex(text, /Loans\s*from\s*Bank\s*Rs\.?\s*([\d,.]+)/i)?.replace(/,/g, ''))
      }
    },
    education: {
      highest_qualification: extractRegex(text, /Highest\s*educational\s*qualification\s*[:\-\s]+(.*)/i),
      institution: extractRegex(text, /Name\s*of\s*School\s*\/\s*University\s*[:\-\s]+(.*)/i)
    }
  };
}

async function getOptions(page, selector) {
  try {
    await page.waitForSelector(selector, { timeout: 10000 });
    return await page.evaluate((sel) => {
      return Array.from(document.querySelectorAll(`${sel} option`))
        .map(o => ({ value: o.value, text: o.innerText.trim() }))
        .filter(o => o.value !== "" && !o.text.includes('Select '));
    }, selector);
  } catch (e) {
    return [];
  }
}

async function selectAndWait(page, selector, value) {
  await page.waitForSelector(selector, { visible: true, timeout: 15000 });
  await page.select(selector, value);
  await new Promise(r => setTimeout(r, 2000));
}

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: DOWNLOAD_PATH });

  console.log(`[${new Date().toLocaleTimeString()}] Navigating to ECI Portal...`);
  await page.goto('https://affidavit.eci.gov.in/candidate-affidavit', { waitUntil: 'networkidle2', timeout: 90000 });

  // Interactive Selection Flow
  let targetType = 'ALL', targetElection = 'ALL', targetState = 'ALL', targetPhase = 'ALL', targetConst = 'ALL';

  targetType = await promptUser('Election Type', await getOptions(page, '#electionType'));
  if (targetType !== 'ALL') {
    await selectAndWait(page, '#electionType', targetType.value);
    targetElection = await promptUser('Election', await getOptions(page, '#election'));
    if (targetElection !== 'ALL') {
      await selectAndWait(page, '#election', targetElection.value);
      targetState = await promptUser('State', await getOptions(page, '#states'));
      if (targetState !== 'ALL') {
        await selectAndWait(page, '#states', targetState.value);
        targetPhase = await promptUser('Phase', await getOptions(page, '#phase'));
        if (targetPhase !== 'ALL') {
          await selectAndWait(page, '#phase', targetPhase.value);
          targetConst = await promptUser('Constituency', await getOptions(page, '#constId'));
        }
      }
    }
  }

  console.log(`\n[${new Date().toLocaleTimeString()}] Selection complete. Starting scrape process...`);

  const electionTypes = targetType === 'ALL' ? await getOptions(page, '#electionType') : [targetType];
  for (const type of electionTypes) {
    await selectAndWait(page, '#electionType', type.value);
    const elections = targetElection === 'ALL' ? await getOptions(page, '#election') : [targetElection];
    for (const election of elections) {
      await selectAndWait(page, '#election', election.value);
      const states = targetState === 'ALL' ? await getOptions(page, '#states') : [targetState];
      for (const state of states) {
        await selectAndWait(page, '#states', state.value);
        const phases = targetPhase === 'ALL' ? await getOptions(page, '#phase') : [targetPhase];
        for (const phase of phases) {
          if (phase.value) await selectAndWait(page, '#phase', phase.value);
          const constituencies = targetConst === 'ALL' ? await getOptions(page, '#constId') : [targetConst];
          for (const constId of constituencies) {
            if (constId.value) await selectAndWait(page, '#constId', constId.value);
            
            console.log(`\n[FILTER] ${state.text} > ${constId.text}`);
            await Promise.all([
              page.click('button[name="submitName"]'),
              page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {})
            ]);

            let hasNext = true;
            while (hasNext) {
              const candidates = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a')).filter(a => 
                  a.innerText.toLowerCase().includes('view more') || a.href.includes('candidate-profile')
                );
                return links.map(a => ({
                  name_brief: a.closest('tr, .card, .candidate-card')?.innerText.split('\n')[0].trim() || 'Candidate',
                  profile_url: a.href
                })).filter((v, i, a) => a.findIndex(t => t.profile_url === v.profile_url) === i);
              });

              for (const candidate of candidates) {
                totalScraped++;
                console.log(`[FETCH] Candidate #${totalScraped}: ${candidate.name_brief}`);
                const detailPage = await browser.newPage();
                try {
                  await detailPage.goto(candidate.profile_url, { waitUntil: 'networkidle2' });
                  const profileData = await detailPage.evaluate(() => {
                    const getVal = (label) => {
                      const row = Array.from(document.querySelectorAll('tr, .row, div')).find(r => r.innerText.includes(label));
                      return row?.innerText.replace(label, '').replace(':', '').trim() || null;
                    };
                    return {
                      state: getVal('State Name') || getVal('State'),
                      constituency: getVal('Constituency Name') || getVal('Constituency'),
                      party: getVal('Party Name') || getVal('Party'),
                      status: getVal('Status'),
                      name: document.querySelector('h3, h4, .candidate-name')?.innerText.trim(),
                      age: parseInt(getVal('Age')) || null,
                      address: getVal('Address'),
                      img: document.querySelector('img[src*="photo"], .candidate-image img')?.src
                    };
                  });
                  const candidateId = await new Promise((resolve) => {
                    db.run(`INSERT INTO eci_candidates (state, assembly_constituency, party_name_en, current_status, name_en, age, address, profile_image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [profileData.state, profileData.constituency, profileData.party, profileData.status, profileData.name, profileData.age, profileData.address, profileData.img], 
                    function() { resolve(this.lastID); });
                  });
                  const downloadLink = await detailPage.evaluateHandle(() => {
                    return Array.from(document.querySelectorAll('a, button')).find(el => 
                      el.innerText.toLowerCase().includes('download') || el.getAttribute('onclick')?.includes('increaseDownloadCount')
                    );
                  });
                  if (downloadLink && (await downloadLink.asElement())) {
                    await downloadLink.asElement().click();
                    let pdfFile = null;
                    for (let attempt = 0; attempt < 30; attempt++) {
                      await new Promise(r => setTimeout(r, 1000));
                      pdfFile = fs.readdirSync(DOWNLOAD_PATH).find(f => f.endsWith('.pdf'));
                      if (pdfFile) break;
                    }
                    if (pdfFile) {
                      const newPath = path.join(DOWNLOAD_PATH, `affidavit_${candidateId}.pdf`);
                      fs.renameSync(path.join(DOWNLOAD_PATH, pdfFile), newPath);
                      ocrQueue.push({ pdfPath: newPath, candidateId, candidateName: profileData.name });
                      processOcrQueue();
                    }
                  }
                } catch (e) { console.error(`[FETCH-ERROR] ${candidate.name_brief}: ${e.message}`); }
                finally { await detailPage.close(); }
              }
              const nextButton = await page.$('a.relative.inline-flex.items-center[href*="page="]');
              if (nextButton) { await Promise.all([nextButton.click(), page.waitForNavigation({ waitUntil: 'networkidle2' })]); }
              else { hasNext = false; }
            }
          }
        }
      }
    }
  }

  console.log(`[FINISHING] Web fetch complete. Finalizing background OCR tasks...`);
  while (ocrProcessing || ocrQueue.length > 0) { await new Promise(r => setTimeout(r, 2000)); }
  await browser.close();
  db.close();
  console.log(`\n[${new Date().toLocaleTimeString()}] --- SCRAPE COMPLETE: ${totalScraped} processed ---`);
}

run().catch(console.error);
