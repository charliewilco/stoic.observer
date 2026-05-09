// @ts-check

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * @typedef {object} Passage
 * @property {number} number
 * @property {string} [title]
 * @property {string} body
 */

/**
 * @typedef {object} WorkSlice
 * @property {string} slug
 * @property {string} title
 * @property {"flat" | "multi"} kind
 * @property {number} [bookCount]
 */

/**
 * @typedef {object} FlatSourceOptions
 * @property {string} sourceFile
 * @property {string} collection
 * @property {string} label
 * @property {"number" | "section"} frontmatterNumberKey
 * @property {string} [outputCollectionRoot]
 * @property {number} [expectedCount]
 * @property {number} [filePadding]
 * @property {boolean} [placeholderIfMissing]
 * @property {string} [placeholderTitle]
 */

/**
 * @typedef {object} Heading
 * @property {string} label
 * @property {number} index
 * @property {number} end
 */

const root = process.cwd();
const sourcesRoot = path.join(root, "scripts", "sources");
const contentRoot = path.join(root, "src", "content");

/** @type {WorkSlice[]} */
const senecaWorks = [
	{ slug: "on-providence", title: "On Providence", kind: "flat" },
	{
		slug: "on-the-firmness-of-the-wise-man",
		title: "On the Firmness of the Wise Man",
		kind: "flat",
	},
	{ slug: "on-anger", title: "On Anger", kind: "multi", bookCount: 3 },
	{ slug: "consolation-to-marcia", title: "Consolation to Marcia", kind: "flat" },
	{ slug: "on-the-happy-life", title: "On the Happy Life", kind: "flat" },
	{ slug: "on-leisure", title: "On Leisure", kind: "flat" },
	{ slug: "on-tranquility-of-mind", title: "On Tranquility of Mind", kind: "flat" },
	{ slug: "on-the-shortness-of-life", title: "On the Shortness of Life", kind: "flat" },
	{ slug: "consolation-to-polybius", title: "Consolation to Polybius", kind: "flat" },
	{ slug: "consolation-to-helvia", title: "Consolation to Helvia", kind: "flat" },
	{ slug: "on-benefits", title: "On Benefits", kind: "multi", bookCount: 7 },
	{ slug: "on-mercy", title: "On Mercy", kind: "multi", bookCount: 2 },
];

await mkdir(sourcesRoot, { recursive: true });

await parseMeditations();
await parseFlatSource({
	sourceFile: "enchiridion-long.txt",
	collection: "enchiridion",
	label: "Enchiridion",
	frontmatterNumberKey: "section",
	expectedCount: 53,
});
await parseDiscourses();
await parseFlatSource({
	sourceFile: "letters-gummere.txt",
	collection: "letters",
	label: "Letters",
	frontmatterNumberKey: "number",
	expectedCount: 124,
	filePadding: 3,
});
await parseSenecaEssays();
await parseFlatSource({
	sourceFile: "musonius-lectures.txt",
	collection: "lectures",
	label: "Musonius lectures",
	frontmatterNumberKey: "number",
	expectedCount: 21,
	placeholderIfMissing: true,
	placeholderTitle: "TODO: Lecture source needed",
});
await parseFlatSource({
	sourceFile: "hierocles-fragments.txt",
	collection: path.join("hierocles", "elements-of-ethics"),
	outputCollectionRoot: "hierocles",
	label: "Hierocles fragments",
	frontmatterNumberKey: "number",
	placeholderIfMissing: true,
	placeholderTitle: "TODO: Fragment source needed",
});

/** @returns {Promise<void>} */
async function parseMeditations() {
	const sourcePath = path.join(root, "scripts", "source.txt");
	const rawSource = await readOptional(sourcePath);

	if (!rawSource) {
		console.log("Skipped Meditations: scripts/source.txt is missing.");
		return;
	}

	const source = stripGutenbergMatter(rawSource);
	const books = splitMeditationsBooks(source);
	const outputRoot = path.join(contentRoot, "meditations");

	await resetDirectory(outputRoot);

	for (const [bookIndex, bookText] of books.entries()) {
		const book = bookIndex + 1;
		const sections = splitSequentialPassages(bookText, "section");
		const bookDirectory = path.join(outputRoot, `book-${pad(book)}`);

		await mkdir(bookDirectory, { recursive: true });

		for (const section of sections) {
			await writeMarkdown(
				path.join(bookDirectory, `section-${pad(section.number)}.md`),
				[`book: ${book}`, `section: ${section.number}`],
				section.body,
			);
		}
	}

	console.log(`Parsed Meditations: ${books.length} books.`);
}

