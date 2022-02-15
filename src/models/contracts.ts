import * as mongoose from 'mongoose';

export interface Contract extends mongoose.Types.Subdocument {
	expires: Date;
	wage: number;
	cooldown: number;
}

export const ContractSchema = new mongoose.Schema<Contract>(
	{
		expires: { type: mongoose.Schema.Types.Date, required: true },
		wage: { type: mongoose.Schema.Types.Number, required: true },
		cooldown: { type: mongoose.Schema.Types.Number, required: true },
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

export const ContractModel: mongoose.Model<Contract> = mongoose.model('Contract', ContractSchema);
