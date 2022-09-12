import { Awaitable, codeBlock, Message, MessageComponentInteraction } from 'discord.js';

import { CommandError, Context } from '../structures';

export class VariableCollector<T> {
	property: string;

	prompt: string;

	parser: (msg: Message) => Awaitable<T>;

	validators: { func: (msg: Message) => Awaitable<boolean>, error: string }[] = [];

	skippable = false;

	setProperty(property: string) {
		this.property = property;
		return this;
	}

	setPrompt(prompt: string) {
		this.prompt = prompt;
		return this;
	}

	setParser(parser: typeof this.parser) {
		this.parser = parser;
		return this;
	}

	addValidator(func: typeof this.validators[0]['func'], error: typeof this.validators[0]['error']) {
		this.validators.push({ func, error });
		return this;
	}

	setSkippable(skippable = true) {
		this.skippable = skippable;
		return this;
	}

	execute = async (ctx: Context<MessageComponentInteraction<'cached'>>): Promise<T> => {
		await ctx.clientMemberEntity.reload();
		await ctx.clientUserEntity.reload();
		await ctx.memberEntity.reload();
		await ctx.userEntity.reload();

		const embed = ctx
			.embedify('info', 'user', this.prompt)
			.setAuthor({ name: `Specifying the ${this.property} property` })
			.setFooter({ text: `Enter "cancel" to cancel${this.skippable ? ', "skip" to skip' : ''}.` });
		const message = ctx.interaction.replied
			? await ctx.interaction.editReply({ embeds: [embed], components: [] })
			: await ctx.interaction.update({ embeds: [embed], components: [], fetchReply: true });
		const res = await message.channel.awaitMessages({ filter: (msg) => msg.author.id === ctx.interaction.user.id, max: 1 });
		const input = res.first();

		if (input.content === 'skip') return null;
		if (input.content === 'cancel') throw new CommandError('**Input Cancelled**');

		// eslint-disable-next-line no-restricted-syntax
		for await (const validator of this.validators) {
			const res = await validator.func(input);
			if (!res) {
				const embed = ctx
					.embedify('error', 'user', codeBlock(validator.error))
					.setFooter({ text: "Try again, or type 'cancel' to cancel input." });
				await ctx.interaction.followUp({ embeds: [embed], ephemeral: true });
				return this.execute(ctx);
			}
		}

		return this.parser(input);
	};
}