/**
 * @param {FlatSourceOptions} options
 * @returns {Promise<void>}
 */
async function parseFlatSource(options) {
	const sourcePath = path.join(sourcesRoot, options.sourceFile);
	const rawSource = await readOptional(sourcePath);
	const outputRoot = path.join(contentRoot, options.outputCollectionRoot ?? options.collection);

	if (!rawSource) {
		if (options.placeholderIfMissing) {
			await writeFlatPlaceholders(options);
			return;
		}

		console.log(`Skipped ${options.label}: ${sourcePath} is missing.`);
		return;
	}

	const text = stripGutenbergMatter(rawSource);
	const passages = splitSequentialPassages(text, options.label, options.expectedCount);
	const directory = path.join(contentRoot, options.collection);

	await resetDirectory(outputRoot);
	await mkdir(directory, { recursive: true });

	for (const passage of passages) {
		const fileName = `${pad(passage.number, options.filePadding ?? 2)}.md`;
		const frontmatter = [`${options.frontmatterNumberKey}: ${passage.number}`];

		if (passage.title) {
			frontmatter.push(`title: ${JSON.stringify(passage.title)}`);
		}

		await writeMarkdown(path.join(directory, fileName), frontmatter, passage.body);
	}

	const expectation = options.expectedCount ? ` of expected ${options.expectedCount}` : "";
	console.log(`Parsed ${options.label}: ${passages.length}${expectation} passages.`);
}

/**
 * @param {FlatSourceOptions} options
 * @returns {Promise<void>}
 */
async function writeFlatPlaceholders(options) {
	const outputRoot = path.join(contentRoot, options.outputCollectionRoot ?? options.collection);
	const directory = path.join(contentRoot, options.collection);
	const count = options.expectedCount ?? 1;

	await resetDirectory(outputRoot);
	await mkdir(directory, { recursive: true });

	for (let number = 1; number <= count; number++) {
		await writeMarkdown(
			path.join(directory, `${pad(number, options.filePadding ?? 2)}.md`),
			[
				`${options.frontmatterNumberKey}: ${number}`,
				`title: ${JSON.stringify(options.placeholderTitle ?? "TODO: Source needed")}`,
			],
			"TODO: Add public-domain source text.",
		);
	}

	console.log(`Created ${count} placeholder passages for ${options.label}.`);
}

/** @returns {Promise<void>} */
async function parseDiscourses() {
	const rawSource = await readOptional(path.join(sourcesRoot, "discourses-long.txt"));

	if (!rawSource) {
		console.log("Skipped Discourses: scripts/sources/discourses-long.txt is missing.");
		return;
	}

	const text = stripGutenbergMatter(rawSource);
	const books = splitBookBlocks(text, 4);
	const outputRoot = path.join(contentRoot, "discourses");

	await resetDirectory(outputRoot);

	for (const book of books) {
		const chapters = splitSequentialPassages(book.body, `Discourses Book ${book.number}`);
		const bookDirectory = path.join(outputRoot, `book-${pad(book.number)}`);

		await mkdir(bookDirectory, { recursive: true });

		for (const chapter of chapters) {
			await writeMarkdown(
				path.join(bookDirectory, `${pad(chapter.number)}.md`),
				[
					`book: ${book.number}`,
					`chapter: ${chapter.number}`,
					...(chapter.title ? [`title: ${JSON.stringify(chapter.title)}`] : []),
				],
				chapter.body,
			);
		}
	}

	console.log(`Parsed Discourses: ${books.length} books.`);
}

