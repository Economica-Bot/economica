import * as mongoose from 'mongoose';

export interface Command {
	guildId: string;
	userId: string;
	command: string;
	createdAt: Date;
}

const Schema = new mongoose.Schema<Command>(
	{
		guildId: { type: mongoose.Schema.Types.String, required: true },
		userId: { type: mongoose.Schema.Types.String, required: true },
		command: { type: mongoose.Schema.Types.String, required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const CommandModel: mongoose.Model<Command> = mongoose.model('Commands', Schema);
