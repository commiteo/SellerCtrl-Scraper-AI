const { spawn } = require('child_process');
const path = require('path');

class ParallelScraperCrew {
  constructor() {
    this.scrapers = {
      'eg': path.join(__dirname, 'scrapers', 'egypt_scraper.cjs'),
      'sa': path.join(__dirname, 'scrapers', 'saudi_scraper.cjs'),
      'ae': path.join(__dirname, 'scrapers', 'uae_scraper.cjs'),
      'com': path.join(__dirname, 'scrapers', 'usa_scraper.cjs'),
      'de': path.join(__dirname, 'scrapers', 'germany_scraper.cjs')
    };
  }

  async scrapeParallel(asin, domains) {
    console.error(`🚀 CREW: Starting parallel scraping for ASIN ${asin} across domains: ${domains.join(', ')}`);
    
    const startTime = Date.now();
    const results = [];
    const errors = [];

    // Create promises for each domain scraping
    const scrapingPromises = domains.map(domain => {
      return new Promise((resolve, reject) => {
        const scraperPath = this.scrapers[domain];
        
        if (!scraperPath) {
          const error = `Unknown domain: ${domain}`;
          console.error(`❌ CREW: ${error}`);
          errors.push({ domain, error });
          resolve(null);
          return;
        }

        console.error(`🔄 CREW: Launching ${domain} scraper...`);
        
        const scraper = spawn('node', [scraperPath, asin], {
          stdio: ['ignore', 'pipe', 'pipe'],
          cwd: __dirname,
          timeout: 600000 // 10 minutes timeout for each scraper (longer waits now)
        });

        let stdout = '';
        let stderr = '';

        scraper.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        scraper.stderr.on('data', (data) => {
          stderr += data.toString();
          // Forward stderr to main process for logging
          console.error(`[${domain.toUpperCase()}] ${data.toString().trim()}`);
        });

        scraper.on('close', (code) => {
          console.error(`🏁 CREW: ${domain} scraper finished with code: ${code}`);
          
          try {
            if (code === 0 && stdout.trim()) {
              const result = JSON.parse(stdout.trim());
              result.domain = domain;
              result.scrapingTime = Date.now() - startTime;
              console.error(`✅ CREW: ${domain} scraping successful`);
              resolve(result);
            } else {
              const errorMsg = `${domain} scraper failed with code ${code}`;
              console.error(`❌ CREW: ${errorMsg}`);
              errors.push({ domain, error: errorMsg, stderr: stderr.trim() });
              resolve({
                asin,
                domain,
                title: null,
                price: null,
                currency: this.getCurrencyForDomain(domain),
                seller: null,
                imageUrl: null,
                productUrl: null,
                dataSource: `${domain}_scraper`,
                status: 'failed',
                errorMessage: errorMsg,
                scrapingTime: Date.now() - startTime
              });
            }
          } catch (parseError) {
            const errorMsg = `${domain} JSON parse error: ${parseError.message}`;
            console.error(`❌ CREW: ${errorMsg}`);
            errors.push({ domain, error: errorMsg, stdout: stdout.trim() });
            resolve({
              asin,
              domain,
              title: null,
              price: null,
              currency: this.getCurrencyForDomain(domain),
              seller: null,
              imageUrl: null,
              productUrl: null,
              dataSource: `${domain}_scraper`,
              status: 'failed',
              errorMessage: errorMsg,
              scrapingTime: Date.now() - startTime
            });
          }
        });

        scraper.on('error', (error) => {
          const errorMsg = `${domain} scraper spawn error: ${error.message}`;
          console.error(`💥 CREW: ${errorMsg}`);
          errors.push({ domain, error: errorMsg });
          resolve({
            asin,
            domain,
            title: null,
            price: null,
            currency: this.getCurrencyForDomain(domain),
            seller: null,
            imageUrl: null,
            productUrl: null,
            dataSource: `${domain}_scraper`,
            status: 'failed',
            errorMessage: errorMsg,
            scrapingTime: Date.now() - startTime
          });
        });
      });
    });

    // Wait for all scrapers to complete
    console.error(`⏱️ CREW: Waiting for ${domains.length} scrapers to complete...`);
    
    try {
      const scrapingResults = await Promise.all(scrapingPromises);
      const validResults = scrapingResults.filter(result => result !== null);
      
      // Additional stability wait after all scrapers complete
      console.error(`⏳ CREW: Ensuring all processes fully completed...`);
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds to ensure all processes finish
      
      const totalTime = Date.now() - startTime;
      console.error(`🎉 CREW: Parallel scraping completed in ${totalTime}ms`);
      console.error(`📊 CREW: Results: ${validResults.length} successful, ${errors.length} errors`);
      
      // Log summary
      validResults.forEach(result => {
        const status = result.status === 'success' ? '✅' : result.status === 'unavailable' ? '⚠️' : '❌';
        console.error(`${status} CREW: ${result.domain} - ${result.status} (${result.scrapingTime}ms)`);
      });

      return {
        success: true,
        results: validResults,
        totalTime,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      console.error(`💥 CREW: Parallel scraping failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        totalTime: Date.now() - startTime,
        errors
      };
    }
  }

  getCurrencyForDomain(domain) {
    const currencyMap = {
      'eg': 'EGP',
      'sa': 'SAR',
      'ae': 'AED',
      'com': 'USD',
      'de': 'EUR'
    };
    return currencyMap[domain] || 'USD';
  }

  async scrapeSingleDomain(asin, domain) {
    console.error(`🔄 CREW: Single domain scraping for ${domain}`);
    const result = await this.scrapeParallel(asin, [domain]);
    
    if (result.success && result.results.length > 0) {
      return result.results[0];
    } else {
      throw new Error(result.error || 'Single domain scraping failed');
    }
  }

  // Fast health check for all scrapers
  async healthCheck() {
    console.error('🔍 CREW: Running health check...');
    const domains = Object.keys(this.scrapers);
    const testAsin = 'B08N5WRWNW'; // Known working ASIN
    
    const healthPromises = domains.map(async (domain) => {
      try {
        const startTime = Date.now();
        await this.scrapeSingleDomain(testAsin, domain);
        const responseTime = Date.now() - startTime;
        return { domain, status: 'healthy', responseTime };
      } catch (error) {
        return { domain, status: 'unhealthy', error: error.message };
      }
    });

    const healthResults = await Promise.all(healthPromises);
    
    console.error('📋 CREW: Health Check Results:');
    healthResults.forEach(result => {
      const icon = result.status === 'healthy' ? '✅' : '❌';
      console.error(`${icon} ${result.domain}: ${result.status} ${result.responseTime ? `(${result.responseTime}ms)` : ''}`);
    });

    return healthResults;
  }
}

// Handle command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node parallel_scraper_crew.cjs <ASIN> <DOMAIN1> [DOMAIN2] [DOMAIN3] ...');
    console.error('       node parallel_scraper_crew.cjs --health-check');
    process.exit(1);
  }

  const crew = new ParallelScraperCrew();

  if (args[0] === '--health-check') {
    crew.healthCheck()
      .then(results => {
        console.log(JSON.stringify({ healthCheck: true, results }));
      })
      .catch(error => {
        console.error('Health check failed:', error);
        console.log(JSON.stringify({ healthCheck: false, error: error.message }));
        process.exit(1);
      });
  } else {
    const asin = args[0];
    const domains = args.slice(1);

    // Validate ASIN
    if (!/^[A-Z0-9]{10}$/.test(asin)) {
      console.error('Error: Invalid ASIN format');
      process.exit(1);
    }

    // Validate domains
    const validDomains = ['eg', 'sa', 'ae', 'com', 'de'];
    const invalidDomains = domains.filter(d => !validDomains.includes(d));
    if (invalidDomains.length > 0) {
      console.error(`Error: Invalid domains: ${invalidDomains.join(', ')}`);
      console.error(`Valid domains: ${validDomains.join(', ')}`);
      process.exit(1);
    }

    crew.scrapeParallel(asin, domains)
      .then(result => {
        console.log(JSON.stringify(result));
      })
      .catch(error => {
        console.error('Parallel scraping failed:', error);
        console.log(JSON.stringify({ 
          success: false, 
          error: error.message,
          results: []
        }));
        process.exit(1);
      });
  }
}

module.exports = ParallelScraperCrew; 