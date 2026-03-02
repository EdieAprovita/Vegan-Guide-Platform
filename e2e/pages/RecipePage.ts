import { Page, Locator, expect } from "@playwright/test";

/**
 * Page Object for Recipe pages (/recipes, /recipes/[id], /recipes/new)
 * Handles list view, detail view, and creation form
 */
export class RecipePage {
  readonly page: Page;

  // -- List page elements --
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly cards: Locator;
  readonly categoryFilter: Locator;
  readonly difficultyFilter: Locator;

  // -- Detail page elements --
  readonly backButton: Locator;
  readonly detailContainer: Locator;
  readonly recipeTitle: Locator;

  // -- Form elements (create/edit) --
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly prepTimeInput: Locator;
  readonly cookTimeInput: Locator;
  readonly servingsInput: Locator;
  readonly difficultySelect: Locator;
  readonly addIngredientButton: Locator;
  readonly addInstructionButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // List page
    this.heading = page.locator("h1");
    this.searchInput = page.locator('input[type="search"], input[placeholder*="earch"], input[placeholder*="eceta"]');
    this.cards = page.locator('article[aria-label*="Receta"], article[aria-label*="Recipe"]');
    this.categoryFilter = page.locator('[id*="category"], select:has(option[value="breakfast"]), button:has-text("Category")');
    this.difficultyFilter = page.locator('[id*="difficulty"], select:has(option[value="easy"]), button:has-text("Difficulty")');

    // Detail page
    this.backButton = page.locator('button[aria-label*="Volver"], a[aria-label*="Volver"]');
    this.detailContainer = page.locator("main .container, main");
    this.recipeTitle = page.locator("h1");

    // Form elements
    this.titleInput = page.locator('#recipe-title, input[name="title"]');
    this.descriptionInput = page.locator('#recipe-description, textarea[name="description"]');
    this.prepTimeInput = page.locator('#recipe-prep-time, input[name="preparationTime"]');
    this.cookTimeInput = page.locator('#recipe-cook-time, input[name="cookingTime"]');
    this.servingsInput = page.locator('#recipe-servings, input[name="servings"]');
    this.difficultySelect = page.locator('#recipe-difficulty, select[name="difficulty"]');
    this.addIngredientButton = page.getByRole("button", { name: /add ingredient|agregar ingrediente/i });
    this.addInstructionButton = page.getByRole("button", { name: /add instruction|agregar instruc/i });
    this.submitButton = page.getByRole("button", { name: /create recipe|update recipe|crear receta|actualizar/i });
  }

  /** Navigate to the recipe list */
  async gotoList() {
    await this.page.goto("/recipes");
  }

  /** Navigate to a specific recipe detail page */
  async gotoDetail(id: string) {
    await this.page.goto(`/recipes/${id}`);
  }

  /** Navigate to the recipe creation form */
  async gotoNew() {
    await this.page.goto("/recipes/new");
  }

  /** Get the count of recipe cards on the page */
  async getCardCount(): Promise<number> {
    return await this.cards.count();
  }

  /** Get recipe name from a card by index */
  async getCardName(index: number): Promise<string> {
    const card = this.cards.nth(index);
    const h3 = card.locator("h3");
    return (await h3.textContent()) ?? "";
  }

  /** Click "View Recipe" on a card by index */
  async clickViewRecipe(index: number) {
    const card = this.cards.nth(index);
    const link = card.locator('a[href*="/recipes/"]');
    if ((await link.count()) > 0) {
      await link.first().click();
    } else {
      const button = card.getByRole("button", { name: /view recipe|ver receta/i });
      await button.click();
    }
  }

  /** Perform a search on the list page */
  async search(term: string) {
    await this.searchInput.fill(term);
    await this.searchInput.press("Enter");
  }

  /** Fill out the recipe creation form with basic data */
  async fillBasicForm(data: {
    title: string;
    description: string;
    prepTime?: string;
    cookTime?: string;
    servings?: string;
    difficulty?: string;
  }) {
    await this.titleInput.fill(data.title);
    await this.descriptionInput.fill(data.description);
    if (data.prepTime) await this.prepTimeInput.fill(data.prepTime);
    if (data.cookTime) await this.cookTimeInput.fill(data.cookTime);
    if (data.servings) await this.servingsInput.fill(data.servings);
    if (data.difficulty) {
      try {
        await this.difficultySelect.selectOption(data.difficulty);
      } catch {
        // Might be a custom select component
      }
    }
  }

  /** Submit the recipe form */
  async submitForm() {
    await this.submitButton.click();
  }

  /** Check if the list page has loaded with content */
  async hasContent(): Promise<boolean> {
    return ((await this.page.locator("body").textContent())?.length ?? 0) > 50;
  }

  /** Check if detail page has loaded */
  async isDetailPageLoaded(): Promise<boolean> {
    const content = await this.detailContainer.textContent();
    return (content?.length ?? 0) > 20;
  }

  /** Get heading text */
  async getHeadingText(): Promise<string> {
    return (await this.heading.first().textContent()) ?? "";
  }
}
