import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

type PagefindModule = {
	search: (query: string) => Promise<PagefindSearch>;
	preload?: (query: string) => Promise<void>;
};

type PagefindSearch = {
	results: Array<{
		data: () => Promise<PagefindResult>;
	}>;
};

type PagefindResult = {
	url: string;
	excerpt: string;
	meta?: {
		title?: string;
		author?: string;
		work?: string;
		reference?: string;
		book?: string;
		section?: string;
	};
};

let pagefindPromise: Promise<PagefindModule> | undefined;
const pagefindPath = "/pagefind/pagefind.js";

export default class MeditationsSearch extends LitElement {
	static properties = {
		initialQuery: { type: String, attribute: "initial-query" },
		queryText: { state: true },
		results: { state: true },
		status: { state: true },
	};

	static styles = css`
		:host {
			display: block;
			color: var(--color-text);
			font-family: var(--font-sans);
		}

		form {
			position: relative;
			display: grid;
			gap: 0.85rem;
		}

		label.visually-hidden {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
			border: 0;
		}

		input {
			width: 100%;
			box-sizing: border-box;
			border: 0;
			border-radius: 0;
			border-bottom: 1px solid var(--color-border-strong);
			background: transparent;
			color: var(--color-text);
			font: 500 1rem/1.4 var(--font-sans);
			padding: 0.7rem 0 0.72rem 2rem;
			box-shadow: none;
			appearance: none;
		}

		input::placeholder {
			color: var(--color-muted);
			opacity: 0.72;
		}

		input:focus-visible,
		a:focus-visible {
			outline: 2px solid var(--color-focus);
			outline-offset: 3px;
		}

		form::before {
			content: "";
			position: absolute;
			width: 1rem;
			height: 1rem;
			margin-top: 0.82rem;
			border: 2px solid var(--color-muted);
			border-radius: 50%;
			pointer-events: none;
		}

		form::after {
			content: "";
			position: absolute;
			width: 0.52rem;
			height: 2px;
			margin-top: 1.78rem;
			margin-left: 0.82rem;
			background: var(--color-muted);
			transform: rotate(45deg);
			transform-origin: left center;
			pointer-events: none;
		}

		p {
			margin: 0;
			color: var(--color-muted);
			font-size: 0.82rem;
			line-height: 1.45;
		}

		ul {
			list-style: none;
			display: grid;
			gap: 0;
			padding: 0.45rem 0 0;
			margin: 0;
			border-top: 1px solid var(--color-border);
			max-height: min(28rem, 62vh);
			overflow: auto;
		}

		a {
			display: block;
			color: inherit;
			padding: 0.9rem 0;
			text-decoration: none;
			border-bottom: 1px solid var(--color-border);
		}

		a:hover {
			color: var(--color-link-hover);
		}

		.result-title {
			display: block;
			font-weight: 700;
			font-size: 0.9rem;
			line-height: 1.35;
			margin-bottom: 0.25rem;
		}

		.excerpt {
			display: block;
			color: var(--color-muted);
			font-family: var(--font-serif);
			font-size: 0.9rem;
			line-height: 1.55;
		}

		mark {
			background: var(--color-mark);
			color: var(--color-text);
			padding: 0 0.08em;
		}
	`;

	private queryText = "";

	private results: PagefindResult[] = [];

	private status: "idle" | "loading" | "empty" | "no-results" | "results" | "error" = "idle";

	initialQuery = "";

	private debounceId: number | undefined;
	private searchToken = 0;
	private hasInitializedQuery = false;

	private get input(): HTMLInputElement | null {
		return this.renderRoot.querySelector("input");
	}

	connectedCallback(): void {
		super.connectedCallback();
		this.initializeQuery();
	}

	protected firstUpdated(): void {
		this.initializeQuery();
	}

	protected updated(changedProperties: Map<string, unknown>): void {
		if (changedProperties.has("initialQuery")) {
			this.initializeQuery();
		}
	}

	private initializeQuery(): void {
		if (this.hasInitializedQuery || this.queryText.length > 0) {
			return;
		}

		const query = this.initialQuery || new URL(window.location.href).searchParams.get("q") || "";

		if (query.trim().length === 0) {
			this.status = "empty";
			return;
		}

		this.queryText = query;
		this.hasInitializedQuery = true;
		void this.search(query);
	}

