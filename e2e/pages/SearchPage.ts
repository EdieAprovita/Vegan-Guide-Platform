import { Page, Locator } from "@playwright/test";

/**
 * Page Object for Search pages (/search)
 * Handles global header search, advanced search page, filters, and results
 */
export class SearchPage {
  readonly page: Page;

  // -- Global search (header) --
  readonly globalSearchInput: Locator;

  // -- Advanced search page elements --
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly suggestionsDropdown: Locator;
  readonly searchResults: Locator;
  readonly loadMoreButton: Locator;
  readonly advancedFiltersButton: Locator;
  readonly activeFilters: Locator;
  readonly sortSelect: Locator;
  readonly noResultsMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Global search in header
    this.globalSearchInput = page.locator(
      '#global-search, input[placeholder*="Buscar"], input[placeholder*="Search"]'
    );

    // Advanced search page
    this.heading = page.locator("h1");
    this.searchInput = page.locator(
      '#advanced-search-input, input[type="search"]'
    );
    this.suggestionsDropdown = page.locator(
      '[role="listbox"], [class*="suggestion"], [class*="dropdown"]'
    );
    this.searchResults = page.locator(
      'article, [class*="result-card"], [class*="search-result"]'
    );
    this.loadMoreButton = page.getByRole("button", {
      name: /load more|cargar más|ver más/i,
    });
    this.advancedFiltersButton = page.locator(
      'button:has(svg), [aria-label*="filter"]'
    );
    this.activeFilters = page.locator(
      '[class*="active-filter"], [class*="chip"], [class*="badge"]'
    );
    this.sortSelect = page.locator(
      'select[name*="sort"], [role="combobox"]'
    );
    this.noResultsMessage = page.locator(
      '[class*="empty"], [class*="no-results"]'
    );
  }

  /** Navigate to the advanced search page */
  async gotoSearch() {
    await this.page.goto("/search");
  }

  /** Type a search term into the global header search input */
  async searchGlobal(term: string) {
    await this.globalSearchInput.fill(term);
  }

  /** Type a search term into the advanced search input and submit */
  async searchAdvanced(term: string) {
    await this.searchInput.fill(term);
    await this.searchInput.press("Enter");
  }

  /** Get the count of search result elements on the page */
  async getResultCount(): Promise<number> {
    return await this.searchResults.count();
  }

  /** Check if the page has loaded with content */
  async hasContent(): Promise<boolean> {
    return ((await this.page.locator("body").textContent())?.length ?? 0) > 50;
  }

  /** Get the page title/heading text */
  async getHeadingText(): Promise<string> {
    return (await this.heading.first().textContent()) ?? "";
  }

  /** Check if the suggestions dropdown is visible */
  async hasSuggestions(): Promise<boolean> {
    return await this.suggestionsDropdown.isVisible();
  }
}
