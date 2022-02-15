import * as mongoose from 'mongoose';

export interface Command extends mongoose.Types.Subdocument {
	command: string;
	createdAt: Date;
}

export const CommandSchema = new mongoose.Schema<Command>(
	{
		command: { type: mongoose.Schema.Types.String, required: true },
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
		versionKey: false,
	}
);

export const CommandModel: mongoose.Model<Command> = mongoose.model('Command', CommandSchema);