/** @returns {Promise<void>} */
async function parseSenecaEssays() {
	const rawSource = await readOptional(path.join(sourcesRoot, "seneca-essays-stewart.txt"));

	if (!rawSource) {
		console.log("Skipped Seneca essays: scripts/sources/seneca-essays-stewart.txt is missing.");
		return;
	}

	const text = stripGutenbergMatter(rawSource);
	const slices = splitNamedWorks(text, senecaWorks);

	for (const work of senecaWorks) {
		const slice = slices.get(work.slug);

		if (!slice) {
			console.log(`Skipped ${work.title}: heading not found in Seneca source.`);
			continue;
		}

		const outputRoot = path.join(contentRoot, work.slug);
		await resetDirectory(outputRoot);

		if (work.kind === "flat") {
			const passages = splitSequentialPassages(slice, work.title);
			await mkdir(outputRoot, { recursive: true });

			for (const passage of passages) {
				await writeMarkdown(
					path.join(outputRoot, `${pad(passage.number)}.md`),
					[`number: ${passage.number}`, ...(passage.title ? [`title: ${JSON.stringify(passage.title)}`] : [])],
					passage.body,
				);
			}

			console.log(`Parsed ${work.title}: ${passages.length} passages.`);
		} else {
			const books = splitBookBlocks(slice, work.bookCount);

			for (const book of books) {
				const chapters = splitSequentialPassages(book.body, `${work.title} Book ${book.number}`);
				const bookDirectory = path.join(outputRoot, `book-${pad(book.number)}`);

				await mkdir(bookDirectory, { recursive: true });

				for (const chapter of chapters) {
					await writeMarkdown(
						path.join(bookDirectory, `${pad(chapter.number)}.md`),
						[
							`book: ${book.number}`,
							`chapter: ${chapter.number}`,
							...(chapter.title ? [`title: ${JSON.stringify(chapter.title)}`] : []),
						],
						chapter.body,
					);
				}
			}

			console.log(`Parsed ${work.title}: ${books.length} books.`);
		}
	}
}

/**
 * @param {string} filePath
 * @returns {Promise<string | undefined>}
 */
async function readOptional(filePath) {
	try {
		return await readFile(filePath, "utf8");
	} catch (error) {
		if (isNodeError(error) && error.code === "ENOENT") {
			return undefined;
		}

		throw error;
	}
}

/**
 * @param {unknown} error
 * @returns {error is NodeJS.ErrnoException}
 */
function isNodeError(error) {
	return error instanceof Error && "code" in error;
}

/**
 * @param {string} directory
 * @returns {Promise<void>}
 */
async function resetDirectory(directory) {
	await rm(directory, { force: true, recursive: true });
	await mkdir(directory, { recursive: true });
}

/**
 * @param {string} filePath
 * @param {string[]} frontmatter
 * @param {string} body
 * @returns {Promise<void>}
 */
async function writeMarkdown(filePath, frontmatter, body) {
	await mkdir(path.dirname(filePath), { recursive: true });
	await writeFile(filePath, ["---", ...frontmatter, "---", "", cleanupText(body), ""].join("\n"), "utf8");
}

/**
 * @param {string} text
 * @returns {string}
 */
function stripGutenbergMatter(text) {
	const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
	const startMarker = /^\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK .+ \*\*\*$/im;
	const endMarker = /^\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK .+ \*\*\*$/im;
	const startMatch = startMarker.exec(normalized);
	const endMatch = endMarker.exec(normalized);
	const start = startMatch ? startMatch.index + startMatch[0].length : 0;
	const end = endMatch ? endMatch.index : normalized.length;

	return normalized.slice(start, end).trim();
}

/**
 * @param {string} text
 * @returns {string[]}
 */
function splitMeditationsBooks(text) {
	const headings = /** @type {Array<Heading & { number: number }>} */ (
		findHeadings(text, /^\s*(?:THE\s+)?([A-Z]+)\s+BOOK\s*$/gim)
			.map((heading) => ({
				...heading,
				number: wordToNumber(heading.label),
			}))
			.filter((heading) => heading.number !== undefined)
	);
	const sequenceStart = findLastCompleteSequence(headings, 12);
	const sequence = headings.slice(sequenceStart, sequenceStart + 12);

	return sequence.map((heading, index) => {
		const next = sequence[index + 1];
		return text.slice(heading.end, next?.index ?? text.length).trim();
	});
}

