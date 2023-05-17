import { Emojis, ListingType } from '@economica/common';
import { datasource, Listing } from '@economica/db';
import { EmbedBuilder, MessageMentions } from 'discord.js';
import { z } from 'zod';
import { Command } from '../structures/commands';

const validator = z
	.object({
		name: z.string(),
		price: z.preprocess(
			(a) => Number(z.string().parse(a)),
			z.number().int().positive()
		),
		type: z.nativeEnum(ListingType),
		active: z.boolean(),
		treasuryRequired: z.preprocess(
			(a) => Number(z.string().default('0').parse(a)),
			z.number().int().nonnegative()
		),
		description: z.string().default('No description provided'),
		duration: z.preprocess(
			(a) => (a === undefined ? null : parseInt(z.string().parse(a))),
			z.number().int().positive().nullable()
		),
		stock: z.preprocess(
			(a) => (a === undefined ? null : parseInt(z.string().parse(a))),
			z.number().int().positive().nullable()
		),
		stackable: z.boolean().default(true),
		tradeable: z.boolean().default(true),
		itemsRequired: z
			.string()
			.optional()
			.superRefine(async (val, ctx) => {
				if (!val) return;
				for await (const listingId of val.split(',')) {
					const listing = await datasource
						.getRepository(Listing)
						.findOneBy({ id: listingId });
					if (!listing) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: `Could not find item with id ${listingId}`
						});
					}
				}
			})
			.transform((items) =>
				items?.length ? items.split(',').map((item) => ({ id: item })) : []
			),
		rolesRequired: z
			.string()
			.optional()
			.superRefine((val, ctx) => {
				if (!val) return;

				val.split(',').forEach((role) => {
					if (!MessageMentions.RolesPattern.test(role)) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: `Role ${role} is not a valid role.`
						});
					}
				});
			})
			.transform((roles) =>
				roles?.length
					? roles.split(',').map(
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							(role) => MessageMentions.RolesPattern.exec(role)!.groups!.id
					  )
					: []
			),
		rolesGranted: z
			.string()
			.optional()
			.superRefine((val, ctx) => {
				if (!val) return;

				val.split(',').forEach((role) => {
					if (!MessageMentions.RolesPattern.test(role)) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: `Role ${role} is not a valid role.`
						});
					}
				});
			})
			.transform((roles) =>
				roles?.length
					? roles.split(',').map(
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							(role) => MessageMentions.RolesPattern.exec(role)!.groups!.id
					  )
					: []
			),
		rolesRemoved: z
			.string()
			.optional()
			.superRefine((val, ctx) => {
				if (!val) return;

				val.split(',').forEach((role) => {
					if (!MessageMentions.RolesPattern.test(role)) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: `Role ${role} is not a valid role.`
						});
					}
				});
			})
			.transform((roles) =>
				roles?.length
					? roles.split(',').map(
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							(role) => MessageMentions.RolesPattern.exec(role)!.groups!.id
					  )
					: []
			),
		generatorPeriod: z.preprocess(
			(a) => (a === undefined ? null : parseInt(z.string().parse(a))),
			z.number().int().positive().nullable()
		),
		generatorAmount: z.preprocess(
			(a) => (a === undefined ? null : parseInt(z.string().parse(a))),
			z.number().int().positive().nullable()
		)
	})
	.refine(
		(data) =>
			data.type !== ListingType.GENERATOR ||
			(data.generatorAmount && data.generatorPeriod),
		{
			message:
				'Generators must have the generator_amount and generator_period properties satisfied.'
		}
	);

export const CreateItem = {
	identifier: /^create-item$/,
	type: 'chatInput',
	execute: async (interaction) => {
		const name = interaction.options.getString('name', true);
		const price = interaction.options.getString('price', true);
		const type = interaction.options.getString('type', true);
		const active = interaction.options.getBoolean('active', true);
		const treasuryRequired =
			interaction.options.getString('treasury_required') ?? undefined;
		const description =
			interaction.options.getString('description') ?? undefined;
		const duration = interaction.options.getString('duration') ?? undefined;
		const stock = interaction.options.getString('stock') ?? undefined;
		const stackable = interaction.options.getBoolean('stackable') ?? undefined;
		const tradeable = interaction.options.getBoolean('tradeable') ?? undefined;
		const itemsRequired =
			interaction.options.getString('items_required') ?? undefined;
		const rolesRequired =
			interaction.options.getString('roles_required') ?? undefined;
		const rolesRemoved =
			interaction.options.getString('roles_removed') ?? undefined;
		const rolesGranted =
			interaction.options.getString('roles_granted') ?? undefined;
		const generatorPeriod =
			interaction.options.getString('generator_period') ?? undefined;
		const generatorAmount =
			interaction.options.getString('generator_amount') ?? undefined;
		const result = await validator.parseAsync({
			name,
			price,
			type,
			active,
			treasuryRequired,
			description,
			duration,
			stock,
			stackable,
			tradeable,
			itemsRequired,
			rolesRequired,
			rolesGranted,
			rolesRemoved,
			generatorPeriod,
			generatorAmount
		});
		const listing = datasource.getRepository(Listing).create({
			guild: { id: interaction.guildId },
			...result
		});
		await datasource.getRepository(Listing).save(listing);
		const embed = new EmbedBuilder()
			.setTitle('Success')
			.setDescription(
				`${Emojis.ARTIFACT} **Listing \`${name}\` Created Successfully**`
			);
		await interaction.reply({ embeds: [embed] });
	}
} satisfies Command<'chatInput'>;
