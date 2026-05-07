import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const flatPassageSchema = z.object({
	number: z.number().int().min(1),
	title: z.string().optional()
});

const multiBookPassageSchema = z.object({
	book: z.number().int().min(1),
	chapter: z.number().int().min(1),
	title: z.string().optional()
});

const meditations = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/meditations" }),
	schema: z.object({
		book: z.number().int().min(1).max(12),
		section: z.number().int().min(1)
	})
});

const enchiridion = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/enchiridion" }),
	schema: z.object({
		section: z.number().int().min(1),
		title: z.string().optional()
	})
});

const discourses = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/discourses" }),
	schema: multiBookPassageSchema
});

const letters = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/letters" }),
	schema: flatPassageSchema
});

const onTheShortnessOfLife = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/on-the-shortness-of-life" }),
	schema: flatPassageSchema
});

const onAnger = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/on-anger" }),
	schema: multiBookPassageSchema
});

const onTranquilityOfMind = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/on-tranquility-of-mind" }),
	schema: flatPassageSchema
});

const onProvidence = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/on-providence" }),
	schema: flatPassageSchema
});

const onTheHappyLife = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/on-the-happy-life" }),
	schema: flatPassageSchema
});

const onLeisure = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/on-leisure" }),
	schema: flatPassageSchema
});

const onTheFirmnessOfTheWiseMan = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/on-the-firmness-of-the-wise-man" }),
	schema: flatPassageSchema
});

const consolationToHelvia = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/consolation-to-helvia" }),
	schema: flatPassageSchema
});

const consolationToMarcia = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/consolation-to-marcia" }),
	schema: flatPassageSchema
});

const consolationToPolybius = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/consolation-to-polybius" }),
	schema: flatPassageSchema
});

const onMercy = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/on-mercy" }),
	schema: multiBookPassageSchema
});

const onBenefits = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/on-benefits" }),
	schema: multiBookPassageSchema
});

const lectures = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/lectures" }),
	schema: flatPassageSchema
});

const hierocles = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/hierocles" }),
	schema: flatPassageSchema
});

export const collections = {
	meditations,
	enchiridion,
	discourses,
	letters,
	"on-the-shortness-of-life": onTheShortnessOfLife,
	"on-anger": onAnger,
	"on-tranquility-of-mind": onTranquilityOfMind,
	"on-providence": onProvidence,
	"on-the-happy-life": onTheHappyLife,
	"on-leisure": onLeisure,
	"on-the-firmness-of-the-wise-man": onTheFirmnessOfTheWiseMan,
	"consolation-to-helvia": consolationToHelvia,
	"consolation-to-marcia": consolationToMarcia,
	"consolation-to-polybius": consolationToPolybius,
	"on-mercy": onMercy,
	"on-benefits": onBenefits,
	lectures,
	hierocles
};
