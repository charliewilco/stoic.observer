import type { CollectionEntry } from "astro:content";

export type FlatCollection =
	| "enchiridion"
	| "letters"
	| "on-the-shortness-of-life"
	| "on-tranquility-of-mind"
	| "on-providence"
	| "on-the-happy-life"
	| "on-leisure"
	| "on-the-firmness-of-the-wise-man"
	| "consolation-to-helvia"
	| "consolation-to-marcia"
	| "consolation-to-polybius"
	| "lectures"
	| "hierocles";

export type MultiBookCollection = "discourses" | "on-anger" | "on-mercy" | "on-benefits";

export type CanonCollection = FlatCollection | MultiBookCollection;

export type AuthorSlug = "marcus" | "epictetus" | "seneca" | "musonius" | "hierocles";

export type FlatWork = {
	kind: "flat";
	slug: string;
	collection: FlatCollection;
	title: string;
	author: string;
	authorSlug: AuthorSlug;
	itemLabel: string;
	itemPlural: string;
	referencePrefix: string;
	expectedCount?: number;
};

export type MultiBookWork = {
	kind: "multi";
	slug: string;
	collection: MultiBookCollection;
	title: string;
	author: string;
	authorSlug: AuthorSlug;
	itemLabel: string;
	itemPlural: string;
	bookCount: number;
};

export type Work = FlatWork | MultiBookWork;

export const flatWorks: FlatWork[] = [
	{
		kind: "flat",
		slug: "enchiridion",
		collection: "enchiridion",
		title: "Enchiridion",
		author: "Epictetus",
		authorSlug: "epictetus",
		itemLabel: "Section",
		itemPlural: "Sections",
		referencePrefix: "§",
		expectedCount: 53,
	},
	{
		kind: "flat",
		slug: "letters",
		collection: "letters",
		title: "Letters",
		author: "Seneca",
		authorSlug: "seneca",
		itemLabel: "Letter",
		itemPlural: "Letters",
		referencePrefix: "Letter ",
		expectedCount: 124,
	},
	{
		kind: "flat",
		slug: "on-the-shortness-of-life",
		collection: "on-the-shortness-of-life",
		title: "On the Shortness of Life",
		author: "Seneca",
		authorSlug: "seneca",
		itemLabel: "Section",
		itemPlural: "Sections",
		referencePrefix: "§",
	},
	{
		kind: "flat",
		slug: "on-tranquility-of-mind",
		collection: "on-tranquility-of-mind",
		title: "On Tranquility of Mind",
		author: "Seneca",
		authorSlug: "seneca",
		itemLabel: "Section",
		itemPlural: "Sections",
		referencePrefix: "§",
	},
	{
		kind: "flat",
		slug: "on-providence",
		collection: "on-providence",
		title: "On Providence",
		author: "Seneca",
		authorSlug: "seneca",
		itemLabel: "Section",
		itemPlural: "Sections",
		referencePrefix: "§",
	},
	{
		kind: "flat",
		slug: "on-the-happy-life",
		collection: "on-the-happy-life",
		title: "On the Happy Life",
		author: "Seneca",
		authorSlug: "seneca",
		itemLabel: "Section",
		itemPlural: "Sections",
		referencePrefix: "§",
	},
	{
		kind: "flat",
		slug: "on-leisure",
		collection: "on-leisure",
		title: "On Leisure",
		author: "Seneca",
		authorSlug: "seneca",
		itemLabel: "Section",
		itemPlural: "Sections",
		referencePrefix: "§",
	},
	{
		kind: "flat",
		slug: "on-the-firmness-of-the-wise-man",
		collection: "on-the-firmness-of-the-wise-man",
		title: "On the Firmness of the Wise Man",
		author: "Seneca",
		authorSlug: "seneca",
		itemLabel: "Section",
		itemPlural: "Sections",
		referencePrefix: "§",
	},
	{
		kind: "flat",
		slug: "consolation-to-helvia",
		collection: "consolation-to-helvia",
		title: "Consolation to Helvia",
		author: "Seneca",
		authorSlug: "seneca",
		itemLabel: "Section",
		itemPlural: "Sections",
		referencePrefix: "§",
	},
	{
		kind: "flat",
		slug: "consolation-to-marcia",
		collection: "consolation-to-marcia",
		title: "Consolation to Marcia",
		author: "Seneca",
		authorSlug: "seneca",
		itemLabel: "Section",
		itemPlural: "Sections",
		referencePrefix: "§",
	},
	{
		kind: "flat",
		slug: "consolation-to-polybius",
		collection: "consolation-to-polybius",
		title: "Consolation to Polybius",
		author: "Seneca",
		authorSlug: "seneca",
		itemLabel: "Section",
		itemPlural: "Sections",
		referencePrefix: "§",
	},
	{
		kind: "flat",
		slug: "lectures",
		collection: "lectures",
		title: "Lectures",
		author: "Musonius Rufus",
		authorSlug: "musonius",
		itemLabel: "Lecture",
		itemPlural: "Lectures",
		referencePrefix: "Lecture ",
		expectedCount: 21,
	},
	{
		kind: "flat",
		slug: "hierocles/elements-of-ethics",
		collection: "hierocles",
		title: "Elements of Ethics",
		author: "Hierocles",
		authorSlug: "hierocles",
		itemLabel: "Fragment",
		itemPlural: "Fragments",
		referencePrefix: "Fragment ",
	},
];