/**
 * @param {string} text
 * @param {number} [expectedCount]
 * @returns {Array<{ number: number; body: string }>}
 */
function splitBookBlocks(text, expectedCount) {
	const headings = /** @type {Array<Heading & { number: number }>} */ (
		findHeadings(text, /^\s*(?:BOOK|LIBER)\s+([IVXLCDM]+|\d+|ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN)\.?\s*$/gim)
			.map((heading) => ({
				...heading,
				number: parseNumber(heading.label),
			}))
			.filter((heading) => heading.number !== undefined)
	);
	const sequenceStart = expectedCount ? findLastCompleteSequence(headings, expectedCount) : 0;
	const sequence = expectedCount ? headings.slice(sequenceStart, sequenceStart + expectedCount) : headings;

	return sequence.map((heading, index) => {
		const next = sequence[index + 1];
		return {
			number: heading.number,
			body: text.slice(heading.end, next?.index ?? text.length).trim(),
		};
	});
}

/**
 * @param {string} text
 * @param {string} label
 * @param {number} [expectedCount]
 * @returns {Passage[]}
 */
function splitSequentialPassages(text, label, expectedCount) {
	const allMarkers = findSequentialMarkers(text);
	let sequenceStart = 0;

	if (expectedCount && allMarkers.length >= expectedCount) {
		try {
			sequenceStart = findLastCompleteSequence(allMarkers, expectedCount);
		} catch {
			sequenceStart = 0;
		}
	}
	const markers = expectedCount ? allMarkers.slice(sequenceStart, sequenceStart + expectedCount) : allMarkers;

	if (markers.length === 0) {
		throw new Error(`Could not find numbered passages for ${label}.`);
	}

	return markers.map((marker, index) => {
		const next = markers[index + 1];
		const rawBody = text.slice(marker.end, next?.index ?? text.length).trim();
		const { title, body } = extractInlineTitle(rawBody);

		return {
			number: marker.number,
			title,
			body,
		};
	});
}

/**
 * @param {string} text
 * @returns {Array<{ number: number; index: number; end: number }>}
 */
function findSequentialMarkers(text) {
	const markerPattern = /^\s*(?:CHAPTER\s+)?([IVXLCDM]+|\d+)\.?\s+/gim;
	/** @type {Array<{ number: number; index: number; end: number }>} */
	const markers = [];
	/** @type {RegExpExecArray | null} */
	let match;

	while ((match = markerPattern.exec(text)) !== null) {
		const number = parseNumber(match[1]);

		if (number === markers.length + 1) {
			markers.push({
				number,
				index: match.index,
				end: markerPattern.lastIndex,
			});
		}
	}

	return markers;
}

/**
 * @param {string} text
 * @param {WorkSlice[]} works
 * @returns {Map<string, string>}
 */
function splitNamedWorks(text, works) {
	const headings = works.flatMap((work) => findTitleHeadings(text, work)).sort((a, b) => a.index - b.index);
	const slices = new Map();

	for (const [index, heading] of headings.entries()) {
		const next = headings[index + 1];
		slices.set(heading.work.slug, text.slice(heading.end, next?.index ?? text.length).trim());
	}

	return slices;
}

/**
 * @param {string} text
 * @param {WorkSlice} work
 * @returns {Array<{ work: WorkSlice; index: number; end: number }>}
 */
function findTitleHeadings(text, work) {
	const escapedTitle = work.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\ /g, "\\s+");
	const pattern = new RegExp(`^\\s*(?:${escapedTitle}|${escapedTitle.toUpperCase()})\\s*$`, "gim");
	/** @type {Array<{ work: WorkSlice; index: number; end: number }>} */
	const headings = [];
	/** @type {RegExpExecArray | null} */
	let match;

	while ((match = pattern.exec(text)) !== null) {
		headings.push({
			work,
			index: match.index,
			end: match.index + match[0].length,
		});
	}

	return headings;
}