	render(): TemplateResult {
		const resultCount = this.results.length;

		return html`
			<form action="/search" method="get" role="search" @submit=${this.handleSubmit}>
				<label class="visually-hidden" for="meditations-search-input">Search the Stoic canon</label>
				<input
					id="meditations-search-input"
					name="q"
					type="search"
					autocomplete="off"
					.value=${this.queryText}
					@input=${this.handleInput}
					@keydown=${this.handleInputKeydown}
					placeholder="Search the Stoic canon"
				/>
				<div aria-live="polite" aria-busy=${this.status === "loading" ? "true" : "false"}>
					${this.renderStatus(resultCount)}
					${this.status === "results"
						? html`
								<ul @keydown=${this.handleResultsKeydown}>
									${this.results.map(
										(result, index) => html`
											<li>
												<a href=${result.url} data-result-index=${index}>
													<span class="result-title">${this.resultTitle(result)}</span>
													<span class="excerpt">${unsafeHTML(this.safeExcerpt(result.excerpt))}</span>
												</a>
											</li>
										`,
									)}
								</ul>
							`
						: nothing}
				</div>
			</form>
		`;
	}

	private renderStatus(resultCount: number): TemplateResult {
		if (this.status === "loading") {
			return html`<p>Searching...</p>`;
		}

		if (this.status === "empty" || this.status === "idle") {
			return html`<p>Enter a phrase to search the text.</p>`;
		}

		if (this.status === "no-results") {
			return html`<p>No results found for "${this.queryText.trim()}".</p>`;
		}

		if (this.status === "error") {
			return html`<p>Search is unavailable on this page.</p>`;
		}

		return html`<p>${resultCount} ${resultCount === 1 ? "result" : "results"} found.</p>`;
	}

	private handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		void this.search(this.queryText);
	}

	private handleInput(event: InputEvent): void {
		const target = event.currentTarget as HTMLInputElement;
		this.queryText = target.value;

		window.clearTimeout(this.debounceId);
		this.debounceId = window.setTimeout(() => {
			void this.search(this.queryText);
		}, 150);
	}

	private handleInputKeydown(event: KeyboardEvent): void {
		if (event.key === "ArrowDown" && this.results.length > 0) {
			event.preventDefault();
			this.resultLinks()[0]?.focus();
		}

		if (event.key === "Escape") {
			this.clearSearch();
		}
	}

	private handleResultsKeydown(event: KeyboardEvent): void {
		const links = this.resultLinks();
		const currentIndex = links.indexOf(document.activeElement as HTMLAnchorElement);

		if (event.key === "Escape") {
			event.preventDefault();
			this.clearSearch();
			return;
		}

		if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
			return;
		}

		event.preventDefault();

		const nextIndex =
			event.key === "ArrowDown" ? Math.min(currentIndex + 1, links.length - 1) : Math.max(currentIndex - 1, 0);

		links[nextIndex]?.focus();
	}

	private async search(rawQuery: string): Promise<void> {
		const query = rawQuery.trim();
		const token = ++this.searchToken;

		if (query.length === 0) {
			this.results = [];
			this.status = "empty";
			return;
		}

		this.status = "loading";

		try {
			const pagefind = await this.loadPagefind();
			const search = await pagefind.search(query);
			const results = await Promise.all(search.results.map((result) => result.data()));

			if (token !== this.searchToken) {
				return;
			}

			this.results = results;
			this.status = results.length > 0 ? "results" : "no-results";
		} catch {
			if (token === this.searchToken) {
				this.results = [];
				this.status = "error";
			}
		}
	}

	private async loadPagefind(): Promise<PagefindModule> {
		pagefindPromise ??= import(/* @vite-ignore */ pagefindPath) as Promise<PagefindModule>;
		return pagefindPromise;
	}

	private resultLinks(): HTMLAnchorElement[] {
		return Array.from(this.renderRoot.querySelectorAll<HTMLAnchorElement>("a[data-result-index]"));
	}

	private clearSearch(): void {
		window.clearTimeout(this.debounceId);
		this.queryText = "";
		this.results = [];
		this.status = "empty";
		this.searchToken++;
		this.updateComplete.then(() => this.input?.focus());
	}

	private resultTitle(result: PagefindResult): string {
		const author = result.meta?.author;
		const work = result.meta?.work;
		const reference = result.meta?.reference;

		if (author && work && reference) {
			return `${author} · ${work} ${reference}`;
		}

		const book = result.meta?.book;
		const section = result.meta?.section;

		if (book && section) {
			return `Marcus Aurelius · Meditations Book ${book} · Section ${section}`;
		}

		return result.meta?.title ?? "Stoic Canon";
	}

	private safeExcerpt(excerpt: string): string {
		return excerpt
			.replace(/<(?!\/?mark\b)[^>]+>/gi, "")
			.replace(/<mark\b[^>]*>/gi, "<mark>")
			.replace(/<\/mark>/gi, "</mark>");
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"meditations-search": MeditationsSearch;
	}
}

if (!customElements.get("meditations-search")) {
	customElements.define("meditations-search", MeditationsSearch);
}
