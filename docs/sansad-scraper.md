# Sansad Scraper

This tool extracts data for elected members of the Indian Parliament from the official Digital Sansad portal.

## Extraction Workflow

### 1. Data Endpoints
- **Party Stats**: `https://sansad.in/api_ls/member/partyWiseRepresentation?loksabha=18`
- **Member List**: `https://sansad.in/api_ls/member?loksabha=18&sitting=1`
- **Detailed Profile**: `https://sansad.in/api_ls/member/{mpsno}`
- **Parliamentary Terms**: `https://sansad.in/cms/ls-pp/api/about-parliamentary-terms?locale=en&populate=parliTerms&pagination[limit]=1000`

### 2. Normalization Logic
When extracting member profiles:
1. Fetch the list to get all `mpsno`.
2. For each `mpsno`, fetch the detailed profile.
3. Map fields to the internal schema.
4. Encode member photos as **Base64** strings to store them locally in the database, avoiding CORS issues and privacy leaks.

## How to Run

The script is located at `src/scrapers/sansad_scraper.js` and should be run within the Docker environment:

```bash
docker exec -it netamap-backend node src/scrapers/sansad_scraper.js
```