/**
 * @param {string} text
 * @param {RegExp} pattern
 * @returns {Heading[]}
 */
function findHeadings(text, pattern) {
	/** @type {Heading[]} */
	const headings = [];
	/** @type {RegExpExecArray | null} */
	let match;

	while ((match = pattern.exec(text)) !== null) {
		headings.push({
			label: match[1],
			index: match.index,
			end: match.index + match[0].length,
		});
	}

	return headings;
}

/**
 * @param {Array<{ number: number }>} headings
 * @param {number} expectedCount
 * @returns {number}
 */
function findLastCompleteSequence(headings, expectedCount) {
	let sequenceStart = -1;

	for (let index = 0; index <= headings.length - expectedCount; index++) {
		const isComplete = headings
			.slice(index, index + expectedCount)
			.every((heading, offset) => heading.number === offset + 1);

		if (isComplete) {
			sequenceStart = index;
		}
	}

	if (sequenceStart === -1) {
		throw new Error(`Could not find a complete sequence of ${expectedCount} headings.`);
	}

	return sequenceStart;
}

/**
 * @param {string} text
 * @returns {{ title?: string; body: string }}
 */
function extractInlineTitle(text) {
	const [firstParagraph, ...rest] = text.split(/\n{2,}/);
	const trimmed = firstParagraph.trim();
	const looksLikeTitle = /^[A-Z0-9 ,;:'"!?()\-]+$/.test(trimmed) && trimmed.length <= 120 && rest.length > 0;

	if (!looksLikeTitle) {
		return { body: text };
	}

	return {
		title: cleanupText(trimmed),
		body: rest.join("\n\n"),
	};
}

/**
 * @param {string} text
 * @returns {string}
 */
function cleanupText(text) {
	return text
		.split(/\n{2,}/)
		.map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
		.filter(Boolean)
		.join("\n\n");
}

/**
 * @param {string} value
 * @returns {number | undefined}
 */
function parseNumber(value) {
	if (/^\d+$/.test(value)) {
		return Number(value);
	}

	return wordToNumber(value) ?? romanToInteger(value);
}

/**
 * @param {string} value
 * @returns {number | undefined}
 */
function wordToNumber(value) {
	const normalized = value.toUpperCase();
	const words = new Map([
		["FIRST", 1],
		["ONE", 1],
		["I", 1],
		["SECOND", 2],
		["TWO", 2],
		["II", 2],
		["THIRD", 3],
		["THREE", 3],
		["III", 3],
		["FOURTH", 4],
		["FOUR", 4],
		["IV", 4],
		["FIFTH", 5],
		["FIVE", 5],
		["V", 5],
		["SIXTH", 6],
		["SIX", 6],
		["VI", 6],
		["SEVENTH", 7],
		["SEVEN", 7],
		["VII", 7],
		["EIGHTH", 8],
		["EIGHT", 8],
		["VIII", 8],
		["NINTH", 9],
		["NINE", 9],
		["IX", 9],
		["TENTH", 10],
		["TEN", 10],
		["X", 10],
		["ELEVENTH", 11],
		["ELEVEN", 11],
		["XI", 11],
		["TWELFTH", 12],
		["TWELVE", 12],
		["XII", 12],
	]);

	return words.get(normalized);
}

/**
 * @param {string} value
 * @returns {number | undefined}
 */
function romanToInteger(value) {
	if (!/^[IVXLCDM]+$/i.test(value)) {
		return undefined;
	}

	const values = new Map([
		["I", 1],
		["V", 5],
		["X", 10],
		["L", 50],
		["C", 100],
		["D", 500],
		["M", 1000],
	]);
	const characters = value.toUpperCase().split("");
	let total = 0;

	for (let index = 0; index < characters.length; index++) {
		const current = values.get(characters[index]) ?? 0;
		const next = values.get(characters[index + 1]) ?? 0;
		total += current < next ? -current : current;
	}

	return total;
}

/**
 * @param {number} value
 * @param {number} [length]
 * @returns {string}
 */
function pad(value, length = 2) {
	return String(value).padStart(length, "0");
}