export const multiBookWorks: MultiBookWork[] = [
	{
		kind: "multi",
		slug: "discourses",
		collection: "discourses",
		title: "Discourses",
		author: "Epictetus",
		authorSlug: "epictetus",
		itemLabel: "Chapter",
		itemPlural: "Chapters",
		bookCount: 4,
	},
	{
		kind: "multi",
		slug: "on-anger",
		collection: "on-anger",
		title: "On Anger",
		author: "Seneca",
		authorSlug: "seneca",
		itemLabel: "Section",
		itemPlural: "Sections",
		bookCount: 3,
	},
	{
		kind: "multi",
		slug: "on-mercy",
		collection: "on-mercy",
		title: "On Mercy",
		author: "Seneca",
		authorSlug: "seneca",
		itemLabel: "Section",
		itemPlural: "Sections",
		bookCount: 2,
	},
	{
		kind: "multi",
		slug: "on-benefits",
		collection: "on-benefits",
		title: "On Benefits",
		author: "Seneca",
		authorSlug: "seneca",
		itemLabel: "Section",
		itemPlural: "Sections",
		bookCount: 7,
	},
];

export const works: Work[] = [...flatWorks, ...multiBookWorks];

export const authorPages: Array<{
	slug: AuthorSlug;
	name: string;
	lede: string;
}> = [
	{
		slug: "marcus",
		name: "Marcus Aurelius",
		lede: "Roman emperor and Stoic practitioner, writing private notes on attention, duty, mortality, and restraint.",
	},
	{
		slug: "epictetus",
		name: "Epictetus",
		lede: "Former slave and Stoic teacher whose surviving works focus on judgment, freedom, discipline, and what is ours to command.",
	},
	{
		slug: "seneca",
		name: "Seneca",
		lede: "Roman statesman and essayist, direct and psychologically sharp on time, anger, grief, friendship, wealth, and death.",
	},
	{
		slug: "musonius",
		name: "Musonius Rufus",
		lede: "Roman Stoic teacher concerned with daily practice, character, education, household life, and philosophical training.",
	},
	{
		slug: "hierocles",
		name: "Hierocles",
		lede: "Stoic philosopher best known for fragments on ethical development, self-perception, and widening circles of concern.",
	},
];

export function authorWorks(authorSlug: AuthorSlug): Array<{ title: string; href: string }> {
	const canonical = works
		.filter((work) => work.authorSlug === authorSlug)
		.map((work) => ({
			title: work.title,
			href: `/${work.slug}/`,
		}));

	if (authorSlug === "marcus") {
		return [{ title: "Meditations", href: "/book/1/" }];
	}

	return canonical;
}

export function sectionPath(work: Work, entry: CollectionEntry<CanonCollection>): string {
	if (work.kind === "flat") {
		return `/${work.slug}/${flatNumber(entry.data)}/`;
	}

	const data = multiBookData(entry.data);
	return `/${work.slug}/book-${data.book}/${data.chapter}/`;
}

export function bookPath(work: MultiBookWork, book: number): string {
	return `/${work.slug}/book-${book}/`;
}

export function referenceLabel(work: Work, data: CollectionEntry<CanonCollection>["data"]): string {
	if (work.kind === "flat") {
		return `${work.referencePrefix}${flatNumber(data)}`;
	}

	const passage = multiBookData(data);
	return `Book ${passage.book} · ${work.itemLabel} ${passage.chapter}`;
}

export function sortEntries<T extends CollectionEntry<CanonCollection>>(work: Work, entries: T[]): T[] {
	return entries.sort((a, b) => {
		if (work.kind === "flat") {
			return flatNumber(a.data) - flatNumber(b.data);
		}

		const left = multiBookData(a.data);
		const right = multiBookData(b.data);

		return left.book - right.book || left.chapter - right.chapter;
	});
}

export function workByCollection(collection: CanonCollection): Work {
	const work = works.find((candidate) => candidate.collection === collection);

	if (!work) {
		throw new Error(`Unknown collection: ${collection}`);
	}

	return work;
}

export function flatNumber(data: CollectionEntry<CanonCollection>["data"]): number {
	if ("section" in data) {
		return data.section;
	}

	if ("number" in data) {
		return data.number;
	}

	throw new Error("Expected a flat-numbered entry.");
}

export function multiBookData(data: CollectionEntry<CanonCollection>["data"]): {
	book: number;
	chapter: number;
} {
	if ("book" in data && "chapter" in data) {
		return {
			book: data.book,
			chapter: data.chapter,
		};
	}

	throw new Error("Expected a multi-book entry.");
}
